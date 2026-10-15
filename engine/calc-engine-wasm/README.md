# calc-engine-wasm

Bindings de WebAssembly para `calc-engine` y `compliance-engine`. Prueba de que la
premisa arquitectónica de la Sección 3.3 del plan maestro ("un único núcleo Rust
reutilizado en Web") funciona de verdad — no solo en `cargo test`, sino compilado a
WASM, ejecutado desde JavaScript, y consumido por un backend real
(`backend/projects-service`).

**No es la API definitiva del producto.** Expone un subconjunto curado de funciones
(corriente de diseño, selección de conductor, caída de tensión, reglas de
cumplimiento de caída de tensión y ampacidad) suficiente para demostrar el pipeline
completo desde JS. El contrato JSON real para el servicio de proyectos (Sección 3.3)
debe diseñarse aparte.

## Por qué un crate separado

`calc-engine` y `compliance-engine` no tienen ninguna dependencia de `wasm-bindgen`.
Todo el acoplamiento a WASM/JS vive en este tercer crate, para que los dos motores
sigan siendo reutilizables tal cual en el backend nativo y en los futuros bindings de
Swift (FFI/UniFFI) sin arrastrar dependencias de JavaScript.

## Compilar y generar los bindings

```bash
# Una sola vez: target de compilación + CLI que genera el JS (misma versión que la
# dependencia wasm-bindgen del Cargo.toml, hoy 0.2.126).
rustup target add wasm32-unknown-unknown
cargo install wasm-bindgen-cli --version 0.2.126

# Compilar a WASM
cargo build -p calc_engine_wasm --target wasm32-unknown-unknown --release

# Generar los bindings de JS (target nodejs; para uso en navegador usar --target web)
wasm-bindgen --target nodejs --out-dir calc-engine-wasm/pkg \
  target/wasm32-unknown-unknown/release/calc_engine_wasm.wasm

# El wasm-bindgen CLI (a diferencia de wasm-pack) NO genera package.json -- sin él,
# Node no puede resolver `require("calc_engine_wasm")` desde otro paquete (como
# backend/projects-service). Copiar la plantilla trackeada en git:
cp calc-engine-wasm/pkg-package.json calc-engine-wasm/pkg/package.json
```

`pkg/` es un artefacto generado — no está commiteado (ver `.gitignore`), se
regenera con los comandos de arriba. `pkg-package.json` (fuera de `pkg/`) sí está
commiteado porque es la única parte de ese directorio que no se puede regenerar
desde el `.wasm` compilado.

## Probar desde Node

```bash
cd engine/calc-engine-wasm
node test/pipeline.test.mjs
```

Reproduce el mismo escenario que `engine/calc-engine/tests/pipeline.rs` (Rust puro)
y verifica que el WASM da resultados idénticos — incluyendo los hallazgos de
`compliance-engine` para caída de tensión y ampacidad de conductor.

Para una prueba de más alto nivel (el WASM detrás de una API REST real con
persistencia), ver `backend/projects-service/test/e2e.test.ts`.

## Funciones expuestas

| Función JS | Cubre |
|---|---|
| `design_current_amps(power_va, voltage, three_phase)` | Módulo 4.4 |
| `continuous_load_adjusted_current(design_current, is_continuous)` | 125% de carga continua |
| `select_conductor(required_amps, material, insulation_rating, ambient_c, current_carrying_conductors)` → JSON | Módulos 4.5–4.6. `material` es `"copper"` o `"aluminum"` |
| `conductor_names(material)` → JSON | Lista de calibres de `COPPER_CONDUCTORS`/`ALUMINUM_CONDUCTORS` según `material`, para poblar un selector de "calibre forzado" |
| `conductor_ampacity_by_name(name, material, insulation_rating, ambient_c, current_carrying_conductors)` → JSON | Igual que `select_conductor`, pero para un calibre elegido por el usuario (subir de calibre a propósito, p. ej. para bajar la caída de tensión) en vez del mínimo automático |
| `voltage_drop_percent(current_amps, one_way_length_m, conductor_name, material, three_phase, nominal_voltage)` | Caída de tensión. `material` decide la constante K (cobre 12.9, aluminio 21.2 Ω·cmil/ft) |
| `evaluate_voltage_drop(circuit_name, is_feeder, voltage_drop_percent)` → JSON | Sección 6, regla de caída de tensión |
| `evaluate_conductor_ampacity(circuit_name, required_current_amps, corrected_ampacity_amps)` → JSON | Sección 6, regla de ampacidad |
| `conduit_types()` → JSON | Catálogo de tipos de tubería soportados (`emt`, `pvc_sch40`, `rmc`), para poblar un selector |
| `select_conduit(conductor_name, family, conductor_count, conduit_type)` → JSON | Módulo 4.7: tamaño comercial de tubería más económico que cumple el % de relleno, para conductores todos del mismo calibre. `family` (área del conductor aislado) es `"thhn"`, `"thw"` o `"xhhw"` |
| `conductor_area_mm2(conductor_name, family)` | Área transversal (mm²) de un conductor aislado -- para sumar áreas de calibres distintos (fases/neutro vs. tierra) antes de `select_conduit_by_area` |
| `estimate_protection_amps(corrected_ampacity_amps)` | Protección automática de circuito general: redondea la ampacidad corregida al siguiente tamaño estándar de dispositivo (Art. 240-4(d), Tabla 240-6(a)). También es el máximo permitido si se fuerza un tamaño mayor, y alimenta `grounding_conductor_awg` |
| `protection_sizes()` → JSON | Catálogo de tamaños comerciales estándar de protección (Tabla 240-6(a)), para poblar un selector de "protección forzada" |
| `evaluate_conductor_protection(circuit_name, protection_amps, conductor_ampacity_amps, max_allowed_amps)` → JSON | Sección 6, regla de protección de circuito general (no debe exceder la ampacidad del conductor) |
| `grounding_conductor_awg(protection_amps)` | Calibre del conductor de puesta a tierra de equipos (Tabla 250-122) |
| `select_conduit_by_area(required_area_mm2, conductor_count, conduit_type)` → JSON | Igual que `select_conduit`, para un área total ya sumada a mano (tubería con calibres mixtos) |
| `evaluate_conduit_fill(conduit_label, total_conductor_area_mm2, usable_area_mm2)` → JSON | Sección 6, regla de llenado de canalización (áreas en mm²) |
| `motor_hp_labels(voltage, three_phase)` → JSON | Catálogo de hp con FLC de tabla disponible para esa tensión/fases, para poblar un selector |
| `motor_protection_kinds()` → JSON | Catálogo de tipos de dispositivo de protección de motor (`inverse_time_breaker`, `time_delay_fuse`, `non_time_delay_fuse`) |
| `motor_flc_amps(hp_label, voltage, three_phase)` | Corriente a plena carga de motor, de Tabla 430-248/430-250 (no de placa) |
| `motor_conductor_ampacity(flc_amps)` | Ampacidad mínima del conductor del circuito derivado de motor: 125% de la FLC (Art. 430-22) |
| `motor_protection_amps(flc_amps, kind)` | Tamaño de protección de circuito derivado de motor (Tabla 430-52) |
| `evaluate_motor_protection(circuit_name, protection_amps, motor_flc_amps, max_allowed_amps)` → JSON | Sección 6, regla de protección de circuito derivado de motor |

## Pendiente

- Exponer el resto de `calc-engine` (cortocircuito, tierra, factor de potencia,
  grupos de motores en un mismo alimentador vía `motor_group_conductor_ampacity`)
  con el mismo patrón.
- Contrato JSON diseñado (hoy es `format!` a mano) — considerar `serde`/`serde-wasm-bindgen`
  cuando el contrato deje de ser exploratorio.
- Build para `--target web` (navegador) además de `--target nodejs`.
- FFI para Swift (UniFFI) — no se aborda en este crate.
