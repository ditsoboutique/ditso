/**
 * DITSÖ — Script de Build: genera los índices de contenido
 *
 * Ejecutado automáticamente por el GitHub Action
 * (.github/workflows/update-index.yml) cada vez que el CMS
 * guarda un cambio en content/productos/ o content/tips/.
 *
 * Lo que hace: lee todos los archivos .json en cada carpeta de
 * contenido y genera su archivo -index.json correspondiente
 * (lista de IDs). El sitio usa esos índices para saber qué
 * archivos cargar vía fetch(), ya que un servidor estático
 * (GitHub Pages) no permite listar directorios en tiempo real.
 *
 * Para correr manualmente:
 *   node build-index.js
 */

const fs   = require('fs');
const path = require('path');

function buildIndex(folderName, indexFileName) {
  const dir       = path.join(__dirname, 'content', folderName);
  const indexPath = path.join(__dirname, 'content', indexFileName);

  if (!fs.existsSync(dir)) {
    console.warn(`content/${folderName} no encontrado; omitiendo generación de ${indexFileName}.`);
    return;
  }

  try {
    const files = fs.readdirSync(dir)
      .filter(f => f.endsWith('.json'))
      .map(f => f.replace('.json', ''))
      .sort();

    fs.writeFileSync(indexPath, JSON.stringify(files, null, 2), 'utf8');

    console.log(`✓ ${indexFileName} generado con ${files.length} entradas:`);
    files.forEach(id => console.log(`  - ${id}`));
  } catch (err) {
    console.error(`Error generando ${indexFileName}:`, err.message);
    process.exitCode = 1;
  }
}

buildIndex('productos', 'productos-index.json');
buildIndex('tips',      'tips-index.json');
