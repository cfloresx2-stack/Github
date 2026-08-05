"""Genera electranom-demo.html: la calculadora interactiva ElectraNOM como un
único archivo HTML autocontenido (motor Rust/compliance-engine embebido como
WASM en base64), publicable directamente como Claude Artifact.

Requiere que engine/calc-engine-wasm/pkg-web/ ya exista -- generarlo primero
con los pasos de engine/calc-engine-wasm/README.md, target `web`:

    cd engine
    cargo build -p calc_engine_wasm --target wasm32-unknown-unknown --release
    wasm-bindgen --target web --out-dir calc-engine-wasm/pkg-web \
      target/wasm32-unknown-unknown/release/calc_engine_wasm.wasm

Uso:  python3 web/build_artifact.py
Salida: web/dist/electranom-demo.html (no se commitea, ver .gitignore --
regenerar con este script y publicar con la herramienta Artifact).
"""
import base64
import os

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PKG_WEB = os.path.join(REPO_ROOT, 'engine', 'calc-engine-wasm', 'pkg-web')
OUTPUT_PATH = os.path.join(REPO_ROOT, 'web', 'dist', 'electranom-demo.html')

with open(os.path.join(PKG_WEB, 'calc_engine_wasm_bg.wasm'), 'rb') as f:
    wasm_b64 = base64.b64encode(f.read()).decode('ascii')

with open(os.path.join(PKG_WEB, 'calc_engine_wasm.js'), 'r') as f:
    glue_js = f.read()

html = r'''<meta charset="utf-8" />
<title>ElectraNOM — Banco de pruebas del motor de cálculo</title>
<style>
:root {
  --paper: #f5f6f4;
  --surface: #ffffff;
  --surface-2: #eef0ed;
  --ink: #171b1f;
  --ink-soft: #4b5560;
  --ink-faint: #7c8791;
  --line: #dde1de;
  --copper: #b5651d;
  --copper-strong: #8f4e15;
  --copper-tint: #f3e6d8;
  --ok: #1f7a4d;
  --ok-tint: #e3f3ea;
  --warn: #93650a;
  --warn-tint: #faefd8;
  --bad: #a3312a;
  --bad-tint: #fbe7e5;
  --focus: #8f4e15;
}

@media (prefers-color-scheme: dark) {
  :root {
    --paper: #12161a; --surface: #1a1f24; --surface-2: #20262c;
    --ink: #e8eaec; --ink-soft: #a3aeb6; --ink-faint: #77828b; --line: #2b323a;
    --copper: #e2924c; --copper-strong: #f0ac6d; --copper-tint: #33261a;
    --ok: #57c98c; --ok-tint: #16281f; --warn: #e0a83f; --warn-tint: #2c2412;
    --bad: #e2685f; --bad-tint: #2c1918; --focus: #e2924c;
  }
}
:root[data-theme="dark"] {
  --paper: #12161a; --surface: #1a1f24; --surface-2: #20262c;
  --ink: #e8eaec; --ink-soft: #a3aeb6; --ink-faint: #77828b; --line: #2b323a;
  --copper: #e2924c; --copper-strong: #f0ac6d; --copper-tint: #33261a;
  --ok: #57c98c; --ok-tint: #16281f; --warn: #e0a83f; --warn-tint: #2c2412;
  --bad: #e2685f; --bad-tint: #2c1918; --focus: #e2924c;
}
:root[data-theme="light"] {
  --paper: #f5f6f4; --surface: #ffffff; --surface-2: #eef0ed;
  --ink: #171b1f; --ink-soft: #4b5560; --ink-faint: #7c8791; --line: #dde1de;
  --copper: #b5651d; --copper-strong: #8f4e15; --copper-tint: #f3e6d8;
  --ok: #1f7a4d; --ok-tint: #e3f3ea; --warn: #93650a; --warn-tint: #faefd8;
  --bad: #a3312a; --bad-tint: #fbe7e5; --focus: #8f4e15;
}

* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }

body {
  background: var(--paper);
  color: var(--ink);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  background-image:
    linear-gradient(var(--line) 1px, transparent 1px),
    linear-gradient(90deg, var(--line) 1px, transparent 1px);
  background-size: 28px 28px;
  background-position: -1px -1px;
  background-attachment: fixed;
}

.wrap { max-width: 900px; margin: 0 auto; padding: 40px 20px 80px; }

header.top {
  display: flex; flex-direction: column; gap: 6px;
  margin-bottom: 32px; padding-bottom: 24px; border-bottom: 1px solid var(--line);
}
.eyebrow { font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: var(--copper); }
h1 { font-size: 28px; font-weight: 700; letter-spacing: -0.01em; margin: 2px 0 0; text-wrap: balance; }
.lede { color: var(--ink-soft); font-size: 14.5px; max-width: 66ch; margin: 4px 0 0; }
.status-line { display: flex; align-items: center; gap: 8px; margin-top: 14px; font-size: 12.5px; color: var(--ink-faint); }
.dot { width: 7px; height: 7px; border-radius: 50%; background: var(--ink-faint); flex: none; }
.dot.live { background: var(--ok); box-shadow: 0 0 0 3px var(--ok-tint); }
.dot.err { background: var(--bad); box-shadow: 0 0 0 3px var(--bad-tint); }

section.card { background: var(--surface); border: 1px solid var(--line); border-radius: 10px; padding: 24px 24px 26px; margin-bottom: 20px; }
h2 { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--ink-soft); margin: 0 0 18px; }
h2 .count { color: var(--copper); font-weight: 700; }

.field-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 16px 18px; }
label { display: flex; flex-direction: column; gap: 6px; font-size: 12.5px; color: var(--ink-soft); }
label span.lbl { font-weight: 600; color: var(--ink); }
label span.hint { font-size: 11px; color: var(--ink-faint); font-weight: 400; }
.check-row { display: flex; align-items: center; gap: 8px; height: 36px; }
.check-row input[type="checkbox"] { width: 16px; height: 16px; accent-color: var(--copper); }
.check-row span { font-size: 13px; color: var(--ink); font-family: inherit; }

input[type="text"], input[type="number"], select {
  font: inherit; font-family: "SF Mono", "Cascadia Code", "JetBrains Mono", Consolas, "Roboto Mono", monospace;
  font-size: 13.5px; padding: 9px 10px; border-radius: 6px; border: 1px solid var(--line);
  background: var(--paper); color: var(--ink); width: 100%; font-variant-numeric: tabular-nums;
}
input[type="text"] { font-family: inherit; }
input:focus, select:focus, button:focus-visible { outline: 2px solid var(--focus); outline-offset: 1px; }

table.loads, table.circuits { width: 100%; border-collapse: collapse; margin-top: 4px; font-size: 13px; }
table.loads th, table.circuits th {
  text-align: left; font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.06em;
  color: var(--ink-faint); font-weight: 700; padding: 0 8px 8px; border-bottom: 1px solid var(--line);
}
table.loads td, table.circuits td { padding: 7px 8px; border-bottom: 1px solid var(--line); vertical-align: middle; }
table.loads input[type="text"] { min-width: 140px; }
table.loads input[type="number"] { width: 90px; }
table.loads td.chk { text-align: center; }
table.loads td.rm { text-align: right; width: 32px; }
table.circuits td.rm { text-align: right; width: 56px; white-space: nowrap; }
table.circuits td.num { font-family: "SF Mono", "Cascadia Code", "JetBrains Mono", Consolas, "Roboto Mono", monospace; font-variant-numeric: tabular-nums; }

.icon-btn { background: none; border: none; color: var(--ink-faint); cursor: pointer; font-size: 15px; padding: 4px 6px; border-radius: 5px; line-height: 1; }
.icon-btn:hover { background: var(--surface-2); color: var(--bad); }

.add-row {
  margin-top: 12px; background: none; border: 1px dashed var(--line); color: var(--ink-soft);
  border-radius: 6px; padding: 8px 12px; font: inherit; font-size: 12.5px; font-weight: 600; cursor: pointer; width: 100%;
}
.add-row:hover { border-color: var(--copper); color: var(--copper-strong); }

.run-bar { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin: 24px 0; }
.btn-group { display: flex; gap: 10px; flex-wrap: wrap; }

button.calc, button.add-circuit {
  border: none; border-radius: 8px; padding: 12px 20px; font: inherit; font-size: 13.5px; font-weight: 700; cursor: pointer; letter-spacing: 0.01em;
}
button.calc { background: var(--copper); color: #fff; }
button.calc:hover { background: var(--copper-strong); }
button.calc:disabled { opacity: 0.5; cursor: default; }
button.add-circuit { background: var(--ok); color: #fff; }
button.add-circuit:hover { filter: brightness(0.92); }
button.add-circuit:disabled { opacity: 0.4; cursor: default; }

.run-note { font-size: 12px; color: var(--ink-faint); }

#results { display: none; }
#results.show { display: block; }

.stat-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px;
  background: var(--line); border: 1px solid var(--line); border-radius: 8px; overflow: hidden; margin-bottom: 18px;
}
.stat { background: var(--surface); padding: 14px 16px; }
.stat .k { font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--ink-faint); font-weight: 700; margin-bottom: 6px; }
.stat .v { font-family: "SF Mono", "Cascadia Code", "JetBrains Mono", Consolas, "Roboto Mono", monospace; font-size: 19px; font-weight: 600; font-variant-numeric: tabular-nums; }
.stat .v small { font-size: 12px; color: var(--ink-faint); font-weight: 500; margin-left: 2px; }

.conductor-line {
  display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; padding: 14px 16px;
  background: var(--surface-2); border-radius: 8px; margin-bottom: 18px; font-size: 13px; color: var(--ink-soft);
}
.conductor-line .cal { font-family: "SF Mono", "Cascadia Code", "JetBrains Mono", Consolas, "Roboto Mono", monospace; font-size: 18px; font-weight: 700; color: var(--ink); }

.findings { display: flex; flex-direction: column; gap: 10px; }
.finding { display: flex; gap: 12px; padding: 13px 15px; border-radius: 8px; border: 1px solid var(--line); }
.finding.ok { background: var(--ok-tint); border-color: color-mix(in srgb, var(--ok) 35%, var(--line)); }
.finding.warn { background: var(--warn-tint); border-color: color-mix(in srgb, var(--warn) 35%, var(--line)); }
.finding.bad { background: var(--bad-tint); border-color: color-mix(in srgb, var(--bad) 35%, var(--line)); }

.chip { flex: none; align-self: flex-start; font-size: 11px; font-weight: 700; letter-spacing: 0.03em; padding: 3px 9px; border-radius: 999px; white-space: nowrap; }
.chip.ok { background: var(--ok); color: #fff; }
.chip.warn { background: var(--warn); color: #fff; }
.chip.bad { background: var(--bad); color: #fff; }
.chip.ghost { background: var(--surface-2); color: var(--ink-soft); border: 1px solid var(--line); }

.finding .body { flex: 1; min-width: 0; }
.finding .rule { font-size: 12.5px; font-weight: 700; margin-bottom: 3px; }
.finding .obs { font-size: 12.5px; color: var(--ink-soft); }
.finding .ref { font-family: "SF Mono", "Cascadia Code", "JetBrains Mono", Consolas, "Roboto Mono", monospace; font-size: 11px; color: var(--ink-faint); margin-top: 5px; }

.error-box {
  background: var(--bad-tint); border: 1px solid color-mix(in srgb, var(--bad) 35%, var(--line)); color: var(--bad);
  padding: 13px 15px; border-radius: 8px; font-size: 13px; display: none;
}
.error-box.show { display: block; }

.empty-note { font-size: 13px; color: var(--ink-faint); font-style: italic; }

footer {
  margin-top: 36px; padding-top: 20px; border-top: 1px solid var(--line); font-size: 12px; color: var(--ink-faint);
  display: flex; flex-direction: column; gap: 6px;
}
footer code { font-family: "SF Mono", "Cascadia Code", "JetBrains Mono", Consolas, "Roboto Mono", monospace; background: var(--surface-2); padding: 1px 5px; border-radius: 4px; }

/* ---- memoria de cálculo (reporte) ---- */
.report-btn {
  background: var(--surface); color: var(--copper-strong); border: 1px solid var(--copper); border-radius: 7px;
  padding: 11px 18px; font: inherit; font-size: 13.5px; font-weight: 700; cursor: pointer;
}
.report-btn:hover { background: var(--copper-tint); }
.report-btn:disabled { opacity: 0.4; cursor: default; }

#reportView { display: none; }

.rpt { max-width: 760px; margin: 0 auto; font-family: Georgia, "Times New Roman", serif; color: #1a1a1a; background: #fff; padding: 10px 4px; }
.rpt-sans { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif; }
.rpt h1 { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif; font-size: 20px; margin: 0 0 2px; letter-spacing: 0.01em; }
.rpt .rpt-sub { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif; font-size: 11.5px; color: #555; margin-bottom: 4px; }
.rpt .rpt-meta {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif; font-size: 11px; color: #555;
  border-bottom: 2px solid #1a1a1a; padding-bottom: 10px; margin-bottom: 18px; display: grid; grid-template-columns: 1fr 1fr; gap: 3px 20px;
}
.rpt h2 {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif; font-size: 12.5px; text-transform: uppercase;
  letter-spacing: 0.06em; border-bottom: 1px solid #ccc; padding-bottom: 4px; margin: 22px 0 10px;
}
.rpt h3 {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif; font-size: 13.5px; font-weight: 700;
  margin: 20px 0 8px; padding: 6px 10px; background: #f4f4f2; border-radius: 4px; display: flex; justify-content: space-between; align-items: center;
}
.rpt table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 4px; }
.rpt table th {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif; text-align: left; font-size: 9.5px;
  text-transform: uppercase; letter-spacing: 0.04em; color: #666; border-bottom: 1px solid #999; padding: 3px 6px;
}
.rpt table td { padding: 4px 6px; border-bottom: 1px solid #ddd; font-variant-numeric: tabular-nums; }
.rpt table.summary td, .rpt table.summary th { font-size: 11px; }
.rpt .step { font-size: 12.5px; margin: 0 0 10px; padding-left: 2px; }
.rpt .step .lbl {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif; font-weight: 700; font-size: 10.5px;
  text-transform: uppercase; letter-spacing: 0.03em; color: #444; display: block; margin-bottom: 2px;
}
.rpt .step .formula { font-family: "SF Mono", "Cascadia Code", Consolas, monospace; font-size: 12px; background: #f4f4f2; padding: 6px 9px; border-radius: 4px; display: inline-block; }
.rpt .verdict { display: inline-block; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 999px; }
.rpt .verdict.ok { background: #e3f3ea; color: #1f7a4d; }
.rpt .verdict.warn { background: #faefd8; color: #93650a; }
.rpt .verdict.bad { background: #fbe7e5; color: #a3312a; }
.rpt .finding-text { font-size: 11.5px; color: #333; margin: 3px 0 1px; }
.rpt .finding-ref { font-family: "SF Mono", "Cascadia Code", Consolas, monospace; font-size: 10px; color: #777; }
.rpt .circuit-block { page-break-inside: avoid; margin-bottom: 8px; }
.rpt .panel-block { page-break-before: auto; }
.rpt .signoff { margin-top: 46px; display: grid; grid-template-columns: 1fr 1fr; gap: 30px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif; font-size: 11px; color: #444; }
.rpt .signoff .line { border-top: 1px solid #999; margin-top: 40px; padding-top: 5px; }
.rpt .disclaimer { margin-top: 26px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif; font-size: 9.5px; color: #888; border-top: 1px solid #ddd; padding-top: 8px; line-height: 1.5; }
.rpt-close-bar { max-width: 760px; margin: 0 auto 14px; display: flex; justify-content: flex-end; }
.rpt-close-bar button {
  font: inherit; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif; font-size: 12.5px; font-weight: 600;
  background: var(--surface-2); color: var(--ink-soft); border: 1px solid var(--line); border-radius: 6px; padding: 7px 13px; cursor: pointer;
}

@media print {
  body { background: #fff !important; }
  .wrap, .rpt-close-bar { display: none !important; }
  #reportView { display: block !important; }
  @page { margin: 16mm 14mm; }
}

@media (max-width: 520px) {
  h1 { font-size: 23px; }
  .run-bar { flex-direction: column; align-items: stretch; }
  table.loads, table.circuits { display: block; overflow-x: auto; }
  .stat-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
<div class="wrap">

  <header class="top">
    <span class="eyebrow">ElectraNOM &middot; banco de pruebas</span>
    <h1>Motor de cálculo, en vivo</h1>
    <p class="lede">
      Corre exactamente el mismo código en Rust que <code>cargo test</code> valida
      en el repositorio &mdash; compilado a WebAssembly, sin servidor de por medio.
      Calcula cada alimentador y circuito derivado de tu instalación, uno por uno, y
      al final genera <strong>una sola memoria de cálculo</strong> con todos ellos.
    </p>
    <div class="status-line"><span id="engineDot" class="dot"></span><span id="engineStatus">Cargando el motor&hellip;</span></div>
  </header>

  <section class="card">
    <h2>Datos del proyecto</h2>
    <div class="field-grid">
      <label>
        <span class="lbl">Nombre del proyecto</span>
        <input type="text" id="projectName" value="Planta industrial &mdash; ejemplo" />
      </label>
      <label>
        <span class="lbl">Ubicación / notas <span class="hint">(opcional)</span></span>
        <input type="text" id="projectNotes" value="" placeholder="Ej. Nave 2, Querétaro" />
      </label>
    </div>
  </section>

  <section class="card">
    <h2>Datos del circuito</h2>
    <div class="field-grid">
      <label>
        <span class="lbl">Tablero</span>
        <input type="text" id="panelName" value="TG-1" />
      </label>
      <label>
        <span class="lbl">Nombre del circuito</span>
        <input type="text" id="circuitName" value="Alim-Compresores" />
      </label>
      <label>
        <span class="lbl">Tipo</span>
        <select id="circuitType">
          <option value="feeder" selected>Alimentador</option>
          <option value="branch">Circuito derivado</option>
        </select>
      </label>
      <label>
        <span class="lbl">Carga <span class="hint">(motor usa Art. 430, no la tabla de cargas)</span></span>
        <div class="check-row">
          <input type="checkbox" id="isMotor" />
          <span>Circuito de motor</span>
        </div>
      </label>
      <label>
        <span class="lbl">Sistema <span class="hint">(conductores portadores + neutro + tierra)</span></span>
        <select id="conductorSystem">
          <option value="1p1n">1 fase + 1 neutro</option>
          <option value="1p1n1g">1 fase + 1 neutro + 1 tierra</option>
          <option value="2p1g">2 fases + 1 tierra</option>
          <option value="2p1n">2 fases + 1 neutro</option>
          <option value="2p1n1g">2 fases + 1 neutro + 1 tierra</option>
          <option value="3p1g" selected>3 fases + 1 tierra</option>
          <option value="3p1n">3 fases + 1 neutro</option>
          <option value="3p1n1g">3 fases + 1 neutro + 1 tierra</option>
        </select>
      </label>
      <label>
        <span class="lbl">Tensión nominal <span class="hint">(V, según fases)</span></span>
        <select id="voltage">
          <option value="127">127 V</option>
          <option value="220" selected>220 V</option>
          <option value="440">440 V</option>
          <option value="480">480 V</option>
        </select>
      </label>
      <label>
        <span class="lbl">Temp. ambiente <span class="hint">(°C)</span></span>
        <input type="number" id="ambientC" value="35" step="1" />
      </label>
      <label>
        <span class="lbl">Longitud <span class="hint">(m, una vía)</span></span>
        <input type="number" id="lengthM" value="25" step="0.5" />
      </label>
      <label>
        <span class="lbl">Aislamiento <span class="hint">(temperatura, rige ampacidad)</span></span>
        <select id="insulation">
          <option value="60">60 °C</option>
          <option value="75" selected>75 °C</option>
          <option value="90">90 °C</option>
        </select>
      </label>
      <label>
        <span class="lbl">Factor de demanda <span class="hint">(0&ndash;1, ya resuelto)</span></span>
        <input type="number" id="demandFactor" value="0.9" step="0.01" min="0" max="1" />
      </label>
      <label>
        <span class="lbl">Material del conductor</span>
        <select id="conductorMaterial">
          <option value="copper" selected>Cobre</option>
          <option value="aluminum">Aluminio</option>
        </select>
      </label>
      <label>
        <span class="lbl">Calibre <span class="hint">(forzar uno más grande baja la caída de tensión)</span></span>
        <select id="forcedGauge">
          <option value="">Automático (mínimo que cumple ampacidad)</option>
        </select>
      </label>
      <label>
        <span class="lbl">Tipo de conductor <span class="hint">(aislamiento, para diámetro/tubería)</span></span>
        <select id="insulationFamily">
          <option value="thhn" selected>THHN / THWN-2</option>
          <option value="thw">TW / THW / THHW</option>
          <option value="xhhw">XHHW / XHHW-2</option>
        </select>
      </label>
      <label id="protectionField">
        <span class="lbl">Protección <span class="hint">(interruptor/fusible, tamaño comercial)</span></span>
        <select id="forcedProtection">
          <option value="">Automático (siguiente tamaño &ge; ampacidad)</option>
        </select>
      </label>
    </div>
  </section>

  <section class="card">
    <h2>Tubería (canalización)</h2>
    <div class="field-grid">
      <label>
        <span class="lbl">Tipo de tubería</span>
        <select id="conduitType"></select>
      </label>
    </div>
    <div class="conductor-line" id="conductorMakeupLine" style="margin-top:14px"></div>
  </section>

  <section class="card" id="loadsCard">
    <h2>Cargas del circuito</h2>
    <table class="loads">
      <thead><tr><th>Descripción</th><th>VA</th><th>FP</th><th>Continua</th><th></th></tr></thead>
      <tbody id="loadsBody"></tbody>
    </table>
    <button type="button" class="add-row" id="addLoad">+ Agregar carga</button>
  </section>

  <section class="card" id="motorCard" style="display:none">
    <h2>Datos del motor <span class="hint">(Art. 430 &mdash; corriente de tabla, no de placa)</span></h2>
    <div class="field-grid">
      <label>
        <span class="lbl">Potencia <span class="hint">(hp)</span></span>
        <select id="motorHp"></select>
      </label>
      <label>
        <span class="lbl">Protección de circuito derivado</span>
        <select id="motorProtectionKind"></select>
      </label>
    </div>
  </section>

  <div class="run-bar">
    <div class="btn-group">
      <button type="button" class="calc" id="calcBtn" disabled>Calcular</button>
      <button type="button" class="add-circuit" id="addCircuitBtn" disabled>+ Agregar este circuito a la memoria</button>
    </div>
    <span class="run-note" id="runNote">Cargando el motor de cálculo (WebAssembly)&hellip;</span>
  </div>

  <div class="error-box" id="errorBox"></div>

  <div id="results">
    <section class="card">
      <h2>Resultado (vista previa &mdash; aún no agregado)</h2>
      <div class="stat-grid">
        <div class="stat"><div class="k" id="rInstalledLabel">Carga instalada</div><div class="v" id="rInstalled">&mdash;</div></div>
        <div class="stat"><div class="k" id="rDemandLabel">Demanda</div><div class="v" id="rDemand">&mdash;</div></div>
        <div class="stat"><div class="k">Corriente de diseño</div><div class="v" id="rDesign">&mdash;</div></div>
        <div class="stat"><div class="k">Corriente requerida</div><div class="v" id="rRequired">&mdash;</div></div>
        <div class="stat"><div class="k">Caída de tensión</div><div class="v" id="rVd">&mdash;</div></div>
        <div class="stat" id="rProtectionStat" style="display:none"><div class="k" id="rProtectionLabel">Protección</div><div class="v" id="rProtection">&mdash;</div></div>
      </div>
      <div class="conductor-line" id="conductorLine"></div>
      <div class="conductor-line" id="protectionLine"></div>
      <div class="conductor-line" id="conduitLine"></div>
      <div class="findings" id="findings"></div>
    </section>
  </div>

  <section class="card">
    <h2>Circuitos en la memoria <span class="count" id="circuitCount">(0)</span></h2>
    <div id="circuitsEmpty" class="empty-note">Todavía no agregas ningún circuito. Calcula uno arriba y presiona &ldquo;Agregar este circuito a la memoria&rdquo;.</div>
    <table class="circuits" id="circuitsTable" style="display:none">
      <thead><tr><th>Tablero</th><th>Circuito</th><th>Tipo</th><th>Conductor</th><th>I req.</th><th>%CT</th><th>Tubería</th><th>Estado</th><th></th></tr></thead>
      <tbody id="circuitsBody"></tbody>
    </table>
    <div class="run-bar" style="margin-bottom:0">
      <button type="button" class="report-btn" id="reportBtn" disabled>Generar memoria de cálculo completa (PDF)</button>
      <button type="button" class="report-btn" id="clearAllBtn" style="border-color:var(--line);color:var(--ink-faint)" disabled>Vaciar memoria</button>
      <span class="run-note">Se guarda automáticamente en este navegador (localStorage) &mdash; sobrevive a que recargues la página.</span>
    </div>
  </section>

  <div id="reportView"></div>

  <footer>
    <span>Cada circuito reproduce el pipeline de <code>engine/calc-engine/tests/pipeline.rs</code> &mdash; carga, demanda, conductor, caída de tensión, cumplimiento.</span>
    <span>Motor: <code>calc-engine</code> + <code>compliance-engine</code> (Rust) &middot; tablas validadas contra la NOM-001-SEDE-2018 oficial &middot; ver el repositorio para el detalle.</span>
  </footer>

</div>

<div id="reportViewAnchor"></div>

<script type="module">
__GLUE_JS__

// ==== app state ====
const STORAGE_KEY = 'electranom-demo-v1';
let circuits = [];   // { id, panel, circuitName, isFeeder, threePhase, voltage, ambientC, lengthM, grouped, insulation, demandFactor, loads, installedVa, demandVa, isContinuous, designCurrent, requiredCurrent, selection, vdPct, vdFinding, ampacityFinding }
let lastCalc = null; // current preview, not yet added

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      projectName: document.getElementById('projectName').value,
      projectNotes: document.getElementById('projectNotes').value,
      circuits,
    }));
  } catch (e) { /* localStorage puede no estar disponible; no es crítico */ }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (data.projectName !== undefined) document.getElementById('projectName').value = data.projectName;
    if (data.projectNotes !== undefined) document.getElementById('projectNotes').value = data.projectNotes;
    if (Array.isArray(data.circuits)) circuits = data.circuits;
  } catch (e) { /* ignorar estado corrupto */ }
}

// ==== wasm init ====
function b64ToBytes(b64) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

const engineDot = document.getElementById('engineDot');
const engineStatus = document.getElementById('engineStatus');
const calcBtn = document.getElementById('calcBtn');
const runNote = document.getElementById('runNote');

const forcedGaugeSelect = document.getElementById('forcedGauge');
const materialSelect = document.getElementById('conductorMaterial');
const conduitTypeSelect = document.getElementById('conduitType');
const isMotorCheckbox = document.getElementById('isMotor');
const motorHpSelect = document.getElementById('motorHp');
const motorProtectionKindSelect = document.getElementById('motorProtectionKind');
const loadsCard = document.getElementById('loadsCard');
const motorCard = document.getElementById('motorCard');
const forcedProtectionSelect = document.getElementById('forcedProtection');
const protectionField = document.getElementById('protectionField');

function currentThreePhase() {
  return CONDUCTOR_SYSTEMS[conductorSystemSelect.value].carriers === 3;
}

function populateMotorHpOptions() {
  const previous = motorHpSelect.value;
  const voltage = parseInt(voltageSelect.value, 10);
  motorHpSelect.innerHTML = '';
  JSON.parse(motor_hp_labels(voltage, currentThreePhase())).forEach(label => {
    const opt = document.createElement('option');
    opt.value = label;
    opt.textContent = label + ' hp';
    motorHpSelect.appendChild(opt);
  });
  if ([...motorHpSelect.options].some(o => o.value === previous)) motorHpSelect.value = previous;
}

function toggleMotorMode() {
  const isMotor = isMotorCheckbox.checked;
  loadsCard.style.display = isMotor ? 'none' : '';
  motorCard.style.display = isMotor ? '' : 'none';
  // La protección de motor (Tabla 430-52, por tipo de dispositivo) ya se calcula
  // en la tarjeta de motor -- este selector es solo para circuitos generales.
  protectionField.style.display = isMotor ? 'none' : '';
  if (isMotor) populateMotorHpOptions();
}
isMotorCheckbox.addEventListener('change', toggleMotorMode);

function populateForcedGaugeOptions() {
  const previous = forcedGaugeSelect.value;
  forcedGaugeSelect.innerHTML = '<option value="">Automático (mínimo que cumple ampacidad)</option>';
  JSON.parse(conductor_names(materialSelect.value)).forEach(name => {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name;
    forcedGaugeSelect.appendChild(opt);
  });
  // conservar la selección si el calibre sigue existiendo para el nuevo material
  if ([...forcedGaugeSelect.options].some(o => o.value === previous)) forcedGaugeSelect.value = previous;
}

__wbg_init(b64ToBytes("__WASM_B64__")).then(() => {
  engineDot.classList.add('live');
  engineStatus.textContent = 'Motor cargado (WebAssembly, compilado desde Rust) — listo para calcular.';
  calcBtn.disabled = false;
  runNote.textContent = '';

  populateForcedGaugeOptions();
  JSON.parse(conduit_types()).forEach(t => {
    const opt = document.createElement('option');
    opt.value = t.value;
    opt.textContent = t.label;
    conduitTypeSelect.appendChild(opt);
  });
  JSON.parse(motor_protection_kinds()).forEach(k => {
    const opt = document.createElement('option');
    opt.value = k.value;
    opt.textContent = k.label;
    motorProtectionKindSelect.appendChild(opt);
  });
  JSON.parse(protection_sizes()).forEach(size => {
    const opt = document.createElement('option');
    opt.value = size;
    opt.textContent = fmt(size, 0) + ' A';
    forcedProtectionSelect.appendChild(opt);
  });
  if (isMotorCheckbox.checked) populateMotorHpOptions();
}).catch((e) => {
  engineDot.classList.add('err');
  engineStatus.textContent = 'No se pudo cargar el motor: ' + e;
});

materialSelect.addEventListener('change', populateForcedGaugeOptions);

// ==== dynamic load rows ====
const loadsBody = document.getElementById('loadsBody');

function addLoadRow(desc, va, fp, continuous) {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td><input type="text" class="ld-desc" value="${desc}" /></td>
    <td><input type="number" class="ld-va" value="${va}" step="10" /></td>
    <td><input type="number" class="ld-fp" value="${fp}" step="0.01" min="0" max="1" /></td>
    <td class="chk"><input type="checkbox" class="ld-cont" ${continuous ? 'checked' : ''} /></td>
    <td class="rm"><button type="button" class="icon-btn rm-btn" title="Quitar">&times;</button></td>
  `;
  tr.querySelector('.rm-btn').addEventListener('click', () => tr.remove());
  loadsBody.appendChild(tr);
}

addLoadRow('Compresor', 8000, 0.88, true);
addLoadRow('Banda transportadora', 5000, 0.85, true);
addLoadRow('Tablero de control', 2000, 0.90, false);

document.getElementById('addLoad').addEventListener('click', () => addLoadRow('Nueva carga', 1000, 0.9, false));

// ==== sistema de conductores ====
// El usuario declara explícitamente el sistema (cuántas fases/portadores,
// si lleva neutro, si lleva tierra) en vez de que el programa lo adivine de
// tensión + trifásico/monofásico -- una memoria real de referencia mostró que
// esa inferencia automática se equivoca (un alimentador de tablero trifásico
// con cargas mixtas SÍ lleva neutro, pero un circuito de motor trifásico NO).
// Solo el número de portadores (1/2 vs 3) determina la fórmula eléctrica
// (monofásica P=VI vs trifásica P=√3·V·I) -- 2 fases se calcula igual que 1,
// es un solo lazo de circuito (p. ej. 220 V línea-línea).
const CONDUCTOR_SYSTEMS = {
  '1p1n':   { carriers: 1, neutral: true,  ground: false, label: '1 fase + 1 neutro' },
  '1p1n1g': { carriers: 1, neutral: true,  ground: true,  label: '1 fase + 1 neutro + 1 tierra' },
  '2p1g':   { carriers: 2, neutral: false, ground: true,  label: '2 fases + 1 tierra' },
  '2p1n':   { carriers: 2, neutral: true,  ground: false, label: '2 fases + 1 neutro' },
  '2p1n1g': { carriers: 2, neutral: true,  ground: true,  label: '2 fases + 1 neutro + 1 tierra' },
  '3p1g':   { carriers: 3, neutral: false, ground: true,  label: '3 fases + 1 tierra' },
  '3p1n':   { carriers: 3, neutral: true,  ground: false, label: '3 fases + 1 neutro' },
  '3p1n1g': { carriers: 3, neutral: true,  ground: true,  label: '3 fases + 1 neutro + 1 tierra' },
};

const voltageSelect = document.getElementById('voltage');
const conductorSystemSelect = document.getElementById('conductorSystem');

// Conductores portadores de corriente para el factor de ajuste por agrupamiento
// (Tabla 310-15(b)(3)(a)) -- ya no se pregunta, se deriva del sistema: en un
// circuito de 1 fase + neutro, el neutro va y viene con la misma corriente que la
// fase (ambos cuentan); en 2 o 3 fases con neutro, el neutro de un sistema
// balanceado casi no lleva corriente y NO se cuenta (nota informativa del Art.
// 310-15(b)(5)) -- por eso el conteo es simplemente el número de fases en esos
// casos. Asume un solo circuito por canalización, igual que el cálculo de tubería.
function currentCarryingConductors(systemKey) {
  const system = CONDUCTOR_SYSTEMS[systemKey];
  return system.carriers === 1 ? 2 : system.carriers;
}

// Candado sistema -> tensión: 1 portador (fase-neutro) solo existe a 127 V; 2
// portadores (línea-línea monofásico) solo a 220 V; 3 portadores (trifásico)
// puede ser 220/440/480 V, pero no 127 V (esa es la tensión fase-neutro de un
// sistema trifásico, no una tensión trifásica en sí). Candado en un solo
// sentido -- el sistema restringe la tensión, no al revés.
const VOLTAGE_OPTIONS_BY_CARRIERS = { 1: [127], 2: [220], 3: [220, 440, 480] };

function enforceVoltageValidity() {
  const system = CONDUCTOR_SYSTEMS[conductorSystemSelect.value];
  const allowed = VOLTAGE_OPTIONS_BY_CARRIERS[system.carriers];
  [...voltageSelect.options].forEach(opt => {
    opt.disabled = !allowed.includes(parseInt(opt.value, 10));
  });
  if (!allowed.includes(parseInt(voltageSelect.value, 10))) {
    voltageSelect.value = String(allowed[0]);
  }
  if (isMotorCheckbox.checked) populateMotorHpOptions();
}

conductorSystemSelect.addEventListener('change', enforceVoltageValidity);
voltageSelect.addEventListener('change', () => { if (isMotorCheckbox.checked) populateMotorHpOptions(); });
enforceVoltageValidity();

// ==== formatting ====
const fmt = (n, d = 2) => Number(n).toLocaleString('es-MX', { minimumFractionDigits: d, maximumFractionDigits: d });

function statusMeta(status) {
  if (status === 'Cumple') return { cls: 'ok', label: 'Cumple' };
  if (status === 'Advertencia') return { cls: 'warn', label: 'Advertencia' };
  if (status === 'NoCumple') return { cls: 'bad', label: 'No cumple' };
  return { cls: 'warn', label: 'No evaluable' };
}

function overallStatus(c) {
  const statuses = [c.ampacityFinding.status, c.vdFinding.status, c.conduitFinding && c.conduitFinding.status, c.motorProtectionFinding && c.motorProtectionFinding.status, c.conductorProtectionFinding && c.conductorProtectionFinding.status];
  if (statuses.includes('NoCumple')) return 'NoCumple';
  if (statuses.includes('Advertencia')) return 'Advertencia';
  if (statuses.includes('NoEvaluable')) return 'NoEvaluable';
  return 'Cumple';
}

function materialLabel(material) { return material === 'aluminum' ? 'aluminio' : 'cobre'; }
const insulationFamilyLabels = { thhn: 'THHN/THWN-2', thw: 'TW/THW/THHW', xhhw: 'XHHW/XHHW-2' };
const conduitTypeLabels = { emt: 'EMT', pvc_sch40: 'PVC Cédula 40', rmc: 'RMC' };

function conductorMakeupHtml(c) {
  const parts = [`${c.phaseCount} fase${c.phaseCount === 1 ? '' : 's'} ${c.selection.conductor}`];
  if (c.neutralCount) parts.push(`${c.neutralCount} neutro ${c.selection.conductor}`);
  if (c.hasGround) parts.push(`1 tierra ${c.groundGauge}`);
  return `
    <span class="cal">${parts.join(' + ')}</span>
    <span>= ${c.conduitConductorCount} conductores &middot; sistema: ${CONDUCTOR_SYSTEMS[c.systemKey] ? CONDUCTOR_SYSTEMS[c.systemKey].label : ''}</span>
    ${c.hasGround ? `<span>tierra por Tabla 250-122, protección estimada ${fmt(c.protectionAmps, 0)} A</span>` : ''}
  `;
}

// ==== circuits table (added circuits) ====
function renderCircuitsTable() {
  const body = document.getElementById('circuitsBody');
  const empty = document.getElementById('circuitsEmpty');
  const table = document.getElementById('circuitsTable');
  const count = document.getElementById('circuitCount');
  const reportBtn = document.getElementById('reportBtn');
  const clearAllBtn = document.getElementById('clearAllBtn');

  count.textContent = `(${circuits.length})`;
  reportBtn.disabled = circuits.length === 0;
  clearAllBtn.disabled = circuits.length === 0;

  if (circuits.length === 0) {
    empty.style.display = 'block';
    table.style.display = 'none';
    return;
  }
  empty.style.display = 'none';
  table.style.display = 'table';
  body.innerHTML = '';
  circuits.forEach((c) => {
    const meta = statusMeta(overallStatus(c));
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${c.panel}</td>
      <td>${c.circuitName}</td>
      <td>${c.isFeeder ? 'Alimentador' : 'Derivado'}${c.isMotor ? ' &middot; Motor' : ''}</td>
      <td class="num">${c.selection.conductor}${c.forcedGauge ? ' &middot; forzado' : ''}</td>
      <td class="num">${fmt(c.requiredCurrent)} A</td>
      <td class="num">${fmt(c.vdPct)}%</td>
      <td class="num">${c.conduit ? `${c.conduit.trade_size} ${conduitTypeLabels[c.conduitType]}` : '&mdash;'}</td>
      <td><span class="chip ${meta.cls}">${meta.label}</span></td>
      <td class="rm">
        <button type="button" class="icon-btn edit-circuit" title="Editar" data-id="${c.id}">&#9998;</button>
        <button type="button" class="icon-btn rm-circuit" title="Quitar" data-id="${c.id}">&times;</button>
      </td>
    `;
    body.appendChild(tr);
  });
  body.querySelectorAll('.rm-circuit').forEach(btn => {
    btn.addEventListener('click', () => {
      circuits = circuits.filter(c => c.id !== btn.dataset.id);
      renderCircuitsTable();
      saveState();
    });
  });
  body.querySelectorAll('.edit-circuit').forEach(btn => {
    btn.addEventListener('click', () => {
      const c = circuits.find(c => c.id === btn.dataset.id);
      if (!c) return;
      circuits = circuits.filter(x => x.id !== btn.dataset.id);
      renderCircuitsTable();
      saveState();
      loadCircuitIntoForm(c);
    });
  });
}

// Carga los datos de un circuito ya agregado de vuelta al formulario, para
// corregirlo y volver a calcularlo. El circuito ya fue quitado de `circuits`
// por el llamador (edit-circuit) -- al presionar "Agregar" de nuevo entra como
// una entrada nueva, evitando duplicados.
function loadCircuitIntoForm(c) {
  document.getElementById('panelName').value = c.panel;
  document.getElementById('circuitName').value = c.circuitName;
  document.getElementById('circuitType').value = c.isFeeder ? 'feeder' : 'branch';
  conductorSystemSelect.value = c.systemKey || (c.threePhase ? '3p1g' : '2p1n1g');
  enforceVoltageValidity();
  document.getElementById('voltage').value = c.voltage;
  document.getElementById('ambientC').value = c.ambientC;
  document.getElementById('lengthM').value = c.lengthM;
  document.getElementById('insulation').value = c.insulation;
  document.getElementById('demandFactor').value = c.demandFactor;
  materialSelect.value = c.material || 'copper';
  populateForcedGaugeOptions();
  document.getElementById('forcedGauge').value = c.forcedGauge || '';
  forcedProtectionSelect.value = c.forcedProtection || '';
  document.getElementById('insulationFamily').value = c.insulationFamily || 'thhn';
  if (c.conduitType) conduitTypeSelect.value = c.conduitType;

  isMotorCheckbox.checked = !!c.isMotor;
  toggleMotorMode();
  if (c.isMotor) {
    motorHpSelect.value = c.motorHp;
    if (c.motorProtectionKind) motorProtectionKindSelect.value = c.motorProtectionKind;
  }

  loadsBody.innerHTML = '';
  c.loads.forEach(l => addLoadRow(l.desc, l.va, l.fp, l.continuous));

  lastCalc = null;
  document.getElementById('addCircuitBtn').disabled = true;
  document.getElementById('errorBox').classList.remove('show');
  document.getElementById('results').classList.remove('show');
  runNote.textContent = `Editando "${c.circuitName}" (${c.panel}) — ajusta lo que necesites y presiona Calcular, luego Agregar.`;

  document.querySelector('.wrap').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

document.getElementById('clearAllBtn').addEventListener('click', () => {
  if (circuits.length === 0) return;
  if (!confirm('¿Vaciar todos los circuitos de la memoria? Esto no se puede deshacer.')) return;
  circuits = [];
  renderCircuitsTable();
  saveState();
});

// ==== calcular (vista previa) ====
function readFormAndCalculate() {
  const panel = document.getElementById('panelName').value || 'Sin tablero';
  const circuitName = document.getElementById('circuitName').value || 'Circuito';
  const isFeeder = document.getElementById('circuitType').value === 'feeder';
  const voltage = parseFloat(document.getElementById('voltage').value);
  const ambientC = parseFloat(document.getElementById('ambientC').value);
  const lengthM = parseFloat(document.getElementById('lengthM').value);
  const insulation = document.getElementById('insulation').value;
  const demandFactor = parseFloat(document.getElementById('demandFactor').value);
  const material = materialSelect.value;
  const forcedGaugeName = document.getElementById('forcedGauge').value;
  const forcedProtectionValue = forcedProtectionSelect.value;
  const insulationFamily = document.getElementById('insulationFamily').value;
  const conduitType = conduitTypeSelect.value;
  const systemKey = conductorSystemSelect.value;
  const system = CONDUCTOR_SYSTEMS[systemKey];
  const threePhase = system.carriers === 3;
  const grouped = currentCarryingConductors(systemKey);
  const isMotor = isMotorCheckbox.checked;

  // Un circuito de motor se dimensiona distinto (Art. 430): la corriente sale de
  // una tabla por hp (no de una lista de cargas en VA), y su ampacidad requerida
  // ya es 125% de esa corriente de tabla por definición (Art. 430-22) -- se trata
  // siempre como carga continua. El resto del pipeline (selección de conductor,
  // caída de tensión, tubería) es el mismo para ambos tipos de circuito.
  let loads = [];
  let installedVa = 0;
  let demandVa = 0;
  let isContinuous = true;
  let designCurrent, requiredCurrent;
  let motorHp = null, motorFlc = null, motorProtectionKind = null, motorProtectionAmpsValue = null;

  if (isMotor) {
    motorHp = motorHpSelect.value;
    if (!motorHp) throw new Error('Elige la potencia (hp) del motor.');
    motorFlc = motor_flc_amps(motorHp, voltage, threePhase);
    motorProtectionKind = motorProtectionKindSelect.value;
    designCurrent = motorFlc;
    requiredCurrent = motor_conductor_ampacity(motorFlc);
    motorProtectionAmpsValue = motor_protection_amps(motorFlc, motorProtectionKind);
  } else {
    const rows = [...loadsBody.querySelectorAll('tr')];
    if (rows.length === 0) throw new Error('Agrega al menos una carga.');
    loads = rows.map(tr => ({
      desc: tr.querySelector('.ld-desc').value,
      va: parseFloat(tr.querySelector('.ld-va').value),
      fp: parseFloat(tr.querySelector('.ld-fp').value),
      continuous: tr.querySelector('.ld-cont').checked,
    }));
    installedVa = loads.reduce((s, l) => s + l.va, 0);
    demandVa = installedVa * demandFactor;
    isContinuous = loads.some(l => l.continuous);
    designCurrent = design_current_amps(demandVa, voltage, threePhase);
    requiredCurrent = continuous_load_adjusted_current(designCurrent, isContinuous);
  }

  // El calibre automático (mínimo por ampacidad) siempre se calcula, aunque se
  // fuerce uno distinto abajo — así el reporte puede mostrar cuál habría elegido
  // el motor por su cuenta.
  const autoSelection = JSON.parse(select_conductor(requiredCurrent, material, insulation, ambientC, grouped));

  let selection = autoSelection;
  let forcedGauge = null;
  if (forcedGaugeName) {
    selection = JSON.parse(conductor_ampacity_by_name(forcedGaugeName, material, insulation, ambientC, grouped));
    forcedGauge = forcedGaugeName;
  }

  const vdPct = voltage_drop_percent(requiredCurrent, lengthM, selection.conductor, material, threePhase, voltage);

  const vdFinding = JSON.parse(evaluate_voltage_drop(circuitName, isFeeder, vdPct));
  const ampacityFinding = JSON.parse(evaluate_conductor_ampacity(circuitName, requiredCurrent, selection.corrected_ampacity));

  // Protección de circuito general (no de motor -- esa ya se calculó arriba con
  // Tabla 430-52): automática (siguiente tamaño comercial &ge; ampacidad, Art.
  // 240-4(d)) o forzada a un tamaño específico por el usuario. El máximo permitido
  // siempre es el valor automático -- forzar algo mayor es una violación real.
  let autoProtectionAmps = null;
  let circuitProtectionAmps = null;
  let conductorProtectionFinding = null;
  if (!isMotor) {
    autoProtectionAmps = estimate_protection_amps(selection.corrected_ampacity);
    circuitProtectionAmps = forcedProtectionValue ? parseFloat(forcedProtectionValue) : autoProtectionAmps;
    conductorProtectionFinding = JSON.parse(
      evaluate_conductor_protection(circuitName, circuitProtectionAmps, selection.corrected_ampacity, autoProtectionAmps),
    );
  }

  // Fases/neutro/tierra vienen del sistema que declaró el usuario (systemKey),
  // no de una inferencia automática -- una memoria real de referencia mostró que
  // esa inferencia se equivoca en casos reales (alimentador de tablero trifásico
  // con neutro vs. circuito de motor trifásico sin neutro). Cuando el sistema
  // incluye tierra, su calibre se deriva de la norma: protección estimada del
  // circuito (Tabla 240-6(a)) → Tabla 250-122; fases y neutro se asumen del mismo
  // calibre (c.selection.conductor).
  const phaseArea = conductor_area_mm2(selection.conductor, insulationFamily);
  const neutralCount = system.neutral ? 1 : 0;
  let protectionAmps = null;
  let groundGauge = null;
  let groundArea = 0;
  if (system.ground) {
    // Para un motor, la protección real del circuito derivado (Tabla 430-52) ya
    // se calculó arriba -- se usa esa, no la estimación genérica, para que el
    // calibre de tierra (Tabla 250-122) refleje el dispositivo real.
    protectionAmps = isMotor ? motorProtectionAmpsValue : circuitProtectionAmps;
    groundGauge = grounding_conductor_awg(protectionAmps);
    groundArea = conductor_area_mm2(groundGauge, insulationFamily);
  }
  const conduitConductorCount = system.carriers + neutralCount + (system.ground ? 1 : 0);
  const totalConductorAreaMm2 = (system.carriers + neutralCount) * phaseArea + groundArea;

  const conduit = JSON.parse(select_conduit_by_area(totalConductorAreaMm2, conduitConductorCount, conduitType));
  const conduitFinding = JSON.parse(evaluate_conduit_fill(circuitName, conduit.required_area_mm2, conduit.usable_area_mm2));

  let motorProtectionFinding = null;
  if (isMotor) {
    motorProtectionFinding = JSON.parse(
      evaluate_motor_protection(circuitName, motorProtectionAmpsValue, motorFlc, motorProtectionAmpsValue),
    );
  }

  return {
    id: 'c' + Math.random().toString(36).slice(2, 10),
    panel, circuitName, isFeeder, threePhase, voltage, ambientC, lengthM, grouped, insulation, demandFactor,
    material, insulationFamily, conduitType,
    systemKey, phaseCount: system.carriers, neutralCount, hasGround: system.ground,
    protectionAmps, groundGauge, groundArea, phaseArea,
    conduitConductorCount,
    isMotor, motorHp, motorFlc, motorProtectionKind, motorProtectionAmps: motorProtectionAmpsValue, motorProtectionFinding,
    autoProtectionAmps, circuitProtectionAmps, forcedProtection: forcedProtectionValue || null, conductorProtectionFinding,
    loads, installedVa, demandVa, isContinuous,
    designCurrent, requiredCurrent, selection, autoSelection, forcedGauge, vdPct, vdFinding, ampacityFinding,
    conduit, conduitFinding,
  };
}

document.getElementById('calcBtn').addEventListener('click', () => {
  const errorBox = document.getElementById('errorBox');
  errorBox.classList.remove('show');
  errorBox.textContent = '';
  document.getElementById('addCircuitBtn').disabled = true;

  try {
    const c = readFormAndCalculate();
    lastCalc = c;

    document.getElementById('rProtectionStat').style.display = '';
    if (c.isMotor) {
      document.getElementById('rInstalledLabel').textContent = 'Potencia';
      document.getElementById('rInstalled').innerHTML = c.motorHp + '<small>hp</small>';
      document.getElementById('rDemandLabel').textContent = 'FLC (tabla 430)';
      document.getElementById('rDemand').innerHTML = fmt(c.motorFlc) + '<small>A</small>';
      document.getElementById('rProtectionLabel').textContent = 'Protección (motor)';
      document.getElementById('rProtection').innerHTML = fmt(c.motorProtectionAmps, 0) + '<small>A</small>';
    } else {
      document.getElementById('rInstalledLabel').textContent = 'Carga instalada';
      document.getElementById('rInstalled').innerHTML = fmt(c.installedVa, 0) + '<small>VA</small>';
      document.getElementById('rDemandLabel').textContent = 'Demanda';
      document.getElementById('rDemand').innerHTML = fmt(c.demandVa, 0) + '<small>VA</small>';
      document.getElementById('rProtectionLabel').textContent = 'Protección';
      document.getElementById('rProtection').innerHTML = fmt(c.circuitProtectionAmps, 0) + '<small>A</small>' + (c.forcedProtection ? ' <span class="chip ghost" style="font-size:9px;padding:1px 6px;">forzada</span>' : '');
    }
    document.getElementById('rDesign').innerHTML = fmt(c.designCurrent) + '<small>A</small>';
    document.getElementById('rRequired').innerHTML = fmt(c.requiredCurrent) + '<small>A</small>';
    document.getElementById('rVd').innerHTML = fmt(c.vdPct) + '<small>%</small>';
    document.getElementById('protectionLine').innerHTML = protectionLineHtml(c);

    document.getElementById('conductorLine').innerHTML = `
      <span class="cal">${c.selection.conductor}</span>
      <span>${materialLabel(c.material)} &middot; ${insulationFamilyLabels[c.insulationFamily]}</span>
      ${c.forcedGauge ? `<span class="chip ghost">Forzado manualmente &mdash; automático habría sido ${c.autoSelection.conductor}</span>` : ''}
      <span>ampacidad base ${fmt(c.selection.base_ampacity, 0)} A</span>
      <span>&times; ${fmt(c.selection.temperature_factor, 2)} temp.</span>
      <span>&times; ${fmt(c.selection.grouping_factor, 2)} agrup.</span>
      <span>= <strong>${fmt(c.selection.corrected_ampacity, 2)} A</strong> corregida</span>
    `;

    document.getElementById('conductorMakeupLine').innerHTML = conductorMakeupHtml(c);

    document.getElementById('conduitLine').innerHTML = `
      <span class="cal">${c.conduit.trade_size} ${conduitTypeLabels[c.conduitType]}</span>
      <span>${c.conduitConductorCount} conductores</span>
      <span>= <strong>${fmt(c.conduit.required_area_mm2, 1)} mm&sup2;</strong> requeridos</span>
      <span>relleno <strong>${fmt(c.conduit.fill_percent, 1)}%</strong> de ${fmt(c.conduit.usable_area_mm2, 1)} mm&sup2; utilizables</span>
    `;

    const findingsEl = document.getElementById('findings');
    findingsEl.innerHTML = '';
    const findingLabels = { caida_tension: 'Caída de tensión', ampacidad_conductor: 'Ampacidad de conductor', llenado_ducto: 'Llenado de tubería', proteccion_motor: 'Protección de motor', proteccion_circuito: 'Protección de circuito' };
    [c.ampacityFinding, c.vdFinding, c.conduitFinding, c.motorProtectionFinding, c.conductorProtectionFinding].filter(Boolean).forEach(f => {
      const meta = statusMeta(f.status);
      const div = document.createElement('div');
      div.className = 'finding ' + meta.cls;
      div.innerHTML = `
        <span class="chip ${meta.cls}">${meta.label}</span>
        <div class="body">
          <div class="rule">${findingLabels[f.rule_id] || f.rule_id}</div>
          <div class="obs">${f.observation}</div>
          <div class="ref">${f.norm_reference}</div>
        </div>
      `;
      findingsEl.appendChild(div);
    });

    document.getElementById('results').classList.add('show');
    document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    document.getElementById('addCircuitBtn').disabled = false;
  } catch (e) {
    lastCalc = null;
    errorBox.textContent = 'Error: ' + (e && e.message ? e.message : e);
    errorBox.classList.add('show');
    document.getElementById('results').classList.remove('show');
  }
});

document.getElementById('addCircuitBtn').addEventListener('click', () => {
  if (!lastCalc) return;
  circuits.push(lastCalc);
  renderCircuitsTable();
  saveState();
  document.getElementById('addCircuitBtn').disabled = true;
  document.getElementById('results').classList.remove('show');
  runNote.textContent = '';
  document.getElementById('circuitsTable').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

// ==== memoria de cálculo consolidada ====
function phaseLabel(c) { return c.threePhase ? 'Trifásico' : 'Monofásico'; }
function typeLabel(c) { return c.isFeeder ? 'Alimentador' : 'Circuito derivado'; }

const motorProtectionKindLabels = {
  inverse_time_breaker: 'Interruptor de tiempo inverso',
  time_delay_fuse: 'Fusible de acción retardada',
  non_time_delay_fuse: 'Fusible de acción rápida',
};
const motorProtectionKindPercents = {
  inverse_time_breaker: 250,
  time_delay_fuse: 175,
  non_time_delay_fuse: 300,
};

function protectionLineHtml(c) {
  if (c.isMotor) {
    const pct = motorProtectionKindPercents[c.motorProtectionKind];
    return `
      <span class="cal">${fmt(c.motorProtectionAmps, 0)} A</span>
      <span>${motorProtectionKindLabels[c.motorProtectionKind]} (Tabla 430-52)</span>
      <span>FLC ${fmt(c.motorFlc, 2)} A &times; ${pct}% = ${fmt(c.motorFlc * pct / 100, 2)} A &nbsp;&rarr;&nbsp; siguiente tamaño comercial = <strong>${fmt(c.motorProtectionAmps, 0)} A</strong></span>
    `;
  }
  const forcedNote = c.forcedProtection
    ? `<span class="chip ghost">Forzada manualmente &mdash; automática habría sido ${fmt(c.autoProtectionAmps, 0)} A</span>`
    : '';
  return `
    <span class="cal">${fmt(c.circuitProtectionAmps, 0)} A</span>
    ${forcedNote}
    <span>ampacidad corregida del conductor ${fmt(c.selection.corrected_ampacity, 2)} A &nbsp;&rarr;&nbsp; siguiente tamaño comercial &ge; esa ampacidad (Tabla 240-6(a)) = <strong>${fmt(c.autoProtectionAmps, 0)} A</strong></span>
  `;
}

function circuitSectionHtml(c) {
  const currentFormula = c.isMotor
    ? `I<sub>diseño</sub> = FLC (Tabla 430-248/430-250, de tabla &mdash; no de placa) = ${fmt(c.designCurrent, 2)} A`
    : c.threePhase
    ? `I = Demanda &divide; (V &times; &radic;3) = ${fmt(c.demandVa, 0)} &divide; (${fmt(c.voltage, 0)} &times; 1.732) = ${fmt(c.designCurrent, 2)} A`
    : `I = Demanda &divide; V = ${fmt(c.demandVa, 0)} &divide; ${fmt(c.voltage, 0)} = ${fmt(c.designCurrent, 2)} A`;
  const requiredFormula = c.isMotor
    ? `I<sub>req</sub> = FLC &times; 1.25 (Art. 430-22) = ${fmt(c.designCurrent, 2)} &times; 1.25 = ${fmt(c.requiredCurrent, 2)} A`
    : c.isContinuous
    ? `I<sub>req</sub> = I<sub>diseño</sub> &times; 1.25 (carga continua) = ${fmt(c.designCurrent, 2)} &times; 1.25 = ${fmt(c.requiredCurrent, 2)} A`
    : `I<sub>req</sub> = I<sub>diseño</sub> = ${fmt(c.requiredCurrent, 2)} A (sin carga continua en el circuito)`;
  const meetsAmpacity = c.selection.corrected_ampacity >= c.requiredCurrent;
  const loadRows = c.loads.map(l => `<tr><td>${l.desc}</td><td>${fmt(l.va, 0)}</td><td>${fmt(l.fp, 2)}</td><td>${l.continuous ? 'Sí' : 'No'}</td></tr>`).join('');
  const overall = statusMeta(overallStatus(c));

  function findingBlock(f, label) {
    const meta = statusMeta(f.status);
    return `
      <div class="step">
        <span class="lbl">${label} <span class="verdict ${meta.cls}">${meta.label}</span></span>
        <div class="finding-text">${f.observation}</div>
        <div class="finding-ref">${f.norm_reference}</div>
      </div>
    `;
  }

  const materialText = c.material ? `${materialLabel(c.material)} &middot; ` : '';
  const kText = c.material === 'aluminum' ? 'K=21.2 &Omega;&middot;cmil/ft, aluminio' : 'K=12.9 &Omega;&middot;cmil/ft, cobre';

  return `
    <div class="circuit-block">
      <h3>${c.circuitName} <span class="verdict ${overall.cls}">${overall.label}</span></h3>
      <div class="step"><span class="lbl">Datos</span>
        <span class="formula">${c.isMotor ? 'Circuito de motor (Art. 430) &middot; ' : ''}${typeLabel(c)} &middot; ${fmt(c.voltage,0)} V ${phaseLabel(c)} &middot; ${fmt(c.ambientC,0)}&deg;C ambiente &middot; ${fmt(c.lengthM,1)} m &middot; ${materialText}aislamiento ${c.insulation}&deg;C &middot; ${c.grouped} conductores agrupados${c.isMotor ? '' : ` &middot; FD ${fmt(c.demandFactor,2)}`}</span>
      </div>
      ${c.isMotor ? `
      <div class="step"><span class="lbl">Motor</span>
        <span class="formula">${c.motorHp} hp &middot; protección: ${motorProtectionKindLabels[c.motorProtectionKind]}</span>
      </div>
      ` : `
      <table>
        <thead><tr><th>Carga</th><th>VA</th><th>FP</th><th>Continua</th></tr></thead>
        <tbody>${loadRows}</tbody>
      </table>
      <div class="step"><span class="lbl">Carga instalada y demanda</span>
        <span class="formula">&Sigma;VA = ${c.loads.map(l => fmt(l.va, 0)).join(' + ')} = ${fmt(c.installedVa, 0)} VA &nbsp;&rarr;&nbsp; Demanda = ${fmt(c.installedVa, 0)} &times; ${fmt(c.demandFactor, 2)} = ${fmt(c.demandVa, 0)} VA</span>
      </div>
      `}
      <div class="step"><span class="lbl">Corriente de diseño y requerida</span>
        <span class="formula">${currentFormula}</span><br/>
        <span class="formula">${requiredFormula}</span>
      </div>
      <table>
        <thead><tr><th>Calibre</th><th>Ampacidad base</th><th>F. temp.</th><th>F. agrup.</th><th>Ampacidad corregida</th></tr></thead>
        <tbody><tr>
          <td>${c.selection.conductor}</td>
          <td>${fmt(c.selection.base_ampacity, 0)} A</td>
          <td>&times; ${fmt(c.selection.temperature_factor, 2)}</td>
          <td>&times; ${fmt(c.selection.grouping_factor, 2)}</td>
          <td><strong>${fmt(c.selection.corrected_ampacity, 2)} A</strong></td>
        </tr></tbody>
      </table>
      ${c.forcedGauge ? `<div class="step"><span class="lbl">Calibre forzado manualmente</span><span class="formula">El motor habría elegido ${c.autoSelection.conductor} (mínimo por ampacidad, ${fmt(c.autoSelection.corrected_ampacity, 2)} A corregida); se fijó manualmente ${c.selection.conductor} para reducir la caída de tensión.</span></div>` : ''}
      <div class="step"><span class="formula">${fmt(c.selection.corrected_ampacity, 2)} A ${meetsAmpacity ? '&ge;' : '&lt;'} ${fmt(c.requiredCurrent, 2)} A requeridos &nbsp;&middot;&nbsp; Caída de tensión = ${fmt(c.vdPct, 2)}% (${kText})</span></div>
      ${findingBlock(c.ampacityFinding, 'Ampacidad de conductor')}
      ${findingBlock(c.vdFinding, 'Caída de tensión')}
      ${c.isMotor ? `
      <div class="step"><span class="lbl">Protección de circuito derivado de motor</span>
        <span class="formula">${motorProtectionKindLabels[c.motorProtectionKind]} (Tabla 430-52): FLC ${fmt(c.motorFlc, 2)} A &times; ${motorProtectionKindPercents[c.motorProtectionKind]}% = ${fmt(c.motorFlc * motorProtectionKindPercents[c.motorProtectionKind] / 100, 2)} A &nbsp;&rarr;&nbsp; siguiente tamaño comercial = <strong>${fmt(c.motorProtectionAmps, 0)} A</strong></span>
      </div>
      ${findingBlock(c.motorProtectionFinding, 'Protección de motor')}
      ` : c.conductorProtectionFinding ? `
      <div class="step"><span class="lbl">Protección de circuito</span>
        <span class="formula">Ampacidad corregida del conductor ${fmt(c.selection.corrected_ampacity, 2)} A &nbsp;&rarr;&nbsp; siguiente tamaño comercial &ge; esa ampacidad (Tabla 240-6(a)) = <strong>${fmt(c.autoProtectionAmps, 0)} A</strong></span>
        ${c.forcedProtection ? `<br/><span class="formula">Forzada manualmente a <strong>${fmt(c.circuitProtectionAmps, 0)} A</strong> en vez del valor automático.</span>` : ''}
      </div>
      ${findingBlock(c.conductorProtectionFinding, 'Protección de circuito')}
      ` : ''}
      ${c.conduit ? `
      <div class="step"><span class="lbl">Conductores en la tubería</span>
        <span class="formula">${typeof c.phaseCount === 'number' ? `${c.phaseCount} fase${c.phaseCount === 1 ? '' : 's'}${c.neutralCount ? ' + ' + c.neutralCount + ' neutro' : ''} ${c.selection.conductor} (${insulationFamilyLabels[c.insulationFamily]})${c.hasGround ? ` + 1 tierra ${c.groundGauge} (Tabla 250-122, protección estimada ${fmt(c.protectionAmps, 0)} A)` : ' &mdash; sistema sin tierra'}` : `${c.conduitConductorCount} conductores ${c.selection.conductor} (${insulationFamilyLabels[c.insulationFamily]})`} = ${fmt(c.conduit.required_area_mm2, 1)} mm&sup2; requeridos</span>
      </div>
      <table>
        <thead><tr><th>Tipo</th><th>Tamaño comercial</th><th>Área utilizable</th><th>% de relleno</th></tr></thead>
        <tbody><tr>
          <td>${conduitTypeLabels[c.conduitType]}</td>
          <td><strong>${c.conduit.trade_size}</strong></td>
          <td>${fmt(c.conduit.usable_area_mm2, 1)} mm&sup2;</td>
          <td>${fmt(c.conduit.fill_percent, 1)}%</td>
        </tr></tbody>
      </table>
      ${findingBlock(c.conduitFinding, 'Llenado de tubería')}
      ` : ''}
    </div>
  `;
}

function buildFullReportHtml() {
  const projectName = document.getElementById('projectName').value || 'Proyecto sin nombre';
  const projectNotes = document.getElementById('projectNotes').value;
  const today = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });

  const panels = [];
  circuits.forEach(c => {
    let p = panels.find(p => p.name === c.panel);
    if (!p) { p = { name: c.panel, circuits: [] }; panels.push(p); }
    p.circuits.push(c);
  });

  const totalCircuits = circuits.length;
  const noCumpleCount = circuits.filter(c => overallStatus(c) === 'NoCumple').length;
  const advertenciaCount = circuits.filter(c => overallStatus(c) === 'Advertencia').length;
  const cumpleCount = totalCircuits - noCumpleCount - advertenciaCount;

  const summaryRows = circuits.map(c => {
    const meta = statusMeta(overallStatus(c));
    return `<tr>
      <td>${c.panel}</td><td>${c.circuitName}</td><td>${c.isFeeder ? 'Alim.' : 'Deriv.'}${c.isMotor ? ' (motor)' : ''}</td>
      <td>${c.selection.conductor}${c.forcedGauge ? ' &middot; forzado' : ''}</td><td>${fmt(c.requiredCurrent)} A</td><td>${fmt(c.vdPct)}%</td>
      <td>${c.conduit ? `${c.conduit.trade_size} ${conduitTypeLabels[c.conduitType]}` : '&mdash;'}</td>
      <td><span class="verdict ${meta.cls}">${meta.label}</span></td>
    </tr>`;
  }).join('');

  const panelsHtml = panels.map(p => `
    <div class="panel-block">
      <h2>Tablero: ${p.name}</h2>
      ${p.circuits.map(circuitSectionHtml).join('')}
    </div>
  `).join('');

  return `
    <div class="rpt-close-bar">
      <button type="button" id="rptClose">&larr; Volver a la calculadora</button>
    </div>
    <div class="rpt">
      <h1>Memoria de cálculo</h1>
      <div class="rpt-sub">${projectName}${projectNotes ? ' &mdash; ' + projectNotes : ''}</div>
      <div class="rpt-sub">ElectraNOM &middot; motor de cálculo calc-engine / compliance-engine (Rust, compilado a WebAssembly)</div>
      <div class="rpt-meta">
        <div><strong>Fecha:</strong> ${today}</div>
        <div><strong>Tableros:</strong> ${panels.length}</div>
        <div><strong>Circuitos calculados:</strong> ${totalCircuits}</div>
        <div><strong>Cumple / Advertencia / No cumple:</strong> ${cumpleCount} / ${advertenciaCount} / ${noCumpleCount}</div>
      </div>

      <h2>Resumen de circuitos</h2>
      <table class="summary">
        <thead><tr><th>Tablero</th><th>Circuito</th><th>Tipo</th><th>Conductor</th><th>I req.</th><th>%CT</th><th>Tubería</th><th>Estado</th></tr></thead>
        <tbody>${summaryRows}</tbody>
      </table>

      ${panelsHtml}

      <div class="signoff">
        <div><div class="line">Ingeniero responsable &mdash; nombre y cédula profesional</div></div>
        <div><div class="line">Firma</div></div>
      </div>

      <div class="disclaimer">
        Generado automáticamente por el motor de cálculo de ElectraNOM (calc-engine + compliance-engine, Rust).
        Las tablas de ampacidad, corrección y las referencias normativas citadas fueron validadas línea por
        línea contra el texto oficial de la NOM-001-SEDE-2018. Este documento es una memoria de cálculo
        generada por software y requiere la revisión y firma de un ingeniero eléctrico responsable antes de
        usarse como evidencia formal de cumplimiento.
      </div>
    </div>
  `;
}

document.getElementById('reportBtn').addEventListener('click', () => {
  if (circuits.length === 0) return;
  const view = document.getElementById('reportView');
  view.innerHTML = buildFullReportHtml();
  document.getElementById('rptClose').addEventListener('click', () => {
    view.classList.remove('show');
    view.style.display = 'none';
    view.innerHTML = '';
  });
  view.classList.add('show');
  view.style.display = 'block';
  window.scrollTo(0, 0);
  setTimeout(() => window.print(), 150);
});

window.addEventListener('afterprint', () => {
  const view = document.getElementById('reportView');
  if (view) { view.classList.remove('show'); view.style.display = 'none'; }
});

document.getElementById('projectName').addEventListener('input', saveState);
document.getElementById('projectNotes').addEventListener('input', saveState);

// ==== init ====
loadState();
renderCircuitsTable();
</script>
'''

html = html.replace('__GLUE_JS__', glue_js).replace('__WASM_B64__', wasm_b64)

os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
with open(OUTPUT_PATH, 'w') as f:
    f.write(html)

print('written:', OUTPUT_PATH, '-- bytes:', len(html))
