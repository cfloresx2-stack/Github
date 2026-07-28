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
//! ## ✅ Origen de los datos tabulares — validado contra la NOM-001-SEDE-2018 oficial
//! Las tablas numéricas de este motor (`conductor::COPPER_CONDUCTORS`,
//! `conductor::ambient_correction_factor`, `conductor::adjustment_factor`,
//! `grounding::equipment_grounding_conductor_awg`,
//! `protection::motor_branch_protection_max_percent`,
//! `protection::STANDARD_DEVICE_SIZES`, `conduit::max_fill_percent`) se compararon
//! línea por línea contra el texto de `docs/referencias/NOM-001-SEDE-2018.pdf`
//! (extracción de texto directa — a diferencia de `docs/referencias/Uglys_compressed.pdf`,
//! que es un escaneo y no produce texto confiable). Revisión hecha por César Flores,
//! ingeniero responsable del proyecto.
//!
//! **Resultado:** de más de 150 valores comparados, se encontró y corrigió **un**
//! error (`COPPER_CONDUCTORS`, 3 AWG a 90 °C: era 110 A, la tabla oficial dice 115 A
//! — Tabla 310-15(b)(16)). El resto coincide exactamente. El detalle de qué se
//! validó contra qué tabla vive en el comentario de cabecera de cada módulo.
//!
//! **Lo que aún NO está validado contra la NOM:** las referencias de artículo
//! citadas por `compliance-engine` (siguen usando notación NEC con puntos, p. ej.
//! "215.2(A)", cuando la NOM usa notación con guion, p. ej. "215-2" — confirmado al
//! hacer esta revisión) y las fórmulas generales de ingeniería que no provienen de
//! una tabla específica (constantes K de caída de tensión, método por unidad de
//! cortocircuito, fórmula de Dwight para resistencia de electrodo).

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
