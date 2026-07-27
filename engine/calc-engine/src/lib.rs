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
//! - Selección de protección de conductor y de motor, verificación de capacidad
//!   interruptiva y heurística de coordinación básica (módulo [`protection`]).
//! - Cortocircuito trifásico simétrico por el método por unidad, sistema radial de
//!   una sola fuente (módulo [`short_circuit`]).
//! - Calibre de conductor de puesta a tierra de equipos y resistencia de un
//!   electrodo vertical simple (módulo [`grounding`]).
//! - Regla de porcentaje de llenado de canalizaciones (módulo [`conduit`]).
//! - Corrección de factor de potencia / dimensionamiento de banco de capacitores
//!   (módulo [`power_factor`]).
//!
//! ## Pendiente / fuera de alcance de esta versión (documentado explícitamente en
//! cada módulo, no como pendiente silencioso)
//! - Tablas de área de conductor y de área interna de canalización por tipo
//!   (`conduit`) — decenas de filas por tabla, alto riesgo de reproducir un valor
//!   incorrecto de memoria; deben tomarse de la tabla oficial y pasarse como
//!   parámetro.
//! - Arreglos de electrodos múltiples / mallas de tierra (`grounding`) — requieren
//!   fórmulas de resistencia mutua (IEEE Std 80/142).
//! - Falla línea-tierra y topologías en malla/múltiples fuentes (`short_circuit`).
//! - Diagramas unifilares/trifilares, generación de memoria de cálculo, BOM,
//!   catálogo de materiales — son de la capa de servicios (Sección 3.3 del plan
//!   maestro), no de este motor de cálculo.
//!
//! ## ⚠️ Origen de los datos tabulares — requiere validación de un ingeniero
//! Las tablas de ampacidad y los factores de corrección usados aquí son los valores
//! **estándar de la Tabla 310.16 / 310.15(B)(2)(a) / 310.15(C)(1) del NEC**, y el
//! calibre de tierra de equipos es el de la Tabla 250.122 NEC, que la
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
pub mod conduit;
pub mod grounding;
pub mod load;
pub mod motor;
pub mod power_factor;
pub mod protection;
pub mod short_circuit;
pub mod voltage_drop;

pub use common::Phases;
pub use conductor::{
    COPPER_CONDUCTORS, ConductorError, ConductorSelection, ConductorSize, InsulationRating,
    adjustment_factor, ambient_correction_factor, continuous_load_adjusted_current,
    corrected_ampacity, design_current_amps, select_conductor_by_ampacity,
};
pub use conduit::{
    ConduitFillCheck, check_conduit_fill, max_fill_percent, usable_conduit_area_sq_in,
};
pub use grounding::{equipment_grounding_conductor_awg, single_rod_resistance_ohms};
pub use load::{
    Load, LoadCategory, demand_load_va, installed_load_by_category, installed_load_va, load_factor,
};
pub use motor::motor_group_conductor_ampacity;
pub use power_factor::required_capacitor_kvar;
pub use protection::{
    Coordination, InterruptingCapacityCheck, ProtectionKind, STANDARD_DEVICE_SIZES,
    check_interrupting_capacity, conductor_protection_amps, evaluate_basic_coordination,
    motor_branch_protection_amps, motor_branch_protection_max_percent, next_standard_size,
};
pub use short_circuit::{
    PerUnitBase, conductor_impedance_pu, conductor_resistance_ohms, radial_system_impedance_pu,
    three_phase_fault_current_amps, transformer_impedance_pu,
};
pub use voltage_drop::{K_ALUMINUM, K_COPPER, voltage_drop_percent, voltage_drop_volts};
