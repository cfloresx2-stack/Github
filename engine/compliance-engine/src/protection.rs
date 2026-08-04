//! Reglas de dimensionamiento y verificación de dispositivos de protección.
//!
//! - `evaluate_conductor_protection`: la protección de un circuito general
//!   (alimentador o derivado, no de motor) no debe exceder la ampacidad del
//!   conductor -- **✅ validado contra la NOM-001-SEDE-2018 oficial**, Art. 240-4 /
//!   Tabla 240-6(a) (misma tabla que valida
//!   `calc_engine::protection::STANDARD_DEVICE_SIZES`). Requisito obligatorio: una
//!   protección sobredimensionada no despeja una sobrecarga del conductor a
//!   tiempo. `max_allowed_amps` ya debe venir calculada con
//!   `calc_engine::protection::conductor_protection_amps` (que aplica la
//!   excepción del siguiente tamaño estándar, Art. 240-4(d)) -- este módulo solo
//!   compara.
//! - `evaluate_interrupting_capacity`: capacidad interruptiva del dispositivo debe
//!   alcanzar la falla disponible en ese punto.
//!
//! **✅ Referencia validada contra la NOM-001-SEDE-2018 oficial** — Art. 110-9,
//! "Capacidad de interrupción": el texto exige que el rango nominal de interrupción
//! sea "al menos igual a la corriente existente en las terminales de línea del
//! equipo". Requisito de seguridad obligatorio — un dispositivo insuficiente puede
//! fallar catastróficamente al intentar interrumpir una falla mayor a su capacidad.

use crate::types::{ComplianceFinding, ComplianceStatus, NormReference};

pub fn evaluate_conductor_protection(
    circuit_name: &str,
    protection_amps: f64,
    conductor_ampacity_amps: f64,
    max_allowed_amps: f64,
) -> ComplianceFinding {
    let status = if protection_amps <= max_allowed_amps {
        ComplianceStatus::Cumple
    } else {
        ComplianceStatus::NoCumple
    };
    ComplianceFinding {
        rule_id: "proteccion_circuito",
        status,
        norm_reference: NormReference {
            code: "NOM-001-SEDE-2018, Art. 240-4 / Tabla 240-6(a)".to_string(),
            title: "Protección del circuito no debe exceder la ampacidad del conductor"
                .to_string(),
        },
        observation: format!(
            "El interruptor o fusible del circuito \"{circuit_name}\" es de {protection_amps:.1} \
             A; no debe exceder {max_allowed_amps:.1} A, el siguiente tamaño comercial estándar \
             sobre la ampacidad corregida del conductor ({conductor_ampacity_amps:.2} A)."
        ),
    }
}

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
    fn protection_within_limit_is_cumple() {
        let finding = evaluate_conductor_protection("Alim-1", 50.0, 47.0, 50.0);
        assert_eq!(finding.status, ComplianceStatus::Cumple);
    }

    #[test]
    fn protection_over_limit_is_no_cumple() {
        // Usuario forzó un interruptor de 100 A sobre un conductor cuyo máximo
        // permitido (siguiente tamaño estándar) es 50 A.
        let finding = evaluate_conductor_protection("Alim-1", 100.0, 47.0, 50.0);
        assert_eq!(finding.status, ComplianceStatus::NoCumple);
    }

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
