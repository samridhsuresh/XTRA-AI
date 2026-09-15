(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const isHome = Boolean(document.querySelector('.portal-one'));
  const assetBase = isHome ? 'assets/' : '../assets/';
  const root = document.documentElement;
  let themeToggle;

  function savedTheme() {
    try { return localStorage.getItem('xg-theme'); } catch { return null; }
  }

  function setTheme(theme, persist = false) {
    const next = theme === 'dark' ? 'dark' : 'light';
    root.dataset.theme = next;
    root.style.colorScheme = next;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', next === 'dark' ? '#070A09' : '#FAFAF8');
    document.querySelectorAll('.hero-lockup').forEach((image) => {
      image.src = `${assetBase}xtragrid-lockup-${next === 'dark' ? 'dark' : 'light'}.svg`;
    });
    if (themeToggle) {
      const dark = next === 'dark';
      themeToggle.setAttribute('aria-pressed', String(dark));
      themeToggle.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} theme`);
      themeToggle.title = `Switch to ${dark ? 'light' : 'dark'} theme`;
    }
    if (persist) {
      try { localStorage.setItem('xg-theme', next); } catch {}
    }
  }

  setTheme(savedTheme() === 'dark' ? 'dark' : 'light');

  function installThemeToggle() {
    const nav = document.querySelector('.site-nav');
    if (!nav || nav.querySelector('.theme-toggle')) return;
    const actions = document.createElement('div');
    actions.className = 'nav-actions';
    const contact = nav.querySelector('.contact-link');
    const menuButton = nav.querySelector('.menu-btn');
    nav.append(actions);

    themeToggle = document.createElement('button');
    themeToggle.className = 'theme-toggle';
    themeToggle.type = 'button';
    themeToggle.innerHTML = '<span class="theme-toggle__track" aria-hidden="true"><i></i></span><span class="theme-toggle__label">Theme</span>';
    actions.append(themeToggle);
    if (contact) actions.append(contact);
    if (menuButton) actions.append(menuButton);
    themeToggle.addEventListener('click', () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark', true));
    setTheme(root.dataset.theme);
  }

  function installBrand() {
    document.querySelectorAll('.site-nav .brand img').forEach((image) => {
      image.src = `${assetBase}xtragrid-mark.svg`;
      image.alt = 'XTRAGRID';
    });
    document.querySelectorAll('.footer .brand img').forEach((image) => {
      image.src = `${assetBase}xtragrid-lockup-dark.svg`;
      image.alt = 'XTRAGRID TECHNOLOGIES — Smart Technology. Sustainable Energy. Infinite Possibilities.';
    });
    document.querySelectorAll('link[rel="icon"]').forEach((link) => {
      link.href = `${assetBase}xtragrid-mark.svg`;
      link.type = 'image/svg+xml';
    });

    if (isHome) {
      const hero = document.querySelector('.hero');
      if (hero && !hero.querySelector('.hero-lockup')) {
        const lockup = document.createElement('img');
        lockup.className = 'hero-lockup';
        lockup.src = `${assetBase}xtragrid-lockup-${root.dataset.theme === 'dark' ? 'dark' : 'light'}.svg`;
        lockup.alt = 'XTRAGRID TECHNOLOGIES — Smart Technology. Sustainable Energy. Infinite Possibilities.';
        hero.append(lockup);
      }
      const openingTitle = document.querySelector('.opening h2');
      if (openingTitle) {
        openingTitle.innerHTML = 'Technology and energy,<em> engineered as one.</em>';
      }
    }
  }

  function installThread() {
    if (reduced || document.querySelector('.continuity-thread')) return;
    const thread = document.createElement('div');
    thread.className = 'continuity-thread';
    thread.setAttribute('aria-hidden', 'true');
    thread.innerHTML = `<img src="${assetBase}xtragrid-mark.svg" alt="">`;
    document.body.append(thread);

    let ticking = false;
    const update = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      thread.style.setProperty('--page-p', Math.max(0, Math.min(1, scrollY / max)).toFixed(4));
      ticking = false;
    };
    addEventListener('scroll', () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }, { passive: true });
    addEventListener('resize', update, { passive: true });
    update();
  }

  function installContactEmail() {
    const shell = document.querySelector('.contact-shell');
    if (!shell) return;

    const details = shell.querySelector('.contact-grid > div');
    if (details && !details.querySelector('.contact-email')) {
      const email = document.createElement('a');
      email.className = 'contact-email mono';
      email.href = 'mailto:info@xtragrid.in';
      email.innerHTML = 'info@xtragrid.in <span>↗</span>';
      details.append(email);
    }

    const legalList = document.querySelector('.legal-list');
    if (legalList && !legalList.querySelector('a[href^="mailto:"]')) {
      const row = document.createElement('div');
      row.className = 'legal-row';
      row.innerHTML = '<span>Email</span><strong><a href="mailto:info@xtragrid.in">info@xtragrid.in</a></strong>';
      legalList.append(row);
    }

    const form = document.querySelector('#inquiryForm');
    if (!form) return;
    const button = form.querySelector('.submit');
    if (button) button.innerHTML = '<span>Email enquiry</span><span>Send ↗</span>';
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      const data = new FormData(form);
      const name = String(data.get('name') || '').trim();
      const area = String(data.get('area') || 'Business enquiry');
      const body = ['XTRAGRID BUSINESS ENQUIRY', '', ...Array.from(data.entries()).map(([key, value]) => `${key.toUpperCase()}: ${value}`)].join('\n');
      const status = form.querySelector('.form-status');
      if (status) status.textContent = 'Opening your email app to contact info@xtragrid.in…';
      location.href = `mailto:info@xtragrid.in?subject=${encodeURIComponent(`${area} — ${name}`)}&body=${encodeURIComponent(body)}`;
    }, true);
  }

  function installNavBehavior() {
    const nav = document.querySelector('.site-nav');
    if (!nav) return;
    let ticking = false;
    const update = () => {
      nav.classList.toggle('is-condensed', scrollY > 72);
      ticking = false;
    };
    addEventListener('scroll', () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }, { passive: true });
    update();
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const existing = [...document.scripts].find((script) => script.src === src);
      if (existing) {
        if (existing.dataset.ready === 'true' || (src.includes('gsap') && window.gsap) || (src.includes('lenis') && window.Lenis)) resolve();
        else existing.addEventListener('load', resolve, { once: true });
        return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.addEventListener('load', () => { script.dataset.ready = 'true'; resolve(); }, { once: true });
      script.addEventListener('error', reject, { once: true });
      document.head.append(script);
    });
  }

  function splitHeading(element) {
    if (!element || element.dataset.wordSplit === 'true') return [];
    const text = element.textContent.trim().replace(/\s+/g, ' ');
    if (!text) return [];
    element.dataset.wordSplit = 'true';
    element.setAttribute('aria-label', text);
    element.innerHTML = text.split(' ').map((word) => `<span class="word-reveal" aria-hidden="true"><i>${word}</i></span>`).join(' ');
    return [...element.querySelectorAll('.word-reveal > i')];
  }

  function installPointerCraft(gsap) {
    if (!finePointer || reduced) return;

    document.querySelectorAll('.cap-card, .director, .director-mini').forEach((card) => {
      const rx = gsap.quickTo(card, 'rotationX', { duration: .55, ease: 'power3.out' });
      const ry = gsap.quickTo(card, 'rotationY', { duration: .55, ease: 'power3.out' });
      card.addEventListener('pointermove', (event) => {
        const box = card.getBoundingClientRect();
        const x = (event.clientX - box.left) / box.width;
        const y = (event.clientY - box.top) / box.height;
        card.style.setProperty('--mx', `${x * 100}%`);
        card.style.setProperty('--my', `${y * 100}%`);
        rx((.5 - y) * 3.2);
        ry((x - .5) * 4.2);
      }, { passive: true });
      card.addEventListener('pointerleave', () => { rx(0); ry(0); });
    });

    document.querySelectorAll('.scene-link, .scroll-cue, .directors-link a, .contact-cta a, .cta a, .submit').forEach((button) => {
      button.classList.add('magnetic');
      const xTo = gsap.quickTo(button, 'x', { duration: .7, ease: 'elastic.out(1, .35)' });
      const yTo = gsap.quickTo(button, 'y', { duration: .7, ease: 'elastic.out(1, .35)' });
      button.addEventListener('pointermove', (event) => {
        const box = button.getBoundingClientRect();
        xTo((event.clientX - box.left - box.width / 2) * .12);
        yTo((event.clientY - box.top - box.height / 2) * .18);
      }, { passive: true });
      button.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
    });
  }

  function installMotion() {
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    if (!gsap || !ScrollTrigger || reduced) return;
    gsap.registerPlugin(ScrollTrigger);

    if (!window.xgLenis && window.Lenis) {
      const lenis = new Lenis({
        duration: 1.35,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: .82,
        anchors: true
      });
      window.xgLenis = lenis;
      lenis.on('scroll', ScrollTrigger.update);
      const tick = (time) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      addEventListener('pagehide', () => { gsap.ticker.remove(tick); lenis.destroy(); }, { once: true });
    }

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (event) => {
        const id = anchor.getAttribute('href');
        const target = id && id.length > 1 ? document.querySelector(id) : document.documentElement;
        if (!target || !window.xgLenis) return;
        event.preventDefault();
        const pinnedTrigger = window.ScrollTrigger?.getAll().find((item) => item.trigger === target);
        window.xgLenis.scrollTo(pinnedTrigger ? pinnedTrigger.start + 2 : target, { duration: 1.25, offset: pinnedTrigger ? 0 : -60 });
      });
    });

    const headingSelectors = [
      '.intro h2', '.cap-head h2', '.process > h2', '.cta > h2',
      '.directors-head h2', '.contact-cta h2', '.leadership h2', '.contact-shell h2',
      '.architecture h2', '.applications h2'
    ];
    document.querySelectorAll(headingSelectors.join(',')).forEach((heading) => {
      const words = splitHeading(heading);
      if (!words.length) return;
      gsap.fromTo(words,
        { yPercent: 34, rotation: 1.8 },
        {
          yPercent: -3,
          rotation: 0,
          stagger: .035,
          ease: 'none',
          scrollTrigger: { trigger: heading, start: 'top 92%', end: 'top 42%', scrub: .7 }
        }
      );
    });

    const heroMedia = document.querySelector(isHome ? '.hero > .hero-media' : '.page-hero .hero-media img');
    if (heroMedia) {
      gsap.fromTo(heroMedia,
        { yPercent: -1.5, scale: 1.045 },
        { yPercent: 4.5, scale: 1.01, ease: 'none', scrollTrigger: { trigger: '.page-hero, .hero', start: 'top top', end: 'bottom top', scrub: .8 } }
      );
    }

    const storageVisual = document.querySelector('.storage-page .visual img');
    if (storageVisual) {
      gsap.fromTo(storageVisual, { scale: 1.06, yPercent: -2 }, { scale: 1.01, yPercent: 4, ease: 'none', scrollTrigger: { trigger: '.storage-page .hero', start: 'top top', end: 'bottom top', scrub: .8 } });
    }
    const stack = document.querySelector('.storage-page .stack');
    if (stack) {
      stack.addEventListener('click', () => stack.classList.toggle('is-open'));
      gsap.fromTo(stack, { rotationX: 2.5, y: 20 }, { rotationX: -2, y: -14, transformPerspective: 1000, ease: 'none', scrollTrigger: { trigger: stack, start: 'top bottom', end: 'bottom top', scrub: .9 } });
    }

    document.querySelectorAll('.intro, .capabilities, .process, .cta, .company-story, .directors-preview, .contact-cta').forEach((section) => {
      const content = section.firstElementChild;
      if (!content) return;
      gsap.fromTo(content, { y: 18 }, { y: -10, ease: 'none', scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: 1 } });
    });

    installPointerCraft(gsap);
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }

  installBrand();
  installThemeToggle();
  installThread();
  installNavBehavior();
  installContactEmail();

  (async () => {
    try {
      if (!window.gsap) await loadScript('https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js');
      if (!window.ScrollTrigger) await loadScript('https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js');
      if (!window.Lenis) await loadScript('https://unpkg.com/lenis@1.3.26/dist/lenis.min.js');
      installMotion();
    } catch (error) {
      console.warn('XTRAGRID premium motion fallback active.', error);
    }
  })();
})();

