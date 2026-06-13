/**
 * DITSÖ — Script de Build: genera products-index.json
 *
 * Ejecutado automáticamente por Netlify antes de cada deploy
 * (configurado en netlify.toml como [build] command).
 *
 * Lo que hace: lee todos los archivos .json en /content/productos/
 * y genera /content/productos-index.json con la lista de IDs.
 *
 * El sitio usa ese índice para saber qué productos cargar vía fetch().
 *
 * Para correr manualmente:
 *   node build-index.js
 */

const fs   = require('fs');
const path = require('path');

const productosDir = path.join(__dirname, 'content', 'productos');
const indexPath    = path.join(__dirname, 'content', 'productos-index.json');

if (!fs.existsSync(productosDir)) {
  console.warn('content/productos no encontrado; omitiendo generación del índice.');
  process.exit(0);
}

try {
  const files = fs.readdirSync(productosDir)
    .filter(f => f.endsWith('.json'))
    .map(f => f.replace('.json', ''));

  fs.writeFileSync(indexPath, JSON.stringify(files, null, 2), 'utf8');

  console.log(`✓ productos-index.json generado con ${files.length} productos:`);
  files.forEach(id => console.log(`  - ${id}`));

} catch (err) {
  console.error('Error generando productos-index.json:', err.message);
  process.exit(1);
}
