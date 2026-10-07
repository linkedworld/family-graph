// 화면에 그릴 그래프를 만들고 dagre로 배치한다.
//
// - 부부(한 사람과 그 배우자들)를 하나의 '부부 묶음'으로 나란히 놓는다. 배우자가 여럿이면
//   혼인 순서대로 오른쪽·왼쪽에 번갈아 둔다(첫 배우자는 오른쪽).
// - 결혼선은 두 사람 카드 아래를 잇는 ㄷ자 선이고, 그 가운데에서 자녀선이 내려간다.
//   한 묶음 안에서 결혼선이 겹치지 않도록 층(level)을 나눈다.
// - 숨겨진 인물(미상 숨기기, 외가·처가 끄기)이 계보 중간에 있으면, 그 아래에서 처음
//   보이는 후손을 위쪽 혼인에 바로 잇고 건너뛴 세대 수를 기록한다.
// - 양자는 양가 혼인에서 내려오는 선(adopt)과 생가 혼인에서 내려오는 선(adoptedOut)을 함께 그린다.
// - dagre가 정한 세대(줄)와 좌우 순서는 그대로 두고, 가로 위치만 다시 계산해 자녀를 부모 아래로 모은다
//   (compact 참고).
// - 같은 세대 사이를 지나는 자녀선의 가로 구간은 좌우가 겹치면 서로 다른 높이(차선)에 놓고,
//   세대 사이 간격은 그 사이에 들어갈 결혼선 층수와 차선 수에 맞춰 넓힌다(placeRows 참고).
// 서버 없이 file://로도 열리도록 모듈 대신 전역 Genealogy 객체에 등록한다.
(function (G) {
  'use strict';

  const CARD = { w: 156, h: 74 };
  const COUPLE_GAP = 18;   // 부부 묶음 안 카드 사이 간격
  const LEVEL_STEP = 10;   // 결혼선 층 사이 간격
  const RANK_SEP = 64;     // dagre에 주는 세대 간격(최종 세대 간격은 아래에서 다시 계산)
  const LANE_STEP = 12;    // 자녀선 가로 구간(차선) 사이 간격
  const LANE_PAD = 16;     // 같은 차선에 놓을 두 가로 구간 사이의 최소 거리
  const MIN_GAP = 96;      // 세대 사이 최소 간격
  const MARGIN_Y = 24;

  // 시조 계열(가장 윗대 조상의 후손)과 그 배우자를 '본가'로 보고, 나머지는 외가·처가로 본다.
  function coreSet(model, rootId) {
    const core = new Set();
    const stack = [rootId];
    while (stack.length) {
      const id = stack.pop();
      if (core.has(id)) continue;
      core.add(id);
      stack.push(...model.children(id, 'all'));
    }
    for (const id of [...core]) for (const s of model.spouses(id)) core.add(s.id);
    return core;
  }

  // 보이는 인물과 혼인(보이는 배우자, 보이는 자녀)을 정리한다.
  function buildView(model, { hideUnknown, showInlaws, core }) {
    const visible = (id) => {
      if (hideUnknown && model.isUnknown(id)) return false;
      if (!showInlaws && !core.has(id)) return false;
      return true;
    };
    const unionVisible = (u) => [u.husband, u.wife].some((p) => p && visible(p));

    // 숨겨진 인물 아래에서 처음 보이는 후손들을 찾는다.
    const descendThrough = (cid, depth, out) => {
      for (const uid of model.get(cid).spouseUnions) {
        const u = model.unions.get(uid);
        if (unionVisible(u)) continue;
        for (const gc of model.unionChildren(u, 'all')) {
          if (visible(gc)) out.push({ id: gc, skipped: depth });
          else descendThrough(gc, depth + 1, out);
        }
      }
      return out;
    };

    const persons = [...model.persons.keys()].filter(visible);
    const unions = [];
    for (const [, u] of model.unions) {
      if (!unionVisible(u)) continue;
      const partners = [u.husband, u.wife].filter((p) => p && visible(p));
      const children = [];
      for (const c of model.unionChildren(u, 'all')) {
        const adopt = u.adoptees.includes(c);
        const adoptedOut = !adopt && model.isAdopted(c);
        if (visible(c)) children.push({ id: c, adopt, adoptedOut, gap: !!u.gap });
        else for (const d of descendThrough(c, 1, [])) children.push({ id: d.id, skipped: d.skipped });
      }
      unions.push({ u, partners, children });
    }
    // nodes: 관계표 등에서 쓰는 보이는 인물 목록
    return { persons, unions, nodes: persons.map((id) => ({ id, kind: 'person' })) };
  }

  // 혼인으로 이어진 사람들을 묶음으로 만들고 묶음 안의 좌우 순서를 정한다.
  function makeBlocks(view) {
    const partnersOf = new Map(view.persons.map((id) => [id, []]));
    for (const un of view.unions) {
      if (un.partners.length !== 2) continue;
      const [a, b] = un.partners;
      partnersOf.get(a).push({ id: b, order: un.u.order ?? 1 });
      partnersOf.get(b).push({ id: a, order: un.u.order ?? 1 });
    }
    for (const list of partnersOf.values()) list.sort((x, y) => x.order - y.order);

    const blockOf = new Map();
    const blocks = [];
    const seen = new Set();
    for (const start of view.persons) {
      if (seen.has(start)) continue;
      // 묶음에 속한 사람 전체
      const comp = [];
      const stack = [start];
      seen.add(start);
      while (stack.length) {
        const id = stack.pop();
        comp.push(id);
        for (const p of partnersOf.get(id)) if (!seen.has(p.id)) { seen.add(p.id); stack.push(p.id); }
      }
      // 배우자가 가장 많은 사람을 가운데에 두고, 배우자를 오른쪽·왼쪽 번갈아 바깥으로 놓는다.
      const center = comp.reduce((best, id) => (partnersOf.get(id).length > partnersOf.get(best).length ? id : best), comp[0]);
      const left = [], right = [];
      const placed = new Set([center]);
      const place = (id, side) => {
        placed.add(id);
        if (side === 'R') right.push(id); else left.unshift(id);
        for (const q of partnersOf.get(id)) if (!placed.has(q.id)) place(q.id, side);
      };
      partnersOf.get(center).forEach((p, i) => { if (!placed.has(p.id)) place(p.id, i % 2 === 0 ? 'R' : 'L'); });
      const order = [...left, center, ...right];
      const block = { id: `block:${center}`, order, index: new Map(order.map((id, i) => [id, i])) };
      block.width = order.length * CARD.w + (order.length - 1) * COUPLE_GAP;
      for (const id of order) blockOf.set(id, block);
      blocks.push(block);
    }
    return { blocks, blockOf };
  }

  // 한 묶음 안의 혼인마다 결혼선 층을 정한다. 좌우 범위가 겹치거나 맞닿으면 다른 층에 둔다.
  function assignLevels(view, blockOf) {
    const levels = new Map();
    const used = new Map(); // block → [{lo, hi, level}]
    for (const un of view.unions) {
      const block = blockOf.get(un.partners[0]);
      const idx = un.partners.map((p) => block.index.get(p));
      const lo = Math.min(...idx), hi = Math.max(...idx);
      if (un.partners.length === 1 && un.children.length === 0) continue;
      const list = used.get(block) || [];
      let level = 1;
      while (list.some((r) => r.level === level && r.lo <= hi && lo <= r.hi)) level++;
      list.push({ lo, hi, level });
      used.set(block, list);
      levels.set(un.u.id, level);
    }
    return levels;
  }

  function layout(view) {
    const { blocks, blockOf } = makeBlocks(view);
    const levels = assignLevels(view, blockOf);

    const g = new window.dagre.graphlib.Graph({ multigraph: true });
    g.setGraph({ rankdir: 'TB', nodesep: 28, ranksep: RANK_SEP, edgesep: 10, marginx: 70, marginy: 24 });
    g.setDefaultEdgeLabel(() => ({}));
    for (const b of blocks) g.setNode(b.id, { width: b.width, height: CARD.h });
    for (const un of view.unions) {
      const from = blockOf.get(un.partners[0]);
      for (const c of un.children) {
        const to = blockOf.get(c.id);
        if (!to || to === from) continue;
        // 생가에서 출계한 선은 배치에 약하게만 반영해 양자가 양가 쪽에 놓이게 한다.
        g.setEdge(from.id, to.id, { weight: c.adoptedOut ? 0.2 : 1, minlen: 1 }, `${un.u.id}>${c.id}`);
      }
    }
    window.dagre.layout(g);

    for (const b of blocks) {
      const n = g.node(b.id);
      b.x = n.x;
      b.y = n.y;
    }
    const bounds = compact(view, blocks, blockOf);
    const rows = placeRows(view, blocks, blockOf, levels);

    const pos = new Map();
    for (const b of blocks) {
      b.order.forEach((id) => {
        pos.set(id, { x: b.x + memberOffset(b, id), y: b.y, w: CARD.w, h: CARD.h });
      });
    }

    // 혼인마다 결혼선 모양과 자녀선이 시작하는 점(drop)을 계산한다.
    const unions = [];
    for (const un of view.unions) {
      const level = levels.get(un.u.id);
      if (level == null) continue;
      const ps = un.partners.map((p) => pos.get(p));
      const bottom = ps[0].y + CARD.h / 2;
      const y = bottom + level * LEVEL_STEP;
      const x = ps.reduce((s, p) => s + p.x, 0) / ps.length;
      const children = un.children.map((c) => ({ ...c, busY: rows.busY.get(`${un.u.id}|${c.id}`) }));
      unions.push({ ...un, children, level, bottom, drop: { x, y }, xs: ps.map((p) => p.x) });
    }

    return { pos, unions, blocks, width: bounds.width, height: rows.height };
  }

  // 세대(줄)마다 y를 정하고, 자녀선 가로 구간의 높이(차선)를 배정한다.
  function placeRows(view, blocks, blockOf, levels) {
    const ys = [...new Set(blocks.map((b) => Math.round(b.y)))].sort((a, b) => a - b);
    const rankOf = new Map(blocks.map((b) => [b, ys.indexOf(Math.round(b.y))]));
    const n = ys.length;
    const maxLevel = new Array(n).fill(0);
    const buses = Array.from({ length: n }, () => []);

    for (const un of view.unions) {
      const from = blockOf.get(un.partners[0]);
      const level = levels.get(un.u.id);
      if (level == null) continue;
      const pr = rankOf.get(from);
      maxLevel[pr] = Math.max(maxLevel[pr], level);
      const dropX = un.partners.reduce((sum, p) => sum + from.x + memberOffset(from, p), 0) / un.partners.length;
      // 자녀가 있는 줄마다 가로 구간 하나: 결혼선 가운데 점부터 양 끝 자녀까지
      const byRank = new Map();
      for (const c of un.children) {
        const to = blockOf.get(c.id);
        if (!to) continue;
        const r = rankOf.get(to);
        const x = to.x + memberOffset(to, c.id);
        if (!byRank.has(r)) byRank.set(r, { lo: dropX, hi: dropX, keys: [] });
        const bus = byRank.get(r);
        bus.lo = Math.min(bus.lo, x);
        bus.hi = Math.max(bus.hi, x);
        bus.keys.push(`${un.u.id}|${c.id}`);
      }
      for (const [r, bus] of byRank) if (r > 0) buses[r].push(bus);
    }

    // 왼쪽부터 훑으며, 앞선 구간과 겹치지 않는 가장 낮은 번호의 차선에 넣는다.
    const lanes = new Array(n).fill(0);
    for (let r = 1; r < n; r++) {
      const ends = [];
      buses[r].sort((a, b) => a.lo - b.lo || a.hi - b.hi);
      for (const bus of buses[r]) {
        let lane = ends.findIndex((end) => end + LANE_PAD <= bus.lo);
        if (lane < 0) { lane = ends.length; ends.push(bus.hi); } else ends[lane] = bus.hi;
        bus.lane = lane;
      }
      lanes[r] = ends.length;
    }

    // 세대 사이 간격 = 위 줄 결혼선 층 + 여백 + 자녀선 차선 + 여백 (최소 MIN_GAP)
    const lead = (r) => maxLevel[r - 1] * LEVEL_STEP + 20;
    const rowY = new Array(n);
    rowY[0] = MARGIN_Y + CARD.h / 2;
    for (let r = 1; r < n; r++) {
      const gap = Math.max(MIN_GAP, lead(r) + lanes[r] * LANE_STEP + 18);
      rowY[r] = rowY[r - 1] + CARD.h + gap;
    }
    for (const b of blocks) b.y = rowY[rankOf.get(b)];

    const busY = new Map();
    for (let r = 1; r < n; r++) {
      const top = rowY[r - 1] + CARD.h / 2;
      // 차선이 적으면 가로 구간을 세대 사이 가운데쯤에 둔다.
      const free = rowY[r] - CARD.h / 2 - top - lead(r) - lanes[r] * LANE_STEP;
      const start = top + lead(r) + Math.max(0, (free - 18) / 2);
      for (const bus of buses[r]) for (const key of bus.keys) busY.set(key, start + bus.lane * LANE_STEP);
    }
    return { busY, height: rowY[n - 1] + CARD.h / 2 + MARGIN_Y };
  }

  // 묶음 가운데에서 그 사람 카드 가운데까지의 가로 거리
  function memberOffset(block, id) {
    return block.index.get(id) * (CARD.w + COUPLE_GAP) + CARD.w / 2 - block.width / 2;
  }

  const NODE_SEP = 28;
  const MARGIN_X = 70;

  // 자녀를 부모 아래로 모은다.
  //   아래로 훑기: 각 묶음을 그 사람의 부모 결혼선 가운데 점 아래로 끌어온다.
  //   위로 훑기  : 각 묶음의 결혼선 가운데 점을 자녀들 가운데로 끌어온다.
  // 같은 줄의 좌우 순서는 dagre가 정한 대로 두고(선 교차를 늘리지 않음), 겹치지 않는 범위에서
  // 원하는 위치와의 차이(제곱합)가 가장 작은 자리를 고른다(가중 단조 회귀, PAV).
  function compact(view, blocks, blockOf) {
    const links = [];
    for (const un of view.unions) {
      const from = blockOf.get(un.partners[0]);
      const rel = un.partners.reduce((sum, p) => sum + memberOffset(from, p), 0) / un.partners.length;
      un.children.forEach((c, childIndex) => {
        const to = blockOf.get(c.id);
        if (!to || to === from) return;
        links.push({ from, rel, to, off: memberOffset(to, c.id), w: c.adoptedOut ? 0.1 : 1, union: un.u.id, childIndex });
      });
    }
    const down = new Map(), up = new Map();
    for (const l of links) {
      if (!down.has(l.to)) down.set(l.to, []);
      if (!up.has(l.from)) up.set(l.from, []);
      down.get(l.to).push(l);
      up.get(l.from).push(l);
    }

    const rankMap = new Map();
    for (const b of blocks) {
      const key = Math.round(b.y);
      if (!rankMap.has(key)) rankMap.set(key, []);
      rankMap.get(key).push(b);
    }
    const ranks = [...rankMap.entries()].sort((a, b) => a[0] - b[0]).map(([, list]) => list);
    for (const list of ranks) list.sort((a, b) => a.x - b.x);

    const place = (list, desiredOf) => {
      const items = list.map((b) => {
        const want = desiredOf(b);
        return want ? { b, d: want.x, w: want.w } : { b, d: b.x, w: 0.05 };
      });
      // 겹치지 않을 최소 간격을 누적해 빼면 '오름차순' 조건만 남는다.
      let acc = 0;
      items.forEach((it, i) => {
        if (i > 0) acc += (items[i - 1].b.width + it.b.width) / 2 + NODE_SEP;
        it.off = acc;
        it.v = it.d - acc;
      });
      const pools = [];
      for (const it of items) {
        pools.push({ v: it.v, w: it.w, n: 1 });
        while (pools.length > 1 && pools[pools.length - 2].v > pools[pools.length - 1].v) {
          const b2 = pools.pop(), a2 = pools.pop();
          const w = a2.w + b2.w;
          pools.push({ v: (a2.v * a2.w + b2.v * b2.w) / w, w, n: a2.n + b2.n });
        }
      }
      let i = 0;
      for (const pl of pools) for (let k = 0; k < pl.n; k++, i++) items[i].b.x = pl.v + items[i].off;
    };
    const mean = (pairs) => {
      if (!pairs.length) return null;
      const w = pairs.reduce((s, p) => s + p.w, 0);
      return { x: pairs.reduce((s, p) => s + p.x * p.w, 0) / w, w };
    };
    const wantFromParents = (b) => mean((down.get(b) || []).map((l) => ({ x: l.from.x + l.rel - l.off, w: l.w })));
    const wantFromChildren = (b) => mean((up.get(b) || []).map((l) => ({ x: l.to.x + l.off - l.rel, w: l.w })));

    // 줄 안의 순서를 부모 위치 기준으로 다시 정한다. 같은 부부의 자녀는 출생 순서대로 붙여 둔다.
    // 부모가 없는 묶음(맨 윗대, 사위·며느리의 친정 등)은 자기 자리를 기준으로 둔다.
    const reorder = (list) => {
      const keyed = list.map((b, i) => {
        const ls = down.get(b) || [];
        const want = wantFromParents(b);
        const main = ls.reduce((best, l) => (!best || l.w > best.w ? l : best), null);
        return { b, i, key: want ? want.x : b.x, union: main ? main.union : '', child: main ? main.childIndex : 0 };
      });
      keyed.sort((p, q) => (p.key - q.key) || (p.union < q.union ? -1 : p.union > q.union ? 1 : 0) || (p.child - q.child) || (p.i - q.i));
      list.splice(0, list.length, ...keyed.map((k) => k.b));
    };
    // 같은 부부의 자녀는 부모 결혼선 아래에 같은 키로 모이므로, 정렬하면 서로 붙게 된다.
    for (let pass = 0; pass < 4; pass++) {
      for (const list of ranks) { reorder(list); place(list, wantFromParents); }
      for (const list of [...ranks].reverse()) place(list, wantFromChildren);
    }
    for (const list of ranks) { reorder(list); place(list, wantFromParents); }

    // 왼쪽 여백을 맞추고 전체 폭을 구한다.
    const minX = Math.min(...blocks.map((b) => b.x - b.width / 2));
    const maxX = Math.max(...blocks.map((b) => b.x + b.width / 2));
    for (const b of blocks) b.x += MARGIN_X - minX;
    return { width: maxX - minX + 2 * MARGIN_X };
  }

  G.CARD = CARD;
  G.coreSet = coreSet;
  G.buildView = buildView;
  G.layout = layout;
})(globalThis.Genealogy = globalThis.Genealogy || {});
