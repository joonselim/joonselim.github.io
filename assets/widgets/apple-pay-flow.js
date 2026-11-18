// Apple Pay on the web, as a step-through sequence diagram.
//   data-apf  Normal / Outage toggle, Back / Next / Play
(() => {
  if (window.__applePayFlow) return;
  window.__applePayFlow = true;

  const NS = 'http://www.w3.org/2000/svg';
  const W = 560, H = 430, TOP = 76, ROW = 30;
  const X = [105, 240, 375, 500];
  const LANES = ['Browser', 'Shop server', 'Apple', 'Processor'];
  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const BASE = [
    { phase: 'Check', from: 0, to: 0, label: 'canMakePayments()',
      cap: 'The page checks if Apple Pay is available on this device. If yes, it shows the button.' },
    { phase: 'Create', from: 0, to: 0, label: 'new ApplePaySession()',
      cap: 'The user taps the button. Only now can the page create a session. <code>begin()</code> opens the sheet.' },
    { phase: 'Validate', from: 0, to: 1, label: 'validation request',
      cap: '<code>onvalidatemerchant</code> fires. The page asks its own server for a merchant session.' },
  ];
  const FLOWS = {
    normal: BASE.concat([
      { phase: 'Validate', from: 1, to: 2, label: 'POST /paymentSession',
        cap: 'The shop\'s server calls Apple over mutual TLS, with its merchant identity certificate.' },
      { phase: 'Validate', from: 2, to: 1, label: 'merchant session',
        cap: 'Apple returns an opaque session. It can be used once, and it expires after 5 minutes.' },
      { phase: 'Validate', from: 1, to: 0, label: 'merchant session',
        cap: 'The page passes it to <code>completeMerchantValidation()</code>. Now the user can pay.' },
      { phase: 'Authorize', from: 0, to: 0, label: 'Face ID → token',
        cap: 'The user approves with Face ID. <code>onpaymentauthorized</code> gets the encrypted token.' },
      { phase: 'Authorize', from: 0, to: 1, label: 'token',
        cap: 'The page sends the token to its own server.' },
      { phase: 'Authorize', from: 1, to: 3, label: 'token',
        cap: 'The server sends it to the payment processor. Apple\'s servers are not called here.' },
      { phase: 'Authorize', from: 3, to: 1, label: 'approved',
        cap: 'The processor approves the payment.' },
      { phase: 'Authorize', from: 1, to: 0, label: 'approved',
        cap: 'The server tells the page.' },
      { phase: 'Authorize', from: 0, to: 0, label: 'completePayment()', end: 'ok',
        cap: '<code>completePayment(STATUS_SUCCESS)</code> closes the sheet. This has to happen within 30 seconds, or the sheet says the payment couldn\'t be completed.' },
    ]),
    outage: BASE.concat([
      { phase: 'Validate', from: 1, to: 2, label: 'POST /paymentSession', bad: true,
        cap: 'The call to Apple stalls. This is where I guess the outage hit.' },
      { phase: 'Validate', from: 2, to: 1, label: 'no answer…', bad: true, wait: true, end: 'bad',
        cap: 'No session comes back. The sheet keeps spinning, the user never gets to Face ID, and it times out.' },
    ]),
  };

  const el = (tag, attrs, parent) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };

  function init(root) {
    const S = { mode: 'normal', cur: 0, timer: null };
    root.innerHTML = `
      <div class="apf-controls">
        <div class="apf-seg" role="group" aria-label="Flow"><button data-m="normal" class="on">Normal</button><button data-m="outage">Outage</button></div>
        <span class="apf-count"></span>
      </div>
      <div class="apf-diagram"></div>
      <p class="apf-cap" aria-live="polite"></p>
      <div class="apf-controls" style="margin:10px 0 0">
        <button class="apf-btn ghost" data-a="back">Back</button>
        <button class="apf-btn" data-a="next">Next</button>
        <button class="apf-btn ghost" data-a="play">Play</button>
        <button class="apf-btn ghost" data-a="reset">Reset</button>
      </div>`;
    const $ = (s) => root.querySelector(s);
    const flow = () => FLOWS[S.mode];

    const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Apple Pay on the web sequence diagram' });
    $('.apf-diagram').appendChild(svg);
    LANES.forEach((name, i) => {
      el('rect', { class: 'lane-box', x: X[i] - 55, y: 12, width: 110, height: 32, rx: 8 }, svg);
      el('text', { class: 'lane-name', x: X[i], y: 33 }, svg).textContent = name;
      el('line', { class: 'life', x1: X[i], y1: 46, x2: X[i], y2: H - 8 }, svg);
    });
    const rows = el('g', {}, svg);

    function drawRow(s, i, isNew) {
      const y = TOP + i * ROW;
      const prev = flow()[i - 1];
      if (!prev || prev.phase !== s.phase) {
        const pg = el('g', {}, rows);
        if (i) el('line', { class: 'phase-line', x1: 6, y1: y - 16, x2: W - 6, y2: y - 16 }, pg);
        el('text', { class: 'phase', x: 6, y: y + 4 }, pg).textContent = s.phase.toUpperCase();
      }
      const g = el('g', { class: 'msg' + (s.bad ? ' bad' : '') + (s.wait ? ' wait' : '') }, rows);
      let len;
      if (s.from === s.to) {
        const x = X[s.from];
        el('path', { d: `M${x} ${y - 7} h28 v14 h-24` }, g);
        el('path', { class: 'head', d: `M${x} ${y + 7} l7 -4 v8 z` }, g);
        const t = el('text', { x: x + 36, y: y + 4 }, g);
        t.textContent = s.label;
        len = 70;
      } else {
        const x1 = X[s.from], x2 = X[s.to], dir = Math.sign(x2 - x1);
        el('line', { x1, y1: y + 2, x2: x2 - dir * 7, y2: y + 2 }, g);
        el('path', { class: 'head', d: `M${x2} ${y + 2} l${-dir * 8} -4.5 v9 z` }, g);
        const t = el('text', { x: (x1 + x2) / 2, y: y - (s.bad && !s.wait ? 9 : 5), 'text-anchor': 'middle' }, g);
        t.textContent = s.label;
        if (s.bad && !s.wait) {
          const mx = (x1 + x2) / 2 + 40;
          el('path', { class: 'x', d: `M${mx - 5} ${y - 3} l10 10 M${mx + 5} ${y - 3} l-10 10` }, g);
        }
        len = Math.abs(x2 - x1);
      }
      g.style.setProperty('--len', len);
      if (isNew) {
        g.classList.add('cur');
        if (!reduced()) g.classList.add('draw');
      }
    }

    function render(animateLast) {
      rows.innerHTML = '';
      const f = flow();
      for (let i = 0; i < S.cur; i++) drawRow(f[i], i, i === S.cur - 1 && animateLast !== false);
      if (S.cur && animateLast === false) rows.querySelector('.msg:last-of-type').classList.add('cur');
      const cap = $('.apf-cap');
      if (!S.cur) {
        cap.className = 'apf-cap';
        cap.innerHTML = S.mode === 'normal'
          ? 'Press <b>Next</b> to walk through one Apple Pay payment on the web.'
          : 'The same flow, but Apple\'s Payment Session endpoint does not answer.';
      } else {
        const s = f[S.cur - 1];
        cap.className = 'apf-cap' + (s.bad ? ' bad' : '') + (s.end === 'ok' ? ' ok' : '');
        cap.innerHTML = `<span class="tag">${s.phase}</span>${s.cap}`;
      }
      $('.apf-count').textContent = `${S.cur} / ${f.length}`;
      $('[data-a="back"]').disabled = !S.cur;
      $('[data-a="next"]').disabled = S.cur >= f.length;
      $('[data-a="play"]').disabled = S.cur >= f.length && !S.timer;
      $('[data-a="play"]').textContent = S.timer ? 'Pause' : 'Play';
    }

    const stop = () => { clearInterval(S.timer); S.timer = null; };
    const next = () => {
      if (S.cur < flow().length) S.cur++;
      if (S.cur >= flow().length) stop();
      render();
    };

    root.querySelectorAll('[data-m]').forEach((b) => (b.onclick = () => {
      stop();
      S.mode = b.dataset.m; S.cur = 0;
      root.querySelectorAll('[data-m]').forEach((x) => x.classList.toggle('on', x === b));
      render();
    }));
    $('[data-a="next"]').onclick = () => { stop(); next(); };
    $('[data-a="back"]').onclick = () => { stop(); if (S.cur) S.cur--; render(false); };
    $('[data-a="reset"]').onclick = () => { stop(); S.cur = 0; render(); };
    $('[data-a="play"]').onclick = () => {
      if (S.timer) { stop(); render(false); return; }
      if (S.cur >= flow().length) S.cur = 0;
      S.timer = setInterval(next, reduced() ? 600 : 1100);
      next();
    };
    render();
  }

  function boot() {
    document.querySelectorAll('.apf[data-apf]').forEach((root) => {
      if (root.dataset.ready) return;
      root.dataset.ready = '1';
      init(root);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
