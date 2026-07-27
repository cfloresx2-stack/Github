//! Regla: resistencia máxima de un electrodo de tierra único (equiv. NEC
//! 250.53(A)(2)): si un solo electrodo no logra 25 Ω o menos, se exige complementar
//! con un electrodo adicional.

use crate::types::{ComplianceFinding, ComplianceStatus, NormReference};

const SINGLE_ELECTRODE_MAX_OHMS: f64 = 25.0;

pub fn evaluate_single_electrode_resistance(
    electrode_label: &str,
    resistance_ohms: f64,
    has_supplemental_electrode: bool,
) -> ComplianceFinding {
    let status = if resistance_ohms <= SINGLE_ELECTRODE_MAX_OHMS || has_supplemental_electrode {
        ComplianceStatus::Cumple
    } else {
        ComplianceStatus::NoCumple
    };
    let note = if resistance_ohms > SINGLE_ELECTRODE_MAX_OHMS && !has_supplemental_electrode {
        " Se requiere un electrodo adicional."
    } else {
        ""
    };
    ComplianceFinding {
        rule_id: "resistencia_electrodo",
        status,
        norm_reference: NormReference {
            code: "NOM-001-SEDE-2018 (equiv. NEC 250.53(A)(2))".to_string(),
            title: "Resistencia máxima de electrodo único".to_string(),
        },
        observation: format!(
            "El electrodo \"{electrode_label}\" tiene una resistencia calculada de \
             {resistance_ohms:.2} Ω (máximo para electrodo único: \
             {SINGLE_ELECTRODE_MAX_OHMS:.0} Ω).{note}"
        ),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn within_25_ohms_is_cumple() {
        let finding = evaluate_single_electrode_resistance("E-1", 18.0, false);
        assert_eq!(finding.status, ComplianceStatus::Cumple);
    }

    #[test]
    fn over_25_ohms_without_supplement_is_no_cumple() {
        let finding = evaluate_single_electrode_resistance("E-1", 30.0, false);
        assert_eq!(finding.status, ComplianceStatus::NoCumple);
        assert!(finding.observation.contains("electrodo adicional"));
    }

    #[test]
    fn over_25_ohms_with_supplement_is_cumple() {
        let finding = evaluate_single_electrode_resistance("E-1", 30.0, true);
        assert_eq!(finding.status, ComplianceStatus::Cumple);
    }
}
