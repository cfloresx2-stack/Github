//! # calc-engine-wasm
//!
//! Bindings de WebAssembly para `calc-engine` y `compliance-engine`, verificando la
//! premisa arquitectónica de la Sección 3.3 del plan maestro: **un único núcleo Rust
//! reutilizado en Web** (las otras dos formas de reutilización — servicio nativo y
//! FFI para Swift — no se implementan en este crate).
//!
//! Expone un subconjunto curado de funciones, suficiente para demostrar el pipeline
//! completo (carga → conductor → cumplimiento) desde JavaScript, no la API completa
//! de ambos motores. `calc-engine` y `compliance-engine` en sí mismos no tienen
//! ninguna dependencia de `wasm-bindgen` — todo el acoplamiento a WASM vive aquí,
//! para que ambos motores sigan siendo reutilizables tal cual en el backend nativo y
//! en los bindings de Swift sin arrastrar dependencias de JS.
//!
//! Los resultados estructurados (selección de conductor, hallazgo de cumplimiento)
//! se devuelven como JSON armado a mano (sin `serde`, para no añadir una dependencia
//! solo por esto) — un contrato JSON real para el servicio de proyectos (Sección
//! 3.3) debe diseñarse aparte; esto es una prueba de que el motor funciona en Web,
//! no la API definitiva.

use calc_engine::{
    COPPER_CONDUCTORS, ConductorError, InsulationRating, K_COPPER, Phases,
    select_conductor_by_ampacity, voltage_drop_percent as calc_voltage_drop_percent,
};
use wasm_bindgen::prelude::*;

fn phases_from_bool(three_phase: bool) -> Phases {
    if three_phase {
        Phases::Three
    } else {
        Phases::Single
    }
}

fn insulation_from_str(rating: &str) -> Result<InsulationRating, JsValue> {
    match rating {
        "60" => Ok(InsulationRating::C60),
        "75" => Ok(InsulationRating::C75),
        "90" => Ok(InsulationRating::C90),
        other => Err(JsValue::from_str(&format!(
            "aislamiento inválido: \"{other}\" (use \"60\", \"75\" o \"90\")"
        ))),
    }
}

/// Módulo 4.4: corriente de diseño.
#[wasm_bindgen]
pub fn design_current_amps(power_va: f64, voltage: f64, three_phase: bool) -> f64 {
    calc_engine::design_current_amps(power_va, voltage, phases_from_bool(three_phase))
}

/// Aplica el 125% de carga continua a una corriente de diseño ya calculada.
#[wasm_bindgen]
pub fn continuous_load_adjusted_current(design_current: f64, is_continuous: bool) -> f64 {
    calc_engine::continuous_load_adjusted_current(design_current, is_continuous)
}

/// Módulos 4.5–4.6: selección de conductor. Retorna un objeto JSON:
/// `{"conductor","base_ampacity","temperature_factor","grouping_factor","corrected_ampacity"}`.
#[wasm_bindgen]
pub fn select_conductor(
    required_amps: f64,
    insulation_rating: &str,
    ambient_c: f64,
    current_carrying_conductors: u32,
) -> Result<String, JsValue> {
    let rating = insulation_from_str(insulation_rating)?;
    let selection = select_conductor_by_ampacity(
        required_amps,
        rating,
        ambient_c,
        current_carrying_conductors,
    )
    .map_err(|err| {
        JsValue::from_str(&match err {
            ConductorError::NoConductorMeetsAmpacity { required_amps } => {
                format!("ningún calibre de la tabla alcanza {required_amps:.2} A corregidos")
            }
            ConductorError::AmbientOutOfTableRange { ambient_c } => {
                format!("{ambient_c} °C está fuera del rango de la tabla de corrección")
            }
        })
    })?;
    Ok(format!(
        r#"{{"conductor":"{}","base_ampacity":{},"temperature_factor":{},"grouping_factor":{},"corrected_ampacity":{}}}"#,
        selection.conductor.name,
        selection.base_ampacity,
        selection.temperature_factor,
        selection.grouping_factor,
        selection.corrected_ampacity
    ))
}

/// Caída de tensión (cobre) para un calibre ya seleccionado por [`select_conductor`].
#[wasm_bindgen]
pub fn voltage_drop_percent(
    current_amps: f64,
    one_way_length_m: f64,
    conductor_name: &str,
    three_phase: bool,
    nominal_voltage: f64,
) -> Result<f64, JsValue> {
    let conductor = COPPER_CONDUCTORS
        .iter()
        .find(|c| c.name == conductor_name)
        .ok_or_else(|| {
            JsValue::from_str(&format!("calibre no reconocido: \"{conductor_name}\""))
        })?;
    Ok(calc_voltage_drop_percent(
        current_amps,
        one_way_length_m,
        conductor,
        K_COPPER,
        phases_from_bool(three_phase),
        nominal_voltage,
    ))
}

/// Sección 6: evalúa la regla de caída de tensión y retorna el hallazgo como JSON:
/// `{"rule_id","status","norm_reference","observation"}`.
#[wasm_bindgen]
pub fn evaluate_voltage_drop(
    circuit_name: &str,
    is_feeder: bool,
    voltage_drop_percent: f64,
) -> String {
    let finding =
        compliance_engine::evaluate_voltage_drop(circuit_name, is_feeder, voltage_drop_percent);
    format!(
        r#"{{"rule_id":"{}","status":"{:?}","norm_reference":"{}","observation":"{}"}}"#,
        finding.rule_id,
        finding.status,
        finding.norm_reference.code.replace('"', "'"),
        finding.observation.replace('"', "'")
    )
}
