// 인물 계보의 '족보식' 쪽 나눔. DOM이 없어 Node에서 시험할 수 있다(tests/pagebook.test.mjs).
//
// 전체 배치를 한 번 한 뒤 용지 크기로 잘라 붙이는 방식(포스터 타일링, Graphviz의 page 속성)은
// 쪽 경계에서 선이 여백으로 빠져나가고 다음 장 첫 줄에는 부모 없는 선이 들어온다.
// 여기서는 낱장으로 읽는 책자의 관례를 따른다.
//  1. 세대 경계에서만 끊고, 앞 장 마지막 세대 가운데 이 장으로 자녀가 이어지는 사람을
//     첫 줄에 다시 싣는다(족보의 見下·見上, 族谱의 五世一提, 서양 조상도의 "No. 1 … same person as").
//  2. 가로는 x 좌표가 아니라 가지(부모와 그 아래 하위 트리) 경계에서 나눈다. 한 장보다 넓은 가지는
//     자녀 가지들로 쪼개고, 쪼갠 쪽마다 부모의 사본을 세운다(yFiles MultiPageLayout의 부모 사본).
//  3. 쪽을 건너는 선은 그리는 쪽에서 판면 안에 짧게 끝내고 양 끝에 상대 쪽 번호를 적는다(ISO 5807 연결자).
// 같은 부모의 접힌 형제 줄은 세로로 가르지 않는다.
(function () {
'use strict';
const G = (window.Genealogy = window.Genealogy || {});

// blocks: 배치된 칸 { x, y, width, order: [id…] }, unions: 혼인 { partners, children: [{ id, adoptedOut, viaSpouse, spineX }] }
// o: { cardH, innerW, innerH, rows(한 장 최대 줄 수), trunkX(직계 줄기 x, 없으면 null), left0, top0 }
// 돌려주는 것: { pages: [{ ids: 실제 칸의 사람, ghosts: Map(사본 칸의 사람 → 가로 이동), dx, dy }], realPage: Map(사람 → 실제 칸이 있는 장 번호) }
function paginateBook(blocks, unions, o) {
  const H = o.cardH;
  const EPS = 0.5;
  const top = (b) => b.y - H / 2;
  const bottom = (b) => b.y + H / 2;
  const blockOf = new Map();
  for (const b of blocks) for (const id of b.order) blockOf.set(id, b);

  // 칸 사이 부모·자녀. 생가로 나간 선과 배우자를 거친 선(사돈 쪽)은 약한 연결로 뒤에 둔다.
  const parentsOf = new Map(blocks.map((b) => [b, []]));
  const kidsOf = new Map(blocks.map((b) => [b, new Set()]));
  const spineRows = [];
  for (const un of unions) {
    const from = blockOf.get(un.partners[0]);
    if (!from) continue;
    const spine = [];
    for (const c of un.children) {
      const to = blockOf.get(c.id);
      if (!to || to === from) continue;
      parentsOf.get(to).push({ p: from, weak: !!(c.adoptedOut || c.viaSpouse) });
      kidsOf.get(from).add(to);
      if (c.spineX != null) spine.push(to);
    }
    if (spine.length > 1) spineRows.push(spine);
  }
  for (const list of parentsOf.values()) list.sort((a, b) => a.weak - b.weak);

  const rowMap = new Map();
  for (const b of blocks) {
    const y = Math.round(b.y);
    if (!rowMap.has(y)) rowMap.set(y, []);
    rowMap.get(y).push(b);
  }
  const rows = [...rowMap.keys()].sort((a, b) => a - b).map((y) => rowMap.get(y));
  const rowOf = new Map();
  rows.forEach((row, i) => row.forEach((b) => rowOf.set(b, i)));
  // noBreak[i]: i번째 줄 앞에서 끊으면 같은 부모의 접힌 형제 줄이 갈린다.
  const noBreak = rows.map(() => false);
  for (const spine of spineRows) {
    const idx = spine.map((b) => rowOf.get(b));
    for (let r = Math.min(...idx) + 1; r <= Math.max(...idx); r++) noBreak[r] = true;
  }
  const spanOf = (list) => (list.length ? Math.max(...list.map(bottom)) - Math.min(...list.map(top)) : 0);
  const ghostsOf = (carry, list) => {
    const set = new Set(list);
    return carry.filter((b) => [...kidsOf.get(b)].some((k) => set.has(k)));
  };

  // ── 세로: 세대 띠. 둘째 띠부터 앞 띠의 마지막 줄을 다시 싣는다. ──
  const bands = [];
  for (let i = 0; i < rows.length;) {
    const carry = i ? rows[i - 1] : [];
    const room = ghostsOf(carry, rows.slice(i, i + o.rows - 1).flat()).length ? o.rows - 1 : o.rows;
    let j = i + 1;
    while (j < rows.length && j - i < room) {
      const list = rows.slice(i, j + 1).flat();
      if (spanOf([...ghostsOf(carry, list), ...list]) > o.innerH + EPS) break;
      j++;
    }
    if (j < rows.length && noBreak[j]) {
      let k = j;
      while (k > i + 1 && noBreak[k]) k--;
      if (!noBreak[k]) j = k;
    }
    const list = rows.slice(i, j).flat();
    bands.push({ ghosts: ghostsOf(carry, list), rows: rows.slice(i, j) });
    i = j;
  }

  // ── 가로: 띠 안의 가지. 가지 = 맨 윗사람(다시 실은 부모 또는 띠 안에 부모가 없는 사람)과 그 아래 하위 트리. ──
  // 마디 { b, ghost, kids }. ghost 마디는 다른 장에 실제 칸이 있는 사람의 사본이다.
  const realNodes = (n, out = []) => {
    if (!n.ghost) out.push(n);
    for (const k of n.kids) realNodes(k, out);
    return out;
  };
  const extent = (n) => {
    const list = realNodes(n);
    if (!list.length) return { l: n.b.x - n.b.width / 2, r: n.b.x + n.b.width / 2 };
    return { l: Math.min(...list.map((m) => m.b.x - m.b.width / 2)), r: Math.max(...list.map((m) => m.b.x + m.b.width / 2)) };
  };
  const hasTrunk = (n) => o.trunkX != null && realNodes(n).some((m) => Math.abs(m.b.x - o.trunkX) < 1);
  const lo = o.trunkX != null ? o.trunkX - o.innerW / 2 : -Infinity;
  const hi = o.trunkX != null ? o.trunkX + o.innerW / 2 : Infinity;
  const fits = (n) => {
    const e = extent(n);
    if (e.r - e.l > o.innerW + EPS) return false;
    return !hasTrunk(n) || (e.l >= lo - EPS && e.r <= hi + EPS);
  };
  // 한 장에 안 들어가는 가지는 자녀 가지로 쪼개고, 쪼갠 가지마다 부모 사본을 위에 둔다.
  // 실제 부모 칸은 함께 들어가는 가장 가까운 자녀 가지에 남기고, 그런 가지가 없으면 홀로 선다.
  const split = (n) => {
    if (fits(n) || !n.kids.length) return [n];
    const parts = n.kids.flatMap(split);
    const center = (p) => { const e = extent(p); return (e.l + e.r) / 2; };
    let keep = -1;
    if (!n.ghost) {
      const near = parts.map((p, i) => i).sort((a, b) => Math.abs(center(parts[a]) - n.b.x) - Math.abs(center(parts[b]) - n.b.x));
      keep = near.find((i) => fits({ b: n.b, ghost: false, kids: [parts[i]] })) ?? -1;
    }
    const out = parts.map((p, i) => ({ b: n.b, ghost: i !== keep, kids: [p] }));
    if (!n.ghost && keep < 0) out.unshift({ b: n.b, ghost: false, kids: [] });
    return out;
  };

  const pages = [];
  const realPage = new Map();
  const push = (units, dx, dy) => {
    if (!units.length) return;
    const ids = new Set();
    const ghostBlocks = new Map(); // 사본 칸 → 그 장에 있는 자녀 마디들
    const walk = (n) => {
      if (n.ghost) {
        if (!ghostBlocks.has(n.b)) ghostBlocks.set(n.b, []);
        ghostBlocks.get(n.b).push(...n.kids);
      } else n.b.order.forEach((id) => ids.add(id));
      n.kids.forEach(walk);
    };
    units.forEach(walk);
    // 사본은 원래 자리가 이 장 판면 안이면 그대로 두고, 밖이면 이 장의 자녀들 위 가운데로 옮긴다.
    const winL = -dx + o.left0;
    const winR = winL + o.innerW;
    const ghosts = new Map();
    for (const [b, kids] of ghostBlocks) {
      if (b.order.some((id) => ids.has(id))) continue;
      let shift = 0;
      if (b.x - b.width / 2 < winL - EPS || b.x + b.width / 2 > winR + EPS) {
        const xs = kids.map((k) => k.b.x);
        const want = xs.length ? (Math.min(...xs) + Math.max(...xs)) / 2 : b.x;
        shift = Math.min(winR - b.width / 2, Math.max(winL + b.width / 2, want)) - b.x;
      }
      for (const id of b.order) ghosts.set(id, shift);
    }
    const page = { ids, ghosts, dx, dy };
    for (const id of ids) if (!realPage.has(id)) realPage.set(id, pages.length);
    pages.push(page);
  };
  // 왼쪽부터 판면 너비만큼씩 가지를 묶는다. fromRight면 오른쪽 끝에서 왼쪽으로 묶고 순서를 되돌린다.
  const chunk = (units, fromRight) => {
    const ext = new Map(units.map((u) => [u, extent(u)]));
    const sorted = units.slice().sort((a, b) => fromRight ? ext.get(b).r - ext.get(a).r : ext.get(a).l - ext.get(b).l);
    const groups = [];
    let group = [];
    let origin = null;
    for (const u of sorted) {
      const e = ext.get(u);
      const far = fromRight ? origin - e.l : e.r - origin;
      if (origin != null && far <= o.innerW + EPS) { group.push(u); continue; }
      if (group.length) groups.push(group);
      group = [u];
      origin = fromRight ? e.r : e.l;
    }
    if (group.length) groups.push(group);
    return fromRight ? groups.reverse() : groups;
  };
  const minL = (units) => Math.min(...units.map((u) => extent(u).l));
  const maxR = (units) => Math.max(...units.map((u) => extent(u).r));

  for (const band of bands) {
    const nodeOf = new Map();
    const roots = [];
    for (const g of band.ghosts) {
      const n = { b: g, ghost: true, kids: [] };
      nodeOf.set(g, n);
      roots.push(n);
    }
    for (const row of band.rows) {
      for (const b of row) {
        const n = { b, ghost: false, kids: [] };
        const par = parentsOf.get(b).find(({ p }) => nodeOf.has(p));
        if (par) nodeOf.get(par.p).kids.push(n);
        else roots.push(n);
        nodeOf.set(b, n);
      }
    }
    const units = roots.filter((n) => !n.ghost || n.kids.length).flatMap(split);
    const all = [...band.ghosts, ...band.rows.flat()];
    const dy = o.top0 - Math.min(...all.map(top));
    if (o.trunkX == null) {
      for (const g of chunk(units, false)) push(g, o.left0 - minL(g), dy);
      continue;
    }
    const inMid = (u) => { const e = extent(u); return e.l >= lo - EPS && e.r <= hi + EPS; };
    const mid = units.filter(inMid);
    const rest = units.filter((u) => !inMid(u));
    const cx = (u) => { const e = extent(u); return (e.l + e.r) / 2; };
    for (const g of chunk(rest.filter((u) => cx(u) < o.trunkX), true)) push(g, o.left0 + o.innerW - maxR(g), dy);
    push(mid, o.left0 + o.innerW / 2 - o.trunkX, dy);
    for (const g of chunk(rest.filter((u) => cx(u) >= o.trunkX), false)) push(g, o.left0 - minL(g), dy);
  }
  if (!pages.length) pages.push({ ids: new Set(), ghosts: new Map(), dx: o.left0, dy: o.top0 });
  return { pages, realPage };
}

G.paginateBook = paginateBook;
})();
