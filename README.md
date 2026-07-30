# Ditsö — Sitio Web con CMS

Sitio web informacional (Phase 1) para **Ditsö**, con panel de administración
integrado via **Decap CMS**. Hosting en **GitHub Pages** (gratis).

**Sitio en vivo:** https://ditsoboutique.github.io/ditso/  
**Panel admin:** https://ditsoboutique.github.io/ditso/admin/

---

## Estructura del Proyecto

```
ditso/
├── index.html                    # Sitio principal
├── css/styles.css                # Estilos
├── js/main.js                    # Lógica (carga productos del CMS)
├── admin/
│   ├── index.html                # Panel Decap CMS
│   └── config.yml                # Campos del admin
├── content/
│   ├── productos/                # Un archivo .json por producto
│   ├── config/                   # contacto.json, hero.json
│   └── productos-index.json      # Índice auto-generado (no editar a mano)
├── assets/
│   ├── productos/                # Fotos subidas desde el CMS
│   ├── hero/                     # Foto principal
│   └── brand/logo.png            # Logo
├── build-index.js                # Regenera productos-index.json
├── .github/workflows/            # GitHub Action (auto-índice al publicar)
└── netlify.toml                  # Referencia legacy (Netlify ya no se usa)
```

---

## Cómo funciona

1. El sitio lee productos desde `content/productos/*.json` vía `fetch()`.
2. El admin (Decap CMS) guarda cambios directamente en GitHub.
3. Un **GitHub Action** regenera `productos-index.json` cuando cambia un producto.
4. GitHub Pages publica el sitio en ~30 segundos.

**Login del admin:** GitHub OAuth vía Cloudflare Worker (`ditso-oauth.ditsoboutiquecr.workers.dev`).

---

## Flujo de trabajo (git)

```bash
# 1. Trabajar en la rama deve
git checkout deve

# 2. Hacer cambios, commit
git add .
git commit -m "Descripción del cambio"

# 3. Integrar a main y publicar
git checkout main
git merge deve
git push origin main
```

GitHub Pages despliega automáticamente desde `main`.

---

## Uso del panel de administración

### Agregar un producto
1. Ir a `/admin/` → **Productos** → **Nuevo producto**
2. **ID:** solo minúsculas y guiones (ej: `vestido-floral`)
3. Llenar nombre, categoría, descripción, precio
4. Subir foto → **Publicar**
5. Esperar ~1 minuto → el producto aparece en la tienda

### Cambiar precio o foto
1. Abrir el producto en el admin
2. Editar → **Publicar**

### Desactivar sin borrar
Desactivar **Visible** → Publicar

### Cambiar WhatsApp
**Configuracion** → **Contacto** → editar número → Publicar

---

## Agregar colaboradores al admin

El admin usa login de GitHub. Para que otra persona pueda editar:

1. github.com/ditsoboutique/ditso → **Settings** → **Collaborators**
2. Agregar su usuario de GitHub
3. Ella entra a `/admin/` e inicia sesión con GitHub

---

## Regenerar índice manualmente

Si un producto no aparece tras publicar:

```bash
node build-index.js
git add content/productos-index.json
git commit -m "Update productos index"
git push origin main
```

O disparar el Action manualmente: GitHub → **Actions** → **Update Products Index** → **Run workflow**.

---

## Fotos de productos

| Especificación | Valor |
|---|---|
| Formato | WebP o JPG |
| Tamaño | 800 × 1000 px (4:5) |
| Peso máximo | ~150 KB |
| Herramienta | https://squoosh.app |

---

## Phase 2 — Tienda con carrito

Cuando esté lista la tienda transaccional:

1. Productos ya vienen del CMS ✓
2. Activar botón del carrito en el header
3. Integrar Stripe o SINPE
4. Agregar campo `stock` en `admin/config.yml`

---

## Correo electrónico (contacto@ditsoboutiquecr.com)

La dirección **contacto@ditsoboutiquecr.com** reenvía automáticamente a la
cuenta de Gmail **ditsoboutique@gmail.com** usando **ImprovMX** (gratis,
solo recepción). Hay además un *catch-all* (`*`), así que cualquier
dirección @ditsoboutiquecr.com llega al mismo Gmail.

**Cómo funciona**
- Los correos entrantes los enruta ImprovMX según los registros DNS del dominio.
- El panel para cambiar el destino o agregar alias está en https://improvmx.com
  (dominio: `ditsoboutiquecr.com`).

**Registros DNS (en GoDaddy — NO borrar los `A`/`CNAME` del sitio):**

| Tipo | Nombre | Valor | Prioridad |
|---|---|---|---|
| MX | `@` | `mx1.improvmx.com` | 10 |
| MX | `@` | `mx2.improvmx.com` | 20 |
| TXT | `@` | `v=spf1 include:spf.improvmx.com ~all` | — |

> **Nota:** es *solo recepción*. Al responder desde Gmail, el correo sale
> desde la dirección personal de Gmail, no desde `contacto@…`. Para
> **responder como** `contacto@ditsoboutiquecr.com` se necesita un paso de
> envío (SMTP de pago de ImprovMX, o una casilla gratuita en Zoho Mail).

---

## Costos

| Servicio | Costo |
|---|---|
| GitHub + Pages | Gratis |
| Decap CMS | Gratis |
| Cloudflare Worker (OAuth) | Gratis |
| ImprovMX (reenvío de correo) | Gratis |
| Dominio | ~$20/año |

---

© 2026 Ditsö. Costa Rica.
