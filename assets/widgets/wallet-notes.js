// Interactive widgets for Wallet Notes: fields vs semantic tags, the pass lifecycle, and design rules.
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
  const BOARDING = {
    bg: 'linear-gradient(150deg,#2a6be0 0%,#123a8a 55%,#0b2a66 100%)', mark: 'conic-gradient(#9EE7FF,#2a6be0,#ffffff,#9EE7FF)',
    logo: 'Skyline Air', header: ['Gate', 'B12'], route: [['San Francisco', 'SFO'], ['New York', 'JFK']],
    secondary: [['Passenger', 'Alex Kim'], ['Flight', 'SK 214']], auxiliary: [['Boards', '7:40'], ['Seat', '14A']], seed: 3,
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

  /* ---------- 2. Lifecycle ---------- */
  const STEPS = [
    { k: 'add', label: 'Add', color: '#5B9BFF', icon: 'plus' },
    { k: 'relevant', label: 'Relevant', color: '#3DDC97', icon: 'bell' },
    { k: 'update', label: 'Update', color: '#9B7BFF', icon: 'sync' },
    { k: 'expire', label: 'Expire', color: '#FF4D6D', icon: 'clock' },
  ];

  function initLifecycle(root) {
    root.innerHTML = `
      <div class="wn-steps" role="group" aria-label="Lifecycle steps">${STEPS.map((s, i) =>
        `<button type="button" data-i="${i}" aria-pressed="${i === 0}" style="--c:${s.color}"><span class="wn-pin">${icon(s.icon)}</span><span>${i + 1}. ${s.label}</span></button>`).join('')}</div>
      <div class="wn-screen"></div>
      <div class="wn-actions"></div>
      <p class="wp-cap" aria-live="polite"></p>`;
    const screen = $(root, '.wn-screen');
    const actions = $(root, '.wn-actions');
    const cap = $(root, '.wp-cap');
    let step = 0;

    const btn = (k, label, cls = '') => `<button type="button" class="wn-act ${cls}" data-a="${k}">${label}</button>`;
    const say = (t) => { cap.textContent = t; };
    const banner = (html, cls = '') => {
      $$(screen, '.wn-banner').forEach((b) => b.remove());
      const b = document.createElement('div');
      b.className = `wn-banner ${cls}`; b.innerHTML = html;
      screen.appendChild(b);
      requestAnimationFrame(() => requestAnimationFrame(() => b.classList.add('is-on')));
    };

    const VIEWS = {
      add() {
        screen.innerHTML = `<div class="wn-app-screen">
          <div class="wn-app-head"><span class="wn-app" style="background:${BOARDING.mark}"></span>Skyline Air</div>
          <h4>You're booked</h4><p class="wn-sub">SFO → JFK · 2 connections</p>
          <div class="wn-group">${[['SFO', 'DEN'], ['DEN', 'ORD'], ['ORD', 'JFK']].map(([a, b], i) =>
            `<div class="wn-mini" style="--i:${i}"><span>${a}</span>${PLANE}<span>${b}</span></div>`).join('')}</div>
          <button type="button" class="wn-addbtn" data-a="add">${icon('wallet')}Add to Apple Wallet</button>
          <button type="button" class="wn-link" data-a="decline">Not now</button>
        </div>`;
        actions.innerHTML = btn('reset', 'Start over', 'wn-ghost');
        say('When a purchase creates a pass, people can add it with one tap. Try the button.');
      },
      relevant() {
        screen.innerHTML = `<div class="wn-lockscreen">
          <div class="wn-lock-time">6:30</div><div class="wn-lock-date">Monday, November 2</div>
          <div class="wn-where">${icon('pin')}<span>Home</span></div>
        </div>`;
        actions.innerHTML = seg([['home', 'At home, 6:30'], ['gym', 'At the gym, 6:58']], 'wn-seg-where');
        say('A pass knows when and where it matters. Move to the gym and watch the Lock Screen.');
      },
      update() {
        screen.innerHTML = `<div class="wn-passwrap">${front(BOARDING, { code: false, cls: 'wn-pass-sm' })}</div>`;
        actions.innerHTML = btn('gate', 'Change the gate') + btn('promo', 'Send a promo') + btn('reset', 'Reset', 'wn-ghost');
        say('A pass gets updated when details change. Try a gate change, then a promo.');
      },
      expire() {
        screen.innerHTML = `<div class="wn-passwrap">${front(EVENT, { code: false, cls: 'wn-pass-sm' })}<div class="wn-stamp">Expired</div></div>`;
        actions.innerHTML = btn('expire', 'Jump to Nov 22') + btn('remove', 'Remove pass') + btn('reset', 'Reset', 'wn-ghost');
        say('Every pass ends at some point. Jump past the event date.');
      },
    };

    function go(i) {
      step = i;
      $$(root, '.wn-steps button').forEach((b, j) => {
        b.setAttribute('aria-pressed', String(j === i));
        b.classList.toggle('is-done', j < i);
      });
      root.style.setProperty('--step', i);
      screen.className = `wn-screen wn-${STEPS[i].k}`;
      VIEWS[STEPS[i].k]();
    }

    function act(a) {
      const k = STEPS[step].k;
      if (a === 'reset') return go(step);
      if (k === 'add' && a === 'add') {
        screen.classList.add('is-added');
        $(screen, '.wn-addbtn').disabled = true;
        banner(`${icon('check')}<div><b>Added 3 passes</b><span>Your connecting flights are in Wallet</span></div>`);
        say('Related passes, like connecting flights, are added together as a group, with a single tap.');
      } else if (k === 'add' && a === 'decline') {
        screen.classList.add('is-declined');
        banner(`${icon('x')}<div><b>Declined</b><span>The app won't ask again</span></div>`, 'wn-bad');
        say("If someone declines, the app shouldn't keep asking.");
      } else if (k === 'update' && a === 'gate') {
        const v = $(screen, '[data-f="header"] .wp-v');
        v.innerHTML = '<s>B12</s> C4';
        v.parentElement.classList.add('wn-changed');
        banner(`<span class="wn-app" style="background:${BOARDING.mark}"></span><div><b>Skyline Air</b><span>Gate changed to C4</span></div>`);
        say('The gate change shows up on the pass right away, with a change message. This is what change messages are for: time-critical info.');
      } else if (k === 'update' && a === 'promo') {
        banner(`<span class="wn-app" style="background:${BOARDING.mark}"></span><div><b>Skyline Air</b><span>20% off in-flight Wi-Fi!</span></div>${icon('x')}`, 'wn-bad wn-blocked');
        say("Change messages are never for marketing. A promo like this doesn't belong in a pass update.");
      } else if (k === 'expire' && a === 'expire') {
        screen.classList.add('is-expired');
        say('With the right expiration date, Wallet marks the pass as expired and hides it on its own.');
      } else if (k === 'expire' && a === 'remove') {
        $$(screen, '.wn-dialog').forEach((d) => d.remove());
        const d = document.createElement('div');
        d.className = 'wn-dialog';
        d.innerHTML = '<b>Remove this pass?</b><span>Aurora Live, Nov 21</span><div><button type="button" data-a="keep">Keep</button><button type="button" data-a="confirm">Remove</button></div>';
        screen.appendChild(d);
        requestAnimationFrame(() => d.classList.add('is-on'));
        say('A pass is never deleted without asking first.');
      } else if (a === 'keep') {
        $$(screen, '.wn-dialog').forEach((d) => d.remove());
        say('Kept. Nothing is removed unless people confirm it.');
      } else if (a === 'confirm') {
        $$(screen, '.wn-dialog').forEach((d) => d.remove());
        screen.classList.add('is-removed');
        say('Removed, but only after people said yes.');
      }
    }

    root.addEventListener('click', (e) => {
      const s = e.target.closest('.wn-steps button');
      if (s) return go(+s.dataset.i);
      const w = e.target.closest('.wn-seg-where button');
      if (w) {
        press(w.parentElement, w.dataset.k);
        const gym = w.dataset.k === 'gym';
        $(screen, '.wn-lock-time').textContent = gym ? '6:58' : '6:30';
        $(screen, '.wn-where span').textContent = gym ? 'Iron Gym' : 'Home';
        if (gym) {
          banner(`<span class="wn-app" style="background:conic-gradient(#7be0b5,#1aa085,#d6ffe9,#7be0b5)"></span><div><b>Iron Gym</b><span>Member pass · tap to show</span></div>`);
          say('Right as people walk into the gym, the member pass appears on the Lock Screen.');
        } else {
          $$(screen, '.wn-banner').forEach((b) => b.remove());
          say('At home, the gym pass stays out of the way.');
        }
        return;
      }
      const a = e.target.closest('[data-a]');
      if (a) act(a.dataset.a);
    });
    go(0);
  }

  /* ---------- 3. Design rules ---------- */
  const lum = (hex) => {
    const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4));
    return .2126 * c[0] + .7152 * c[1] + .0722 * c[2];
  };
  const mix = (a, b, t) => '#' + [1, 3, 5].map((i) => Math.round(parseInt(a.slice(i, i + 2), 16) * (1 - t) + parseInt(b.slice(i, i + 2), 16) * t).toString(16).padStart(2, '0')).join('');
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + .05) / (y + .05); };
  const BRAND = '#6a2bd9';

  const RULES = [
    { k: 'clean', label: 'Clean', cap: { bad: 'Copying the plastic card crams every detail onto the front. It is hard to scan.', good: 'A clean front shows only what people need at a glance. Everything else can go on the back.' } },
    { k: 'contrast', label: 'Contrast', cap: {} },
    { k: 'image', label: 'No text in images', cap: { bad: 'Text baked into an image is invisible to VoiceOver, and the image may be cropped or hidden on some devices.', good: 'Put the words in a field instead. VoiceOver can read it, and it shows on every device.' } },
    { k: 'device', label: 'Every device', cap: { bad: '"Slide to view" makes sense on iPhone, but not on Apple Watch.', good: 'Neutral wording works everywhere a pass shows up.' } },
  ];

  function initRules(root) {
    root.innerHTML = `
      <div class="wn-tabs" role="group" aria-label="Design rules">${RULES.map((r, i) =>
        `<button type="button" data-i="${i}" aria-pressed="${i === 0}">${r.label}</button>`).join('')}</div>
      <div class="wn-rule"></div>
      <div class="wn-rule-ctl"></div>
      <p class="wp-cap" aria-live="polite"></p>`;
    const box = $(root, '.wn-rule');
    const ctl = $(root, '.wn-rule-ctl');
    const cap = $(root, '.wp-cap');
    let rule = 0, good = false;

    const badge = (ok) => `<span class="wn-badge ${ok ? 'is-ok' : 'is-bad'}">${icon(ok ? 'check' : 'x')}</span>`;
    const DENSE = 'TICKET · ADMIT ONE · NO REFUNDS · SEC B ROW 12 SEAT 8 · DOORS 7PM · AGES 18+ · PIER 39 HALL · SPONSORED BY · TERMS APPLY · NON-TRANSFERABLE · NO RE-ENTRY · LINEUP SUBJECT TO CHANGE · ';

    function view() {
      const r = RULES[rule];
      box.classList.toggle('wn-tall', r.k === 'clean');
      if (r.k === 'clean') {
        box.innerHTML = `<div class="wn-passwrap">${good
          ? front(EVENT, { cls: 'wn-pass-sm' })
          : `<div class="wn-pass wn-pass-sm wn-dense" style="--pass-bg:${EVENT.bg};--mark:${EVENT.mark}"><div class="wp-face wp-front"><p>${DENSE.repeat(5)}</p></div></div>`}${badge(good)}</div>`;
      } else if (r.k === 'contrast') {
        const t = +($(ctl, 'input')?.value ?? 15) / 100;
        const fg = mix('#7d4be0', '#ffffff', t);
        const cr = ratio(fg, BRAND);
        const ok = cr >= 4.5;
        box.innerHTML = `<div class="wn-passwrap"><div class="wn-pass wn-pass-sm" style="--pass-bg:${BRAND};--mark:${EVENT.mark};color:${fg}">
          <div class="wp-face wp-front wn-solid" style="color:${fg}">
            <div class="wp-top"><span class="wp-logo"><span class="wp-mark"></span>Nightshift</span><span class="wp-header">${f(EVENT.header)}</span></div>
            <div class="wp-primary">${f(EVENT.primary)}</div>
            <div class="wp-row">${EVENT.secondary.map((x) => f(x)).join('')}</div>
          </div></div>${badge(ok)}</div>
          <div class="wn-ratio ${ok ? 'is-ok' : 'is-bad'}"><b>${cr.toFixed(1)}:1</b> ${ok ? 'readable' : 'too low'}</div>`;
        cap.textContent = ok
          ? 'Brand colors are encouraged, as long as the text keeps enough contrast. 4.5:1 or more reads well.'
          : 'Drag the slider. The brand color can stay, but the text needs more contrast to be readable.';
        return;
      } else if (r.k === 'image') {
        box.innerHTML = `<div class="wn-passwrap"><div class="wn-pass wn-pass-sm" style="--pass-bg:linear-gradient(165deg,#ff7ab6,#c04bd8 60%,#5b23b8)">
          <div class="wp-face wp-front">
            <div class="wp-top"><span class="wp-logo"><span class="wp-mark" style="--mark:conic-gradient(#ffd3a8,#ff6fae,#fff,#ffd3a8)"></span>Bean There</span><span class="wp-header">${f(['Expires', 'Dec 31'])}</span></div>
            <div class="wn-strip-img">${good ? '' : '<span>SALE!<small>20% OFF</small></span>'}</div>
            ${good ? `<div class="wp-primary">${f(['Offer', '20% off'])}</div>` : ''}
          </div></div>${badge(good)}</div>
          <div class="wn-vo">${icon('bell')}<span>VoiceOver reads: <b>${good ? '"Offer, 20% off"' : '"Image"'}</b></span></div>`;
      } else {
        const text = good ? 'Show this pass at the door' : 'Slide to view';
        box.innerHTML = `<div class="wn-devices">
          <div class="wn-dev wn-phone"><div class="wn-dev-screen"><span>${text}</span>${good ? '' : '<i class="wn-slide"></i>'}</div>${badge(true)}<em>iPhone</em></div>
          <div class="wn-dev wn-watch"><div class="wn-dev-screen"><span>${text}</span></div>${badge(good)}<em>Apple Watch</em></div>
        </div>`;
      }
      cap.textContent = r.cap[good ? 'good' : 'bad'];
    }

    function pick(i) {
      rule = i; good = false;
      $$(root, '.wn-tabs button').forEach((b, j) => b.setAttribute('aria-pressed', String(j === i)));
      root.dataset.rule = RULES[i].k;
      ctl.innerHTML = RULES[i].k === 'contrast'
        ? '<label class="wn-slider"><span>Text color</span><input type="range" min="0" max="100" value="15" aria-label="Text lightness"></label>'
        : seg([['bad', `${icon('x')} Don't`], ['good', `${icon('check')} Do`]], 'wn-seg-rule');
      view();
    }

    root.addEventListener('click', (e) => {
      const t = e.target.closest('.wn-tabs button');
      if (t) return pick(+t.dataset.i);
      const s = e.target.closest('.wn-seg-rule button');
      if (s) { good = s.dataset.k === 'good'; press(s.parentElement, s.dataset.k); view(); }
    });
    root.addEventListener('input', (e) => { if (e.target.matches('.wn-slider input')) view(); });
    pick(0);
  }

  const start = () => {
    document.querySelectorAll('[data-wallet-tags]').forEach(initTags);
    document.querySelectorAll('[data-wallet-lifecycle]').forEach(initLifecycle);
    document.querySelectorAll('[data-wallet-rules]').forEach(initRules);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
