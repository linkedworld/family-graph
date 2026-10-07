(function () {
'use strict';

const { buildModel, Kinship, buildView, layout, coreSet, CARD } = window.Genealogy;


const SVGNS = 'http://www.w3.org/2000/svg';
const KIND_ORDER = { self: 0, blood: 1, spouse: 2, affinal: 3, sadon: 4, distant: 5, none: 6 };

const $ = (id) => document.getElementById(id);
const svg = $('tree');

const state = {
  model: null, kin: null, core: null,
  ego: null, selected: null,
  hideUnknown: false, showInlaws: true,
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
  if (!p.birth && !p.death) return '생몰 미상';
  return `${p.birth ?? '?'}–${p.death ?? '?'}`;
}

// ── 다이어그램 ────────────────────────────────────────────

function render({ refit = false } = {}) {
  const { model, kin } = state;
  state.view = buildView(model, { hideUnknown: state.hideUnknown, showInlaws: state.showInlaws, core: state.core });
  state.lay = layout(state.view);
  const { pos } = state.lay;

  svg.replaceChildren();
  const vp = el('g', { class: 'viewport' }, svg);
  const gEdges = el('g', {}, vp);
  const gLabels = el('g', {}, vp);
  const gNodes = el('g', {}, vp);

  // 결혼선: 두 사람 카드 아래를 잇는 ㄷ자 선. 가운데 점(drop)에서 자녀선이 내려간다.
  for (const un of state.lay.unions) {
    const cls = ['edge', 'marriage'];
    if (un.u.type === '첩') cls.push('concubine');
    const { bottom, drop } = un;
    const d = un.xs.length === 2
      ? `M${un.xs[0]} ${bottom} V${drop.y} H${un.xs[1]} V${bottom}`
      : `M${un.xs[0]} ${bottom} V${drop.y}`;
    el('path', { class: cls.join(' '), d }, gEdges);
    if (un.children.length) el('circle', { class: 'union-dot', cx: drop.x, cy: drop.y, r: 2.6 }, gNodes);

    for (const c of un.children) {
      const b = pos.get(c.id);
      if (!b) continue;
      const top = b.y - b.h / 2;
      const bus = top - 12 - (un.level - 1) * 4;
      const ecls = ['edge'];
      if (c.skipped) ecls.push('skipped');
      if (c.gap) ecls.push('gap');
      if (c.adopt) ecls.push('adopt');
      if (c.adoptedOut) ecls.push('adopted-out');
      el('path', { class: ecls.join(' '), d: `M${drop.x} ${drop.y} V${bus} H${b.x} V${top}` }, gEdges);
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

  for (const id of state.view.persons) {
    drawCard(gNodes, id, pos.get(id), kin.relation(state.ego, id));
  }

  applyTransform();
  if (refit) fit();
}

function drawCard(parent, id, p, rel) {
  const { model } = state;
  const person = model.get(id);
  const unknown = model.isUnknown(id);
  const cls = ['card'];
  if (unknown) cls.push('unknown');
  if (person.gender === 'M') cls.push('male');
  else if (person.gender === 'F') cls.push('female');
  if (id === state.ego) cls.push('ego');
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
    const gen = el('text', { class: 'years', x: CARD.w - 10, y: 63, 'text-anchor': 'end' }, g);
    gen.textContent = `${person.gen}世`;
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
  add('생몰', years(p));
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
  const kids = model.children(id, 'all').map((c) => {
    const ch = model.get(c);
    if (!ch.adoptiveUnion) return personLabel(c);
    return model.parents(c).includes(id) ? `${personLabel(c)} (양자)` : `${personLabel(c)} (출계)`;
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
  const ids = state.view.nodes.filter((n) => n.kind === 'person' && n.id !== state.ego).map((n) => n.id);
  const rows = ids.map((id) => ({ id, r: kin.relation(state.ego, id) }));
  rows.sort((a, b) => (KIND_ORDER[a.r.kind] - KIND_ORDER[b.r.kind]) ||
    ((a.r.chon ?? 99) - (b.r.chon ?? 99)) ||
    (parseInt(model.get(a.id).birth, 10) || 9999) - (parseInt(model.get(b.id).birth, 10) || 9999));
  $('relRows').replaceChildren(...rows.map(({ id, r }) => h('tr', {
    class: model.isUnknown(id) ? 'is-unknown' : '',
    onclick: () => { select(id); centerOn(id); if (isNarrow()) setSheet(false); },
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

  let root = data.meta.subject;
  while (model.father(root)) root = model.father(root);
  state.core = coreSet(model, root);
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
      // 숨김 옵션 때문에 안 보이는 인물이면 옵션을 풀어서 보여 준다.
      state.hideUnknown = false; $('hideUnknown').checked = false;
      state.showInlaws = true; $('showInlaws').checked = true;
      render(); renderRelations();
    }
    select(hit);
    centerOn(hit);
  });
  $('hideUnknown').addEventListener('change', (ev) => {
    state.hideUnknown = ev.target.checked;
    render(); centerOn(state.ego); renderRelations();
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
