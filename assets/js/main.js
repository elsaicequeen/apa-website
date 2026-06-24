/* =========================================================================
   Main interactions — vanilla JS, no dependencies.
   Header scroll state · mobile nav · reveal-on-scroll · sticky mobile CTA ·
   contact-form UX (validation + Formspree submit) · smooth in-page links.
   ========================================================================= */
(function () {
  'use strict';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Header glass-on-scroll ----------------------------------------- */
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---- Mobile nav: close on link click / Escape ----------------------- */
  const navToggle = document.getElementById('nav-toggle');
  if (navToggle) {
    document.querySelectorAll('.nav a').forEach((a) =>
      a.addEventListener('click', () => { navToggle.checked = false; })
    );
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') navToggle.checked = false;
    });
  }

  /* ---- Reveal on scroll ----------------------------------------------- */
  const reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  if (!reveals.length || reduceMotion) {
    reveals.forEach((el) => el.classList.add('in'));
  } else {
    const show = (el) => el.classList.add('in');
    // Primary: IntersectionObserver (cheap, fires as elements enter view).
    if ('IntersectionObserver' in window) {
      const ro = new IntersectionObserver((entries, obs) => {
        entries.forEach((en) => { if (en.isIntersecting) { show(en.target); obs.unobserve(en.target); } });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
      reveals.forEach((el) => ro.observe(el));
    }
    // Backstop: a throttled scroll/resize check that reveals anything within
    // view. Guarantees the effect works even if IO is unavailable or quirky,
    // and content can never end up permanently hidden.
    let ticking = false;
    const check = () => {
      ticking = false;
      const vh = window.innerHeight || document.documentElement.clientHeight;
      for (let i = reveals.length - 1; i >= 0; i--) {
        const el = reveals[i];
        if (el.classList.contains('in')) { reveals.splice(i, 1); continue; }
        if (el.getBoundingClientRect().top < vh * 0.92) show(el);
      }
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(check); } };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    check(); // reveal whatever is already in view on load
  }

  /* ---- Sticky mobile CTA (injected once, lives in one place) ----------- */
  const WHATSAPP_HREF = document.body.dataset.whatsapp || '#contact';
  if (!document.querySelector('.sticky-cta')) {
    const bar = document.createElement('div');
    bar.className = 'sticky-cta';
    bar.innerHTML =
      '<a class="btn btn--whatsapp" href="' + WHATSAPP_HREF + '" rel="noopener">' +
        '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M.05 24l1.7-6.2A11.9 11.9 0 1 1 12 24a11.9 11.9 0 0 1-5.9-1.6L.05 24zM6.6 20.1l.4.2a9.9 9.9 0 1 0-3.4-3.4l.2.4-1 3.6 3.8-.8zM17.5 14.3c-.3-.1-1.7-.8-1.9-.9s-.4-.1-.6.2-.7.9-.8 1-.3.2-.6.1a8.1 8.1 0 0 1-2.4-1.5 9 9 0 0 1-1.6-2c-.2-.3 0-.4.1-.6l.4-.5.3-.5a.5.5 0 0 0 0-.5C9 8 8.5 6.7 8.3 6.2s-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 2.9 2.9 0 0 0-1 2.2A5.1 5.1 0 0 0 6.6 11a11.6 11.6 0 0 0 4.5 4 5.2 5.2 0 0 0 3.2.7 2.6 2.6 0 0 0 1.7-1.2 2.1 2.1 0 0 0 .2-1.2c-.1-.1-.3-.2-.6-.3z"/></svg>' +
        'WhatsApp</a>' +
      '<a class="btn" href="contact.html">Book free intake</a>';
    document.body.appendChild(bar);
  }

  /* ---- Smooth scroll for in-page anchors ------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      el.setAttribute('tabindex', '-1');
      el.focus({ preventScroll: true });
    });
  });

  /* ---- Lazy-load Calendly when its container scrolls into view ---------- */
  const cal = document.querySelector('[data-calendly]');
  if (cal && 'IntersectionObserver' in window) {
    const co = new IntersectionObserver((entries, obs) => {
      if (!entries[0].isIntersecting) return;
      const url = cal.dataset.calendly;
      // Only inject the widget if a real URL has been configured (not the TODO placeholder).
      if (url && url.indexOf('YOUR-CALENDLY') === -1) {
        cal.innerHTML =
          '<div class="calendly-inline-widget" data-url="' + url +
          '" style="min-width:280px;height:660px;"></div>';
        const s = document.createElement('script');
        s.src = 'https://assets.calendly.com/assets/external/widget.js';
        s.async = true;
        document.body.appendChild(s);
      }
      obs.disconnect();
    }, { rootMargin: '200px' });
    co.observe(cal);
  }

  /* ---- Contact form: validation + Formspree submit --------------------- */
  const form = document.getElementById('contact-form');
  if (form) {
    const status = form.querySelector('.form-status');
    const setStatus = (msg, kind) => {
      if (!status) return;
      status.textContent = msg;
      status.className = 'form-status ' + kind;
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Honeypot — if filled, silently "succeed" (bot).
      if (form.querySelector('.hp') && form.querySelector('.hp').value) {
        setStatus('Thank you — your message has been sent.', 'ok');
        form.reset();
        return;
      }

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const action = form.getAttribute('action') || '';
      const btn = form.querySelector('button[type="submit"]');
      const original = btn ? btn.textContent : '';

      // If Formspree isn't configured yet, fall back to a mailto so the
      // form is never a dead end for the practitioner during setup.
      if (action.indexOf('YOUR-FORM-ID') !== -1 || action === '') {
        const data = new FormData(form);
        const body = encodeURIComponent(
          'Name: ' + (data.get('name') || '') + '\n' +
          'Email: ' + (data.get('email') || '') + '\n' +
          'Preferred language: ' + (data.get('language') || '') + '\n' +
          'Session type: ' + (data.get('session') || '') + '\n\n' +
          (data.get('message') || '')
        );
        const to = document.body.dataset.email || 'hello@example.com';
        window.location.href = 'mailto:' + to + '?subject=' +
          encodeURIComponent('Therapy enquiry from website') + '&body=' + body;
        setStatus('Opening your email app… if nothing happens, please email or WhatsApp directly.', 'ok');
        return;
      }

      try {
        if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
        const res = await fetch(action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' },
        });
        if (res.ok) {
          setStatus("Thank you — your message has been sent. You'll hear back within 1–2 days.", 'ok');
          form.reset();
        } else {
          setStatus('Something went wrong. Please WhatsApp or email me instead.', 'err');
        }
      } catch (err) {
        setStatus('Network error. Please WhatsApp or email me instead.', 'err');
      } finally {
        if (btn) { btn.disabled = false; btn.textContent = original; }
      }
    });
  }

  /* ---- WhatsApp links open in a new tab -------------------------------- */
  // Runs after the per-page inline scripts have set the real wa.me hrefs and
  // after the sticky CTA is injected above, so it catches every WhatsApp link.
  document.querySelectorAll('a[href*="wa.me"]').forEach((a) => {
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
  });

  /* ---- Footer year ----------------------------------------------------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
