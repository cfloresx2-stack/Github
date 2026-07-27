//! Dimensionamiento de conductor para grupos de motores.
//!
//! Regla (equiv. NEC 430.24, reproducida como ejemplo resuelto en Ugly's Electrical
//! Reference, pág. 44): la ampacidad del conductor que alimenta varios motores debe
//! ser al menos 125% de la corriente a plena carga (FLC) del motor más grande, más el
//! 100% de la FLC del resto de los motores del grupo.

/// `full_load_currents` en amperes, uno por motor alimentado por el mismo conductor.
/// Retorna la ampacidad mínima requerida del conductor, o `None` si la lista está vacía.
pub fn motor_group_conductor_ampacity(full_load_currents: &[f64]) -> Option<f64> {
    if full_load_currents.is_empty() {
        return None;
    }
    let largest = full_load_currents.iter().cloned().fold(f64::MIN, f64::max);
    let rest_sum: f64 = full_load_currents.iter().sum::<f64>() - largest;
    Some(largest * 1.25 + rest_sum)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn matches_uglys_worked_example() {
        // Ugly's Electrical Reference, pág. 44: dos motores de 65 A y 40 A FLC.
        // 125% de 65 A + 40 A = 121.25 A.
        let result = motor_group_conductor_ampacity(&[65.0, 40.0]).unwrap();
        assert!((result - 121.25).abs() < 1e-9);
    }

    #[test]
    fn works_with_more_than_two_motors() {
        // Motor mayor 30 A, más otros dos de 15 A y 10 A.
        // 125% de 30 + 15 + 10 = 37.5 + 25 = 62.5 A.
        let result = motor_group_conductor_ampacity(&[30.0, 15.0, 10.0]).unwrap();
        assert!((result - 62.5).abs() < 1e-9);
    }

    #[test]
    fn single_motor_is_just_125_percent() {
        let result = motor_group_conductor_ampacity(&[20.0]).unwrap();
        assert!((result - 25.0).abs() < 1e-9);
    }

    #[test]
    fn empty_group_returns_none() {
        assert_eq!(motor_group_conductor_ampacity(&[]), None);
    }
}
