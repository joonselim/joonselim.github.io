// Interactive widget for Wallet Notes: pass fields vs semantic tags.
// Reuses the pass styles from wallet-pass.css.
(() => {
  if (window.__walletNotes) return;
  window.__walletNotes = true;

  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const f = ([l, v], attrs = '') => `<span class="wp-f" ${attrs}><span class="wp-l">${esc(l)}</span><span class="wp-v">${esc(v)}</span></span>`;
  const $ = (root, s) => root.querySelector(s);
  const $$ = (root, s) => [...root.querySelectorAll(s)];

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

  const ICON = {
    plus: '<path d="M12 5v14M5 12h14"/>',
    bell: '<path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
    sync: '<path d="M19 12a7 7 0 0 1-12 5"/><path d="M5 12a7 7 0 0 1 12-5"/><path d="M17 3v4h-4M7 21v-4h4"/>',
    clock: '<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>',
    pin: '<path d="M12 21s-6-5.6-6-11a6 6 0 1 1 12 0c0 5.4-6 11-6 11z"/><circle cx="12" cy="10" r="2.2"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    nav: '<path d="M4 11l16-7-7 16-2-7z"/>',
    wallet: '<rect x="3" y="6" width="18" height="13" rx="2.5"/><path d="M3 10h18"/>',
  };
  const icon = (k) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[k]}</svg>`;

  const EVENT = {
    bg: 'linear-gradient(160deg,#7b2ff7 0%,#3a1290 45%,#16063a 100%)', mark: 'conic-gradient(#ff7ab6,#9db8ff,#7b2ff7,#ff7ab6)',
    logo: 'Nightshift', header: ['Date', 'NOV 21'], primary: ['Event', 'Aurora Live'],
    secondary: [['Venue', 'Pier 39 Hall'], ['Doors', '7:00 PM']], auxiliary: [['Section', 'B'], ['Row', '12'], ['Seat', '8']], seed: 11,
  };
  const PLANE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 13l8-1 5-8h2l-2 8 5-.5 2-2.5h1.5l-1 4 1 4H22l-2-2.5-5-.5 2 8h-2l-5-8-8-1z"/></svg>';

  // Front of a pass. o.mark/i marks fields so widgets can find them.
  function front(p, o = {}) {
    const fi = (x, id) => f(x, `data-f="${id}"`);
    const primary = p.route
      ? `<div class="wp-primary wp-route" data-f="primary">${f(p.route[0])}${PLANE}${f(p.route[1])}</div>`
      : `<div class="wp-primary" data-f="primary">${f(p.primary)}</div>`;
    return `<div class="wn-pass${o.cls ? ' ' + o.cls : ''}" style="--pass-bg:${p.bg};--mark:${p.mark}">
      <div class="wp-face wp-front">
        <div class="wp-top">
          <span class="wp-logo"><span class="wp-mark"></span>${esc(p.logo)}</span>
          <span class="wp-header">${fi(p.header, 'header')}</span>
        </div>
        ${o.extra || ''}
        ${primary}
        <div class="wp-row" data-f="secondary">${p.secondary.map((x, i) => fi(x, 's' + i)).join('')}</div>
        <div class="wp-row" data-f="auxiliary">${p.auxiliary.map((x, i) => fi(x, 'a' + i)).join('')}</div>
        ${o.code === false ? '' : `<div class="wp-code">${qr(p.seed)}</div>`}
      </div>
    </div>`;
  }

  // segmented control
  function seg(items, cls = '') {
    return `<div class="wn-seg ${cls}" role="group">${items.map(([k, label], i) =>
      `<button type="button" data-k="${k}" aria-pressed="${i === 0}">${label}</button>`).join('')}</div>`;
  }
  function press(group, k) {
    $$(group, 'button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.k === k)));
  }

  // place an element over a field inside a pass face (coordinates relative to .wp-front)
  function anchor(el, target, face, side = 'top') {
    let x = 0, y = 0, n = target;
    while (n && n !== face) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
    el.style.left = `${Math.max(2, Math.min(x, face.offsetWidth - el.offsetWidth - 2))}px`;
    el.style.top = side === 'top' ? `${y - el.offsetHeight - 2}px` : `${y + target.offsetHeight + 2}px`;
  }

  /* ---------- 1. Fields vs semantic tags ---------- */
  const FIELD_KEYS = [
    ['header', 'headerFields', '#9EE7FF'], ['primary', 'primaryFields', '#B6E388'],
    ['secondary', 'secondaryFields', '#FFB0D6'], ['auxiliary', 'auxiliaryFields', '#EEF0F5'],
  ];
  const TAGS = {
    eventStartDate: { field: 'header', color: '#9B7BFF', value: '"2026-11-21T19:00-08:00"', icon: 'clock',
      cap: 'Wallet knows the event starts at 7:00 PM on Nov 21, so it can bring the pass to the Lock Screen right before doors open.' },
    venueLocation: { field: 's0', color: '#5B9BFF', value: '{ "latitude": 37.81, "longitude": -122.41 }', icon: 'pin',
      cap: 'Wallet knows where the venue is, so it can offer directions with one tap.' },
  };

  function initTags(root) {
    root.innerHTML = `
      ${seg([['fields', 'Pass fields'], ['tags', 'Semantic tags']], 'wn-seg-main')}
      <div class="wn-split">
        <div class="wn-passbox">${front(EVENT)}</div>
        <div class="wn-side">
          <pre class="wn-code" aria-label="pass.json"></pre>
          <div class="wn-out" aria-live="polite"></div>
        </div>
      </div>
      <p class="wp-cap" aria-live="polite"></p>`;
    const face = $(root, '.wp-front');
    const code = $(root, '.wn-code');
    const out = $(root, '.wn-out');
    const cap = $(root, '.wp-cap');
    let mode = 'fields', tag = null;

    function chips() {
      $$(face, '.wn-chip').forEach((c) => c.remove());
      if (mode === 'fields') {
        FIELD_KEYS.forEach(([k, name, color]) => {
          const c = document.createElement('span');
          c.className = 'wn-chip'; c.textContent = name; c.style.setProperty('--c', color);
          face.appendChild(c);
          anchor(c, $(face, `[data-f="${k}"]`), face, 'top');
          c.style.left = `${face.offsetWidth - c.offsetWidth - face.offsetWidth * .04}px`;
        });
        $$(face, '[data-f]').forEach((e) => e.classList.remove('wn-dim', 'wn-lit'));
      } else {
        Object.entries(TAGS).forEach(([name, t]) => {
          const c = document.createElement('button');
          c.type = 'button';
          c.className = 'wn-chip wn-tagchip'; c.dataset.tag = name;
          c.innerHTML = `${icon(t.icon)}${name}`; c.style.setProperty('--c', t.color);
          c.setAttribute('aria-pressed', String(tag === name));
          face.appendChild(c);
          const tgt = $(face, `[data-f="${t.field}"]`);
          anchor(c, tgt, face, 'bottom');
          if (t.field === 'header') c.style.left = `${face.offsetWidth - c.offsetWidth - face.offsetWidth * .04}px`;
        });
        $$(face, '[data-f]').forEach((e) => {
          const on = Object.values(TAGS).some((t) => t.field === e.dataset.f);
          e.classList.toggle('wn-lit', on && !['secondary', 'auxiliary'].includes(e.dataset.f));
        });
      }
    }

    function renderCode() {
      if (mode === 'fields') {
        code.innerHTML = FIELD_KEYS.map(([k, name, color]) => {
          const v = k === 'header' ? EVENT.header : k === 'primary' ? EVENT.primary : EVENT[k][0];
          return `<span style="color:${color}">"${name}"</span>: [{ "label": "${esc(v[0])}", "value": "${esc(v[1])}" }${k === 'secondary' || k === 'auxiliary' ? ', …' : ''}]`;
        }).join(',\n');
      } else {
        code.innerHTML = `<span class="wn-k">"semantics"</span>: {\n` + Object.entries(TAGS).map(([name, t]) =>
          `  <button type="button" class="wn-line" data-tag="${name}" aria-pressed="${tag === name}" style="--c:${t.color}">"${name}"</button>: ${esc(t.value)}`).join(',\n')
          + `,\n  <span class="wn-k">"eventName"</span>: "Aurora Live"\n}`;
      }
    }

    function renderOut() {
      out.className = 'wn-out';
      if (mode === 'fields') { out.innerHTML = ''; return; }
      if (!tag) { out.innerHTML = '<div class="wn-hint">Tap a tag to see what Wallet does with it.</div>'; return; }
      if (tag === 'eventStartDate') {
        out.innerHTML = `<div class="wn-lock"><div class="wn-lock-time">6:42</div><div class="wn-lock-date">Saturday, November 21</div>
          <div class="wn-note-card"><span class="wn-app" style="background:${EVENT.mark}"></span><div><b>Aurora Live</b><span>Doors open at 7:00 PM · Pier 39 Hall</span></div><em>now</em></div>
          <div class="wn-out-label">${icon('bell')}Lock Screen</div></div>`;
      } else {
        out.innerHTML = `<div class="wn-map"><div class="wn-map-grid"></div><span class="wn-map-pin">${icon('pin')}</span>
          <div class="wn-map-card"><div><b>Pier 39 Hall</b><span>San Francisco</span></div><span class="wn-dir">${icon('nav')}Directions</span></div></div>`;
      }
      requestAnimationFrame(() => out.classList.add('is-on'));
    }

    function setMode(m) {
      mode = m; tag = null;
      press($(root, '.wn-seg-main'), m);
      root.dataset.mode = m;
      renderCode(); chips(); renderOut();
      cap.textContent = m === 'fields'
        ? 'Pass fields decide what shows on the pass, and where. Each group has its own place on the front.'
        : 'Semantic tags say what the information means. Tap one to see what it unlocks.';
    }
    function setTag(t) {
      tag = tag === t ? null : t;
      $$(root, '[data-tag]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.tag === tag)));
      renderOut();
      cap.textContent = tag ? TAGS[tag].cap : 'Semantic tags say what the information means. Tap one to see what it unlocks.';
    }

    root.addEventListener('click', (e) => {
      const s = e.target.closest('.wn-seg-main button');
      if (s) return setMode(s.dataset.k);
      const t = e.target.closest('[data-tag]');
      if (t) setTag(t.dataset.tag);
    });
    let raf;
    window.addEventListener('resize', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(chips); });
    requestAnimationFrame(() => setMode('fields'));
  }

  const start = () => {
    document.querySelectorAll('[data-wallet-tags]').forEach(initTags);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
