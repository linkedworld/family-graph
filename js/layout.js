// 화면에 그릴 그래프를 만들고 dagre로 배치한다.
//
// - 부부(한 사람과 그 배우자들)를 하나의 '부부 묶음'으로 나란히 놓는다. 배우자가 여럿이면
//   혼인 순서대로 오른쪽·왼쪽에 번갈아 둔다(첫 배우자는 오른쪽).
// - 결혼선은 두 사람 카드 아래를 잇는 ㄷ자 선이고, 그 가운데에서 자녀선이 내려간다.
//   한 묶음 안에서 결혼선이 겹치지 않도록 층(level)을 나눈다.
// - 숨겨진 인물(미상 숨기기, 외가·처가 끄기)이 계보 중간에 있으면, 그 아래에서 처음
//   보이는 후손을 위쪽 혼인에 바로 잇고 건너뛴 세대 수를 기록한다.
// - 양자는 양가 혼인에서 내려오는 선(adopt)과 생가 혼인에서 내려오는 선(adoptedOut)을 함께 그린다.
// 서버 없이 file://로도 열리도록 모듈 대신 전역 Genealogy 객체에 등록한다.
(function (G) {
  'use strict';

  const CARD = { w: 156, h: 74 };
  const COUPLE_GAP = 18;   // 부부 묶음 안 카드 사이 간격
  const LEVEL_STEP = 9;    // 결혼선 층 사이 간격
  const RANK_SEP = 64;     // 세대(줄) 사이 간격: 결혼선과 자녀선이 들어갈 자리

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

    const pos = new Map();
    for (const b of blocks) {
      const n = g.node(b.id);
      const left = n.x - b.width / 2;
      b.order.forEach((id, i) => {
        pos.set(id, { x: left + i * (CARD.w + COUPLE_GAP) + CARD.w / 2, y: n.y, w: CARD.w, h: CARD.h });
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
      unions.push({ ...un, level, bottom, drop: { x, y }, xs: ps.map((p) => p.x) });
    }

    const gr = g.graph();
    return { pos, unions, blocks, width: gr.width, height: gr.height };
  }

  G.CARD = CARD;
  G.coreSet = coreSet;
  G.buildView = buildView;
  G.layout = layout;
})(globalThis.Genealogy = globalThis.Genealogy || {});
