// 화면에 그릴 그래프를 만들고 dagre로 배치한다.
//
// 숨겨진 인물(미상 숨기기, 외가·처가 끄기)이 계보 중간에 있으면, 그 아래에서 처음
// 보이는 후손을 위쪽 혼인 노드에 바로 잇고 건너뛴 세대 수를 기록한다.
// 양자는 양가 혼인에서 내려오는 선(adopt)과 생가 혼인에서 내려오는 선(adoptedOut)을 함께 그린다.
// 서버 없이 file://로도 열리도록 모듈 대신 전역 Genealogy 객체에 등록한다.
(function (G) {
  'use strict';

  const CARD = { w: 156, h: 74 };
  const UNION = 8;

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

  function buildView(model, { hideUnknown, showInlaws, core }) {
    const visible = (id) => {
      if (hideUnknown && model.isUnknown(id)) return false;
      if (!showInlaws && !core.has(id)) return false;
      return true;
    };

    const nodes = [];
    const edges = [];
    for (const [id] of model.persons) if (visible(id)) nodes.push({ id, kind: 'person' });

    const unionVisible = (u) => [u.husband, u.wife].some((p) => p && visible(p));

    // 숨겨진 인물 c 아래에서 처음 보이는 후손들을 찾는다.
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

    for (const [uid, u] of model.unions) {
      if (!unionVisible(u)) continue;
      nodes.push({ id: uid, kind: 'union', union: u });
      for (const p of [u.husband, u.wife]) {
        if (p && visible(p)) edges.push({ from: p, to: uid, kind: 'partner', union: u, partner: p });
      }
      for (const c of model.unionChildren(u, 'all')) {
        const adopt = u.adoptees.includes(c);
        const adoptedOut = !adopt && model.isAdopted(c);
        if (visible(c)) edges.push({ from: uid, to: c, kind: 'child', union: u, gap: !!u.gap, adopt, adoptedOut });
        else for (const d of descendThrough(c, 1, [])) {
          edges.push({ from: uid, to: d.id, kind: 'child', union: u, skipped: d.skipped });
        }
      }
    }
    return { nodes, edges };
  }

  function layout(view) {
    const g = new window.dagre.graphlib.Graph();
    g.setGraph({ rankdir: 'TB', nodesep: 22, ranksep: 30, edgesep: 8, marginx: 70, marginy: 24 });
    g.setDefaultEdgeLabel(() => ({}));
    for (const n of view.nodes) {
      const size = n.kind === 'person' ? CARD : { w: UNION, h: UNION };
      g.setNode(n.id, { width: size.w, height: size.h });
    }
    for (const e of view.edges) {
      // 생가에서 출계한 선은 배치에 약하게만 반영해 양자가 양가 쪽에 놓이게 한다.
      const weight = e.kind === 'partner' ? 4 : e.adoptedOut ? 0.2 : 1;
      g.setEdge(e.from, e.to, { weight, minlen: 1 });
    }
    window.dagre.layout(g);
    const pos = new Map();
    for (const id of g.nodes()) {
      const n = g.node(id);
      pos.set(id, { x: n.x, y: n.y, w: n.width, h: n.height });
    }
    const gr = g.graph();
    return { pos, width: gr.width, height: gr.height };
  }

  G.CARD = CARD;
  G.coreSet = coreSet;
  G.buildView = buildView;
  G.layout = layout;
})(globalThis.Genealogy = globalThis.Genealogy || {});
