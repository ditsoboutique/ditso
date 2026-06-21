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

/* ── BUNDLE: genera un único JSON con todos los productos y tips
   Esto permite al sitio hacer 1 sola request en lugar de N+1
   (un fetch por cada producto individualmente). ── */
function buildBundle(folderName, bundleFileName) {
  const dir        = path.join(__dirname, 'content', folderName);
  const bundlePath = path.join(__dirname, 'content', bundleFileName);

  if (!fs.existsSync(dir)) return;

  try {
    const items = fs.readdirSync(dir)
      .filter(f => f.endsWith('.json'))
      .sort()
      .map(f => {
        try {
          return JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
        } catch {
          console.warn(`  ⚠ Could not parse ${f}, skipping.`);
          return null;
        }
      })
      .filter(Boolean);

    fs.writeFileSync(bundlePath, JSON.stringify(items, null, 2), 'utf8');
    console.log(`✓ ${bundleFileName} generado con ${items.length} entradas.`);
  } catch (err) {
    console.error(`Error generando ${bundleFileName}:`, err.message);
    process.exitCode = 1;
  }
}

buildBundle('productos', 'productos-bundle.json');
buildBundle('tips',      'tips-bundle.json');