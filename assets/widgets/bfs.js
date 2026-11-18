// BFS on a grid: tap cells to toggle walls, then step or run.
(() => {
  if (window.__bfsWidgets) return;
  window.__bfsWidgets = true;

  const C = 8, R = 6;
  const START = [0, 0], GOAL = [R - 1, C - 1];
  const WALLS = ['0,3', '1,1', '1,3', '1,5', '2,1', '2,5', '3,1', '3,2', '3,3', '3,5', '3,6', '4,4'];
  const DIRS = [[0, 1], [1, 0], [0, -1], [-1, 0]];
  const key = (r, c) => `${r},${c}`;
  const name = (k) => `(${k})`;
  const PLAY = '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M4 2.5v11l9-5.5z" fill="currentColor"/></svg>';
  const PAUSE = '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M4 2.5h3v11H4zM9 2.5h3v11H9z" fill="currentColor"/></svg>';
  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function init(root) {
    const S = { walls: new Set(WALLS), timer: null };
    root.innerHTML = `
      <div class="bfs-controls">
        <button class="bfs-btn" data-a="step">Next</button>
        <button class="bfs-btn ghost" data-a="reset">Reset</button>
        <button class="bfs-btn ghost bfs-run" data-a="run" aria-label="Run"></button>
      </div>
      <div class="bfs-grid" style="grid-template-columns:repeat(${C},1fr)"></div>
      <div class="bfs-queue"></div>
      <p class="bfs-msg" aria-live="polite"></p>
      <div class="bfs-legend">
        <span><i style="border:1px dashed var(--bfs-dim)"></i>in queue</span>
        <span><i style="background:var(--bfs-line);border-color:transparent"></i>visited</span>
        <span><i style="background:var(--bfs-blue-soft);border-color:var(--bfs-blue)"></i>shortest path</span>
        <span><i style="background:var(--bfs-wall)"></i>wall</span>
      </div>`;
    const $ = (s) => root.querySelector(s);
    const grid = $('.bfs-grid'), msg = $('.bfs-msg');
    const say = (h, cls = '') => { msg.className = `bfs-msg ${cls}`; msg.innerHTML = h; };
    const sk = key(...START), gk = key(...GOAL);

    const cells = {};
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
      const b = document.createElement('button');
      b.className = 'bfs-cell';
      b.setAttribute('aria-label', `cell ${r},${c}`);
      const k = key(r, c);
      b.onclick = () => {
        if (k === sk || k === gk) return;
        stop();
        S.walls.has(k) ? S.walls.delete(k) : S.walls.add(k);
        reset();
      };
      cells[k] = b;
      grid.appendChild(b);
    }

    function reset() {
      S.queue = [sk]; S.dist = { [sk]: 0 }; S.prev = {}; S.cur = null; S.done = false; S.path = new Set(); S.visited = 0;
      render();
      say('Start at <b>S</b>. Each step takes the first cell out of the queue and adds its open neighbors to the back.');
    }

    function render() {
      for (const k in cells) {
        const b = cells[k], d = S.dist[k];
        let cls = 'bfs-cell';
        if (S.walls.has(k)) cls += ' wall';
        else if (S.path.has(k)) cls += ' path';
        else if (S.queue.includes(k)) cls += ' queued';
        else if (d !== undefined) cls += ' seen';
        if (k === S.cur) cls += ' cur';
        if (k === sk || k === gk) cls += ' end';
        b.className = cls;
        b.textContent = k === sk ? 'S' : k === gk ? 'G' : d !== undefined ? d : '';
      }
      const q = S.queue.slice(0, 10).map((k) => `<span class="q">${k}</span>`).join('');
      $('.bfs-queue').innerHTML = `Queue: ${q || '<span>empty</span>'}${S.queue.length > 10 ? ` +${S.queue.length - 10}` : ''}`;
      $('[data-a="step"]').disabled = S.done;
      const run = $('[data-a="run"]');
      run.innerHTML = S.timer ? PAUSE : PLAY;
      run.setAttribute('aria-label', S.timer ? 'Pause' : 'Run');
    }

    function step() {
      if (S.done) return;
      if (!S.queue.length) {
        S.done = true; S.cur = null; stop(); render();
        say(`The queue is empty, and <b>G</b> was never reached. There is no path.`, 'warn');
        return;
      }
      const k = S.queue.shift();
      S.cur = k; S.visited++;
      if (k === gk) {
        for (let p = k; p; p = S.prev[p]) S.path.add(p);
        S.done = true; stop(); render();
        say(`Reached <b>G</b> at distance <b>${S.dist[k]}</b>. That's the shortest path. BFS took ${S.visited} cells out of the queue.`, 'ok');
        return;
      }
      const [r, c] = k.split(',').map(Number);
      const added = [];
      for (const [dr, dc] of DIRS) {
        const nr = r + dr, nc = c + dc, nk = key(nr, nc);
        if (nr < 0 || nc < 0 || nr >= R || nc >= C || S.walls.has(nk) || nk in S.dist) continue;
        S.dist[nk] = S.dist[k] + 1; S.prev[nk] = k;
        S.queue.push(nk); added.push(nk);
      }
      render();
      const label = k === sk ? '<b>S</b>' : `<b>${name(k)}</b>`;
      say(`Took ${label} out, distance ${S.dist[k]}. ` + (added.length
        ? `Added ${added.map((a) => `<b>${name(a)}</b>`).join(', ')} with distance ${S.dist[k] + 1}.`
        : 'No new neighbors.'));
    }

    function stop() { clearInterval(S.timer); S.timer = null; }

    $('[data-a="step"]').onclick = () => { stop(); step(); };
    $('[data-a="reset"]').onclick = () => { stop(); reset(); };
    $('[data-a="run"]').onclick = () => {
      if (S.timer) { stop(); render(); return; }
      if (S.done) reset();
      S.timer = setInterval(step, reduced() ? 30 : 160);
      render();
    };
    reset();
  }

  function boot() {
    document.querySelectorAll('.bfs[data-bfs]').forEach((root) => {
      if (root.dataset.ready) return;
      root.dataset.ready = '1';
      init(root);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
