// Prueba manual (Node.js) de que el WASM generado desde Rust produce los mismos
// resultados que el pipeline de `engine/calc-engine/tests/pipeline.rs`. No es parte
// del workspace de Cargo (JS, no Rust) — se corre por separado, ver README.
import assert from "node:assert/strict";
import {
  design_current_amps,
  continuous_load_adjusted_current,
  select_conductor,
  conductor_names,
  conductor_ampacity_by_name,
  voltage_drop_percent,
  evaluate_voltage_drop,
  evaluate_conductor_ampacity,
  select_conduit,
  conduit_types,
  evaluate_conduit_fill,
} from "../pkg/calc_engine_wasm.js";

// Mismo escenario que engine/calc-engine/tests/pipeline.rs:
// Compresor 8000 VA + Banda 5000 VA (continuas) + Tablero 2000 VA (no continua),
// demanda 0.9, 220 V trifásico, 35 °C ambiente, 3 conductores portadores.
const installed = 8000 + 5000 + 2000;
assert.equal(installed, 15000);

const demand = installed * 0.9;
assert.equal(demand, 13500);

const designCurrent = design_current_amps(demand, 220.0, true);
assert.ok(Math.abs(designCurrent - 35.428) < 0.01, `design current: ${designCurrent}`);

const requiredCurrent = continuous_load_adjusted_current(designCurrent, true);
assert.ok(Math.abs(requiredCurrent - 44.285) < 0.01, `required current: ${requiredCurrent}`);

const selectionJson = select_conductor(requiredCurrent, "copper", "75", 35.0, 3);
const selection = JSON.parse(selectionJson);
assert.equal(selection.conductor, "8 AWG");
assert.equal(selection.temperature_factor, 0.94);
assert.equal(selection.grouping_factor, 1.0);
assert.ok(selection.corrected_ampacity >= requiredCurrent);

const vdPct = voltage_drop_percent(requiredCurrent, 25.0, selection.conductor, "copper", true, 220.0);
assert.ok(vdPct < 3.0, `voltage drop: ${vdPct}%`);

const vdFinding = JSON.parse(evaluate_voltage_drop("Alim-Compresores", true, vdPct));
assert.equal(vdFinding.status, "Cumple");
assert.ok(vdFinding.observation.includes(vdPct.toFixed(2)));

const ampacityFinding = JSON.parse(
  evaluate_conductor_ampacity("Alim-Compresores", requiredCurrent, selection.corrected_ampacity),
);
assert.equal(ampacityFinding.status, "Cumple");

// Calibre forzado manualmente (Sección 5.4): mismo circuito pero con un recorrido
// más largo (60 m) para que el calibre automático (8 AWG) quede en Advertencia por
// caída de tensión, y verificar que subir de calibre a mano (4 AWG, vía
// `conductor_ampacity_by_name`) sí la resuelve.
const names = JSON.parse(conductor_names("copper"));
assert.ok(names.includes("8 AWG") && names.includes("4 AWG"), `catálogo: ${names}`);
assert.ok(names.includes("14 AWG"), "el cobre incluye 14 AWG");
const alNames = JSON.parse(conductor_names("aluminum"));
assert.ok(!alNames.includes("14 AWG"), "el aluminio no incluye 14 AWG");
assert.ok(alNames.includes("12 AWG"), "el aluminio empieza en 12 AWG");

const longLength = 60.0;
const vdAuto = voltage_drop_percent(requiredCurrent, longLength, selection.conductor, "copper", true, 220.0);
assert.ok(vdAuto > 3.0, `caída de tensión con calibre automático: ${vdAuto}%`);
const vdAutoFinding = JSON.parse(evaluate_voltage_drop("Alim-Compresores", true, vdAuto));
assert.equal(vdAutoFinding.status, "Advertencia");

const forced = JSON.parse(conductor_ampacity_by_name("4 AWG", "copper", "75", 35.0, 3));
assert.equal(forced.conductor, "4 AWG");
assert.ok(forced.corrected_ampacity >= requiredCurrent);
const vdForced = voltage_drop_percent(requiredCurrent, longLength, forced.conductor, "copper", true, 220.0);
assert.ok(vdForced < 3.0, `caída de tensión con calibre forzado: ${vdForced}%`);
const vdForcedFinding = JSON.parse(evaluate_voltage_drop("Alim-Compresores", true, vdForced));
assert.equal(vdForcedFinding.status, "Cumple");

// Aluminio: mismo circuito, mismo aislamiento -- debe requerir un calibre mayor
// que cobre para la misma corriente (menor ampacidad por calibre).
const alSelection = JSON.parse(select_conductor(requiredCurrent, "aluminum", "75", 35.0, 3));
assert.notEqual(alSelection.conductor, selection.conductor);

// Tubería (Módulo 4.7): 3 conductores de 8 AWG THHN en EMT.
const types = JSON.parse(conduit_types());
assert.equal(types.length, 3);
assert.ok(types.some((t) => t.value === "emt"));

const conduit = JSON.parse(select_conduit(selection.conductor, "thhn", 3, "emt"));
assert.equal(conduit.trade_size, '1/2"');
assert.ok(conduit.required_area_mm2 < conduit.usable_area_mm2);

const conduitFinding = JSON.parse(
  evaluate_conduit_fill("Alim-Compresores", conduit.required_area_mm2, conduit.usable_area_mm2),
);
assert.equal(conduitFinding.status, "Cumple");

// Más conductores del mismo calibre deben requerir un tamaño de tubería mayor.
const conduitMore = JSON.parse(select_conduit("4/0 AWG", "thhn", 12, "emt"));
assert.notEqual(conduitMore.trade_size, '1/2"');
assert.ok(conduitMore.required_area_mm2 < conduitMore.usable_area_mm2);

console.log("OK — WASM reproduce el pipeline de calc-engine/compliance-engine:");
console.log({
  installed,
  demand,
  designCurrent,
  requiredCurrent,
  selection,
  vdPct,
  vdFinding,
  ampacityFinding,
  conduit,
  conduitFinding,
});
