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
    ALUMINUM_CONDUCTORS, COPPER_CONDUCTORS, ConductorError, ConductorMaterial, ConduitSizeError,
    ConduitType, InsulationFamily, InsulationRating, K_ALUMINUM, K_COPPER, MOTOR_HP_LABELS,
    Phases, ProtectionKind, conductor_area_mm2 as calc_conductor_area_mm2,
    conductor_protection_amps, equipment_grounding_conductor_awg, motor_branch_circuit_ampacity,
    motor_branch_protection_amps, motor_full_load_current, select_conductor_by_ampacity,
    select_conduit_size, select_conduit_size_for_area,
    voltage_drop_percent as calc_voltage_drop_percent,
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

fn material_from_str(material: &str) -> Result<ConductorMaterial, JsValue> {
    match material {
        "copper" => Ok(ConductorMaterial::Copper),
        "aluminum" => Ok(ConductorMaterial::Aluminum),
        other => Err(JsValue::from_str(&format!(
            "material inválido: \"{other}\" (use \"copper\" o \"aluminum\")"
        ))),
    }
}

fn conductor_table(material: ConductorMaterial) -> &'static [calc_engine::ConductorSize] {
    match material {
        ConductorMaterial::Copper => COPPER_CONDUCTORS,
        ConductorMaterial::Aluminum => ALUMINUM_CONDUCTORS,
    }
}

fn k_for_material(material: ConductorMaterial) -> f64 {
    match material {
        ConductorMaterial::Copper => K_COPPER,
        ConductorMaterial::Aluminum => K_ALUMINUM,
    }
}

fn insulation_family_from_str(family: &str) -> Result<InsulationFamily, JsValue> {
    match family {
        "thhn" => Ok(InsulationFamily::Thhn),
        "thw" => Ok(InsulationFamily::Thw),
        "xhhw" => Ok(InsulationFamily::Xhhw),
        other => Err(JsValue::from_str(&format!(
            "familia de aislamiento inválida: \"{other}\" (use \"thhn\", \"thw\" o \"xhhw\")"
        ))),
    }
}

fn conduit_type_from_str(conduit_type: &str) -> Result<ConduitType, JsValue> {
    match conduit_type {
        "emt" => Ok(ConduitType::Emt),
        "pvc_sch40" => Ok(ConduitType::PvcSch40),
        "rmc" => Ok(ConduitType::Rmc),
        other => Err(JsValue::from_str(&format!(
            "tipo de tubería inválido: \"{other}\" (use \"emt\", \"pvc_sch40\" o \"rmc\")"
        ))),
    }
}

fn protection_kind_from_str(kind: &str) -> Result<ProtectionKind, JsValue> {
    match kind {
        "inverse_time_breaker" => Ok(ProtectionKind::InverseTimeBreaker),
        "time_delay_fuse" => Ok(ProtectionKind::TimeDelayFuse),
        "non_time_delay_fuse" => Ok(ProtectionKind::NonTimeDelayFuse),
        other => Err(JsValue::from_str(&format!(
            "tipo de protección inválido: \"{other}\" (use \"inverse_time_breaker\", \
             \"time_delay_fuse\" o \"non_time_delay_fuse\")"
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

/// Módulos 4.5–4.6: selección de conductor. `material` es `"copper"` o
/// `"aluminum"`. Retorna un objeto JSON:
/// `{"conductor","base_ampacity","temperature_factor","grouping_factor","corrected_ampacity"}`.
#[wasm_bindgen]
pub fn select_conductor(
    required_amps: f64,
    material: &str,
    insulation_rating: &str,
    ambient_c: f64,
    current_carrying_conductors: u32,
) -> Result<String, JsValue> {
    let material = material_from_str(material)?;
    let rating = insulation_from_str(insulation_rating)?;
    let selection = select_conductor_by_ampacity(
        required_amps,
        material,
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

/// Lista de calibres disponibles para el material dado (`"copper"` o
/// `"aluminum"`), en el mismo orden ascendente de la tabla (para poblar un selector
/// de calibre forzado en la UI). Retorna un JSON array de strings, p. ej.
/// `["14 AWG","12 AWG",...,"500 kcmil"]` (el cobre incluye 14 AWG; el aluminio
/// empieza en 12 AWG, igual que la tabla oficial).
#[wasm_bindgen]
pub fn conductor_names(material: &str) -> Result<String, JsValue> {
    let material = material_from_str(material)?;
    let names: Vec<String> = conductor_table(material)
        .iter()
        .map(|c| format!("\"{}\"", c.name))
        .collect();
    Ok(format!("[{}]", names.join(",")))
}

/// Igual que [`select_conductor`], pero para un calibre elegido por el usuario en
/// vez del mínimo que cumple ampacidad — cubre el caso de subir de calibre a
/// propósito para reducir la caída de tensión (Sección 5.4 del plan maestro), algo
/// que `select_conductor_by_ampacity` no evalúa por diseño. La ampacidad corregida
/// resultante puede terminar por debajo de la requerida si el calibre elegido es
/// insuficiente; eso se refleja en el JSON devuelto (y en el hallazgo de
/// `evaluate_conductor_ampacity`, no aquí).
#[wasm_bindgen]
pub fn conductor_ampacity_by_name(
    name: &str,
    material: &str,
    insulation_rating: &str,
    ambient_c: f64,
    current_carrying_conductors: u32,
) -> Result<String, JsValue> {
    let material = material_from_str(material)?;
    let rating = insulation_from_str(insulation_rating)?;
    let conductor = conductor_table(material)
        .iter()
        .find(|c| c.name == name)
        .ok_or_else(|| JsValue::from_str(&format!("calibre no reconocido: \"{name}\"")))?;
    let temperature_factor = calc_engine::ambient_correction_factor(ambient_c, rating)
        .ok_or_else(|| {
            JsValue::from_str(&format!(
                "{ambient_c} °C está fuera del rango de la tabla de corrección"
            ))
        })?;
    let grouping_factor = calc_engine::adjustment_factor(current_carrying_conductors);
    let base_ampacity = conductor.base_ampacity(rating);
    let corrected =
        calc_engine::corrected_ampacity(base_ampacity, temperature_factor, grouping_factor, 1.0);
    Ok(format!(
        r#"{{"conductor":"{}","base_ampacity":{},"temperature_factor":{},"grouping_factor":{},"corrected_ampacity":{}}}"#,
        conductor.name, base_ampacity, temperature_factor, grouping_factor, corrected
    ))
}

/// Caída de tensión para un calibre ya seleccionado por [`select_conductor`].
/// `material` es `"copper"` o `"aluminum"` -- determina la constante de
/// resistividad K (12.9 cobre, 21.2 aluminio, Ω·cmil/ft).
#[wasm_bindgen]
pub fn voltage_drop_percent(
    current_amps: f64,
    one_way_length_m: f64,
    conductor_name: &str,
    material: &str,
    three_phase: bool,
    nominal_voltage: f64,
) -> Result<f64, JsValue> {
    let material = material_from_str(material)?;
    let conductor = conductor_table(material)
        .iter()
        .find(|c| c.name == conductor_name)
        .ok_or_else(|| {
            JsValue::from_str(&format!("calibre no reconocido: \"{conductor_name}\""))
        })?;
    Ok(calc_voltage_drop_percent(
        current_amps,
        one_way_length_m,
        conductor,
        k_for_material(material),
        phases_from_bool(three_phase),
        nominal_voltage,
    ))
}

/// Módulo 4.7: selecciona el tamaño comercial más económico de tubería
/// (`conduit_type`: `"emt"`, `"pvc_sch40"` o `"rmc"`) que alcanza para
/// `conductor_count` conductores del calibre `conductor_name`, familia de
/// aislamiento `family` (`"thhn"`, `"thw"` o `"xhhw"`) -- ver la limitación de
/// "todos el mismo calibre" documentada en `calc_engine::conduit`. Retorna JSON:
/// `{"conduit_type","trade_size","usable_area_mm2","required_area_mm2","fill_percent"}`.
#[wasm_bindgen]
pub fn select_conduit(
    conductor_name: &str,
    family: &str,
    conductor_count: u32,
    conduit_type: &str,
) -> Result<String, JsValue> {
    let family = insulation_family_from_str(family)?;
    let conduit_type = conduit_type_from_str(conduit_type)?;
    let selection = select_conduit_size(conductor_name, family, conductor_count, conduit_type)
        .map_err(conduit_size_error_to_js)?;
    Ok(conduit_selection_to_json(&selection))
}

fn conduit_size_error_to_js(err: ConduitSizeError) -> JsValue {
    JsValue::from_str(&match err {
        ConduitSizeError::UnknownConductor { name } => {
            format!("calibre no reconocido para área de tubería: \"{name}\"")
        }
        ConduitSizeError::NoSizeFits { required_area_mm2 } => format!(
            "ningún tamaño comercial (hasta 4\") de este tipo de tubería alcanza para \
             {required_area_mm2:.1} mm² de conductores -- reduce la cantidad de conductores \
             por tubería o usa un tamaño mayor al catálogo de esta herramienta"
        ),
    })
}

fn conduit_selection_to_json(selection: &calc_engine::ConduitSelection) -> String {
    let fill_percent = (selection.required_area_mm2 / selection.usable_area_mm2) * 100.0;
    let conduit_type_str = match selection.conduit_type {
        ConduitType::Emt => "emt",
        ConduitType::PvcSch40 => "pvc_sch40",
        ConduitType::Rmc => "rmc",
    };
    format!(
        r#"{{"conduit_type":"{}","trade_size":"{}","usable_area_mm2":{},"required_area_mm2":{},"fill_percent":{}}}"#,
        conduit_type_str,
        selection.trade_size.replace('"', "\\\""),
        selection.usable_area_mm2,
        selection.required_area_mm2,
        fill_percent
    )
}

/// Catálogo de tipos de tubería soportados, para poblar un selector en la UI.
/// Retorna JSON: `[{"value","label"},...]`.
#[wasm_bindgen]
pub fn conduit_types() -> String {
    r#"[{"value":"emt","label":"EMT — tubo conduit metálico eléctrico"},{"value":"pvc_sch40","label":"PVC Cédula 40 — tubo conduit rígido no metálico"},{"value":"rmc","label":"RMC — tubo conduit metálico pesado"}]"#.to_string()
}

/// Área transversal (mm²) de un conductor aislado dado, según su familia de
/// aislamiento (`"thhn"`, `"thw"` o `"xhhw"`) -- pieza suelta para sumar áreas de
/// conductores de distinto calibre en la misma tubería (fases/neutro de un calibre,
/// tierra de otro) antes de llamar a [`select_conduit_by_area`].
#[wasm_bindgen]
pub fn conductor_area_mm2(conductor_name: &str, family: &str) -> Result<f64, JsValue> {
    let family = insulation_family_from_str(family)?;
    calc_conductor_area_mm2(conductor_name, family)
        .ok_or_else(|| JsValue::from_str(&format!("calibre no reconocido: \"{conductor_name}\"")))
}

/// Capacidad del dispositivo de sobrecorriente de un circuito general (no de
/// motor): redondeo de la ampacidad corregida del conductor al siguiente tamaño
/// comercial estándar (Art. 240-4(d), Tabla 240-6(a)) -- es tanto la protección
/// automática sugerida como el máximo permitido si el usuario fuerza un tamaño
/// mayor (ver [`evaluate_conductor_protection`]). También alimenta
/// [`grounding_conductor_awg`] (Tabla 250-122).
#[wasm_bindgen]
pub fn estimate_protection_amps(corrected_ampacity_amps: f64) -> f64 {
    conductor_protection_amps(corrected_ampacity_amps, true)
}

/// Catálogo de tamaños comerciales estándar de dispositivos de protección (Tabla
/// 240-6(a)), para poblar un selector de "protección forzada". Retorna JSON array
/// de números.
#[wasm_bindgen]
pub fn protection_sizes() -> String {
    let sizes: Vec<String> = calc_engine::STANDARD_DEVICE_SIZES
        .iter()
        .map(|s| s.to_string())
        .collect();
    format!("[{}]", sizes.join(","))
}

/// Sección 6: evalúa que la protección de un circuito general no exceda la
/// ampacidad del conductor (obligatoria) y retorna el hallazgo como JSON, mismo
/// formato que [`evaluate_voltage_drop`].
#[wasm_bindgen]
pub fn evaluate_conductor_protection(
    circuit_name: &str,
    protection_amps: f64,
    conductor_ampacity_amps: f64,
    max_allowed_amps: f64,
) -> String {
    let finding = compliance_engine::evaluate_conductor_protection(
        circuit_name,
        protection_amps,
        conductor_ampacity_amps,
        max_allowed_amps,
    );
    finding_to_json(&finding)
}

/// Calibre del conductor de puesta a tierra de equipos (cobre), en función de la
/// capacidad del dispositivo de sobrecorriente aguas arriba (Tabla 250-122). Ver
/// [`estimate_protection_amps`] para obtener esa capacidad a partir de la
/// ampacidad del conductor de fase.
#[wasm_bindgen]
pub fn grounding_conductor_awg(protection_amps: f64) -> String {
    equipment_grounding_conductor_awg(protection_amps).to_string()
}

/// Igual que [`select_conduit`], pero para un área total de conductores ya sumada
/// a mano (útil cuando la tubería mezcla calibres -- fases/neutro de un calibre y
/// tierra de otro, ver [`conductor_area_mm2`] y [`grounding_conductor_awg`]).
/// Retorna el mismo JSON que [`select_conduit`].
#[wasm_bindgen]
pub fn select_conduit_by_area(
    required_area_mm2: f64,
    conductor_count: u32,
    conduit_type: &str,
) -> Result<String, JsValue> {
    let conduit_type = conduit_type_from_str(conduit_type)?;
    let selection = select_conduit_size_for_area(required_area_mm2, conductor_count, conduit_type)
        .map_err(conduit_size_error_to_js)?;
    Ok(conduit_selection_to_json(&selection))
}

fn finding_to_json(finding: &compliance_engine::ComplianceFinding) -> String {
    format!(
        r#"{{"rule_id":"{}","status":"{:?}","norm_reference":"{}","observation":"{}"}}"#,
        finding.rule_id,
        finding.status,
        finding.norm_reference.code.replace('"', "'"),
        finding.observation.replace('"', "'")
    )
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
    finding_to_json(&finding)
}

/// Sección 6: evalúa la regla de ampacidad de conductor (obligatoria) y retorna el
/// hallazgo como JSON, mismo formato que [`evaluate_voltage_drop`].
#[wasm_bindgen]
pub fn evaluate_conductor_ampacity(
    circuit_name: &str,
    required_current_amps: f64,
    corrected_ampacity_amps: f64,
) -> String {
    let finding = compliance_engine::evaluate_conductor_ampacity(
        circuit_name,
        required_current_amps,
        corrected_ampacity_amps,
    );
    finding_to_json(&finding)
}

/// Sección 6: evalúa la regla de llenado de canalización (obligatoria) y retorna el
/// hallazgo como JSON, mismo formato que [`evaluate_voltage_drop`]. Las áreas van en
/// mm² (unidad nativa de la Tabla 4/Tabla 5 de la NOM, ver [`select_conduit`]).
#[wasm_bindgen]
pub fn evaluate_conduit_fill(
    conduit_label: &str,
    total_conductor_area_mm2: f64,
    usable_area_mm2: f64,
) -> String {
    let finding = compliance_engine::evaluate_conduit_fill(
        conduit_label,
        total_conductor_area_mm2,
        usable_area_mm2,
    );
    finding_to_json(&finding)
}

/// Catálogo de etiquetas de hp de motor disponibles para `voltage`/`three_phase`
/// dados (monofásico se detiene en 10 hp; trifásico llega a 200 hp) -- para poblar
/// un selector de hp en la UI que no ofrezca combinaciones sin FLC de tabla.
/// Retorna JSON array de strings, en el mismo orden que `MOTOR_HP_LABELS`.
#[wasm_bindgen]
pub fn motor_hp_labels(voltage: f64, three_phase: bool) -> String {
    let labels: Vec<String> = MOTOR_HP_LABELS
        .iter()
        .filter(|(label, _)| motor_full_load_current(label, voltage, three_phase).is_some())
        .map(|(label, _)| format!("\"{label}\""))
        .collect();
    format!("[{}]", labels.join(","))
}

/// Catálogo de tipos de dispositivo de protección de motor, para poblar un
/// selector en la UI. Retorna JSON: `[{"value","label"},...]`.
#[wasm_bindgen]
pub fn motor_protection_kinds() -> String {
    r#"[{"value":"inverse_time_breaker","label":"Interruptor de tiempo inverso (250% FLC)"},{"value":"time_delay_fuse","label":"Fusible de acción retardada (175% FLC)"},{"value":"non_time_delay_fuse","label":"Fusible de acción rápida (300% FLC)"}]"#.to_string()
}

/// Corriente a plena carga (FLC) de motor, de la Tabla 430-248/430-250 -- no de la
/// placa del fabricante. `hp_label` debe ser una de las etiquetas de
/// [`motor_hp_labels`]. Ver el comentario de cabecera de `calc_engine::motor` para
/// el alcance de tensiones/fases cubiertas.
#[wasm_bindgen]
pub fn motor_flc_amps(hp_label: &str, voltage: f64, three_phase: bool) -> Result<f64, JsValue> {
    motor_full_load_current(hp_label, voltage, three_phase).ok_or_else(|| {
        JsValue::from_str(&format!(
            "no hay corriente a plena carga de tabla para \"{hp_label}\" hp a {voltage} V \
             {}", if three_phase { "trifásico" } else { "monofásico" }
        ))
    })
}

/// Ampacidad mínima del conductor del circuito derivado de un motor: 125% de la
/// FLC (Art. 430-22).
#[wasm_bindgen]
pub fn motor_conductor_ampacity(flc_amps: f64) -> f64 {
    motor_branch_circuit_ampacity(flc_amps)
}

/// Tamaño de protección de circuito derivado de motor (Tabla 430-52): aplica el
/// porcentaje máximo de la FLC según `kind` (`"inverse_time_breaker"`,
/// `"time_delay_fuse"` o `"non_time_delay_fuse"`) y redondea al siguiente tamaño
/// comercial estándar.
#[wasm_bindgen]
pub fn motor_protection_amps(flc_amps: f64, kind: &str) -> Result<f64, JsValue> {
    let kind = protection_kind_from_str(kind)?;
    Ok(motor_branch_protection_amps(flc_amps, kind))
}

/// Sección 6: evalúa la regla de protección de circuito derivado de motor
/// (obligatoria) y retorna el hallazgo como JSON, mismo formato que
/// [`evaluate_voltage_drop`].
#[wasm_bindgen]
pub fn evaluate_motor_protection(
    circuit_name: &str,
    protection_amps: f64,
    motor_flc_amps: f64,
    max_allowed_amps: f64,
) -> String {
    let finding = compliance_engine::evaluate_motor_protection(
        circuit_name,
        protection_amps,
        motor_flc_amps,
        max_allowed_amps,
    );
    finding_to_json(&finding)
}
