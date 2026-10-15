//! Sección 5.8 / Módulo 4.11: puesta a tierra.
//!
//! Cubre:
//! - Calibre del conductor de puesta a tierra de equipos, en función de la
//!   capacidad de la protección aguas arriba (**no** del calibre del conductor de
//!   fase). **✅ Validado línea por línea contra la Tabla 250-122 de la
//!   NOM-001-SEDE-2018 oficial** — coincide exactamente, sin errores (19 niveles).
//! - Resistencia de un electrodo vertical simple (fórmula de Dwight) — fórmula
//!   general de ingeniería, no proviene de una tabla específica de la NOM.
//!
//! **No implementado:** arreglos de electrodos múltiples en paralelo o mallas de
//! tierra. La resistencia combinada de electrodos múltiples depende de resistencia
//! mutua entre electrodos (separación, disposición geométrica) y requiere las
//! fórmulas de IEEE Std 80 / IEEE Std 142 — no se incluyen aquí porque el riesgo de
//! reproducir un factor de acoplamiento mutuo incorrecto de memoria es alto. Si un
//! solo electrodo no cumple la resistencia máxima de diseño, el siguiente paso
//! (agregar electrodos) debe resolverse con esas referencias, no con este módulo.

/// Calibre del conductor de puesta a tierra de equipos (cobre) en función de la
/// capacidad o ajuste del dispositivo de sobrecorriente aguas arriba (equiv. Tabla
/// 250.122 NEC). Retorna el calibre para el primer nivel de la tabla cuya capacidad
/// nominal sea ≥ `protection_amps`.
pub fn equipment_grounding_conductor_awg(protection_amps: f64) -> &'static str {
    const TABLE: &[(f64, &str)] = &[
        (15.0, "14 AWG"),
        (20.0, "12 AWG"),
        (60.0, "10 AWG"),
        (100.0, "8 AWG"),
        (200.0, "6 AWG"),
        (300.0, "4 AWG"),
        (400.0, "3 AWG"),
        (500.0, "2 AWG"),
        (600.0, "1 AWG"),
        (800.0, "1/0 AWG"),
        (1_000.0, "2/0 AWG"),
        (1_200.0, "3/0 AWG"),
        (1_600.0, "4/0 AWG"),
        (2_000.0, "250 kcmil"),
        (2_500.0, "350 kcmil"),
        (3_000.0, "400 kcmil"),
        (4_000.0, "500 kcmil"),
        (5_000.0, "700 kcmil"),
        (6_000.0, "800 kcmil"),
    ];
    TABLE
        .iter()
        .find(|(max_amps, _)| protection_amps <= *max_amps)
        .map(|(_, name)| *name)
        .unwrap_or("800 kcmil (fuera de tabla, verificar diseño especial)")
}

/// Resistencia a tierra de un electrodo vertical simple (fórmula de Dwight, también
/// reproducida en Ugly's Electrical Reference y en IEEE Std 142).
///
/// `soil_resistivity_ohm_m`: resistividad del terreno (ρ), en Ω·m.
/// `rod_length_m`: longitud enterrada del electrodo, en m.
/// `rod_diameter_m`: diámetro del electrodo, en m.
pub fn single_rod_resistance_ohms(
    soil_resistivity_ohm_m: f64,
    rod_length_m: f64,
    rod_diameter_m: f64,
) -> f64 {
    let term = (4.0 * rod_length_m / rod_diameter_m).ln() - 1.0;
    (soil_resistivity_ohm_m / (2.0 * std::f64::consts::PI * rod_length_m)) * term
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn equipment_grounding_conductor_matches_table_250_122() {
        assert_eq!(equipment_grounding_conductor_awg(15.0), "14 AWG");
        assert_eq!(equipment_grounding_conductor_awg(20.0), "12 AWG");
        assert_eq!(equipment_grounding_conductor_awg(100.0), "8 AWG");
        assert_eq!(equipment_grounding_conductor_awg(600.0), "1 AWG");
    }

    #[test]
    fn equipment_grounding_conductor_rounds_up_between_tiers() {
        // 150 A cae entre el nivel de 100 A y el de 200 A -> usa el de 200 A.
        assert_eq!(equipment_grounding_conductor_awg(150.0), "6 AWG");
    }

    #[test]
    fn single_rod_resistance_matches_known_ballpark() {
        // Varilla de cobre 3 m, 5/8" (0.015875 m) de diámetro, suelo de
        // resistividad moderada (100 Ω·m). Es sabido en campo que un solo
        // electrodo típicamente NO cumple el máximo de 25 Ω exigido por NOM/NEC
        // para un solo electrodo -- de ahí el requisito de electrodos adicionales.
        let r = single_rod_resistance_ohms(100.0, 3.0, 0.015875);
        assert!(
            r > 20.0 && r < 40.0,
            "resistencia fuera de rango esperado: {r} Ω"
        );
    }

    #[test]
    fn lower_resistivity_soil_reduces_resistance() {
        let high_resistivity = single_rod_resistance_ohms(300.0, 3.0, 0.015875);
        let low_resistivity = single_rod_resistance_ohms(50.0, 3.0, 0.015875);
        assert!(low_resistivity < high_resistivity);
    }

    #[test]
    fn longer_rod_reduces_resistance() {
        let short = single_rod_resistance_ohms(100.0, 2.4, 0.015875);
        let long = single_rod_resistance_ohms(100.0, 3.0, 0.015875);
        assert!(long < short);
    }
}
