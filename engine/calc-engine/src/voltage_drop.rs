//! Caída de tensión (parte del Módulo 4.4 y de la Sección 5 del plan maestro).
//!
//! Fórmula aproximada de campo (la misma usada en Ugly's Electrical Reference y en
//! calculadoras de caída de tensión de uso común):
//!
//! - Monofásico: `VD = (2 × K × I × L) / CM`
//! - Trifásico:  `VD = (√3 × K × I × L) / CM`
//!
//! donde `K` es la constante de resistividad en Ω·cmil/ft (cobre ≈ 12.9, aluminio ≈
//! 21.2, a temperatura de operación ~75 °C), `L` es la longitud de UNA VÍA (no ida y
//! vuelta) y `CM` el área del conductor en circular mils.
//!
//! Es una fórmula aproximada (no considera reactancia inductiva ni ángulo de fase de
//! la carga) adecuada para el dimensionamiento de campo; para estudios de precisión
//! se debe sustituir por el cálculo con impedancia compleja del conductor.

use crate::common::Phases;
use crate::conductor::ConductorSize;

/// Constante de resistividad aproximada del cobre, en Ω·cmil/ft.
pub const K_COPPER: f64 = 12.9;
/// Constante de resistividad aproximada del aluminio, en Ω·cmil/ft.
pub const K_ALUMINUM: f64 = 21.2;

const METERS_TO_FEET: f64 = 3.280839895;

/// Caída de tensión en volts para un circuito dado.
///
/// `one_way_length_m` es la longitud de una sola vía (del tablero a la carga) en
/// metros; se convierte internamente a pies porque `k_ohm_cmil_per_ft` está definida
/// en esas unidades (convención estándar de campo también usada en Ugly's).
pub fn voltage_drop_volts(
    current_amps: f64,
    one_way_length_m: f64,
    conductor: &ConductorSize,
    k_ohm_cmil_per_ft: f64,
    phases: Phases,
) -> f64 {
    let length_ft = one_way_length_m * METERS_TO_FEET;
    let multiplier = match phases {
        Phases::Single => 2.0,
        Phases::Three => 3f64.sqrt(),
    };
    (multiplier * k_ohm_cmil_per_ft * current_amps * length_ft) / conductor.circular_mils
}

/// Caída de tensión como porcentaje de la tensión nominal del circuito.
pub fn voltage_drop_percent(
    current_amps: f64,
    one_way_length_m: f64,
    conductor: &ConductorSize,
    k_ohm_cmil_per_ft: f64,
    phases: Phases,
    nominal_voltage: f64,
) -> f64 {
    let vd = voltage_drop_volts(current_amps, one_way_length_m, conductor, k_ohm_cmil_per_ft, phases);
    (vd / nominal_voltage) * 100.0
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::conductor::COPPER_CONDUCTORS;

    fn conductor(name: &str) -> &'static ConductorSize {
        COPPER_CONDUCTORS.iter().find(|c| c.name == name).unwrap()
    }

    #[test]
    fn voltage_drop_within_expected_range_for_known_case() {
        // Circuito trifásico, 40 m (una vía), 50 A, conductor 8 AWG cobre, 480 V.
        let pct = voltage_drop_percent(50.0, 40.0, conductor("8 AWG"), K_COPPER, Phases::Three, 480.0);
        assert!(pct > 1.7 && pct < 2.0, "unexpected voltage drop: {pct}%");
    }

    #[test]
    fn longer_run_increases_drop_proportionally() {
        let short = voltage_drop_volts(50.0, 20.0, conductor("8 AWG"), K_COPPER, Phases::Three);
        let long = voltage_drop_volts(50.0, 40.0, conductor("8 AWG"), K_COPPER, Phases::Three);
        assert!((long - 2.0 * short).abs() < 1e-9);
    }

    #[test]
    fn larger_conductor_reduces_drop() {
        let small = voltage_drop_volts(50.0, 40.0, conductor("10 AWG"), K_COPPER, Phases::Three);
        let large = voltage_drop_volts(50.0, 40.0, conductor("4 AWG"), K_COPPER, Phases::Three);
        assert!(large < small);
    }

    #[test]
    fn single_phase_uses_multiplier_two() {
        let three_phase = voltage_drop_volts(50.0, 40.0, conductor("8 AWG"), K_COPPER, Phases::Three);
        let single_phase = voltage_drop_volts(50.0, 40.0, conductor("8 AWG"), K_COPPER, Phases::Single);
        // 2 / sqrt(3) ≈ 1.1547
        assert!((single_phase / three_phase - 2.0 / 3f64.sqrt()).abs() < 1e-9);
    }
}
