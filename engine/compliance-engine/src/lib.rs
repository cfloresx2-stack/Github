//! # compliance-engine
//!
//! Motor normativo determinístico de **ElectraNOM** (Sección 6 del plan maestro:
//! `docs/PLAN_MAESTRO_PLATAFORMA_ELECTRICA.md`).
//!
//! Recibe resultados **ya calculados** (por `calc-engine` o cualquier otra fuente)
//! como parámetros simples — deliberadamente **no depende del crate `calc-engine`
//! como tipo**, para mantener el desacoplo entre "cómo se calculó" y "qué dice la
//! norma sobre el resultado" (mismo principio de desacoplo que documenta
//! `calc_engine::load` para los factores de demanda). La prueba de integración en
//! `tests/with_calc_engine.rs` sí usa ambos crates juntos, como lo haría el llamador
//! real (un servicio de proyectos).
//!
//! ## Alcance implementado
//! Reglas cuantitativas sobre 5 resultados que produce `calc-engine`:
//! - Caída de tensión (módulo [`voltage_drop`]) — clasificada como `Advertencia`
//!   (recomendación), no `NoCumple`, ver aviso en ese módulo.
//! - Ampacidad de conductor (módulo [`conductor`]) — obligatoria, `NoCumple` si falla.
//! - Capacidad interruptiva de protección (módulo [`protection`]) — obligatoria.
//! - Llenado de canalización (módulo [`conduit`]) — obligatoria.
//! - Resistencia de electrodo de tierra único (módulo [`grounding`]) — obligatoria,
//!   salvo que exista electrodo suplementario.
//!
//! ## ✅ Estado de las referencias normativas — validadas contra la NOM-001-SEDE-2018 oficial
//! Las 5 referencias de [`types::NormReference`] se verificaron contra el texto de
//! `docs/referencias/NOM-001-SEDE-2018.pdf` (extracción directa, PDF nativo — mismo
//! método que validó las tablas numéricas de `calc_engine`) y ahora citan el
//! artículo real de la NOM, con su notación con guion (p. ej. "215-2", no "215.2(A)"
//! como el NEC):
//!
//! | Regla | Referencia NOM confirmada |
//! |---|---|
//! | Caída de tensión, alimentador (`voltage_drop`) | Art. 215-2(a), NOTA 1 |
//! | Caída de tensión, circuito derivado (`voltage_drop`) | Art. 210-19(a), NOTA 4 |
//! | Ampacidad de conductor (`conductor`) | Tabla 310-15(b)(16) |
//! | Capacidad interruptiva (`protection`) | Art. 110-9 |
//! | Llenado de canalización (`conduit`) | Tabla 1, Capítulo 10 |
//! | Resistencia de electrodo único (`grounding`) | Art. 250-53(a)(2) |
//!
//! Revisión de César Flores, ingeniero responsable del proyecto. El texto de cada
//! artículo (transcrito en el comentario de cabecera del módulo correspondiente)
//! confirma no solo el número, sino que la clasificación `Advertencia` vs.
//! `NoCumple` de cada regla es correcta: los dos artículos de caída de tensión son
//! notas de recomendación ("proporcionará una eficiencia razonable de operación"),
//! mientras que ampacidad, capacidad interruptiva, llenado y resistencia de
//! electrodo son requisitos con lenguaje obligatorio ("deben", "no se exigirá... a
//! menos que").
//!
//! ## Pendiente (Sección 6 del plan maestro)
//! - Catálogo de reglas versionado y cargado desde datos externos — aquí las reglas
//!   están compiladas en código, no en un catálogo editable sin recompilar (Sección
//!   6.7: control de cambios por versión normativa).
//! - Clasificador de aplicabilidad automático (qué reglas corren según tipo de
//!   proyecto/circuito) — hoy el llamador decide qué función invocar.
//! - Factores de demanda tabulares por tipo de ocupación (Sección 6.3) — siguen
//!   fuera de este motor, igual que en `calc_engine::load`.
//! - Integración con el asistente de IA (Sección 7): RAG sobre el corpus normativo
//!   completo para responder preguntas libres, no solo evaluar estas 5 reglas
//!   estructuradas.

pub mod conductor;
pub mod conduit;
pub mod grounding;
pub mod protection;
pub mod types;
pub mod voltage_drop;

pub use conductor::evaluate_conductor_ampacity;
pub use conduit::evaluate_conduit_fill;
pub use grounding::evaluate_single_electrode_resistance;
pub use protection::evaluate_interrupting_capacity;
pub use types::{ComplianceFinding, ComplianceStatus, NormReference};
pub use voltage_drop::evaluate_voltage_drop;
