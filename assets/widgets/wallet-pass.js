// Interactive Wallet pass stack + anatomy widget.
// Tap a pass to open it, then tap a part of the pass (or a button) to see what it is.
(() => {
  if (window.__walletAnatomy) return;
  window.__walletAnatomy = true;

  const COLORS = { logo: '#8DB8FF', header: '#9EE7FF', primary: '#B6E388', secondary: '#FFB0D6', auxiliary: '#EEF0F5', back: '#C4A8FF' };
  const LABELS = { logo: 'Logo + logo text', header: 'Header', primary: 'Primary field', secondary: 'Secondary', auxiliary: 'Auxiliary', back: 'Back of the pass' };
  const PARTS = ['logo', 'header', 'primary', 'secondary', 'auxiliary', 'back'];

  const PASSES = [
    {
      id: 'boarding', name: 'Skyline Air boarding pass',
      bg: 'linear-gradient(150deg,#2a6be0 0%,#123a8a 55%,#0b2a66 100%)', mark: 'conic-gradient(#9EE7FF,#2a6be0,#ffffff,#9EE7FF)',
      logo: 'Skyline Air', header: ['Gate', 'C4'],
      route: [['San Francisco', 'SFO'], ['New York', 'JFK']],
      secondary: [['Passenger', 'Alex Kim'], ['Flight', 'SK 214']],
      auxiliary: [['Boards', '7:40'], ['Group', '3'], ['Seat', '14A']],
      back: [['Baggage', 'One carry-on and one personal item.'], ['Customer service', 'help@skyline.example · +1 555 0144'], ['Terms', 'Boarding closes 15 minutes before departure.']],
      seed: 3,
    },
    {
      id: 'store', name: 'Green Leaf Market store card',
      bg: '#0f5f55', mark: 'conic-gradient(#7be0b5,#1aa085,#d6ffe9,#7be0b5)',
      strip: 'radial-gradient(circle at 25% 60%,#7be0b5 0 8cqw,transparent 8.2cqw),radial-gradient(circle at 62% 40%,#3fbf96 0 11cqw,transparent 11.2cqw),linear-gradient(90deg,#14806f,#1aa085)',
      logo: 'Green Leaf', header: ['Points', '1,280'],
      primary: ['Balance', '$24.50'],
      secondary: [['Member', 'Alex Kim'], ['Tier', 'Gold']],
      auxiliary: [['Member since', '2024'], ['Store', 'Hayes Valley']],
      back: [['Rewards', 'Earn 1 point per dollar. 500 points = $5 off.'], ['Customer service', 'hello@greenleaf.example'], ['Terms', 'Balance does not expire.']],
      seed: 5,
    },
    {
      id: 'coupon', name: 'Bean There Coffee coupon',
      bg: 'linear-gradient(150deg,#ff6fae 0%,#d0268f 55%,#8e1478 100%)', mark: 'conic-gradient(#ffd3a8,#ff6fae,#fff,#ffd3a8)',
      logo: 'Bean There', header: ['Expires', 'Dec 31'], perf: true,
      primary: ['Offer', '20% off'],
      secondary: [['Valid on', 'Any pastry']],
      auxiliary: [['Code', 'BEAN20'], ['Uses', 'One time']],
      back: [['Details', 'One coupon per visit. Not valid with other offers.'], ['Locations', 'All Bean There Coffee stores.']],
      seed: 9,
    },
    {
      id: 'event', name: 'Aurora Live event ticket',
      bg: 'linear-gradient(160deg,#7b2ff7 0%,#3a1290 45%,#16063a 100%)', mark: 'conic-gradient(#ff7ab6,#9db8ff,#7b2ff7,#ff7ab6)',
      logo: 'Nightshift', header: ['Date', 'Nov 21'],
      primary: ['Event', 'Aurora Live'],
      secondary: [['Venue', 'Pier 39 Hall'], ['Doors', '7:00 PM']],
      auxiliary: [['Section', 'B'], ['Row', '12'], ['Seat', '8']],
      back: [['Terms & conditions', 'Non-refundable. No re-entry. Lineup subject to change.'], ['Customer service', 'help@nightshift.example · +1 555 0100'], ['Accessibility', 'Step-free entrance on Gate 2.']],
      seed: 11,
    },
  ];

  const CAPTIONS = {
    stack: 'Tap a pass to open it.',
    open: 'Tap a part of the pass, or pick one below.',
    logo: () => 'The logo and logo text say who issued the pass. They stay visible even when the pass is collapsed in the stack.',
    header: (p) => `Header fields are visible when collapsed too, so they hold the most time-sensitive detail. Here: ${p.header[0].toLowerCase()} ${p.header[1]}.`,
    primary: () => 'The primary field shows the single most important piece of information on the pass.',
    secondary: () => 'Secondary fields hold useful, but less critical, details.',
    auxiliary: () => 'Auxiliary fields hold more details, at an even lower priority.',
    back: () => 'The back holds anything people rarely need, like terms, contact info and accessibility notes.',
  };

  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const f = ([l, v]) => `<span class="wp-f"><span class="wp-l">${esc(l)}</span><span class="wp-v">${esc(v)}</span></span>`;

  function rng(seed) {
    let s = seed >>> 0 || 1;
    return () => ((s = Math.imul(s ^ (s >>> 15), 2246822519) ^ Math.imul(s ^ (s >>> 13), 3266489917)), (s >>> 0) / 4294967296);
  }

  function qr(seed) {
    const n = 21; let cells = '';
    const r = rng(seed);
    const finders = [[0, 0], [0, n - 7], [n - 7, 0]];
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const fd = finders.find(([a, b]) => i >= a && i < a + 7 && j >= b && j < b + 7);
      let on;
      if (fd) { const di = i - fd[0], dj = j - fd[1]; on = di === 0 || di === 6 || dj === 0 || dj === 6 || (di >= 2 && di <= 4 && dj >= 2 && dj <= 4); }
      else on = r() > .52;
      if (on) cells += `<rect x="${j}" y="${i}" width="1.04" height="1.04"/>`;
    }
    return `<svg viewBox="0 0 ${n} ${n}" fill="#111" aria-hidden="true">${cells}</svg>`;
  }

  const PLANE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 13l8-1 5-8h2l-2 8 5-.5 2-2.5h1.5l-1 4 1 4H22l-2-2.5-5-.5 2 8h-2l-5-8-8-1z"/></svg>';

  function passHTML(p) {
    const primary = p.route
      ? `<div class="wp-primary wp-route" data-part="primary">${f(p.route[0])}${PLANE}${f(p.route[1])}</div>`
      : `<div class="wp-primary" data-part="primary">${f(p.primary)}</div>`;
    const back = p.back.map(([l, v]) => `<span class="wp-l">${esc(l)}</span><p>${esc(v)}</p>`).join('');
    return `
      <div class="wp-flip">
        <div class="wp-face wp-front" style="--pass-bg:${p.bg};--mark:${p.mark};${p.strip ? `--strip:${p.strip}` : ''}">
          <div class="wp-top">
            <span class="wp-logo" data-part="logo"><span class="wp-mark"></span>${esc(p.logo)}</span>
            <span class="wp-header" data-part="header">${f(p.header)}</span>
          </div>
          ${p.strip ? '<div class="wp-strip"></div>' : ''}
          ${p.perf ? '<div class="wp-perf"></div>' : ''}
          ${primary}
          <div class="wp-row" data-part="secondary">${p.secondary.map(f).join('')}</div>
          <div class="wp-row" data-part="auxiliary">${p.auxiliary.map(f).join('')}</div>
          <div class="wp-code">${qr(p.seed)}</div>
          <svg class="wp-ink" aria-hidden="true"></svg>
        </div>
        <div class="wp-face wp-back" data-part="back">${back}<svg class="wp-ink" aria-hidden="true"></svg></div>
      </div>`;
  }

  // hand-drawn rectangle, like the video
  function roughRect(x, y, w, h, seed) {
    const r = rng(seed);
    const line = (x1, y1, x2, y2) => {
      const len = Math.hypot(x2 - x1, y2 - y1), j = Math.min(2.5, len * .012);
      const nx = -(y2 - y1) / len, ny = (x2 - x1) / len, bow = (r() - .5) * Math.min(5, len * .02);
      const mx = (x1 + x2) / 2 + nx * bow, my = (y1 + y2) / 2 + ny * bow;
      const sx = x1 + (r() - .5) * j, sy = y1 + (r() - .5) * j;
      const ex = x2 + (r() - .5) * j + (x2 - x1) / len * 2, ey = y2 + (r() - .5) * j + (y2 - y1) / len * 2;
      return `M${sx.toFixed(1)},${sy.toFixed(1)} Q${mx.toFixed(1)},${my.toFixed(1)} ${ex.toFixed(1)},${ey.toFixed(1)}`;
    };
    return [line(x, y, x + w, y), line(x + w, y, x + w, y + h), line(x + w, y + h, x, y + h), line(x, y + h, x, y)].join(' ');
  }

  function init(root) {
    const stage = root.querySelector('.wp-stage');
    const cap = root.querySelector('.wp-cap');
    const controls = root.querySelector('.wp-controls');
    let sel = -1, part = null, seen = false;

    const cards = PASSES.map((p, i) => {
      const el = document.createElement('div');
      el.className = 'wp-card';
      el.tabIndex = 0;
      el.setAttribute('role', 'button');
      el.setAttribute('aria-label', `Open the ${p.name}`);
      el.style.zIndex = i + 1;
      el.innerHTML = passHTML(p);
      stage.appendChild(el);
      return el;
    });

    controls.innerHTML = PARTS.map((k) => `<button type="button" class="wp-btn" data-k="${k}" aria-pressed="false" style="--c:${COLORS[k]}">${k}</button>`).join('')
      + '<span class="wp-break"></span><button type="button" class="wp-btn wp-close">← All passes</button>';

    const metrics = () => {
      const c = cards[0];
      const W = c.offsetWidth, H = c.offsetHeight;
      const top = c.querySelector('.wp-top');
      const strip = Math.round(top.offsetTop + top.offsetHeight + W * .035);
      return { W, H, strip };
    };

    function layout() {
      const { H, strip } = metrics();
      const n = cards.length;
      if (sel < 0) {
        cards.forEach((c, i) => { c.style.setProperty('--y', `${i * strip}px`); c.style.zIndex = i + 1; });
        stage.style.height = `${(n - 1) * strip + H}px`;
      } else {
        let j = 0;
        cards.forEach((c, i) => {
          if (i === sel) { c.style.setProperty('--y', '0px'); c.style.zIndex = n + 1; return; }
          c.style.setProperty('--y', `${H + 18 + j * 8}px`); c.style.zIndex = j + 1; j++;
        });
        stage.style.height = `${H + 18 + (n - 2) * 8 + 26}px`;
      }
    }

    function clearInk() {
      root.querySelectorAll('.wp-ink').forEach((s) => (s.innerHTML = ''));
      root.querySelectorAll('.wp-chip, .wp-note').forEach((e) => e.remove());
    }

    function draw(card, k) {
      const face = card.querySelector(k === 'back' ? '.wp-back' : '.wp-front');
      const svg = face.querySelector('.wp-ink');
      const target = k === 'back' ? face : face.querySelector(`[data-part="${k}"]`);
      const W = face.offsetWidth, H = face.offsetHeight;
      const pad = W * .018;
      let x, y, w, h;
      if (k === 'back') { x = W * .035; y = W * .035; w = W - 2 * x; h = H - 2 * y; }
      else { x = target.offsetLeft - pad; y = target.offsetTop - pad; w = target.offsetWidth + 2 * pad; h = target.offsetHeight + 2 * pad; }
      if (k === 'primary' || k === 'secondary' || k === 'auxiliary') { x = W * .035; w = W - 2 * x; }
      const inset = W * .025;
      if (x < inset) { w -= inset - x; x = inset; }
      if (x + w > W - inset) w = W - inset - x;
      if (y < inset) { h -= inset - y; y = inset; }
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      const color = COLORS[k];
      let paths = `<path d="${roughRect(x, y, w, h, PARTS.indexOf(k) * 7 + 3)}" stroke="${color}"/>`;
      if (k === 'logo' || k === 'header') {
        const { strip } = metrics();
        paths += `<path d="M${-W * .02},${strip} L${W * 1.02},${strip}" stroke="#8DB8FF" stroke-dasharray="6 5" stroke-width="1.6"/>`;
        const note = document.createElement('div');
        note.className = 'wp-note';
        note.style.top = `${strip + 5}px`;
        note.textContent = '↑ visible when collapsed';
        face.appendChild(note);
        requestAnimationFrame(() => note.classList.add('is-on'));
      }
      svg.innerHTML = paths;
      const main = svg.querySelector('path');
      if (!reduced()) {
        const len = main.getTotalLength();
        main.style.strokeDasharray = len;
        main.style.strokeDashoffset = len;
        main.getBoundingClientRect();
        main.style.transition = 'stroke-dashoffset .55s ease-out';
        main.style.strokeDashoffset = 0;
      }
      const chip = document.createElement('div');
      chip.className = 'wp-chip';
      chip.style.background = color;
      chip.textContent = LABELS[k].toUpperCase();
      face.appendChild(chip);
      const cw = chip.offsetWidth;
      chip.style.left = `${Math.max(4, Math.min(x + W * .03, W - cw - 4))}px`;
      chip.style.top = `${Math.max(chip.offsetHeight / 2 + 2, y)}px`;
      requestAnimationFrame(() => chip.classList.add('is-on'));
    }

    function choose(k) {
      if (sel < 0) return;
      const card = cards[sel];
      part = part === k ? null : k;
      clearInk();
      controls.querySelectorAll('.wp-btn[data-k]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.k === part)));
      const flip = part === 'back';
      const wasFlipped = card.classList.contains('is-flipped');
      card.classList.toggle('is-flipped', flip);
      cap.textContent = part ? CAPTIONS[part](PASSES[sel]) : CAPTIONS.open;
      if (part) setTimeout(() => part === k && sel >= 0 && draw(card, k), flip !== wasFlipped && !reduced() ? 450 : 0);
    }

    function open(i) {
      seen = true;
      cards.forEach((c) => c.classList.add('is-in'));
      sel = i; part = null;
      clearInk();
      root.classList.add('is-open');
      cards.forEach((c, j) => {
        c.classList.toggle('is-sel', j === i);
        c.setAttribute('aria-label', j === i ? PASSES[j].name : 'Back to all passes');
      });
      controls.hidden = false;
      controls.querySelectorAll('.wp-btn[data-k]').forEach((b) => b.setAttribute('aria-pressed', 'false'));
      cap.textContent = CAPTIONS.open;
      layout();
    }

    function close() {
      const prev = sel;
      sel = -1; part = null;
      clearInk();
      root.classList.remove('is-open');
      cards.forEach((c, j) => {
        c.classList.remove('is-sel', 'is-flipped');
        c.setAttribute('aria-label', `Open the ${PASSES[j].name}`);
      });
      controls.hidden = true;
      cap.textContent = CAPTIONS.stack;
      layout();
      if (prev >= 0) cards[prev].focus({ preventScroll: true });
    }

    cards.forEach((c, i) => {
      c.addEventListener('click', (e) => {
        if (sel < 0) return open(i);
        if (i !== sel) return close();
        const hit = e.target.closest('[data-part]');
        if (hit) choose(hit.dataset.part);
      });
      c.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        if (sel < 0) open(i); else if (i !== sel) close();
      });
    });
    controls.addEventListener('click', (e) => {
      const b = e.target.closest('.wp-btn');
      if (!b) return;
      if (b.classList.contains('wp-close')) return close();
      choose(b.dataset.k);
    });
    root.addEventListener('keydown', (e) => { if (e.key === 'Escape' && sel >= 0) close(); });

    // entrance: cards drop into the stack when the widget scrolls into view
    function enter() {
      if (seen) return;
      seen = true;
      cards.forEach((c, i) => {
        const delay = reduced() ? 0 : 120 + i * 110;
        setTimeout(() => c.classList.add('is-in'), delay);
      });
    }
    requestAnimationFrame(() => {
      layout();
      if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { enter(); io.disconnect(); } }, { threshold: .25 });
        io.observe(root);
      } else enter();
    });

    let raf;
    window.addEventListener('resize', () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => { layout(); if (sel >= 0 && part) { const k = part; clearInk(); draw(cards[sel], k); } });
    });
  }

  const start = () => document.querySelectorAll('[data-wallet-anatomy]').forEach(init);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
