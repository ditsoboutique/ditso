# Ditsö — Sitio Web con CMS

Sitio web informacional (Phase 1) para **Ditsö**, con panel de administración
integrado via **Decap CMS** (antes Netlify CMS). Gratis. Sin servidor.

---

## Estructura del Proyecto

```
ditso/
├── index.html                    # Sitio principal
├── css/
│   └── styles.css                # Todos los estilos
├── js/
│   └── main.js                   # Lógica del sitio (carga productos del CMS)
├── admin/
│   ├── index.html                # Panel de administración (login)
│   └── config.yml                # Define los campos del admin
├── content/
│   ├── productos/                # Un archivo JSON por producto
│   │   ├── blusa-lino-natural.json
│   │   └── ...
│   ├── config/
│   │   ├── contacto.json         # WhatsApp, email
│   │   └── hero.json             # Imagen principal del sitio
│   └── productos-index.json      # Generado automáticamente por build-index.js
├── assets/
│   ├── productos/                # Fotos de productos (subidas por el CMS)
│   ├── hero/                     # Foto principal del sitio
│   └── brand/                    # Logo oficial (agregar manualmente)
├── build-index.js                # Script de build (Netlify lo ejecuta solo)
├── netlify.toml                  # Configuración de Netlify
└── README.md                     # Este archivo
```

---

## Cómo Desplegar — Paso a Paso

### Requisitos
- Cuenta en GitHub (gratis): https://github.com
- Cuenta en Netlify (gratis): https://netlify.com

---

### Paso 1 — Subir el código a GitHub

```bash
# En su terminal, dentro de la carpeta del proyecto
cd /Users/bernyfallas/Ditso/ditso

# Copiar todos los archivos nuevos aquí primero, luego:
git add .
git commit -m "Agregar Decap CMS — admin panel y productos en JSON"
git push origin main
```

---

### Paso 2 — Conectar Netlify con GitHub

1. Ir a https://netlify.com → **Log in** → **Add new site** → **Import an existing project**
2. Seleccionar **GitHub**
3. Buscar y seleccionar el repositorio `ditso`
4. En la pantalla de configuración:
   - **Branch to deploy:** `main`
   - **Build command:** `node build-index.js` *(ya está en netlify.toml, se auto-completa)*
   - **Publish directory:** `.`
5. Clic en **Deploy site**

Netlify construye el sitio en ~1 minuto y le da una URL como `ditso-abc123.netlify.app`.

---

### Paso 3 — Activar Netlify Identity (el sistema de login del admin)

1. En el dashboard de Netlify → su sitio → pestaña **Identity**
2. Clic en **Enable Identity**
3. En **Registration** → seleccionar **Invite only** (nadie más puede registrarse)
4. Bajar a **Services** → **Git Gateway** → clic en **Enable Git Gateway**
   - Esto permite que el CMS haga commits en GitHub cuando guarda cambios

---

### Paso 4 — Crear su cuenta de administrador

1. En Netlify → Identity → clic en **Invite users**
2. Ingresar su correo electrónico → **Send invite**
3. Revisar el correo → clic en el enlace de invitación
4. Crear una contraseña

---

### Paso 5 — Probar el panel de administración

1. Ir a `https://su-sitio.netlify.app/admin/`
2. Iniciar sesión con el correo y contraseña del paso anterior
3. ¡Listo! Ya puede agregar productos, subir fotos y cambiar precios

---

### Paso 6 — Agregar dominio personalizado (opcional)

1. En Netlify → su sitio → **Domain settings** → **Add custom domain**
2. Ingresar `ditso.cr` (o el dominio que tenga)
3. Netlify genera el certificado SSL gratis (HTTPS)
4. Actualizar los DNS de su dominio según las instrucciones de Netlify

---

## Uso Diario del Panel de Administración

### Agregar un producto nuevo
1. Ir a `/admin/` → **Productos** → **Nuevo producto**
2. Llenar: Nombre, Categoría, Descripción, Precio
3. Subir foto (arrastrar o clic en el área de upload)
4. Clic en **Publicar** → el sitio se actualiza en ~1 minuto

### Cambiar el precio de un producto
1. Ir a `/admin/` → **Productos** → clic en el producto
2. Cambiar el precio
3. Clic en **Publicar**

### Activar una oferta
1. Ir al producto → activar **"Mostrar en sección Ofertas"**
2. Ingresar el precio original en **"Precio original"**
3. Bajar el precio actual al precio de oferta
4. Publicar

### Desactivar un producto sin borrarlo
1. Ir al producto → desactivar **"Visible en la tienda"**
2. Publicar — el producto desaparece del sitio pero los datos se conservan

### Cambiar el número de WhatsApp
1. Ir a **Configuración del Sitio** → **Datos de Contacto y WhatsApp**
2. Cambiar el número
3. Publicar

### Agregar la foto principal del sitio (Hero)
1. Ir a **Página de Inicio** → **Imagen principal del sitio**
2. Subir la foto (ideal: 900×1100px)
3. Publicar

---

## Recomendaciones para Fotos de Productos

| Especificación | Valor recomendado |
|---|---|
| Formato | WebP (preferido) o JPG |
| Tamaño | 800 × 1000 px (proporción 4:5) |
| Peso máximo | 150 KB (500 KB máximo) |
| Fondo | Crema (#FFFFCC) o blanco — consistente |
| Iluminación | Natural, cálida |
| Nombre del archivo | Igual al ID del producto: `blusa-lino-natural.webp` |

**Herramienta gratuita para optimizar fotos:** https://squoosh.app
(Subir la foto → seleccionar WebP → bajar calidad hasta ~150KB → descargar)

---

## Costos

| Servicio | Costo |
|---|---|
| GitHub | Gratis |
| Netlify (hosting + CMS) | Gratis (hasta 100GB de banda / mes) |
| Dominio .cr | ~$20/año (opcional) |
| SSL/HTTPS | Gratis (Netlify lo incluye) |
| **Total** | **$0/mes** |

---

## Phase 2 — Tienda con Carrito

Cuando esté lista la tienda transaccional:

1. **Productos:** el array `PRODUCTS` ya no existe — los productos vienen del CMS ✓
2. **Carrito:** activar el botón del carrito en el header (quitar `disabled`)
3. **Pago:** integrar Stripe o SINPE — reemplazar el modal de WhatsApp
4. **Stock:** agregar campo `stock` en `admin/config.yml`
5. **CMS:** ya está conectado — solo agregar campos nuevos al config

---

© 2025 Ditsö. Costa Rica.
