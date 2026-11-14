// SHA-1 step-by-step walkthrough. Every value on screen is computed live in the browser.
// Ported from the Wallet Notes 01 lesson.
(() => {
  if (window.__sha1Walk) return;
  window.__sha1Walk = true;

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const enc = (s) => new TextEncoder().encode(s);
  const rotl = (x, n) => ((x << n) | (x >>> (32 - n))) >>> 0;
  const hex8 = (x) => (x >>> 0).toString(16).padStart(8, '0');
  const b32 = (x) => (x >>> 0).toString(2).padStart(32, '0');
  const pop = (x) => { x >>>= 0; let c = 0; while (x) { x &= x - 1; c++; } return c; };
  const H0 = [0x67452301, 0xEFCDAB89, 0x98BADCFE, 0x10325476, 0xC3D2E1F0];

  // Plain multi-block SHA-1, used to double-check the traced version.
  function sha1(msg) {
    const b = enc(msg), l = ((b.length + 8) >> 6) + 1, w = new Uint32Array(l * 16);
    for (let i = 0; i < b.length; i++) w[i >> 2] |= b[i] << (24 - (i % 4) * 8);
    w[b.length >> 2] |= 0x80 << (24 - (b.length % 4) * 8); w[l * 16 - 1] = b.length * 8;
    let h = H0.slice(); const W = new Uint32Array(80);
    for (let i = 0; i < w.length; i += 16) {
      for (let t = 0; t < 16; t++) W[t] = w[i + t];
      for (let t = 16; t < 80; t++) { const x = W[t - 3] ^ W[t - 8] ^ W[t - 14] ^ W[t - 16]; W[t] = (x << 1) | (x >>> 31); }
      let [a, bb, c, d, e] = h;
      for (let t = 0; t < 80; t++) {
        const [f, k] = fK(t, bb, c, d);
        const tmp = (rotl(a, 5) + f + e + k + W[t]) >>> 0; e = d; d = c; c = rotl(bb, 30); bb = a; a = tmp;
      }
      h = h.map((x, j) => (x + [a, bb, c, d, e][j]) >>> 0);
    }
    return h.map(hex8).join('');
  }

  function fK(t, b, c, d) {
    if (t < 20) return [((b & c) | (~b & d)) >>> 0, 0x5A827999, 'Ch (choose)', 'where b is 1, take the bit from c; where b is 0, take it from d'];
    if (t < 40) return [(b ^ c ^ d) >>> 0, 0x6ED9EBA1, 'Parity', 'b ⊕ c ⊕ d: 1 if an odd number of the three bits are 1'];
    if (t < 60) return [((b & c) | (b & d) | (c & d)) >>> 0, 0x8F1BBCDC, 'Maj (majority)', 'take whichever value most of the three bits have'];
    return [(b ^ c ^ d) >>> 0, 0xCA62C1D6, 'Parity', 'b ⊕ c ⊕ d: 1 if an odd number of the three bits are 1'];
  }

  // One-block SHA-1 that keeps every intermediate value.
  function trace(str) {
    const bytes = enc(str); if (bytes.length > 55) return null;
    const blk = new Uint8Array(64); blk.set(bytes); blk[bytes.length] = 0x80;
    const dv = new DataView(blk.buffer); dv.setUint32(60, bytes.length * 8);
    const W = [];
    for (let t = 0; t < 16; t++) W[t] = dv.getUint32(t * 4);
    for (let t = 16; t < 80; t++) W[t] = rotl(W[t - 3] ^ W[t - 8] ^ W[t - 14] ^ W[t - 16], 1);
    const st = [H0.slice()]; let s = H0.slice();
    for (let t = 0; t < 80; t++) {
      const [a, b, c, d, e] = s; const [f, k] = fK(t, b, c, d);
      s = [(rotl(a, 5) + f + e + k + W[t]) >>> 0, a, rotl(b, 30), c, d]; st.push(s.slice());
    }
    const fin = H0.map((h, i) => (h + s[i]) >>> 0);
    return { bytes, blk, W, st, fin, hex: fin.map(hex8).join('') };
  }

  const bitgrid = (bits, cls) => `<div class="bitgrid">${[...bits].map((v, i) => `<i class="${cls(i, v)}">${v}</i>`).join('')}</div>`;

  function roundSVG(tr, t) {
    const r = Math.max(t, 1) - 1, P = tr.st[r], C = tr.st[r + 1], k = fK(r, P[1], P[2], P[3])[1], X = [60, 180, 300, 420, 540];
    const box = (x, y, nm, v, hi) => `<rect x="${x - 52}" y="${y}" width="104" height="44" rx="10" style="fill:${hi ? 'var(--sh-blue)' : 'var(--sh-card)'};stroke:${hi ? 'var(--sh-blue)' : 'var(--sh-line)'}"/><text x="${x}" y="${y + 18}" text-anchor="middle" font-size="12" font-weight="700" style="fill:${hi ? '#fff' : 'var(--sh-text)'}">${nm}</text><text x="${x}" y="${y + 35}" text-anchor="middle" font-size="12" style="fill:${hi ? '#fff' : 'var(--sh-dim)'}">${hex8(v)}</text>`;
    const arr = (x1, y1, x2, y2, c, dash) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="2" ${dash ? 'stroke-dasharray="5 4"' : ''} marker-end="url(#shah${c.slice(1)})"/>`;
    const mk = (c) => `<marker id="shah${c.slice(1)}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="${c}"/></marker>`;
    let g = `<defs>${mk('#a1a1a6')}${mk('#0071e3')}${mk('#d6338a')}${mk('#8e44ec')}</defs>`;
    'abcde'.split('').forEach((n, i) => (g += box(X[i], 8, n, P[i])));
    g += arr(180, 52, 272, 92, '#8e44ec') + arr(300, 52, 300, 92, '#8e44ec') + arr(420, 52, 328, 92, '#8e44ec');
    g += `<rect x="250" y="92" width="100" height="32" rx="16" style="fill:var(--sh-violet-soft)" stroke="#8e44ec"/><text x="300" y="113" text-anchor="middle" font-size="12" style="fill:var(--sh-violet)" font-weight="700">f(b,c,d)</text>`;
    g += arr(60, 52, 60, 146, '#0071e3') + `<text x="68" y="100" font-size="12" fill="#0071e3" font-weight="700">⟲5</text>`;
    g += arr(250, 116, 80, 160, '#0071e3');
    g += `<path d="M540 52 V150 Q540 160 530 160 H200" fill="none" stroke="#0071e3" stroke-width="2"/>` + arr(200, 160, 82, 167, '#0071e3') + `<text x="548" y="110" font-size="12" fill="#0071e3" font-weight="700">e</text>`;
    g += `<text x="150" y="198" font-size="11.5" style="fill:var(--sh-dim)">K = ${hex8(k)}</text><text x="150" y="216" font-size="11.5" style="fill:var(--sh-dim)">W${r} = ${hex8(tr.W[r])}</text>` + arr(146, 202, 82, 176, '#0071e3');
    g += arr(60, 52, 170, 240, '#a1a1a6', 1) + arr(180, 52, 290, 240, '#d6338a', 1) + `<text x="252" y="186" font-size="12" fill="#d6338a" font-weight="700">⟲30</text>` + arr(300, 52, 410, 240, '#a1a1a6', 1) + arr(420, 52, 530, 240, '#a1a1a6', 1);
    g += `<circle cx="60" cy="168" r="20" fill="#0071e3"/><text x="60" y="175" text-anchor="middle" font-size="22" fill="#fff" font-weight="700">+</text>`;
    g += arr(60, 188, 60, 240, '#0071e3');
    'abcde'.split('').forEach((n, i) => (g += box(X[i], 242, 'new ' + n, C[i], i === 0)));
    g += `<text x="596" y="34" font-size="11" style="fill:var(--sh-dim)">before</text><text x="596" y="48" font-size="11" style="fill:var(--sh-dim)">round ${r}</text><text x="596" y="268" font-size="11" style="fill:var(--sh-dim)">after</text>`;
    return `<svg class="rsvg" viewBox="0 0 660 296" role="img" aria-label="One SHA-1 round: how boxes a to e turn into the new a to e">${g}</svg>`;
  }

  const TABS = ['1 Text → bytes', '2 Pad to 512 bits', '3 16 words → 80', '4 Mix 80 rounds', '5 Add up', '6 Avalanche'];

  function init(root) {
    const S = { step: 0, B: '"seat": "9"', t: 80, w: 16, timer: null, cut: false, sweep: 32 };
    root.innerHTML = `<div class="row"><label class="note" for="shaIn">Input</label><input type="text" id="shaIn" value='"seat": "8"' style="flex:1"><span class="note sha-len"></span></div>
      <div class="sha-tabs" role="tablist">${TABS.map((t, i) => `<button class="chip" role="tab" data-sh="${i}">${t}</button>`).join('')}</div>
      <div class="sha-body" aria-live="polite"></div>`;
    const $ = (s) => root.querySelector(s), $$ = (s) => [...root.querySelectorAll(s)];
    const input = $('#shaIn'), body = $('.sha-body');
    $$('[data-sh]').forEach((c) => (c.onclick = () => { S.step = +c.dataset.sh; render(); }));
    input.oninput = () => render();
    const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function anim(step, ms) {
      clearInterval(S.timer);
      if (reduced()) { while (!step()); render(true); return; }
      S.timer = setInterval(() => { const done = step(); render(true); if (done) { clearInterval(S.timer); S.timer = null; } }, ms);
    }

    function render(fromAnim) {
      if (!fromAnim) { clearInterval(S.timer); S.timer = null; }
      const A = input.value, tr = trace(A);
      $$('[data-sh]').forEach((c, i) => { c.classList.toggle('on', i === S.step); c.setAttribute('aria-selected', i === S.step); });
      $('.sha-len').textContent = `${enc(A).length} / 55 bytes`;
      if (!tr) { body.innerHTML = '<div class="card note">Keep it to 55 bytes or less. This demo shows one block only. Longer input just repeats the same steps block by block.</div>'; return; }

      if (S.step === 0) {
        body.innerHTML = `<div class="stack"><div class="bytes">${[...A].map((ch) => { const e = [...enc(ch)]; return `<div class="bytebox"><div class="ch">${ch === ' ' ? '␣' : esc(ch)}</div><div class="hx">${e.map((x) => x.toString(16).padStart(2, '0')).join(' ')}</div><div class="bt">${e.map((x) => x.toString(2).padStart(8, '0')).join('<br>')}</div></div>`; }).join('')}</div>
          <div class="card"><h4>To a computer, text is numbers</h4><p class="note" style="margin:0">In UTF-8, letters, digits and symbols take 1 byte. Korean takes 3. 1 byte = eight 0s and 1s (8 bits). SHA-1 never sees letters, only these <b>bits</b>.<br>Right now the input is <b>${tr.bytes.length} bytes = ${tr.bytes.length * 8} bits</b>. Try typing some Korean.</p></div></div>`;
      }

      if (S.step === 1) {
        const L = tr.bytes.length * 8;
        const cls = (i, v) => (i < L ? (v === '1' ? 'm1' : 'm0') : i === L ? 'p' : i >= 448 ? (v === '1' ? 'l1' : 'l0') : '');
        const bits = [...tr.blk].map((x) => x.toString(2).padStart(8, '0')).join('');
        const rows = Array.from({ length: 16 }, (_, r) => `<div class="wrow"><span class="wl">W${r}</span>${bitgrid(bits.slice(r * 32, r * 32 + 32), (i, v) => cls(r * 32 + i, v))}<span class="wh">${hex8(tr.W[r])}</span></div>`).join('');
        body.innerHTML = `<div class="stack"><div><div class="row" style="margin-bottom:10px"><button class="btn" id="shaCut">${S.cut ? '↺ Join back' : '✂ Cut into 32-bit words'}</button><span class="note">512 bits = 32 bits × 16 rows</span></div>
          <div class="cutwrap ${S.cut ? 'cut' : ''}">${rows}</div>
          <div class="legend"><span><i style="background:var(--sh-blue)"></i>message ${L} bits</span><span><i style="background:var(--sh-pink)"></i>end marker, 1 bit</span><span><i style="background:var(--sh-empty)"></i>zero fill ${447 - L} bits</span><span><i style="background:var(--sh-violet)"></i>original length, 64 bits (= ${L})</span></div></div>
          <div class="card"><h4>SHA-1 eats 512 bits at a time</h4><p class="note" style="margin:0">So it fills the gap with a fixed rule: (1) add a single <b>1</b> to mark the end, (2) fill with 0s, (3) write the <b>original length</b> in the last 64 bits. Because the length is written down, "abc" and "abc + 0" end up as different blocks.<br>Each row is 32 bits = one word. <b>Cut</b> splits the block into 16 words, <b>W0 to W15</b>. The blue text is each word in hex.</p></div></div>`;
        $('#shaCut').onclick = () => { S.cut = !S.cut; $('.cutwrap').classList.toggle('cut', S.cut); $('#shaCut').textContent = S.cut ? '↺ Join back' : '✂ Cut into 32-bit words'; };
      }

      if (S.step === 2) {
        const w = S.w, src = w >= 16 ? [w - 3, w - 8, w - 14, w - 16] : [];
        let f;
        if (w < 16) f = `<div class="formula">W${w} = bytes ${w * 4} to ${w * 4 + 3} of the block, as is\n   = <em>${hex8(tr.W[w])}</em>\n   = ${b32(tr.W[w])}</div><p class="note">The blue words (W0 to W15) are the original block. Tap W16 or later to see how new words are made.</p>`;
        else {
          const x = (tr.W[w - 3] ^ tr.W[w - 8] ^ tr.W[w - 14] ^ tr.W[w - 16]) >>> 0, sw = S.sweep, xs = b32(x), done = sw >= 32;
          const srcRows = src.map((k, n) => `<div class="xrow"><span class="lb">${n ? '⊕ ' : ''}W${k}</span>${bitgrid(b32(tr.W[k]), (j, v) => (j === sw - 1 && sw < 32 ? 'col ' : '') + (v === '1' ? 'b1' : ''))}</div>`).join('');
          const xr = `<div class="xrow res"><span class="lb">= XOR</span>${bitgrid(xs, (j, v) => (j >= sw ? 'nil' : (j === sw - 1 && sw < 32 ? 'col ' : '') + (v === '1' ? 'm1' : 'm0')))}</div>`;
          const rot = done ? `<div class="xrow" style="margin-top:12px"><span class="lb">⟲1 rotate</span><div class="slidel">${bitgrid(b32(tr.W[w]), (j, v) => (j === 31 ? 'wrap' : v === '1' ? 'm1' : 'm0'))}</div></div><div class="xrow res"><span class="lb" style="color:var(--sh-blue)">W${w}</span><code style="font:600 13px var(--sh-mono);color:var(--sh-blue)">${hex8(tr.W[w])}</code></div>` : '';
          const col = sw > 0 && sw < 32 ? `column ${sw}: ${src.map((k) => b32(tr.W[k])[sw - 1]).join(' ⊕ ')} = <b>${xs[sw - 1]}</b>` : '';
          f = `<div class="row" style="margin-bottom:12px"><button class="btn" id="shaXor">${done ? '↺ Replay' : '▶ XOR column by column'}</button><span class="xtt"><span>0⊕0=0</span><span>0⊕1=1</span><span>1⊕0=1</span><span>1⊕1=0</span></span></div>
            ${srcRows}<div class="xsep"></div>${xr}<p class="note" style="min-height:22px;margin:6px 0 0">${col}</p>${rot}
            ${done ? `<p class="note">Shift the XOR result left by one. <b style="color:var(--sh-pink)">The bit pushed off the front wraps to the back (pink).</b> That is W${w}.<br>Each new word mixes four earlier words, so a change in one input word spreads to many later words. <b>But it only uses XOR and rotation, which makes it easy to predict.</b> The 2017 attack went after exactly this.</p>` : `<p class="note">XOR (⊕) works one column at a time: 1 if the column has an odd number of 1s, 0 if even.</p>`}`;
        }
        body.innerHTML = `<div class="stack"><div>${f}</div><div><h4>All 80 words <span class="note" style="font-weight:400">(blue = original 16, orange outline = inputs for the selected word; tap to pick another)</span></h4>
          <div class="wgrid">${tr.W.map((v, i) => `<button data-w="${i}" class="${i === w ? 'sel' : src.includes(i) ? 'src' : i < 16 ? 'orig' : ''}"><small>W${i}</small>${hex8(v)}</button>`).join('')}</div></div></div>`;
        $$('[data-w]').forEach((b) => (b.onclick = () => { S.w = +b.dataset.w; S.sweep = 32; render(); }));
        if ($('#shaXor')) $('#shaXor').onclick = () => { S.sweep = 0; render(); anim(() => ++S.sweep >= 32, 90); };
      }

      if (S.step === 3) {
        const t = S.t, cur = tr.st[t], prev = t > 0 ? tr.st[t - 1] : cur;
        let info;
        if (t === 0) info = `<b>Start.</b> The five boxes (a to e) hold fixed starting values from the standard. Everyone starts from the same place.`;
        else { const r = t - 1, [, k, nm, desc] = fK(r, prev[1], prev[2], prev[3]); info = `<b>Round ${r}</b> just finished · input <code>W${r}</code> = ${hex8(tr.W[r])}<br>f = <b>${nm}</b>: ${desc} · K = <code>${hex8(k)}</code><br>Orange = bits that changed this round (${cur.reduce((a, v, i) => a + pop(v ^ prev[i]), 0)})`; }
        body.innerHTML = `<div class="stack">${roundSVG(tr, t)}
          <div><div class="row" style="margin-bottom:10px"><button class="btn" id="shaPlay">${t >= 80 ? '↺ Play again' : '▶ Play'}</button><input type="range" id="shaT" min="0" max="80" value="${t}" style="flex:1" aria-label="Round"><b class="mono" style="min-width:56px;text-align:right">${t} / 80</b></div>
          ${'abcde'.split('').map((nm, i) => `<div class="reg"><b>${nm}</b><code>${hex8(cur[i])}</code>${bitgrid(b32(cur[i]), (j, v) => (((cur[i] ^ prev[i]) >>> (31 - j)) & 1 ? 'ch' : v === '1' ? 'b1' : ''))}</div>`).join('')}
          <p class="note" style="margin:10px 0 0">${info}</p></div>
          <div class="formula">new a = (a <em>⟲5</em>) + f(b,c,d) + e + K + W[t]\nb ← a\nc ← b <em>⟲30</em>\nd ← c\ne ← d</div>
          <p class="note">⟲ = rotate bits left. + = 32-bit addition (overflow is dropped). Only <b>a</b> is newly computed; the others just shift over. So each input word reaches every box within five rounds. Drag the slider slowly from 0: the starting pattern is visible for a few rounds, then it quickly looks random.</p></div>`;
        $('#shaT').oninput = (e) => { S.t = +e.target.value; render(); };
        $('#shaPlay').onclick = () => { if (S.t >= 80) S.t = 0; render(); anim(() => ++S.t >= 80, 140); };
      }

      if (S.step === 4) {
        const last = tr.st[80];
        body.innerHTML = `<div class="stack"><table><tr><th>Box</th><th>Start</th><th>After 80 rounds</th><th>Sum</th></tr>${'abcde'.split('').map((nm, i) => `<tr><td class="mono">${nm} → h${i}</td><td class="mono">${hex8(H0[i])}</td><td class="mono">+ ${hex8(last[i])}</td><td class="mono" style="color:var(--sh-blue);font-weight:600">${hex8(tr.fin[i])}</td></tr>`).join('')}</table>
          <div><p class="note" style="margin:0 0 6px">Join the five together and you get the hash:</p><div class="formula" style="font-size:14px"><em>${tr.hex}</em></div>
          <p class="note" style="margin:6px 0 0">${tr.hex === sha1(A) ? '✓ Matches a regular SHA-1 implementation.' : '⚠︎ Does not match'}</p></div>
          <div class="card"><h4>Why add the starting values again?</h4><p class="note" style="margin:0">Each of the 80 rounds can actually be <b>run backwards</b>. If you know the boxes and the input word, you can step back one round. But once the starting values are added at the end, you can't tell what the boxes were right after round 80, so the way back is closed.<br>If the input is longer than 64 bytes, this result becomes the starting value for the next block.</p></div></div>`;
      }

      if (S.step === 5) {
        const tb = trace(S.B);
        const head = `<div class="two"><div><label class="f">Input A (the field above)</label><input type="text" value="${esc(A)}" disabled style="width:100%;opacity:.7"></div><div><label class="f" for="shaB">Input B (change one character)</label><input type="text" id="shaB" value="${esc(S.B)}" style="width:100%"></div></div>`;
        const bindB = () => { $('#shaB').oninput = (e) => { S.B = e.target.value; render(); const el = $('#shaB'); el.focus(); el.setSelectionRange(el.value.length, el.value.length); }; };
        if (!tb) { body.innerHTML = head + '<p class="note">Keep B to 55 bytes or less too.</p>'; bindB(); return; }
        const diffs = tr.st.map((s, t) => s.reduce((a, v, i) => a + pop(v ^ tb.st[t][i]), 0));
        const bin = (h) => h.split('').map((c) => parseInt(c, 16).toString(2).padStart(4, '0')).join('');
        const hb = bin(tr.hex), hb2 = bin(tb.hex);
        let nd = 0; for (let i = 0; i < 160; i++) if (hb[i] !== hb2[i]) nd++;
        let inBits = 0; for (let i = 0; i < 64; i++) inBits += pop(tr.blk[i] ^ tb.blk[i]);
        let fb = -1; for (let i = 0; i < 64; i++) if (tr.blk[i] !== tb.blk[i]) { fb = i; break; }
        const first = diffs.findIndex((d) => d > 0), r60 = diffs.findIndex((d) => d >= 60);
        const hexd = (h, o) => h.split('').map((c, i) => (c !== o[i] ? `<span class="d">${c}</span>` : c)).join('');
        const bars = diffs.map((d, t) => `<rect x="${30 + t * 9.5}" y="${170 - d}" width="7.5" height="${Math.max(d, 0.5)}" rx="1.5" fill="${t === first ? '#d6338a' : '#0071e3'}" opacity="${d ? 1 : 0.25}"><title>after round ${t}: ${d} bits differ</title></rect>`).join('');
        const svg = `<svg viewBox="0 0 810 200" style="width:100%;height:auto;display:block" role="img" aria-label="Bits that differ between A and B after each round"><line x1="30" y1="90" x2="800" y2="90" stroke="#ff9f0a" stroke-dasharray="5 5"/><text x="796" y="84" text-anchor="end" font-size="13" style="fill:var(--sh-orange-ink)">half = 80 bits</text><line x1="30" y1="170" x2="800" y2="170" style="stroke:var(--sh-line)"/>${bars}<text x="30" y="192" font-size="13" style="fill:var(--sh-dim)">start</text><text x="800" y="192" text-anchor="end" font-size="13" style="fill:var(--sh-dim)">round 80</text><text x="24" y="14" font-size="13" style="fill:var(--sh-dim)">bits that differ between A and B (out of 160)</text></svg>`;
        const story = nd === 0
          ? 'A and B are the same, so every value is the same. Change one character in B.'
          : `The inputs differ by only <b>${inBits} of 512 bits</b>. The first different byte is byte ${fb}, inside word <code>W${fb >> 2}</code>. So <b>the boxes stay exactly the same until round ${first - 1}</b>, when W${fb >> 2} is mixed in and they split (pink bar).${r60 > 0 ? ` Within <b>${r60 - first + 1} rounds</b> more than 60 bits differ,` : ''} and from then on it hovers around half (80 bits). That is the <b>avalanche effect</b>.`;
        body.innerHTML = head + `<div class="stack" style="margin-top:14px"><div><div class="note">Hash of A</div><div class="formula hexdiff">${tr.hex}</div><div class="note" style="margin-top:8px">Hash of B (changed characters in orange)</div><div class="formula hexdiff">${hexd(tb.hex, tr.hex)}</div></div>
          <div><div class="note" style="margin-bottom:4px">All 160 bits (orange = flipped)</div>${bitgrid(hb2, (i, v) => (hb[i] !== v ? 'ch' : v === '1' ? 'b1' : ''))}<p style="font-size:19px;font-weight:700;margin:10px 0 0"><span style="color:var(--sh-orange-ink)">${nd}</span> of 160 bits differ</p></div>
          <div class="card">${svg}</div><p class="note" style="margin:0">${story}</p></div>`;
        bindB();
      }
    }
    render();
  }

  const boot = () => document.querySelectorAll('[data-sha1-walk]').forEach(init);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
