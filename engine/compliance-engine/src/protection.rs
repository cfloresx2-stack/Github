//! Regla: capacidad interruptiva del dispositivo de protección debe alcanzar la
//! falla disponible en ese punto.
//!
//! **✅ Referencia validada contra la NOM-001-SEDE-2018 oficial** — Art. 110-9,
//! "Capacidad de interrupción": el texto exige que el rango nominal de interrupción
//! sea "al menos igual a la corriente existente en las terminales de línea del
//! equipo". Requisito de seguridad obligatorio — un dispositivo insuficiente puede
//! fallar catastróficamente al intentar interrumpir una falla mayor a su capacidad.

use crate::types::{ComplianceFinding, ComplianceStatus, NormReference};

pub fn evaluate_interrupting_capacity(
    circuit_name: &str,
    device_aic_ka: f64,
    available_fault_current_ka: f64,
) -> ComplianceFinding {
    let status = if device_aic_ka >= available_fault_current_ka {
        ComplianceStatus::Cumple
    } else {
        ComplianceStatus::NoCumple
    };
    ComplianceFinding {
        rule_id: "capacidad_interruptiva",
        status,
        norm_reference: NormReference {
            code: "NOM-001-SEDE-2018, Art. 110-9".to_string(),
            title: "Capacidad interruptiva del dispositivo de protección".to_string(),
        },
        observation: format!(
            "La protección del circuito \"{circuit_name}\" tiene capacidad interruptiva \
             de {device_aic_ka:.1} kA; la falla disponible calculada en ese punto es de \
             {available_fault_current_ka:.2} kA."
        ),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn sufficient_aic_is_cumple() {
        let finding = evaluate_interrupting_capacity("D-1", 22.0, 18.0);
        assert_eq!(finding.status, ComplianceStatus::Cumple);
    }

    #[test]
    fn insufficient_aic_is_no_cumple() {
        let finding = evaluate_interrupting_capacity("D-1", 10.0, 18.0);
        assert_eq!(finding.status, ComplianceStatus::NoCumple);
    }
}
