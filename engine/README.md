# ElectraNOM — Motor de cálculo y motor normativo (Rust)

Tres crates que implementan las Secciones 5 y 6 del plan maestro:
[`docs/PLAN_MAESTRO_PLATAFORMA_ELECTRICA.md`](../docs/PLAN_MAESTRO_PLATAFORMA_ELECTRICA.md).

- **`calc-engine`** — motor de cálculo determinístico. Cubre el alcance crítico del
  MVP (Sección 10.2): carga → demanda → conductor → protección → cortocircuito →
  puesta a tierra → caída de tensión, más llenado de ductos y factor de potencia.
- **`compliance-engine`** — motor normativo (Sección 6): evalúa resultados de cálculo
  contra reglas y produce hallazgos (`Cumple` / `Advertencia` / `NoCumple` /
  `NoEvaluable`) con evidencia y referencia normativa.
- **`calc-engine-wasm`** — bindings de WebAssembly de ambos motores, probados desde
  Node.js. Ver [`calc-engine-wasm/README.md`](calc-engine-wasm/README.md).

## Por qué Rust

Un único crate (`calc-engine`) se reutiliza en las tres plataformas del producto
(Sección 3.3 del plan maestro):

1. **Backend** — como servicio nativo (`calc-engine-service`).
2. **Web** — compilado a WebAssembly. **Ya verificado end-to-end** (`calc-engine-wasm`
   compila a `wasm32-unknown-unknown` y reproduce desde Node.js los mismos resultados
   que `cargo test`, incluyendo el motor normativo).
3. **iPhone/iPad/Mac** — enlazado como librería nativa vía FFI (UniFFI/swift-bridge).
   **Aún no implementado** — requiere Xcode/macOS para compilar y probar el lado
   Swift, no disponible en este entorno.

Esto garantiza que el mismo cálculo determinístico corre en todas las plataformas y
habilita cálculo **offline en iPad** sin depender de conectividad.

## Por qué dos crates separados

`compliance-engine` **no depende de `calc-engine` como tipo** — recibe resultados ya
calculados como parámetros simples (f64, bool, &str). Esto refleja la arquitectura
real de servicios del plan maestro (Sección 3.1: `calc-engine-service` y
`compliance-engine-service` son servicios separados) y mantiene el desacoplo entre
"cómo se calculó" y "qué dice la norma sobre el resultado" — el mismo principio que
`calc_engine::load` ya aplica para los factores de demanda. Solo la prueba de
integración (`compliance-engine/tests/with_calc_engine.rs`) usa ambos crates juntos,
como lo haría el llamador real.

## Estructura

```
engine/
  Cargo.toml                  # workspace
  calc-engine/
    src/
      common.rs                # tipos compartidos (Phases)
      load.rs                   # Módulos 4.1-4.3: carga instalada, demanda, factor de carga
      conductor.rs               # Módulos 4.4-4.6: corriente de diseño, ampacidad, correcciones, selección
      voltage_drop.rs             # Caída de tensión
      motor.rs                     # Dimensionamiento de conductor para grupos de motores
      protection.rs                 # Módulo 4.8: protecciones, capacidad interruptiva, coordinación básica
      short_circuit.rs               # Sección 5.7: cortocircuito trifásico por método por unidad (sistema radial)
      grounding.rs                    # Sección 5.8 / Módulo 4.11: tierra de equipos, resistencia de electrodo
      conduit.rs                       # Módulo 4.7: regla de % de llenado de canalizaciones
      power_factor.rs                   # Módulos 4.13-4.14: corrección de factor de potencia / capacitores
      lib.rs                              # punto de entrada, aviso de procedencia de datos
    tests/pipeline.rs                      # integración: carga → demanda → conductor → protección → cortocircuito → tierra → caída de tensión
  compliance-engine/
    src/
      types.rs                             # ComplianceStatus, NormReference, ComplianceFinding
      voltage_drop.rs, conductor.rs, protection.rs, conduit.rs, grounding.rs  # 5 reglas
      lib.rs                                # punto de entrada, aviso de estado de referencias normativas
    tests/with_calc_engine.rs                # integración con calc-engine (dev-dependency)
  calc-engine-wasm/
    src/lib.rs                                # bindings #[wasm_bindgen] de ambos motores
    test/pipeline.test.mjs                    # prueba manual desde Node.js (ver su README)
    pkg/                                      # generado por wasm-bindgen, no commiteado
```

## Correr las pruebas

```bash
cd engine
cargo test --workspace              # 64 pruebas unitarias + 4 de integración
cargo clippy --workspace --all-targets -- -D warnings
cargo clippy -p calc_engine_wasm --target wasm32-unknown-unknown -- -D warnings
cargo fmt --check
```

Para compilar y probar el WASM, ver [`calc-engine-wasm/README.md`](calc-engine-wasm/README.md).

## ⚠️ Antes de usar en un proyecto real

**`calc-engine`:** las tablas de ampacidad y factores de corrección (`conductor.rs`)
y el calibre de tierra de equipos (`grounding.rs`) son los valores **estándar de la
Tabla 310.16 / 310.15(B)(2)(a) / 310.15(C)(1) / 250.122 del NEC**, que la
NOM-001-SEDE-2018 y Ugly's Electrical Reference replican con la misma estructura.

**`compliance-engine`:** cada `NormReference` generado está marcado **"(equiv.)"**
porque el código de artículo proviene del NEC análogo, no de la NOM-001-SEDE-2018
verificada.

En ambos casos: se intentó extraer las tablas/artículos directamente de
`docs/referencias/NOM-001-SEDE-2018.pdf` (1,171 páginas) y de
`docs/referencias/Uglys_compressed.pdf`, pero la extracción automática de texto
produce columnas numéricas desalineadas (problema del escaneo original, no de la
herramienta) — no es seguro tomar esos números/artículos tal cual. Las cifras usadas
aquí provienen de la tabla estándar NEC/NOM ampliamente conocida, **no de un parseo
automático de esos PDF**.

**Antes de usar estos motores en un proyecto real, valida cada tabla y cada
referencia de artículo línea por línea contra el PDF oficial de la
NOM-001-SEDE-2018.** Esto es exactamente el trabajo de validación normativa que el
plan maestro asigna al ingeniero responsable (Sección 16.5: banco de casos de prueba
+ revisión técnica humana obligatoria antes de cada release).

## Qué queda fuera de esta versión (a propósito, no como pendiente silencioso)

- **`conduit.rs`** implementa la regla de % de llenado, pero **no** las tablas de área
  de conductor por tipo de aislamiento ni de área interna por tipo/calibre de
  canalización (decenas de filas por tabla, alto riesgo de un valor incorrecto de
  memoria) — deben tomarse de la tabla oficial y pasarse como parámetro.
- **`grounding.rs`** no resuelve arreglos de electrodos múltiples ni mallas de tierra
  (requieren fórmulas de resistencia mutua, IEEE Std 80/142).
- **`short_circuit.rs`** solo resuelve **sistemas radiales de una sola fuente** (fuente
  → transformador → alimentador) y solo **magnitud de falla trifásica simétrica** — no
  redes en malla, no falla línea-tierra.
- **`protection::evaluate_basic_coordination`** es una heurística de campo (relación
  2:1 entre protecciones en serie), no un análisis de curvas tiempo-corriente con
  datos del fabricante.
- **`compliance-engine`** implementa solo 5 reglas cuantitativas de un catálogo que en
  la versión completa (Sección 6) tendría decenas — y las reglas están compiladas en
  código, no en un catálogo versionado editable sin recompilar (Sección 6.7).
- Canalizaciones detalladas por catálogo de fabricante, transformadores (selección
  automática, más allá de recibir kVA/%Z como dato), diagramas unifilares/trifilares,
  memoria de cálculo, BOM, asistente de IA (Sección 7) — capa de servicios (Sección
  3.3) o módulos aún no iniciados, no de estos dos motores.

Cada uno de estos límites está también documentado en el módulo correspondiente.
