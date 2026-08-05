//! Sección 5.7: cálculo de cortocircuito por el método por unidad — falla trifásica
//! simétrica en un **sistema radial de una sola fuente** (fuente → transformador →
//! alimentador → punto de falla), que cubre el caso típico del MVP (Sección 10: un
//! tablero principal con tableros derivados).
//!
//! ## Alcance y limitaciones (explícitas)
//! - **Solo topología radial en serie.** No resuelve redes en malla ni múltiples
//!   fuentes en paralelo — eso requiere reducción de red / equivalente de Thevenin
//!   sobre un grafo (ver Sección 11, Fase 3 del plan maestro).
//! - **Solo magnitud de falla trifásica simétrica** (impedancias sumadas por
//!   magnitud, sin ángulo X/R). Mismo nivel de aproximación que `voltage_drop` y
//!   `protection::evaluate_basic_coordination` en este motor.
//! - **No calcula falla línea-tierra** (requiere impedancias de secuencia
//!   Z0/Z1/Z2, no implementado).
//! - La impedancia de la fuente (red de utilidad aguas arriba del transformador) se
//!   recibe como parámetro `source_impedance_pu`; si no se cuenta con el nivel de
//!   falla de la red, usar `0.0` es una aproximación conservadora *a favor de la
//!   corriente de falla* (la sobreestima), nunca en contra — no usar `0.0` para
//!   subdimensionar capacidad interruptiva.

use crate::conductor::ConductorSize;

const METERS_TO_FEET: f64 = 3.280839895;

/// Base de por unidad para un nivel de tensión del sistema (Sección 5.7, paso 1).
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct PerUnitBase {
    /// Potencia base, en VA (p. ej. 10 MVA = 10e6).
    pub power_va: f64,
    /// Tensión base de línea, en V, para el nivel de tensión evaluado.
    pub voltage_v: f64,
}

impl PerUnitBase {
    pub fn new(power_va: f64, voltage_v: f64) -> Self {
        Self {
            power_va,
            voltage_v,
        }
    }

    /// Corriente base trifásica, en amperes.
    pub fn base_current_amps(&self) -> f64 {
        self.power_va / (self.voltage_v * 3f64.sqrt())
    }

    /// Impedancia base, en ohms.
    pub fn base_impedance_ohms(&self) -> f64 {
        self.voltage_v.powi(2) / self.power_va
    }
}

/// Convierte la impedancia de placa de un transformador (%Z, sobre su propia base de
/// potencia y tensión) a por unidad sobre la base común del sistema (Sección 5.7,
/// paso 2). `nameplate_z_percent` es el %Z de placa (p. ej. `5.75` para 5.75%).
pub fn transformer_impedance_pu(
    nameplate_z_percent: f64,
    transformer_power_va: f64,
    transformer_voltage_v: f64,
    system_base: PerUnitBase,
) -> f64 {
    let z_pu_own_base = nameplate_z_percent / 100.0;
    z_pu_own_base
        * (system_base.power_va / transformer_power_va)
        * (transformer_voltage_v / system_base.voltage_v).powi(2)
}

/// Resistencia aproximada de un conductor (una vía), en ohms, usando la misma
/// constante de resistividad K (Ω·cmil/ft) que `voltage_drop` — ver ese módulo para
/// las limitaciones de esta aproximación (no considera reactancia inductiva, por lo
/// que subestima ligeramente la impedancia real de conductores de calibre grande).
pub fn conductor_resistance_ohms(
    conductor: &ConductorSize,
    length_m: f64,
    k_ohm_cmil_per_ft: f64,
) -> f64 {
    let length_ft = length_m * METERS_TO_FEET;
    k_ohm_cmil_per_ft * length_ft / conductor.circular_mils
}

/// Convierte una impedancia en ohms (real) a por unidad sobre la base del sistema.
pub fn conductor_impedance_pu(impedance_ohms: f64, system_base: PerUnitBase) -> f64 {
    impedance_ohms / system_base.base_impedance_ohms()
}

/// Suma en serie las impedancias en por unidad de un sistema radial simple: fuente +
/// transformador + alimentador (Sección 5.7, paso 3).
pub fn radial_system_impedance_pu(
    source_impedance_pu: f64,
    transformer_impedance_pu: f64,
    feeder_impedance_pu: f64,
) -> f64 {
    source_impedance_pu + transformer_impedance_pu + feeder_impedance_pu
}

/// Corriente de cortocircuito trifásica simétrica en un nodo (Sección 5.7, paso 4),
/// dada la impedancia total en por unidad entre la fuente y el punto de falla.
/// Asume tensión de prefalla = 1.0 pu (aproximación estándar para estudios de
/// cortocircuito de planeación).
pub fn three_phase_fault_current_amps(total_impedance_pu: f64, system_base: PerUnitBase) -> f64 {
    let fault_current_pu = 1.0 / total_impedance_pu;
    fault_current_pu * system_base.base_current_amps()
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::conductor::COPPER_CONDUCTORS;
    use crate::voltage_drop::K_COPPER;

    #[test]
    fn base_current_and_impedance() {
        let base = PerUnitBase::new(1_000_000.0, 480.0); // 1 MVA, 480 V
        assert!((base.base_current_amps() - 1_202.8).abs() < 1.0);
        assert!((base.base_impedance_ohms() - 0.2304).abs() < 1e-6);
    }

    #[test]
    fn transformer_impedance_pu_scales_with_base_power() {
        let system_base = PerUnitBase::new(10_000_000.0, 480.0);
        // Transformador 500 kVA, 5.75% Z, mismo nivel de tensión que la base (480 V).
        let z = transformer_impedance_pu(5.75, 500_000.0, 480.0, system_base);
        // 0.0575 × (10,000,000 / 500,000) × 1² = 0.0575 × 20 = 1.15
        assert!((z - 1.15).abs() < 1e-9);
    }

    #[test]
    fn conductor_impedance_pu_converts_correctly() {
        let system_base = PerUnitBase::new(10_000_000.0, 480.0); // Z_base = 0.02304 ohms
        let z_pu = conductor_impedance_pu(0.02304, system_base);
        assert!((z_pu - 1.0).abs() < 1e-9);
    }

    #[test]
    fn radial_system_impedance_sums_in_series() {
        assert_eq!(
            radial_system_impedance_pu(0.02, 1.15, 0.13),
            0.02 + 1.15 + 0.13
        );
    }

    #[test]
    fn per_unit_method_matches_direct_formula_for_transformer_only_fault() {
        let system_base = PerUnitBase::new(10_000_000.0, 480.0);
        let z_transformer_pu = transformer_impedance_pu(5.75, 500_000.0, 480.0, system_base);
        let i_fault_pu_method = three_phase_fault_current_amps(z_transformer_pu, system_base);

        // Fórmula directa de verificación cruzada (independiente del método por
        // unidad): I_falla = I_nominal_secundario / %Z.
        let rated_secondary_current = 500_000.0 / (480.0 * 3f64.sqrt());
        let i_fault_direct = rated_secondary_current / 0.0575;

        let relative_diff = (i_fault_pu_method - i_fault_direct).abs() / i_fault_direct;
        assert!(
            relative_diff < 0.001,
            "métodos no coinciden: pu={i_fault_pu_method}, directo={i_fault_direct}"
        );
    }

    #[test]
    fn adding_feeder_impedance_reduces_fault_current() {
        let system_base = PerUnitBase::new(10_000_000.0, 480.0);
        let z_transformer = transformer_impedance_pu(5.75, 500_000.0, 480.0, system_base);
        let fault_at_transformer_secondary =
            three_phase_fault_current_amps(z_transformer, system_base);

        let conductor = COPPER_CONDUCTORS
            .iter()
            .find(|c| c.name == "4/0 AWG")
            .unwrap();
        let feeder_ohms = conductor_resistance_ohms(conductor, 15.0, K_COPPER);
        let feeder_pu = conductor_impedance_pu(feeder_ohms, system_base);
        let z_total = radial_system_impedance_pu(0.0, z_transformer, feeder_pu);
        let fault_at_feeder_end = three_phase_fault_current_amps(z_total, system_base);

        assert!(fault_at_feeder_end < fault_at_transformer_secondary);
        // Debe seguir siendo del orden de varios kA a 15 m de un transformador de
        // 500 kVA, no despreciable.
        assert!(fault_at_feeder_end > 5_000.0, "got {fault_at_feeder_end}");
    }
}
