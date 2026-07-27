//! # calc-engine
//!
//! Motor de cálculo eléctrico determinístico de **ElectraNOM** (Sección 5 del plan
//! maestro: `docs/PLAN_MAESTRO_PLATAFORMA_ELECTRICA.md`).
//!
//! ## Alcance implementado
//! - Carga instalada, demanda y factor de carga (módulo [`load`]).
//! - Corriente de diseño, ampacidad, correcciones por temperatura/agrupamiento y
//!   selección de conductor (módulo [`conductor`]).
//! - Caída de tensión (módulo [`voltage_drop`]).
//! - Dimensionamiento de conductor para grupos de motores (módulo [`motor`]).
//!
//! - Selección de protección de conductor y de motor, verificación de capacidad
//!   interruptiva y heurística de coordinación básica (módulo [`protection`]).
//!
//! ## Pendiente (ver Secciones 5 y 11 del plan maestro)
//! Canalizaciones/llenado de ductos, transformadores, cortocircuito (el módulo de
//! protecciones ya acepta la corriente de falla como parámetro, pero aún no hay un
//! motor que la calcule), puesta a tierra, factor de potencia/capacitores.
//!
//! ## ⚠️ Origen de los datos tabulares — requiere validación de un ingeniero
//! Las tablas de ampacidad y los factores de corrección usados aquí son los valores
//! **estándar de la Tabla 310.16 / 310.15(B)(2)(a) / 310.15(C)(1) del NEC**, que la
//! NOM-001-SEDE-2018 y Ugly's Electrical Reference replican con la misma estructura.
//!
//! La extracción automática de texto de `docs/referencias/NOM-001-SEDE-2018.pdf`
//! (1,171 páginas) y de `docs/referencias/Uglys_compressed.pdf` no produjo tablas
//! confiables (las columnas numéricas salen desalineadas por el tipo de escaneo), así
//! que las cifras de este módulo **no provienen de un parseo automático de esos PDF**,
//! sino de la tabla estándar NEC/NOM ampliamente conocida.
//!
//! **Antes de usar este motor en un proyecto real, un ingeniero eléctrico responsable
//! debe validar estos valores línea por línea contra el PDF oficial de la
//! NOM-001-SEDE-2018.** Ver también la Sección 16.5 del plan maestro (estrategia de
//! pruebas: banco de casos de referencia + revisión técnica humana obligatoria antes
//! de cada release del catálogo normativo).

pub mod common;
pub mod conductor;
pub mod load;
pub mod motor;
pub mod protection;
pub mod voltage_drop;

pub use common::Phases;
pub use conductor::{
    adjustment_factor, ambient_correction_factor, continuous_load_adjusted_current,
    corrected_ampacity, design_current_amps, select_conductor_by_ampacity, ConductorError,
    ConductorSelection, ConductorSize, InsulationRating, COPPER_CONDUCTORS,
};
pub use load::{
    demand_load_va, installed_load_by_category, installed_load_va, load_factor, Load,
    LoadCategory,
};
pub use motor::motor_group_conductor_ampacity;
pub use protection::{
    check_interrupting_capacity, conductor_protection_amps, evaluate_basic_coordination,
    motor_branch_protection_amps, motor_branch_protection_max_percent, next_standard_size,
    Coordination, InterruptingCapacityCheck, ProtectionKind, STANDARD_DEVICE_SIZES,
};
pub use voltage_drop::{voltage_drop_percent, voltage_drop_volts, K_ALUMINUM, K_COPPER};
