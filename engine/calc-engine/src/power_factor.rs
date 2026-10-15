//! Módulos 4.13–4.14: corrección de factor de potencia y dimensionamiento de banco
//! de capacitores.

/// kVAR de capacitores requeridos para corregir el factor de potencia de
/// `power_factor_actual` a `power_factor_target`, dada la demanda activa en kW.
///
/// `kVAR = kW × (tan(acos(FP actual)) − tan(acos(FP objetivo)))`
pub fn required_capacitor_kvar(
    active_power_kw: f64,
    power_factor_actual: f64,
    power_factor_target: f64,
) -> f64 {
    let angle_actual = power_factor_actual.acos();
    let angle_target = power_factor_target.acos();
    active_power_kw * (angle_actual.tan() - angle_target.tan())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn matches_known_correction_table_multiplier() {
        // 100 kW, FP actual 0.75 -> objetivo 0.95. El multiplicador tabular
        // estándar de corrección de FP para este par es ~0.553 (kVAR = kW × 0.553).
        let kvar = required_capacitor_kvar(100.0, 0.75, 0.95);
        assert!((kvar - 55.32).abs() < 0.1, "got {kvar}");
    }

    #[test]
    fn no_correction_needed_when_already_at_target() {
        let kvar = required_capacitor_kvar(100.0, 0.95, 0.95);
        assert!(kvar.abs() < 1e-9);
    }

    #[test]
    fn higher_target_requires_more_kvar() {
        let to_90 = required_capacitor_kvar(100.0, 0.75, 0.90);
        let to_98 = required_capacitor_kvar(100.0, 0.75, 0.98);
        assert!(to_98 > to_90);
    }
}
