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

## ✅ Validación normativa — tablas numéricas de `calc-engine`

Las 7 tablas/reglas numéricas de `calc-engine` que dependen de la NOM se compararon
línea por línea contra el texto oficial de `docs/referencias/NOM-001-SEDE-2018.pdf`
(extracción de texto directa — es un PDF nativo, no un escaneo, así que a diferencia
de `Uglys_compressed.pdf` sí produjo texto confiable). Revisión de César Flores,
ingeniero responsable del proyecto:

| Tabla en el código | Tabla en la NOM oficial | Resultado |
|---|---|---|
| `conductor::COPPER_CONDUCTORS` | Tabla 310-15(b)(16) | **1 error corregido** (3 AWG a 90 °C: 110→115 A) |
| `conductor::ambient_correction_factor` | Tabla 310-15(b)(2)(a) | Exacta |
| `conductor::adjustment_factor` | Tabla 310-15(b)(3)(a) | Exacta |
| `grounding::equipment_grounding_conductor_awg` | Tabla 250-122 | Exacta |
| `protection::motor_branch_protection_max_percent` | Tabla 430-52 | Exacta |
| `protection::STANDARD_DEVICE_SIZES` | Tabla 240-6(a) | Exacta |
| `conduit::max_fill_percent` | Tabla 1, Capítulo 10 | Exacta |

De más de 150 valores comparados, solo el de la ampacidad a 90 °C del calibre 3 AWG
estaba mal — ya corregido, con una prueba de regresión que lo fija
(`ampacity_3_awg_matches_nom_table_310_15_b_16`).

**`compliance-engine` también validado:** las 5 referencias normativas que genera
cada regla (`NormReference`) ya citan el artículo real de la NOM, con su notación
correcta (con guion, p. ej. "215-2", no "215.2(A)" como el NEC):

| Regla | Referencia NOM confirmada |
|---|---|
| Caída de tensión, alimentador | Art. 215-2(a), NOTA 1 |
| Caída de tensión, circuito derivado | Art. 210-19(a), NOTA 4 |
| Ampacidad de conductor | Tabla 310-15(b)(16) |
| Capacidad interruptiva | Art. 110-9 |
| Llenado de canalización | Tabla 1, Capítulo 10 |
| Resistencia de electrodo único | Art. 250-53(a)(2) |

**Pendiente todavía:** fórmulas generales de ingeniería que no provienen de una
tabla o artículo específico de la NOM (constantes K de caída de tensión, método por
unidad de cortocircuito, fórmula de Dwight para resistencia de electrodo) — son
formulaciones estándar de campo, no requieren validación normativa puntual, pero
conviene que las revises igual.

Ver el aviso detallado en `calc-engine/src/lib.rs`, `compliance-engine/src/lib.rs`, y
en la cabecera de cada módulo.

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
