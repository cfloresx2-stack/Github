//! Tipos núcleo del motor normativo (Sección 6 del plan maestro).

/// Resultado de evaluar una regla normativa contra un resultado de cálculo.
/// Corresponde a los 4 estados de la Sección 6.2 del plan maestro.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ComplianceStatus {
    /// Resultado dentro de umbrales y evidencia completa.
    Cumple,
    /// Existe margen bajo, criterio incompleto o dato sensible.
    Advertencia,
    /// Violación de regla técnica o normativa estructurada.
    NoCumple,
    /// Falta información mínima o soporte documental.
    NoEvaluable,
}

/// Referencia normativa asociada a un hallazgo (Sección 6.6: evidencia técnica).
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct NormReference {
    /// Código del artículo/tabla (p. ej. "NOM-001-SEDE-2018 Art. 215-2 (equiv.)").
    /// Marcado "(equiv.)" cuando el número de artículo proviene del NEC análogo y
    /// aún no fue validado contra el texto exacto de la NOM-001-SEDE-2018 — ver el
    /// aviso completo en `lib.rs`.
    pub code: String,
    pub title: String,
}

/// Hallazgo de cumplimiento: el resultado de evaluar una regla sobre un circuito o
/// elemento del proyecto, con la evidencia que lo sustenta (Sección 6.6).
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ComplianceFinding {
    /// Identificador estable de la regla, para trazabilidad y control de cambios
    /// del catálogo normativo (Sección 6.7).
    pub rule_id: &'static str,
    pub status: ComplianceStatus,
    pub norm_reference: NormReference,
    /// Observación técnica en lenguaje natural (Sección 6.5).
    pub observation: String,
}
