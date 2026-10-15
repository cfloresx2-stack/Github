//! Regla: ampacidad del conductor debe alcanzar la corriente requerida.
//!
//! **✅ Referencia validada contra la NOM-001-SEDE-2018 oficial** — Tabla
//! 310-15(b)(16) (la misma tabla que valida `calc_engine::conductor::COPPER_CONDUCTORS`,
//! ver ese módulo). A diferencia de la caída de tensión, esto es un requisito de
//! seguridad obligatorio, no una recomendación — se clasifica `NoCumple`, no
//! `Advertencia`, cuando falla.

use crate::types::{ComplianceFinding, ComplianceStatus, NormReference};

pub fn evaluate_conductor_ampacity(
    circuit_name: &str,
    required_current_amps: f64,
    corrected_ampacity_amps: f64,
) -> ComplianceFinding {
    let status = if corrected_ampacity_amps >= required_current_amps {
        ComplianceStatus::Cumple
    } else {
        ComplianceStatus::NoCumple
    };
    ComplianceFinding {
        rule_id: "ampacidad_conductor",
        status,
        norm_reference: NormReference {
            code: "NOM-001-SEDE-2018, Tabla 310-15(b)(16)".to_string(),
            title: "Ampacidad del conductor".to_string(),
        },
        observation: format!(
            "El circuito \"{circuit_name}\" requiere {required_current_amps:.2} A; el \
             conductor seleccionado tiene una ampacidad corregida de \
             {corrected_ampacity_amps:.2} A."
        ),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn sufficient_ampacity_is_cumple() {
        let finding = evaluate_conductor_ampacity("D-1", 28.0, 35.0);
        assert_eq!(finding.status, ComplianceStatus::Cumple);
    }

    #[test]
    fn insufficient_ampacity_is_no_cumple() {
        let finding = evaluate_conductor_ampacity("D-1", 40.0, 35.0);
        assert_eq!(finding.status, ComplianceStatus::NoCumple);
    }
}
