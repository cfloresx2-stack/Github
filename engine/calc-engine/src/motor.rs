//! Dimensionamiento de circuitos de motor (Art. 430 de la NOM).
//!
//! Un circuito de motor se dimensiona distinto a un circuito de carga general: la
//! corriente no se calcula de la potencia de placa, se toma de una **tabla** (Tablas
//! 430-248/430-250, según fases y tensión del motor) -- la llamada corriente a plena
//! carga (FLC). A partir de esa FLC:
//! - Conductor del circuito derivado: ampacidad ≥ 125% de la FLC (Art. 430-22).
//! - Protección del circuito derivado: porcentaje máximo de la FLC según el tipo de
//!   dispositivo, Tabla 430-52 (ver `crate::protection::motor_branch_protection_amps`,
//!   que ya usa esta FLC).
//! - Grupo de motores en un mismo alimentador (Art. 430-24): 125% de la FLC del
//!   motor más grande + 100% del resto -- `motor_group_conductor_ampacity`.
//!
//! **✅ Tablas de FLC validadas contra la NOM-001-SEDE-2018 oficial** -- Tabla
//! 430-248 (monofásicos) y Tabla 430-250, columnas de motor de inducción tipo jaula
//! de ardilla/rotor devanado (trifásicos; se omite la columna de motores síncronos
//! de factor de potencia unitario, uso poco común). Alcance limitado a propósito:
//! monofásico 127 V y 230 V (las dos tensiones monofásicas de esta calculadora, que
//! caen respectivamente en las columnas de 127 V y "220 a 240 V" de la Tabla
//! 430-248); trifásico 230 V y 460 V (las columnas donde caen los 220 V y 440/480 V
//! de esta calculadora, según la propia NOM: "se permitirán para sistemas con
//! intervalos de tensión de 220 a 240 volts... 440 a 480 volts"). Trifásico se
//! detiene en 200 hp -- motores mayores son un caso de diseño especializado fuera
//! del alcance de esta versión.

/// (etiqueta de hp, valor numérico de hp) -- catálogo completo para poblar un
/// selector de hp en la UI; no todas las etiquetas existen en las cuatro tablas de
/// FLC (monofásico se detiene en 10 hp).
pub const MOTOR_HP_LABELS: &[(&str, f64)] = &[
    ("1/6", 1.0 / 6.0),
    ("1/4", 0.25),
    ("1/3", 1.0 / 3.0),
    ("1/2", 0.5),
    ("3/4", 0.75),
    ("1", 1.0),
    ("1 1/2", 1.5),
    ("2", 2.0),
    ("3", 3.0),
    ("5", 5.0),
    ("7 1/2", 7.5),
    ("10", 10.0),
    ("15", 15.0),
    ("20", 20.0),
    ("25", 25.0),
    ("30", 30.0),
    ("40", 40.0),
    ("50", 50.0),
    ("60", 60.0),
    ("75", 75.0),
    ("100", 100.0),
    ("125", 125.0),
    ("150", 150.0),
    ("200", 200.0),
];

/// Tabla 430-248, columna 127 V (monofásico).
pub const MOTOR_FLC_SINGLE_127V: &[(&str, f64)] = &[
    ("1/6", 4.0),
    ("1/4", 5.3),
    ("1/3", 6.5),
    ("1/2", 8.9),
    ("3/4", 11.5),
    ("1", 14.0),
    ("1 1/2", 18.0),
    ("2", 22.0),
    ("3", 31.0),
    ("5", 51.0),
    ("7 1/2", 72.0),
    ("10", 91.0),
];

/// Tabla 430-248, columna 230 V (monofásico).
pub const MOTOR_FLC_SINGLE_230V: &[(&str, f64)] = &[
    ("1/6", 2.2),
    ("1/4", 2.9),
    ("1/3", 3.6),
    ("1/2", 4.9),
    ("3/4", 6.9),
    ("1", 8.0),
    ("1 1/2", 10.0),
    ("2", 12.0),
    ("3", 17.0),
    ("5", 28.0),
    ("7 1/2", 40.0),
    ("10", 50.0),
];

/// Tabla 430-250, columna 230 V, inducción jaula de ardilla/rotor devanado (trifásico).
pub const MOTOR_FLC_THREE_230V: &[(&str, f64)] = &[
    ("1/2", 2.2),
    ("3/4", 3.2),
    ("1", 4.2),
    ("1 1/2", 6.0),
    ("2", 6.8),
    ("3", 9.6),
    ("5", 15.2),
    ("7 1/2", 22.0),
    ("10", 28.0),
    ("15", 42.0),
    ("20", 54.0),
    ("25", 68.0),
    ("30", 80.0),
    ("40", 104.0),
    ("50", 130.0),
    ("60", 154.0),
    ("75", 192.0),
    ("100", 248.0),
    ("125", 312.0),
    ("150", 360.0),
    ("200", 480.0),
];

/// Tabla 430-250, columna 460 V, inducción jaula de ardilla/rotor devanado (trifásico).
pub const MOTOR_FLC_THREE_460V: &[(&str, f64)] = &[
    ("1/2", 1.1),
    ("3/4", 1.6),
    ("1", 2.1),
    ("1 1/2", 3.0),
    ("2", 3.4),
    ("3", 4.8),
    ("5", 7.6),
    ("7 1/2", 11.0),
    ("10", 14.0),
    ("15", 21.0),
    ("20", 27.0),
    ("25", 34.0),
    ("30", 40.0),
    ("40", 52.0),
    ("50", 65.0),
    ("60", 77.0),
    ("75", 96.0),
    ("100", 124.0),
    ("125", 156.0),
    ("150", 180.0),
    ("200", 240.0),
];

/// Corriente a plena carga (FLC) de un motor, de tabla -- no de la placa del
/// fabricante (Art. 430-6(a): la FLC de tabla es la que rige para dimensionar
/// conductor y protección, incluso si la placa da un valor distinto). `voltage`
/// debe ser 127, 220, 440 o 480 (las tensiones de esta calculadora); monofásico
/// admite 127 y 220, trifásico admite 220, 440 y 480 -- 440 y 480 comparten la
/// columna de 460 V de la Tabla 430-250, dentro del rango que la NOM permite.
pub fn motor_full_load_current(hp_label: &str, voltage: f64, three_phase: bool) -> Option<f64> {
    let table: &[(&str, f64)] = match (three_phase, voltage as i64) {
        (false, 127) => MOTOR_FLC_SINGLE_127V,
        (false, 220) => MOTOR_FLC_SINGLE_230V,
        (true, 220) => MOTOR_FLC_THREE_230V,
        (true, 440) | (true, 480) => MOTOR_FLC_THREE_460V,
        _ => return None,
    };
    table
        .iter()
        .find(|(label, _)| *label == hp_label)
        .map(|(_, amps)| *amps)
}

/// Ampacidad mínima del conductor del circuito derivado de un solo motor (Art.
/// 430-22): 125% de la FLC. Es la misma regla que
/// [`crate::conductor::continuous_load_adjusted_current`] aplicada siempre como
/// carga continua -- un motor se trata así por defecto en este dimensionamiento.
pub fn motor_branch_circuit_ampacity(flc_amps: f64) -> f64 {
    flc_amps * 1.25
}

/// Regla (equiv. NEC 430.24, reproducida como ejemplo resuelto en Ugly's Electrical
/// Reference, pág. 44): la ampacidad del conductor que alimenta varios motores debe
/// ser al menos 125% de la corriente a plena carga (FLC) del motor más grande, más el
/// 100% de la FLC del resto de los motores del grupo.

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
    fn flc_matches_nom_tabla_430_250_known_values() {
        // Motor trifásico 10 hp, 230 V: 28 A (valor ampliamente conocido, coincide
        // exacto con NEC/NOM Tabla 430-250).
        assert_eq!(motor_full_load_current("10", 220.0, true), Some(28.0));
        // 50 hp, 230 V: 130 A.
        assert_eq!(motor_full_load_current("50", 220.0, true), Some(130.0));
        // 10 hp, 460 V: 14 A -- misma fila, mitad de corriente al doble de tensión.
        assert_eq!(motor_full_load_current("10", 440.0, true), Some(14.0));
        assert_eq!(motor_full_load_current("10", 480.0, true), Some(14.0));
    }

    #[test]
    fn flc_single_phase_matches_tabla_430_248() {
        assert_eq!(motor_full_load_current("1", 127.0, false), Some(14.0));
        assert_eq!(motor_full_load_current("1", 220.0, false), Some(8.0));
    }

    #[test]
    fn flc_returns_none_for_unsupported_combination() {
        // Motor trifásico no existe en 127 V en esta calculadora.
        assert_eq!(motor_full_load_current("10", 127.0, true), None);
        // Monofásico no existe en 440 V.
        assert_eq!(motor_full_load_current("10", 440.0, false), None);
        // hp no listado.
        assert_eq!(motor_full_load_current("1000", 220.0, true), None);
    }

    #[test]
    fn motor_branch_circuit_ampacity_is_125_percent_of_flc() {
        assert!((motor_branch_circuit_ampacity(28.0) - 35.0).abs() < 1e-9);
    }

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
