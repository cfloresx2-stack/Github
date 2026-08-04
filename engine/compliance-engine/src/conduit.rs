//! Regla: llenado de canalización dentro del porcentaje máximo permitido.
//!
//! **✅ Referencia validada contra la NOM-001-SEDE-2018 oficial** — Tabla 1,
//! Capítulo 10 (nota: en la NOM esta tabla vive en el Capítulo 10, no en el 9 como
//! en el NEC — misma tabla que valida `calc_engine::conduit::max_fill_percent`, ver
//! ese módulo). Requisito obligatorio — el sobrellenado dificulta el tendido y daña
//! el aislamiento de los conductores.

use crate::types::{ComplianceFinding, ComplianceStatus, NormReference};

pub fn evaluate_conduit_fill(
    conduit_label: &str,
    total_conductor_area_mm2: f64,
    usable_area_mm2: f64,
) -> ComplianceFinding {
    let status = if total_conductor_area_mm2 <= usable_area_mm2 {
        ComplianceStatus::Cumple
    } else {
        ComplianceStatus::NoCumple
    };
    ComplianceFinding {
        rule_id: "llenado_ducto",
        status,
        norm_reference: NormReference {
            code: "NOM-001-SEDE-2018, Tabla 1, Capítulo 10 / Tabla 4".to_string(),
            title: "Porcentaje de llenado de canalización".to_string(),
        },
        observation: format!(
            "La canalización \"{conduit_label}\" tiene un área utilizable de \
             {usable_area_mm2:.1} mm²; los conductores instalados ocupan \
             {total_conductor_area_mm2:.1} mm²."
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
