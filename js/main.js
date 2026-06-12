/**
 * DITSÖ — JavaScript Principal
 * Versión: 1.0 (Phase 1 — Informacional)
 *
 * SECCIONES:
 * 1.  Datos de Productos (reemplazar con API/CMS en Phase 2)
 * 2.  Config — WhatsApp
 * 3.  Módulo: Navegación (sticky, active state, móvil)
 * 4.  Módulo: Toggle de Tamaño de Fuente
 * 5.  Módulo: Catálogo — Render y Filtro de Productos
 * 6.  Módulo: Modal (carrito Phase 1 — redirige a WhatsApp)
 * 7.  Módulo: FAQ Acordeón
 * 8.  Módulo: Scroll Suave y Active Nav
 * 9.  Init — Arranque
 */

'use strict';

/* ═══════════════════════════════════════════════
   1. DATOS DE PRODUCTOS
   NOTA PHASE 2: Reemplazar este array con una
   llamada fetch() a tu API o CMS. La firma de
   cada objeto debe mantenerse igual para que
   renderProducts() funcione sin cambios.
   ═══════════════════════════════════════════════ */
const PRODUCTS = [
  {
    id: 'blusa-lino-natural',
    name: 'Blusa de Lino Natural',
    category: 'blusas',
    categoryLabel: 'Blusas',
    description: 'Blusa de lino orgánico de corte recto, fresca y cómoda para el clima tropical costarricense.',
    price: 28500,
    priceOriginal: null,
    image: null,   // Reemplazar con URL real en Phase 2
    inOffer: false,
  },
  {
    id: 'blusa-bordada-campo',
    name: 'Blusa Bordada Campo',
    category: 'blusas',
    categoryLabel: 'Blusas',
    description: 'Blusa con bordados artesanales inspirados en la flora costarricense. Algodón orgánico suave.',
    price: 32000,
    priceOriginal: 38000,
    image: null,
    inOffer: true,
  },
  {
    id: 'vestido-jardin',
    name: 'Vestido Jardín',
    category: 'vestidos',
    categoryLabel: 'Vestidos',
    description: 'Vestido midi de algodón fresco, corte A-line, perfecto para uso diario y reuniones familiares.',
    price: 45000,
    priceOriginal: null,
    image: null,
    inOffer: false,
  },
  {
    id: 'vestido-brisa-mañana',
    name: 'Vestido Brisa de Mañana',
    category: 'vestidos',
    categoryLabel: 'Vestidos',
    description: 'Vestido ligero de muselina, con escote suave y mangas tres cuartos. Elegante y cómodo.',
    price: 52000,
    priceOriginal: 65000,
    image: null,
    inOffer: true,
  },
  {
    id: 'pantalon-lino-clasico',
    name: 'Pantalón Lino Clásico',
    category: 'pantalones',
    categoryLabel: 'Pantalones',
    description: 'Pantalón de pierna ancha en lino natural. Cintura elástica ajustable, muy cómodo para el día a día.',
    price: 36000,
    priceOriginal: null,
    image: null,
    inOffer: false,
  },
  {
    id: 'pantalon-capri-organico',
    name: 'Pantalón Capri Orgánico',
    category: 'pantalones',
    categoryLabel: 'Pantalones',
    description: 'Capri de algodón orgánico, largo ideal debajo de la rodilla. Fresco y fácil de combinar.',
    price: 29000,
    priceOriginal: null,
    image: null,
    inOffer: false,
  },
  {
    id: 'pañuelo-seda-floral',
    name: 'Pañuelo Seda Floral',
    category: 'accesorios',
    categoryLabel: 'Accesorios',
    description: 'Pañuelo de seda natural con estampado floral inspirado en la Sabana costarricense.',
    price: 15000,
    priceOriginal: null,
    image: null,
    inOffer: false,
  },
  {
    id: 'bolso-tejido-rafia',
    name: 'Bolso Tejido Rafia',
    category: 'accesorios',
    categoryLabel: 'Accesorios',
    description: 'Bolso artesanal tejido en rafia natural, espacioso y liviano. Hecho por artesanas costarricenses.',
    price: 42000,
    priceOriginal: 50000,
    image: null,
    inOffer: true,
  },
  {
    id: 'bata-algodón-organico',
    name: 'Bata Cómoda del Hogar',
    category: 'ropa-comoda',
    categoryLabel: 'Ropa Cómoda',
    description: 'Bata larga de algodón orgánico, cuello redondo, manga larga suave. Para disfrutar el hogar con estilo.',
    price: 38000,
    priceOriginal: null,
    image: null,
    inOffer: false,
  },
  {
    id: 'conjunto-relax-lino',
    name: 'Conjunto Relax en Lino',
    category: 'ropa-comoda',
    categoryLabel: 'Ropa Cómoda',
    description: 'Conjunto de blusa y pantalón en lino. Cintura elástica, diseño holgado y elegante a la vez.',
    price: 58000,
    priceOriginal: 70000,
    image: null,
    inOffer: true,
  },
  {
    id: 'blusa-manga-campana',
    name: 'Blusa Manga Campana',
    category: 'blusas',
    categoryLabel: 'Blusas',
    description: 'Blusa de algodón con manga campana, ideal para clima tropical. Disponible en colores neutros.',
    price: 26000,
    priceOriginal: null,
    image: null,
    inOffer: false,
  },
  {
    id: 'vestido-siesta',
    name: 'Vestido Siesta Tropical',
    category: 'vestidos',
    categoryLabel: 'Vestidos',
    description: 'Vestido camisero de algodón fresco, botones delanteros. Versátil para casa y salidas casuales.',
    price: 48000,
    priceOriginal: null,
    image: null,
    inOffer: false,
  },
];

/* Datos de Ofertas destacadas (subset del catálogo) */
const OFFERS = PRODUCTS.filter(p => p.inOffer).slice(0, 4);


/* ═══════════════════════════════════════════════
   2. CONFIGURACIÓN — WhatsApp
   REEMPLAZAR con número real antes de producción.
   ═══════════════════════════════════════════════ */
const CONFIG = {
  whatsappNumber: '50600000000',   // Formato: código país + número sin espacios
  whatsappMessage: '¡Hola Ditsö! Me gustaría obtener más información sobre sus productos.',
  storeEmail: 'hola@ditso.cr',      // Reemplazar con email real
};

function getWhatsAppURL(message) {
  const msg = message || CONFIG.whatsappMessage;
  return `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(msg)}`;
}


/* ═══════════════════════════════════════════════
   3. MÓDULO: NAVEGACIÓN
   ═══════════════════════════════════════════════ */
function initNavigation() {
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobile-nav');
  const mobileNavLinks = mobileNav ? mobileNav.querySelectorAll('a') : [];

  if (!hamburger || !mobileNav) return;

  /* Abrir/cerrar menú móvil */
  hamburger.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  /* Cerrar al hacer click en un enlace */
  mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  /* Cerrar con tecla Escape */
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

  /* Restaurar preferencia guardada */
  const savedSize = localStorage.getItem('ditso-font-size');
  if (savedSize === 'large') applyLarge();
  else applyNormal();

  btnNormal.addEventListener('click', () => {
    applyNormal();
    localStorage.setItem('ditso-font-size', 'normal');
  });

  btnLarge.addEventListener('click', () => {
    applyLarge();
    localStorage.setItem('ditso-font-size', 'large');
  });

  function applyNormal() {
    document.body.classList.remove('font-large');
    btnNormal.classList.add('active');
    btnLarge.classList.remove('active');
    btnNormal.setAttribute('aria-pressed', 'true');
    btnLarge.setAttribute('aria-pressed', 'false');
  }

  function applyLarge() {
    document.body.classList.add('font-large');
    btnLarge.classList.add('active');
    btnNormal.classList.remove('active');
    btnLarge.setAttribute('aria-pressed', 'true');
    btnNormal.setAttribute('aria-pressed', 'false');
  }
}


/* ═══════════════════════════════════════════════
   5. MÓDULO: CATÁLOGO — RENDER Y FILTRO

   SEGURIDAD — innerHTML:
   Los datos de productos vienen del array PRODUCTS (controlado por nosotros).
   En Phase 2, cuando los datos lleguen de una API externa, sanitizar cada
   campo antes de insertarlo en el DOM. Usar esta función auxiliar:

     function sanitize(str) {
       const d = document.createElement('div');
       d.textContent = str;
       return d.innerHTML;
     }

   Y aplicar: name: sanitize(product.name), etc.
   ═══════════════════════════════════════════════ */
function formatPrice(amount) {
  return new Intl.NumberFormat('es-CR', {
    style: 'currency',
    currency: 'CRC',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/* Icono SVG de hoja (placeholder de imagen de producto) */
function getLeafSVG(size = 56) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
  </svg>`;
}

/* Construye HTML de una tarjeta de producto */
function buildProductCard(product) {
  const hasDiscount = product.priceOriginal && product.priceOriginal > product.price;
  const discountPct = hasDiscount
    ? Math.round((1 - product.price / product.priceOriginal) * 100)
    : 0;

  const imagePart = product.image
    ? `<img src="${product.image}" alt="Fotografía de ${product.name}" loading="lazy" decoding="async">`
    : `<div class="product-card__image-placeholder" aria-hidden="true">
         ${getLeafSVG(48)}
         <span>Foto próximamente</span>
       </div>`;

  const pricePart = hasDiscount
    ? `<span class="product-card__price">${formatPrice(product.price)}</span>
       <span class="product-card__price-original">${formatPrice(product.priceOriginal)}</span>`
    : `<span class="product-card__price">${formatPrice(product.price)}</span>`;

  const offerBadge = product.inOffer
    ? `<span class="product-card__offer-badge">Oferta −${discountPct}%</span>`
    : '';

  return `
    <article class="product-card" data-category="${product.category}" data-id="${product.id}">
      <div class="product-card__image">
        ${imagePart}
        <span class="product-card__category-badge">${product.categoryLabel}</span>
        ${offerBadge}
      </div>
      <div class="product-card__body">
        <h3 class="product-card__name">${product.name}</h3>
        <p class="product-card__description">${product.description}</p>
        <div class="product-card__pricing">${pricePart}</div>
      </div>
      <div class="product-card__actions">
        <button
          class="btn btn-outline btn-sm"
          onclick="openProductModal('${product.id}', '${product.name.replace(/'/g, "\\'")}')"
          aria-label="Ver detalles de ${product.name}"
        >Ver Detalles</button>
        <button
          class="btn btn-primary btn-sm"
          onclick="openCartModal('${product.id}', '${product.name.replace(/'/g, "\\'")}')"
          aria-label="Agregar al carrito: ${product.name}"
        >🛒 Agregar al Carrito</button>
      </div>
    </article>`;
}

/* Render de ofertas */
function buildOfferCard(product) {
  const hasDiscount = product.priceOriginal && product.priceOriginal > product.price;
  const discountPct = hasDiscount
    ? Math.round((1 - product.price / product.priceOriginal) * 100)
    : 0;

  const imagePart = product.image
    ? `<img src="${product.image}" alt="Fotografía de ${product.name}" loading="lazy" decoding="async">`
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
    <article class="oferta-card">
      <div class="oferta-card__image">
        ${imagePart}
        <span class="oferta-badge">⭐ Oferta Especial</span>
      </div>
      <div class="oferta-card__body">
        <h3 class="oferta-card__name">${product.name}</h3>
        <p class="oferta-card__desc">${product.description}</p>
        <div class="oferta-card__pricing">${pricePart}</div>
        <button
          class="btn btn-whatsapp"
          onclick="openCartModal('${product.id}', '${product.name.replace(/'/g, "\\'")}')"
          aria-label="Consultar oferta de ${product.name} por WhatsApp"
        >Consultar por WhatsApp</button>
      </div>
    </article>`;
}

function initCatalog() {
  const grid = document.getElementById('products-grid');
  const offerGrid = document.getElementById('offers-grid');

  if (grid) {
    grid.innerHTML = PRODUCTS.map(buildProductCard).join('');
  }

  if (offerGrid) {
    offerGrid.innerHTML = OFFERS.map(buildOfferCard).join('');
  }

  initCategoryFilters();
}

function initCategoryFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.category;

      /* Actualizar botones activos */
      filterBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');

      /* BUG FIX Phase 2: Re-query cards en cada click en vez de capturarlos al inicio.
         Esto evita la condición de carrera si en Phase 2 los productos se cargan async.
         Si el grid se renderiza después de DOMContentLoaded (fetch/API), los cards
         igualmente estarán presentes cuando el usuario haga click. */
      const productCards = document.querySelectorAll('.product-card');
      productCards.forEach(card => {
        const show = cat === 'todas' || card.dataset.category === cat;
        card.style.display = show ? '' : 'none';
      });
    });
  });
}


/* ═══════════════════════════════════════════════
   6. MÓDULO: MODAL
   ═══════════════════════════════════════════════ */
const modalOverlay = {
  el: null,
  init() {
    this.el = document.getElementById('cart-modal-overlay');
    if (!this.el) return;

    /* Cerrar al hacer click en el overlay */
    this.el.addEventListener('click', (e) => {
      if (e.target === this.el) this.close();
    });

    /* Cerrar con Escape */
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.el.classList.contains('open')) this.close();
    });

    /* Botón cerrar (X) */
    const closeBtn = document.getElementById('modal-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', () => this.close());

    /* Botón "Continuar viendo" — wired here instead of inline onclick (security) */
    const continueBtn = document.getElementById('modal-continue-btn');
    if (continueBtn) continueBtn.addEventListener('click', () => this.close());
  },
  open(productName, productId) {
    /* Mensaje por defecto: intención de compra (llamado desde Agregar al Carrito) */
    const msg = `Hola Ditsö, me interesa el producto "${productName}". ¿Cómo puedo adquirirlo?`;
    this._show(productName, msg);
  },
  openWithMessage(productName, productId, customMessage) {
    /* Mensaje personalizado — usado por Ver Detalles (consulta de info) */
    this._show(productName, customMessage);
  },
  _show(productName, message) {
    if (!this.el) return;
    /* BUG FIX: el elemento usa id="modal-product-name" en el HTML.
       Asegurarse de que el <strong> en index.html tenga ese id. */
    const nameEl = document.getElementById('modal-product-name');
    const waBtn  = document.getElementById('modal-wa-btn');

    if (nameEl) nameEl.textContent = productName || 'este producto';
    if (waBtn)  waBtn.href = getWhatsAppURL(message);

    this.el.classList.add('open');
    this.el.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    /* Enfocar el botón de cierre primero para accesibilidad (WCAG 2.1 — 2.4.3) */
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

/* Funciones globales llamadas desde botones en HTML generado */
window.openCartModal = function(productId, productName) {
  modalOverlay.open(productName, productId);
};

window.openProductModal = function(productId, productName) {
  /* Phase 1: abre el modal de WhatsApp con mensaje de consulta de información.
     Phase 2: reemplazar con navegación a la página de detalle del producto:
              window.location.href = `/productos/${productId}`; */
  modalOverlay.openWithMessage(
    productName,
    productId,
    `Hola Ditsö, me gustaría obtener más información sobre "${productName}". ¿Me puede ayudar?`
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

      /* Cerrar todos */
      faqItems.forEach(i => {
        i.classList.remove('open');
        const q = i.querySelector('.faq-question');
        if (q) q.setAttribute('aria-expanded', 'false');
      });

      /* Abrir el clickeado (si estaba cerrado) */
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
  const sections = document.querySelectorAll('section[id], div[id="inicio"]');
  const navLinks  = document.querySelectorAll('.nav-list a');

  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(link => link.classList.remove('active'));
          const id = entry.target.getAttribute('id');
          const activeLink = document.querySelector(`.nav-list a[href="#${id}"]`);
          if (activeLink) activeLink.classList.add('active');
        }
      });
    },
    {
      rootMargin: `-${getComputedStyle(document.documentElement).getPropertyValue('--header-height') || '80px'} 0px -60% 0px`,
    }
  );

  sections.forEach(section => observer.observe(section));
}


/* ═══════════════════════════════════════════════
   9. INIT — ARRANQUE PRINCIPAL
   ═══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initFontSizeToggle();
  initCatalog();
  modalOverlay.init();
  initFAQ();
  initScrollActiveNav();

  /* Actualizar todos los enlaces de WhatsApp en el documento */
  document.querySelectorAll('[data-whatsapp-link]').forEach(el => {
    const customMsg = el.dataset.whatsappMsg;
    el.href = getWhatsAppURL(customMsg || undefined);
  });

  console.info(
    '%cDitsö — Phase 1 cargado correctamente ✓',
    'color: #D4B434; font-weight: bold; font-size: 14px;'
  );
  console.info('Phase 2: conectar API en js/main.js → PRODUCTS array → función initCatalog()');
});