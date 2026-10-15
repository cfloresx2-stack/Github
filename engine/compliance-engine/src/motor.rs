//! Regla: protección de circuito derivado de motor dentro del porcentaje máximo
//! de la corriente a plena carga (FLC) permitido por tipo de dispositivo.
//!
//! **✅ Referencia validada contra la NOM-001-SEDE-2018 oficial** — Tabla 430-52
//! (misma tabla que valida `calc_engine::protection::motor_branch_protection_max_percent`,
//! ver ese módulo). Requisito obligatorio de seguridad -- una protección
//! sobredimensionada no despeja una sobrecorriente del motor a tiempo.
//!
//! `max_allowed_amps` ya debe venir redondeada al siguiente tamaño comercial
//! estándar permitido por el Art. 430-52(C)(1) (ver
//! `calc_engine::protection::motor_branch_protection_amps`) -- este módulo no
//! recalcula esa tabla, solo compara la protección elegida contra ese límite.

use crate::types::{ComplianceFinding, ComplianceStatus, NormReference};

pub fn evaluate_motor_protection(
    circuit_name: &str,
    protection_amps: f64,
    motor_flc_amps: f64,
    max_allowed_amps: f64,
) -> ComplianceFinding {
    let status = if protection_amps <= max_allowed_amps {
        ComplianceStatus::Cumple
    } else {
        ComplianceStatus::NoCumple
    };
    ComplianceFinding {
        rule_id: "proteccion_motor",
        status,
        norm_reference: NormReference {
            code: "NOM-001-SEDE-2018, Tabla 430-52".to_string(),
            title: "Protección de circuito derivado de motor".to_string(),
        },
        observation: format!(
            "El motor del circuito \"{circuit_name}\" tiene una corriente a plena carga \
             (FLC, de tabla) de {motor_flc_amps:.2} A; la protección de {protection_amps:.1} A \
             no debe exceder {max_allowed_amps:.1} A según el tipo de dispositivo."
        ),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn within_limit_is_cumple() {
        let finding = evaluate_motor_protection("M-1", 70.0, 28.0, 70.0);
        assert_eq!(finding.status, ComplianceStatus::Cumple);
    }

    #[test]
    fn over_limit_is_no_cumple() {
        let finding = evaluate_motor_protection("M-1", 90.0, 28.0, 70.0);
        assert_eq!(finding.status, ComplianceStatus::NoCumple);
    }
}
