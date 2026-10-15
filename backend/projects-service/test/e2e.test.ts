import 'reflect-metadata';
import * as assert from 'node:assert/strict';
import * as fs from 'node:fs';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

// Prueba e2e manual (no Jest -- mantener el mismo estilo minimalista que
// engine/calc-engine-wasm/test/pipeline.test.mjs): levanta el servicio Nest real
// contra un archivo SQLite descartable, y reproduce el mismo escenario de
// engine/calc-engine/tests/pipeline.rs pero a través de la API HTTP completa.
//
// AppModule se importa dinámicamente DENTRO de main(), después de fijar DB_PATH:
// un `import` estático de nivel superior se compila a un `require()` que TypeScript
// coloca antes de cualquier otra sentencia del archivo (hoisting de imports), lo que
// evaluaría TypeOrmModule.forRoot() -- y por tanto leería process.env.DB_PATH -- antes
// de que la línea de abajo llegue a fijarlo.

const DB_PATH = './e2e-test.sqlite';
process.env.DB_PATH = DB_PATH;
if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);

async function main() {
  const { AppModule } = await import('../src/app.module');
  const app = await NestFactory.create(AppModule, { logger: false });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.listen(0);
  const url = await app.getUrl();

  const post = async (path: string, body: unknown): Promise<any> => {
    const res = await fetch(`${url}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    assert.ok(res.ok, `POST ${path} falló (${res.status}): ${JSON.stringify(json)}`);
    return json;
  };
  const get = async (path: string): Promise<any> => {
    const res = await fetch(`${url}${path}`);
    const json = await res.json();
    assert.ok(res.ok, `GET ${path} falló (${res.status}): ${JSON.stringify(json)}`);
    return json;
  };

  const project = await post('/projects', {
    name: 'Planta de prueba',
    installationType: 'industrial',
    voltageClass: 'baja tensión',
  });
  assert.ok(project.id);

  const panel = await post(`/projects/${project.id}/panels`, {
    name: 'TG-1',
    voltage: 220,
  });
  assert.ok(panel.id);

  // Mismo escenario que engine/calc-engine/tests/pipeline.rs: alimentador
  // trifásico 220 V, 25 m, 35 °C ambiente, 3 conductores portadores, THHW 75 °C.
  const circuit = await post(`/panels/${panel.id}/circuits`, {
    name: 'Alim-Compresores',
    circuitType: 'alimentador',
    threePhase: true,
    isContinuousLoad: true,
    lengthM: 25,
    ambientTempC: 35,
    currentCarryingConductors: 3,
    insulationRating: '75',
  });
  assert.ok(circuit.id);

  await post(`/circuits/${circuit.id}/loads`, {
    description: 'Compresor',
    powerVa: 8000,
    powerFactor: 0.88,
  });
  await post(`/circuits/${circuit.id}/loads`, {
    description: 'Banda transportadora',
    powerVa: 5000,
    powerFactor: 0.85,
  });
  await post(`/circuits/${circuit.id}/loads`, {
    description: 'Tablero de control',
    powerVa: 2000,
    powerFactor: 0.9,
  });

  const { result, findings } = await post(`/circuits/${circuit.id}/calculate`, {
    demandFactor: 0.9,
    nominalVoltage: 220,
  });

  assert.ok(Math.abs(result.designCurrentA - 35.428) < 0.01, `design current: ${result.designCurrentA}`);
  assert.ok(
    Math.abs(result.requiredCurrentA - 44.285) < 0.01,
    `required current: ${result.requiredCurrentA}`,
  );
  assert.equal(result.selectedConductor, '8 AWG');
  assert.equal(result.temperatureFactor, 0.94);
  assert.equal(result.groupingFactor, 1);
  assert.ok(result.voltageDropPercent < 3.0);

  assert.equal(findings.length, 2);
  const vdFinding = findings.find((f: any) => f.ruleId === 'caida_tension');
  const ampacityFinding = findings.find((f: any) => f.ruleId === 'ampacidad_conductor');
  assert.equal(vdFinding.status, 'Cumple');
  assert.equal(ampacityFinding.status, 'Cumple');

  // Verifica que quedó persistido de verdad en SQLite (no solo en memoria): una
  // segunda lectura via GET, después de "reabrir" conceptualmente el recurso.
  const persisted = await get(`/circuits/${circuit.id}/calculations`);
  assert.equal(persisted.length, 1);
  assert.equal(persisted[0].id, result.id);
  assert.equal(persisted[0].complianceFindings.length, 2);

  await app.close();
  fs.unlinkSync(DB_PATH);

  console.log('OK — projects-service (SQLite + calc-engine-wasm) end-to-end:');
  console.log({ project: project.id, circuit: circuit.id, result, findings });
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
