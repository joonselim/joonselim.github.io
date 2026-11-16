// Linked list widget.
//   data-ll="list"  singly vs doubly linked list: add to front / back, pick a node, find or delete it
(() => {
  if (window.__linkedListWidgets) return;
  window.__linkedListWidgets = true;

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sleep = (ms) => new Promise((r) => setTimeout(r, reduced() ? 0 : ms));
  const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
  const FRUITS = ['kiwi', 'fig', 'lime', 'mango', 'peach', 'pear', 'plum', 'melon', 'grape', 'lemon', 'date', 'guava'];
  const START = ['apple', 'banana', 'cherry'];
  const MAX = 9;

  function initList(root) {
    const S = { dbl: false, v: START.slice(), sel: null, busy: false };
    root.innerHTML = `
      <div class="ll-controls">
        <div class="ll-seg" role="group" aria-label="List type"><button data-m="single" class="on">Linked</button><button data-m="double">Doubly linked</button></div>
      </div>
      <div class="ll-controls">
        <span class="ll-add">Add <b class="ll-next"></b> to</span>
        <button class="ll-btn" data-a="front">Front</button>
        <button class="ll-btn" data-a="back">Back</button>
      </div>
      <div class="ll-row"></div>
      <div class="ll-controls">
        <span class="ll-add ll-pick"></span>
        <button class="ll-btn ghost" data-a="find">Find</button>
        <button class="ll-btn ghost" data-a="del">Delete</button>
        <button class="ll-btn ghost" data-a="reset">Reset</button>
      </div>
      <p class="ll-msg" aria-live="polite"></p>`;
    const $ = (s) => root.querySelector(s);
    const row = $('.ll-row'), msg = $('.ll-msg');
    const node = (i) => row.querySelector(`.ll-node[data-i="${i}"]`);
    const say = (html, cls = '') => { msg.className = `ll-msg ${cls}`; msg.innerHTML = html; };
    const nextFruit = () => FRUITS.find((f) => !S.v.includes(f));

    function render(pop) {
      if (!S.v.length) row.innerHTML = `<span class="ll-nil">head → null</span>`;
      else row.innerHTML = S.v.map((v, i) => {
        const tags = (i === 0 ? `<span class="ll-tag">head</span>` : '') + (S.dbl && i === S.v.length - 1 ? `<span class="ll-tag tail">tail</span>` : '');
        const cls = (v === pop ? ' pop' : '') + (v === S.sel ? ' sel' : '');
        const n = `<button class="ll-node${cls}" data-i="${i}" aria-pressed="${v === S.sel}">${S.dbl ? '<span class="p prev">prev</span>' : ''}<span>${esc(v)}</span><span class="p next">next</span></button>`;
        const arrow = i < S.v.length - 1 ? `<span class="ll-arrow">${S.dbl ? '⇄' : '→'}</span>` : `<span class="ll-arrow">→</span><span class="ll-nil">null</span>`;
        return `<div class="ll-item">${tags}${n}</div>${arrow}`;
      }).join('');
      row.querySelectorAll('.ll-node').forEach((b) => (b.onclick = () => {
        if (S.busy) return;
        const v = S.v[+b.dataset.i];
        S.sel = S.sel === v ? null : v;
        render();
      }));
      const nf = nextFruit();
      $('.ll-next').textContent = nf || '…';
      $('.ll-pick').innerHTML = S.sel ? `Selected <b>${esc(S.sel)}</b>:` : 'Tap a node, then:';
      root.querySelectorAll('[data-a="find"],[data-a="del"]').forEach((b) => (b.disabled = !S.sel || S.busy));
      root.querySelectorAll('[data-a="front"],[data-a="back"]').forEach((b) => (b.disabled = !nf || S.v.length >= MAX || S.busy));
    }

    // Walk from head until index `to`, highlighting each node.
    async function walk(to, last = 'found') {
      for (let i = 0; i <= to; i++) {
        const el = node(i);
        el.classList.add(i === to ? last : 'cmp');
        await sleep(i === to ? 350 : 300);
      }
    }

    async function add(where) {
      const k = nextFruit();
      if (!k) return;
      if (where === 'front') {
        const old = S.v[0];
        S.v.unshift(k); render(k);
        say(old ? `<b>${k}</b> added to front. It points to <b>${esc(old)}</b>, and head moves to <b>${k}</b>. 1 step.` : `<b>${k}</b> added. It is the only node.`, 'ok');
        return;
      }
      const n = S.v.length;
      if (n && !S.dbl) await walk(n - 1, 'hit');
      if (n && S.dbl) { node(n - 1).classList.add('hit'); await sleep(350); }
      const old = S.v[n - 1];
      S.v.push(k); render(k);
      if (!old) say(`<b>${k}</b> added. It is the only node.`, 'ok');
      else if (S.dbl) say(`<b>${k}</b> added to back, right after tail <b>${esc(old)}</b>. 1 step.`, 'ok');
      else say(`<b>${k}</b> added to back. The list only knows head, so it walked ${plural(n, 'node')} to reach <b>${esc(old)}</b>.`, 'warn');
    }

    async function find() {
      const i = S.v.indexOf(S.sel);
      await walk(i);
      say(`Found <b>${esc(S.sel)}</b> after ${plural(i + 1, 'step')} from head.`, 'ok');
    }

    async function del() {
      const k = S.sel, i = S.v.indexOf(k);
      await walk(i, 'gone');
      await sleep(250);
      const prev = S.v[i - 1], next = S.v[i + 1];
      S.v.splice(i, 1); S.sel = null; render();
      const P = prev && `<b>${esc(prev)}</b>`, N = next ? `<b>${esc(next)}</b>` : 'null';
      let text;
      if (!prev) text = `<b>${esc(k)}</b> deleted. Head now points to ${N}`;
      else text = `<b>${esc(k)}</b> deleted. ${P}.next now points to ${N}`;
      if (S.dbl && next) text += prev ? `, and ${N} points back to ${P}` : `, and ${N}.prev is now null`;
      if (S.dbl && !next && prev) text += `, and tail moves to ${P}`;
      say(text + '.', 'ok');
    }

    async function run(fn) {
      if (S.busy) return;
      S.busy = true;
      root.querySelectorAll('button').forEach((b) => (b.disabled = true));
      try { await fn(); } finally { S.busy = false; root.querySelectorAll('button').forEach((b) => (b.disabled = false)); render(); }
    }

    root.querySelectorAll('[data-m]').forEach((b) => (b.onclick = () => {
      if (S.busy) return;
      S.dbl = b.dataset.m === 'double';
      root.querySelectorAll('[data-m]').forEach((x) => x.classList.toggle('on', x === b));
      render();
      say(S.dbl ? 'Each node now has <code>prev</code> too, and the list keeps a tail.' : 'Each node has only <code>next</code>. The list only knows head.');
    }));
    root.querySelectorAll('[data-a]').forEach((b) => (b.onclick = () => run(async () => {
      const a = b.dataset.a;
      if (a === 'front' || a === 'back') await add(a);
      if (a === 'find' && S.sel) await find();
      if (a === 'del' && S.sel) await del();
      if (a === 'reset') { S.v = START.slice(); S.sel = null; say(''); }
    })));
    render();
    say('Add a few fruits, then tap one to find or delete it.');
  }

  function boot() {
    document.querySelectorAll('.ll[data-ll]').forEach((root) => {
      if (root.dataset.ready) return;
      root.dataset.ready = '1';
      if (root.dataset.ll === 'list') initList(root);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
