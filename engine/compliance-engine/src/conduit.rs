//! Regla: llenado de canalización dentro del porcentaje máximo permitido (equiv.
//! NEC Chapter 9, Table 1). Requisito obligatorio — el sobrellenado dificulta el
//! tendido y daña el aislamiento de los conductores.

use crate::types::{ComplianceFinding, ComplianceStatus, NormReference};

pub fn evaluate_conduit_fill(
    conduit_label: &str,
    total_conductor_area_sq_in: f64,
    usable_area_sq_in: f64,
) -> ComplianceFinding {
    let status = if total_conductor_area_sq_in <= usable_area_sq_in {
        ComplianceStatus::Cumple
    } else {
        ComplianceStatus::NoCumple
    };
    ComplianceFinding {
        rule_id: "llenado_ducto",
        status,
        norm_reference: NormReference {
            code: "NOM-001-SEDE-2018 (equiv. NEC Chapter 9, Table 1)".to_string(),
            title: "Porcentaje de llenado de canalización".to_string(),
        },
        observation: format!(
            "La canalización \"{conduit_label}\" tiene un área utilizable de \
             {usable_area_sq_in:.4} in²; los conductores instalados ocupan \
             {total_conductor_area_sq_in:.4} in²."
        ),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn within_area_is_cumple() {
        let finding = evaluate_conduit_fill("EMT-1", 0.15, 0.20);
        assert_eq!(finding.status, ComplianceStatus::Cumple);
    }

    #[test]
    fn over_area_is_no_cumple() {
        let finding = evaluate_conduit_fill("EMT-1", 0.25, 0.20);
        assert_eq!(finding.status, ComplianceStatus::NoCumple);
    }
}
