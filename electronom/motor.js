/* =========================================================================
   ElectroNOM — motor de cálculo
   -------------------------------------------------------------------------
   Datos normativos de la NOM-001-SEDE-2018 y funciones puras de cálculo y
   dictamen. NO toca el DOM: todo lo que hay aquí puede ejecutarse fuera del
   navegador y probarse de forma automatizada (ver pruebas.html).

   La interfaz vive en index.html y consume estas funciones.
   ========================================================================= */

/* =========================================================================
   DATOS NORMATIVOS (NOM-001-SEDE-2018)
   ========================================================================= */

// Tabla 310-15(b)(16): Ampacidad permisible (A), <=3 conductores, 30°C ambiente
const AMPACITY_TABLE = [
  { awg:"18",  mm2:0.824, cu60:null, cu75:null, cu90:14,  al60:null, al75:null, al90:null },
  { awg:"16",  mm2:1.31,  cu60:null, cu75:null, cu90:18,  al60:null, al75:null, al90:null },
  { awg:"14",  mm2:2.08,  cu60:15,  cu75:20,  cu90:25,  al60:null, al75:null, al90:null },
  { awg:"12",  mm2:3.31,  cu60:20,  cu75:25,  cu90:30,  al60:15,  al75:20,  al90:25 },
  { awg:"10",  mm2:5.26,  cu60:30,  cu75:35,  cu90:40,  al60:25,  al75:30,  al90:35 },
  { awg:"8",   mm2:8.37,  cu60:40,  cu75:50,  cu90:55,  al60:35,  al75:40,  al90:45 },
  { awg:"6",   mm2:13.3,  cu60:55,  cu75:65,  cu90:75,  al60:40,  al75:50,  al90:55 },
  { awg:"4",   mm2:21.2,  cu60:70,  cu75:85,  cu90:95,  al60:55,  al75:65,  al90:75 },
  { awg:"3",   mm2:26.7,  cu60:85,  cu75:100, cu90:115, al60:65,  al75:75,  al90:85 },
  { awg:"2",   mm2:33.6,  cu60:95,  cu75:115, cu90:130, al60:75,  al75:90,  al90:100 },
  { awg:"1",   mm2:42.4,  cu60:110, cu75:130, cu90:145, al60:85,  al75:100, al90:115 },
  { awg:"1/0", mm2:53.49, cu60:125, cu75:150, cu90:170, al60:100, al75:120, al90:135 },
  { awg:"2/0", mm2:67.43, cu60:145, cu75:175, cu90:195, al60:115, al75:135, al90:150 },
  { awg:"3/0", mm2:85.01, cu60:165, cu75:200, cu90:225, al60:130, al75:155, al90:175 },
  { awg:"4/0", mm2:107.2, cu60:195, cu75:230, cu90:260, al60:150, al75:180, al90:205 },
  { awg:"250", mm2:127,   cu60:215, cu75:255, cu90:290, al60:170, al75:205, al90:230 },
  { awg:"300", mm2:152,   cu60:240, cu75:285, cu90:320, al60:195, al75:230, al90:260 },
  { awg:"350", mm2:177,   cu60:260, cu75:310, cu90:350, al60:210, al75:250, al90:280 },
  { awg:"400", mm2:203,   cu60:280, cu75:335, cu90:380, al60:225, al75:270, al90:305 },
  { awg:"500", mm2:253,   cu60:320, cu75:380, cu90:430, al60:260, al75:310, al90:350 },
  { awg:"600", mm2:304,   cu60:350, cu75:420, cu90:475, al60:285, al75:340, al90:385 },
  { awg:"700", mm2:355,   cu60:385, cu75:460, cu90:520, al60:315, al75:375, al90:425 },
  { awg:"750", mm2:380,   cu60:400, cu75:475, cu90:535, al60:320, al75:385, al90:435 },
  { awg:"800", mm2:405,   cu60:410, cu75:490, cu90:555, al60:330, al75:395, al90:445 },
  { awg:"900", mm2:456,   cu60:435, cu75:520, cu90:585, al60:355, al75:425, al90:480 },
  { awg:"1000",mm2:507,   cu60:455, cu75:545, cu90:615, al60:375, al75:445, al90:500 },
];

// Tabla 310-15(b)(17): Ampacidad permisible de conductores individuales
// aislados AL AIRE LIBRE (charola portacable, no tubería), 30°C ambiente.
// Verificada contra la NOM-001-SEDE-2018 (paginas 196-197) y contra el dato
// real de VERTIV (N-009): 500 kcmil = 700 A a 90°C, coincide exacto.
const AMPACITY_TABLE_17 = {
  "18":  { cu60:null, cu75:null, cu90:18,   al60:null, al75:null, al90:null },
  "16":  { cu60:null, cu75:null, cu90:24,   al60:null, al75:null, al90:null },
  "14":  { cu60:25,   cu75:30,   cu90:35,   al60:null, al75:null, al90:null },
  "12":  { cu60:30,   cu75:35,   cu90:40,   al60:25,   al75:30,   al90:35  },
  "10":  { cu60:40,   cu75:50,   cu90:55,   al60:35,   al75:40,   al90:45  },
  "8":   { cu60:60,   cu75:70,   cu90:80,   al60:45,   al75:55,   al90:60  },
  "6":   { cu60:80,   cu75:95,   cu90:105,  al60:60,   al75:75,   al90:85  },
  "4":   { cu60:105,  cu75:125,  cu90:140,  al60:80,   al75:100,  al90:115 },
  "3":   { cu60:120,  cu75:145,  cu90:165,  al60:95,   al75:115,  al90:130 },
  "2":   { cu60:140,  cu75:170,  cu90:190,  al60:110,  al75:135,  al90:150 },
  "1":   { cu60:165,  cu75:195,  cu90:220,  al60:130,  al75:155,  al90:175 },
  "1/0": { cu60:195,  cu75:230,  cu90:260,  al60:150,  al75:180,  al90:205 },
  "2/0": { cu60:225,  cu75:265,  cu90:300,  al60:175,  al75:210,  al90:235 },
  "3/0": { cu60:260,  cu75:310,  cu90:350,  al60:200,  al75:240,  al90:270 },
  "4/0": { cu60:300,  cu75:360,  cu90:405,  al60:235,  al75:280,  al90:315 },
  "250": { cu60:340,  cu75:405,  cu90:455,  al60:265,  al75:315,  al90:355 },
  "300": { cu60:375,  cu75:445,  cu90:500,  al60:290,  al75:350,  al90:395 },
  "350": { cu60:420,  cu75:505,  cu90:570,  al60:330,  al75:395,  al90:445 },
  "400": { cu60:455,  cu75:545,  cu90:615,  al60:355,  al75:425,  al90:480 },
  "500": { cu60:515,  cu75:620,  cu90:700,  al60:405,  al75:485,  al90:545 },
  "600": { cu60:575,  cu75:690,  cu90:780,  al60:455,  al75:545,  al90:615 },
  "700": { cu60:630,  cu75:755,  cu90:850,  al60:500,  al75:595,  al90:670 },
  "750": { cu60:655,  cu75:785,  cu90:885,  al60:515,  al75:620,  al90:700 },
  "800": { cu60:680,  cu75:815,  cu90:920,  al60:535,  al75:645,  al90:725 },
  "900": { cu60:730,  cu75:870,  cu90:980,  al60:580,  al75:700,  al90:790 },
  "1000":{ cu60:780,  cu75:935,  cu90:1055, al60:625,  al75:750,  al90:845 },
};

// Tabla 392-22(b)(1), columna 1 (392-22(b)(1)(b)): area de ocupacion maxima
// permisible para CABLES DE UN SOLO CONDUCTOR (no multiconductor) en charola
// tipo escalera, fondo ventilado o malla, para calibres de 250 a 900 kcmil
// (metodo de suma de areas). Ancho interior de la charola, en cm.
const TRAY_FILL_392_22_B1_COL1 = [
  { anchoCm:5,    areaMm2:1400  },
  { anchoCm:10,   areaMm2:2800  },
  { anchoCm:15,   areaMm2:4200  },
  { anchoCm:20,   areaMm2:5600  },
  { anchoCm:22.5, areaMm2:6100  },
  { anchoCm:30,   areaMm2:8400  },
  { anchoCm:40,   areaMm2:11200 },
  { anchoCm:45,   areaMm2:12600 },
  { anchoCm:50,   areaMm2:14000 },
  { anchoCm:60,   areaMm2:16800 },
  { anchoCm:75,   areaMm2:21000 },
  { anchoCm:90,   areaMm2:25200 },
];

// Tabla 310-15(b)(2)(a): factor de corrección por temperatura ambiente (base 30°C)
const TEMP_CORRECTION = [
  { max:10, f60:1.29, f75:1.20, f90:1.15 },
  { max:15, f60:1.22, f75:1.15, f90:1.12 },
  { max:20, f60:1.15, f75:1.11, f90:1.08 },
  { max:25, f60:1.08, f75:1.05, f90:1.04 },
  { max:30, f60:1.00, f75:1.00, f90:1.00 },
  { max:35, f60:0.91, f75:0.94, f90:0.96 },
  { max:40, f60:0.82, f75:0.88, f90:0.91 },
  { max:45, f60:0.71, f75:0.82, f90:0.87 },
  { max:50, f60:0.58, f75:0.75, f90:0.82 },
  { max:55, f60:0.41, f75:0.67, f90:0.76 },
  { max:60, f60:null, f75:0.58, f90:0.71 },
  { max:65, f60:null, f75:0.47, f90:0.65 },
  { max:70, f60:null, f75:0.33, f90:0.58 },
  { max:75, f60:null, f75:null, f90:0.50 },
  { max:80, f60:null, f75:null, f90:0.41 },
  { max:85, f60:null, f75:null, f90:0.29 },
];

// Tabla 310-15(b)(3)(a): factor de ajuste por número de conductores portadores de corriente
const GROUPING_ADJUSTMENT = [
  { max:3,  pct:100 },
  { max:6,  pct:80 },
  { max:9,  pct:70 },
  { max:20, pct:50 },
  { max:30, pct:45 },
  { max:40, pct:40 },
  { max:Infinity, pct:35 },
];

// Tabla 240-6(a): capacidades estándar en amperes
const BREAKER_SIZES = [15,20,25,30,35,40,45,50,60,70,80,90,100,110,125,150,175,200,225,250,300,350,400,450,500,600,700,800,1000,1200,1600,2000,2500,3000];

// 240-4(d): protección máxima para conductores pequeños de cobre, independiente de ampacidad de tabla
const SMALL_CONDUCTOR_MAX_CU = { "14":15, "12":20, "10":30 };

// Capacidades interruptivas (Icu) comerciales tipicas de interruptores
// termomagneticos en baja tension, en kA simetricos.
const INTERRUPTING_CAPACITIES_KA = [5, 10, 14, 18, 22, 25, 35, 42, 65, 100, 200];

// Tabla 250-122: tamaño mínimo del conductor de puesta a tierra de equipos,
// segun la capacidad del dispositivo de proteccion (NO segun la corriente)
const GROUND_TABLE_250_122 = [
  { maxBreaker:15,   cu:"14",  al:"12"   },
  { maxBreaker:20,   cu:"12",  al:"10"   },
  { maxBreaker:60,   cu:"10",  al:"8"    },
  { maxBreaker:100,  cu:"8",   al:"6"    },
  { maxBreaker:200,  cu:"6",   al:"4"    },
  { maxBreaker:300,  cu:"4",   al:"2"    },
  { maxBreaker:400,  cu:"3",   al:"1"    },
  { maxBreaker:500,  cu:"2",   al:"1/0"  },
  { maxBreaker:600,  cu:"1",   al:"2/0"  },
  { maxBreaker:800,  cu:"1/0", al:"3/0"  },
  { maxBreaker:1000, cu:"2/0", al:"4/0"  },
  { maxBreaker:1200, cu:"3/0", al:"250"  },
  { maxBreaker:1600, cu:"4/0", al:"350"  },
  { maxBreaker:2000, cu:"250", al:"400"  },
  { maxBreaker:2500, cu:"350", al:"600"  },
  { maxBreaker:3000, cu:"400", al:"600"  },
  { maxBreaker:4000, cu:"500", al:"750"  },
  { maxBreaker:5000, cu:"700", al:"1000" },
  { maxBreaker:6000, cu:"800", al:"1000" },
];

// Tabla 430-52: porcentaje máximo de FLC según dispositivo de protección
// (valores para motores polifásicos/monofásicos de jaula de ardilla, el caso general)

// Tabla 9: R (ohm/km) y XL (ohm/km) para cobre, 3 cables individuales en conduit no magnético (PVC), 75°C
const TABLE9_PVC_CU = {
  "14":  { r:10.2,   xl:0.190 },
  "12":  { r:6.6,    xl:0.177 },
  "10":  { r:3.9,    xl:0.164 },
  "8":   { r:2.56,   xl:0.171 },
  "6":   { r:1.61,   xl:0.167 },
  "4":   { r:1.02,   xl:0.157 },
  "3":   { r:0.82,   xl:0.154 },
  "2":   { r:0.62,   xl:0.148 },
  "1":   { r:0.49,   xl:0.151 },
  "1/0": { r:0.39,   xl:0.144 },
  "2/0": { r:0.33,   xl:0.141 },
  "3/0": { r:0.253,  xl:0.138 },
  "4/0": { r:0.203,  xl:0.135 },
  "250": { r:0.171,  xl:0.135 },
  "300": { r:0.144,  xl:0.135 },
  "350": { r:0.125,  xl:0.131 },
  "400": { r:0.108,  xl:0.131 },
  "500": { r:0.089,  xl:0.128 },
  "600": { r:0.075,  xl:0.128 },
  "750": { r:0.062,  xl:0.125 },
  "1000":{ r:0.049,  xl:0.121 },
};

/* -------------------------------------------------------------------------
   Tabla 5: area aproximada del conductor AISLADO (mm2), por familia de
   aislamiento. El area cambia bastante entre tipos para el mismo calibre
   (un 8 AWG va de 23.61 mm2 en THHN a 53.87 mm2 en RHW con cubierta), asi
   que usar la de THHN para todo subdimensiona la tuberia.
   ------------------------------------------------------------------------- */
const AREAS_AISLAMIENTO = {
  // THHN, THWN, THWN-2 (y TFN, TFFN en calibres chicos)
  THHN: {
    "18":3.548, "16":4.645, "14":6.258, "12":8.581, "10":13.61, "8":23.61, "6":32.71,
    "4":53.16, "3":62.77, "2":74.71, "1":100.8, "1/0":119.7, "2/0":143.4, "3/0":172.8,
    "4/0":208.8, "250":256.1, "300":297.3, "350":338.2, "400":378.3, "500":456.3,
    "600":559.7, "700":637.9, "750":677.2, "800":715.2, "900":794.3, "1000":869.5,
  },
  // TW, THW, THHW, THW-2
  TW: {
    "14":8.968, "12":11.68, "10":15.68, "8":28.19, "6":46.84,
    "4":62.77, "3":73.16, "2":86.00, "1":122.60, "1/0":143.40, "2/0":169.30,
    "3/0":201.10, "4/0":239.90, "250":296.50, "300":340.70, "350":384.40,
    "400":427.00, "500":509.70, "600":627.7, "700":710.3, "750":751.7,
    "800":791.7, "900":874.9, "1000":953.8,
  },
  // XHHW, XHHW-2, XHH, ZW
  XHHW: {
    "14":8.968, "12":11.68, "10":15.68, "8":28.19, "6":38.06,
    "4":52.52, "3":62.06, "2":73.94, "1":98.97, "1/0":117.7, "2/0":141.3,
    "3/0":170.5, "4/0":206.3, "250":251.9, "300":292.6, "350":333.3,
    "400":373, "500":450.6, "600":561.9, "700":640.2, "750":679.5,
    "800":717.5, "900":796.8, "1000":872.2,
  },
  // RHH, RHW, RHW-2 CON cubierta exterior (las de mayor area)
  RHW: {
    "14":18.9, "12":22.77, "10":28.19, "8":53.87, "6":67.16,
    "4":86, "3":98.13, "2":112.9, "1":171.6, "1/0":196.1, "2/0":226.1,
    "3/0":262.7, "4/0":306.7, "250":405.9, "300":457.3, "350":507.7,
    "400":556.5, "500":650.5, "600":782.9, "700":874.9, "750":920.8,
    "800":965, "900":1057, "1000":1143,
  },
};

/* -------------------------------------------------------------------------
   Tipos de aislamiento de uso comun en Mexico.

   - tempSeco / tempMojado: temperatura nominal segun Tabla 310-104(a), que
     define la columna de ampacidad de la Tabla 310-15(b)(16). Varios tipos
     tienen doble valor (90 C en seco, 75 C en mojado).
   - mojado: si el tipo esta en la lista de permitidos para lugares mojados
     del Art. 310-10(c). Ojo: THHN "puro" NO lo esta (el alambre comercial
     suele venir con doble marcado THHN/THWN, que si lo permite).
   - areas: familia de la Tabla 5 para el llenado de tuberia.
   ------------------------------------------------------------------------- */
const INSULATION_TYPES = {
  "THHN":   { label:"THHN — 90 °C, solo lugares secos", tempSeco:"90", tempMojado:null, mojado:false, areas:"THHN" },
  "THWN":   { label:"THWN — 75 °C",                     tempSeco:"75", tempMojado:"75", mojado:true,  areas:"THHN" },
  "THWN-2": { label:"THWN-2 — 90 °C",                   tempSeco:"90", tempMojado:"90", mojado:true,  areas:"THHN" },
  "TW":     { label:"TW — 60 °C",                       tempSeco:"60", tempMojado:"60", mojado:true,  areas:"TW"   },
  "THW":    { label:"THW — 75 °C",                      tempSeco:"75", tempMojado:"75", mojado:true,  areas:"TW"   },
  "THHW":   { label:"THHW — 90 °C seco / 75 °C mojado", tempSeco:"90", tempMojado:"75", mojado:true,  areas:"TW"   },
  "XHHW":   { label:"XHHW — 90 °C seco / 75 °C mojado", tempSeco:"90", tempMojado:"75", mojado:true,  areas:"XHHW" },
  "XHHW-2": { label:"XHHW-2 — 90 °C",                   tempSeco:"90", tempMojado:"90", mojado:true,  areas:"XHHW" },
  "RHW":    { label:"RHW — 75 °C, con cubierta",        tempSeco:"75", tempMojado:"75", mojado:true,  areas:"RHW"  },
};

// Temperatura nominal aplicable segun el tipo y si el lugar es mojado.
// Devuelve null si el tipo no esta permitido en lugares mojados.
function tempDeAislamiento(tipo, lugarMojado) {
  const t = INSULATION_TYPES[tipo];
  if (!t) return null;
  return lugarMojado ? t.tempMojado : t.tempSeco;
}

// Area del conductor aislado, en mm2, para un tipo y calibre dados.
function areaConductor(tipo, awg) {
  const t = INSULATION_TYPES[tipo];
  const familia = t ? t.areas : "THHN";
  return AREAS_AISLAMIENTO[familia][awg];
}

// Se conserva el nombre anterior como alias de la familia THHN.
const CONDUCTOR_AREA_THHN = AREAS_AISLAMIENTO.THHN;

// Tabla 4 (Capitulo 10): dimensiones y area disponible (mm2) por tuberia, columnas 1/2/>2 conductores (fr=53/31/40%)
const CONDUIT_TABLES = {
  pvc40: { name: "PVC Cédula 40 (Art. 352/353)", rows: [
    { trade:'1/2"', one:75,  two:44,  over2:56 }, { trade:'3/4"', one:173, two:101, over2:131 },
    { trade:'1"',   one:284, two:166, over2:214 }, { trade:'1-1/4"', one:495, two:290, over2:374 },
    { trade:'1-1/2"', one:679, two:397, over2:513 }, { trade:'2"',   one:1126, two:658, over2:849 },
    { trade:'2-1/2"', one:1605, two:939, over2:1212 }, { trade:'3"',   one:2487, two:1455, over2:1877 },
    { trade:'3-1/2"', one:3327, two:1946, over2:2511 }, { trade:'4"',   one:4288, two:2508, over2:3237 },
    { trade:'5"',   one:6756, two:3952, over2:5099 }, { trade:'6"',   one:9770, two:5714, over2:7373 },
  ]},
  pvc80: { name: "PVC Cédula 80 (Art. 352)", rows: [
    { trade:'1/2"', one:75,  two:44,  over2:56 }, { trade:'3/4"', one:139, two:82, over2:105 },
    { trade:'1"',   one:236, two:138, over2:178 }, { trade:'1-1/4"', one:424, two:248, over2:320 },
    { trade:'1-1/2"', one:585, two:342, over2:442 }, { trade:'2"',   one:983, two:575, over2:742 },
    { trade:'2-1/2"', one:1410, two:825, over2:1064 }, { trade:'3"',   one:2200, two:1287, over2:1660 },
    { trade:'3-1/2"', one:2972, two:1738, over2:2243 }, { trade:'4"',   one:3852, two:2253, over2:2907 },
    { trade:'5"',   one:6105, two:3571, over2:4607 }, { trade:'6"',   one:8752, two:5119, over2:6605 },
  ]},
  pvcA: { name: "PVC Tipo A (Art. 352)", rows: [
    { trade:'1/2"', one:132, two:77, over2:100 }, { trade:'3/4"', one:222, two:130, over2:168 },
    { trade:'1"',   one:370, two:216, over2:279 }, { trade:'1-1/4"', one:604, two:353, over2:456 },
    { trade:'1-1/2"', one:795, two:465, over2:600 }, { trade:'2"',   one:1245, two:728, over2:940 },
    { trade:'2-1/2"', one:1863, two:1090, over2:1406 }, { trade:'3"',   one:2799, two:1637, over2:2112 },
    { trade:'3-1/2"', one:3655, two:2138, over2:2758 }, { trade:'4"',   one:4695, two:2746, over2:3543 },
  ]},
  pvcEB: { name: "PVC Tipo EB (Art. 352)", rows: [
    { trade:'2"',   one:1324, two:774, over2:999 }, { trade:'3"',   one:2979, two:1743, over2:2248 },
    { trade:'3-1/2"', one:3884, two:2272, over2:2932 }, { trade:'4"',   one:4937, two:2887, over2:3726 },
    { trade:'5"',   one:7586, two:4437, over2:5726 }, { trade:'6"',   one:10776, two:6303, over2:8133 },
  ]},
  emt: { name: "Metálico EMT (Art. 358)", rows: [
    { trade:'1/2"', one:104, two:61,  over2:78 }, { trade:'3/4"', one:182, two:106, over2:137 },
    { trade:'1"',   one:295, two:172, over2:222 }, { trade:'1-1/4"', one:513, two:300, over2:387 },
    { trade:'1-1/2"', one:696, two:407, over2:526 }, { trade:'2"',   one:1147, two:671, over2:866 },
    { trade:'2-1/2"', one:2005, two:1173, over2:1513 }, { trade:'3"',   one:3022, two:1767, over2:2280 },
    { trade:'3-1/2"', one:3949, two:2310, over2:2980 }, { trade:'4"',   one:5046, two:2951, over2:3808 },
  ]},
  ent: { name: "No metálico ENT (Art. 362)", rows: [
    { trade:'1/2"', one:97,  two:57,  over2:73 }, { trade:'3/4"', one:174, two:102, over2:131 },
    { trade:'1"',   one:284, two:166, over2:215 }, { trade:'1-1/4"', one:497, two:291, over2:375 },
    { trade:'1-1/2"', one:679, two:397, over2:512 }, { trade:'2"',   one:1125, two:658, over2:849 },
  ]},
  fmc: { name: "Metálico flexible FMC (Art. 348)", rows: [
    { trade:'3/8"', one:39, two:23, over2:30 }, { trade:'1/2"', one:108, two:63,  over2:81 },
    { trade:'3/4"', one:182, two:106, over2:137 }, { trade:'1"',   one:279, two:163, over2:211 },
    { trade:'1-1/4"', one:437, two:256, over2:330 }, { trade:'1-1/2"', one:636, two:372, over2:480 },
    { trade:'2"',   one:1117, two:653, over2:843 }, { trade:'2-1/2"', one:1678, two:982, over2:1267 },
    { trade:'3"',   one:2417, two:1414, over2:1824 }, { trade:'3-1/2"', one:3290, two:1924, over2:2483 },
    { trade:'4"',   one:4297, two:2513, over2:3243 },
  ]},
  imc: { name: "Metálico semipesado IMC (Art. 342)", rows: [
    { trade:'1/2"', one:117, two:69,  over2:89 }, { trade:'3/4"', one:200, two:117, over2:151 },
    { trade:'1"',   one:329, two:192, over2:248 }, { trade:'1-1/4"', one:564, two:330, over2:425 },
    { trade:'1-1/2"', one:759, two:444, over2:573 }, { trade:'2"',   one:1241, two:726, over2:937 },
    { trade:'2-1/2"', one:1753, two:1026, over2:1323 }, { trade:'3"',   one:2711, two:1586, over2:2046 },
    { trade:'3-1/2"', one:3616, two:2115, over2:2729 }, { trade:'4"',   one:4624, two:2705, over2:3490 },
  ]},
  rmc: { name: "Metálico pesado RMC (Art. 344)", rows: [
    { trade:'1/2"', one:108, two:63,  over2:81 }, { trade:'3/4"', one:187, two:109, over2:141 },
    { trade:'1"',   one:303, two:177, over2:229 }, { trade:'1-1/4"', one:522, two:305, over2:394 },
    { trade:'1-1/2"', one:707, two:413, over2:533 }, { trade:'2"',   one:1165, two:681, over2:879 },
    { trade:'2-1/2"', one:1663, two:972, over2:1255 }, { trade:'3"',   one:2565, two:1500, over2:1936 },
    { trade:'3-1/2"', one:3424, two:2003, over2:2584 }, { trade:'4"',   one:4408, two:2578, over2:3326 },
    { trade:'5"',   one:6916, two:4045, over2:5220 }, { trade:'6"',   one:9975, two:5834, over2:7528 },
  ]},
  lfncA: { name: "No metálico flexible hermético LFNC-A (Art. 356)", rows: [
    { trade:'3/8"', one:66,  two:39,  over2:50 }, { trade:'1/2"', one:107, two:62,  over2:80 },
    { trade:'3/4"', one:184, two:107, over2:139 }, { trade:'1"',   one:292, two:171, over2:221 },
    { trade:'1-1/4"', one:513, two:300, over2:387 }, { trade:'1-1/2"', one:690, two:403, over2:520 },
    { trade:'2"',   one:1143, two:669, over2:863 },
  ]},
  lfncB: { name: "No metálico flexible hermético LFNC-B (Art. 356)", rows: [
    { trade:'3/8"', one:65,  two:38,  over2:49 }, { trade:'1/2"', one:108, two:63,  over2:81 },
    { trade:'3/4"', one:185, two:108, over2:140 }, { trade:'1"',   one:299, two:175, over2:226 },
    { trade:'1-1/4"', one:522, two:305, over2:394 }, { trade:'1-1/2"', one:676, two:395, over2:510 },
    { trade:'2"',   one:1108, two:648, over2:836 },
  ]},
  lfmc: { name: "Metálico flexible hermético LFMC (Art. 350)", rows: [
    { trade:'3/8"', one:65,  two:38,  over2:49 }, { trade:'1/2"', one:108, two:63,  over2:81 },
    { trade:'3/4"', one:185, two:108, over2:140 }, { trade:'1"',   one:299, two:175, over2:226 },
    { trade:'1-1/4"', one:522, two:305, over2:394 }, { trade:'1-1/2"', one:676, two:395, over2:510 },
    { trade:'2"',   one:1108, two:648, over2:836 }, { trade:'2-1/2"', one:1668, two:976, over2:1259 },
    { trade:'3"',   one:2559, two:1497, over2:1931 }, { trade:'3-1/2"', one:3327, two:1946, over2:2511 },
    { trade:'4"',   one:4339, two:2538, over2:3275 },
  ]},
};

/* -------------------------------------------------------------------------
   Tabla 220-12: carga minima de alumbrado general por tipo de inmueble,
   en VA/m2. Nota de la NOM: valores basados en FP=100% y carga MINIMA (puede
   no alcanzar para la instalacion real). Verificada contra paginas reales
   de la NOM-001-SEDE-2018 (Cesar, 2026-08-23), no transcrita de memoria.
   ------------------------------------------------------------------------- */
const LIGHTING_LOAD_TABLE_220_12 = {
  bancos:            { label: "Bancos",                                                      vaM2: 39, nota: "Ver 220-14(k): agregar carga de contactos generales" },
  casasHuespedes:    { label: "Casas de huéspedes",                                           vaM2: 17 },
  clubes:            { label: "Clubes",                                                       vaM2: 22 },
  cuartelesAuditorios:{ label: "Cuarteles y auditorios",                                       vaM2: 11 },
  depositos:         { label: "Depósitos (almacenamiento)",                                    vaM2: 3  },
  oficinas:          { label: "Edificios de oficinas",                                         vaM2: 39, nota: "Ver 220-14(k): agregar carga de contactos generales" },
  industrialesComerciales: { label: "Edificios industriales y comerciales (lugares de almacenamiento)", vaM2: 22 },
  escuelas:          { label: "Escuelas",                                                      vaM2: 33 },
  estacionamientos:  { label: "Estacionamientos comerciales",                                  vaM2: 6  },
  hospitales:        { label: "Hospitales",                                                    vaM2: 22 },
  hotelesMoteles:    { label: "Hoteles y moteles, incluidos apartamentos sin cocineta",         vaM2: 22 },
  iglesias:          { label: "Iglesias",                                                      vaM2: 11 },
  juzgados:          { label: "Juzgados",                                                       vaM2: 22 },
  peluquerias:       { label: "Peluquerías y salones de belleza",                               vaM2: 33 },
  restaurantes:      { label: "Restaurantes",                                                   vaM2: 22 },
  tiendas:           { label: "Tiendas",                                                        vaM2: 33 },
  viviendas:         { label: "Unidades de vivienda",                                           vaM2: 33, nota: "Ver 220-14(j): no incluye patios abiertos, cocheras ni espacios sin terminar" },
  vestibulos:        { label: "Vestíbulos, pasillos, closets, escaleras (excepto vivienda unifamiliar)", vaM2: 6 },
  lugaresReunion:    { label: "Lugares de reunión y auditorios (excepto vivienda unifamiliar)", vaM2: 11 },
  bodegas:           { label: "Bodegas (excepto vivienda unifamiliar)",                         vaM2: 3  },
};

/* -------------------------------------------------------------------------
   Tabla 220-42: factores de demanda de alumbrado general, por tramos
   marginales (como una tabla de impuestos: el primer tramo de VA paga un
   %, el siguiente tramo otro %, etc. -- NO es un umbral que aplique un solo
   porcentaje a toda la carga). "todosLosDemas" cubre cualquier tipo de
   inmueble de la Tabla 220-12 que no tenga categoria propia aqui (factor
   de demanda 100%, es decir, sin reduccion).
   ------------------------------------------------------------------------- */
const DEMAND_FACTOR_TABLE_220_42 = {
  almacenes:      { label: "Almacenes",                                                tramos: [ { hasta:12500,     pct:100 }, { hasta:Infinity, pct:50 } ] },
  hospitales:     { label: "Hospitales",                                               tramos: [ { hasta:50000,     pct:40  }, { hasta:Infinity, pct:20 } ] },
  hotelesMoteles: { label: "Hoteles y moteles, incluidos apartamentos sin cocina",      tramos: [ { hasta:20000,     pct:50  }, { hasta:100000,   pct:40 }, { hasta:Infinity, pct:30 } ] },
  viviendas:      { label: "Unidades de vivienda",                                     tramos: [ { hasta:3000,      pct:100 }, { hasta:120000,   pct:35 }, { hasta:Infinity, pct:25 } ] },
  todosLosDemas:  { label: "Todos los demás",                                          tramos: [ { hasta:Infinity,  pct:100 } ] },
};

// Carga de alumbrado general instalada (Art. 220-12): VA/m2 de la tabla x area.
function calcularCargaAlumbradoGeneral(tipoInmueble, areaM2) {
  const t = LIGHTING_LOAD_TABLE_220_12[tipoInmueble];
  if (!t || !(areaM2 > 0)) return null;
  const va = t.vaM2 * areaM2;
  return { tipoInmueble, label: t.label, vaM2: t.vaM2, areaM2, va, nota: t.nota || null };
}

// Reparte vaInstalados entre los tramos marginales de una tabla de demanda
// (como una tabla de impuestos: cada tramo de VA paga su propio %, no un
// umbral que aplique un solo porcentaje a toda la carga). Compartido por
// las Tablas 220-42 (alumbrado) y 220-44 (contactos).
function aplicarTramosDemanda(tramos, vaInstalados) {
  if (!(vaInstalados >= 0)) return null;
  let restante = vaInstalados, desde = 0, vaDemanda = 0;
  const detalle = [];
  for (const tramo of tramos) {
    if (restante <= 0) break;
    const anchoTramo = tramo.hasta - desde;
    const enEsteTramo = Math.min(restante, anchoTramo);
    const vaTramo = enEsteTramo * (tramo.pct / 100);
    vaDemanda += vaTramo;
    detalle.push({ desde, hasta: tramo.hasta, pct: tramo.pct, vaEnTramo: enEsteTramo, vaDemanda: vaTramo });
    restante -= enEsteTramo;
    desde = tramo.hasta;
  }
  return { vaInstalados, vaDemanda, detalle };
}

// Aplica el factor de demanda de la Tabla 220-42 por tramos marginales.
// Nota de la NOM: estos factores NO se aplican a hospitales/hoteles/moteles
// en las zonas donde puede requerirse todo el alumbrado simultaneo (salas de
// operaciones, comedores, salas de baile) -- eso queda a criterio del
// diseñador, la herramienta no lo detecta automaticamente.
function calcularDemandaAlumbrado(categoriaDemanda, vaInstalados) {
  const t = DEMAND_FACTOR_TABLE_220_42[categoriaDemanda];
  if (!t) return null;
  const r = aplicarTramosDemanda(t.tramos, vaInstalados);
  return r && { categoriaDemanda, label: t.label, ...r };
}

// Tabla 220-44: factor de demanda de contactos (salidas de uso general) en
// inmuebles que NO son vivienda -- 100% de los primeros 10,000 VA, 50% del
// resto. Para vivienda ver 220-52/220-53 (no implementado aqui).
const DEMAND_FACTOR_TABLE_220_44 = [ { hasta:10000, pct:100 }, { hasta:Infinity, pct:50 } ];

function calcularDemandaContactos(vaInstalados) {
  return aplicarTramosDemanda(DEMAND_FACTOR_TABLE_220_44, vaInstalados);
}

// Art. 220-52: circuitos de aparatos pequeños y de lavadora en vivienda
// (unidad de vivienda mayor a 60 m2). 1500 VA por cada circuito de 2 hilos
// de cada tipo. Estas cargas se SUMAN a la de alumbrado general ANTES de
// aplicar el factor de demanda de la Tabla 220-42 -- no llevan su propio
// factor de demanda por separado.
function calcularCargasPequenosYLavadora(nPequenos, nLavadora) {
  if (!(nPequenos >= 0) || !(nLavadora >= 0)) return null;
  const vaPequenos = nPequenos * 1500;
  const vaLavadora = nLavadora * 1500;
  return { nPequenos, nLavadora, vaPequenos, vaLavadora, va: vaPequenos + vaLavadora };
}

// Art. 220-53: factor de demanda de aparatos fijos en vivienda. 75% cuando
// hay 4 o mas aparatos fijos conectados al mismo alimentador; con menos de
// 4, sin reduccion (100%). NO incluye estufas, secadoras, calefaccion fija
// ni aire acondicionado (cada uno tiene su propia regla, aparte).
function calcularDemandaAparatosFijos(vaInstalados, cantidad) {
  if (!(vaInstalados >= 0) || !(cantidad >= 0)) return null;
  const factor = cantidad >= 4 ? 75 : 100;
  return { vaInstalados, cantidad, factor, vaDemanda: vaInstalados * (factor / 100) };
}

// Tabla 220-54: factor de demanda de secadoras electricas domesticas de
// ropa, segun cantidad de secadoras. Carga minima por secadora: 5000 VA o
// la de la placa de datos, la que sea mayor. Solo implementado de 1 a 11
// secadoras (rango verificado contra la hoja "Tablas Art 220" del
// catalogo); mas de 11 usa una formula distinta, no implementada.
const DEMAND_FACTOR_TABLE_220_54 = { 1:100, 2:100, 3:100, 4:100, 5:85, 6:75, 7:65, 8:60, 9:55, 10:50, 11:47 };
function calcularDemandaSecadoras(cantidad, vaPlacaPorSecadora) {
  if (!Number.isInteger(cantidad) || cantidad < 1) return null;
  const pct = DEMAND_FACTOR_TABLE_220_54[cantidad];
  if (pct === undefined) {
    return { noEvaluable: true, motivo: `Solo implementado para 1 a 11 secadoras (Tabla 220-54); ${cantidad} está fuera de ese rango.` };
  }
  const vaPorSecadora = Math.max(5000, vaPlacaPorSecadora || 0);
  const vaInstalados = vaPorSecadora * cantidad;
  return { cantidad, pct, vaPorSecadora, vaInstalados, vaDemanda: vaInstalados * (pct / 100) };
}

// Tipos de sistema: define # de fases, si hay neutro/tierra y como se calculan corriente y caida de tension
const SYSTEM_TYPES = {
  "1F-1N":     { label: "1 fase + 1 neutro (2 hilos)",                fases:1, neutro:true,  tierra:false },
  "1F-1N-1T":  { label: "1 fase + 1 neutro + 1 tierra (3 hilos)",     fases:1, neutro:true,  tierra:true  },
  "2F-1T":     { label: "2 fases + 1 tierra, sin neutro (3 hilos)",   fases:2, neutro:false, tierra:true  },
  "2F-1N":     { label: "2 fases + 1 neutro (3 hilos, bifásico)",     fases:2, neutro:true,  tierra:false },
  "2F-1N-1T":  { label: "2 fases + 1 neutro + 1 tierra (4 hilos)",    fases:2, neutro:true,  tierra:true  },
  "3F-1T":     { label: "3 fases + 1 tierra, sin neutro (4 hilos)",   fases:3, neutro:false, tierra:true  },
  "3F-1N":     { label: "3 fases + 1 neutro, sin tierra (4 hilos)",   fases:3, neutro:true,  tierra:false },
  "3F-1N-1T":  { label: "3 fases + 1 neutro + 1 tierra (5 hilos)",    fases:3, neutro:true,  tierra:true  },
};
// Tensiones nominales disponibles (V)
const VOLTAGE_OPTIONS = [127, 220, 440, 480];

// Que tipo(s) de alimentacion son posibles a cada tension
const VOLTAGE_PHASE_MAP = {
  127: ["mono"],
  220: ["mono", "tri"],
  440: ["tri"],
  480: ["tri"],
};

// Que claves de SYSTEM_TYPES quedan habilitadas segun alimentacion (y, si es monofasico, segun la tension)
const PHASE_SYSTEM_MAP = {
  mono: {
    127: ["1F-1N", "1F-1N-1T"],
    220: ["2F-1T", "2F-1N", "2F-1N-1T"],
  },
  tri: ["3F-1T", "3F-1N", "3F-1N-1T"],
};

function systemMeta(key) {
  const s = SYSTEM_TYPES[key];
  const totalConductors = s.fases + (s.neutro?1:0) + (s.tierra?1:0);
  const currentCarrying = s.fases + (s.neutro?1:0);
  const vdFactor = s.fases === 3 ? Math.sqrt(3) : 2;
  const vDenom = s.fases === 3 ? Math.sqrt(3) : 1; // para I = VA / (vDenom * V)
  return { ...s, totalConductors, currentCarrying, vdFactor, vDenom };
}

const AWG_ORDER = AMPACITY_TABLE.map(r => r.awg);

// Suma vectorial de P y Q de un grupo de cargas -> VA y FP combinados reales
// (VA_total = raiz(P_total^2 + Q_total^2); NO es la suma aritmetica de los VA individuales,
// salvo que todas las cargas tengan el mismo FP)
function combinePQ(loads) {
  const p = loads.reduce((s,l) => s + l.watts, 0);
  const q = loads.reduce((s,l) => s + l.q, 0);
  const va = Math.sqrt(p*p + q*q);
  const fp = va > 0 ? p / va : 1;
  return { p, q, va, fp };
}

/* =========================================================================
   HELPERS
   ========================================================================= */
function lookupTempFactor(ambient, col) {
  for (const row of TEMP_CORRECTION) if (ambient <= row.max) return row[col];
  return null;
}
function lookupGroupingPct(n) {
  for (const row of GROUPING_ADJUSTMENT) if (n <= row.max) return row.pct;
  return 35;
}
function nextStandardBreaker(amps) {
  for (const b of BREAKER_SIZES) if (b >= amps) return b;
  return BREAKER_SIZES[BREAKER_SIZES.length - 1];
}
function fmt(n, d=2) {
  if (n === null || n === undefined || isNaN(n)) return "—";
  return Number(n).toLocaleString('es-MX', { minimumFractionDigits:0, maximumFractionDigits:d });
}

/* =========================================================================
   PASO A: CALIBRE DEL CONDUCTOR  (Art. 310-15)
   ========================================================================= */
// Art. 110-14(c)(1): limite de temperatura que imponen las TERMINALES del equipo.
// - Circuitos de 100 A o menos (o terminales marcadas para 14 AWG a 1 AWG):
//   la ampacidad se debe basar en la columna de 60 C.
// - Circuitos de mas de 100 A (o marcados para conductores mayores a 1 AWG):
//   columna de 75 C.
// En ambos casos se permite subir de columna SI el equipo esta aprobado e
// identificado para conductores de mayor temperatura (110-14(c)(1)(a)(3) y (b)(2)).
//
// Ojo con la direccion del error: usar 75 C cuando la terminal solo admite 60 C
// da MAS ampacidad por calibre, es decir selecciona conductores mas chicos.
function limiteTerminal(circuitRatingAmps, equipoMarcado75) {
  if (equipoMarcado75) return "75";
  return circuitRatingAmps <= 100 ? "60" : "75";
}

// Seleccion de calibre en DOS PASOS, como exige la combinacion de
// 310-15(b) con 110-14(c):
//   1. Los factores de correccion por temperatura y de ajuste por agrupamiento
//      se aplican sobre la columna del AISLAMIENTO del conductor (p. ej. 90 C
//      para THHN).
//   2. El resultado no puede exceder la ampacidad de ese calibre en la columna
//      de la TERMINAL (60 o 75 C). La ampacidad utilizable es la menor de las dos.
function calcularCalibre(requiredAmpacity, material, insulTemp, ambient, currentCarrying, terminalTemp) {
  const tempFactor = lookupTempFactor(ambient, "f" + insulTemp);
  const groupPct = lookupGroupingPct(currentCarrying);
  const groupFactor = groupPct / 100;
  const mat = material === "cu" ? "cu" : "al";
  const colAislamiento = mat + insulTemp;
  // Si no se indica limite de terminal, se conserva el comportamiento anterior
  // (solo la columna del aislamiento), para no romper llamadas existentes.
  const colTerminal = terminalTemp ? mat + terminalTemp : null;

  for (const row of AMPACITY_TABLE) {
    const baseAmp = row[colAislamiento];
    if (baseAmp === null || baseAmp === undefined) continue;

    const correctedAmp = baseAmp * (tempFactor ?? 1) * groupFactor;

    let limitAmp = null, usableAmp = correctedAmp, limitadaPorTerminal = false;
    if (colTerminal) {
      limitAmp = row[colTerminal];
      if (limitAmp === null || limitAmp === undefined) continue;
      if (limitAmp < correctedAmp) { usableAmp = limitAmp; limitadaPorTerminal = true; }
    }

    if (usableAmp >= requiredAmpacity) {
      return {
        awg: row.awg, mm2: row.mm2, baseAmp, tempFactor: tempFactor ?? 1, groupFactor, groupPct,
        correctedAmp, limitAmp, usableAmp, limitadaPorTerminal, terminalTemp: terminalTemp || null,
        requiredAmpacity,
      };
    }
  }
  return null;
}

/* =========================================================================
   PASO A (alterno): CALIBRE EN CHAROLA PORTACABLE  (Art. 392-80(a)(2))
   -------------------------------------------------------------------------
   Solo cables de UN SOLO CONDUCTOR (no multiconductor) en charola tipo
   escalera, malla o fondo ventilado -- NO fondo sólido (usa 310-15(c), un
   metodo distinto, no implementado).

   Base: Tabla 310-15(b)(17) (ampacidad al aire libre). Factor segun calibre
   y si la charola esta cubierta con tapa solida continua de mas de 1.80 m:
     - 1/0 AWG a 500 kcmil: sin cubierta 65%, cubierta 60%   [392-80(a)(2)(b)]
     - 600 kcmil y mayores: sin cubierta 75%, cubierta 70%   [392-80(a)(2)(a)]
     - Excepcion: una sola capa, SIN cubierta, con separacion >= 1 diametro
       entre conductores individuales -> 100%, sin reduccion [392-80(a)(2)(c)]

   No implementado (fuera de estos rangos: "noEvaluable"): calibres menores a
   1/0 AWG -- la NOM no da un porcentaje fijo para conductor individual en
   ese rango; normalmente van atados en grupos (Art. 392-22(b)), que requiere
   un tratamiento distinto no implementado.

   Igual que en tuberia, el limite de terminal (Art. 110-14(c)) se aplica
   sobre la MISMA Tabla 310-15(b)(17) -- la NOM no distingue eso por metodo
   de instalacion. La Tabla 310-15(b)(17) SI lleva correccion por temperatura
   ambiente (misma Tabla 310-15(b)(2)(a) que la Tabla 16 -- ver nota al pie
   de la tabla), pero NO lleva factor de agrupamiento: el propio Art. 392-80
   dice textualmente que 310-15(b)(3)(a) no aplica a cables de un solo
   conductor en charola.
   ========================================================================= */
function calcularAmpacidadCharola({ awg, material, insulTempCol, terminalTempCol, ambient, cubierta, capaUnicaSeparada }) {
  const t17 = AMPACITY_TABLE_17[awg];
  if (!t17) return null;
  const mat = material === "cu" ? "cu" : "al";
  const baseAmp = t17[mat + insulTempCol];
  if (baseAmp === null || baseAmp === undefined) return null;

  const areaMm2 = mm2DeAwg(awg);
  if (areaMm2 === null || areaMm2 < 53.49) {
    return { noEvaluable: true, motivo: "Solo implementado para 1/0 AWG y mayores en charola (Art. 392-80(a)(2))." };
  }

  let factor, regla;
  if (capaUnicaSeparada && !cubierta) {
    factor = 1; regla = "392-80(a)(2)(c)";
  } else if (areaMm2 >= 304) {
    factor = cubierta ? 0.70 : 0.75; regla = "392-80(a)(2)(a)";
  } else {
    factor = cubierta ? 0.60 : 0.65; regla = "392-80(a)(2)(b)";
  }

  const tempFactor = lookupTempFactor(ambient, "f" + insulTempCol) ?? 1;
  const correctedAmp = baseAmp * tempFactor * factor;

  let limitAmp = null, usableAmp = correctedAmp, limitadaPorTerminal = false;
  if (terminalTempCol) {
    limitAmp = t17[mat + terminalTempCol];
    if (limitAmp === null || limitAmp === undefined) return null;
    if (limitAmp < correctedAmp) { usableAmp = limitAmp; limitadaPorTerminal = true; }
  }

  return { baseAmp, tempFactor, factor, regla, correctedAmp, limitAmp, usableAmp, limitadaPorTerminal, cubierta, capaUnicaSeparada, areaMm2 };
}

// Empaqueta calcularAmpacidadCharola() con la forma de un objeto "calibre"
// (awg, mm2, ...) para un AWG especifico -- usado tanto por la busqueda del
// calibre inicial como por el ajuste posterior por caida de tension.
function calibreCharolaPorAwg(awg, material, insulTempCol, terminalTempCol, ambient, cubierta, capaUnicaSeparada, requiredAmpacity) {
  const r = calcularAmpacidadCharola({ awg, material, insulTempCol, terminalTempCol, ambient, cubierta, capaUnicaSeparada });
  if (!r || r.noEvaluable) return null;
  return { awg, mm2: mm2DeAwg(awg), ...r, terminalTemp: terminalTempCol || null, requiredAmpacity };
}

function calcularCalibreCharola(requiredAmpacity, material, insulTempCol, terminalTempCol, ambient, cubierta, capaUnicaSeparada) {
  for (const awg of AWG_ORDER) {
    const c = calibreCharolaPorAwg(awg, material, insulTempCol, terminalTempCol, ambient, cubierta, capaUnicaSeparada, requiredAmpacity);
    if (c && c.usableAmp >= requiredAmpacity) return c;
  }
  return null;
}

/* =========================================================================
   LLENADO DE CHAROLA PORTACABLE  (Art. 392-22(b)(1)(b))
   -------------------------------------------------------------------------
   Cables de un solo conductor, calibre 250 a 900 kcmil (127 a 456 mm²):
   suma de areas transversales aisladas contra la Tabla 392-22(b)(1),
   columna 1. No implementado (calibres fuera de ese rango, "noEvaluable"):
   4 AWG a 4/0 AWG y 1000 kcmil y mayores usan el metodo de SUMA DE
   DIAMETROS (392-22(b)(1)(a) y (d)), y el motor no tiene datos de diametro
   exterior de cable.
   ========================================================================= */
function calcularCharolaLlenado(awgFase, nFaseNeutro, awgTierra, tipoAislamiento) {
  const tipo = tipoAislamiento || "THHN";
  const areaFaseBare = mm2DeAwg(awgFase);
  if (areaFaseBare === null || areaFaseBare < 127 || areaFaseBare > 456) {
    return { noEvaluable: true, motivo: `Solo implementado para calibres de 250 a 900 kcmil (127 a 456 mm²); ${awgFase} está fuera de ese rango (392-22(b)(1)(a)/(d) usan suma de diámetros, no de áreas).` };
  }
  const areaFase = areaConductor(tipo, awgFase);
  if (!areaFase) return null;
  const areaTierra = awgTierra ? (areaConductor(tipo, awgTierra) || 0) : 0;
  const totalArea = areaFase * nFaseNeutro + areaTierra;

  const base = { areaFase, areaTierra, nFaseNeutro, totalArea, tipoAislamiento: tipo };
  for (const row of TRAY_FILL_392_22_B1_COL1) {
    if (row.areaMm2 >= totalArea) return { ...base, anchoCm: row.anchoCm, available: row.areaMm2 };
  }
  return { ...base, anchoCm: null, available: null };
}

/* =========================================================================
   PASO B: CAIDA DE TENSION  (Tabla 9, Art. 210-19 Nota 4 / 215-2 Nota 2)
   ========================================================================= */
// nParalelo: conductores en paralelo por fase (Art. 310-10(h)). Cada conductor
// lleva 1/nParalelo de la corriente total, y su impedancia (R, X de Tabla 9) es
// la de UN solo conductor -- por eso se divide la corriente, no la impedancia.
// Validado contra dos proyectos reales (Advanced Energy y VERTIV, ver N-008/N-009).
function calcularCaidaTension(awg, current, lengthM, voltage, vdFactor, fp, nParalelo) {
  const t9 = TABLE9_PVC_CU[awg];
  if (!t9) return null;
  const n = nParalelo || 1;
  const angle = Math.acos(fp);
  const ze = t9.r * fp + t9.xl * Math.sin(angle);
  const lengthKm = lengthM / 1000;
  const currentPorConductor = current / n;
  const dropV = vdFactor * currentPorConductor * lengthKm * ze;
  const dropPct = (dropV / voltage) * 100;
  return { r:t9.r, xl:t9.xl, ze, dropV, dropPct, lengthKm, vdFactor, nParalelo:n };
}

/* =========================================================================
   PASO C: CAPACIDAD DEL INTERRUPTOR
   ========================================================================= */
function calcularInterruptorGeneral(protectionCurrent, conductorCorrectedAmp, awg, material) {
  let breaker = nextStandardBreaker(protectionCurrent);
  let cap = null;
  if (material === "cu" && SMALL_CONDUCTOR_MAX_CU[awg]) {
    cap = SMALL_CONDUCTOR_MAX_CU[awg];
    if (breaker > cap) breaker = cap;
  }
  const maxByConductor = nextStandardBreaker(conductorCorrectedAmp);
  let note = "";
  if (breaker > maxByConductor && maxByConductor <= 800) {
    breaker = maxByConductor;
    note = "Limitado por la ampacidad del conductor (Art. 240-4b): se usa el valor estándar inmediato superior a la ampacidad corregida.";
  }
  return { breaker, maxByConductor, cap, note };
}
function calcularInterruptorMotor(flc, pct) {
  const maxCurrent = flc * (pct / 100);
  const breaker = nextStandardBreaker(maxCurrent);
  return { breaker, maxCurrent, pct };
}

/* =========================================================================
   PASO D: CONDUCTOR DE PUESTA A TIERRA DE EQUIPOS  (Art. 250-122)
   ========================================================================= */
function mm2DeAwg(awg) {
  const row = AMPACITY_TABLE.find(r => r.awg === awg);
  return row ? row.mm2 : null;
}
function awgPorArea(areaMm2) {
  // Menor calibre de la tabla cuya area sea >= la requerida
  for (const row of AMPACITY_TABLE) {
    if (row.mm2 >= areaMm2) return row.awg;
  }
  return AMPACITY_TABLE[AMPACITY_TABLE.length - 1].awg;
}
function calcularTierraFisica(breakerA, material, awgFaseMinima, awgFaseFinal) {
  // 250-122(a): base de tabla segun la capacidad del dispositivo de proteccion
  const fila = GROUND_TABLE_250_122.find(r => breakerA <= r.maxBreaker)
            || GROUND_TABLE_250_122[GROUND_TABLE_250_122.length - 1];
  const awgBase = material === "cu" ? fila.cu : fila.al;

  const areaFaseMin  = mm2DeAwg(awgFaseMinima);
  const areaFaseFin  = mm2DeAwg(awgFaseFinal);
  const areaBase     = mm2DeAwg(awgBase);

  // 250-122(b): si la fase se aumento por encima del minimo por ampacidad,
  // la tierra se aumenta proporcionalmente al area
  let factor = 1, awgTierra = awgBase, areaRequerida = areaBase, aumentado = false;
  if (areaFaseMin && areaFaseFin && areaFaseFin > areaFaseMin) {
    factor = areaFaseFin / areaFaseMin;
    areaRequerida = areaBase * factor;
    awgTierra = awgPorArea(areaRequerida);
    aumentado = awgTierra !== awgBase;
  }

  // 250-122(a): la tierra nunca se exige mayor que los conductores de fase
  const awgProporcional = awgTierra; // valor antes de aplicar el tope
  let limitadoPorFase = false;
  if (mm2DeAwg(awgTierra) > areaFaseFin) {
    awgTierra = awgFaseFinal;
    limitadoPorFase = true;
  }

  return { awgTierra, awgBase, awgProporcional, breakerA, factor, areaBase, areaRequerida, aumentado, limitadoPorFase };
}

/* =========================================================================
   CORTOCIRCUITO: falla trifasica simetrica por el metodo por unidad
   -------------------------------------------------------------------------
   Alcance y limitaciones (declaradas a proposito):
   - Solo sistema radial en serie: fuente -> transformador -> conductor.
     No resuelve redes en malla ni fuentes en paralelo.
   - Solo magnitud de falla trifasica simetrica; las impedancias se suman por
     magnitud, sin angulo X/R. Mismo nivel de aproximacion que el resto del motor.
   - No calcula falla linea-tierra (requiere impedancias de secuencia Z0/Z1/Z2).
   - Impedancia de fuente en 0 sobreestima la falla: es conservador para elegir
     capacidad interruptiva, nunca en contra.
   - Se toma la base en los propios datos del transformador, por lo que
     Z_transformador_pu = %Z / 100 directamente.
   ========================================================================= */
// nParalelo: conductores en paralelo por fase (Art. 310-10(h)). N conductores
// identicos en paralelo tienen 1/N de la impedancia de uno solo. Validado
// contra dos proyectos reales (Advanced Energy y VERTIV, ver N-008/N-009).
function calcularCortocircuito({ kva, zPct, voltage, zSourcePu, awg, lengthM, nParalelo }) {
  const n = nParalelo || 1;
  const sBase = kva * 1000;                 // VA
  const iBase = sBase / (Math.sqrt(3) * voltage);
  const zBase = (voltage * voltage) / sBase;

  const zTrafoPu = zPct / 100;
  const zTotalTrafoPu = zSourcePu + zTrafoPu;
  const iccTrafo = (1 / zTotalTrafoPu) * iBase;   // falla en el secundario

  // Impedancia del conductor de este circuito, con R y X reales de la Tabla 9
  let zCondOhms = null, zCondPu = null, iccCarga = null;
  const t9 = TABLE9_PVC_CU[awg];
  if (t9 && lengthM > 0) {
    zCondOhms = (Math.sqrt(t9.r * t9.r + t9.xl * t9.xl) * (lengthM / 1000)) / n;
    zCondPu = zCondOhms / zBase;
    iccCarga = (1 / (zTotalTrafoPu + zCondPu)) * iBase;
  }

  return { sBase, iBase, zBase, zTrafoPu, zSourcePu, iccTrafo, zCondOhms, zCondPu, iccCarga, nParalelo:n };
}

/* =========================================================================
   VERIFICACION TERMICA DEL CONDUCTOR ANTE CORTOCIRCUITO (I²t adiabático)
   -------------------------------------------------------------------------
   Formula de Onderdonk / ICEA P-32-382 (tambien en IEEE Std 242): area minima
   de cobre para que el conductor no exceda la temperatura maxima admisible
   de su aislamiento durante el tiempo que tarda en despejarse una falla.

       (I/A)^2 * t = 0.0297 * log10[(T2+234)/(T1+234)]

   No proviene de una tabla de la NOM (mismo tratamiento que la formula de
   Dwight del electrodo): es formula y constantes de ingenieria general.
   Solo cobre implementado -- la constante de aluminio (T0≈228) y sus limites
   de temperatura de falla son distintos y no se han agregado.

   T1: temperatura de operacion nominal del aislamiento (60/75/90).
   T2: temperatura maxima admisible DURANTE la falla (breve, adiabatica),
       segun la temperatura nominal del aislamiento. Valores de referencia de
       ICEA P-32-382 / IEEE Std 242, confirmados contra un proyecto real
       (VERTIV, N-009: aislamiento de 90 °C -> T2 = 250 °C).

   iccA: corriente de falla disponible en el circuito (antes de repartir entre
   conductores en paralelo). tSeg: tiempo de despeje de la falla, en segundos,
   segun la curva tiempo-corriente del dispositivo de proteccion -- esta
   herramienta NO lo calcula, se declara.
   ========================================================================= */
const SC_TEMP_LIMIT_CU = { "60": 150, "75": 200, "90": 250 };
const COPPER_TEMP_CONSTANT = 234;
const MM2_POR_CMIL = 0.0005067;

function mm2ACmil(mm2) {
  return mm2 / MM2_POR_CMIL;
}

function calcularVerificacionTermica({ iccA, tSeg, insulTemp, material, nParalelo }) {
  if (material !== "cu") return null; // aluminio no implementado
  const t2 = SC_TEMP_LIMIT_CU[insulTemp];
  const t1 = parseFloat(insulTemp);
  if (!t2 || !iccA || !tSeg) return null;
  const n = nParalelo || 1;
  const iccPorConductor = iccA / n;
  const k = 0.0297;
  const denom = k * Math.log10((t2 + COPPER_TEMP_CONSTANT) / (t1 + COPPER_TEMP_CONSTANT));
  const areaMinCmil = (iccPorConductor * Math.sqrt(tSeg)) / Math.sqrt(denom);
  const areaMinMm2 = areaMinCmil * MM2_POR_CMIL;
  return { iccA, iccPorConductor, tSeg, t1, t2, k, areaMinCmil, areaMinMm2, nParalelo: n };
}

/* =========================================================================
   ELECTRODO DE PUESTA A TIERRA: resistencia de una varilla vertical simple
   -------------------------------------------------------------------------
   Formula de Dwight (IEEE Std 142, tambien en Ugly's):
       R = (rho / (2*PI*L)) * [ ln(4L/d) - 1 ]
   No proviene de una tabla de la NOM: es la formula general de ingenieria.
   Lo que si es normativo es el criterio de 25 ohms del Art. 250-53(a)(2).

   No implementado: arreglos de varias varillas en paralelo ni mallas de
   tierra — la resistencia combinada depende de la resistencia mutua entre
   electrodos y requiere IEEE Std 80 / 142.
   ========================================================================= */
function calcularElectrodo({ rho, largoM, diamMm, complementario }) {
  const d = diamMm / 1000;                       // a metros
  const R = (rho / (2 * Math.PI * largoM)) * (Math.log(4 * largoM / d) - 1);

  // Art. 250-52(a)(5): dimensiones minimas del electrodo
  const cumpleLargo = largoM >= 2.44;
  const cumpleDiam = diamMm >= 16;

  // Art. 250-53(a)(2): un electrodo unico debe complementarse, salvo R <= 25 ohms
  const cumple25 = R <= 25;
  const requiereComplementario = !cumple25;
  const resuelto = cumple25 || complementario;

  return { R, rho, largoM, diamMm, complementario, cumpleLargo, cumpleDiam, cumple25, requiereComplementario, resuelto };
}

/* =========================================================================
   PASO E: DIAMETRO DE TUBERIA  (Tabla 1, 4 y 5, Cap. 10)
   ========================================================================= */
// Los conductores de fase y neutro van al calibre calculado; el de tierra
// suele ser menor, asi que su area se cuenta por separado (Nota 3 de Tabla 1:
// el conductor de puesta a tierra si cuenta para el porcentaje de ocupacion).
function calcularTuberia(awgFase, nFaseNeutro, awgTierra, conduitType, tipoAislamiento) {
  const tipo = tipoAislamiento || "THHN";
  const areaFase = areaConductor(tipo, awgFase);
  if (!areaFase) return null;
  const areaTierra = awgTierra ? (areaConductor(tipo, awgTierra) || 0) : 0;
  const totalConductors = nFaseNeutro + (awgTierra ? 1 : 0);
  const totalArea = areaFase * nFaseNeutro + areaTierra;

  let fillPct, col;
  if (totalConductors === 1) { fillPct = 53; col = "one"; }
  else if (totalConductors === 2) { fillPct = 31; col = "two"; }
  else { fillPct = 40; col = "over2"; }

  const table = CONDUIT_TABLES[conduitType];
  const base = { areaFase, areaTierra, nFaseNeutro, totalConductors, totalArea, fillPct, col,
                 conduitName: table.name, tipoAislamiento: tipo };
  for (const row of table.rows) {
    if (row[col] >= totalArea) return { ...base, trade: row.trade, available: row[col] };
  }
  return { ...base, trade: null, available: null };
}

/* =========================================================================
   MOTOR NORMATIVO: dictamen de cumplimiento
   -------------------------------------------------------------------------
   Cada regla evaluada produce un hallazgo con estado, cita normativa y
   observacion. El rule_id corresponde al catalogo de reglas normativas del
   archivo reglas_normativas.xlsx, para trazabilidad entre app y catalogo.

   Estados (mismo criterio que el compliance-engine del motor Rust):
   - Cumple:       dentro de umbrales, con evidencia.
   - Advertencia:  margen bajo, o criterio que la NOM plantea como
                   recomendacion (NOTA) y no como disposicion obligatoria.
   - No cumple:    violacion de una disposicion obligatoria.
   - No evaluable: falta informacion para emitir dictamen.
   ========================================================================= */
const ESTADO = {
  CUMPLE: "Cumple",
  ADVERTENCIA: "Advertencia",
  NO_CUMPLE: "No cumple",
  NO_EVALUABLE: "No evaluable",
};
const ESTADO_BADGE = {
  [ESTADO.CUMPLE]: "ok",
  [ESTADO.ADVERTENCIA]: "adv",
  [ESTADO.NO_CUMPLE]: "warn",
  [ESTADO.NO_EVALUABLE]: "na",
};

function hallazgo(reglaId, estado, articulo, observacion) {
  return { reglaId, estado, articulo, observacion };
}

function evaluarCumplimiento({ input, calibreIni, calibreFinal, vd, breaker, tierra, tuberia, cc, vt, el0, motor }) {
  const h = [];

  // R-002 / 310-15(a)(3): ampacidad suficiente para la carga
  const ampUtil = calibreFinal.usableAmp ?? calibreFinal.correctedAmp;
  h.push(hallazgo("R-002", ESTADO.CUMPLE, "Art. 310-15",
    `Ampacidad utilizable del conductor ${calibreFinal.awg} = ${fmt(ampUtil,2)} A, contra ${fmt(input.requiredAmpacityPorConductor ?? input.requiredAmpacity,2)} A requeridos por conductor (margen ${fmt(ampUtil - (input.requiredAmpacityPorConductor ?? input.requiredAmpacity),2)} A).`));

  // R-039 / 310-10(h): requisitos de conductores en paralelo
  if (input.nParalelo > 1) {
    h.push(hallazgo("R-039", ESTADO.ADVERTENCIA, "Art. 310-10(h)",
      `Circuito con ${input.nParalelo} conductores en paralelo por fase. Cada uno debe ser del mismo material, calibre, aislamiento y longitud, y terminar de forma similar. Este requisito no se puede verificar automáticamente: confirmar en campo/planos que los ${input.nParalelo} conjuntos son idénticos.`));
  }

  // R-007 / 310-10(c): idoneidad del aislamiento para el lugar
  const tipoAisl = INSULATION_TYPES[input.insulType];
  if (tipoAisl) {
    if (input.lugarMojado) {
      h.push(hallazgo("R-007", ESTADO.CUMPLE, "Art. 310-10(c)",
        `El circuito pasa por lugar mojado y el aislamiento ${input.insulType} está entre los permitidos. Su temperatura nominal baja a ${tipoAisl.tempMojado} °C en mojado, y ese es el valor usado.`));
    } else if (!tipoAisl.mojado) {
      h.push(hallazgo("R-007", ESTADO.ADVERTENCIA, "Art. 310-10(c)",
        `El aislamiento ${input.insulType} solo se permite en lugares SECOS. Se declaró lugar seco, así que cumple, pero conviene confirmar que ningún tramo pase por intemperie, canalización enterrada o zona húmeda. El alambre comercial suele venir con doble marcado THHN/THWN, que sí se permite en mojado.`));
    } else {
      h.push(hallazgo("R-007", ESTADO.CUMPLE, "Art. 310-10(c)",
        `Aislamiento ${input.insulType} en lugar seco: apto.`));
    }
  }

  // Art. 110-14(c): limite de temperatura de las terminales
  if (calibreFinal.terminalTemp) {
    h.push(hallazgo("R-110-14c",
      input.equipoMarcado75 ? ESTADO.CUMPLE : ESTADO.ADVERTENCIA,
      "Art. 110-14(c)",
      input.equipoMarcado75
        ? `Se declaró que el equipo está aprobado y marcado para 75 °C, así que la ampacidad se basó en esa columna. Verificar la marca en la placa del tablero o interruptor.`
        : `El circuito es de ${input.circuitRating} A, así que la ampacidad se basó en la columna de ${calibreFinal.terminalTemp} °C, como exige la norma cuando el equipo no está marcado para mayor temperatura. Si el equipo SÍ está marcado para 75 °C, se puede declarar y el calibre podría reducirse.`));
  }

  // Caida de tension: la NOM la plantea como NOTA (recomendacion), no como
  // disposicion obligatoria -> excederla es Advertencia, no No cumple.
  if (vd.dropPct === 0 && !TABLE9_PVC_CU[calibreFinal.awg]) {
    h.push(hallazgo("R-VD", ESTADO.NO_EVALUABLE, input.circuitCite,
      `No hay datos de impedancia en la Tabla 9 para el calibre ${calibreFinal.awg}; no se pudo verificar la caída de tensión.`));
  } else if (vd.dropPct <= 3) {
    h.push(hallazgo("R-VD", ESTADO.CUMPLE, input.circuitCite,
      `Caída de tensión ${fmt(vd.dropPct,2)}%, dentro del 3% recomendado.`));
  } else {
    h.push(hallazgo("R-VD", ESTADO.ADVERTENCIA, input.circuitCite,
      `Caída de tensión ${fmt(vd.dropPct,2)}%, por encima del 3% recomendado. La NOM lo establece como NOTA (criterio de eficiencia de funcionamiento), no como disposición obligatoria, pero conviene aumentar calibre o reducir longitud.`));
  }

  // R-009 / 240-4: la proteccion no debe exceder la ampacidad del conductor
  if (motor) {
    h.push(hallazgo("R-009", ESTADO.ADVERTENCIA, "Art. 430-52",
      `Circuito de motor: la protección de ${breaker.breaker} A es contra cortocircuito y falla a tierra, y puede exceder la ampacidad del conductor (${fmt(ampUtil,2)} A). La protección de sobrecarga es independiente y NO se calcula en esta herramienta — debe especificarse por separado (Parte III del Art. 430).`));
  } else if (breaker.breaker <= ampUtil) {
    h.push(hallazgo("R-009", ESTADO.CUMPLE, "Art. 240-4",
      `Protección de ${breaker.breaker} A no excede la ampacidad utilizable del conductor (${fmt(ampUtil,2)} A).`));
  } else if (breaker.breaker <= 800) {
    h.push(hallazgo("R-009", ESTADO.CUMPLE, "Art. 240-4(b)",
      `Protección de ${breaker.breaker} A excede la ampacidad del conductor (${fmt(ampUtil,2)} A), pero se acoge a la excepción de 240-4(b): es el valor estándar inmediato superior y no rebasa 800 A. No aplica si el circuito alimenta más de un contacto para cargas portátiles.`));
  } else {
    h.push(hallazgo("R-009", ESTADO.NO_CUMPLE, "Art. 240-4(c)",
      `Protección de ${breaker.breaker} A excede la ampacidad del conductor (${fmt(ampUtil,2)} A) y supera 800 A: por 240-4(c) la ampacidad debe ser igual o mayor al valor del dispositivo.`));
  }

  // R-010 / 240-6(a): valor comercial estandarizado
  h.push(hallazgo("R-010", ESTADO.CUMPLE, "Tabla 240-6(a)",
    `${breaker.breaker} A es una capacidad estandarizada.`));

  // R-034 / R-035 / 250-122: conductor de puesta a tierra
  if (!tierra) {
    h.push(hallazgo("R-034", ESTADO.NO_EVALUABLE, "Art. 250-122",
      `El sistema seleccionado (${input.systemKey}) no incluye conductor de puesta a tierra, por lo que no se dimensionó. Verificar si la canalización metálica actúa como medio de puesta a tierra (Art. 250-118).`));
  } else {
    h.push(hallazgo("R-034", ESTADO.CUMPLE, "Tabla 250-122",
      `Conductor de tierra ${tierra.awgTierra} para una protección de ${tierra.breakerA} A.`));
    if (tierra.factor > 1) {
      h.push(hallazgo("R-035", ESTADO.CUMPLE, "Art. 250-122(b)",
        tierra.limitadoPorFase
          ? `El calibre de fase se aumentó (factor ${fmt(tierra.factor,3)}); la tierra se limitó al calibre de fase ${calibreFinal.awg}, como permite 250-122(a).`
          : `El calibre de fase se aumentó (factor ${fmt(tierra.factor,3)}), y la tierra se aumentó proporcionalmente de ${tierra.awgBase} a ${tierra.awgTierra}.`));
    }
  }

  // Llenado de canalizacion (Tabla 1, Cap. 10)
  if (input.installMethod === 'charola') {
    if (tuberia.noEvaluable) {
      h.push(hallazgo("R-041", ESTADO.NO_EVALUABLE, "Art. 392-22(b)(1)", tuberia.motivo));
    } else if (tuberia.anchoCm) {
      h.push(hallazgo("R-041", ESTADO.CUMPLE, "Art. 392-22(b)(1)",
        `Charola de ${tuberia.anchoCm} cm: ${fmt(tuberia.totalArea,2)} mm² de conductores contra ${fmt(tuberia.available,0)} mm² disponibles.`));
    } else {
      h.push(hallazgo("R-041", ESTADO.NO_CUMPLE, "Art. 392-22(b)(1)",
        `Ninguna charola del rango calculado (hasta 90 cm) aloja ${fmt(tuberia.totalArea,2)} mm² de conductores. Dividir en varias charolas.`));
    }
  } else if (tuberia.trade) {
    const ocupacionPct = (tuberia.totalArea / tuberia.available) * tuberia.fillPct;
    h.push(hallazgo("R-TUB", ESTADO.CUMPLE, "Tabla 1, Cap. 10",
      `Tubería ${tuberia.trade}: ${fmt(tuberia.totalArea,2)} mm² de conductores contra ${fmt(tuberia.available,0)} mm² disponibles al ${tuberia.fillPct}% (ocupación real ${fmt(ocupacionPct,1)}%).`));
  } else {
    h.push(hallazgo("R-TUB", ESTADO.NO_CUMPLE, "Tabla 1, Cap. 10",
      `Ninguna tubería del tipo seleccionado aloja ${fmt(tuberia.totalArea,2)} mm² sin exceder el ${tuberia.fillPct}% de ocupación. Dividir en varias canalizaciones o cambiar de tipo.`));
  }

  // Art. 110-9: capacidad interruptiva
  if (!cc) {
    h.push(hallazgo("R-CC", ESTADO.NO_EVALUABLE, "Art. 110-9",
      `No se calculó la corriente de cortocircuito, por lo que no puede verificarse la capacidad interruptiva del dispositivo. Activar la sección de cortocircuito para evaluarlo.`));
  } else if (cc.icuKa * 1000 >= cc.iccTrafo) {
    h.push(hallazgo("R-CC", ESTADO.CUMPLE, "Art. 110-9",
      `Capacidad interruptiva ${cc.icuKa} kA cubre la falla disponible de ${fmt(cc.iccTrafo/1000,2)} kA.`));
  } else {
    h.push(hallazgo("R-CC", ESTADO.NO_CUMPLE, "Art. 110-9",
      `Capacidad interruptiva ${cc.icuKa} kA es MENOR que la falla disponible de ${fmt(cc.iccTrafo/1000,2)} kA. El dispositivo puede destruirse al intentar interrumpir la falla.`));
  }

  // R-040 / Art. 110-10: verificacion termica del conductor ante cortocircuito (I²t)
  if (!cc || cc.iccCarga === null) {
    h.push(hallazgo("R-040", ESTADO.NO_EVALUABLE, "Art. 110-10",
      `No hay corriente de falla en el extremo de la carga (activar cortocircuito con longitud y calibre válidos en Tabla 9) para verificar el calentamiento del conductor.`));
  } else if (input.material !== "cu") {
    h.push(hallazgo("R-040", ESTADO.NO_EVALUABLE, "Art. 110-10",
      `La verificación térmica ante cortocircuito solo está implementada para cobre.`));
  } else if (!input.scTsc || input.scTsc <= 0) {
    h.push(hallazgo("R-040", ESTADO.NO_EVALUABLE, "Art. 110-10",
      `Falta declarar el tiempo de despeje de la falla (curva tiempo-corriente del dispositivo de protección) para verificar el calentamiento del conductor.`));
  } else if (vt) {
    const areaInstaladaMm2 = calibreFinal.mm2;
    if (areaInstaladaMm2 >= vt.areaMinMm2) {
      h.push(hallazgo("R-040", ESTADO.CUMPLE, "Art. 110-10",
        `Con ${fmt(vt.iccPorConductor/1000,2)} kA por conductor durante ${vt.tSeg} s, el área mínima para no exceder ${vt.t2} °C (aislamiento de ${vt.t1} °C) es ${fmt(vt.areaMinMm2,2)} mm², dentro de los ${fmt(areaInstaladaMm2,2)} mm² instalados (${calibreFinal.awg}).`));
    } else {
      h.push(hallazgo("R-040", ESTADO.NO_CUMPLE, "Art. 110-10",
        `Con ${fmt(vt.iccPorConductor/1000,2)} kA por conductor durante ${vt.tSeg} s, el área mínima para no exceder ${vt.t2} °C es ${fmt(vt.areaMinMm2,2)} mm², MAYOR que los ${fmt(areaInstaladaMm2,2)} mm² instalados (${calibreFinal.awg}). El conductor puede dañarse antes de que despeje la falla: aumentar calibre, agregar conductores en paralelo o reducir el tiempo de despeje.`));
    }
  }

  // R-029 / 250-52(a)(5) y R-030 / 250-53(a)(2): electrodo de puesta a tierra
  if (!el0) {
    h.push(hallazgo("R-030", ESTADO.NO_EVALUABLE, "Art. 250-53",
      `No se calculó la resistencia del electrodo, por lo que no puede verificarse el criterio de 25 Ω ni la necesidad de electrodo complementario.`));
  } else {
    if (!el0.cumpleLargo || !el0.cumpleDiam) {
      const faltas = [];
      if (!el0.cumpleLargo) faltas.push(`longitud ${fmt(el0.largoM,2)} m (mínimo 2.44 m)`);
      if (!el0.cumpleDiam) faltas.push(`diámetro ${fmt(el0.diamMm,1)} mm (mínimo 16 mm)`);
      h.push(hallazgo("R-029", ESTADO.NO_CUMPLE, "Art. 250-52(a)(5)",
        `Dimensiones del electrodo fuera de norma: ${faltas.join(' y ')}.`));
    } else {
      h.push(hallazgo("R-029", ESTADO.CUMPLE, "Art. 250-52(a)(5)",
        `Electrodo de ${fmt(el0.largoM,2)} m y ${fmt(el0.diamMm,1)} mm cumple las dimensiones mínimas.`));
    }

    if (el0.cumple25) {
      h.push(hallazgo("R-030", ESTADO.ADVERTENCIA, "Art. 250-53(a)(2)",
        `Resistencia estimada ${fmt(el0.R,2)} Ω ≤ 25 Ω, por lo que no se exige electrodo complementario. Es un valor CALCULADO: debe confirmarse con medición en sitio (telurómetro) antes de omitir el segundo electrodo.`));
    } else if (el0.complementario) {
      h.push(hallazgo("R-030", ESTADO.CUMPLE, "Art. 250-53(a)(2)",
        `Resistencia estimada ${fmt(el0.R,2)} Ω > 25 Ω, y se declara electrodo complementario, como exige la norma.`));
    } else {
      h.push(hallazgo("R-030", ESTADO.NO_CUMPLE, "Art. 250-53(a)(2)",
        `Resistencia estimada ${fmt(el0.R,2)} Ω > 25 Ω y no se declaró electrodo complementario. Se debe instalar un electrodo adicional (separado al menos 1.80 m, Art. 250-53(a)(3)) o demostrar por medición que se cumplen los 25 Ω.`));
    }
  }

  return h;
}

/* =========================================================================
   CUADRO DE CARGAS
   -------------------------------------------------------------------------
   Agrupa los circuitos por tablero, determina en que fase(s) cae cada uno
   segun su POSICION FISICA en el tablero, y calcula la carga por fase y el
   total del tablero.

   Criterio de reparto: por posicion, que es como se construyen los tableros
   reales y como se elaboran los cuadros de carga en la practica. Las barras
   del tablero alternan fases por pares de espacios:

       espacios 1 y 2  -> fase A
       espacios 3 y 4  -> fase B
       espacios 5 y 6  -> fase C
       espacios 7 y 8  -> fase A ... y asi sucesivamente

   es decir, fase = FASES[ floor((posicion - 1) / 2) % 3 ]. Un interruptor de
   varios polos ocupa espacios alternados del mismo lado (p. ej. 1, 3, 5), por
   lo que cae naturalmente en fases consecutivas A, B, C.

   Esta convencion se verifico contra el cuadro de cargas real del proyecto
   Jardin de Eventos CENTURA (tablero principal TP): los circuitos 1,3,5 /
   7,9,11 / 2,4,6 caen en A,B,C / A,B,C / A,B,C, y la formula los reproduce
   todos. Ver prueba "posiciones reales del tablero TP de CENTURA".

   NOTA sobre el desbalance: la NOM-001-SEDE-2018 no fija un porcentaje
   maximo de desbalance entre fases para tableros. El valor que se reporta
   aqui es un indicador de buena practica de diseno, no un requisito
   normativo. Lo que si es normativo es dimensionar el neutro por el maximo
   desequilibrio (Art. 220-61, ver regla R-028).
   ========================================================================= */
const FASES = ["A", "B", "C"];

// Fase que corresponde a un espacio del tablero, por la alternancia de barras.
function faseDePosicion(posicion) {
  return FASES[Math.floor((posicion - 1) / 2) % 3];
}

// Fases que ocupa un interruptor de n polos que arranca en `posicion`.
// Los polos toman espacios alternados del mismo lado: pos, pos+2, pos+4.
function fasesDeInterruptor(posicion, nPolos) {
  const fases = [];
  for (let i = 0; i < nPolos; i++) {
    const f = faseDePosicion(posicion + i * 2);
    if (!fases.includes(f)) fases.push(f);
  }
  return fases;
}

function generarCuadroDeCargas(circuitos) {
  const tableros = {};

  circuitos.forEach(c => {
    const nombre = c.board || "(sin tablero)";
    if (!tableros[nombre]) {
      tableros[nombre] = { tablero: nombre, circuitos: [], cargaPorFase: { A:0, B:0, C:0 } };
    }
    tableros[nombre].circuitos.push(c);
  });

  return Object.values(tableros).map(t => {
    // Posicion: la que traiga el circuito; si no trae, se asignan espacios
    // consecutivos impares (1, 3, 5...) en el orden en que se capturaron,
    // que es como se va llenando una columna del tablero.
    let siguienteLibre = 1;
    const filas = t.circuitos.map(c => {
      const nPolos = Math.min(c.fases || 1, 3);
      const posicion = c.posicion || siguienteLibre;
      if (!c.posicion) siguienteLibre += nPolos * 2;

      const fases = fasesDeInterruptor(posicion, nPolos);
      const vaPorFase = (c.va || 0) / fases.length;
      fases.forEach(f => { t.cargaPorFase[f] += vaPorFase; });

      return { circuito: c, posicion, fases, vaPorFase };
    });

    const cargas = FASES.map(f => t.cargaPorFase[f]);
    const usadas = cargas.filter(v => v > 0);
    const maxFase = Math.max(...cargas);
    const minFase = usadas.length ? Math.min(...usadas) : 0;
    const totalVA = cargas.reduce((s, v) => s + v, 0);
    const desbalancePct = maxFase > 0 ? ((maxFase - minFase) / maxFase) * 100 : 0;

    return {
      tablero: t.tablero,
      filas,
      cargaPorFase: t.cargaPorFase,
      totalVA,
      maxFase,
      minFase,
      desbalancePct,
      fasesUsadas: usadas.length,
    };
  });
}

// Tension de fase a neutro de un circuito, a partir de su tension nominal.
// En sistemas en estrella (127/220, 254/440, 277/480) la tension nominal de un
// circuito de 2 o 3 fases se da ENTRE FASES, asi que la de fase a neutro es
// V / raiz(3). En uno de 1 fase la tension nominal ya es de fase a neutro.
function tensionFaseNeutro(voltage, fases) {
  return fases === 1 ? voltage : voltage / Math.sqrt(3);
}

// Corriente del alimentador del tablero. La define la FASE MAS CARGADA, no la
// carga total: cada conductor de fase del alimentador solo lleva la carga de su
// propia fase. Se calcula sobre la tension de fase a neutro.
function corrienteAlimentador(maxFaseVA, vFaseNeutro) {
  return vFaseNeutro > 0 ? maxFaseVA / vFaseNeutro : 0;
}

// Veredicto global del circuito: manda el estado mas severo presente.
function veredictoGlobal(hallazgos) {
  if (hallazgos.some(h => h.estado === ESTADO.NO_CUMPLE)) return ESTADO.NO_CUMPLE;
  if (hallazgos.some(h => h.estado === ESTADO.ADVERTENCIA)) return ESTADO.ADVERTENCIA;
  if (hallazgos.some(h => h.estado === ESTADO.NO_EVALUABLE)) return ESTADO.NO_EVALUABLE;
  return ESTADO.CUMPLE;
}

