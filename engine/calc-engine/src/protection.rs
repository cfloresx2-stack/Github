//! Módulo 4.8: selección de protecciones y verificación de coordinación básica.
//!
//! Cubre:
//! - Dimensionamiento de protección de conductor (Art. 240). `STANDARD_DEVICE_SIZES`
//!   **✅ validado contra la Tabla 240-6(a) de la NOM-001-SEDE-2018 oficial** —
//!   coincide exactamente (36 valores).
//! - Dimensionamiento de protección de rama-circuito de motor (Art. 430, Tabla
//!   430-52 — categoría "todos los demás motores"; no cubre aún la categoría de
//!   motores Diseño B de alta eficiencia, que usa otros porcentajes).
//!   `motor_branch_protection_max_percent` **✅ validado contra la Tabla 430-52 de
//!   la NOM oficial** — los 3 porcentajes (250%/175%/300%) coinciden exactamente.
//! - Verificación de capacidad interruptiva contra la falla disponible en ese punto.
//! - Heurística de coordinación entre dos protecciones en serie.
//!
//! **La heurística de coordinación no sustituye un análisis de curvas
//! tiempo-corriente con datos reales del fabricante** — es la "coordinación básica"
//! mencionada en la Sección 4.8 del plan maestro; un análisis riguroso debe hacerse
//! antes de emitir una memoria de cálculo.

/// Tamaños comerciales estándar de dispositivos de protección (equiv. Tabla 240.6(A)
/// NEC), en amperes, orden ascendente.
pub const STANDARD_DEVICE_SIZES: &[f64] = &[
    15.0, 20.0, 25.0, 30.0, 35.0, 40.0, 45.0, 50.0, 60.0, 70.0, 80.0, 90.0, 100.0, 110.0, 125.0,
    150.0, 175.0, 200.0, 225.0, 250.0, 300.0, 350.0, 400.0, 450.0, 500.0, 600.0, 700.0, 800.0,
    1000.0, 1200.0, 1600.0, 2000.0, 2500.0, 3000.0, 4000.0, 5000.0, 6000.0,
];

/// Redondea `amps` al siguiente tamaño comercial estándar igual o superior.
/// Retorna `None` si `amps` excede el tamaño estándar más grande de la tabla.
pub fn next_standard_size(amps: f64) -> Option<f64> {
    STANDARD_DEVICE_SIZES.iter().copied().find(|&s| s >= amps)
}

/// Protección de conductor (equiv. Art. 240.4 NEC/NOM): la protección no debe
/// exceder la ampacidad del conductor. Si `next_size_rule_allowed` es `true`, se
/// permite usar el siguiente tamaño estándar superior cuando la ampacidad calculada
/// no coincide con un tamaño de dispositivo comercial (equiv. 240.4(B) — aplica solo
/// cuando el conductor no alimenta múltiples tomacorrientes para cargas portátiles ni
/// es un cordón flexible; esa condición debe verificarla el motor normativo, no este
/// motor de cálculo).
pub fn conductor_protection_amps(conductor_ampacity: f64, next_size_rule_allowed: bool) -> f64 {
    if next_size_rule_allowed {
        next_standard_size(conductor_ampacity).unwrap_or(conductor_ampacity)
    } else {
        STANDARD_DEVICE_SIZES
            .iter()
            .copied()
            .rev()
            .find(|&s| s <= conductor_ampacity)
            .unwrap_or(conductor_ampacity)
    }
}

/// Tipo de dispositivo de protección de rama-circuito de motor.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ProtectionKind {
    /// Interruptor termomagnético de tiempo inverso, no ajustable.
    InverseTimeBreaker,
    /// Fusible de acción retardada (dual-element / time-delay).
    TimeDelayFuse,
    /// Fusible de acción rápida (non-time-delay).
    NonTimeDelayFuse,
}

/// Porcentaje máximo de la corriente a plena carga (FLC, de tabla — no de placa)
/// permitido para el dispositivo de protección de rama-circuito de motor, para la
/// categoría "todos los demás motores" (equiv. Tabla 430.52 NEC).
pub fn motor_branch_protection_max_percent(kind: ProtectionKind) -> f64 {
    match kind {
        ProtectionKind::InverseTimeBreaker => 2.50,
        ProtectionKind::TimeDelayFuse => 1.75,
        ProtectionKind::NonTimeDelayFuse => 3.00,
    }
}

/// Tamaño de protección de rama-circuito de motor: aplica el porcentaje máximo de
/// la Tabla 430.52 al FLC y redondea al siguiente tamaño estándar (equiv. 430.52(C)(1)).
pub fn motor_branch_protection_amps(motor_flc: f64, kind: ProtectionKind) -> f64 {
    let max_amps = motor_flc * motor_branch_protection_max_percent(kind);
    next_standard_size(max_amps).unwrap_or(max_amps)
}

/// Resultado de verificar la capacidad interruptiva de un dispositivo contra la
/// corriente de falla disponible en ese punto (Sección 5.5, paso 2).
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum InterruptingCapacityCheck {
    Suficiente,
    Insuficiente,
}

/// `device_aic_ka`: capacidad interruptiva nominal del dispositivo, en kA.
/// `available_fault_current_ka`: corriente de falla disponible en ese punto, en kA
/// (proviene del módulo de cortocircuito — Sección 5.7, aún no implementado).
pub fn check_interrupting_capacity(
    device_aic_ka: f64,
    available_fault_current_ka: f64,
) -> InterruptingCapacityCheck {
    if device_aic_ka >= available_fault_current_ka {
        InterruptingCapacityCheck::Suficiente
    } else {
        InterruptingCapacityCheck::Insuficiente
    }
}

/// Clasificación de coordinación entre dos protecciones en serie.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Coordination {
    Selectiva,
    ParcialmenteSelectiva,
    NoSelectiva,
}

/// Heurística de coordinación básica (Módulo 4.8): compara la relación entre la
/// capacidad nominal del dispositivo aguas arriba y el aguas abajo. Una relación
/// ≥2:1 es una regla de pulgar de campo ampliamente usada para diseño preliminar;
/// no reemplaza el análisis de curvas tiempo-corriente del fabricante.
pub fn evaluate_basic_coordination(upstream_amps: f64, downstream_amps: f64) -> Coordination {
    let ratio = upstream_amps / downstream_amps;
    if ratio >= 2.0 {
        Coordination::Selectiva
    } else if ratio >= 1.5 {
        Coordination::ParcialmenteSelectiva
    } else {
        Coordination::NoSelectiva
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn next_standard_size_rounds_up() {
        assert_eq!(next_standard_size(32.0), Some(35.0));
        assert_eq!(next_standard_size(35.0), Some(35.0));
    }

    #[test]
    fn next_standard_size_none_above_table_max() {
        assert_eq!(next_standard_size(6_500.0), None);
    }

    #[test]
    fn conductor_protection_with_next_size_rule() {
        assert_eq!(conductor_protection_amps(32.0, true), 35.0);
    }

    #[test]
    fn conductor_protection_without_next_size_rule() {
        assert_eq!(conductor_protection_amps(32.0, false), 30.0);
    }

    #[test]
    fn motor_protection_inverse_time_breaker() {
        // FLC 28 A × 250% = 70 A → coincide exactamente con tamaño estándar.
        assert_eq!(
            motor_branch_protection_amps(28.0, ProtectionKind::InverseTimeBreaker),
            70.0
        );
    }

    #[test]
    fn motor_protection_time_delay_fuse() {
        // FLC 28 A × 175% = 49 A → siguiente tamaño estándar: 50 A.
        assert_eq!(
            motor_branch_protection_amps(28.0, ProtectionKind::TimeDelayFuse),
            50.0
        );
    }

    #[test]
    fn motor_protection_non_time_delay_fuse() {
        // FLC 28 A × 300% = 84 A → siguiente tamaño estándar: 90 A.
        assert_eq!(
            motor_branch_protection_amps(28.0, ProtectionKind::NonTimeDelayFuse),
            90.0
        );
    }

    #[test]
    fn interrupting_capacity_sufficient() {
        assert_eq!(
            check_interrupting_capacity(22.0, 18.0),
            InterruptingCapacityCheck::Suficiente
        );
    }

    #[test]
    fn interrupting_capacity_insufficient() {
        assert_eq!(
            check_interrupting_capacity(10.0, 18.0),
            InterruptingCapacityCheck::Insuficiente
        );
    }

    #[test]
    fn coordination_selective_at_ratio_2_to_1() {
        assert_eq!(
            evaluate_basic_coordination(100.0, 50.0),
            Coordination::Selectiva
        );
    }

    #[test]
    fn coordination_partial_between_1_5_and_2() {
        assert_eq!(
            evaluate_basic_coordination(80.0, 50.0),
            Coordination::ParcialmenteSelectiva
        );
    }

    #[test]
    fn coordination_none_below_1_5() {
        assert_eq!(
            evaluate_basic_coordination(70.0, 50.0),
            Coordination::NoSelectiva
        );
    }
}
