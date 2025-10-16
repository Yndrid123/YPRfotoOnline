// main.js - Interacciones para YRG Photography
(() => {
  'use strict';
  // Placeholder image (SVG data URI)
  const placeholderImage = 'data:image/svg+xml;charset=UTF-8,' +
    encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600'>
      <rect width='100%' height='100%' fill='#f3f4f6'/>
      <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#9ca3af' font-size='22'>Imagen no disponible</text>
    </svg>`);

  /* ----- UTIL: querySelectorAll to Array ----- */
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ----- SMOOTH SCROLL FOR NAV LINKS ----- */
  function enableSmoothScroll() {
    const navLinks = $$('a.nav-link[href^="#"], a.navbar-brand[href^="#"]');
    navLinks.forEach(a => {
      a.addEventListener('click', (e) => {
        const href = a.getAttribute('href');
        if (!href || href === '#' || !href.startsWith('#')) return;
        e.preventDefault();
        const target = document.querySelector(href);
        if (!target) return;
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // collapse navbar (for mobile bootstrap)
        const bsCollapse = document.querySelector('.navbar-collapse.collapse.show');
        if (bsCollapse) {
          // using bootstrap's collapse method if available
          bsCollapse.classList.remove('show');
        }
      });
    });
  }

  /* ----- LAZY LOADING + ERROR HANDLING ----- */
  function enhanceImages() {
    const imgs = $$('img.galeria-img, img.img-fluid, img');
    imgs.forEach(img => {
      // add loading attribute if not present
      if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');

      // set object-fit style fallback
      if (!img.style.objectFit) img.style.objectFit = 'cover';

      // handle error: replace with placeholder
      img.addEventListener('error', () => {
        if (img.src !== placeholderImage) img.src = placeholderImage;
      });

      // add keyboard focusable for accessibility
      img.setAttribute('tabindex', '0');

      // add data-caption if not exists (from alt or filename)
      if (!img.dataset.caption) {
        const alt = img.getAttribute('alt');
        if (alt && alt.trim()) img.dataset.caption = alt.trim();
        else {
          // from file name
          try {
            const src = img.getAttribute('src') || '';
            const file = src.split('/').pop();
            img.dataset.caption = file || 'Imagen';
          } catch {
            img.dataset.caption = 'Imagen';
          }
        }
      }
    });
  }

  /* ----- BACK TO TOP BUTTON ----- */
  function createBackToTop() {
    const btn = document.createElement('button');
    btn.className = 'yrg-backtop btn btn-primary';
    btn.innerHTML = '↑';
    Object.assign(btn.style, {
      position: 'fixed',
      right: '20px',
      bottom: '20px',
      width: '42px',
      height: '42px',
      borderRadius: '50%',
      display: 'none',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
    });
    document.body.appendChild(btn);

    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) btn.style.display = 'flex';
      else btn.style.display = 'none';
    });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ----- LIGHTBOX / MODAL GALLERY ----- */
  function createLightbox() {
    // Create modal DOM
    const overlay = document.createElement('div');
    overlay.id = 'yrg-lightbox';
    Object.assign(overlay.style, {
      position: 'fixed',
      inset: '0',
      background: 'rgba(0,0,0,0.85)',
      display: 'none',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '20px',
    });

    const container = document.createElement('div');
    container.style.maxWidth = '1200px';
    container.style.width = '100%';
    container.style.maxHeight = '90vh';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.alignItems = 'center';
    container.style.gap = '10px';

    const imgEl = document.createElement('img');
    imgEl.style.maxWidth = '100%';
    imgEl.style.maxHeight = '80vh';
    imgEl.style.borderRadius = '10px';
    imgEl.style.boxShadow = '0 6px 30px rgba(0,0,0,.6)';
    imgEl.alt = '';

    const caption = document.createElement('div');
    caption.style.color = '#fff';
    caption.style.fontSize = '0.95rem';
    caption.style.textAlign = 'center';
    caption.style.maxWidth = '100%';
    caption.style.padding = '0 10px';

    // controls
    const controls = document.createElement('div');
    controls.style.display = 'flex';
    controls.style.gap = '10px';
    controls.style.alignItems = 'center';

    const prevBtn = document.createElement('button');
    prevBtn.className = 'btn btn-sm btn-light';
    prevBtn.textContent = '◀';

    const nextBtn = document.createElement('button');
    nextBtn.className = 'btn btn-sm btn-light';
    nextBtn.textContent = '▶';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'btn btn-sm btn-warning';
    closeBtn.textContent = 'Cerrar (Esc)';

    controls.append(prevBtn, nextBtn, closeBtn);

    container.appendChild(imgEl);
    container.appendChild(caption);
    container.appendChild(controls);
    overlay.appendChild(container);
    document.body.appendChild(overlay);

    // state
    const gallery = $$('img.galeria-img, section img');
    let currentIndex = -1;

    function showIndex(i) {
      if (i < 0 || i >= gallery.length) return;
      const node = gallery[i];
      currentIndex = i;
      imgEl.src = node.src;
      imgEl.alt = node.alt || node.dataset.caption || '';
      caption.textContent = node.dataset.caption || node.alt || '';
      overlay.style.display = 'flex';
      // trap focus to close button for accessibility
      closeBtn.focus();
    }

    function close() {
      overlay.style.display = 'none';
      imgEl.src = '';
      currentIndex = -1;
    }

    // listeners for gallery images
    gallery.forEach((g, idx) => {
      const openFn = (e) => {
        e.preventDefault();
        showIndex(idx);
      };
      g.addEventListener('click', openFn);
      g.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' || ev.key === ' ') {
          ev.preventDefault();
          showIndex(idx);
        }
      });
    });

    prevBtn.addEventListener('click', () => {
      showIndex((currentIndex - 1 + gallery.length) % gallery.length);
    });

    nextBtn.addEventListener('click', () => {
      showIndex((currentIndex + 1) % gallery.length);
    });

    closeBtn.addEventListener('click', close);

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });

    // keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (overlay.style.display === 'flex') {
        if (e.key === 'Escape') close();
        else if (e.key === 'ArrowLeft') prevBtn.click();
        else if (e.key === 'ArrowRight') nextBtn.click();
      }
    });
  }

  /* ----- ACTIVE LINK HIGHLIGHT BASED ON SCROLL ----- */
  function highlightActiveSection() {
    const sections = $$('section[id]');
    const navItems = $$('a.nav-link');
    if (!sections.length || !navItems.length) return;

    const idToLink = {};
    navItems.forEach(a => {
      const href = a.getAttribute('href');
      if (href && href.startsWith('#')) idToLink[href.slice(1)] = a;
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const id = entry.target.id;
        const link = idToLink[id];
        if (!link) return;
        if (entry.isIntersecting) {
          // remove active from all and add to this one
          navItems.forEach(n => n.classList.remove('active'));
          link.classList.add('active');
        }
      });
    }, { root: null, rootMargin: '-40% 0px -40% 0px', threshold: 0 });

    sections.forEach(s => observer.observe(s));
  }

  /* ----- INIT ALL ----- */
  function init() {
    enableSmoothScroll();
    enhanceImages();
    createBackToTop();
    createLightbox();
    highlightActiveSection();
    // small tweak: change external links to open in new tab
    $$('a[href^="http"]').forEach(a => a.setAttribute('target', '_blank'));
  }

  // Wait DOM content
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();