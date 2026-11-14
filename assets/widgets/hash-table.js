// Hash table widgets for Tech Notes 02.
//   data-ht="fn"    hash function: key -> number -> bucket
//   data-ht="table" hash table playground: insert / find / delete, chaining vs linear probing, resizing
//   data-ht="dist"  how evenly two hash functions spread many keys
(() => {
  if (window.__hashTableWidgets) return;
  window.__hashTableWidgets = true;

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sleep = (ms) => new Promise((r) => setTimeout(r, reduced() ? 0 : ms));
  const codes = (s) => [...s].map((c) => c.codePointAt(0));
  const sumHash = (s) => codes(s).reduce((a, c) => a + c, 0);
  const polyHash = (s) => codes(s).reduce((h, c) => (Math.imul(h, 31) + c) >>> 0, 0);
  // MurmurHash3's finalizer: mixes high bits into the low bits that % N keeps.
  const fmix = (h) => { h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b); h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35); h ^= h >>> 16; return h >>> 0; };
  const mixHash = (s) => fmix(polyHash(s));

  /* ---------- 1. hash function ---------- */
  function initFn(root) {
    const S = { fn: 'poly' };
    root.innerHTML = `
      <div class="ht-controls">
        <label class="ht-field"><span>Key</span><input type="text" class="ht-key" value="apple" maxlength="14" spellcheck="false" autocomplete="off"></label>
        <label class="ht-field"><span>Buckets</span><select class="ht-n"><option>8</option><option>10</option><option selected>16</option></select></label>
        <div class="ht-seg" role="group" aria-label="Hash function"><button data-fn="sum">Sum</button><button data-fn="poly" class="on">× 31</button></div>
      </div>
      <div class="ht-try">Try: ${['listen', 'silent', 'apple', 'lemon', 'melon'].map((k) => `<button data-k="${k}">${k}</button>`).join('')}</div>
      <div class="ht-chars"></div>
      <div class="ht-steps"></div>
      <div class="ht-strip"></div>
      <p class="ht-note" aria-live="polite"></p>`;
    const $ = (s) => root.querySelector(s);
    const key = $('.ht-key'), nSel = $('.ht-n');
    key.oninput = render;
    nSel.onchange = render;
    root.querySelectorAll('[data-fn]').forEach((b) => (b.onclick = () => {
      S.fn = b.dataset.fn;
      root.querySelectorAll('[data-fn]').forEach((x) => x.classList.toggle('on', x === b));
      render();
    }));
    root.querySelectorAll('[data-k]').forEach((b) => (b.onclick = () => { key.value = b.dataset.k; render(); }));

    function render() {
      const k = key.value, N = +nSel.value, H = S.fn === 'sum' ? sumHash : polyHash;
      const cs = codes(k);
      $('.ht-chars').innerHTML = [...k].map((ch, i) => `<div class="ht-char" style="animation-delay:${i * 40}ms"><b>${ch === ' ' ? '␣' : esc(ch)}</b><small>${cs[i]}</small></div>`).join('') || '<span class="ht-note" style="margin:0">Type a key.</span>';
      let h = 0;
      const rows = cs.map((c, i) => {
        const prev = h;
        h = S.fn === 'sum' ? h + c : (Math.imul(h, 31) + c) >>> 0;
        const expr = S.fn === 'sum' ? `${prev} + ${c}` : `${prev} × 31 + ${c}`;
        return `<div style="animation-delay:${i * 70}ms">h = ${expr} = <em>${h}</em></div>`;
      });
      const idx = h % N;
      rows.push(`<div class="fin" style="animation-delay:${cs.length * 70}ms">bucket = ${h} % ${N} = <em>${idx}</em></div>`);
      $('.ht-steps').innerHTML = `<div>h = 0</div>` + rows.join('');
      const a = H('listen') % N, b = H('silent') % N;
      const strip = $('.ht-strip');
      strip.style.gridTemplateColumns = `repeat(${N}, 1fr)`;
      strip.innerHTML = Array.from({ length: N }, (_, i) => `<span class="${i === idx && k ? 'on' : ''}">${i}</span>`).join('');
      $('.ht-note').innerHTML = S.fn === 'sum'
        ? `Sum just adds the codes, so order doesn't matter: <b>listen → ${a}</b> and <b>silent → ${b}</b>, the same bucket. The same goes for lemon and melon.`
        : `Multiplying by 31 at each step makes the order matter: <b>listen → ${a}</b>, <b>silent → ${b}</b>.${a === b ? ' (They happen to meet with this bucket count. Try another one.)' : ''}`;
    }
    render();
  }

  /* ---------- 2. hash table playground ---------- */
  const FRUITS = ['apple', 'banana', 'cherry', 'grape', 'kiwi', 'lemon', 'mango', 'melon', 'orange', 'peach', 'pear', 'plum', 'lime', 'fig', 'date', 'papaya', 'guava', 'olive', 'apricot', 'coconut', 'durian', 'lychee', 'quince', 'yuzu', 'berry', 'nectarine', 'tangerine', 'pomelo'];
  const TOMB = '\u0000tomb';
  const MAX_KEYS = 24, MAX_N = 32;

  function initTable(root) {
    const S = { mode: 'chain', N: 8, b: [], n: 0, busy: false };
    root.innerHTML = `
      <div class="ht-controls">
        <div class="ht-seg" role="group" aria-label="How to handle collisions"><button data-mode="chain" class="on">Chaining</button><button data-mode="probe">Linear probing</button></div>
      </div>
      <div class="ht-controls">
        <input type="text" class="ht-key" placeholder="key, e.g. kiwi" maxlength="12" spellcheck="false" autocomplete="off" aria-label="Key" style="width:150px">
        <button class="ht-btn" data-act="put">Insert</button>
        <button class="ht-btn ghost" data-act="get">Find</button>
        <button class="ht-btn ghost" data-act="del">Delete</button>
      </div>
      <div class="ht-controls">
        <button class="ht-btn ghost" data-act="rand">+ 3 random fruits</button>
        <button class="ht-btn ghost" data-act="reset">Reset</button>
      </div>
      <div class="ht-calc" aria-live="polite"></div>
      <div class="ht-grid"></div>
      <div class="ht-load"><div class="ht-load-top"><span>Load factor = keys / buckets</span><b class="ht-lf"></b></div><div class="ht-bar"><i></i><span class="ht-th" style="left:75%"></span></div></div>
      <ol class="ht-log" aria-live="polite"></ol>`;
    const $ = (s) => root.querySelector(s);
    const grid = $('.ht-grid'), input = $('.ht-key'), calc = $('.ht-calc'), logEl = $('.ht-log');
    const card = (i) => grid.querySelector(`.ht-b[data-i="${i}"]`);
    const chipOf = (k) => [...grid.querySelectorAll('.ht-chip')].find((c) => c.dataset.k === k);
    const keys = () => (S.mode === 'chain' ? S.b.flat() : S.b.filter((x) => x && x !== TOMB));
    const empty = (N) => (S.mode === 'chain' ? Array.from({ length: N }, () => []) : new Array(N).fill(null));

    function log(html, cls = '') {
      const li = document.createElement('li');
      li.className = cls; li.innerHTML = html;
      logEl.prepend(li);
      while (logEl.children.length > 5) logEl.lastChild.remove();
    }

    function render(pop = []) {
      grid.className = `ht-grid n${S.N}`;
      grid.innerHTML = S.b.map((slot, i) => {
        const items = S.mode === 'chain' ? slot : slot ? [slot] : [];
        const chips = items.map((k) => k === TOMB
          ? `<span class="ht-chip tomb" title="tombstone">✕</span>`
          : `<span class="ht-chip${pop.includes(k) ? ' pop' : ''}" data-k="${esc(k)}" style="animation-delay:${pop.length > 3 ? pop.indexOf(k) * 45 : 0}ms">${esc(k)}</span>`).join('');
        return `<div class="ht-b" data-i="${i}"><span class="ht-bi">${i}</span><div class="ht-slot">${chips}</div></div>`;
      }).join('');
      const lf = S.n / S.N;
      $('.ht-lf').textContent = `${S.n} / ${S.N} = ${lf.toFixed(2)}`;
      const bar = $('.ht-bar i');
      bar.style.width = `${Math.min(lf, 1) * 100}%`;
      bar.classList.toggle('over', lf > 0.75);
    }

    function clearMarks() {
      grid.querySelectorAll('.hit,.probe,.col').forEach((e) => e.classList.remove('hit', 'probe', 'col'));
      grid.querySelectorAll('.cmp,.found').forEach((e) => e.classList.remove('cmp', 'found'));
    }

    function showCalc(k) {
      const h = polyHash(k), i = h % S.N;
      calc.innerHTML = `hash("${esc(k)}") = ${h} → ${h} % ${S.N} = <em>${i}</em>`;
      return i;
    }

    // Walk the table the way a real lookup would, animating each comparison.
    // Returns { found, at, steps, firstFree }.
    async function walk(k, i) {
      let steps = 0;
      if (S.mode === 'chain') {
        card(i).classList.add('hit');
        await sleep(380);
        for (const x of S.b[i]) {
          steps++;
          const c = chipOf(x); c && c.classList.add('cmp');
          await sleep(320);
          if (x === k) { c && c.classList.replace('cmp', 'found'); return { found: true, at: i, steps }; }
          c && c.classList.remove('cmp');
        }
        return { found: false, at: i, steps };
      }
      let j = i, firstFree = -1;
      for (let t = 0; t < S.N; t++) {
        const slot = S.b[j], el = card(j);
        el.classList.add(t === 0 ? 'hit' : 'probe');
        await sleep(t === 0 ? 380 : 300);
        if (slot === null) { if (firstFree < 0) firstFree = j; break; }
        if (slot === TOMB) { if (firstFree < 0) firstFree = j; }
        else {
          steps++;
          const c = chipOf(slot); c && c.classList.add('cmp');
          await sleep(260);
          if (slot === k) { c && c.classList.replace('cmp', 'found'); return { found: true, at: j, steps }; }
          c && c.classList.remove('cmp');
        }
        j = (j + 1) % S.N;
      }
      return { found: false, at: firstFree, steps };
    }

    const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;

    async function put(k, quiet) {
      if (S.n >= MAX_KEYS) { log(`This demo stops at ${MAX_KEYS} keys. Press <b>Reset</b> to start again.`, 'warn'); return; }
      clearMarks();
      const i = showCalc(k);
      const r = await walk(k, i);
      if (r.found) { log(`<b>${esc(k)}</b> is already in bucket ${r.at}. A hash table keeps each key once, so it just updates the value.`); return; }
      let msg, cls = 'ok', at;
      if (S.mode === 'chain') {
        at = i;
        msg = S.b[i].length
          ? `<b>Collision.</b> Bucket ${i} already has ${S.b[i].map((x) => `<b>${esc(x)}</b>`).join(', ')}, so <b>${esc(k)}</b> joins the end of its list.`
          : `<b>${esc(k)}</b> goes into empty bucket ${i}.`;
        if (S.b[i].length) { card(i).classList.add('col'); cls = 'warn'; }
        S.b[i].push(k);
      } else {
        at = r.at;
        const moved = (at - i + S.N) % S.N;
        msg = moved
          ? `<b>Collision.</b> Bucket ${i} was taken, so <b>${esc(k)}</b> walked ${plural(moved, 'step')} to bucket ${at}.`
          : `<b>${esc(k)}</b> goes into bucket ${i}${S.b[i] === TOMB ? ', reusing a tombstone' : ''}.`;
        if (moved) cls = 'warn';
        S.b[at] = k;
      }
      S.n++;
      render([k]);
      card(at).classList.add(cls === 'warn' ? 'col' : 'hit');
      if (!quiet || cls === 'warn') log(msg, cls);
      if (S.n / S.N > 0.75 && S.N < MAX_N) { await sleep(700); await resize(); }
    }

    async function get(k) {
      clearMarks();
      const i = showCalc(k);
      const r = await walk(k, i);
      if (r.found) log(`Found <b>${esc(k)}</b> in bucket ${r.at} after ${plural(r.steps, 'comparison')}.`, 'ok');
      else log(`<b>${esc(k)}</b> is not here. ${S.mode === 'chain' ? `Checked all ${plural(r.steps, 'key')} in bucket ${i}.` : `Hit an empty bucket after ${plural(r.steps, 'comparison')}, so the search stops.`}`, 'warn');
    }

    async function del(k) {
      clearMarks();
      const i = showCalc(k);
      const r = await walk(k, i);
      if (!r.found) { log(`<b>${esc(k)}</b> is not here, so nothing to delete.`, 'warn'); return; }
      await sleep(250);
      if (S.mode === 'chain') {
        S.b[i].splice(S.b[i].indexOf(k), 1);
        log(`Removed <b>${esc(k)}</b> from bucket ${i}'s list.`);
      } else {
        S.b[r.at] = TOMB;
        log(`Removed <b>${esc(k)}</b> but left a <b>tombstone</b> (✕) in bucket ${r.at}. If the bucket were simply emptied, a search for a key that walked past it would stop too early.`);
      }
      S.n--;
      render();
    }

    async function resize() {
      const all = keys(), oldN = S.N;
      clearMarks();
      log(`Load factor passed 0.75, so the table <b>doubles to ${oldN * 2} buckets</b>. Every key is hashed again, because <code>% ${oldN}</code> becomes <code>% ${oldN * 2}</code>.`, 'warn');
      calc.innerHTML = `resize: ${oldN} → <em>${oldN * 2}</em> buckets, rehash ${plural(all.length, 'key')}`;
      grid.classList.add('old');
      await sleep(600);
      S.N = oldN * 2; S.b = empty(S.N);
      for (const k of all) {
        const i = polyHash(k) % S.N;
        if (S.mode === 'chain') S.b[i].push(k);
        else { let j = i; while (S.b[j] !== null) j = (j + 1) % S.N; S.b[j] = k; }
      }
      render(all);
    }

    function reset(seed = ['apple', 'banana', 'cherry', 'grape']) {
      S.N = 8; S.n = 0; S.b = empty(8);
      for (const k of seed) {
        const i = polyHash(k) % S.N;
        if (S.mode === 'chain') S.b[i].push(k);
        else { let j = i; while (S.b[j] !== null) j = (j + 1) % S.N; S.b[j] = k; }
        S.n++;
      }
      calc.innerHTML = '';
      render();
    }

    async function run(fn) {
      if (S.busy) return;
      S.busy = true;
      root.querySelectorAll('button').forEach((b) => (b.disabled = true));
      try { await fn(); } finally {
        S.busy = false;
        root.querySelectorAll('button').forEach((b) => (b.disabled = false));
      }
    }

    function act(a) {
      const k = input.value.trim().toLowerCase();
      if (a === 'reset') { reset(); logEl.innerHTML = ''; log('Back to 8 buckets with 4 keys.'); return; }
      if (a === 'rand') {
        const have = new Set(keys());
        const pool = FRUITS.filter((f) => !have.has(f));
        const pick = [];
        while (pick.length < 3 && pool.length) pick.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
        if (!pick.length) { log('Out of fruits. Type your own keys.'); return; }
        run(async () => { for (const f of pick) { input.value = f; await put(f, true); await sleep(250); } input.value = ''; });
        return;
      }
      if (!k) { input.focus(); log('Type a key first.'); return; }
      run(() => (a === 'put' ? put(k) : a === 'get' ? get(k) : del(k)));
    }

    root.querySelectorAll('[data-act]').forEach((b) => (b.onclick = () => act(b.dataset.act)));
    input.onkeydown = (e) => { if (e.key === 'Enter') act('put'); };
    root.querySelectorAll('[data-mode]').forEach((b) => (b.onclick = () => {
      if (S.busy || S.mode === b.dataset.mode) return;
      S.mode = b.dataset.mode;
      root.querySelectorAll('[data-mode]').forEach((x) => x.classList.toggle('on', x === b));
      reset();
      logEl.innerHTML = '';
      log(S.mode === 'chain'
        ? '<b>Chaining:</b> each bucket holds a list. Colliding keys line up in the same bucket.'
        : '<b>Linear probing:</b> each bucket holds one key. On a collision, walk to the next bucket until one is free.');
    }));

    reset();
    log('Type a key and press <b>Insert</b>, or add random fruits. Watch for orange: that is a collision.');
  }

  /* ---------- 3. distribution ---------- */
  function rng(seed) {
    let s = seed >>> 0;
    return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296);
  }
  function perms(s) {
    if (s.length <= 1) return [s];
    const out = [];
    [...s].forEach((c, i) => perms(s.slice(0, i) + s.slice(i + 1)).forEach((p) => out.push(c + p)));
    return [...new Set(out)];
  }
  const KEYSETS = {
    users: { label: 'user1 … user300', make: () => Array.from({ length: 300 }, (_, i) => `user${i + 1}`) },
    words: { label: '300 random words', make: () => { const r = rng(7), a = 'abcdefghijklmnopqrstuvwxyz', set = new Set(); while (set.size < 300) { let w = ''; const n = 4 + Math.floor(r() * 5); for (let i = 0; i < n; i++) w += a[Math.floor(r() * 26)]; set.add(w); } return [...set]; } },
    anagrams: { label: '120 anagrams of "stone"', make: () => perms('stone') },
  };

  function initDist(root) {
    root.innerHTML = `
      <div class="ht-controls">
        <label class="ht-field"><span>Keys</span><select class="ht-set">${Object.entries(KEYSETS).map(([k, v]) => `<option value="${k}">${v.label}</option>`).join('')}</select></label>
        <label class="ht-field"><span>Buckets</span><select class="ht-n"><option>16</option><option>32</option><option selected>64</option><option value="61">61 (prime)</option></select></label>
      </div>
      <div class="ht-three"><div class="ht-panel" data-p="sum"></div><div class="ht-panel" data-p="poly"></div><div class="ht-panel" data-p="mix"></div></div>
      <p class="ht-note" aria-live="polite"></p>`;
    const $ = (s) => root.querySelector(s);
    $('.ht-set').onchange = render;
    $('.ht-n').onchange = render;

    function stats(ks, N, H) {
      const c = new Array(N).fill(0);
      ks.forEach((k) => c[H(k) % N]++);
      const checks = c.reduce((a, x) => a + (x * (x + 1)) / 2, 0) / ks.length;
      return { c, max: Math.max(...c), emptyN: c.filter((x) => !x).length, checks };
    }

    function panel(title, st, top, N, n) {
      const W = 320, Hh = 110, bw = W / N;
      const ideal = n / N;
      const bars = st.c.map((x, i) => `<rect x="${(i * bw + bw * 0.12).toFixed(2)}" y="${(Hh - (x / top) * Hh).toFixed(2)}" width="${(bw * 0.76).toFixed(2)}" height="${Math.max((x / top) * Hh, x ? 1 : 0).toFixed(2)}" rx="1" style="fill:${x > ideal * 3 ? 'var(--ht-orange)' : 'var(--ht-blue)'}"><title>bucket ${i}: ${x} keys</title></rect>`).join('');
      const iy = Hh - (ideal / top) * Hh;
      return `<h4>${title}</h4>
        <svg viewBox="0 0 ${W} ${Hh + 2}" role="img" aria-label="${title}: keys per bucket">
          <line x1="0" x2="${W}" y1="${Hh + 1}" y2="${Hh + 1}" style="stroke:var(--ht-line)"/>${bars}
          <line x1="0" x2="${W}" y1="${iy}" y2="${iy}" stroke-dasharray="4 3" style="stroke:var(--ht-dim)"/>
        </svg>
        <div class="ht-stats">
          <span>Biggest bucket</span><b class="${st.max > ideal * 3 ? 'bad' : ''}">${st.max} keys</b>
          <span>Empty buckets</span><b>${st.emptyN} / ${N}</b>
          <span>Avg. checks to find a key</span><b class="${st.checks > ideal * 2 + 1 ? 'bad' : ''}">${st.checks.toFixed(1)}</b>
        </div>`;
    }

    function render() {
      const set = $('.ht-set').value, N = +$('.ht-n').value, ks = KEYSETS[set].make();
      const a = stats(ks, N, sumHash), b = stats(ks, N, polyHash), c = stats(ks, N, mixHash);
      const top = Math.max(a.max, b.max, c.max, 1);
      $('[data-p="sum"]').innerHTML = panel('Sum', a, top, N, ks.length);
      $('[data-p="poly"]').innerHTML = panel('× 31', b, top, N, ks.length);
      $('[data-p="mix"]').innerHTML = panel('× 31 + mix', c, top, N, ks.length);
      const ideal = ks.length / N, pow2 = (N & (N - 1)) === 0;
      const notes = {
        users: `"user" is the same in every key, and the digits only add 48 to 57 each. So Sum lands in a narrow range and many buckets stay empty.`,
        words: `With random words, even Sum spreads out fairly well. Bad hashes hurt most when keys look alike, and real keys usually do.`,
        anagrams: `Every anagram has the same letters, so Sum puts <b>all ${ks.length} keys in one bucket</b>. Finding a key is now a slow list search.`,
      };
      const polyNote = b.max > ideal * 3
        ? (pow2 ? ` <b>× 31 struggles too.</b> <code>% ${N}</code> keeps only the last ${Math.log2(N)} bits, and similar keys barely differ there. Mixing the bits first fixes it, and so does a prime bucket count (try 61).` : ` × 31 still clusters a bit here.`)
        : (pow2 ? '' : ` With a prime bucket count, × 31 spreads well even without mixing.`);
      $('.ht-note').innerHTML = `${notes[set]}${polyNote} The dashed line is a perfect spread (${ideal.toFixed(1)} keys per bucket).`;
    }
    render();
  }

  const INIT = { fn: initFn, table: initTable, dist: initDist };
  const boot = () => document.querySelectorAll('[data-ht]').forEach((el) => INIT[el.dataset.ht] && INIT[el.dataset.ht](el));
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
