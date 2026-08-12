/* =========================================================================
   ElectroNOM — corredor de pruebas para consola
   -------------------------------------------------------------------------
   Ejecuta la MISMA suite de pruebas.html fuera del navegador:

       node electronom/correr-pruebas.js

   Sirve para verificar el motor sin depender del navegador y para poder
   automatizarlo. pruebas.html sigue siendo la vía para abrir con doble clic.

   Termina con código de salida 1 si alguna prueba falla.
   ========================================================================= */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const dir = __dirname;
const motor = fs.readFileSync(path.join(dir, 'motor.js'), 'utf8');
const pagina = fs.readFileSync(path.join(dir, 'pruebas.html'), 'utf8');

// Tomar el bloque de pruebas de pruebas.html: es el <script> que va después
// del que carga motor.js. Se recorta antes de la sección que pinta el DOM.
const bloques = [...pagina.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)];
if (bloques.length === 0) {
  console.error('No se encontró el bloque de pruebas en pruebas.html');
  process.exit(1);
}
let pruebas = bloques[bloques.length - 1][1];
const corte = pruebas.indexOf('Pintar resultados');
if (corte !== -1) {
  pruebas = pruebas.slice(0, pruebas.lastIndexOf('/*', corte));
}

const contexto = { console, Math, JSON, Number, String, Array, Object, isNaN, parseFloat, parseInt };
vm.createContext(contexto);
vm.runInContext(motor, contexto, { filename: 'motor.js' });
vm.runInContext(pruebas, contexto, { filename: 'pruebas.html' });

// Las declaraciones `const` del script no quedan como propiedades del contexto,
// asi que se leen evaluando una expresión dentro del mismo contexto.
const { grupos, totalPasa, totalFalla } =
  vm.runInContext('({ grupos, totalPasa, totalFalla })', contexto);

const limpio = t => String(t).replace(/<[^>]+>/g, '');
let fallidas = 0;

for (const g of grupos) {
  const pasa = g.casos.filter(c => c.ok).length;
  const marca = pasa === g.casos.length ? 'ok  ' : 'FALLA';
  console.log(`${marca} ${g.nombre} — ${pasa}/${g.casos.length}`);
  for (const c of g.casos) {
    if (!c.ok) {
      fallidas++;
      console.log(`      ✗ ${limpio(c.descripcion)}`);
      console.log(`        ${limpio(c.detalle)}`);
    }
  }
}

console.log();
if (totalFalla === 0) {
  console.log(`✓ ${totalPasa} pruebas pasaron.`);
} else {
  console.log(`✗ ${totalFalla} de ${totalPasa + totalFalla} pruebas FALLARON.`);
}
process.exit(totalFalla === 0 ? 0 : 1);
