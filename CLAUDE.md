# ElectraNOM — contexto para Claude Code

## Quién usa esto

El usuario de este proyecto (César Flores, Esco del Noroeste S.C.) es un
**ingeniero electricista que diseña instalaciones eléctricas reales**, no
programador. Todo lo que se le explica debe ser en términos de ingeniería
eléctrica y de la NOM-001-SEDE-2018 (corriente, calibre, caída de tensión,
tubería, protección, artículos de la norma) — no en términos de código,
salvo que él pregunte específicamente por eso. Instrucciones deben ser
precisas y accionables ("abre este enlace y haz clic aquí"), no asumir
familiaridad con Git, terminal, ni conceptos de programación.

El software es una herramienta de apoyo de cálculo, no reemplaza su firma y
revisión profesional — eso ya está declarado explícitamente en el disclaimer
de cada memoria de cálculo generada; mantenerlo así.

## Qué es este repo

Plataforma para diseño, cálculo, validación y documentación de instalaciones
eléctricas conforme a la NOM-001-SEDE-2018. Ver
[`docs/PLAN_MAESTRO_PLATAFORMA_ELECTRICA.md`](docs/PLAN_MAESTRO_PLATAFORMA_ELECTRICA.md)
para la visión completa; `README.md` para el mapa de carpetas.

Núcleo real ya construido y validado: motor de cálculo (`engine/calc-engine`)
+ motor normativo (`engine/compliance-engine`), en Rust, con sus tablas
verificadas línea por línea contra el PDF oficial de la NOM (no adivinadas de
memoria — ver los comentarios de cabecera de cada módulo para qué tabla
valida qué). Compilado a WebAssembly y demostrado funcionando en dos
contextos distintos: un backend real (`backend/projects-service`) y una
calculadora interactiva de un solo archivo (`web/`, publicada como Claude
Artifact) — prueba viva de que "un único núcleo Rust reutilizado en Web"
(Sección 3.3 del plan maestro) funciona de verdad.

## Flujo de trabajo establecido para cambiar el motor

Cuando se modifica `calc-engine`/`compliance-engine`/`calc-engine-wasm`:

1. Cambiar el Rust, correr `cargo test --workspace` en `engine/`.
2. Regenerar ambos targets de `wasm-bindgen` (`nodejs` para `pkg/`, `web`
   para `pkg-web/`) — ver `engine/calc-engine-wasm/README.md`.
3. Correr `node test/pipeline.test.mjs` en `calc-engine-wasm/` para verificar
   que el WASM da los mismos resultados que Rust puro.
4. Regenerar la calculadora (`python3 web/build_artifact.py`) y probarla con
   Playwright localmente (`file://` sobre `web/dist/electranom-demo.html`,
   sin publicar) antes de republicar el Artifact — ya se encontraron bugs
   reales así (init de WASM, estado de UI) que no aparecían solo con
   `cargo test`.
5. Publicar con la herramienta Artifact usando la misma `url` del Artifact
   ya existente, para no perder el enlace que el usuario ya tiene guardado.
6. Comitear y subir los cambios de Rust a la rama de trabajo (el HTML
   generado en `web/dist/` NO se commitea, está en `.gitignore` — se
   regenera del script).

## Validación contra documentos reales

Cuando el usuario comparte una memoria de cálculo real (PDF/DOCX de un
proyecto suyo), es la mejor fuente de verdad para encontrar huecos —ya pasó
una vez que reveló que una regla automática (trifásico nunca lleva neutro)
estaba mal. Extraer el texto (`pypdf`/`python-docx`), cruzar los números con
el motor vía Node (`calc-engine-wasm/pkg`), y ser honesto sobre qué SÍ
coincide, qué NO es comparable (alcance distinto) y qué reveló un error a
corregir — no forzar una comparación que no aplica.
