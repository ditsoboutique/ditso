/* ── NON-BLOCKING FONTS ────────────────────────────────────
   Activa el preload de Google Fonts sin bloquear el render.
   Corre inmediatamente al cargar el script (bottom of body),
   cuando el HTML ya fue pintado con fuentes del sistema.
   display=swap en la URL garantiza que el texto sea visible
   siempre — con o sin la fuente personalizada cargada.
   ──────────────────────────────────────────────────────── */
(function activateFonts() {
  const preload = document.querySelector('link[rel="preload"][as="style"]');
  if (preload) preload.rel = 'stylesheet';
})();

/**
 * DITSÖ — JavaScript Principal
 * Versión: 2.0 (Phase 1 + Decap CMS)
 *
 * CAMBIO PRINCIPAL vs v1.0:
 * Los productos ya no están hardcodeados en este archivo.
 * Se cargan desde archivos JSON en /content/productos/
 * mediante fetch(). El CMS escribe esos archivos automáticamente
 * cuando se guardan cambios en el panel de administración.
 *
 * SECCIONES:
 * 1.  Config — cargada desde content/config/contacto.json
 * 2.  Loader — fetch de productos y config desde JSON
 * 3.  Módulo: Navegación
 * 4.  Módulo: Toggle de Tamaño de Fuente
 * 5.  Módulo: Catálogo — Render y Filtro
 * 6.  Módulo: Modal (Phase 1 — redirige a WhatsApp)
 * 7.  Módulo: FAQ Acordeón
 * 8.  Módulo: Scroll Suave y Active Nav
 * 9.  Init — Arranque
 */

'use strict';

/* ═══════════════════════════════════════════════
   1. CONFIG — valores por defecto
   Se sobreescriben con los datos de contacto.json
   al cargar la página.
   ═══════════════════════════════════════════════ */
let CONFIG = {
  whatsappNumber:  '50685978998',
  whatsappMessage: '¡Hola Ditsö! Me gustaría obtener más información sobre sus productos.',
  storeEmail:      'hola@ditso.cr',
};

function getWhatsAppURL(message) {
  const msg = message || CONFIG.whatsappMessage;
  return `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(msg)}`;
}

/* Sanitiza texto antes de insertarlo en el DOM vía innerHTML.
   CRÍTICO en Phase 2: siempre usar esta función con datos de API. */
function sanitize(str) {
  if (!str) return '';
  const d = document.createElement('div');
  d.textContent = String(str);
  return d.innerHTML;
}

/* Resuelve rutas de contenido respetando <base href> (GitHub Pages /ditso/). */
function contentUrl(relativePath) {
  return new URL(relativePath, document.baseURI).href;
}

/* Normaliza rutas de imágenes del CMS (/ditso/assets/... o assets/...). */
function resolveAssetUrl(path) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith('/')) return path;
  return contentUrl(path);
}


/* ═══════════════════════════════════════════════
   2. LOADER — carga de datos desde JSON
   ═══════════════════════════════════════════════ */

/**
 * Obtiene la lista de archivos JSON en /content/productos/
 * y carga cada producto.
 *
 * Estrategia: cargamos un índice (products-index.json)
 * que Netlify genera automáticamente, O usamos el fallback
 * de cargar los productos uno a uno si el índice no existe.
 *
 * NOTA: En un servidor estático (Netlify/GitHub Pages) no podemos
 * listar directorios. Por eso mantenemos un índice en
 * productos-bundle.json (un solo fetch con todos los productos).
 * Si el bundle no existe, cae de vuelta al índice individual (compatibilidad).
 * El CMS regenera ambos automáticamente vía el GitHub Action de build.
 */

/* ── ESTRATEGIA: 1 fetch en lugar de N+1 ──
   Bundle: 1 request → todos los productos de una vez.
   Fallback: índice + fetches individuales (para desarrollo local). */
async function loadProducts() {
  /* Intentar bundle primero — más rápido, 1 sola request */
  try {
    const res = await fetch(contentUrl('content/productos-bundle.json'));
    if (res.ok) {
      const products = await res.json();
      return products.filter(p => p && p.active !== false);
    }
  } catch { /* bundle no disponible aún, usar fallback */ }

  /* Fallback: índice + fetches individuales */
  try {
    const indexRes = await fetch(contentUrl('content/productos-index.json'));
    if (!indexRes.ok) throw new Error('Index not found');
    const index = await indexRes.json();
    const results = await Promise.all(
      index.map(id => fetch(contentUrl(`content/productos/${id}.json`))
        .then(r => r.ok ? r.json() : null)
        .catch(() => null))
    );
    return results.filter(p => p !== null && p.active !== false);
  } catch {
    console.warn('Ditsö: No se pudo cargar productos. Usando lista de respaldo.');
    return []; /* lista vacía — mejor que datos incorrectos */
  }
}

/* Carga la configuración de contacto desde el JSON del CMS */
async function loadConfig() {
  try {
    const res = await fetch(contentUrl('content/config/contacto.json'));
    if (!res.ok) throw new Error('Config not found');
    const data = await res.json();
    /* Sobreescribir CONFIG con los valores del CMS */
    if (data.whatsappNumber)  CONFIG.whatsappNumber  = data.whatsappNumber;
    if (data.storeEmail)      CONFIG.storeEmail      = data.storeEmail;
    if (data.whatsappMessage) CONFIG.whatsappMessage = data.whatsappMessage;
  } catch {
    /* Si no se puede cargar, usar los valores por defecto de CONFIG */
    console.warn('Ditsö: contacto.json no encontrado. Usando configuración por defecto.');
  }
}

/* Carga la imagen hero desde el JSON del CMS */
async function loadHeroImage() {
  try {
    const res = await fetch(contentUrl('content/config/hero.json'));
    if (!res.ok) return;
    const data = await res.json();
    if (data.heroImage) {
      const placeholder = document.querySelector('.hero__image-placeholder');
      const frame = document.querySelector('.hero__image-frame');
      if (frame && placeholder) {
        const img = document.createElement('img');
        img.src = resolveAssetUrl(data.heroImage);
        img.alt = 'Mujer usando ropa Ditsö en jardín costarricense';
        img.loading = 'eager';
        img.fetchPriority = 'high';
        placeholder.replaceWith(img);
      }
    }
  } catch {
    /* Sin imagen hero — el placeholder SVG se mantiene */
  }
}

/* Carga todos los tips — bundle primero, fallback individual */
async function loadTips() {
  /* Intentar bundle primero */
  try {
    const res = await fetch(contentUrl('content/tips-bundle.json'));
    if (res.ok) {
      const tips = await res.json();
      return tips.filter(t => t && t.active !== false);
    }
  } catch { /* bundle no disponible aún */ }

  /* Fallback: índice + fetches individuales */
  try {
    const indexRes = await fetch(contentUrl('content/tips-index.json'));
    if (!indexRes.ok) throw new Error('Tips index not found');
    const index = await indexRes.json();
    const results = await Promise.all(
      index.map(id => fetch(contentUrl(`content/tips/${id}.json`))
        .then(r => r.ok ? r.json() : null)
        .catch(() => null))
    );
    return results.filter(t => t !== null && t.active !== false);
  } catch {
    console.warn('Ditsö: tips-index.json no encontrado. Sección Tips vacía.');
    return [];
  }
}


/* ═══════════════════════════════════════════════
   3. MÓDULO: NAVEGACIÓN
   ═══════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════
   MÓDULO: REVEAL ANIMATIONS
   Fade + slide up al hacer scroll.
   ═══════════════════════════════════════════════ */
let _revealObserver = null;

function getRevealObserver() {
  if (_revealObserver) return _revealObserver;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null;
  _revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('reveal--visible');
        _revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.10, rootMargin: '0px 0px -40px 0px' }
  );
  return _revealObserver;
}

function observeRevealElements() {
  const obs = getRevealObserver();
  if (!obs) {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('reveal--visible'));
    return;
  }
  document.querySelectorAll('.reveal:not([data-rv])').forEach(el => {
    el.dataset.rv = '1';
    obs.observe(el);
  });
}

function initNavigation() {
  const hamburger  = document.getElementById('hamburger');
  const mobileNav  = document.getElementById('mobile-nav');
  const mobileNavLinks = mobileNav ? mobileNav.querySelectorAll('a') : [];

  if (!hamburger || !mobileNav) return;

  hamburger.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
      mobileNav.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      hamburger.focus();
    }
  });
}


/* ═══════════════════════════════════════════════
   4. MÓDULO: TOGGLE DE TAMAÑO DE FUENTE
   ═══════════════════════════════════════════════ */
function initFontSizeToggle() {
  const btnNormal = document.getElementById('font-normal');
  const btnLarge  = document.getElementById('font-large');
  if (!btnNormal || !btnLarge) return;

  const savedSize = (() => { try { return localStorage.getItem('ditso-font-size'); } catch(e) { return null; } })();
  if (savedSize === 'large') applyLarge();
  else applyNormal();

  btnNormal.addEventListener('click', () => { applyNormal(); try { localStorage.setItem('ditso-font-size', 'normal'); } catch(e) {}; });
  btnLarge.addEventListener('click',  () => { applyLarge();  try { localStorage.setItem('ditso-font-size', 'large');  } catch(e) {};  });

  function applyNormal() {
    document.body.classList.remove('font-large');
    btnNormal.classList.add('active');    btnLarge.classList.remove('active');
    btnNormal.setAttribute('aria-pressed', 'true');
    btnLarge.setAttribute('aria-pressed', 'false');
  }
  function applyLarge() {
    document.body.classList.add('font-large');
    btnLarge.classList.add('active');     btnNormal.classList.remove('active');
    btnLarge.setAttribute('aria-pressed', 'true');
    btnNormal.setAttribute('aria-pressed', 'false');
  }
}


/* ═══════════════════════════════════════════════
   5. MÓDULO: CATÁLOGO — RENDER Y FILTRO

   SEGURIDAD — innerHTML:
   Todos los datos vienen de archivos JSON que el CMS escribe.
   Igual usar sanitize() en todos los campos por hábito seguro.
   En Phase 2 con API externa, esto es obligatorio.
   ═══════════════════════════════════════════════ */
function formatPrice(amount) {
  return new Intl.NumberFormat('es-CR', {
    style: 'currency', currency: 'CRC',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(amount);
}

function getLeafSVG(size = 56) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
  </svg>`;
}

function buildProductCard(product, cardIndex = 0) {
  const hasDiscount = product.priceOriginal && product.priceOriginal > product.price;
  const discountPct = hasDiscount ? Math.round((1 - product.price / product.priceOriginal) * 100) : 0;

  const safeId    = sanitize(product.id);
  const safeName  = sanitize(product.name);
  const safeDesc  = sanitize(product.description);
  const safeLabel = sanitize(product.categoryLabel);
  const safeCat   = sanitize(product.category);

  const imagePart = product.image
    ? `<img src="${sanitize(resolveAssetUrl(product.image))}" alt="Fotografía de ${safeName}" loading="lazy" decoding="async">`
    : `<div class="product-card__image-placeholder" aria-hidden="true">
         ${getLeafSVG(48)}
         <span>Foto próximamente</span>
       </div>`;

  const pricePart = hasDiscount
    ? `<span class="product-card__price">${formatPrice(product.price)}</span>
       <span class="product-card__price-original">${formatPrice(product.priceOriginal)}</span>`
    : `<span class="product-card__price">${formatPrice(product.price)}</span>`;

  const offerBadge = product.inOffer
    ? `<span class="product-card__offer-badge">Oferta −${discountPct}%</span>` : '';

  /* Escapar comillas simples en el nombre para el onclick inline-free JS call */
  const nameEsc = product.name.replace(/'/g, "\\'");

  return `
    <article class="product-card reveal" data-category="${safeCat}" data-id="${safeId}" role="listitem" style="transition-delay:${Math.min(cardIndex*80,320)}ms">
      <div class="product-card__image">
        ${imagePart}
        <span class="product-card__category-badge">${safeLabel}</span>
        ${offerBadge}
      </div>
      <div class="product-card__body">
        <h3 class="product-card__name">${safeName}</h3>
        <p class="product-card__description">${safeDesc}</p>
        <div class="product-card__pricing">${pricePart}</div>
      </div>
      <div class="product-card__actions">
        <button
          class="btn btn-outline btn-sm"
          data-action="ver-detalles"
          data-product-id="${safeId}"
          data-product-name="${nameEsc}"
          aria-label="Ver detalles de ${safeName}"
        >Ver Detalles</button>
        <button
          class="btn btn-primary btn-sm"
          data-action="agregar-carrito"
          data-product-id="${safeId}"
          data-product-name="${nameEsc}"
          aria-label="Agregar al carrito: ${safeName}"
        >🛒 Agregar al Carrito</button>
      </div>
    </article>`;
}

function buildOfferCard(product) {
  const hasDiscount = product.priceOriginal && product.priceOriginal > product.price;
  const discountPct = hasDiscount ? Math.round((1 - product.price / product.priceOriginal) * 100) : 0;

  const safeName = sanitize(product.name);
  const safeDesc = sanitize(product.description);
  const nameEsc  = product.name.replace(/'/g, "\\'");

  const imagePart = product.image
    ? `<img src="${sanitize(resolveAssetUrl(product.image))}" alt="Fotografía de ${safeName}" loading="lazy" decoding="async">`
    : `<div class="img-placeholder" aria-hidden="true">
         ${getLeafSVG(48)}
         <span>Foto próximamente</span>
       </div>`;

  const pricePart = hasDiscount
    ? `<span class="oferta-card__price">${formatPrice(product.price)}</span>
       <span class="oferta-card__price-original">${formatPrice(product.priceOriginal)}</span>
       <span class="oferta-card__discount">−${discountPct}%</span>`
    : `<span class="oferta-card__price">${formatPrice(product.price)}</span>`;

  return `
    <article class="oferta-card" role="listitem">
      <div class="oferta-card__image">
        ${imagePart}
        <span class="oferta-badge">⭐ Oferta Especial</span>
      </div>
      <div class="oferta-card__body">
        <h3 class="oferta-card__name">${safeName}</h3>
        <p class="oferta-card__desc">${safeDesc}</p>
        <div class="oferta-card__pricing">${pricePart}</div>
        <button
          class="btn btn-whatsapp"
          data-action="agregar-carrito"
          data-product-name="${nameEsc}"
          aria-label="Consultar oferta de ${safeName} por WhatsApp"
        >Consultar por WhatsApp</button>
      </div>
    </article>`;
}

/* Renderiza productos en el grid. Acepta el array ya cargado. */
function renderCatalog(products) {
  const grid      = document.getElementById('products-grid');
  const offerGrid = document.getElementById('offers-grid');
  const offers    = products.filter(p => p.inOffer).slice(0, 4);

  if (grid) {
    if (products.length === 0) {
      grid.innerHTML = `<p style="text-align:center; color: var(--color-text-secondary); padding: var(--space-xl) 0; grid-column: 1/-1;">
        No hay productos disponibles en este momento. Contáctenos por WhatsApp.
      </p>`;
    } else {
      grid.innerHTML = products.map((p, i) => buildProductCard(p, i)).join('');
    }
  }

  if (offerGrid) {
    offerGrid.innerHTML = offers.length > 0
      ? offers.map(buildOfferCard).join('')
      : `<p style="text-align:center; color: rgba(255,255,204,0.7); padding: var(--space-lg) 0; grid-column: 1/-1;">
           No hay ofertas activas en este momento.
         </p>`;
  }

  /* Inicializar filtros DESPUÉS de renderizar las tarjetas */
  initCategoryFilters();
  observeRevealElements();

  /* Delegar eventos de botones — sin onclick inline (seguridad) */
  initProductButtons();
}

/* Delegación de eventos para botones generados dinámicamente */
function initProductButtons() {
  const grid      = document.getElementById('products-grid');
  const offerGrid = document.getElementById('offers-grid');

  function handleBtn(e) {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    const name   = btn.dataset.productName;
    const id     = btn.dataset.productId;

    if (action === 'agregar-carrito') openCartModal(id, name);
    if (action === 'ver-detalles')    openProductModal(id, name);
  }

  if (grid)      grid.addEventListener('click', handleBtn);
  if (offerGrid) offerGrid.addEventListener('click', handleBtn);
}

function initCategoryFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.category;
      filterBtns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      /* Re-query en cada click — seguro para carga async */
      document.querySelectorAll('.product-card').forEach(card => {
        card.style.display = (cat === 'todas' || card.dataset.category === cat) ? '' : 'none';
      });
    });
  });
}

/* ═══════════════════════════════════════════════
   5.5 MÓDULO: TIPS DE ROPA — Render y Filtro
   Mismo patrón que el catálogo, pero independiente
   (clases .tip-* propias) para no interferir con
   los filtros y tarjetas de la Tienda.
   ═══════════════════════════════════════════════ */
function buildTipCard(tip, cardIndex = 0) {
  const safeTitle = sanitize(tip.title);
  const safeText  = sanitize(tip.text);
  const safeCat   = sanitize(tip.category || 'general');
  const safeLabel = sanitize(tip.categoryLabel || '');

  const imagePart = tip.image
    ? `<img src="${sanitize(resolveAssetUrl(tip.image))}" alt="${safeTitle}" loading="lazy" decoding="async">`
    : `<div class="tip-card__image-placeholder" aria-hidden="true">
         ${getLeafSVG(48)}
         <span>Foto próximamente</span>
       </div>`;

  return `
    <article class="tip-card reveal" data-category="${safeCat}" role="listitem" style="transition-delay:${Math.min(cardIndex*80,320)}ms">
      <div class="tip-card__image">
        ${imagePart}
        ${safeLabel ? `<span class="tip-card__category-badge">${safeLabel}</span>` : ''}
      </div>
      <div class="tip-card__body">
        <h3 class="tip-card__title">${safeTitle}</h3>
        <p class="tip-card__text">${safeText}</p>
      </div>
    </article>`;
}

/* Renderiza los tips en el grid. Acepta el array ya cargado. */
function renderTips(tips) {
  const grid = document.getElementById('tips-grid');
  if (!grid) return;

  if (tips.length === 0) {
    grid.innerHTML = `<p style="text-align:center; color: var(--color-text-secondary); padding: var(--space-xl) 0; grid-column: 1/-1;">
      Aún no hay tips publicados. ¡Vuelva pronto!
    </p>`;
  } else {
    grid.innerHTML = tips.map((t, i) => buildTipCard(t, i)).join('');
  }

  initTipCategoryFilters();
  observeRevealElements();
}

function initTipCategoryFilters() {
  const filterBtns = document.querySelectorAll('.tip-filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.tipCategory;
      filterBtns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      /* Re-query en cada click — seguro para carga async */
      document.querySelectorAll('.tip-card').forEach(card => {
        card.style.display = (cat === 'todas' || card.dataset.category === cat) ? '' : 'none';
      });
    });
  });
}

/* Muestra un mensaje mientras cargan los tips */
function showTipsLoadingState() {
  const grid = document.getElementById('tips-grid');
  if (grid) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: var(--space-xl) 0; color: var(--color-text-secondary);">
        <div style="font-size: 48px; margin-bottom: var(--space-sm);">🌿</div>
        <p style="font-size: var(--text-md);">Cargando tips...</p>
      </div>`;
  }
}

/* Muestra un spinner mientras cargan los productos */
function showLoadingState() {
  const grid = document.getElementById('products-grid');
  if (grid) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: var(--space-xl) 0; color: var(--color-text-secondary);">
        <div style="font-size: 48px; margin-bottom: var(--space-sm);">🌿</div>
        <p style="font-size: var(--text-md);">Cargando productos...</p>
      </div>`;
  }
}


/* ═══════════════════════════════════════════════
   6. MÓDULO: MODAL (Phase 1 — WhatsApp redirect)
   ═══════════════════════════════════════════════ */
const modalOverlay = {
  el: null,
  init() {
    this.el = document.getElementById('cart-modal-overlay');
    if (!this.el) return;
    this.el.addEventListener('click', (e) => { if (e.target === this.el) this.close(); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.el.classList.contains('open')) this.close();
    });
    const closeBtn    = document.getElementById('modal-close-btn');
    const continueBtn = document.getElementById('modal-continue-btn');
    if (closeBtn)    closeBtn.addEventListener('click',    () => this.close());
    if (continueBtn) continueBtn.addEventListener('click', () => this.close());
  },
  open(productName, productId) {
    const msg = `Hola Ditsö, me interesa el producto "${productName}". ¿Cómo puedo adquirirlo?`;
    this._show(productName, msg);
  },
  openWithMessage(productName, productId, customMessage) {
    this._show(productName, customMessage);
  },
  _show(productName, message) {
    if (!this.el) return;
    const nameEl = document.getElementById('modal-product-name');
    const waBtn  = document.getElementById('modal-wa-btn');
    if (nameEl) nameEl.textContent = productName || 'este producto';
    if (waBtn)  waBtn.href = getWhatsAppURL(message);
    this.el.classList.add('open');
    this.el.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    const closeBtn = this.el.querySelector('.modal__close');
    if (closeBtn) setTimeout(() => closeBtn.focus(), 80);
  },
  close() {
    if (!this.el) return;
    this.el.classList.remove('open');
    this.el.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  },
};

/* Funciones globales llamadas desde el delegador de eventos */
window.openCartModal = function(productId, productName) {
  modalOverlay.open(productName, productId);
};
window.openProductModal = function(productId, productName) {
  /* Phase 2: reemplazar con: window.location.href = `/productos/${productId}`; */
  modalOverlay.openWithMessage(
    productName, productId,
    `Hola Ditsö, me gustaría más información sobre "${productName}". ¿Me puede ayudar?`
  );
};


/* ═══════════════════════════════════════════════
   7. MÓDULO: FAQ ACORDEÓN
   ═══════════════════════════════════════════════ */
function initFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (!question) return;
    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      faqItems.forEach(i => {
        i.classList.remove('open');
        const q = i.querySelector('.faq-question');
        if (q) q.setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('open');
        question.setAttribute('aria-expanded', 'true');
      }
    });
  });
}


/* ═══════════════════════════════════════════════
   8. MÓDULO: ACTIVE NAV EN SCROLL
   ═══════════════════════════════════════════════ */
function initScrollActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-list a');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(link => link.classList.remove('active'));
          const activeLink = document.querySelector(`.nav-list a[href="#${entry.target.id}"]`);
          if (activeLink) activeLink.classList.add('active');
        }
      });
    },
    { rootMargin: `-${getComputedStyle(document.documentElement).getPropertyValue('--header-height') || '80px'} 0px -60% 0px` }
  );
  sections.forEach(s => observer.observe(s));
}


/* ═══════════════════════════════════════════════
   9. INIT — ARRANQUE PRINCIPAL
   Carga config y productos desde JSON, luego
   inicializa todos los módulos.
   ═══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {

  /* Inicializar UI inmediatamente (no esperar fetch) */
  initNavigation();
  initFontSizeToggle();
  initFAQ();
  initScrollActiveNav();
  showLoadingState();
  showTipsLoadingState();
  observeRevealElements();   /* static HTML reveals */

  /* Cargar config, productos y tips en paralelo */
  const [, products, tips] = await Promise.all([
    loadConfig(),
    loadProducts(),
    loadTips(),
  ]);

  /* Actualizar todos los enlaces de WhatsApp con el número real del CMS */
  document.querySelectorAll('[data-whatsapp-link]').forEach(el => {
    const customMsg = el.dataset.whatsappMsg;
    el.href = getWhatsAppURL(customMsg || undefined);
  });

  /* Cargar imagen hero si el CMS tiene una configurada */
  await loadHeroImage();

  /* Renderizar catálogo con los productos del CMS */
  renderCatalog(products);

  /* Renderizar tips de ropa con el contenido del CMS */
  renderTips(tips);

  /* Inicializar modal después de que el DOM está listo */
  modalOverlay.init();

  console.info(
    '%cDitsö v2.1 — CMS conectado ✓',
    'color: #D4B434; font-weight: bold; font-size: 14px;'
  );
  console.info(`  Productos cargados: ${products.length}`);
  console.info(`  Tips cargados: ${tips.length}`);
  console.info(`  WhatsApp: ${CONFIG.whatsappNumber}`);
  console.info(`  Panel admin: ${contentUrl('admin/')}`);
});