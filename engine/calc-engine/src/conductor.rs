//! Módulos 4.4–4.6: corriente de diseño, ampacidad, correcciones y selección de
//! conductor.
//!
//! **Origen de los datos tabulares:** los valores de ampacidad base y de los factores
//! de corrección son los valores estándar de la Tabla 310.16 / 310.15(B)(2)(a) /
//! 310.15(C)(1) del NEC, que la NOM-001-SEDE-2018 y Ugly's Electrical Reference
//! replican con la misma estructura. Deben validarse línea por línea contra
//! `docs/referencias/NOM-001-SEDE-2018.pdf` antes de usarse en un proyecto real —
//! ver el aviso completo en `lib.rs`.

use crate::common::Phases;

/// Temperatura nominal del aislamiento del conductor.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum InsulationRating {
    C60,
    C75,
    C90,
}

/// Un calibre de conductor de cobre con su ampacidad base (no corregida, ≤3
/// conductores portadores de corriente, 30 °C ambiente) en las tres columnas de
/// temperatura, y su área en circular mils (para caída de tensión).
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct ConductorSize {
    pub name: &'static str,
    pub circular_mils: f64,
    pub ampacity_60c: f64,
    pub ampacity_75c: f64,
    pub ampacity_90c: f64,
}

impl ConductorSize {
    pub fn base_ampacity(&self, rating: InsulationRating) -> f64 {
        match rating {
            InsulationRating::C60 => self.ampacity_60c,
            InsulationRating::C75 => self.ampacity_75c,
            InsulationRating::C90 => self.ampacity_90c,
        }
    }
}

/// Tabla de conductores de cobre, calibres 14 AWG a 500 kcmil, en orden ascendente
/// de ampacidad. Fuente: NEC Table 310.16 (cobre, ≤3 conductores, 30 °C ambiente).
pub const COPPER_CONDUCTORS: &[ConductorSize] = &[
    ConductorSize { name: "14 AWG", circular_mils: 4_110.0, ampacity_60c: 15.0, ampacity_75c: 20.0, ampacity_90c: 25.0 },
    ConductorSize { name: "12 AWG", circular_mils: 6_530.0, ampacity_60c: 20.0, ampacity_75c: 25.0, ampacity_90c: 30.0 },
    ConductorSize { name: "10 AWG", circular_mils: 10_380.0, ampacity_60c: 30.0, ampacity_75c: 35.0, ampacity_90c: 40.0 },
    ConductorSize { name: "8 AWG", circular_mils: 16_510.0, ampacity_60c: 40.0, ampacity_75c: 50.0, ampacity_90c: 55.0 },
    ConductorSize { name: "6 AWG", circular_mils: 26_240.0, ampacity_60c: 55.0, ampacity_75c: 65.0, ampacity_90c: 75.0 },
    ConductorSize { name: "4 AWG", circular_mils: 41_740.0, ampacity_60c: 70.0, ampacity_75c: 85.0, ampacity_90c: 95.0 },
    ConductorSize { name: "3 AWG", circular_mils: 52_620.0, ampacity_60c: 85.0, ampacity_75c: 100.0, ampacity_90c: 110.0 },
    ConductorSize { name: "2 AWG", circular_mils: 66_360.0, ampacity_60c: 95.0, ampacity_75c: 115.0, ampacity_90c: 130.0 },
    ConductorSize { name: "1 AWG", circular_mils: 83_690.0, ampacity_60c: 110.0, ampacity_75c: 130.0, ampacity_90c: 145.0 },
    ConductorSize { name: "1/0 AWG", circular_mils: 105_600.0, ampacity_60c: 125.0, ampacity_75c: 150.0, ampacity_90c: 170.0 },
    ConductorSize { name: "2/0 AWG", circular_mils: 133_100.0, ampacity_60c: 145.0, ampacity_75c: 175.0, ampacity_90c: 195.0 },
    ConductorSize { name: "3/0 AWG", circular_mils: 167_800.0, ampacity_60c: 165.0, ampacity_75c: 200.0, ampacity_90c: 225.0 },
    ConductorSize { name: "4/0 AWG", circular_mils: 211_600.0, ampacity_60c: 195.0, ampacity_75c: 230.0, ampacity_90c: 260.0 },
    ConductorSize { name: "250 kcmil", circular_mils: 250_000.0, ampacity_60c: 215.0, ampacity_75c: 255.0, ampacity_90c: 290.0 },
    ConductorSize { name: "300 kcmil", circular_mils: 300_000.0, ampacity_60c: 240.0, ampacity_75c: 285.0, ampacity_90c: 320.0 },
    ConductorSize { name: "350 kcmil", circular_mils: 350_000.0, ampacity_60c: 260.0, ampacity_75c: 310.0, ampacity_90c: 350.0 },
    ConductorSize { name: "400 kcmil", circular_mils: 400_000.0, ampacity_60c: 280.0, ampacity_75c: 335.0, ampacity_90c: 380.0 },
    ConductorSize { name: "500 kcmil", circular_mils: 500_000.0, ampacity_60c: 320.0, ampacity_75c: 380.0, ampacity_90c: 430.0 },
];

/// Corriente de diseño de un circuito (Módulo 4.4), sin el 125% de carga continua.
pub fn design_current_amps(power_va: f64, voltage: f64, phases: Phases) -> f64 {
    match phases {
        Phases::Single => power_va / voltage,
        Phases::Three => power_va / (voltage * 3f64.sqrt()),
    }
}

/// Aplica el 125% requerido para cargas continuas a la corriente de diseño.
pub fn continuous_load_adjusted_current(design_current: f64, is_continuous: bool) -> f64 {
    if is_continuous {
        design_current * 1.25
    } else {
        design_current
    }
}

/// Factor de corrección por temperatura ambiente (Módulo 4.6).
/// Fuente: NEC Table 310.15(B)(2)(a) (base: 30 °C ambiente = 1.00).
/// Retorna `None` si la temperatura está fuera de tabla, o si el aislamiento
/// indicado no está definido a esa temperatura (p. ej. 60 °C por encima de 60 °C).
pub fn ambient_correction_factor(ambient_c: f64, rating: InsulationRating) -> Option<f64> {
    const NA: f64 = f64::NAN;
    // (min, max, factor_60c, factor_75c, factor_90c)
    const TABLE: &[(f64, f64, f64, f64, f64)] = &[
        (10.0, 15.0, 1.29, 1.20, 1.15),
        (16.0, 20.0, 1.22, 1.15, 1.12),
        (21.0, 25.0, 1.15, 1.11, 1.08),
        (26.0, 30.0, 1.00, 1.00, 1.00),
        (31.0, 35.0, 0.91, 0.94, 0.96),
        (36.0, 40.0, 0.82, 0.88, 0.91),
        (41.0, 45.0, 0.71, 0.82, 0.87),
        (46.0, 50.0, 0.58, 0.75, 0.82),
        (51.0, 55.0, 0.41, 0.67, 0.76),
        (56.0, 60.0, NA, 0.58, 0.71),
        (61.0, 65.0, NA, 0.47, 0.65),
        (66.0, 70.0, NA, 0.33, 0.58),
        (71.0, 75.0, NA, NA, 0.50),
        (76.0, 80.0, NA, NA, 0.41),
        (81.0, 85.0, NA, NA, 0.29),
    ];

    let row = TABLE
        .iter()
        .find(|(min, max, ..)| ambient_c >= *min && ambient_c <= *max)?;
    let factor = match rating {
        InsulationRating::C60 => row.2,
        InsulationRating::C75 => row.3,
        InsulationRating::C90 => row.4,
    };
    if factor.is_nan() {
        None
    } else {
        Some(factor)
    }
}

/// Factor de ajuste por agrupamiento: más de 3 conductores portadores de corriente
/// en la misma canalización o cable. Fuente: NEC Table 310.15(C)(1).
pub fn adjustment_factor(current_carrying_conductors: u32) -> f64 {
    match current_carrying_conductors {
        0..=3 => 1.00,
        4..=6 => 0.80,
        7..=9 => 0.70,
        10..=20 => 0.50,
        21..=30 => 0.45,
        31..=40 => 0.40,
        _ => 0.35,
    }
}

/// Fórmula núcleo del motor de cálculo (Sección 5.3 del plan maestro):
/// `I corregida = I tabla × F temperatura × F agrupamiento × F otros`.
pub fn corrected_ampacity(
    base_ampacity: f64,
    temperature_factor: f64,
    grouping_factor: f64,
    other_factors: f64,
) -> f64 {
    base_ampacity * temperature_factor * grouping_factor * other_factors
}

#[derive(Debug, Clone, PartialEq)]
pub enum ConductorError {
    /// Ningún calibre en la tabla alcanza la ampacidad corregida requerida.
    NoConductorMeetsAmpacity { required_amps: f64 },
    /// La temperatura ambiente no está definida en la tabla para ese aislamiento.
    AmbientOutOfTableRange { ambient_c: f64 },
}

#[derive(Debug, Clone, PartialEq)]
pub struct ConductorSelection {
    pub conductor: ConductorSize,
    pub rating: InsulationRating,
    pub base_ampacity: f64,
    pub temperature_factor: f64,
    pub grouping_factor: f64,
    pub corrected_ampacity: f64,
}

/// Selecciona el calibre de cobre más económico (el primero en orden ascendente)
/// cuya ampacidad corregida cumple o supera `required_amps` (Módulo 4.5).
///
/// No evalúa caída de tensión — combínese con [`crate::voltage_drop`] para verificar
/// ese segundo criterio y, si no se cumple, subir de calibre (Sección 5.4).
pub fn select_conductor_by_ampacity(
    required_amps: f64,
    rating: InsulationRating,
    ambient_c: f64,
    current_carrying_conductors: u32,
) -> Result<ConductorSelection, ConductorError> {
    let temperature_factor = ambient_correction_factor(ambient_c, rating)
        .ok_or(ConductorError::AmbientOutOfTableRange { ambient_c })?;
    let grouping_factor = adjustment_factor(current_carrying_conductors);

    COPPER_CONDUCTORS
        .iter()
        .find_map(|c| {
            let base = c.base_ampacity(rating);
            let corrected = corrected_ampacity(base, temperature_factor, grouping_factor, 1.0);
            (corrected >= required_amps).then_some(ConductorSelection {
                conductor: *c,
                rating,
                base_ampacity: base,
                temperature_factor,
                grouping_factor,
                corrected_ampacity: corrected,
            })
        })
        .ok_or(ConductorError::NoConductorMeetsAmpacity { required_amps })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn design_current_single_phase() {
        // 3,600 VA / 120 V = 30 A
        assert_eq!(design_current_amps(3_600.0, 120.0, Phases::Single), 30.0);
    }

    #[test]
    fn design_current_three_phase() {
        // 74,000 VA a 480 V trifásico ≈ 89.008 A
        let current = design_current_amps(74_000.0, 480.0, Phases::Three);
        assert!((current - 89.008).abs() < 0.01, "got {current}");
    }

    #[test]
    fn continuous_load_adds_125_percent() {
        assert_eq!(continuous_load_adjusted_current(20.0, true), 25.0);
        assert_eq!(continuous_load_adjusted_current(20.0, false), 20.0);
    }

    #[test]
    fn ambient_correction_base_range_is_unity() {
        assert_eq!(ambient_correction_factor(28.0, InsulationRating::C75), Some(1.00));
    }

    #[test]
    fn ambient_correction_out_of_range_is_none() {
        assert_eq!(ambient_correction_factor(95.0, InsulationRating::C90), None);
        // 60°C no está definido por encima de 60°C ambiente.
        assert_eq!(ambient_correction_factor(62.0, InsulationRating::C60), None);
    }

    #[test]
    fn adjustment_factor_matches_table_310_15_c1() {
        assert_eq!(adjustment_factor(3), 1.00);
        assert_eq!(adjustment_factor(5), 0.80);
        assert_eq!(adjustment_factor(9), 0.70);
        assert_eq!(adjustment_factor(15), 0.50);
        assert_eq!(adjustment_factor(45), 0.35);
    }

    #[test]
    fn select_conductor_picks_smallest_that_meets_ampacity() {
        // 28 A requeridos, 75°C, 30°C ambiente, ≤3 conductores → 10 AWG (35 A) cubre;
        // 8 AWG (50 A) también cubre, pero 10 AWG es el más económico que cumple.
        let selection =
            select_conductor_by_ampacity(28.0, InsulationRating::C75, 28.0, 3).unwrap();
        assert_eq!(selection.conductor.name, "10 AWG");
        assert_eq!(selection.corrected_ampacity, 35.0);
    }

    #[test]
    fn select_conductor_applies_grouping_derate() {
        // Mismos 28 A requeridos, pero con 10 conductores agrupados (factor 0.50):
        // 10 AWG corregido = 35 × 0.50 = 17.5 A (no alcanza) → debe subir de calibre.
        let selection =
            select_conductor_by_ampacity(28.0, InsulationRating::C75, 28.0, 10).unwrap();
        assert_ne!(selection.conductor.name, "10 AWG");
        assert!(selection.corrected_ampacity >= 28.0);
    }

    #[test]
    fn select_conductor_errors_when_ambient_out_of_table() {
        let err = select_conductor_by_ampacity(28.0, InsulationRating::C60, 95.0, 3).unwrap_err();
        assert_eq!(err, ConductorError::AmbientOutOfTableRange { ambient_c: 95.0 });
    }

    #[test]
    fn select_conductor_errors_when_nothing_in_table_is_enough() {
        let err = select_conductor_by_ampacity(10_000.0, InsulationRating::C90, 28.0, 3).unwrap_err();
        assert_eq!(err, ConductorError::NoConductorMeetsAmpacity { required_amps: 10_000.0 });
    }
}
