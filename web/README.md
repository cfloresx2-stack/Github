# web

Calculadora interactiva de ElectraNOM: un solo archivo HTML autocontenido que
corre el motor de cálculo real (`calc-engine` + `compliance-engine`, Rust,
compilado a WebAssembly) directamente en el navegador, sin servidor. Es la
prueba en vivo de la premisa arquitectónica de la Sección 3.3 del plan
maestro ("un único núcleo Rust reutilizado en Web").

No es el producto final (ver el plan maestro para la app real) — es un banco
de pruebas para validar el motor contra memorias de cálculo reales antes de
invertir en la aplicación completa (Sección 3.3, backend + apps nativas).

## Qué calcula

Por cada alimentador, circuito derivado o circuito de motor: carga y demanda
(o corriente a plena carga de tabla, Art. 430, para motores), corriente de
diseño y requerida, selección de conductor (cobre/aluminio, con opción de
forzar un calibre mayor), caída de tensión, protección (automática o forzada
a un tamaño comercial, con la regla especial de motor por Tabla 430-52),
calibre de tierra (Tabla 250-122) y tamaño de tubería (EMT/PVC Cédula
40/RMC). Junta todos los circuitos que agregues en una sola memoria de
cálculo imprimible, agrupada por tablero.

## Generar y publicar

```bash
# 1. Compilar el motor a WASM (target web) si no está hecho o cambió el motor:
cd engine
cargo build -p calc_engine_wasm --target wasm32-unknown-unknown --release
wasm-bindgen --target web --out-dir calc-engine-wasm/pkg-web \
  target/wasm32-unknown-unknown/release/calc_engine_wasm.wasm
cd ..

# 2. Generar el HTML autocontenido:
python3 web/build_artifact.py
# -> web/dist/electranom-demo.html (no se commitea, se regenera de esta fuente)
```

Luego publicar `web/dist/electranom-demo.html` con la herramienta Artifact.
Para actualizar el artifact publicado ya existente (mismo enlace), volver a
publicar el mismo `file_path` pasando la `url` del artifact original.

## Antes de publicar: probar localmente

`web/dist/electranom-demo.html` se puede abrir directo en un navegador
(`file://`) para probarlo sin publicar nada. El patrón usado en este proyecto
es automatizar esa prueba con Playwright (WASM carga, calcular un circuito,
agregarlo, generar el reporte, revisar que no haya errores de consola) antes
de cada publicación — evita publicar una regresión. Los scripts de prueba en
sí no están commiteados (viven en el scratchpad de la sesión que los
escribió); rehacerlos es rápido siguiendo ese patrón.

## Por qué un solo archivo, sin build step de JS

La calculadora es deliberadamente un único HTML con el WASM embebido en
base64 (sin bundler, sin dependencias npm) para que se pueda publicar tal
cual como Claude Artifact -- el Artifact tool aloja HTML/Markdown estático,
no corre un build. `build_artifact.py` (Python, sin dependencias) arma ese
archivo insertando el `.wasm` compilado y el JS "glue" de `wasm-bindgen`
(target `web`) en una plantilla de HTML/CSS/JS escrita a mano.
