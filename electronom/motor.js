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

// Tabla 5: área aproximada del conductor aislado tipo THHN/THWN (mm2)
const CONDUCTOR_AREA_THHN = {
  "18":3.548, "16":4.645, "14":6.258, "12":8.581, "10":13.61, "8":23.61, "6":32.71,
  "4":53.16, "3":62.77, "2":74.71, "1":100.8, "1/0":119.7, "2/0":143.4, "3/0":172.8,
  "4/0":208.8, "250":256.1, "300":297.3, "350":338.2, "400":378.3, "500":456.3,
  "600":559.7, "700":637.9, "750":677.2, "800":715.2, "900":794.3, "1000":869.5,
};

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
function calcularCalibre(requiredAmpacity, material, insulTemp, ambient, currentCarrying) {
  const tempFactor = lookupTempFactor(ambient, "f" + insulTemp);
  const groupPct = lookupGroupingPct(currentCarrying);
  const groupFactor = groupPct / 100;
  const matCol = (material === "cu" ? "cu" : "al") + insulTemp;

  for (const row of AMPACITY_TABLE) {
    const baseAmp = row[matCol];
    if (baseAmp === null || baseAmp === undefined) continue;
    const correctedAmp = baseAmp * (tempFactor ?? 1) * groupFactor;
    if (correctedAmp >= requiredAmpacity) {
      return { awg: row.awg, mm2: row.mm2, baseAmp, tempFactor: tempFactor ?? 1, groupFactor, groupPct, correctedAmp, requiredAmpacity };
    }
  }
  return null;
}

/* =========================================================================
   PASO B: CAIDA DE TENSION  (Tabla 9, Art. 210-19 Nota 4 / 215-2 Nota 2)
   ========================================================================= */
function calcularCaidaTension(awg, current, lengthM, voltage, vdFactor, fp) {
  const t9 = TABLE9_PVC_CU[awg];
  if (!t9) return null;
  const angle = Math.acos(fp);
  const ze = t9.r * fp + t9.xl * Math.sin(angle);
  const lengthKm = lengthM / 1000;
  const dropV = vdFactor * current * lengthKm * ze;
  const dropPct = (dropV / voltage) * 100;
  return { r:t9.r, xl:t9.xl, ze, dropV, dropPct, lengthKm, vdFactor };
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
function calcularCortocircuito({ kva, zPct, voltage, zSourcePu, awg, lengthM }) {
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
    zCondOhms = Math.sqrt(t9.r * t9.r + t9.xl * t9.xl) * (lengthM / 1000);
    zCondPu = zCondOhms / zBase;
    iccCarga = (1 / (zTotalTrafoPu + zCondPu)) * iBase;
  }

  return { sBase, iBase, zBase, zTrafoPu, zSourcePu, iccTrafo, zCondOhms, zCondPu, iccCarga };
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
function calcularTuberia(awgFase, nFaseNeutro, awgTierra, conduitType) {
  const areaFase = CONDUCTOR_AREA_THHN[awgFase];
  if (!areaFase) return null;
  const areaTierra = awgTierra ? (CONDUCTOR_AREA_THHN[awgTierra] || 0) : 0;
  const totalConductors = nFaseNeutro + (awgTierra ? 1 : 0);
  const totalArea = areaFase * nFaseNeutro + areaTierra;

  let fillPct, col;
  if (totalConductors === 1) { fillPct = 53; col = "one"; }
  else if (totalConductors === 2) { fillPct = 31; col = "two"; }
  else { fillPct = 40; col = "over2"; }

  const table = CONDUIT_TABLES[conduitType];
  const base = { areaFase, areaTierra, nFaseNeutro, totalConductors, totalArea, fillPct, col, conduitName: table.name };
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

function evaluarCumplimiento({ input, calibreIni, calibreFinal, vd, breaker, tierra, tuberia, cc, el0, motor }) {
  const h = [];

  // R-002 / 310-15(a)(3): ampacidad corregida suficiente para la carga
  h.push(hallazgo("R-002", ESTADO.CUMPLE, "Art. 310-15",
    `Ampacidad corregida del conductor ${calibreFinal.awg} = ${fmt(calibreFinal.correctedAmp,2)} A, contra ${fmt(input.requiredAmpacity,2)} A requeridos (margen ${fmt(calibreFinal.correctedAmp - input.requiredAmpacity,2)} A).`));

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
      `Circuito de motor: la protección de ${breaker.breaker} A es contra cortocircuito y falla a tierra, y puede exceder la ampacidad del conductor (${fmt(calibreFinal.correctedAmp,2)} A). La protección de sobrecarga es independiente y NO se calcula en esta herramienta — debe especificarse por separado (Parte III del Art. 430).`));
  } else if (breaker.breaker <= calibreFinal.correctedAmp) {
    h.push(hallazgo("R-009", ESTADO.CUMPLE, "Art. 240-4",
      `Protección de ${breaker.breaker} A no excede la ampacidad corregida del conductor (${fmt(calibreFinal.correctedAmp,2)} A).`));
  } else if (breaker.breaker <= 800) {
    h.push(hallazgo("R-009", ESTADO.CUMPLE, "Art. 240-4(b)",
      `Protección de ${breaker.breaker} A excede la ampacidad del conductor (${fmt(calibreFinal.correctedAmp,2)} A), pero se acoge a la excepción de 240-4(b): es el valor estándar inmediato superior y no rebasa 800 A. No aplica si el circuito alimenta más de un contacto para cargas portátiles.`));
  } else {
    h.push(hallazgo("R-009", ESTADO.NO_CUMPLE, "Art. 240-4(c)",
      `Protección de ${breaker.breaker} A excede la ampacidad del conductor (${fmt(calibreFinal.correctedAmp,2)} A) y supera 800 A: por 240-4(c) la ampacidad debe ser igual o mayor al valor del dispositivo.`));
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
  if (tuberia.trade) {
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

