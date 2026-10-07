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

  for (const e of state.view.edges) {
    const a = pos.get(e.from), b = pos.get(e.to);
    if (e.kind === 'partner') {
      const cls = ['edge'];
      if (e.union.type === '첩' && e.partner === e.union.wife) cls.push('concubine');
      el('path', { class: cls.join(' '), d: `M${a.x} ${a.y + a.h / 2} V${b.y} H${b.x}` }, gEdges);
    } else {
      const top = b.y - b.h / 2;
      const mid = a.y + Math.min(14, (top - a.y) / 2);
      const cls = ['edge'];
      if (e.skipped) cls.push('skipped');
      if (e.gap) cls.push('gap');
      el('path', { class: cls.join(' '), d: `M${a.x} ${a.y} V${mid} H${b.x} V${top}` }, gEdges);
      if (e.skipped) {
        const text = `${e.skipped}대 미상`;
        const ly = (mid + top) / 2;
        el('rect', { class: 'skip-label-bg', x: b.x + 4, y: ly - 9, width: text.length * 9 + 6, height: 16, rx: 3 }, gLabels);
        const t = el('text', { class: 'skip-label', x: b.x + 7, y: ly + 3 }, gLabels);
        t.textContent = text;
      }
    }
  }

  for (const n of state.view.nodes) {
    const p = pos.get(n.id);
    if (n.kind === 'union') {
      el('circle', { class: 'union-dot', cx: p.x, cy: p.y, r: 2.6 }, gNodes);
      continue;
    }
    drawCard(gNodes, n.id, p, kin.relation(state.ego, n.id));
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
  if (id === state.ego) cls.push('ego');
  if (id === state.selected) cls.push('selected');
  const g = el('g', { class: cls.join(' '), transform: `translate(${p.x - CARD.w / 2} ${p.y - CARD.h / 2})`, tabindex: 0, role: 'button' }, parent);
  g.dataset.id = id;
  el('rect', { class: 'box', width: CARD.w, height: CARD.h, rx: 3 }, g);

  const name = el('text', { class: 'name', x: 10, y: 22 }, g);
  name.textContent = model.displayName(id);
  const sub = person.hanja || (model.isNameless(id) ? '이름 미상' : '');
  if (sub) {
    const ts = el('tspan', { class: 'hanja', dx: 5 }, name);
    ts.textContent = sub;
  }

  const termText = id === state.ego ? '기준 인물' : rel.term;
  const term = el('text', { class: 'term', x: 10, y: 44 }, g);
  const room = CARD.w - 20 - (rel.chon != null ? 34 : 0);
  term.textContent = fitText(termText, room, 12);
  term.style.fontSize = `${fontFor(termText, room, 12)}px`;

  const chon = el('text', { class: 'chon', x: CARD.w - 10, y: 44, 'text-anchor': 'end' }, g);
  chon.textContent = chonText(rel);

  const yr = el('text', { class: 'years', x: 10, y: 63 }, g);
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

  g.addEventListener('click', () => select(id));
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

function setupPanZoom() {
  let drag = null;
  svg.addEventListener('pointerdown', (ev) => {
    if (ev.target.closest('.card')) return;
    drag = { x: ev.clientX, y: ev.clientY, t: { ...state.t } };
    svg.setPointerCapture(ev.pointerId);
    svg.classList.add('dragging');
  });
  svg.addEventListener('pointermove', (ev) => {
    if (!drag) return;
    state.t = { ...drag.t, x: drag.t.x + ev.clientX - drag.x, y: drag.t.y + ev.clientY - drag.y };
    applyTransform();
  });
  const end = () => { drag = null; svg.classList.remove('dragging'); };
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
  renderDetail();
  renderRelations();
}

function personLabel(id) {
  const { model } = state;
  const p = model.get(id);
  return p.hanja ? `${model.displayName(id)}(${p.hanja})` : model.displayName(id);
}

function renderDetail() {
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
  add('부모', parents.join(', '));
  const spouses = model.spouses(id).map((s) => {
    const extra = [s.union.type !== '정실' ? s.union.type : null, s.union.note].filter(Boolean).join(', ');
    return extra ? `${personLabel(s.id)} – ${extra}` : personLabel(s.id);
  });
  add('배우자', spouses.join(' / '));
  const kids = model.children(id).map(personLabel);
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
    onclick: () => { select(id); centerOn(id); },
  },
  h('td', {}, model.displayName(id)),
  h('td', {}, r.term, r.alt ? h('span', { class: 'alt' }, r.alt) : null),
  h('td', { class: 'num' }, chonText(r)))));
}

// ── 시작 ────────────────────────────────────────────────

function main() {
  // data/*.js 파일이 window.GENEALOGY_DATA에 넣어 둔 데이터를 쓴다(서버·fetch 불필요).
  const data = window.GENEALOGY_DATA;
  if (!data) throw new Error('가계 데이터(data/yi-hwang.js)를 불러오지 못했습니다');
  const model = buildModel(data);
  state.model = model;
  state.kin = new Kinship(model);

  let root = data.meta.subject;
  while (model.father(root)) root = model.father(root);
  state.core = coreSet(model, root);
  state.ego = data.meta.subject;
  state.selected = data.meta.subject;

  $('title').textContent = data.meta.title;
  $('subtitle').textContent = `${data.meta.clan} · 목업 데이터 · ${data.meta.updated}`;
  $('sources').replaceChildren(...Object.values(data.meta.sources).map((s) =>
    h('li', {}, h('a', { href: s.url, target: '_blank', rel: 'noopener' }, s.title))));

  const sel = $('ego');
  sel.replaceChildren(...[...model.persons.keys()]
    .filter((id) => !model.isUnknown(id))
    .map((id) => h('option', { value: id }, personLabel(id))));
  sel.value = state.ego;
  sel.addEventListener('change', () => setEgo(sel.value));

  $('hideUnknown').addEventListener('change', (ev) => {
    state.hideUnknown = ev.target.checked;
    render(); centerOn(state.ego); renderRelations();
  });
  $('showInlaws').addEventListener('change', (ev) => {
    state.showInlaws = ev.target.checked;
    render(); centerOn(state.ego); renderRelations();
  });

  setupPanZoom();
  render();
  centerOn(state.ego, 0.9);
  renderDetail();
  renderRelations();
}

try {
  main();
} catch (err) {
  $('detail').replaceChildren(h('p', {}, `${err.message}. index.html과 같은 폴더의 js/, data/, vendor/ 파일이 모두 있는지 확인해 주세요.`));
  console.error(err);
}
})();
