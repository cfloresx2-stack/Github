# ElectraNOM

Plataforma para diseño, cálculo, validación y documentación de instalaciones
eléctricas industriales conforme a la NOM-001-SEDE-2018. iPhone · iPad · Mac · Web.

## Contenido

- [`docs/PLAN_MAESTRO_PLATAFORMA_ELECTRICA.md`](docs/PLAN_MAESTRO_PLATAFORMA_ELECTRICA.md): plan maestro completo del proyecto — mercado, arquitectura, motor de cálculo, motor normativo NOM-001-SEDE, IA, UX, modelo de negocio, roadmap y especificación técnica para desarrollo.
- [`engine/`](engine/): motor de cálculo eléctrico (`calc-engine`), motor normativo (`compliance-engine`) y bindings de WebAssembly (`calc-engine-wasm`) en Rust. Ver [`engine/README.md`](engine/README.md).
- [`web/`](web/): calculadora interactiva del motor (un solo HTML autocontenido, publicable como Claude Artifact) — banco de pruebas en vivo contra memorias de cálculo reales. Ver [`web/README.md`](web/README.md).
- [`backend/projects-service/`](backend/projects-service/): prueba de concepto local de API REST (NestJS + SQLite) sobre el motor. Ver [`backend/projects-service/README.md`](backend/projects-service/README.md).
- [`docs/referencias/`](docs/referencias/): NOM-001-SEDE-2018 y Ugly's Electrical Reference (fuentes normativas).
