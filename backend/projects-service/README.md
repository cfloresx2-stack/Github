# projects-service (prueba de concepto local)

Primera implementación —local, no de producción— del `projects-service` descrito en
la Sección 3.3 del plan maestro: una API REST que persiste el modelo de datos de la
Sección 9 (Project → Panel → Circuit → Load → CalculationResult →
ComplianceFinding) y usa `calc-engine-wasm` para calcular y evaluar cumplimiento.

Demuestra que el motor de Rust puede vivir detrás de un backend real, no solo en
`cargo test` o en un script de Node — es el primer punto donde carga → conductor →
cumplimiento queda persistido y consultable vía HTTP.

## Simplificaciones deliberadas frente al plan maestro (documentadas, no ocultas)

| Plan maestro (Sección 16.1 / 9) | Esta prueba de concepto | Por qué |
|---|---|---|
| PostgreSQL | **SQLite** (`better-sqlite3`), archivo local | Cero configuración, no requiere levantar un servidor de BD para probar el concepto |
| Migraciones versionadas | `synchronize: true` (TypeORM autogenera el esquema) | Aceptable en un prototipo local; **nunca en producción** — hay que reemplazarlo por migraciones antes de tocar datos reales |
| Multi-tenant (`Organization`, `User`) | Un solo tenant implícito | No hay autenticación ni autorización todavía — fuera de alcance de esta prueba |
| API completa (Sección 16.3) | Subconjunto: proyecto → tablero → circuito → cargas → calcular → consultar | Suficiente para probar el flujo completo, no la superficie completa de la API |
| Las 5 reglas de `compliance-engine` | Solo 2 (caída de tensión, ampacidad) | Son las que expone hoy `calc-engine-wasm`; agregar las otras 3 es mecánico (mismo patrón) |

## Instalar y correr

Requiere que `engine/calc-engine-wasm/pkg/` ya esté generado (ver
[`../../engine/calc-engine-wasm/README.md`](../../engine/calc-engine-wasm/README.md))
— `package.json` lo referencia como dependencia local (`file:../../engine/calc-engine-wasm/pkg`).

```bash
cd backend/projects-service
npm install
npm run build
npm start                 # sirve en http://localhost:3000, persiste en projects-service.sqlite
```

## Probar (e2e)

```bash
npm run test:e2e
```

Levanta el servicio Nest real (SQLite descartable, se borra al final), reproduce el
mismo escenario que `engine/calc-engine/tests/pipeline.rs` pero a través de HTTP
real —crear proyecto, tablero, circuito, cargas, calcular, y **releer lo persistido
con un GET separado**— y verifica que los resultados numéricos coinciden con los del
motor de Rust puro.

## Endpoints

| Método y ruta | Hace |
|---|---|
| `POST /projects` | Crea un proyecto |
| `GET /projects/:id` | Proyecto + tableros |
| `POST /projects/:id/panels` | Crea un tablero |
| `POST /panels/:id/circuits` | Crea un circuito (alimentador o derivado) |
| `POST /circuits/:id/loads` | Agrega una carga al circuito |
| `POST /circuits/:id/calculate` | Corre el pipeline completo y persiste el resultado + hallazgos de cumplimiento (snapshot inmutable) |
| `GET /circuits/:id/calculations` | Historial de cálculos del circuito, con sus hallazgos |

## Nota de implementación: orden de carga de módulos

`src/calc/calc-engine.service.ts` usa `require('calc_engine_wasm')` en vez de
`import`, porque el paquete generado por `wasm-bindgen --target nodejs` no publica
tipos como una librería npm normal. `test/e2e.test.ts` importa `AppModule`
dinámicamente dentro de `main()` (no como `import` estático de nivel superior) para
poder fijar `process.env.DB_PATH` **antes** de que se evalúe `TypeOrmModule.forRoot()`
— un `import` estático se compila a un `require()` que TypeScript coloca antes de
cualquier otra sentencia del archivo, así que habría leído la variable de entorno
antes de que la línea que la fija llegara a ejecutarse.
