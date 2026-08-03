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
| `select_conductor(required_amps, insulation_rating, ambient_c, current_carrying_conductors)` → JSON | Módulos 4.5–4.6 |
| `conductor_names()` → JSON | Lista de calibres de `COPPER_CONDUCTORS`, para poblar un selector de "calibre forzado" |
| `conductor_ampacity_by_name(name, insulation_rating, ambient_c, current_carrying_conductors)` → JSON | Igual que `select_conductor`, pero para un calibre elegido por el usuario (subir de calibre a propósito, p. ej. para bajar la caída de tensión) en vez del mínimo automático |
| `voltage_drop_percent(current_amps, one_way_length_m, conductor_name, three_phase, nominal_voltage)` | Caída de tensión |
| `evaluate_voltage_drop(circuit_name, is_feeder, voltage_drop_percent)` → JSON | Sección 6, regla de caída de tensión |
| `evaluate_conductor_ampacity(circuit_name, required_current_amps, corrected_ampacity_amps)` → JSON | Sección 6, regla de ampacidad |

## Pendiente

- Exponer el resto de `calc-engine` (protecciones, cortocircuito, tierra, factor de
  potencia) y de `compliance-engine` (las otras 3 reglas) con el mismo patrón.
- Contrato JSON diseñado (hoy es `format!` a mano) — considerar `serde`/`serde-wasm-bindgen`
  cuando el contrato deje de ser exploratorio.
- Build para `--target web` (navegador) además de `--target nodejs`.
- FFI para Swift (UniFFI) — no se aborda en este crate.
