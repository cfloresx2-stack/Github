# ElectraNOM — Motor de cálculo eléctrico (Rust)

Motor de cálculo determinístico descrito en la **Sección 5** de
[`docs/PLAN_MAESTRO_PLATAFORMA_ELECTRICA.md`](../docs/PLAN_MAESTRO_PLATAFORMA_ELECTRICA.md).
Cubre el alcance crítico del MVP (Sección 10.2): carga → demanda → conductor →
protección → cortocircuito → puesta a tierra → caída de tensión, más llenado de
ductos y factor de potencia.

## Por qué Rust

Un único crate se reutiliza en las tres plataformas del producto (Sección 3.3 del
plan maestro):

1. **Backend** — como servicio nativo (`calc-engine-service`).
2. **Web** — compilado a WebAssembly.
3. **iPhone/iPad/Mac** — enlazado como librería nativa vía FFI (UniFFI/swift-bridge).

Esto garantiza que el mismo cálculo determinístico corre en todas las plataformas y
habilita cálculo **offline en iPad** sin depender de conectividad.

## Estructura

```
engine/
  Cargo.toml              # workspace
  calc-engine/
    src/
      common.rs            # tipos compartidos (Phases)
      load.rs               # Módulos 4.1-4.3: carga instalada, demanda, factor de carga
      conductor.rs           # Módulos 4.4-4.6: corriente de diseño, ampacidad, correcciones, selección
      voltage_drop.rs         # Caída de tensión
      motor.rs                 # Dimensionamiento de conductor para grupos de motores
      protection.rs             # Módulo 4.8: protecciones, capacidad interruptiva, coordinación básica
      short_circuit.rs           # Sección 5.7: cortocircuito trifásico por método por unidad (sistema radial)
      grounding.rs                # Sección 5.8 / Módulo 4.11: tierra de equipos, resistencia de electrodo
      conduit.rs                   # Módulo 4.7: regla de % de llenado de canalizaciones
      power_factor.rs                # Módulos 4.13-4.14: corrección de factor de potencia / capacitores
      lib.rs                          # punto de entrada, aviso de procedencia de datos
    tests/
      pipeline.rs                      # integración: carga → demanda → conductor → protección → cortocircuito → tierra → caída de tensión
```

## Correr las pruebas

```bash
cd engine
cargo test                          # 52 pruebas unitarias + 2 de integración
cargo clippy --all-targets -- -D warnings
cargo fmt --check
```

## ⚠️ Antes de usar en un proyecto real

Las tablas de ampacidad y factores de corrección (`conductor.rs`) y el calibre de
tierra de equipos (`grounding.rs`) son los valores **estándar de la Tabla 310.16 /
310.15(B)(2)(a) / 310.15(C)(1) / 250.122 del NEC**, que la NOM-001-SEDE-2018 y Ugly's
Electrical Reference replican con la misma estructura.

Se intentó extraer las tablas directamente de `docs/referencias/NOM-001-SEDE-2018.pdf`
(1,171 páginas) y de `docs/referencias/Uglys_compressed.pdf`, pero la extracción
automática de texto produce columnas numéricas desalineadas (problema del escaneo
original, no de la herramienta) — no es seguro tomar esos números tal cual. Las cifras
usadas aquí provienen de la tabla estándar NEC/NOM ampliamente conocida, **no de un
parseo automático de esos PDF**.

**Antes de usar este motor en un proyecto real, valida cada tabla línea por línea
contra el PDF oficial de la NOM-001-SEDE-2018.** Esto es exactamente el trabajo de
validación normativa que el plan maestro asigna al ingeniero responsable (Sección
16.5: banco de casos de prueba + revisión técnica humana obligatoria antes de cada
release).

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
- Canalizaciones detalladas por catálogo de fabricante, transformadores (selección
  automática, más allá de recibir kVA/%Z como dato), diagramas unifilares/trifilares,
  memoria de cálculo, BOM — capa de servicios (Sección 3.3), no de este motor.

Cada uno de estos límites está también documentado en el módulo correspondiente.
