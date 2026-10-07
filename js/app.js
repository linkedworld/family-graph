(function () {
'use strict';

const { buildModel, Kinship, buildView, layout, coreSet, CARD } = window.Genealogy;


const SVGNS = 'http://www.w3.org/2000/svg';
const KIND_ORDER = { self: 0, blood: 1, spouse: 2, affinal: 3, sadon: 4, distant: 5, none: 6 };

// 브라우저 캐시 때문에 예전 index.html과 새 스크립트가 섞여도 멈추지 않도록, 없는 요소는
// 화면에 붙지 않은 빈 요소로 대신한다(그 기능만 동작하지 않고 가계도는 그려진다).
const missing = new Map();
const $ = (id) => document.getElementById(id) || missing.get(id) ||
  (missing.set(id, document.createElement('div')), console.warn(`#${id} 요소가 없습니다`), missing.get(id));
const svg = $('tree');

const state = {
  model: null, kin: null, core: null,
  ego: null, selected: null,
  hideUnknown: false, showInlaws: true, // 외가·처가는 기본으로 보인다
  fold: true, // 자손이 이어지지 않는 형제가 많으면 여러 줄로 접는다
  // 접기·펴기: 기본은 기준 인물의 직계와 그 배우자만 보이고, 나머지 자녀는 접혀 있다.
  expanded: new Set(), // 자녀를 펼친 사람
  expandAll: false,
  showLine: true, // 정통 표시: 종통(대를 잇는 맏아들) 줄기, 맏아들·맏딸, 이름난 인물
  lineMode: 'paternal', // 직계 표시: paternal(부계만, 기본) | both(부계·모계) | none
  lay: null, view: null,
  t: { k: 1, x: 0, y: 0 },
};

function el(name, attrs = {}, parent) {
  const e = document.createElementNS(SVGNS, name);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  if (parent) parent.appendChild(e);
  return e;
}

function h(tag, attrs = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null) continue;
    if (k === 'class') e.className = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v);
  }
  for (const k of kids.flat()) if (k != null && k !== false) e.append(k);
  return e;
}

function chonText(r) {
  if (r.kind === 'self') return '';
  if (r.chon === 0) return '무촌';
  return r.chon != null ? `${r.chon}촌` : '';
}

function years(p) {
  if (p.placeholder) return '기록 없음';
  if (!p.birth && !p.death) return '생몰년 미상';
  return `${p.birth ?? '?'}–${p.death ?? '?'}`;
}

// ── 다이어그램 ────────────────────────────────────────────

// 표시 옵션(미상 숨기기, 외가·처가)을 통과하는 사람
function passesFilters(id) {
  const { model } = state;
  if (state.hideUnknown && model.isUnknown(id)) return false;
  if (!state.showInlaws && !state.core.has(id)) return false;
  return true;
}

// 접기·펴기 상태에 따라 보일 사람을 정한다.
//   직계(조상·자손)는 항상 보이고, 펼친 사람의 자녀가 더해지며, 보이는 사람의 배우자도 보인다.
function computeShown() {
  const { model, kin } = state;
  const rels = new Map();
  const shown = new Set();
  for (const [id] of model.persons) {
    const r = kin.relation(state.ego, id);
    rels.set(id, r);
    if (id === state.ego || (r.kind === 'blood' && r.path && (r.path.up === 0 || r.path.down === 0))) shown.add(id);
  }
  const lineal = new Set(shown);
  // 정통: 종통 줄기와 이름난 인물은 접혀 있어도 보이고, 그 사람에게 이어지는 조상 길도 함께 보인다.
  const heir = computeHeirLines();
  if (state.showLine) {
    const must = [...heir.members, ...state.notable];
    const addPath = (id) => {
      if (shown.has(id) || !model.get(id)) return;
      shown.add(id);
      for (const p of model.parents(id, 'legal')) addPath(p);
    };
    for (const id of must) addPath(id);
  }
  const queue = [...shown];
  while (queue.length) {
    const id = queue.pop();
    if (!state.expandAll && !state.expanded.has(id)) continue;
    for (const c of model.children(id, 'all')) if (!shown.has(c)) { shown.add(c); queue.push(c); }
  }
  for (const id of [...shown]) for (const s of model.spouses(id)) shown.add(s.id);
  return { shown, lineal, rels, heir };
}

// 종통 줄기: 시조 쪽 맨 윗대 조상과 이름난 남자 인물마다, 대를 잇는 아들을 따라 내려간 흐름.
// members: 줄기에 든 사람, edges: '아버지>아들' 연결
function computeHeirLines() {
  const { model } = state;
  const members = new Set();
  const edges = new Set();
  const starts = [state.root, ...state.notable.filter((id) => model.get(id)?.gender === 'M')];
  for (const s of starts) {
    const line = model.heirLine(s);
    if (line.length < 2) continue;
    line.forEach((id, i) => {
      members.add(id);
      if (i > 0) edges.add(`${line[i - 1]}>${id}`);
    });
  }
  return { members, edges };
}

// 접혀 있는 사람이 보이도록 그 사람의 조상을 따라 펼친다.
function reveal(id) {
  const { model } = state;
  if (!state.core.has(id) && !state.showInlaws) { state.showInlaws = true; $('showInlaws').checked = true; }
  if (model.isUnknown(id) && state.hideUnknown) { state.hideUnknown = false; $('hideUnknown').checked = false; }
  const seen = new Set();
  const up = (x) => {
    for (const p of [...model.parents(x, 'legal'), ...model.parents(x, 'birth')]) {
      if (seen.has(p)) continue;
      seen.add(p);
      state.expanded.add(p);
      up(p);
    }
  };
  up(id);
  // 배우자로만 이어진 사람(예: 며느리)은 그 배우자 쪽 길을 펼친다.
  for (const s of model.spouses(id)) up(s.id);
}

function toggleExpand(id) {
  if (state.expanded.has(id) || state.expandAll) {
    if (state.expandAll) {
      // '모두 펼치기' 상태에서 하나를 접으면, 지금 보이는 사람을 펼친 상태로 옮긴 뒤 그 사람만 접는다.
      state.expandAll = false;
      for (const p of state.shown) state.expanded.add(p);
    }
    state.expanded.delete(id);
  } else {
    state.expanded.add(id);
  }
  render();
  renderRelations();
}

function render({ refit = false } = {}) {
  const { model, kin } = state;
  const { shown, lineal: linealAll, rels: allRels, heir } = computeShown();
  state.heir = heir;
  state.shown = shown;
  state.view = buildView(model, { hideUnknown: state.hideUnknown, showInlaws: state.showInlaws, core: state.core, keep: shown });
  state.view.fold = state.fold;
  // 배치용 직계 줄기: 기준 인물과 부계 직계(조상·자손). 이 사람들의 카드를 세로로 맞춘다.
  const trunk = new Set([state.ego]);
  for (const id of state.view.persons) {
    const r = allRels.get(id);
    if (r.kind !== 'blood' || !r.path || (r.path.up !== 0 && r.path.down !== 0)) continue;
    const mids = r.path.up > 0 ? r.path.asc.slice(0, -1) : r.path.desc.slice(0, -1);
    if (mids.every((m) => model.get(m).gender === 'M')) trunk.add(id);
  }
  state.view.trunk = trunk;
  state.view.male = (id) => model.get(id).gender === 'M';
  state.lay = layout(state.view);
  const { pos } = state.lay;

  svg.replaceChildren();
  const vp = el('g', { class: 'viewport' }, svg);
  const gEdges = el('g', {}, vp);
  const gLabels = el('g', {}, vp);
  const gNodes = el('g', {}, vp);

  // 결혼선: 두 사람 카드 아래를 잇는 ㄷ자 선. 가운데 점(drop)에서 자녀선이 내려간다.
  // 기준 인물의 직계(조상·자손). 족보 계통(양가) 기준 혈족 중 위로만 또는 아래로만 이어진 사람을
  // 부계(P: 중간에 남자만 거침 — 아버지·할아버지와 그 부인, 아들 계통 자손)와
  // 모계(M: 어머니 쪽 조상, 딸을 거친 자손)로 나눈다. 표시 범위는 '직계 표시' 설정을 따른다.
  const rels = allRels;
  const line = new Map();
  if (state.lineMode !== 'none') {
    for (const id of state.view.persons) {
      const r = rels.get(id);
      if (id === state.ego) { line.set(id, 'P'); continue; }
      if (r.kind !== 'blood' || !r.path || (r.path.up !== 0 && r.path.down !== 0)) continue;
      const mids = r.path.up > 0 ? r.path.asc.slice(0, -1) : r.path.desc.slice(0, -1);
      const cat = mids.every((m) => model.get(m).gender === 'M') ? 'P' : 'M';
      if (cat === 'P' || state.lineMode === 'both') line.set(id, cat);
    }
  }
  const lineal = { has: (id) => line.has(id) };
  // 직계 줄기는 다른 선 위에 보이도록 따로 모았다가 마지막에 붙인다.
  const gLineal = el('g', {});
  // 종통 줄기(겹선)는 일반 선 위, 직계 줄기 아래에 그린다.
  const gHeir = el('g', {});
  const fatherOf = (un) => un.u.husband;

  for (const un of state.lay.unions) {
    const cls = ['edge', 'marriage'];
    if (un.u.type === '첩') cls.push('concubine');
    // 직계가 이 혼인을 지나 자녀로 이어지면 결혼선도 직계 줄기로 표시한다.
    const linealUnion = un.partners.some((p) => lineal.has(p)) && un.children.some((c) => lineal.has(c.id));
    // 부모 쪽과 자녀 쪽이 모두 부계면 부계 줄기, 그 밖에는 모계 줄기
    const unionCat = un.partners.some((p) => line.get(p) === 'P') && un.children.some((c) => line.get(c.id) === 'P') ? 'P' : 'M';
    if (linealUnion) cls.push('lineal', unionCat === 'M' ? 'maternal' : 'paternal');
    const { bottom, drop } = un;
    const d = un.xs.length === 2
      ? `M${un.xs[0]} ${bottom} V${drop.y} H${un.xs[1]} V${bottom}`
      : `M${un.xs[0]} ${bottom} V${drop.y}`;
    el('path', { class: cls.join(' '), d }, linealUnion ? gLineal : gEdges);
    if (un.children.length) {
      const dotCls = linealUnion ? `union-dot lineal ${unionCat === 'M' ? 'maternal' : 'paternal'}` : 'union-dot';
      el('circle', { class: dotCls, cx: drop.x, cy: drop.y, r: linealUnion ? 3.4 : 2.6 }, gNodes);
    }

    for (const c of un.children) {
      const b = pos.get(c.id);
      if (!b) continue;
      const top = b.y - b.h / 2;
      const bus = c.busY ?? top - 12;
      const ecls = ['edge'];
      if (c.skipped) ecls.push('skipped');
      if (c.gap) ecls.push('gap');
      if (c.adopt) ecls.push('adopt');
      if (c.adoptedOut) ecls.push('adopted-out');
      const linealEdge = linealUnion && lineal.has(c.id) && !c.adoptedOut;
      if (linealEdge) {
        const cat = line.get(c.id) === 'P' && un.partners.some((p) => line.get(p) === 'P') ? 'paternal' : 'maternal';
        ecls.push('lineal', cat);
      }
      // 직계 줄기로 세로 정렬된 자녀는 직계 부모 카드에서 곧게 내려간다.
      const trunk = state.view.trunk;
      const straight = c.spineX == null && !c.adoptedOut && trunk.has(c.id)
        && un.partners.some((p, i) => trunk.has(p) && Math.abs(un.xs[i] - b.x) < 3);
      // 접힌 형제는 열 왼쪽 줄기선을 따라 내려가 카드 왼쪽으로 들어간다.
      const d = straight
        ? `M${b.x} ${bottom} V${top}`
        : c.spineX != null
          ? `M${drop.x} ${drop.y} V${bus} H${c.spineX} V${b.y} H${b.x - b.w / 2}`
          : `M${drop.x} ${drop.y} V${bus} H${b.x} V${top}`;
      if (state.showLine && state.heir.edges.has(`${fatherOf(un)}>${c.id}`)) {
        el('path', { class: 'heir-outer', d }, gHeir);
        el('path', { class: 'heir-inner', d }, gHeir);
      }
      el('path', { class: ecls.join(' '), d }, linealEdge ? gLineal : gEdges);
      if (c.adopt || c.adoptedOut) {
        // 같은 카드로 양자선과 출계선이 함께 들어오므로 '양자'는 왼쪽, '출계'는 오른쪽에 둔다.
        const text = c.adopt ? '양자' : '출계';
        const ly = top - 4;
        const lx = c.adopt ? b.x - 31 : b.x + 3;
        el('rect', { class: 'skip-label-bg', x: lx, y: ly - 10, width: 28, height: 13, rx: 3 }, gLabels);
        const t = el('text', { class: c.adopt ? 'adopt-label' : 'skip-label', x: lx + 3, y: ly }, gLabels);
        t.textContent = text;
      }
      if (c.skipped) {
        const text = `${c.skipped}대 미상`;
        const ly = (drop.y + bus) / 2;
        el('rect', { class: 'skip-label-bg', x: drop.x + 4, y: ly - 9, width: text.length * 9 + 6, height: 16, rx: 3 }, gLabels);
        const t = el('text', { class: 'skip-label', x: drop.x + 7, y: ly + 3 }, gLabels);
        t.textContent = text;
      }
    }
  }

  gEdges.appendChild(gHeir);
  gEdges.appendChild(gLineal);

  // 접기·펴기 단추: 숨은 자녀 수(+N), 펼친 자녀가 있으면 접기(−)
  // 단추는 부부 중 아버지 카드에만 붙인다(아버지가 화면에 없을 때만 어머니 카드에).
  const owner = (child, parentId) => {
    for (const mode of ['legal', 'birth']) {
      const f = model.father(child, mode), mo = model.mother(child, mode);
      if (f === parentId || mo === parentId) return f && shown.has(f) && passesFilters(f) ? f : mo;
    }
    return parentId;
  };
  const toggles = new Map();
  for (const id of state.view.persons) {
    const kids = model.children(id, 'all').filter((c) => passesFilters(c) && owner(c, id) === id);
    const hidden = kids.filter((c) => !shown.has(c)).length;
    const opened = (state.expandAll || state.expanded.has(id)) && kids.some((c) => shown.has(c) && !linealAll.has(c));
    if (hidden) toggles.set(id, `+${hidden}`);
    else if (opened) toggles.set(id, '−');
  }
  for (const id of state.view.persons) {
    drawCard(gNodes, id, pos.get(id), rels.get(id), line.get(id), toggles.get(id));
  }

  applyTransform();
  if (refit) fit();
}

// 친정 형제가 한 명만 기록된 사람(다른 집에서 들어온 배우자 등)은 외아들·외동딸로 단정하지 않는다.
function birthOrderShown(id) {
  const order = state.model.birthOrder(id);
  if (!order) return null;
  if (order.sons + order.daughters === 1 && !state.lineage.has(id)) return null;
  return order;
}

function drawCard(parent, id, p, rel, isLineal, toggle) {
  const { model } = state;
  const person = model.get(id);
  const unknown = model.isUnknown(id);
  const cls = ['card'];
  if (unknown) cls.push('unknown');
  if (person.gender === 'M') cls.push('male');
  else if (person.gender === 'F') cls.push('female');
  if (id === state.ego) cls.push('ego');
  else if (isLineal) cls.push('lineal', isLineal === 'M' ? 'maternal' : 'paternal');
  if (id === state.selected) cls.push('selected');
  const g = el('g', { class: cls.join(' '), transform: `translate(${p.x - CARD.w / 2} ${p.y - CARD.h / 2})`, tabindex: 0, role: 'button' }, parent);
  g.dataset.id = id;
  el('rect', { class: 'box', width: CARD.w, height: CARD.h, rx: 3 }, g);
  // 남녀를 구분하는 왼쪽 색 띠
  el('rect', { class: 'gender-bar', x: 0.5, y: 0.5, width: 4, height: CARD.h - 1, rx: 2 }, g);

  const name = el('text', { class: 'name', x: 12, y: 22 }, g);
  name.textContent = model.displayName(id);
  const sub = person.hanja || (model.isNameless(id) ? '이름 미상' : '');
  if (sub) {
    const ts = el('tspan', { class: 'hanja', dx: 5 }, name);
    ts.textContent = sub;
  }

  const termText = id === state.ego ? '기준 인물' : rel.term;
  const term = el('text', { class: 'term', x: 12, y: 44 }, g);
  const room = CARD.w - 22 - (rel.chon != null ? 34 : 0);
  term.textContent = fitText(termText, room, 12);
  term.style.fontSize = `${fontFor(termText, room, 12)}px`;

  const chon = el('text', { class: 'chon', x: CARD.w - 10, y: 44, 'text-anchor': 'end' }, g);
  chon.textContent = chonText(rel);

  const yr = el('text', { class: 'years', x: 12, y: 63 }, g);
  yr.textContent = years(person);
  if (person.gen != null) {
    const t = el('text', { class: 'years', x: CARD.w - 10, y: 63, 'text-anchor': 'end' }, g);
    t.textContent = `${person.gen}世`;
  }
  // 넷째 줄: 출생 순서 ('7남 1녀 중 여덟째', '2남 1녀 중 장남' …). 정통 표시에서는 맏아들·맏딸을 강조한다.
  const order = birthOrderShown(id);
  if (order) {
    const first = state.showLine && order.k === 1 && order.sons + order.daughters > 1;
    const t = el('text', { class: first ? 'order firstborn' : 'order', x: 12, y: 81 }, g);
    t.textContent = fitText(order.full, CARD.w - 22, 11);
    t.style.fontSize = `${fontFor(order.full, CARD.w - 22, 11)}px`;
  }

  if (toggle) {
    // 카드 밖 오른쪽 아래 글자 단추: +N(숨은 자녀 펼치기) / −(접기). 배경·테두리 없이 글자만 그리고,
    // 누르기 쉽게 보이지 않는 넓은 영역(hit)을 깐다. 결혼선은 카드 가운데서 LEVEL_BASE 아래로 내려가므로 겹치지 않는다.
    const btn = el('g', { class: `fold-btn${toggle === '−' ? ' open' : ''}`, role: 'button', tabindex: 0,
      'aria-label': toggle === '−' ? '자녀 접기' : `자녀 ${toggle.slice(1)}명 펼치기` }, g);
    const narrow = isNarrow();
    const [hw, hh] = narrow ? [52, 30] : [40, 20];
    el('rect', { class: 'hit', x: CARD.w - hw + 6, y: CARD.h - 2, width: hw, height: hh, rx: 4 }, btn);
    const bt = el('text', { x: CARD.w + 2, y: CARD.h + (narrow ? 15 : 12), 'text-anchor': 'end' }, btn);
    if (narrow) bt.style.fontSize = '15px';
    bt.textContent = toggle;
    const stop = (ev) => ev.stopPropagation();
    btn.addEventListener('click', (ev) => { stop(ev); if (!state.suppressClick) toggleExpand(id); });
    btn.addEventListener('dblclick', stop);
    btn.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { stop(ev); ev.preventDefault(); toggleExpand(id); } });
  }

  // 정통 표시: 宗(종통 줄기), 名(이름난 인물). 오른쪽 위에서 왼쪽으로 차례로 붙인다.
  if (state.showLine) {
    const marks = [];
    if (state.heir.members.has(id)) marks.push(['宗', 'mark-heir', '종통을 이은 사람']);
    if (state.notable.includes(id)) marks.push(['名', 'mark-notable', '이름난 인물']);
    let mx = CARD.w - 22 - (id === state.ego ? 19 : 0);
    for (const [ch, cls, title] of marks) {
      const mg = el('g', { class: cls }, g);
      el('rect', { x: mx, y: 7, width: 15, height: 15, rx: 1.5 }, mg);
      const mt = el('text', { x: mx + 7.5, y: 18.5, 'text-anchor': 'middle' }, mg);
      mt.textContent = ch;
      el('title', {}, mg).textContent = title;
      mx -= 19;
    }
  }

  if (id === state.ego) {
    el('rect', { class: 'seal', x: CARD.w - 22, y: 7, width: 15, height: 15, rx: 1.5 }, g);
    const s = el('text', { class: 'seal-text', x: CARD.w - 14.5, y: 18.5, 'text-anchor': 'middle' }, g);
    s.textContent = '基';
  }

  const tip = el('title', {}, g);
  tip.textContent = `${model.displayName(id)} · ${termText}${rel.alt ? ` (${rel.alt})` : ''}`;

  g.addEventListener('click', () => { if (!state.suppressClick) select(id); });
  g.addEventListener('dblclick', () => setEgo(id));
  g.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter') { ev.shiftKey ? setEgo(id) : select(id); }
  });
}

// 한글 한 글자를 대략 글꼴 크기만큼의 폭으로 보고 줄이거나 말줄임한다.
function fontFor(text, room, base) {
  const need = text.length * base;
  return need <= room ? base : Math.max(9.5, room / text.length);
}
function fitText(text, room, base) {
  const size = fontFor(text, room, base);
  const max = Math.floor(room / size);
  return text.length <= max ? text : `${text.slice(0, max - 1)}…`;
}

// ── 확대·이동 ────────────────────────────────────────────

function applyTransform() {
  const vp = svg.querySelector('.viewport');
  if (vp) vp.setAttribute('transform', `translate(${state.t.x} ${state.t.y}) scale(${state.t.k})`);
}

function fit() {
  const r = svg.getBoundingClientRect();
  const { width, height } = state.lay;
  const k = Math.min(r.width / width, r.height / height, 1.1);
  state.t = { k, x: (r.width - width * k) / 2, y: Math.max(8, (r.height - height * k) / 2) };
  applyTransform();
}

function zoomAt(factor, cx, cy) {
  const t = state.t;
  const k = Math.min(3, Math.max(0.15, t.k * factor));
  const f = k / t.k;
  state.t = { k, x: cx - (cx - t.x) * f, y: cy - (cy - t.y) * f };
  applyTransform();
}

function centerOn(id, zoom) {
  const p = state.lay.pos.get(id);
  if (!p) return;
  const r = svg.getBoundingClientRect();
  const k = zoom ?? Math.max(state.t.k, 0.7);
  state.t = { k, x: r.width / 2 - p.x * k, y: r.height / 2 - p.y * k };
  applyTransform();
}

// 마우스·터치 공통: 한 손가락(또는 마우스)으로 끌어 이동, 두 손가락으로 확대·축소.
// 카드 위에서 시작해도 끌 수 있고, 거의 움직이지 않았을 때만 카드 클릭으로 본다.
function setupPanZoom() {
  const pts = new Map();
  let gesture = null;
  const local = (ev) => { const r = svg.getBoundingClientRect(); return [ev.clientX - r.left, ev.clientY - r.top]; };
  const start = () => {
    const [a, b] = [...pts.values()];
    gesture = b
      ? { kind: 'pinch', t: { ...state.t }, dist: Math.hypot(a[0] - b[0], a[1] - b[1]), mid: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], moved: true }
      : { kind: 'pan', t: { ...state.t }, from: a, moved: false };
  };
  svg.addEventListener('pointerdown', (ev) => {
    pts.set(ev.pointerId, local(ev));
    if (pts.size > 2) return;
    start();
  });
  svg.addEventListener('pointermove', (ev) => {
    if (!pts.has(ev.pointerId) || !gesture) return;
    pts.set(ev.pointerId, local(ev));
    if (gesture.kind === 'pan') {
      const [x, y] = pts.values().next().value;
      const dx = x - gesture.from[0], dy = y - gesture.from[1];
      if (!gesture.moved && Math.hypot(dx, dy) < 6) return;
      if (!gesture.moved) { gesture.moved = true; svg.setPointerCapture(ev.pointerId); svg.classList.add('dragging'); }
      state.t = { ...gesture.t, x: gesture.t.x + dx, y: gesture.t.y + dy };
    } else {
      const [a, b] = [...pts.values()];
      const k = Math.min(3, Math.max(0.15, gesture.t.k * Math.hypot(a[0] - b[0], a[1] - b[1]) / gesture.dist));
      const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      const f = k / gesture.t.k;
      state.t = { k, x: mid[0] - (gesture.mid[0] - gesture.t.x) * f, y: mid[1] - (gesture.mid[1] - gesture.t.y) * f };
    }
    applyTransform();
  });
  const end = (ev) => {
    if (!pts.has(ev.pointerId)) return;
    pts.delete(ev.pointerId);
    // 끌기가 끝난 직후의 click은 카드 선택으로 처리하지 않는다.
    if (gesture?.moved) { state.suppressClick = true; setTimeout(() => { state.suppressClick = false; }, 0); }
    svg.classList.remove('dragging');
    if (pts.size === 1) start(); else gesture = null;
  };
  svg.addEventListener('pointerup', end);
  svg.addEventListener('pointercancel', end);
  svg.addEventListener('wheel', (ev) => {
    ev.preventDefault();
    const r = svg.getBoundingClientRect();
    zoomAt(ev.deltaY < 0 ? 1.12 : 1 / 1.12, ev.clientX - r.left, ev.clientY - r.top);
  }, { passive: false });
  const mid = () => { const r = svg.getBoundingClientRect(); return [r.width / 2, r.height / 2]; };
  $('zoomIn').addEventListener('click', () => zoomAt(1.25, ...mid()));
  $('zoomOut').addEventListener('click', () => zoomAt(1 / 1.25, ...mid()));
  $('zoomFit').addEventListener('click', fit);
}

// ── 휴대폰: 설정 펼치기, 아래쪽 시트 ─────────────────────

const isNarrow = () => window.matchMedia('(max-width: 820px)').matches;

function setSheet(open) {
  document.body.classList.toggle('sheet-open', open);
  $('sheetHandle').setAttribute('aria-expanded', String(open));
}

function renderSheetSummary() {
  const id = state.selected;
  if (!id) return;
  const r = state.kin.relation(state.ego, id);
  const term = id === state.ego ? '기준 인물' : r.term;
  const chon = chonText(r);
  $('sheetName').textContent = state.model.displayName(id);
  $('sheetTerm').textContent = chon ? `${term} · ${chon}` : term;
}

function setupMobile() {
  $('toggleControls').addEventListener('click', () => {
    const open = document.querySelector('.bar').classList.toggle('open');
    $('toggleControls').setAttribute('aria-expanded', String(open));
  });
  $('sheetHandle').addEventListener('click', () => setSheet(!document.body.classList.contains('sheet-open')));
}

// ── 패널 ────────────────────────────────────────────────

function select(id) {
  state.selected = id;
  for (const c of svg.querySelectorAll('.card')) c.classList.toggle('selected', c.dataset.id === id);
  renderDetail();
}

function setEgo(id) {
  state.ego = id;
  state.selected = id;
  $('ego').value = id;
  // 숨김 옵션 때문에 기준 인물이 안 보이면 옵션을 풀어서 보여 준다.
  if (!state.core.has(id) && !state.showInlaws) { state.showInlaws = true; $('showInlaws').checked = true; }
  if (state.model.isUnknown(id) && state.hideUnknown) { state.hideUnknown = false; $('hideUnknown').checked = false; }
  render();
  centerOn(id);
  if (isNarrow()) setSheet(false); // 휴대폰에서는 시트를 닫아 바뀐 호칭을 바로 보이게 한다
  renderDetail();
  renderRelations();
}

function personLabel(id) {
  const { model } = state;
  const p = model.get(id);
  return p.hanja ? `${model.displayName(id)}(${p.hanja})` : model.displayName(id);
}

function renderDetail() {
  renderSheetSummary();
  const { model, kin } = state;
  const id = state.selected;
  const box = $('detail');
  if (!id) { box.replaceChildren(); return; }
  const p = model.get(id);
  const rel = kin.relation(state.ego, id);
  const isEgo = id === state.ego;

  const rows = [];
  const add = (k, v) => { if (v) rows.push(h('dt', {}, k), h('dd', {}, v)); };
  add('본관', p.clan && (p.clanHanja ? `${p.clan}(${p.clanHanja})` : p.clan));
  add('세(世)', p.gen != null ? `${p.gen}세` : null);
  const order = birthOrderShown(id);
  if (order) {
    const parent = model.father(id) || model.mother(id);
    add('출생 순서', `${personLabel(parent)}의 ${order.full}`);
  }
  add('생몰년', years(p));
  add('자', p.courtesy);
  add('호', p.pen);
  add('관직·칭호', p.title);
  const parents = model.parents(id).map(personLabel);
  if (model.isAdopted(id)) {
    add('양부모', parents.join(', '));
    add('생부모', model.parents(id, 'birth').map(personLabel).join(', '));
  } else {
    add('부모', parents.join(', '));
  }
  const spouses = model.spouses(id).map((s) => {
    const extra = [s.union.type !== '정실' ? s.union.type : null, s.union.note].filter(Boolean).join(', ');
    return extra ? `${personLabel(s.id)} – ${extra}` : personLabel(s.id);
  });
  add('배우자', spouses.join(' / '));
  // 자녀는 태어난 순서대로, 출생 순서(장남·차녀·셋째…)를 붙여 보여 준다.
  const kids = model.orderedChildren(id, 'all').map((c) => {
    const ch = model.get(c);
    const order = model.birthOrder(c);
    const notes = [order && model.parents(c).includes(id) ? order.label : null];
    if (ch.adoptiveUnion) notes.push(model.parents(c).includes(id) ? '양자' : '출계');
    const extra = notes.filter(Boolean).join(', ');
    return extra ? `${personLabel(c)} (${extra})` : personLabel(c);
  });
  add('자녀', kids.join(', '));

  const path = isEgo ? null : kin.describe(state.ego, id);
  const sources = (p.sources || []).map((s) => model.meta.sources?.[s]).filter(Boolean);

  box.replaceChildren(...[
    h('h2', {}, '선택한 인물'),
    h('div', { class: 'who' },
      h('h3', {}, model.displayName(id)),
      p.hanja ? h('span', { class: 'hj' }, p.hanja) : null,
      model.isUnknown(id) ? h('span', { class: 'tag' }, '미상') : null,
      model.isNameless(id) ? h('span', { class: 'tag' }, '이름 미상') : null),
    h('div', { class: 'rel' },
      h('b', {}, isEgo ? '기준 인물' : rel.term),
      rel.alt && !isEgo ? h('span', {}, rel.alt) : null,
      chonText(rel) ? h('span', { class: 'c' }, chonText(rel)) : null),
    !isEgo ? h('p', { class: 'rel-note' },
      `${personLabel(state.ego)} 기준` + (path && path !== rel.term ? ` · ${path}` : '') +
      (rel.detail ? ` · ${rel.detail}` : '')) : null,
    h('dl', {}, rows),
    p.note ? h('p', { class: 'note' }, p.note) : null,
    sources.length ? h('p', { class: 'src' }, '출처: ',
      ...sources.flatMap((s, i) => [i ? ', ' : '', h('a', { href: s.url, target: '_blank', rel: 'noopener' }, s.title)])) : null,
    h('button', { type: 'button', disabled: isEgo ? '' : null, onclick: () => setEgo(id) },
      isEgo ? '현재 기준 인물' : '이 인물을 기준으로'),
  ].filter(Boolean));
}

function renderRelations() {
  const { model, kin } = state;
  // 접혀 있는 사람도 목록에 보이고, 누르면 그 사람까지 펼친다.
  const ids = [...model.persons.keys()].filter((id) => id !== state.ego && passesFilters(id));
  const rows = ids.map((id) => ({ id, r: kin.relation(state.ego, id) }));
  rows.sort((a, b) => (KIND_ORDER[a.r.kind] - KIND_ORDER[b.r.kind]) ||
    ((a.r.chon ?? 99) - (b.r.chon ?? 99)) ||
    (parseInt(model.get(a.id).birth, 10) || 9999) - (parseInt(model.get(b.id).birth, 10) || 9999));
  $('relRows').replaceChildren(...rows.map(({ id, r }) => h('tr', {
    class: [model.isUnknown(id) ? 'is-unknown' : '', state.shown.has(id) ? '' : 'is-folded'].join(' ').trim(),
    onclick: () => {
      if (!state.shown.has(id)) { reveal(id); render(); renderRelations(); }
      select(id); centerOn(id); if (isNarrow()) setSheet(false);
    },
  },
  h('td', {}, model.displayName(id)),
  h('td', {}, r.term, r.alt ? h('span', { class: 'alt' }, r.alt) : null),
  h('td', { class: 'num' }, chonText(r)))));
}

// ── 시작 ────────────────────────────────────────────────

// 가계도 하나를 불러와 화면 전체를 다시 그린다.
function loadDataset(data) {
  const model = buildModel(data);
  state.data = data;
  state.model = model;
  state.kin = new Kinship(model);
  state.expanded = new Set();
  state.expandAll = false;

  let root = data.meta.subject;
  while (model.father(root)) root = model.father(root);
  state.core = coreSet(model, root);
  state.root = root;
  state.notable = (data.meta.notable || []).filter((id) => model.get(id));
  // 시조의 혈통(배우자 제외). 다른 집에서 들어온 사람은 친정 형제가 일부만 조사되어 있다.
  state.lineage = new Set();
  for (const stack = [root]; stack.length;) {
    const id = stack.pop();
    if (state.lineage.has(id)) continue;
    state.lineage.add(id);
    stack.push(...model.children(id, 'all'));
  }
  state.ego = data.meta.subject;
  state.selected = data.meta.subject;

  document.title = data.meta.title;
  $('title').textContent = data.meta.title;
  $('subtitle').textContent = `${data.meta.clan} · 목업 데이터 · ${data.meta.updated}`;
  $('sources').replaceChildren(...Object.values(data.meta.sources).map((s) =>
    h('li', {}, h('a', { href: s.url, target: '_blank', rel: 'noopener' }, s.title))));

  $('ego').replaceChildren(...[...model.persons.keys()]
    .filter((id) => !model.isUnknown(id))
    .map((id) => h('option', { value: id }, personLabel(id))));
  $('ego').value = state.ego;
  $('dataset').value = data.meta.id;
  $('people').replaceChildren(...[...model.persons.keys()]
    .filter((id) => !model.isUnknown(id))
    .map((id) => h('option', { value: personLabel(id) })));
  $('find').value = '';

  render();
  centerOn(state.ego, isNarrow() ? 0.75 : 0.9);
  renderDetail();
  renderRelations();
}

function main() {
  // data/*.js 파일들이 window.GENEALOGY_DATASETS에 넣어 둔 가계도를 쓴다(서버·fetch 불필요).
  const datasets = window.GENEALOGY_DATASETS || [];
  if (!datasets.length) throw new Error('가계 데이터(data/*.js)를 불러오지 못했습니다');
  const byId = new Map(datasets.map((d) => [d.meta.id, d]));

  // 선택 목록에는 "다산 정약용"처럼 짧은 이름만 보인다.
  const shortName = (d) => d.meta.title.replace(/\(.*?\)/g, '').replace(/가계도$/, '').trim();
  $('dataset').replaceChildren(...datasets.map((d) => h('option', { value: d.meta.id }, shortName(d))));
  // 주소 끝의 #yi-i 처럼 가계도 id를 붙이면 그 가계도로 바로 연다.
  const fromHash = () => byId.get(decodeURIComponent(location.hash.slice(1)));
  $('dataset').addEventListener('change', (ev) => {
    location.hash = ev.target.value;
  });
  window.addEventListener('hashchange', () => {
    const d = fromHash();
    if (d && d !== state.data) loadDataset(d);
  });

  $('ego').addEventListener('change', (ev) => setEgo(ev.target.value));
  // 이름(또는 한자)으로 찾아 해당 카드를 선택하고 화면 가운데로 옮긴다.
  $('find').addEventListener('change', (ev) => {
    const q = ev.target.value.trim();
    if (!q) return;
    const { model } = state;
    const ids = [...model.persons.keys()].filter((id) => !model.isUnknown(id));
    const hit = ids.find((id) => personLabel(id) === q) ||
      ids.find((id) => personLabel(id).includes(q) || (model.get(id).hanja || '').includes(q));
    if (!hit) return;
    if (!state.lay.pos.has(hit)) {
      // 접혀 있거나 숨김 옵션 때문에 안 보이는 인물이면 그 사람까지 펼쳐서 보여 준다.
      reveal(hit);
      render(); renderRelations();
    }
    select(hit);
    centerOn(hit);
  });
  $('hideUnknown').addEventListener('change', (ev) => {
    state.hideUnknown = ev.target.checked;
    render(); centerOn(state.ego); renderRelations();
  });
  $('showLine').addEventListener('change', (ev) => {
    state.showLine = ev.target.checked;
    render(); renderRelations();
  });
  $('expandAll').addEventListener('click', () => {
    state.expandAll = true;
    render(); centerOn(state.ego); renderRelations();
  });
  $('collapseAll').addEventListener('click', () => {
    state.expandAll = false;
    state.expanded.clear();
    render(); centerOn(state.ego); renderRelations();
  });
  $('fold').addEventListener('change', (ev) => {
    state.fold = ev.target.checked;
    render(); centerOn(state.ego);
  });
  $('lineMode').addEventListener('change', (ev) => {
    state.lineMode = ev.target.value;
    render();
  });
  $('showInlaws').addEventListener('change', (ev) => {
    state.showInlaws = ev.target.checked;
    render(); centerOn(state.ego); renderRelations();
  });

  setupPanZoom();
  setupMobile();
  loadDataset(fromHash() || datasets[0]);
}

try {
  main();
} catch (err) {
  $('detail').replaceChildren(h('p', {}, `${err.message}. index.html과 같은 폴더의 js/, data/, vendor/ 파일이 모두 있는지 확인해 주세요.`));
  console.error(err);
}
})();
