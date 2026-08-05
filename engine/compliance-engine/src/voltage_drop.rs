//! Regla: caída de tensión.
//!
//! **✅ Referencia validada contra la NOM-001-SEDE-2018 oficial** — Art. 215-2(a),
//! NOTA 1 (alimentadores) y Art. 210-19(a), NOTA 4 (circuitos derivados). Ambas notas
//! usan el mismo lenguaje: un conductor dimensionado para no exceder 3% de caída de
//! tensión en el alimentador o circuito derivado (5% combinado) "proporcionará una
//! eficiencia razonable de operación" — es una **recomendación de diseño explícita
//! en una NOTA, no un límite de cumplimiento obligatorio** como la ampacidad o la
//! capacidad interruptiva. Por eso esta regla clasifica un exceso como
//! `Advertencia`, no `NoCumple`. (Podría existir un requisito de proyecto específico
//! que sí lo vuelva obligatorio — eso queda fuera del alcance de esta regla.)

use crate::types::{ComplianceFinding, ComplianceStatus, NormReference};

const RECOMMENDED_LIMIT_PERCENT: f64 = 3.0;

pub fn evaluate_voltage_drop(
    circuit_name: &str,
    is_feeder: bool,
    voltage_drop_percent: f64,
) -> ComplianceFinding {
    let status = if voltage_drop_percent <= RECOMMENDED_LIMIT_PERCENT {
        ComplianceStatus::Cumple
    } else {
        ComplianceStatus::Advertencia
    };
    let segment = if is_feeder {
        "alimentador"
    } else {
        "circuito derivado"
    };
    let comparison = if voltage_drop_percent <= RECOMMENDED_LIMIT_PERCENT {
        "dentro del"
    } else {
        "por encima del"
    };
    let code = if is_feeder {
        "NOM-001-SEDE-2018, Art. 215-2(a), NOTA 1"
    } else {
        "NOM-001-SEDE-2018, Art. 210-19(a), NOTA 4"
    };
    ComplianceFinding {
        rule_id: "caida_tension",
        status,
        norm_reference: NormReference {
            code: code.to_string(),
            title: "Caída de tensión recomendada".to_string(),
        },
        observation: format!(
            "El {segment} \"{circuit_name}\" presenta una caída de tensión calculada de \
             {voltage_drop_percent:.2}%, {comparison} límite recomendado de \
             {RECOMMENDED_LIMIT_PERCENT:.0}%."
        ),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn within_limit_is_cumple() {
        let finding = evaluate_voltage_drop("Alim-1", true, 2.1);
        assert_eq!(finding.status, ComplianceStatus::Cumple);
    }

    #[test]
    fn over_limit_is_advertencia_not_no_cumple() {
        let finding = evaluate_voltage_drop("Alim-1", true, 4.1);
        assert_eq!(finding.status, ComplianceStatus::Advertencia);
        assert!(finding.observation.contains("4.10%"));
    }

    #[test]
    fn observation_names_the_right_segment() {
        let feeder = evaluate_voltage_drop("X", true, 1.0);
        let branch = evaluate_voltage_drop("X", false, 1.0);
        assert!(feeder.observation.contains("alimentador"));
        assert!(branch.observation.contains("circuito derivado"));
    }

    #[test]
    fn cites_the_correct_article_per_segment() {
        let feeder = evaluate_voltage_drop("X", true, 1.0);
        let branch = evaluate_voltage_drop("X", false, 1.0);
        assert_eq!(
            feeder.norm_reference.code,
            "NOM-001-SEDE-2018, Art. 215-2(a), NOTA 1"
        );
        assert_eq!(
            branch.norm_reference.code,
            "NOM-001-SEDE-2018, Art. 210-19(a), NOTA 4"
        );
    }
}
