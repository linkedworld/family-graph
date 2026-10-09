// 시간 축 3D 연관도: 시간이 흐르는 축 위에 인물의 생애와 사건을 3D로 엮는다.
// lonycell/videojs-simpleoverlay의 세계사 연관도(world.html, 루이 14세) 엔진을 그대로 가져와, 이 저장소에서는
// 광명의 명사(gwangmyeong.html)가 쓴다. 자료는 js/gm-world.js가 만든다. 원본과 다른 점은 자료에서 읽는 몇 가지
// (분류 각도 groups[].angle, 생애 표시 life, 출처 links, 시작 연도 startYear·focus, 배우자 호칭 consort, 사건 크기 size)뿐이다.
//   · 가로축(x)이 연도. 시대마다 바닥에 색 띠와 경계 고리를 두고, 연도 커서로 그 해를 훑어볼 수 있다.
//   · 인물은 태어나서 죽을 때까지의 생애선(빛나는 관)으로, 가문·분야별로 축 둘레의 각도 구역에 놓인다.
//     중심 인물(루이 14세)은 축 한가운데를 지난다.
//   · 사건은 축 바로 위 레일의 수정(크리스털)과 축을 감싸는 고리. 기간이 있는 사건은 레일 위 막대로 이어진다.
//   · 선: 부모→자녀(그 자녀가 태어난 해에서), 혼인·연인(그 해), 사건 참여(사건이 일어난 해), 그 밖의 관계.
// 렌더링은 js/fx3d.js(버블 가계도와 같은 셰이더·후처리)를 쓴다.
(function () {
'use strict';

const G = window.Genealogy;
const T = window.THREE;
const missing = new Map();
const $ = (id) => document.getElementById(id) || missing.get(id) ||
  (missing.set(id, document.createElement('div')), missing.get(id));
const isNarrow = () => window.matchMedia('(max-width: 820px)').matches;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function haptic(p) { try { if (navigator.vibrate) navigator.vibrate(p); } catch (e) { /* 무시 */ } }
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// ── 배치 상수 ──────────────────────────────────────────
const YS = 1.25;          // 1년의 길이
let X0 = 1638;            // 이 연도가 x=0 (중심 인물의 출생 연도로 바뀐다)
const xOf = (y) => (y - X0) * YS;
const R0 = 8, LANE = 2.4; // 인물 구역의 안쪽 반지름, 줄 간격
const RAIL_R = 3.4;       // 사건 레일 반지름
const DEG = Math.PI / 180;
// 분류별 각도(도): 위(90)가 중심 왕가, 앞(0)이 대신, 아래·뒤로 외국 왕가
const GROUP_ANGLE_LOUIS = { bourbon: 90, cadet: 55, court: 20, state: -15, arts: -50, army: -88, valois: 125, spain: 160, austria: 195, italy: 230, stuart: 262, orange: 300 };
const groupAngle = (id) => { const g = groupOf(id); return g && g.angle != null ? g.angle : GROUP_ANGLE_LOUIS[id] ?? 0; };
const LINK_COLORS = { union: '#ff8fbf', liaison: '#ff6aa8', relation: '#c7b8ff' };
const REL_KO = {
  mentor: '스승·후견', patron: '후원', minister: '대신', rival: '맞수', ally: '동맹', served: '섬김', friend: '친구',
  collaborator: '협업', sibling: '형제자매', kin: '친척', tutor: '스승', confessor: '고해 신부', arrest: '체포',
  investigated: '수사', client: '의뢰', negotiator: '협상', regent: '섭정', guardian: '후견', agent: '첩자', precursor: '선행 사건',
};

const state = {
  data: null, meta: null, persons: new Map(), events: new Map(), subject: null,
  selected: null, hovered: null, // { kind: 'p'|'e', id }
  year: 1661, timeFocus: false, showPlane: true, follow: true, playing: false,
  show: { family: true, union: true, event: true, relation: true, era: true },
  autoRotate: false,
  lineK: 1, // 선 진하기(0.3~2): 평소 선의 투명도 배율
  orient: 'auto', // 시간 방향: auto(휴대폰 세로 화면은 세로) | h(가로, 왼쪽→오른쪽) | v(세로, 위→아래)
  route: null, // 경로만 보기: { ids, steps, ps:Set, pairs:Set, event }
};

// ── 데이터 준비 ────────────────────────────────────────
function loadData(data) {
  const persons = new Map(), events = new Map();
  for (const r of data.persons) {
    // 행은 배열(루이 14세 자료) 또는 같은 이름의 칸을 가진 객체(js/gm-world.js: life·note·links를 더 가짐)
    const o = Array.isArray(r) ? (([id, ko, en, b, d, g, group, title, f, m, wiki]) => ({ id, ko, en, b, d, g, group, title, f, m, wiki }))(r) : { ...r };
    persons.set(o.id, { ...o, kids: [], spouses: [], rels: [], events: [] });
  }
  for (const p of persons.values()) {
    for (const par of [p.f, p.m]) if (par && persons.has(par)) persons.get(par).kids.push(p.id);
  }
  for (const [a, b, year, kind] of data.unions) {
    persons.get(a).spouses.push({ id: b, year, kind });
    persons.get(b).spouses.push({ id: a, year, kind });
  }
  for (const [a, b, type, note] of data.relations) {
    persons.get(a).rels.push({ id: b, type, note, dir: 1 });
    persons.get(b).rels.push({ id: a, type, note, dir: -1 });
  }
  for (const e of data.events) {
    events.set(e.id, { ...e });
    for (const [pid, role] of e.people) persons.get(pid).events.push({ id: e.id, role });
  }
  for (const p of persons.values()) p.kids.sort((a, b) => persons.get(a).b - persons.get(b).b);
  state.data = data; state.meta = data.meta; state.persons = persons; state.events = events;
  state.subject = data.meta.subject;
  X0 = persons.get(state.subject).b;
  layout();
}

// 분류마다 생애가 겹치지 않게 줄(lane)을 나눠 반지름을 정한다(구간 일정 배정).
function layout() {
  const byGroup = new Map();
  for (const p of state.persons.values()) {
    if (p.id === state.subject) continue;
    if (!byGroup.has(p.group)) byGroup.set(p.group, []);
    byGroup.get(p.group).push(p);
  }
  for (const [group, list] of byGroup) {
    list.sort((a, b) => a.b - b.b || a.d - b.d);
    const ends = [];
    for (const p of list) {
      let lane = ends.findIndex((e) => e + 4 <= p.b);
      if (lane < 0) { lane = ends.length; ends.push(0); }
      ends[lane] = p.d;
      p.lane = lane;
      p.radius = R0 + lane * LANE;
      p.angle = groupAngle(group) * DEG + ((lane % 3) - 1) * 0.15;
    }
  }
  const s = state.persons.get(state.subject);
  s.lane = 0; s.radius = 0; s.angle = 90 * DEG;
  for (const p of state.persons.values()) {
    p.y = p.radius * Math.sin(p.angle);
    p.z = p.radius * Math.cos(p.angle);
    p.bead = new T.Vector3(xOf((p.b + p.d) / 2), p.y, p.z);
    p.beadNow = p.bead.clone(); // 실제로 그리는 자리(연도 막에 걸리면 막 쪽으로 미끄러진다)
    p.onPlane = 0;
  }
  // 사건 레일: 시기가 겹치면 레일 둘레로 비켜 놓는다.
  const evs = [...state.events.values()].sort((a, b) => a.from - b.from);
  const ends = [];
  const offs = [0, 1, -1, 2, -2, 3, -3, 4, -4];
  for (const e of evs) {
    let lane = ends.findIndex((end) => end + 2 <= e.from);
    if (lane < 0) { lane = ends.length; ends.push(0); }
    ends[lane] = Math.max(e.to, e.from + 2);
    e.lane = lane;
    e.angle = (90 + offs[lane % offs.length] * 24) * DEG;
    e.y = RAIL_R * Math.sin(e.angle);
    e.z = RAIL_R * Math.cos(e.angle);
    e.pos = new T.Vector3(xOf(e.from), e.y, e.z);
  }
}
const pointOn = (p, year) => new T.Vector3(xOf(Math.min(p.d, Math.max(p.b, year))), p.y, p.z);
const aliveAt = (p, y) => p.b <= y && y <= p.d;
const eraAt = (y) => state.meta.eras.find((e) => e.from <= y && y < e.to) || state.meta.eras[state.meta.eras.length - 1];
const groupOf = (id) => state.meta.groups.find((g) => g.id === id);
const typeOf = (t) => state.meta.eventTypes[t] || { name: t, color: '#ffffff' };
// 사건 수정 크기: 자료의 size, 없으면 루이 14세 자료의 종류(war·battle)로
const evSize = (e) => typeOf(e.type).size ?? (e.type === 'war' ? 1.25 : e.type === 'battle' ? 0.8 : 0.95);
// 생애 표시: 자료의 life(예: '1965년생', '활동 1898', '생몰 미상'), 없으면 출생–사망
const lifeText = (p) => p.life || `${p.b}–${p.d}`;
const evYears = (e) => `${e.from}${e.to > e.from ? `–${e.to}` : ''}`;

// ── 루이 14세와의 관계(호칭) ─────────────────────────────
function ancestors(id) {
  const out = new Map([[id, { d: 0, first: null }]]);
  const q = [id];
  while (q.length) {
    const cur = q.shift();
    const p = state.persons.get(cur);
    for (const [par, side] of [[p.f, 'f'], [p.m, 'm']]) {
      if (!par || out.has(par)) continue;
      out.set(par, { d: out.get(cur).d + 1, first: out.get(cur).first || side });
      q.push(par);
    }
  }
  return out;
}
function blood(a, b) {
  const A = ancestors(a), B = ancestors(b);
  let best = null;
  for (const [c, x] of A) {
    const y = B.get(c);
    if (!y) continue;
    if (!best || x.d + y.d < best.up + best.down) best = { up: x.d, down: y.d, via: c, side: x.first };
  }
  return best;
}
function bloodTerm(r, target) {
  const F = target.g === 'F';
  const { up, down, side } = r;
  const oe = side === 'm' ? '외' : '';
  if (!up && !down) return '본인';
  if (!up) return [null, F ? '딸' : '아들', F ? '손녀' : '손자', F ? '증손녀' : '증손자', F ? '고손녀' : '고손자'][down] || `${down}대손`;
  if (!down) {
    if (up === 1) return F ? '어머니' : '아버지';
    const base = [null, null, '할', '증조할', '고조할'][up];
    return base ? `${oe}${base}${F ? '머니' : '아버지'}` : `${oe}${up}대조${F ? '모' : '부'}`;
  }
  if (up === 1 && down === 1) {
    const me = state.persons.get(state.subject);
    const half = !(target.f && target.f === me.f && target.m && target.m === me.m);
    return `${half ? '이복 ' : ''}${F ? '자매' : '형제'}`;
  }
  if (up === 2 && down === 1) return side === 'm' ? (F ? '이모' : '외삼촌') : (F ? '고모' : '삼촌');
  if (up === 1 && down === 2) return F ? '조카딸' : '조카';
  if (up === 2 && down === 2) return side === 'm' ? '외사촌' : '사촌';
  if (up === 3 && down === 1) return `${oe}종조${F ? '모' : '부'}`;
  if (up === 1 && down === 3) return F ? '종손녀' : '종손';
  return `${up + down}촌 혈족`;
}
function spouseWord(of, sp, kind) {
  if (kind === 'l') return '연인';
  return sp.g === 'F' ? (of.id === state.subject ? state.meta.consort || '왕비' : '아내') : '남편';
}
const SPECIAL = { '아들의 아내': '며느리', '딸의 남편': '사위', '손자의 아내': '손자며느리', '손녀의 남편': '손녀사위', '왕비의 아버지': '장인', '왕비의 어머니': '장모' };
function relationToSubject(id) {
  const S = state.subject;
  if (id === S) return { term: '중심 인물', chon: null };
  const t = state.persons.get(id);
  const b = blood(S, id);
  const cands = [];
  if (b) cands.push({ term: bloodTerm(b, t), chon: b.up + b.down, cost: b.up + b.down });
  const me = state.persons.get(S);
  const direct = me.spouses.find((s) => s.id === id);
  if (direct) cands.push({ term: spouseWord(me, t, direct.kind), chon: 0, cost: 0 });
  // 혈족의 배우자
  for (const s of t.spouses) {
    if (s.id === S) continue;
    const r = blood(S, s.id);
    if (!r) continue;
    const base = `${bloodTerm(r, state.persons.get(s.id))}의 ${spouseWord(state.persons.get(s.id), t, s.kind)}`;
    cands.push({ term: SPECIAL[base] || base, chon: r.up + r.down, cost: r.up + r.down + 0.5 });
  }
  // 배우자의 혈족
  for (const s of me.spouses) {
    const r = blood(s.id, id);
    if (!r || s.id === id) continue;
    const sp = state.persons.get(s.id);
    const base = `${spouseWord(me, sp, s.kind)}의 ${bloodTerm(r, t).replace('본인', '')}`;
    cands.push({ term: SPECIAL[base] || base, chon: r.up + r.down, cost: r.up + r.down + 0.6 });
  }
  cands.sort((a, b) => a.cost - b.cost);
  return cands[0] || null;
}
// 혈연·혼인·관계를 모두 이어 중심 인물에서 그 사람까지의 가장 짧은 경로
// 중심 인물에서 그 사람까지의 가장 짧은 길. 혈연(부모·자녀)을 가장 가깝게, 혼인을 그다음으로,
// 그 밖의 관계(후원·경쟁 등)는 멀게 쳐서 가능하면 핏줄과 혼인으로 잇는다(데이크스트라).
const STEP_COST = { parent: 1, child: 1, spouse: 1.2, liaison: 1.6, relation: 2.5 };
function neighbors(id) {
  const p = state.persons.get(id);
  const out = [];
  if (p.f) out.push({ id: p.f, kind: 'parent' });
  if (p.m) out.push({ id: p.m, kind: 'parent' });
  for (const k of p.kids) out.push({ id: k, kind: 'child' });
  for (const sp of p.spouses) out.push({ id: sp.id, kind: sp.kind === 'l' ? 'liaison' : 'spouse' });
  for (const r of p.rels) out.push({ id: r.id, kind: 'relation', type: r.type });
  return out;
}
// 먼저 혈연·혼인만으로 찾고, 그 길이 없을 때만 그 밖의 관계(후원·경쟁 등)까지 넣어 찾는다.
function routeTo(id) {
  return routeSearch(id, true) || routeSearch(id, false);
}
function routeSearch(id, familyOnly) {
  const S = state.subject;
  const dist = new Map([[S, 0]]), prev = new Map([[S, null]]), done = new Set();
  while (true) {
    let cur = null, best = Infinity;
    for (const [k, d] of dist) if (!done.has(k) && d < best) { best = d; cur = k; }
    if (cur === null || cur === id) break;
    done.add(cur);
    for (const n of neighbors(cur)) {
      if (familyOnly && n.kind === 'relation') continue;
      const nd = best + STEP_COST[n.kind];
      if (nd < (dist.get(n.id) ?? Infinity)) { dist.set(n.id, nd); prev.set(n.id, { from: cur, step: n }); }
    }
  }
  if (!prev.has(id)) return null;
  const steps = [];
  for (let c = id; prev.get(c); c = prev.get(c).from) steps.unshift({ from: prev.get(c).from, to: c, ...prev.get(c).step });
  return { ids: [S, ...steps.map((st) => st.to)], steps, familyOnly };
}
function pathFromSubject(id) { const r = routeTo(id); return r ? r.ids : null; }
// 한 걸음의 관계 이름(앞사람에게서 본 뒷사람)
function stepWord(st) {
  const to = state.persons.get(st.to);
  const F = to.g === 'F';
  if (st.kind === 'parent') return F ? '어머니' : '아버지';
  if (st.kind === 'child') return F ? '딸' : '아들';
  if (st.kind === 'spouse') return F ? '아내' : '남편';
  if (st.kind === 'liaison') return '연인';
  return REL_KO[st.type] || '관계';
}

// ── 3D 장면 ──────────────────────────────────────────────
let renderer, scene, camera, fx, post;
let beads, gems, lifelines, links, rings, pickLife, ticks, eraRings, cursor, axisBeam, sky, dust;
// 휴대폰처럼 세로로 긴 화면에서는 시간 축을 세로로 세운다(위가 과거, 아래가 미래). 모든 장면 요소를 root에 담아 돌린다.
let root, vertical = false;
const toWorld = (v) => root.localToWorld(v.clone());
const wantVertical = () => state.orient === 'v' || (state.orient === 'auto' && isNarrow() && window.innerHeight > window.innerWidth);
// 시간 방향을 바꾼다. 보던 연도(카메라가 바라보는 곳)를 그대로 두고 축만 눕히거나 세운다.
function applyOrient() {
  const v = wantVertical();
  if (v === vertical) return;
  const local = toLocal(ctl.goal || ctl.target);
  vertical = v;
  root.rotation.z = v ? -Math.PI / 2 : 0;
  root.updateMatrixWorld(true);
  ctl.target.copy(toWorld(local));
  ctl.goal = null;
  if (v) { ctl.theta = 0.45; ctl.phi = 1.5; } else { ctl.theta = 0.5; ctl.phi = 1.18; }
  if (state.route) fitRoute();
  else { const y = local.x / YS + X0, span = !v && isNarrow() ? 22 : 45; fitRange(y - span, y + span); }
  for (const L of labels) L.w = 0;
  dirty = true;
}
const toLocal = (v) => root.worldToLocal(v.clone());
const canvas = $('gl');
const segs = []; // 연결선 토막 목록(링크별 시작·개수)
let linkList = [];
const baseM = {}; // 경로만 보기에서 숨겼다가 되돌릴 원래 배치 행렬
let dirty = true;

function initGL() {
  try { renderer = new T.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' }); }
  catch (e) { $('fallback').hidden = false; return false; }
  if (!renderer.capabilities.isWebGL2) { $('fallback').hidden = false; return false; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isNarrow() ? 1.75 : 2));
  scene = new T.Scene();
  camera = new T.PerspectiveCamera(45, 1, 0.5, 6000);
  fx = G.FX3D({ renderer, scene, camera });
  sky = new T.Mesh(new T.SphereGeometry(2500, 48, 24), fx.skyMaterial());
  sky.renderOrder = -10;
  scene.add(sky);
  dust = fx.makeDust();
  dust.scale.set(2.2, 0.6, 0.6);
  dust.position.y = 20;
  scene.add(dust);
  post = fx.makePost();
  root = new T.Group();
  vertical = wantVertical();
  if (vertical) root.rotation.z = -Math.PI / 2;
  scene.add(root);
  root.updateMatrixWorld(true);
  return true;
}

function buildScene() {
  const { persons, events, meta } = state;
  const P = [...persons.values()], E = [...events.values()];
  const col = (hex) => new T.Color(hex);

  // 시간 축 빛기둥
  axisBeam = new T.Mesh(new T.CylinderGeometry(1, 1, 1, 16, 1, true), fx.axisMaterial());
  axisBeam.material.uniforms.uVis.value = 0.55;
  const xa = xOf(meta.range[0]), xb = xOf(meta.range[1]);
  axisBeam.scale.set(0.05, xb - xa, 0.05);
  axisBeam.rotation.z = Math.PI / 2;
  axisBeam.position.set((xa + xb) / 2, 0, 0);
  axisBeam.frustumCulled = false;
  root.add(axisBeam);

  // 연도 눈금: 10년마다 작은 고리, 50년·100년마다 큰 고리
  const tick = [];
  const circle = (x, r, n = 48) => {
    for (let k = 0; k < n; k++) {
      const a0 = (k / n) * Math.PI * 2, a1 = ((k + 1) / n) * Math.PI * 2;
      tick.push(x, Math.sin(a0) * r, Math.cos(a0) * r, x, Math.sin(a1) * r, Math.cos(a1) * r);
    }
  };
  for (let y = Math.ceil(meta.range[0] / 10) * 10; y <= meta.range[1]; y += 10) circle(xOf(y), y % 100 === 0 ? 2.6 : y % 50 === 0 ? 1.8 : 1.1, 40);
  const tg = new T.BufferGeometry();
  tg.setAttribute('position', new T.Float32BufferAttribute(tick, 3));
  ticks = new T.LineSegments(tg, new T.LineBasicMaterial({ color: col('#9fc8ff'), transparent: true, opacity: 0.35, blending: T.AdditiveBlending, depthWrite: false }));
  root.add(ticks);

  // 시대: 경계 고리와 바닥 띠
  const ring = [], ringCol = [];
  const FLOOR = -44;
  eraRings = new T.Group();
  for (const era of meta.eras) {
    const c = col(era.color);
    const x = xOf(era.from), n = 120, r = 40;
    for (let k = 0; k < n; k++) {
      if (k % 2) continue;
      const a0 = (k / n) * Math.PI * 2, a1 = ((k + 1) / n) * Math.PI * 2;
      ring.push(x, Math.sin(a0) * r, Math.cos(a0) * r, x, Math.sin(a1) * r, Math.cos(a1) * r);
      ringCol.push(c.r, c.g, c.b, c.r, c.g, c.b);
    }
    const w = xOf(era.to) - xOf(era.from);
    const strip = new T.Mesh(new T.PlaneGeometry(w, 26), new T.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.16, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide }));
    strip.rotation.x = -Math.PI / 2;
    strip.position.set(xOf(era.from) + w / 2, FLOOR, 0);
    eraRings.add(strip);
    const edge = new T.Mesh(new T.PlaneGeometry(0.35, 26), new T.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.7, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide }));
    edge.rotation.x = -Math.PI / 2;
    edge.position.set(xOf(era.from), FLOOR + 0.05, 0);
    eraRings.add(edge);
  }
  const rg = new T.BufferGeometry();
  rg.setAttribute('position', new T.Float32BufferAttribute(ring, 3));
  rg.setAttribute('color', new T.Float32BufferAttribute(ringCol, 3));
  eraRings.add(new T.LineSegments(rg, new T.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.14, blending: T.AdditiveBlending, depthWrite: false })));
  root.add(eraRings);

  // 연도 커서: 그 해를 지나는 둥근 빛의 막
  cursor = new T.Mesh(new T.CircleGeometry(40, 128), new T.ShaderMaterial({
    uniforms: { uTime: fx.uTime, uColor: { value: col('#6fe6ff') }, uVis: { value: 0 }, uPlane: { value: 1 } },
    transparent: true, depthWrite: false, side: T.DoubleSide,
    vertexShader: 'varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `uniform float uTime, uVis, uPlane; uniform vec3 uColor; varying vec2 vP;
      void main(){ float r = length(vP) / 40.0;
        float rim = smoothstep(0.94, 0.995, r) * (1.0 - smoothstep(0.995, 1.0, r));
        float rings = smoothstep(0.47, 0.5, abs(fract(r * 8.0 - uTime * 0.25) - 0.5)) * 0.22;
        float ang = atan(vP.y, vP.x + 1e-4) / 6.2831 * 24.0;
        float rays = (1.0 - smoothstep(0.0, 0.04, abs(fract(ang) - 0.5) - 0.46)) * smoothstep(0.15, 0.3, r) * 0.08;
        // 판은 거의 불투명한 어두운 면(시대 색을 살짝 입힘)이라 그 뒤쪽은 가려져 복잡하지 않다.
        vec3 base = mix(vec3(0.002, 0.003, 0.007), uColor, 0.025 + 0.02 * (1.0 - r)); // 선형 색: 화면에서는 이보다 꽤 밝게 보인다
        vec3 glow = uColor * (rim * 1.4 + (rings * (1.0 - r) + rays) * 0.5);
        float a = clamp(0.94 * uVis * uPlane, 0.0, 1.0);
        gl_FragColor = vec4(base + glow, a); }`,
  }));
  cursor.rotation.y = Math.PI / 2;
  cursor.renderOrder = 5;
  root.add(cursor);

  // 인물: 구슬 + 생애선(관)
  beads = fx.instanced(new T.SphereGeometry(1, 40, 28), fx.sphereMaterial(), P.length, [['aColor', 3], ['aParams', 4]]);
  pickLife = new T.InstancedMesh(new T.CylinderGeometry(1, 1, 1, 6, 1, true), new T.MeshBasicMaterial({ visible: false }), P.length);
  pickLife.frustumCulled = false;
  const _m = new T.Matrix4(), _q = new T.Quaternion(), _s = new T.Vector3(), _up = new T.Vector3(0, 1, 0), _x = new T.Vector3(1, 0, 0);
  const qx = new T.Quaternion().setFromUnitVectors(_up, _x);
  P.forEach((p, i) => {
    p.index = i;
    const r = p.id === state.subject ? 2.0 : 0.95;
    _m.compose(p.bead, _q.identity(), _s.set(r, r, r));
    beads.setMatrixAt(i, _m);
    const c = col(groupOf(p.group).color);
    p.color = c;
    beads.geometry.attributes.aColor.setXYZ(i, c.r, c.g, c.b);
    const len = Math.max(0.5, xOf(p.d) - xOf(p.b));
    _m.compose(new T.Vector3(xOf(p.b) + len / 2, p.y, p.z), qx, _s.set(0.9, len, 0.9));
    pickLife.setMatrixAt(i, _m);
  });
  beads.count = P.length;
  root.add(beads, pickLife);

  // 사건: 수정 + 축을 감싸는 고리
  gems = fx.instanced(new T.OctahedronGeometry(1, 0), fx.sphereMaterial(), E.length, [['aColor', 3], ['aParams', 4]]);
  rings = fx.instanced(new T.TorusGeometry(1, 0.03, 8, 96), fx.ringMaterial(), E.length, [['aColor', 3], ['aParams', 4]]);
  const qr = new T.Quaternion().setFromAxisAngle(_up, Math.PI / 2);
  E.forEach((e, i) => {
    e.index = i;
    const big = evSize(e);
    _m.compose(e.pos, new T.Quaternion().setFromEuler(new T.Euler(0.4, 0.6 * i, 0)), _s.set(big, big * 1.35, big));
    gems.setMatrixAt(i, _m);
    const c = col(typeOf(e.type).color);
    e.color = c;
    gems.geometry.attributes.aColor.setXYZ(i, c.r, c.g, c.b);
    _m.compose(new T.Vector3(xOf(e.from), 0, 0), qr, _s.set(RAIL_R, RAIL_R, RAIL_R));
    rings.setMatrixAt(i, _m);
    rings.geometry.attributes.aColor.setXYZ(i, c.r, c.g, c.b);
  });
  gems.count = E.length; rings.count = E.length;
  baseM.gems = Float32Array.from(gems.instanceMatrix.array);
  baseM.rings = Float32Array.from(rings.instanceMatrix.array);
  root.add(gems, rings);

  // 연결선 목록
  linkList = [];
  const add = (kind, a, b, A, B, colA, colB, opts = {}) => linkList.push({ kind, a, b, A, B, colA, colB, ...opts });
  for (const p of P) {
    // 생애선
    add('life', { k: 'p', id: p.id }, null, new T.Vector3(xOf(p.b), p.y, p.z), new T.Vector3(xOf(p.d), p.y, p.z), p.color, p.color,
      { width: p.id === state.subject ? 0.22 : 0.065, straight: true, n: 1 });
    for (const par of [p.f, p.m]) {
      if (!par) continue;
      const q = persons.get(par);
      add('family', { k: 'p', id: par }, { k: 'p', id: p.id }, pointOn(q, p.b), new T.Vector3(xOf(p.b), p.y, p.z), q.color, p.color, { width: 0.035, n: 10 });
    }
  }
  for (const [a, b, year, kind] of state.data.unions) {
    const A = persons.get(a), B = persons.get(b);
    add(kind === 'l' ? 'liaison' : 'union', { k: 'p', id: a }, { k: 'p', id: b }, pointOn(A, year), pointOn(B, year),
      col(LINK_COLORS[kind === 'l' ? 'liaison' : 'union']), col(LINK_COLORS[kind === 'l' ? 'liaison' : 'union']), { width: kind === 'l' ? 0.025 : 0.04, n: 8 });
  }
  for (const [a, b] of state.data.relations) {
    const A = persons.get(a), B = persons.get(b);
    const y = (Math.max(A.b, B.b) + Math.min(A.d, B.d)) / 2;
    add('relation', { k: 'p', id: a }, { k: 'p', id: b }, pointOn(A, y), pointOn(B, y), col(LINK_COLORS.relation), col(LINK_COLORS.relation), { width: 0.022, n: 8 });
  }
  for (const e of E) {
    if (e.to > e.from) add('duration', { k: 'e', id: e.id }, null, e.pos.clone(), new T.Vector3(xOf(e.to + 0.6), e.y, e.z), e.color, e.color, { width: 0.12, straight: true, n: 1 });
    for (const [pid] of e.people) {
      const p = persons.get(pid);
      add('event', { k: 'e', id: e.id }, { k: 'p', id: pid }, e.pos.clone(), pointOn(p, e.from), e.color, p.color, { width: 0.022, n: 6 });
    }
  }
  const total = linkList.reduce((s, l) => s + l.n, 0);
  links = fx.instanced(new T.CylinderGeometry(1, 1, 1, 8, 1, true), fx.edgeMaterial(), total, [['aColA', 3], ['aColB', 3], ['aSeg', 2], ['aParams', 4]]);
  links.renderOrder = 2;
  // 곡선: 축에서 바깥으로 부풀어 오르는 베지에(서로 겹치는 직선을 피한다)
  const A = links.geometry.attributes;
  let e = 0;
  const P0 = new T.Vector3(), P1 = new T.Vector3(), P2 = new T.Vector3(), P3 = new T.Vector3(), a = new T.Vector3(), b = new T.Vector3(), v = new T.Vector3();
  const bez = (t, out) => { const u = 1 - t; return out.set(0, 0, 0).addScaledVector(P0, u * u * u).addScaledVector(P1, 3 * u * u * t).addScaledVector(P2, 3 * u * t * t).addScaledVector(P3, t * t * t); };
  const outward = (pt, amt) => { const r = Math.hypot(pt.y, pt.z) || 1; return new T.Vector3(0, (pt.y / r) * amt, (pt.z / r) * amt); };
  for (const L of linkList) {
    L.start = e;
    P0.copy(L.A); P3.copy(L.B);
    if (L.straight) { P1.lerpVectors(P0, P3, 1 / 3); P2.lerpVectors(P0, P3, 2 / 3); }
    else {
      const d = P0.distanceTo(P3);
      const bulge = Math.min(10, d * 0.35);
      P1.copy(P0).lerp(P3, 0.25).add(outward(P0, bulge));
      P2.copy(P0).lerp(P3, 0.75).add(outward(P3, bulge));
      if (L.kind === 'family') { P1.x = P0.x; P2.x = P3.x; } // 자녀가 태어난 해의 단면 안에서 휘어진다
    }
    for (let k = 0; k < L.n; k++) {
      const t0 = k / L.n, t1 = (k + 1) / L.n;
      bez(t0, a); bez(t1, b);
      v.subVectors(b, a);
      const len = v.length() || 0.001;
      _q.setFromUnitVectors(_up, v.divideScalar(len));
      _m.compose(a.clone().add(b).multiplyScalar(0.5), _q, _s.set(L.width, len * 1.02, L.width));
      links.setMatrixAt(e, _m);
      A.aColA.setXYZ(e, L.colA.r, L.colA.g, L.colA.b);
      A.aColB.setXYZ(e, L.colB.r, L.colB.g, L.colB.b);
      A.aSeg.setXY(e, t0, t1);
      e++;
    }
  }
  links.count = e;
  links.instanceMatrix.needsUpdate = true;
  for (const k of ['aColA', 'aColB', 'aSeg']) A[k].needsUpdate = true;
  root.add(links);
  for (const m of [beads, gems, rings]) { m.instanceMatrix.needsUpdate = true; m.geometry.attributes.aColor.needsUpdate = true; }
  dirty = true;
}

// 경로만 보기에서 남길 선: 경로 인물의 생애선, 경로의 걸음(혈연·혼인·관계), 고른 사건과 그 참여선
function routeLink(L) {
  const R = state.route;
  if (L.kind === 'life') return R.ps.has(L.a.id);
  if (L.kind === 'duration') return L.a.id === R.event;
  if (L.kind === 'event') return L.a.id === R.event && R.eventPeople.has(L.b.id);
  return R.pairs.has(`${L.a.id}|${L.b.id}`) || R.pairs.has(`${L.b.id}|${L.a.id}`);
}
function routeFor(sel) {
  if (!sel) return null;
  let r, event = null, eventPeople = new Set();
  if (sel.kind === 'p') r = routeTo(sel.id);
  else {
    // 사건: 참여자 가운데 중심 인물과 가장 가까운 사람까지의 길 + 사건과 그 참여자
    const ev = state.events.get(sel.id);
    event = ev.id;
    for (const [pid] of ev.people) {
      const c = routeTo(pid);
      const better = c && (!r || (c.familyOnly && !r.familyOnly) || (c.familyOnly === r.familyOnly && c.steps.length < r.steps.length));
      if (better) r = c;
    }
    if (r) eventPeople.add(r.ids[r.ids.length - 1]);
  }
  if (!r) return null;
  const pairs = new Set(r.steps.map((st) => `${st.from}|${st.to}`));
  return { ...r, ps: new Set(r.ids), pairs, event, eventPeople, target: sel };
}
function setRoute(on) {
  state.route = on ? routeFor(state.selected) : null;
  dirty = true;
  renderRouteBar();
  renderInfo();
  if (state.route) fitRoute();
}
// 경로 전체가 화면에 들어오게 맞춘다.
function fitRoute() {
  const R = state.route;
  const pts = R.ids.map((id) => state.persons.get(id).bead);
  if (R.event) pts.push(state.events.get(R.event).pos);
  const box = new T.Box3().setFromPoints(pts.map((v) => toWorld(v)));
  const size = box.getSize(new T.Vector3());
  const tanV = Math.tan((camera.fov * Math.PI) / 360);
  ctl.goal = box.getCenter(new T.Vector3());
  const w = Math.max(size.x, size.z) + 24, h = size.y + 24;
  ctl.radiusGoal = Math.max(40, Math.max(h / 2 / tanV, w / 2 / (tanV * camera.aspect)) * 1.1);
}
function renderRouteBar() {
  const bar = $('routeBar');
  const R = state.route;
  if (!R) { bar.hidden = true; document.body.classList.remove('route-on'); return; }
  const parts = [chip('p', R.ids[0])];
  for (const st of R.steps) parts.push(`<i>${esc(stepWord(st))}</i>${chip('p', st.to)}`);
  if (R.event) parts.push(`<i>참여</i>${chip('e', R.event)}`);
  const tgt = R.target.kind === 'p' ? state.persons.get(R.target.id).ko : state.events.get(R.target.id).ko;
  const kind = R.familyOnly ? '혈연·혼인으로 이어진 길' : '혈연·혼인으로는 닿지 않아 그 밖의 관계를 거친 길';
  bar.innerHTML = `<p><b>경로만 보기</b><span>${esc(state.persons.get(state.subject).ko)} → ${esc(tgt)} · ${R.steps.length}단계 · ${kind}</span></p>
    <div class="route">${parts.join('')}</div>
    <button type="button" class="glass-btn" data-act="route-off">모두 보기</button>`;
  bar.hidden = false;
  document.body.classList.add('route-on');
}

// 선택·연도 커서에 따라 밝기를 다시 정한다(바뀔 때만).
function relatedSets() {
  const sel = state.selected;
  if (!sel) return null;
  const ps = new Set(), es = new Set();
  if (sel.kind === 'p') {
    const p = state.persons.get(sel.id);
    ps.add(p.id);
    for (const x of [p.f, p.m, ...p.kids, ...p.spouses.map((s) => s.id), ...p.rels.map((r) => r.id)]) if (x) ps.add(x);
    for (const ev of p.events) es.add(ev.id);
  } else {
    const ev = state.events.get(sel.id);
    es.add(ev.id);
    for (const [pid] of ev.people) ps.add(pid);
  }
  return { ps, es };
}
function refresh() {
  const rel = relatedSets();
  const Y = state.year, tf = state.timeFocus;
  const hov = state.hovered;
  const R = state.route;
  const pVis = (p) => {
    if (R) return R.ps.has(p.id) ? 1 : 0.02;
    let v = 1;
    if (rel) v = rel.ps.has(p.id) ? 1 : 0.18;
    if (tf && !aliveAt(p, Y)) v *= 0.3;
    return v;
  };
  const eVis = (e) => {
    if (R) return R.event === e.id ? 1 : 0.02;
    let v = 1;
    if (rel) v = rel.es.has(e.id) ? 1 : 0.15;
    if (tf && !(e.from - 1 <= Y && Y <= e.to + 1)) v *= 0.3;
    return v;
  };
  const sp = beads.geometry.attributes.aParams;
  for (const p of state.persons.values()) {
    const v = pVis(p);
    const isSel = state.selected && state.selected.kind === 'p' && state.selected.id === p.id;
    const isHov = hov && hov.kind === 'p' && hov.id === p.id;
    p.vis = v;
    sp.setXYZW(p.index, (p.id === state.subject ? 1.5 : 1.0) * (0.25 + 0.75 * v), isHov ? 1 : isSel ? 0.8 : 0, v < 0.5 ? 0.6 : 0, (p.index * 0.618) % 1);
  }
  sp.needsUpdate = true;
  const gp = gems.geometry.attributes.aParams, rp = rings.geometry.attributes.aParams;
  for (const e of state.events.values()) {
    const v = state.show.event ? eVis(e) : 0.05;
    const isSel = state.selected && state.selected.kind === 'e' && state.selected.id === e.id;
    const isHov = hov && hov.kind === 'e' && hov.id === e.id;
    e.vis = v;
    gp.setXYZW(e.index, 1.3 * (0.25 + 0.75 * v), isHov ? 1 : isSel ? 0.8 : 0, 0, (e.index * 0.37) % 1);
    rp.setX(e.index, v * (isSel ? 1 : 0.45));
  }
  gp.needsUpdate = true; rp.needsUpdate = true;
  const lp = links.geometry.attributes.aParams;
  for (const L of linkList) {
    const showK = L.kind === 'life' || L.kind === 'duration' ? true : L.kind === 'liaison' ? state.show.union : state.show[L.kind];
    const end = (x) => (!x ? 1 : x.k === 'p' ? state.persons.get(x.id).vis : state.events.get(x.id).vis);
    let v = showK ? Math.min(end(L.a), end(L.b)) : 0;
    if (R) v = routeLink(L) ? 1 : 0;
    if (L.kind === 'duration' && !state.show.event) v = 0;
    let hot = 0;
    if ((state.selected || R) && v > 0.9 && L.kind !== 'life') hot = 1;
    // [세기, 흐름 속도, 빛 알갱이, 평소 투명도]. 직선이 많은 생애선·사건선은 특히 옅게 둔다.
    const base = { life: [0.5, 0.1, 0.12, 0.45], family: [0.75, 0.35, 0.35, 0.6], union: [0.75, 0.2, 0.3, 0.6], liaison: [0.5, 0.2, 0.15, 0.4], relation: [0.45, 0.25, 0.1, 0.35], event: [0.45, 0.45, 0.15, 0.28], duration: [0.8, 0.4, 0.5, 0.7] }[L.kind];
    const K = state.lineK;
    const alpha = Math.min(1, (hot ? 1.2 : base[3] * K) * v);
    for (let k = 0; k < L.n; k++) {
      lp.setXYZW(L.start + k, base[0] * (0.4 + 0.6 * v) * (hot ? 1.3 : Math.min(1.3, 0.6 + 0.4 * K)), base[1], hot ? 1 : base[2], alpha);
    }
  }
  lp.needsUpdate = true;
  eraRings.visible = state.show.era;
  // 경로만 보기: 경로 밖 구슬·수정·고리는 크기를 0으로 줄여 아예 숨긴다(유리 반사까지 사라지게).
  const hideOut = (mesh, base, list, keep) => {
    const arr = mesh.instanceMatrix.array;
    arr.set(base);
    if (R) for (const o of list) if (!keep(o)) arr.fill(0, o.index * 16, o.index * 16 + 15);
    mesh.instanceMatrix.needsUpdate = true;
  };
  const PL = [...state.persons.values()], EL = [...state.events.values()];
  hideOut(gems, baseM.gems, EL, (e) => R.event === e.id);
  hideOut(rings, baseM.rings, EL, (e) => R.event === e.id);
  dirty = false;
}

// ── 카메라 ───────────────────────────────────────────────
const ctl = { target: new T.Vector3(), goal: null, theta: 0.5, phi: 1.18, radius: 160, radiusGoal: 160, vTheta: 0, vPhi: 0, idle: 0 };
function updateCamera(dt) {
  if (ctl.goal) {
    ctl.target.lerp(ctl.goal, 1 - Math.exp(-dt * 3.2));
    if (ctl.target.distanceTo(ctl.goal) < 0.05) ctl.goal = null;
  }
  ctl.radius += (ctl.radiusGoal - ctl.radius) * (1 - Math.exp(-dt * 5));
  ctl.theta += ctl.vTheta; ctl.phi += ctl.vPhi;
  const damp = Math.exp(-dt * 6);
  ctl.vTheta *= damp; ctl.vPhi *= damp;
  ctl.idle += dt;
  if (state.autoRotate && ctl.idle > 3) ctl.theta += dt * 0.05;
  ctl.phi = Math.min(Math.PI - 0.15, Math.max(0.15, ctl.phi));
  ctl.radiusGoal = Math.min(1400, Math.max(8, ctl.radiusGoal));
  const sp = Math.sin(ctl.phi);
  camera.position.set(ctl.target.x + ctl.radius * sp * Math.sin(ctl.theta), ctl.target.y + ctl.radius * Math.cos(ctl.phi), ctl.target.z + ctl.radius * sp * Math.cos(ctl.theta));
  camera.lookAt(ctl.target);
}
function flyTo(v, radius) {
  ctl.goal = toWorld(v); // v는 root 안의 좌표
  if (radius) ctl.radiusGoal = radius;
}
function fitRange(y0, y1) {
  const w = (y1 - y0) * YS + 30;
  const tanV = Math.tan((camera.fov * Math.PI) / 360);
  ctl.goal = toWorld(new T.Vector3(xOf((y0 + y1) / 2), 0, 0));
  ctl.radiusGoal = vertical
    ? Math.max(60, Math.max(w / 2 / tanV, 50 / (tanV * camera.aspect)))
    : Math.max(60, Math.max(70 / tanV, w / 2 / (tanV * camera.aspect)));
}

function setupControls() {
  const pointers = new Map();
  let downAt = null, mode = null, lastPinch = 0, lastMid = null;
  const panBy = (dx, dy) => {
    const s = ctl.radius * 0.0014;
    const right = new T.Vector3().setFromMatrixColumn(camera.matrix, 0);
    const up = new T.Vector3().setFromMatrixColumn(camera.matrix, 1);
    ctl.target.addScaledVector(right, -dx * s).addScaledVector(up, dy * s);
    ctl.goal = null;
  };
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  canvas.addEventListener('touchend', (e) => { if (e.cancelable) e.preventDefault(); }, { passive: false });
  canvas.addEventListener('pointerdown', (e) => {
    canvas.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    ctl.idle = 0;
    if (pointers.size === 1) {
      downAt = { x: e.clientX, y: e.clientY, t: performance.now() };
      mode = e.button === 2 || e.shiftKey || e.ctrlKey || e.metaKey ? 'pan' : 'rotate';
    } else if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      lastPinch = Math.hypot(a.x - b.x, a.y - b.y);
      lastMid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      mode = 'pinch'; downAt = null;
    }
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!pointers.has(e.pointerId)) { hoverQ = { x: e.clientX, y: e.clientY }; return; }
    const prev = pointers.get(e.pointerId);
    const dx = e.clientX - prev.x, dy = e.clientY - prev.y;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    ctl.idle = 0;
    if (downAt && Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y) > 8) { downAt = null; canvas.classList.add('dragging'); hideTip(); }
    if (downAt) return;
    if (mode === 'rotate') { ctl.vTheta = -dx * 0.0055; ctl.vPhi = -dy * 0.0045; }
    else if (mode === 'pan') panBy(dx, dy);
    else if (mode === 'pinch' && pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      if (lastPinch) { ctl.radiusGoal *= lastPinch / d; ctl.radius = ctl.radiusGoal; }
      if (lastMid) panBy(mid.x - lastMid.x, mid.y - lastMid.y);
      lastPinch = d; lastMid = mid;
    }
  });
  const end = (e) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.delete(e.pointerId);
    canvas.classList.remove('dragging');
    if (downAt && pointers.size === 0 && performance.now() - downAt.t < 600) clickAt(e.clientX, e.clientY);
    downAt = null;
    if (pointers.size === 1) { mode = 'rotate'; lastPinch = 0; lastMid = null; }
  };
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);
  canvas.addEventListener('pointerleave', () => { if (!pointers.size) setHover(null); });
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    ctl.idle = 0;
    ctl.radiusGoal *= Math.exp(e.deltaY * (e.deltaMode === 1 ? 0.05 : 0.0012));
  }, { passive: false });
  canvas.tabIndex = 0;
  canvas.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') setYear(state.year - 1, true);
    else if (e.key === 'ArrowRight') setYear(state.year + 1, true);
    else if (e.key === 'ArrowUp') ctl.vPhi = -0.05;
    else if (e.key === 'ArrowDown') ctl.vPhi = 0.05;
    else if (e.key === '+' || e.key === '=') ctl.radiusGoal *= 0.8;
    else if (e.key === '-') ctl.radiusGoal *= 1.25;
    else if (e.key === 'Escape') { if (state.route) setRoute(false); else select(null); }
    else return;
    e.preventDefault(); ctl.idle = 0;
  });
  $('zoomIn').addEventListener('click', () => { ctl.radiusGoal *= 0.72; });
  $('zoomOut').addEventListener('click', () => { ctl.radiusGoal *= 1.38; });
  $('zoomFit').addEventListener('click', () => { const s = state.persons.get(state.subject); fitRange(s.b - 40, s.d + 30); });
}

// ── 고르기 ───────────────────────────────────────────────
const ray = new T.Raycaster();
const ndc = new T.Vector2();
const P_LIST = () => [...state.persons.values()];
function pick(x, y) {
  const rect = canvas.getBoundingClientRect();
  ndc.set(((x - rect.left) / rect.width) * 2 - 1, -((y - rect.top) / rect.height) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  const hits = [];
  beads.boundingSphere = null; gems.boundingSphere = null; pickLife.boundingSphere = null;
  const hb = ray.intersectObject(beads, false)[0];
  if (hb) hits.push({ d: hb.distance, sel: { kind: 'p', id: P_LIST()[hb.instanceId].id } });
  if (state.show.event) {
    const hg = ray.intersectObject(gems, false)[0];
    if (hg) hits.push({ d: hg.distance - 1, sel: { kind: 'e', id: [...state.events.values()][hg.instanceId].id } });
  }
  const hl = ray.intersectObject(pickLife, false)[0];
  if (hl) hits.push({ d: hl.distance + 2, sel: { kind: 'p', id: P_LIST()[hl.instanceId].id } });
  hits.sort((a, b) => a.d - b.d);
  return hits[0] ? hits[0].sel : null;
}
let hoverQ = null;
function setHover(sel) {
  const same = (a, b) => (!a && !b) || (a && b && a.kind === b.kind && a.id === b.id);
  if (!same(sel, state.hovered)) { state.hovered = sel; dirty = true; }
  canvas.classList.toggle('pointing', !!sel);
  if (!sel) hideTip();
}
function processHover() {
  if (!hoverQ) return;
  const { x, y } = hoverQ;
  hoverQ = null;
  const sel = pick(x, y);
  setHover(sel);
  if (sel) showTip(sel, x, y);
}
function clickAt(x, y) {
  const sel = pick(x, y);
  if (!sel) { if (isNarrow()) select(null); return; }
  haptic(10);
  select(sel, true);
}
function select(sel, fly) {
  state.selected = sel;
  dirty = true;
  // 경로만 보기 중에는 새로 고른 대상까지의 경로로 바꾼다(빈 곳을 누르면 그대로 둔다).
  const onRoute = state.route && sel && (sel.kind === 'p' ? state.route.ps.has(sel.id) : state.route.event === sel.id);
  if (state.route && sel && !onRoute) { state.route = routeFor(sel); renderRouteBar(); if (state.route) { renderInfo(); fitRoute(); return; } }
  if (onRoute) fly = false;
  renderInfo();
  if (sel && fly) {
    if (sel.kind === 'p') { const p = state.persons.get(sel.id); flyTo(new T.Vector3(p.beadNow.x, p.y * 0.5, p.z * 0.5)); }
    else { const e = state.events.get(sel.id); flyTo(e.pos); setYear(e.from, false); }
  }
}

// ── 툴팁·이름표 ──────────────────────────────────────────
const tip = $('tip');
function showTip(sel, x, y) {
  if (sel.kind === 'p') {
    const p = state.persons.get(sel.id);
    const rel = relationToSubject(p.id);
    tip.style.setProperty('--c', '#' + p.color.getHexString(T.SRGBColorSpace));
    tip.innerHTML = `<b>${esc(p.ko)} <small>${esc(p.en)}</small></b><span class="t">${esc(p.title)}</span><div>${esc(lifeText(p))}${rel ? ` · ${esc(rel.term)}` : ''}</div>`;
  } else {
    const e = state.events.get(sel.id);
    tip.style.setProperty('--c', '#' + e.color.getHexString(T.SRGBColorSpace));
    tip.innerHTML = `<b>${esc(e.ko)}</b><span class="t">${esc(typeOf(e.type).name)}</span> ${evYears(e)}<div>${e.place ? `${esc(e.place)} · ` : ''}관련 인물 ${e.people.length}명</div>`;
  }
  tip.hidden = false;
  const W = window.innerWidth, H = window.innerHeight;
  tip.style.left = `${Math.min(W - tip.offsetWidth - 10, x + 16)}px`;
  tip.style.top = `${Math.min(H - tip.offsetHeight - 10, Math.max(10, y + 16))}px`;
}
function hideTip() { tip.hidden = true; }

const labelBox = $('labels');
const labels = [];
function buildLabels() {
  labelBox.replaceChildren();
  labels.length = 0;
  for (const p of state.persons.values()) {
    const el = document.createElement('div');
    el.className = 'lbl' + (p.id === state.subject ? ' ego' : '');
    el.style.setProperty('--c', '#' + p.color.getHexString(T.SRGBColorSpace));
    el.innerHTML = `<b>${esc(p.ko)}</b><span>${esc(lifeText(p))}</span>`;
    labelBox.append(el);
    labels.push({ kind: 'p', obj: p, el, pos: p.beadNow, base: p.id === state.subject ? 140 : 20 + (p.events.length + p.kids.length) * 2 });
  }
  for (const e of state.events.values()) {
    const el = document.createElement('div');
    el.className = 'lbl ev';
    el.style.setProperty('--c', '#' + e.color.getHexString(T.SRGBColorSpace));
    el.innerHTML = `<b>${esc(e.ko)}</b><span>${evYears(e)}</span>`;
    labelBox.append(el);
    labels.push({ kind: 'e', obj: e, el, pos: e.pos, base: 40 + e.people.length * 2 + (evSize(e) > 1 ? 20 : 0) });
  }
  const meta = state.meta;
  for (let y = Math.ceil(meta.range[0] / 50) * 50; y <= meta.range[1]; y += 50) {
    const el = document.createElement('div');
    el.className = 'year' + (y % 100 === 0 ? ' century' : '');
    el.textContent = y;
    labelBox.append(el);
    labels.push({ kind: 'y', el, pos: new T.Vector3(xOf(y), -(y % 100 === 0 ? 3.8 : 3), 0), base: 1000 });
  }
  for (const era of meta.eras) {
    const el = document.createElement('div');
    el.className = 'era';
    el.style.setProperty('--c', era.color);
    el.innerHTML = `<b>${esc(era.name)}</b><span>${era.from}–${era.to}</span>`;
    labelBox.append(el);
    labels.push({ kind: 'era', obj: era, el, pos: new T.Vector3(xOf(era.from) + 1, -40, 0), base: 500 });
  }
  for (const g of meta.groups) {
    const list = [...state.persons.values()].filter((p) => p.group === g.id && p.id !== state.subject);
    if (!list.length) continue;
    const minB = Math.min(...list.map((p) => p.b));
    const a = groupAngle(g.id) * DEG;
    const el = document.createElement('div');
    el.className = 'grp';
    el.style.setProperty('--c', g.color);
    el.textContent = g.name;
    labelBox.append(el);
    labels.push({ kind: 'g', obj: g, el, pos: new T.Vector3(xOf(minB) - 6, Math.sin(a) * (R0 + 2), Math.cos(a) * (R0 + 2)), base: 480 });
  }
}
const _p = new T.Vector3();
function updateLabels() {
  const W = canvas.clientWidth, H = canvas.clientHeight;
  const cam = camera.position;
  const sel = state.selected, hov = state.hovered;
  const rel = relatedSets();
  const items = [];
  // 시대 판이 보이면 카메라에서 볼 때 판 뒤에 있는 이름표도 숨긴다.
  const planeOn = cursor.visible && cursor.material.depthWrite;
  const camL = planeOn ? toLocal(cam) : null, px = cursor.position.x;
  const behindPlane = (pos) => {
    if (!planeOn || (camL.x - px) * (pos.x - px) >= 0) return false;
    const t = (px - camL.x) / (pos.x - camL.x);
    const y = camL.y + t * (pos.y - camL.y), z = camL.z + t * (pos.z - camL.z);
    return y * y + z * z < 40 * 40;
  };
  for (const L of labels) {
    if (L.kind === 'era') { L.el.style.display = state.show.era ? '' : 'none'; if (!state.show.era) continue; }
    if (L.kind === 'e' && !state.show.event && !(state.route && state.route.event === L.obj.id)) { L.el.style.opacity = '0'; continue; }
    if (state.route && (L.kind === 'p' || L.kind === 'e') && !(L.kind === 'p' ? state.route.ps.has(L.obj.id) : state.route.event === L.obj.id)) { L.el.style.opacity = '0'; continue; }
    if (state.route && L.kind === 'g') { L.el.style.opacity = '0'; continue; }
    if (L.kind !== 'era' && behindPlane(L.pos) && !(sel && L.obj && sel.id === L.obj.id)) { L.el.style.opacity = '0'; continue; }
    const dist = cam.distanceTo(vertical ? toWorld(L.pos) : L.pos);
    let pri = L.base;
    if (L.kind === 'p' || L.kind === 'e') {
      const id = L.obj.id, k = L.kind;
      if (hov && hov.kind === k && hov.id === id) pri = 300;
      else if (sel && sel.kind === k && sel.id === id) pri = 250;
      else if (state.route) pri = 250; // 경로 인물은 몇 명뿐이라 겹쳐도 모두 보인다
      else if (rel && (k === 'p' ? rel.ps : rel.es).has(id)) pri += 80;
      if (state.timeFocus && L.kind === 'p' && aliveAt(L.obj, state.year)) pri += 40;
      if (state.timeFocus && L.kind === 'e' && L.obj.from - 1 <= state.year && state.year <= L.obj.to + 1) pri += 60;
      if ((L.obj.vis ?? 1) < 0.5 && pri < 200) pri -= 60;
    }
    items.push({ L, dist, pri });
  }
  items.sort((a, b) => (b.pri - a.pri) || (a.dist - b.dist));
  const placed = [];
  const near = isNarrow() ? 110 : 170;
  for (const { L, dist, pri } of items) {
    _p.copy(L.pos);
    if (L.kind === 'p') _p.y += 1.2; else if (L.kind === 'e') _p.y += 1.6;
    if (vertical) root.localToWorld(_p);
    _p.project(camera);
    const x = (_p.x * 0.5 + 0.5) * W, y = (-_p.y * 0.5 + 0.5) * H;
    let show = _p.z < 1 && _p.z > -1 && x > -100 && x < W + 100 && y > -40 && y < H + 40;
    if (show && (L.kind === 'p' || L.kind === 'e')) show = pri >= 200 || dist < near || (pri >= 120 && dist < near * 1.8);
    if (show && L.kind === 'year') show = true;
    if (show && pri < 1000) {
      if (!L.w) { L.w = L.el.offsetWidth; L.h = L.el.offsetHeight; }
      const rect = { l: x - L.w / 2 - 3, r: x + L.w / 2 + 3, t: y - L.h - 2, b: y + 2 };
      if (pri < 250 || L.kind === 'era' || L.kind === 'g') for (const q of placed) if (rect.l < q.r && rect.r > q.l && rect.t < q.b && rect.b > q.t) { show = false; break; }
      if (show) placed.push(rect);
    }
    if (!show) { if (L.el.style.opacity !== '0') L.el.style.opacity = '0'; continue; }
    const fade = pri >= 200 ? 1 : Math.max(0.35, Math.min(1, 1.3 - dist / (near * 1.4)));
    L.el.style.opacity = String(L.kind === 'g' ? Math.min(0.85, 260 / dist) : fade);
    L.el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, ${L.kind === 'year' || L.kind === 'era' || L.kind === 'g' ? '-50%' : '-100%'})`;
    L.el.style.zIndex = String(Math.min(999, Math.round(pri)));
    L.el.classList.toggle('sel', !!(sel && L.obj && sel.id === L.obj.id));
    L.el.classList.toggle('hov', !!(hov && L.obj && hov.id === L.obj.id));
  }
}

// ── 상세 카드 ────────────────────────────────────────────
function chip(kind, id, extra = '') {
  const o = kind === 'p' ? state.persons.get(id) : state.events.get(id);
  const c = '#' + o.color.getHexString(T.SRGBColorSpace);
  return `<button type="button" class="go" data-go="${kind}:${id}" style="--c:${c}">${esc(o.ko)}${extra ? `<small>${esc(extra)}</small>` : ''}</button>`;
}
// 바깥 고리: 자료에 출처(links)가 있으면 그것을, 없으면 영문 위키백과
const linkBtns = (o) => o.links && o.links.length
  ? o.links.map((l, i) => `<a class="glass-btn" href="${esc(l.url)}" target="_blank" rel="noopener" title="${esc(l.title)}">${i ? `출처 ${i + 1}` : '출처'}</a>`).join('')
  : `<a class="glass-btn" href="${wikiUrl(o.wiki, o.en)}" target="_blank" rel="noopener">위키백과</a>`;
const wikiUrl = (wiki, en) => wiki ? `https://en.wikipedia.org/wiki/${encodeURIComponent(wiki).replace(/%2F/g, '/')}` : `https://en.wikipedia.org/w/index.php?search=${encodeURIComponent(en)}`;
// 경로 단추: 중심 인물까지 이어지는 길이 있을 때만(광명의 오늘의 명사처럼 사건으로만 이어진 사람은 없다)
const routeBtn = () => !state.route && !routeFor(state.selected) ? '' : `<button type="button" class="glass-btn primary" data-act="route">${state.route ? '모두 보기' : `${esc(state.persons.get(state.subject).ko)}까지 경로만 보기`}</button>`;
function renderInfo() {
  const box = $('info');
  const sel = state.selected;
  if (!sel) { box.hidden = true; return; }
  let html;
  if (sel.kind === 'p') {
    const p = state.persons.get(sel.id);
    const g = groupOf(p.group);
    const rel = relationToSubject(p.id);
    const path = p.id === state.subject ? null : pathFromSubject(p.id);
    const sub = state.persons.get(state.subject);
    const fam = [
      p.f || p.m ? `<dt>부모</dt><dd>${[p.f, p.m].filter(Boolean).map((x) => chip('p', x)).join('')}</dd>` : '',
      p.spouses.length ? `<dt>배우자·연인</dt><dd>${p.spouses.map((s) => chip('p', s.id, `${s.kind === 'l' ? '연인 ' : ''}${s.year}`)).join('')}</dd>` : '',
      p.kids.length ? `<dt>자녀</dt><dd>${p.kids.map((k) => chip('p', k)).join('')}</dd>` : '',
      p.rels.length ? `<dt>관계</dt><dd>${p.rels.map((r) => chip('p', r.id, REL_KO[r.type] || r.type)).join('')}</dd>` : '',
      p.events.length ? `<dt>사건</dt><dd>${p.events.sort((a, b) => state.events.get(a.id).from - state.events.get(b.id).from).map((e) => chip('e', e.id, state.events.get(e.id).from)).join('')}</dd>` : '',
    ].join('');
    box.style.setProperty('--c', g.color);
    html = `
      <p class="kicker">${esc(g.name)}</p>
      <h2>${esc(p.ko)}<small>${esc(p.en)}</small></h2>
      <div class="rel"><b>${esc(rel ? rel.term : p.title)}</b><span>${esc(lifeText(p))}${p.life ? '' : ` · 향년 ${p.d - p.b}`}</span></div>
      <p class="note">${esc(p.title)}${rel && rel.chon != null && p.id !== state.subject ? ` · ${esc(sub.ko)}와 ${rel.chon ? `${rel.chon}촌` : '무촌'}` : ''}</p>
      ${p.note ? `<p class="note more">${esc(p.note)}</p>` : ''}
      ${path && path.length > 2 ? `<div class="path"><span>${esc(sub.ko)}에서 이어지는 길</span>${path.map((x) => chip('p', x)).join('<i>›</i>')}</div>` : ''}
      <dl class="fam">${fam}</dl>
      <div class="acts">${linkBtns(p)}
        <button type="button" class="glass-btn" data-act="year" data-y="${Math.round((p.b + p.d) / 2)}">그 시대로</button>
        ${p.id !== state.subject ? routeBtn() : ''}</div>`;
  } else {
    const e = state.events.get(sel.id);
    const t = typeOf(e.type);
    box.style.setProperty('--c', t.color);
    html = `
      <p class="kicker">${esc(t.name)} · ${esc(eraAt(e.from).name)}</p>
      <h2>${esc(e.ko)}<small>${esc(e.en)}</small></h2>
      <div class="rel"><b>${evYears(e)}</b><span>${esc(e.place)}</span></div>
      <p class="note">${esc(e.summary)}</p>
      <dl class="fam"><dt>관련 인물</dt><dd>${e.people.map(([pid, role]) => chip('p', pid, role)).join('')}</dd></dl>
      <div class="acts">${linkBtns(e)}
        <button type="button" class="glass-btn" data-act="year" data-y="${e.from}">그 해로</button>
        ${routeBtn()}</div>`;
  }
  box.innerHTML = `<button type="button" class="close" aria-label="닫기"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10.25"/><path d="M8.6 8.6l6.8 6.8M15.4 8.6l-6.8 6.8"/></svg></button>${html}`;
  if (box.hidden) box._openedAt = performance.now();
  box.hidden = false;
  box.scrollTop = 0;
}
function setupInfo() {
  const box = $('info');
  box.addEventListener('click', (ev) => {
    if (performance.now() - (box._openedAt || 0) < 400) return;
    const go = ev.target.closest('[data-go]');
    if (go) { haptic(8); const [k, id] = go.dataset.go.split(':'); select({ kind: k, id }, true); return; }
    const act = ev.target.closest('[data-act]');
    if (act && act.dataset.act === 'route') { haptic(12); setRoute(!state.route); if (isNarrow() && state.route) $('info').hidden = true; return; }
    if (act) { haptic(8); setYear(+act.dataset.y, true); return; }
    if (ev.target.closest('a')) return;
    if (ev.target.closest('.close') || isNarrow()) { haptic(8); select(null); }
  });
}

// ── 연도 커서와 재생 ─────────────────────────────────────
function setYear(y, focus) {
  const [a, b] = state.meta.range;
  state.year = Math.max(a, Math.min(b, Math.round(y)));
  if (focus) state.timeFocus = true;
  $('year').value = state.year;
  $('yearText').textContent = state.year;
  const era = eraAt(state.year);
  $('eraText').textContent = era.name;
  $('timebar').style.setProperty('--c', era.color);
  $('timeFocus').checked = state.timeFocus;
  // 시간 따라가기: 카메라를 매번 가운데로 옮기지 않고, 막이 화면 가장자리에 다가갈 때만 장면을 민다(keepCursorInView).
  if (focus) cursorMovedAt = performance.now() / 1000; // 실제 시각(느린 기기에서 clock은 늦게 흐른다)
  dirty = true;
}
function setupTimebar() {
  const [a, b] = state.meta.range;
  const r = $('year');
  r.min = a; r.max = b; r.value = state.year;
  r.addEventListener('input', () => setYear(+r.value, true));
  $('play').addEventListener('click', () => {
    state.playing = !state.playing;
    $('play').classList.toggle('on', state.playing);
    $('play').setAttribute('aria-label', state.playing ? '멈춤' : '재생');
    if (state.playing && state.year >= b) setYear(a, true);
    haptic(8);
  });
  // 시대 띠를 타임바 아래에 그린다
  const bands = $('eraBands');
  bands.replaceChildren(...state.meta.eras.map((e) => {
    const s = document.createElement('i');
    s.style.left = `${((e.from - a) / (b - a)) * 100}%`;
    s.style.width = `${((e.to - e.from) / (b - a)) * 100}%`;
    s.style.background = e.color;
    s.title = `${e.name} (${e.from}–${e.to})`;
    return s;
  }));
  // 중심 인물의 생애 표시
  const S = state.persons.get(state.subject);
  const life = $('lifeMark');
  life.style.left = `${((S.b - a) / (b - a)) * 100}%`;
  life.style.width = `${((S.d - S.b) / (b - a)) * 100}%`;
  life.title = `${S.ko} ${S.b}–${S.d}`;
}

// 연도 막에 걸린 구슬: 그해 살아 있는 인물의 구슬이 생애선을 따라 막과 만나는 자리로 미끄러져 와
// 막 위에 걸리고, 조금 커지며 맥동하듯 빛난다. 강조를 끄면 생애 가운데의 제자리로 돌아간다(매 프레임).
const _bm = new T.Matrix4(), _bq = new T.Quaternion(), _bs = new T.Vector3(), _bt = new T.Vector3();
function updateBeads(vis, dt) {
  const yNow = cursor.position.x / YS + X0;
  const k = 1 - Math.exp(-dt * 7);
  const sp = beads.geometry.attributes.aParams;
  let n = 0;
  for (const p of state.persons.values()) {
    const hidden = state.route && !state.route.ps.has(p.id);
    const caught = vis > 0.01 && p.b <= yNow && yNow <= p.d && !hidden;
    if (caught) n++;
    p.onPlane += ((caught ? 1 : 0) - p.onPlane) * k;
    if (caught) _bt.set(cursor.position.x, p.y, p.z); else _bt.copy(p.bead);
    p.beadNow.lerp(_bt, caught ? Math.min(1, k * 2.2) : k);
    const base = p.id === state.subject ? 2.0 : 0.95;
    const pulse = 1 + 0.06 * Math.sin(clock * 5 + p.index) * p.onPlane;
    const r = hidden ? 0 : base * (1 + 0.32 * p.onPlane) * pulse;
    _bm.compose(p.beadNow, _bq, _bs.set(r, r, r));
    beads.setMatrixAt(p.index, _bm);
    // 걸린 구슬은 강조 빛을 더한다(선택·마우스 강조가 있으면 그쪽이 우선).
    const hl = sp.getY(p.index);
    if (hl < 0.8) sp.setY(p.index, 0.55 * p.onPlane * (0.75 + 0.25 * Math.sin(clock * 4 + p.index)));
  }
  beads.instanceMatrix.needsUpdate = true;
  sp.needsUpdate = true;
  beads.boundingSphere = null;
  $('aliveText').textContent = state.timeFocus ? `· 그해 살아 있던 인물 ${n}명` : '';
}

// 연도 막을 화면 안에 붙잡아 둔다. 막이 가장자리 쪽 안전 구역(화면 길이의 15%)을 넘어가려 하면
// 막은 그 자리에 두고 카메라(장면)를 시간 방향으로 밀어 막이 화면 밖으로 나가지 않게 한다.
// 연도를 바꾸는 중(막이 움직인 뒤 잠시)에만 동작해, 사용자가 카메라를 돌려 볼 때는 방해하지 않는다.
let cursorMovedAt = -10;
const SAFE = 0.15; // 보이는 영역 양 끝에서 이만큼(비율) 안쪽에 막이 머문다
const _cv = new T.Vector3();
// 시간 방향으로 막이 보이는 범위(정규화 화면 좌표 -1~1). 세로형에서는 위 제목과 아래 타임바에 가리는 곳을 뺀다.
function cursorBounds() {
  if (!vertical) return [-1, 1];
  const r = canvas.getBoundingClientRect();
  const h = r.height || 1;
  const top = document.querySelector('.hud-top .brand')?.getBoundingClientRect().bottom ?? r.top;
  const bottom = $('timebar').getBoundingClientRect().top;
  const lo = (2 * (top - r.top)) / h - 1, hi = (2 * (bottom - r.top)) / h - 1;
  return hi - lo > 0.4 ? [lo, hi] : [-1, 1];
}
function keepCursorInView(dt) {
  if (!state.follow || !state.timeFocus || performance.now() / 1000 - cursorMovedAt > 2.5) return;
  camera.updateMatrixWorld();
  const target = new T.Vector3(xOf(state.year), 0, 0); // 막이 가 있을 자리(움직이는 중이어도 목표 기준)
  _cv.copy(toWorld(target)).project(camera);
  const along = vertical ? -_cv.y : _cv.x; // 시간이 흐르는 화면 방향의 좌표(뒤로 갈수록 +)
  const behind = _cv.z > 1;
  const [lo0, hi0] = cursorBounds();
  const pad = (hi0 - lo0) * SAFE, lo = lo0 + pad, hi = hi0 - pad;
  let over = 0;
  // 먼 해로 단번에 옮겨 막이 카메라 뒤나 화면 밖 멀리로 가면(투영 값이 뒤집히거나 아주 커진다) 밀지 않고 그 해로 날아간다.
  if (behind || along > hi + 2 || along < lo - 2) {
    const goal = toWorld(new T.Vector3(xOf(state.year), 0, 0));
    if (!ctl.goal || ctl.goal.distanceTo(goal) > 1) ctl.goal = goal;
    return;
  }
  if (along > hi) over = along - hi;
  else if (along < lo) over = along - lo;
  if (!over) return;
  // 화면 반 폭(또는 반 높이)이 몇 단위인지로 넘친 만큼을 시간 축 거리로 바꿔 민다.
  const half = ctl.radius * Math.tan((camera.fov * Math.PI) / 360) * (vertical ? 1 : camera.aspect);
  const dir = toWorld(new T.Vector3(1, 0, 0)).sub(toWorld(new T.Vector3(0, 0, 0))).normalize();
  const shift = over * half * Math.min(1, dt * 12);
  ctl.target.addScaledVector(dir, shift);
  if (ctl.goal) ctl.goal.addScaledVector(dir, shift);
}

// ── 시작 ────────────────────────────────────────────────
function resize() {
  const w = canvas.clientWidth || window.innerWidth, h = canvas.clientHeight || window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  post.setSize(w, h, renderer.getPixelRatio());
  for (const L of labels) L.w = 0;
  if (state.orient === 'auto' && root) applyOrient(); // 휴대폰을 돌리면 방향도 따라 바뀐다
}
let last = performance.now(), clock = 0, playAcc = 0;
function frame(now) {
  requestAnimationFrame(frame);
  if (document.hidden) { last = now; return; }
  const dt = Math.min(1 / 30, (now - last) / 1000);
  const realDt = Math.min(0.25, (now - last) / 1000);
  last = now;
  clock += dt;
  fx.uTime.value = clock;
  if (state.playing) {
    playAcc += dt * 8; // 1초에 8년
    if (playAcc >= 1) { const n = Math.floor(playAcc); playAcc -= n; setYear(state.year + n, true); if (state.year >= state.meta.range[1]) { state.playing = false; $('play').classList.remove('on'); } }
  }
  processHover();
  if (dirty) refresh();
  const cv = cursor.material.uniforms.uVis;
  cv.value += ((state.timeFocus ? 1 : 0) - cv.value) * 0.1;
  // 시대 판(막의 원판)은 끌 수 있다. 꺼 두어도 연도를 옮기거나 재생하는 동안에는 보였다가 잠시 뒤 사라진다.
  const pv = cursor.material.uniforms.uPlane;
  const planeOn = state.showPlane || state.playing || now / 1000 - cursorMovedAt < 1.5;
  pv.value += ((planeOn ? 1 : 0) - pv.value) * (1 - Math.exp(-realDt * (planeOn ? 14 : 5))); // 시간 기준(약 0.6초에 사라짐)
  cursor.visible = cv.value * pv.value > 0.01;
  // 충분히 보일 때만 깊이를 써서 판 뒤의 선·구슬을 가린다(사라지는 중에 보이지 않는 벽이 남지 않게).
  cursor.material.depthWrite = cv.value * pv.value > 0.6;
  cursor.position.x += (xOf(state.year) - cursor.position.x) * 0.25;
  updateBeads(cv.value, dt);
  cursor.material.uniforms.uColor.value.set(eraAt(state.year).color).lerp(new T.Color('#9fe8ff'), 0.4);
  keepCursorInView(dt);
  updateCamera(dt);
  post.render();
  updateLabels();
}

function main() {
  const sets = window.WORLD_DATASETS || [];
  if (!sets.length) throw new Error('시간 축 자료(WORLD_DATASETS)를 불러오지 못했습니다');
  try { const o = localStorage.getItem('genealogy.world.orient'); if (o === 'h' || o === 'v' || o === 'auto') state.orient = o; } catch (err) { /* 기본값 */ }
  if (!initGL()) return;
  const byId = new Map(sets.map((d) => [d.meta.id, d]));
  const data = byId.get(decodeURIComponent(location.hash.slice(1))) || sets[0];
  if (sets.length < 2) $('dataset').closest('.field')?.remove(); // 주제가 하나면 고르는 칸을 숨긴다
  $('dataset').replaceChildren(...sets.map((d) => new Option(d.meta.title, d.meta.id)));
  $('dataset').value = data.meta.id;
  $('dataset').addEventListener('change', (e) => { location.hash = e.target.value; location.reload(); });
  loadData(data);
  document.title = data.meta.page || `${data.meta.title} · 세계사 연관도`;
  $('title').textContent = data.meta.title;
  $('subtitle').textContent = `인물 ${state.persons.size}명 · 사건 ${state.events.size}개 · ${data.meta.range[0]}–${data.meta.range[1]}`;
  buildScene();
  buildLabels();
  // 범례
  $('legendGroups').innerHTML = state.meta.groups.map((g) => `<li><i class="dot" style="background:${g.color};box-shadow:0 0 6px ${g.color}"></i>${esc(g.name)}</li>`).join('');
  $('legendEvents').innerHTML = Object.values(state.meta.eventTypes).map((t) => `<li><i class="gem" style="background:${t.color}"></i>${esc(t.name)}</li>`).join('');
  // 찾기
  const all = [...[...state.persons.values()].map((p) => ({ k: 'p', id: p.id, label: `${p.ko} (${p.en})` })), ...[...state.events.values()].map((e) => ({ k: 'e', id: e.id, label: `${e.ko} (${e.from})` }))];
  $('people').replaceChildren(...all.map((x) => { const o = document.createElement('option'); o.value = x.label; return o; }));
  $('find').addEventListener('change', (ev) => {
    const q = ev.target.value.trim().toLowerCase();
    if (!q) return;
    const hit = all.find((x) => x.label.toLowerCase() === q) || all.find((x) => x.label.toLowerCase().includes(q));
    if (!hit) return;
    select({ kind: hit.k, id: hit.id }, true);
    ctl.radiusGoal = Math.min(ctl.radiusGoal, 70);
    ev.target.value = ''; ev.target.blur();
  });
  // 표시 칩
  for (const k of ['family', 'union', 'event', 'relation', 'era']) {
    const el = $(`show_${k}`);
    el.checked = state.show[k];
    el.addEventListener('change', () => { state.show[k] = el.checked; dirty = true; });
  }
  $('timeFocus').addEventListener('change', (e) => { state.timeFocus = e.target.checked; dirty = true; });
  try { state.showPlane = localStorage.getItem('genealogy.world.plane') !== '0'; } catch (err) { /* 기본값 */ }
  $('showPlane').checked = state.showPlane;
  $('showPlane').addEventListener('change', (e) => {
    state.showPlane = e.target.checked;
    try { localStorage.setItem('genealogy.world.plane', state.showPlane ? '1' : '0'); } catch (err) { /* 저장 불가: 무시 */ }
  });
  $('follow').checked = state.follow;
  $('follow').addEventListener('change', (e) => { state.follow = e.target.checked; });
  try { const k = parseFloat(localStorage.getItem('genealogy.world.lineK')); if (k >= 0.3 && k <= 2) state.lineK = k; } catch (err) { /* 기본값 */ }
  $('lineK').value = state.lineK;
  $('lineK').addEventListener('input', (e) => {
    state.lineK = +e.target.value;
    try { localStorage.setItem('genealogy.world.lineK', String(state.lineK)); } catch (err) { /* 저장 불가: 무시 */ }
    dirty = true;
  });
  $('orient').value = state.orient;
  $('orient').addEventListener('change', (e) => {
    state.orient = e.target.value;
    try { localStorage.setItem('genealogy.world.orient', state.orient); } catch (err) { /* 저장 불가: 무시 */ }
    applyOrient();
  });
  $('autoRotate').checked = state.autoRotate;
  $('autoRotate').addEventListener('change', (e) => { state.autoRotate = e.target.checked; });
  $('toggleControls').addEventListener('click', () => {
    const on = !document.body.classList.contains('controls-open');
    document.body.classList.toggle('controls-open', on);
    $('toggleControls').setAttribute('aria-expanded', String(on));
  });
  setupControls();
  setupInfo();
  $('routeBar').addEventListener('click', (ev) => {
    const go = ev.target.closest('[data-go]');
    if (go) { haptic(8); const [k, id] = go.dataset.go.split(':'); select({ kind: k, id }, true); return; }
    if (ev.target.closest('[data-act="route-off"]')) { haptic(8); setRoute(false); }
  });
  setupTimebar();
  setYear(data.meta.startYear ?? 1661, false);
  window.addEventListener('resize', resize);
  resize();
  // 멀리서 시작해 중심 인물의 시대로 다가간다.
  const S = state.persons.get(state.subject);
  ctl.target.copy(toWorld(new T.Vector3(xOf(S.b + 20), 0, 0)));
  ctl.radius = 420;
  if (vertical) { ctl.theta = 0.45; ctl.phi = 1.5; }
  if (!vertical && isNarrow()) fitRange(...(data.meta.focus || [1650, 1695])); // 좁은 화면을 가로로 쓸 때는 한 세대쯤만
  else fitRange(S.b - 12, S.d + 8);
  if (!isNarrow()) select({ kind: 'p', id: state.subject }, false);
  requestAnimationFrame(frame);
  window.__world = { state, ctl, select, setYear, setRoute, camera: () => camera, plane: () => +cursor.material.uniforms.uPlane.value.toFixed(2), cursorNdc: () => { const v = toWorld(new T.Vector3(xOf(state.year), 0, 0)).project(camera); return +(vertical ? -v.y : v.x).toFixed(2); }, relationToSubject, pathFromSubject, routeTo };
}

main();
})();
