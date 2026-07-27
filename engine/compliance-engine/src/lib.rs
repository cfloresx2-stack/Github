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
//! ## ⚠️ Estado de las referencias normativas — requiere validación de un ingeniero
//! Cada [`types::NormReference`] generado está marcado **"(equiv.)"** porque el
//! código de artículo proviene del NEC análogo — **no se validó contra el número de
//! artículo exacto de la NOM-001-SEDE-2018**, por la misma razón documentada en
//! `calc_engine`: la extracción automática de `docs/referencias/NOM-001-SEDE-2018.pdf`
//! no produjo texto confiable para mapear artículo por artículo (columnas
//! desalineadas por el tipo de escaneo).
//!
//! **Antes de usar las observaciones generadas como evidencia formal de
//! cumplimiento, un ingeniero eléctrico responsable debe reemplazar cada "(equiv.)"
//! por la referencia exacta de la NOM-001-SEDE-2018 vigente**, y confirmar si el
//! límite de caída de tensión es recomendación u obligación en el proyecto
//! específico (ver aviso en `voltage_drop.rs`).
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
