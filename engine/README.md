# ElectraNOM — Motor de cálculo eléctrico (Rust)

Implementación inicial del motor de cálculo determinístico descrito en la
**Sección 5** de [`docs/PLAN_MAESTRO_PLATAFORMA_ELECTRICA.md`](../docs/PLAN_MAESTRO_PLATAFORMA_ELECTRICA.md).

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
  Cargo.toml           # workspace
  calc-engine/
    src/
      common.rs         # tipos compartidos (Phases)
      load.rs            # Módulos 4.1-4.3: carga instalada, demanda, factor de carga
      conductor.rs        # Módulos 4.4-4.6: corriente de diseño, ampacidad, correcciones, selección
      voltage_drop.rs      # Caída de tensión
      motor.rs              # Dimensionamiento de conductor para grupos de motores
      protection.rs           # Módulo 4.8: protecciones, capacidad interruptiva, coordinación básica
      lib.rs                    # punto de entrada, aviso de procedencia de datos
    tests/
      pipeline.rs                # prueba de integración: carga → demanda → conductor → protección → caída de tensión
```

## Correr las pruebas

```bash
cd engine
cargo test        # 34 pruebas unitarias + 1 de integración
cargo clippy --all-targets -- -D warnings
```

## ⚠️ Antes de usar en un proyecto real

Las tablas de ampacidad y factores de corrección (`conductor.rs`) son los valores
**estándar de la Tabla 310.16 / 310.15(B)(2)(a) / 310.15(C)(1) del NEC**, que la
NOM-001-SEDE-2018 y Ugly's Electrical Reference replican con la misma estructura.

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

## Qué falta (ver Secciones 5 y 11 del plan maestro)

Canalizaciones/llenado de ductos, transformadores, cortocircuito, puesta a tierra,
factor de potencia/capacitores. El siguiente módulo recomendado es **cortocircuito**
(Sección 5.7), porque hoy `protection::check_interrupting_capacity` recibe la
corriente de falla disponible como parámetro externo — nada en el motor la calcula
todavía.

**Nota sobre `protection::evaluate_basic_coordination`:** es una heurística de campo
(relación 2:1 entre protecciones en serie), no un análisis de curvas tiempo-corriente
con datos del fabricante. Documentado explícitamente en el código — no usar como
única base de una memoria de cálculo de coordinación de protecciones.
