// 버블 가계도: 시조의 자손을 3D 구슬로 그린다.
//   · 세대는 위에서 아래로 층을 이루고, 기준 인물의 직계 조상은 가운데 세로축에 선다.
//   · 구슬을 누르면 그 사람의 자녀가 구슬에서 흘러나오고(펼치기), 다시 누르면 구슬 안으로 들어간다(접기).
//     접힌 자손이 있는 구슬은 반투명 껍질(버블)을 두르고, 자손 수만큼 커진다.
//   · 색은 기준 인물과의 관계: 직계(금), 방계(가까울수록 청록 → 멀수록 보라), 배우자(분홍), 미상(회색).
//   · 렌더링: three.js(r158, vendor/) + 직접 쓴 셰이더(유리 구슬, 흐르는 연결선, 성운 배경, 홀로그램 바닥)
//     와 HDR 블룸 후처리. 배치는 세대 높이를 고정한 간단한 힘 기반 시뮬레이션이다.
(function () {
'use strict';

const G = window.Genealogy;
const T = window.THREE;
const { buildModel, Kinship } = G;

const missing = new Map();
const $ = (id) => document.getElementById(id) || missing.get(id) ||
  (missing.set(id, document.createElement('div')), missing.get(id));

// ── 설정 ────────────────────────────────────────────────
const DEFAULT_DATASET = 'yi-sunsin-muui'; // 주소에 #가계도 id가 없을 때 처음 여는 가계도
const GEN_H = 8;          // 세대 사이 높이
const R_PERSON = 1;       // 구슬 반지름
const R_SPOUSE = 0.6;
const R_BEAD = 0.3;       // 품은 자식 구슬: 배우자 구슬보다 작다
const SEG = 14;           // 연결선 한 줄을 이루는 토막 수(곡선)
const MAX_EDGE_INST = 16000;
const COLORS = {
  ego: '#ff6a55', lineal: '#ffc95c', near: '#5fe3ff', far: '#8a7dff',
  spouse: '#ff8fbf', unknown: '#8796ad', other: '#a9c4dc', notable: '#7dffd8', heir: '#2fe0c0',
};
const col = (hex) => new T.Color(hex); // ColorManagement: sRGB → 선형으로 바뀐다
// 사건 종류별 색(인물과 사건 페이지 js/events.js와 같다)
const EVENT_COLORS = {
  '전쟁': '#ff5a4a', '전투': '#ff9446', '사화·옥사': '#c77dff', '정변': '#ff4f9a', '정책·제도': '#ffd166',
  '학문·저술': '#5fe3ff', '교육·서원': '#7dffd8', '종교': '#b9f26b', '외교': '#8ab4ff', '기타': '#a9c4dc',
};
const R_EVENT = 0.95;

const HEIR_COLOR = new T.Color(COLORS.heir);
const LONG_PRESS_MS = 520; // 길게 누르기로 인정하는 시간
// 진동(햅틱). 지원하지 않는 기기(iOS Safari 등)에서는 아무 일도 하지 않는다.
function haptic(pattern) {
  try { if (navigator.vibrate) navigator.vibrate(pattern); } catch (e) { /* 무시 */ }
}
const isNarrow = () => window.matchMedia('(max-width: 820px)').matches;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const state = {
  data: null, model: null, kin: null, root: null, ego: null, selected: null, hovered: null,
  lineage: new Set(), expanded: new Set(), notable: new Set(),
  tucked: new Set(), // 부모 품에 들어간 자식: 아주 작은 구슬로 붙어 있다
  showEvents: true, // 사건 표시: 인물과 얽힌 사건을 화면 왼쪽, 세대 고리 바깥에 세로로 늘어세운다
  eventsByPerson: new Map(), // 이 가계도의 인물 id → 얽힌 사건들(data/events.js)
  showCollateral: false, // 방계 보기. 끄면(기본) 방계 가지는 갈라지는 자리에서 부모 품의 작은 구슬로 접힌다
  openCollateral: new Set(), // 방계 접기 중에도 구슬을 눌러 꺼내 둔 방계 가지
  hoverLink: null,   // 마우스가 올라간 연결선
  showSpouses: true, hideUnknown: false, autoRotate: !reduceMotion,
  descAxis: false, // 직계 자손 축: 기준 인물 아래로 대를 잇는 줄도 가운데 축에 세운다
  showHeir: true,  // 종통 줄기 표시
  tapExpand: true, // 구슬을 누르면 바로 자녀를 펼친다(끄면 누르기는 선택만, 길게 누르기로 펼침)
  heir: { members: new Set(), edges: new Set(), path: new Set() },
  axisLine: [],
  rels: new Map(), trunk: new Set(),
};

// ── 가계 구조 ────────────────────────────────────────────
// 시조의 자손을 나무로 본다. 아버지가 이 집 혈통이면 아버지 밑에, 아니면(외손) 어머니 밑에 둔다.
function treeParent(c) {
  const { model, lineage } = state;
  const f = model.father(c, 'legal');
  if (f && lineage.has(f)) return f;
  const m = model.mother(c, 'legal');
  if (m && lineage.has(m)) return m;
  return null;
}
const hiddenPerson = (id) => state.hideUnknown && state.model.isUnknown(id);
// 화면에 둘 자녀(출생 순). 숨긴 미상 인물은 건너뛰고 그 자녀를 잇는다(steps: 건너뛴 세대 수 + 1).
function kids(id) {
  const out = [];
  for (const c of state.model.orderedChildren(id, 'legal')) {
    if (treeParent(c) !== id) continue;
    if (hiddenPerson(c)) for (const k of kids(c)) out.push({ id: k.id, steps: k.steps + 1 });
    else out.push({ id: c, steps: 1 });
  }
  return out;
}
const descMemo = new Map();
function descCount(id) {
  if (descMemo.has(id)) return descMemo.get(id);
  let n = 0;
  for (const k of kids(id)) n += 1 + descCount(k.id);
  descMemo.set(id, n);
  return n;
}
// 기준 인물이 나무 밖(시집온 사람 등)이면 나무 안의 배우자를 기준 자리로 삼는다.
function anchorOf(id) {
  if (state.lineage.has(id)) return id;
  const s = state.model.spouses(id).find((x) => state.lineage.has(x.id));
  return s ? s.id : null;
}
function ancestorsInTree(id) {
  const out = [];
  for (let p = treeParent(id); p; p = treeParent(p)) out.push(p);
  return out;
}
// 그 사람이 보이도록 위 조상을 모두 펼친다.
function reveal(id) {
  const a = anchorOf(id);
  if (!a) return;
  for (const p of ancestorsInTree(a)) state.expanded.add(p);
  if (hiddenPerson(a)) { state.hideUnknown = false; $('hideUnknown').checked = false; }
}

// 직계 자손 축에 세울 줄: 기준 자리에서 대를 잇는 아들(종통 계승자, 없으면 맏이)을 따라 내려간다.
// 직계 자손은 여러 갈래라 모두를 한 축에 세울 수 없으므로 대를 잇는 한 줄만 세우고,
// 나머지 자손은 그 줄의 각 사람 둘레로 퍼진다.
function descLine(anchor) {
  const out = [];
  const seen = new Set([anchor]);
  for (let cur = anchor; ;) {
    const ks = kids(cur).map((k) => k.id);
    if (!ks.length) break;
    const h = state.model.heir(cur);
    const next = ks.includes(h) ? h : ks[0];
    if (seen.has(next)) break;
    seen.add(next);
    out.push(next);
    cur = next;
  }
  return out;
}
// 축 옵션을 켜면 줄이 끝까지 보이도록 줄 위의 사람들을 펼친다.
function expandDescLine() {
  const a = anchorOf(state.ego);
  if (!state.descAxis || !a) return;
  state.expanded.add(a);
  const line = descLine(a);
  line.slice(0, -1).forEach((id) => state.expanded.add(id));
}

// 종통 줄기: 시조와 이름난 남자 인물마다, 대를 잇는 아들(양자 우선, 없으면 적자 맏아들, 그다음 서자)을
// 따라 내려간 흐름. 카드 가계도(tree.html)의 '정통 표시'와 같은 규칙이다.
function computeHeir() {
  const { model } = state;
  const members = new Set(), edges = new Set();
  const starts = [state.root, ...[...state.notable].filter((id) => model.get(id)?.gender === 'M')];
  for (const s of starts) {
    const line = model.heirLine(s).filter((id) => state.lineage.has(id));
    if (line.length < 2) continue;
    line.forEach((id, i) => { members.add(id); if (i) edges.add(`${line[i - 1]}>${id}`); });
  }
  // 방계 접기에서도 펼쳐 둘 사람: 줄기 위의 사람과, 줄기가 시작하는 사람까지 이르는 조상
  const path = new Set(members);
  for (const id of members) for (const a of ancestorsInTree(id)) path.add(a);
  state.heir = { members, edges, path };
}
// 종통 표시를 켜면 줄기가 끝까지 보이도록 줄기 위의 사람들을 펼친다.
function expandHeir() {
  if (!state.showHeir) return;
  // 줄기 위의 사람과, 줄기가 시작하는 사람(이름난 인물·외손 계통)에 이르는 조상까지 모두 펼친다.
  for (const id of state.heir.members) for (const a of ancestorsInTree(id)) state.expanded.add(a);
}

function relOf(id) {
  if (!state.rels.has(id)) state.rels.set(id, state.kin.relation(state.ego, id));
  return state.rels.get(id);
}
const isLineal = (r) => r.kind === 'self' || (r.kind === 'blood' && r.path && (r.path.up === 0 || r.path.down === 0));
// 방계 가지의 첫 사람: 기준 인물의 직계도 가운데 축도 아닌 자녀. 그 아래 자손은 모두 이 사람의 구슬에 들어간다.
// 종통 표시를 켜 두면 종통 줄기(와 거기에 이르는 조상)는 방계라도 펼쳐 둔다.
function isCollateralRoot(id) {
  if (state.showHeir && state.heir.path.has(id)) return false;
  return !state.trunk.has(id) && !isLineal(relOf(id));
}
// 방계 접기일 때 부모 품에 둘 자녀인가(연결선 길게 누르기로 넣은 자녀 포함)
function isTucked(id) {
  if (state.tucked.has(id)) return true;
  return !state.showCollateral && !state.openCollateral.has(id) && isCollateralRoot(id);
}
function colorOf(id) {
  const r = relOf(id);
  if (id === state.ego) return COLORS.ego;
  if (isLineal(r)) return COLORS.lineal;
  if (r.kind === 'blood') {
    const t = Math.min(1, Math.max(0, ((r.chon ?? 10) - 3) / 7));
    return '#' + col(COLORS.near).lerp(col(COLORS.far), t).getHexString(T.SRGBColorSpace);
  }
  if (r.kind === 'spouse' || r.kind === 'affinal' || r.kind === 'sadon') return COLORS.spouse;
  return COLORS.other;
}
function chonText(r) {
  if (r.kind === 'self') return '기준 인물';
  if (r.chon === 0) return '무촌';
  return r.chon != null ? `${r.chon}촌` : '';
}
function years(p) {
  if (p.placeholder) return '기록 없음';
  if (!p.birth && !p.death) return '생몰년 미상';
  return `${p.birth ?? '?'}–${p.death ?? '?'}`;
}
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// ── 3D 장면 ──────────────────────────────────────────────
let renderer, scene, camera, post;
let spheres, shells, rings, edges, genLines, floor, dust, sky, axis, crystals;
const canvas = $('gl');

// 3D 값 잡음(구슬 속 흐름, 성운)
const GLSL_NOISE = /* glsl */`
  float hash13(vec3 p) { p = fract(p * 0.1031); p += dot(p, p.zyx + 31.32); return fract((p.x + p.y) * p.z); }
  float vnoise(vec3 p) {
    vec3 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(hash13(i), hash13(i + vec3(1,0,0)), f.x), mix(hash13(i + vec3(0,1,0)), hash13(i + vec3(1,1,0)), f.x), f.y),
               mix(mix(hash13(i + vec3(0,0,1)), hash13(i + vec3(1,0,1)), f.x), mix(hash13(i + vec3(0,1,1)), hash13(i + vec3(1,1,1)), f.x), f.y), f.z);
  }
  float fbm(vec3 p) { float a = 0.5, s = 0.0; for (int i = 0; i < 5; i++) { s += a * vnoise(p); p = p * 2.03 + 11.7; a *= 0.5; } return s; }
`;

const uTime = { value: 0 };

// 남녀 표지에 쓰는 글자판: 왼쪽 반은 男, 오른쪽 반은 女(흰 글자, 바탕은 투명). 글꼴이 늦게 오면 다시 그린다.
let glyphTex = null;
function glyphTexture() {
  if (glyphTex) return glyphTex;
  const cv = document.createElement('canvas');
  cv.width = 256; cv.height = 128;
  const draw = () => {
    const g = cv.getContext('2d');
    g.clearRect(0, 0, 256, 128);
    g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = '700 92px "Noto Serif KR", "Noto Serif CJK KR", serif';
    g.fillText('男', 64, 70); g.fillText('女', 192, 70);
    if (glyphTex) glyphTex.needsUpdate = true;
  };
  draw();
  glyphTex = new T.CanvasTexture(cv);
  glyphTex.anisotropy = 4;
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
  return glyphTex;
}

// badge: 켜면 인스턴스마다 aSex(1 남, -1 여, 0 모름)를 받아 구슬 표면에 남녀 표지를 그린다
function sphereMaterial(badge = false) {
  return new T.ShaderMaterial({
    uniforms: { uTime, uLight: { value: new T.Vector3(0.5, 0.75, 0.42).normalize() }, uGlyph: { value: badge ? glyphTexture() : null } },
    defines: badge ? { BADGE: '' } : {},
    extensions: { derivatives: true },
    vertexShader: /* glsl */`
      attribute vec3 aColor;
      attribute vec4 aParams; // x 밝기, y 강조(마우스·선택), z 미상(채도 낮춤), w 고유값
      varying vec3 vN, vV, vObj, vColor; varying vec4 vP;
      #ifdef BADGE
      attribute float aSex; varying float vSex;
      #endif
      void main() {
        vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
        vN = normalize(mat3(modelMatrix * instanceMatrix) * normal);
        vV = normalize(cameraPosition - wp.xyz);
        vObj = position; vColor = aColor; vP = aParams;
        #ifdef BADGE
        vSex = aSex;
        #endif
        gl_Position = projectionMatrix * viewMatrix * wp;
      }`,
    fragmentShader: /* glsl */`
      uniform float uTime; uniform vec3 uLight;
      varying vec3 vN, vV, vObj, vColor; varying vec4 vP;
      #ifdef BADGE
      uniform sampler2D uGlyph; varying float vSex;
      #endif
      ${GLSL_NOISE}
      // 스튜디오 조명을 흉내 낸 절차적 환경: 위는 밝은 남청, 아래는 어둡고, 소프트박스 두 개
      vec3 env(vec3 r) {
        vec3 c = mix(vec3(0.012, 0.018, 0.035), vec3(0.09, 0.15, 0.27), smoothstep(-0.2, 1.0, r.y));
        c += vec3(1.0, 0.95, 0.88) * 2.6 * smoothstep(0.93, 0.985, dot(r, normalize(vec3(0.5, 0.75, 0.42))));
        c += vec3(0.35, 0.75, 1.0) * 1.6 * smoothstep(0.86, 0.97, dot(r, normalize(vec3(-0.75, 0.15, -0.55))));
        c += vec3(1.0, 0.45, 0.75) * 0.5 * smoothstep(0.0, -0.9, r.y);
        return c;
      }
      void main() {
        vec3 N = normalize(vN), V = normalize(vV);
        float ndv = clamp(dot(N, V), 0.0, 1.0);
        float fres = pow(1.0 - ndv, 3.0);
        vec3 R = reflect(-V, N);
        // 유리 속에서 은은히 흐르는 빛(속심): 가운데가 밝고, 잡음이 천천히 흐른다
        float flow = fbm(vObj * 1.8 + vec3(0.0, -uTime * 0.22, vP.w * 17.0));
        vec3 c = vColor * (0.05 + 0.62 * pow(ndv, 2.2)) * (0.55 + 0.9 * flow) * vP.x;
        // 유리 껍질 안쪽으로 번지는 제 색(가장자리 쪽이 진하다)
        c += vColor * pow(1.0 - ndv, 1.8) * 0.75 * (0.5 + 0.5 * vP.x);
        // 반사: 슐릭 근사 프레넬 × 절차적 환경, 가장자리에 얇은 막의 무지갯빛
        float F = 0.04 + 0.96 * pow(1.0 - ndv, 5.0);
        vec3 film = 0.5 + 0.5 * cos(6.2831 * (vec3(0.0, 0.33, 0.67) + fres * 1.3 + ndv * 0.25 + uTime * 0.02));
        c += env(R) * (0.05 + F * 1.25) * mix(vec3(1.0), film, 0.45);
        // 주광의 날카로운 반짝임
        vec3 H = normalize(uLight + V);
        c += vec3(1.0, 0.97, 0.92) * pow(max(dot(N, H), 0.0), 260.0) * 2.4;
        // 마우스·선택 강조
        c += vColor * vP.y * (0.12 + 0.9 * pow(1.0 - ndv, 1.6)) * (0.85 + 0.15 * sin(uTime * 4.0));
        #ifdef BADGE
        // 남녀 표지: 화면에서 본 구슬의 오른쪽 위 표면에 작은 원. 남자는 청색 바탕에 男, 여자는 홍색 바탕에 女.
        // 카메라 공간의 법선으로 자리를 잡으므로 화면을 돌려도 늘 보이는 쪽에 있다.
        if (abs(vSex) > 0.5) {
          vec3 Nv = normalize((viewMatrix * vec4(N, 0.0)).xyz);
          vec3 B = vec3(0.42, 0.40, 0.8146);
          vec3 T1 = normalize(vec3(B.z, 0.0, -B.x)), T2 = cross(B, T1);
          vec2 p = vec2(dot(Nv, T1), dot(Nv, T2)) / 0.42;
          float d = length(p);
          float aa = max(fwidth(d), 0.03);
          float m = (1.0 - smoothstep(1.0 - aa, 1.0 + aa, d)) * step(0.0, dot(Nv, B));
          if (m > 0.0) {
            vec3 sc = vSex > 0.0 ? vec3(0.03, 0.2, 1.0) : vec3(1.0, 0.035, 0.09);
            vec3 paint = sc * (0.45 + 0.75 * ndv);
            vec2 q = clamp(p * 0.6 + 0.5, 0.0, 1.0);
            float gly = texture2D(uGlyph, vec2(q.x * 0.5 + (vSex > 0.0 ? 0.0 : 0.5), q.y)).a * (1.0 - step(0.86, d));
            paint = mix(paint, vec3(0.95), gly);
            float rim = smoothstep(0.8 - aa, 0.86, d);
            paint = mix(paint, vec3(0.01, 0.014, 0.03), rim);
            paint += env(R) * F * 0.8 + vec3(1.0, 0.97, 0.92) * pow(max(dot(N, H), 0.0), 260.0) * 2.0;
            c = mix(c, paint, m);
          }
        }
        #endif
        float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
        c = mix(c, vec3(l) * vec3(0.8, 0.86, 1.0) * 0.7, vP.z);
        gl_FragColor = vec4(clamp(c, 0.0, 32.0), 1.0);
      }`,
  });
}

// 접힌 자손을 담은 반투명 껍질: 가장자리만 빛나고 가로 줄무늬가 천천히 흐른다.
function shellMaterial() {
  return new T.ShaderMaterial({
    uniforms: { uTime },
    transparent: true, depthWrite: false, blending: T.AdditiveBlending,
    vertexShader: /* glsl */`
      attribute vec3 aColor; attribute vec4 aParams; // x 보임(0..1), y 강조, w 고유값
      varying vec3 vN, vV, vObj, vColor; varying vec4 vP;
      void main() {
        vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
        vN = normalize(mat3(modelMatrix * instanceMatrix) * normal);
        vV = normalize(cameraPosition - wp.xyz);
        vObj = position; vColor = aColor; vP = aParams;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }`,
    fragmentShader: /* glsl */`
      uniform float uTime;
      varying vec3 vN, vV, vObj, vColor; varying vec4 vP;
      void main() {
        float ndv = clamp(abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0);
        float fres = pow(1.0 - ndv, 2.4);
        float band = smoothstep(0.42, 0.5, abs(fract(vObj.y * 4.0 - uTime * 0.35 + vP.w * 3.0) - 0.5));
        float dots = step(0.86, fract(sin(dot(floor(vObj * 9.0), vec3(12.9898, 78.233, 37.719))) * 43758.5453));
        float a = (fres * 0.85 + band * 0.07 * (0.3 + fres) + dots * 0.05 * fres) * vP.x * (1.0 + vP.y * 0.8);
        a = clamp(a, 0.0, 4.0);
        gl_FragColor = vec4(vColor * 1.35 * a, min(a, 1.0));
      }`,
  });
}

// 이름난 인물·기준 인물의 고리: 스스로 빛난다.
function ringMaterial() {
  return new T.ShaderMaterial({
    uniforms: { uTime },
    transparent: true, depthWrite: false, blending: T.AdditiveBlending,
    vertexShader: /* glsl */`
      attribute vec3 aColor; attribute vec4 aParams;
      varying vec3 vColor; varying float vA, vU;
      void main() {
        vColor = aColor; vA = aParams.x; vU = atan(position.y, position.x);
        gl_Position = projectionMatrix * viewMatrix * modelMatrix * instanceMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */`
      uniform float uTime; varying vec3 vColor; varying float vA, vU;
      void main() {
        float s = 0.55 + 0.45 * sin(vU * 3.0 - uTime * 2.2);
        gl_FragColor = vec4(clamp(vColor * (1.2 + 1.8 * s) * vA, 0.0, 32.0), 1.0);
      }`,
  });
}

// 연결선: 곡선을 짧은 원통 토막으로 잇고, 위(조상)에서 아래(자손)로 빛 알갱이가 흐른다.
function edgeMaterial() {
  return new T.ShaderMaterial({
    uniforms: { uTime },
    transparent: true, depthWrite: false, blending: T.AdditiveBlending,
    vertexShader: /* glsl */`
      attribute vec3 aColA, aColB; attribute vec2 aSeg; attribute vec4 aParams; // x 세기, y 흐름 속도, z 직계, w 보임
      varying float vT, vNdv; varying vec3 vCol; varying vec4 vP;
      void main() {
        vT = mix(aSeg.x, aSeg.y, position.y + 0.5);
        vCol = mix(aColA, aColB, smoothstep(0.0, 1.0, vT));
        vP = aParams;
        vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
        vec3 n = normalize(mat3(modelMatrix * instanceMatrix) * normal);
        vNdv = clamp(abs(dot(n, normalize(cameraPosition - wp.xyz))), 0.0, 1.0);
        gl_Position = projectionMatrix * viewMatrix * wp;
      }`,
    fragmentShader: /* glsl */`
      uniform float uTime; varying float vT, vNdv; varying vec3 vCol; varying vec4 vP;
      void main() {
        float p = fract(vT * 1.6 - uTime * vP.y);
        float pulse = smoothstep(0.0, 0.05, p) * (1.0 - smoothstep(0.05, 0.32, p));
        float core = pow(vNdv, 1.3);
        float a = (0.18 + 0.82 * core) * vP.w;
        vec3 c = vCol * (vP.x * (0.55 + 0.45 * core) + pulse * (0.6 + 2.2 * vP.z));
        a = clamp(a, 0.0, 2.0);
        gl_FragColor = vec4(clamp(c * a, 0.0, 32.0), min(a, 1.0));
      }`,
  });
}

// 가운데 축 빛기둥(직계 자손 축 옵션): 가는 금빛 기둥에 빛 마디가 아래로 흐른다.
function axisMaterial() {
  return new T.ShaderMaterial({
    uniforms: { uTime, uVis: { value: 0 } },
    transparent: true, depthWrite: false, blending: T.AdditiveBlending,
    vertexShader: /* glsl */`
      varying float vY, vNdv;
      void main() {
        vY = position.y + 0.5;
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vec3 n = normalize(mat3(modelMatrix) * normal);
        vNdv = clamp(abs(dot(n, normalize(cameraPosition - wp.xyz))), 0.0, 1.0);
        gl_Position = projectionMatrix * viewMatrix * wp;
      }`,
    fragmentShader: /* glsl */`
      uniform float uTime, uVis; varying float vY, vNdv;
      void main() {
        float core = pow(vNdv, 2.0);
        float p = fract(vY * 9.0 + uTime * 0.45);
        float pulse = smoothstep(0.0, 0.06, p) * (1.0 - smoothstep(0.06, 0.4, p));
        float ends = smoothstep(0.0, 0.04, vY) * smoothstep(1.0, 0.96, vY);
        float a = clamp((0.12 + 0.6 * core + pulse * 0.5 * core) * ends * uVis, 0.0, 1.0);
        gl_FragColor = vec4(vec3(1.0, 0.78, 0.36) * a * 1.6, a);
      }`,
  });
}

// 밤하늘: 깊은 남색 그라데이션 + 성운(fbm) + 반짝이는 별
function skyMaterial() {
  return new T.ShaderMaterial({
    uniforms: { uTime },
    side: T.BackSide, depthWrite: false,
    vertexShader: /* glsl */`
      varying vec3 vDir;
      void main() { vDir = normalize(position); gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */`
      uniform float uTime; varying vec3 vDir;
      ${GLSL_NOISE}
      void main() {
        vec3 d = normalize(vDir);
        vec3 c = mix(vec3(0.004, 0.006, 0.013), vec3(0.012, 0.022, 0.045), smoothstep(-0.4, 0.7, d.y));
        float n1 = fbm(d * 2.2 + vec3(0.0, 0.0, uTime * 0.004));
        float n2 = fbm(d * 3.6 + 7.3);
        c += vec3(0.02, 0.07, 0.10) * pow(n1, 2.6) * 1.6;
        c += vec3(0.07, 0.02, 0.10) * pow(n2, 3.2) * 1.8;
        vec3 p = d * 220.0; vec3 id = floor(p);
        float h = hash13(id);
        if (h > 0.972) {
          vec3 f = fract(p) - 0.5 - (vec3(hash13(id + 1.7), hash13(id + 4.1), hash13(id + 9.3)) - 0.5) * 0.5;
          float tw = 0.55 + 0.45 * sin(uTime * (1.0 + h * 3.0) + h * 80.0);
          c += mix(vec3(0.7, 0.85, 1.0), vec3(1.0, 0.9, 0.75), hash13(id + 3.3)) * smoothstep(0.12, 0.0, length(f)) * (h - 0.972) * 70.0 * tw;
        }
        gl_FragColor = vec4(c, 1.0);
      }`,
  });
}

// 홀로그램 바닥: 동심원·방사선 격자가 가운데에서 멀어질수록 흐려진다.
function floorMaterial() {
  return new T.ShaderMaterial({
    uniforms: { uTime, uScale: { value: 1 } },
    transparent: true, depthWrite: false, blending: T.AdditiveBlending,
    vertexShader: /* glsl */`
      varying vec2 vXZ; void main() { vec4 wp = modelMatrix * vec4(position, 1.0); vXZ = wp.xz; gl_Position = projectionMatrix * viewMatrix * wp; }`,
    fragmentShader: /* glsl */`
      uniform float uTime, uScale; varying vec2 vXZ;
      void main() {
        float r = length(vXZ) / uScale;
        // 원점에서 atan(0, 0)은 GPU에 따라 NaN이 되므로 살짝 비켜 계산한다.
        float ang = atan(vXZ.y, vXZ.x + 1e-4) / 6.2831 * 48.0;
        float aaR = fwidth(r * 0.25) * 1.5, aaA = fwidth(ang) * 1.5;
        float rings = 1.0 - smoothstep(0.0, aaR, abs(fract(r * 0.25) - 0.5) - 0.5 + aaR);
        float rays = (1.0 - smoothstep(0.0, aaA, abs(fract(ang) - 0.5) - 0.5 + aaA)) * smoothstep(4.0, 10.0, r);
        float sweep = pow(max(0.0, sin(r * 0.18 - uTime * 0.9)), 18.0);
        float fade = exp(-r * 0.028);
        float glow = exp(-r * 0.12) * 0.1;
        float a = ((rings * 0.5 + rays * 0.22) * (0.45 + sweep * 0.9) + glow) * fade;
        a = clamp(a, 0.0, 1.0);
        gl_FragColor = vec4(vec3(0.25, 0.7, 1.0) * a * 0.32, a);
      }`,
    extensions: { derivatives: true },
  });
}

// 떠다니는 먼지(빛 입자)
function makeDust() {
  const n = isNarrow() ? 700 : 1400;
  const pos = new Float32Array(n * 3), seed = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const r = 20 + Math.random() * 160, a = Math.random() * Math.PI * 2;
    pos[i * 3] = Math.cos(a) * r; pos[i * 3 + 1] = 30 - Math.random() * 200; pos[i * 3 + 2] = Math.sin(a) * r;
    seed[i] = Math.random();
  }
  const g = new T.BufferGeometry();
  g.setAttribute('position', new T.BufferAttribute(pos, 3));
  g.setAttribute('aSeed', new T.BufferAttribute(seed, 1));
  const m = new T.ShaderMaterial({
    uniforms: { uTime, uPR: { value: renderer.getPixelRatio() } },
    transparent: true, depthWrite: false, blending: T.AdditiveBlending,
    vertexShader: /* glsl */`
      uniform float uTime, uPR; attribute float aSeed; varying float vA; varying float vS;
      void main() {
        vec3 p = position; p.y += sin(uTime * 0.2 + aSeed * 30.0) * 1.5;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = (1.2 + aSeed * 2.4) * uPR * (120.0 / -mv.z);
        vA = (0.25 + 0.75 * (0.5 + 0.5 * sin(uTime * (0.6 + aSeed) + aSeed * 50.0))) * smoothstep(400.0, 60.0, -mv.z);
        vS = aSeed;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */`
      varying float vA; varying float vS;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, d) * vA * 0.55;
        gl_FragColor = vec4(mix(vec3(0.45, 0.8, 1.0), vec3(1.0, 0.85, 0.7), vS) * a, a);
      }`,
  });
  return new T.Points(g, m);
}

function instanced(geo, mat, count, attrs) {
  for (const [name, size] of attrs) {
    geo.setAttribute(name, new T.InstancedBufferAttribute(new Float32Array(count * size), size).setUsage(T.DynamicDrawUsage));
  }
  const m = new T.InstancedMesh(geo, mat, count);
  m.instanceMatrix.setUsage(T.DynamicDrawUsage);
  m.frustumCulled = false;
  m.count = 0;
  return m;
}

// ── 후처리: HDR 장면 → 밝은 부분 추출 → 3단 흐림 → 합성(블룸, ACES 톤 매핑, 비네트, 색수차, 입자감) ──
function makePost() {
  const quadGeo = new T.PlaneGeometry(2, 2);
  const quadCam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const quad = new T.Mesh(quadGeo);
  const quadScene = new T.Scene();
  quadScene.add(quad);
  const vs = /* glsl */`varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;
  // 휴대폰 GPU에서는 셰이더의 작은 오차가 NaN·무한대를 만들 수 있다. 그런 화소 하나가 흐림 단계를 거치며
  // 큰 검은 네모로 번지므로, 후처리에 들어가는 값은 모두 0 이상 유한한 값으로 바로잡는다.
  const SANE = /* glsl */`
    vec3 sane(vec3 c) {
      if (any(isnan(c)) || any(isinf(c)) || !(c.r == c.r && c.g == c.g && c.b == c.b)) return vec3(0.0);
      return clamp(c, 0.0, 64.0);
    }`;
  const rtOpts = { type: T.HalfFloatType, minFilter: T.LinearFilter, magFilter: T.LinearFilter, depthBuffer: false };
  const sceneRT = new T.WebGLRenderTarget(1, 1, { type: T.HalfFloatType, samples: isNarrow() ? 2 : 4 });
  const levels = [0, 1, 2, 3].map(() => ({ a: new T.WebGLRenderTarget(1, 1, rtOpts), b: new T.WebGLRenderTarget(1, 1, rtOpts) }));
  const bright = new T.ShaderMaterial({
    uniforms: { tSrc: { value: null }, uTh: { value: 1.0 } }, vertexShader: vs,
    fragmentShader: /* glsl */`uniform sampler2D tSrc; uniform float uTh; varying vec2 vUv; ${SANE}
      void main() { vec3 c = sane(texture2D(tSrc, vUv).rgb); float l = max(c.r, max(c.g, c.b));
        gl_FragColor = vec4(c * smoothstep(uTh, uTh + 0.8, l), 1.0); }`,
  });
  const blur = new T.ShaderMaterial({
    uniforms: { tSrc: { value: null }, uDir: { value: new T.Vector2() } }, vertexShader: vs,
    fragmentShader: /* glsl */`uniform sampler2D tSrc; uniform vec2 uDir; varying vec2 vUv; ${SANE}
      void main() {
        vec3 c = texture2D(tSrc, vUv).rgb * 0.2270270270;
        c += texture2D(tSrc, vUv + uDir * 1.3846153846).rgb * 0.3162162162;
        c += texture2D(tSrc, vUv - uDir * 1.3846153846).rgb * 0.3162162162;
        c += texture2D(tSrc, vUv + uDir * 3.2307692308).rgb * 0.0702702703;
        c += texture2D(tSrc, vUv - uDir * 3.2307692308).rgb * 0.0702702703;
        gl_FragColor = vec4(sane(c), 1.0); }`,
  });
  const copy = new T.ShaderMaterial({
    uniforms: { tSrc: { value: null } }, vertexShader: vs,
    fragmentShader: /* glsl */`uniform sampler2D tSrc; varying vec2 vUv; void main() { gl_FragColor = vec4(texture2D(tSrc, vUv).rgb, 1.0); }`,
  });
  const comp = new T.ShaderMaterial({
    uniforms: {
      tScene: { value: sceneRT.texture }, uTime,
      tB0: { value: levels[0].a.texture }, tB1: { value: levels[1].a.texture }, tB2: { value: levels[2].a.texture }, tB3: { value: levels[3].a.texture },
      uStrength: { value: 1.0 }, uRes: { value: new T.Vector2(1, 1) },
    },
    vertexShader: vs,
    fragmentShader: /* glsl */`
      uniform sampler2D tScene, tB0, tB1, tB2, tB3; uniform float uTime, uStrength; uniform vec2 uRes; varying vec2 vUv;
      ${SANE}
      vec3 aces(vec3 x) { const float a = 2.51, b = 0.03, c = 2.43, d = 0.59, e = 0.14; return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0); }
      vec3 toSRGB(vec3 c) { return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c)); }
      float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
      void main() {
        vec2 dc = vUv - 0.5;
        float r2 = dot(dc, dc);
        vec2 off = dc * r2 * 0.012;
        vec3 c = sane(vec3(texture2D(tScene, vUv + off).r, texture2D(tScene, vUv).g, texture2D(tScene, vUv - off).b));
        vec3 b = sane(texture2D(tB0, vUv).rgb) * 0.9 + sane(texture2D(tB1, vUv).rgb) * 0.8 + sane(texture2D(tB2, vUv).rgb) * 0.75 + sane(texture2D(tB3, vUv).rgb) * 0.7;
        c += b * uStrength * 0.42;
        c *= 1.08;
        c = aces(c);
        c *= mix(1.0, 0.55, smoothstep(0.12, 0.62, r2 * 1.6));
        c = toSRGB(clamp(c, 0.0, 1.0));
        c += (hash(vUv * uRes + fract(uTime) * 100.0) - 0.5) * 0.018;
        gl_FragColor = vec4(c, 1.0);
      }`,
  });
  const pass = (mat, target) => { quad.material = mat; renderer.setRenderTarget(target); renderer.render(quadScene, quadCam); };
  return {
    setSize(w, h, pr) {
      const W = Math.max(1, Math.floor(w * pr)), H = Math.max(1, Math.floor(h * pr));
      sceneRT.setSize(W, H);
      levels.forEach((l, i) => { const s = 2 ** (i + 1); l.a.setSize(Math.max(1, W / s | 0), Math.max(1, H / s | 0)); l.b.setSize(Math.max(1, W / s | 0), Math.max(1, H / s | 0)); });
      comp.uniforms.uRes.value.set(W, H);
    },
    render() {
      renderer.setRenderTarget(sceneRT);
      renderer.render(scene, camera);
      bright.uniforms.tSrc.value = sceneRT.texture;
      pass(bright, levels[0].a);
      for (let i = 0; i < levels.length; i++) {
        const L = levels[i];
        if (i > 0) { copy.uniforms.tSrc.value = levels[i - 1].a.texture; pass(copy, L.a); }
        blur.uniforms.tSrc.value = L.a.texture; blur.uniforms.uDir.value.set(1 / L.a.width, 0); pass(blur, L.b);
        blur.uniforms.tSrc.value = L.b.texture; blur.uniforms.uDir.value.set(0, 1 / L.a.height); pass(blur, L.a);
      }
      pass(comp, null);
    },
  };
}

function initGL() {
  try {
    renderer = new T.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
  } catch (e) {
    $('fallback').hidden = false;
    return false;
  }
  if (!renderer.capabilities.isWebGL2) { $('fallback').hidden = false; return false; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isNarrow() ? 1.75 : 2));
  scene = new T.Scene();
  camera = new T.PerspectiveCamera(45, 1, 0.5, 4000);

  sky = new T.Mesh(new T.SphereGeometry(1500, 48, 24), skyMaterial());
  sky.renderOrder = -10;
  scene.add(sky);

  floor = new T.Mesh(new T.CircleGeometry(260, 128), floorMaterial());
  floor.rotation.x = -Math.PI / 2;
  floor.renderOrder = -5;
  scene.add(floor);

  dust = makeDust();
  scene.add(dust);

  const segs = isNarrow() ? 40 : 56;
  const attrs = [['aColor', 3], ['aParams', 4]];
  spheres = instanced(new T.SphereGeometry(1, segs, Math.round(segs * 0.7)), sphereMaterial(true), 1200, [...attrs, ['aSex', 1]]);
  shells = instanced(new T.SphereGeometry(1, 40, 28), shellMaterial(), 1200, attrs);
  // 사건: 면이 보이는 결정(이십면체)
  crystals = instanced(new T.IcosahedronGeometry(1, 0), sphereMaterial(), 400, attrs);
  rings = instanced(new T.TorusGeometry(1, 0.022, 8, 160), ringMaterial(), 200, attrs);
  edges = instanced(new T.CylinderGeometry(1, 1, 1, 8, 1, true), edgeMaterial(), MAX_EDGE_INST,
    [['aColA', 3], ['aColB', 3], ['aSeg', 2], ['aParams', 4]]);
  shells.renderOrder = 3; rings.renderOrder = 4; edges.renderOrder = 2;
  scene.add(spheres, edges, shells, rings, crystals);

  // 세대 고리(가는 원)
  genLines = new T.LineSegments(new T.BufferGeometry(), new T.LineBasicMaterial({
    color: new T.Color('#5aa8ff'), transparent: true, opacity: 0.16, depthWrite: false, blending: T.AdditiveBlending,
  }));
  genLines.frustumCulled = false;
  scene.add(genLines);

  axis = new T.Mesh(new T.CylinderGeometry(1, 1, 1, 20, 1, true), axisMaterial());
  axis.frustumCulled = false;
  axis.renderOrder = 1;
  axis.visible = false;
  scene.add(axis);

  post = makePost();
  return true;
}

// ── 노드(구슬) ───────────────────────────────────────────
// 화면에 있는 구슬은 id로 기억해 두고, 다시 그릴 때 위치를 이어 받아 부드럽게 움직인다.
const nodes = new Map(); // key → node
let order = [];          // 그릴 순서(살아 있는 노드 + 사라지는 중인 노드)
let linkList = [];       // { a, b, kind: 'child' | 'marriage' }
let alpha = 1;           // 배치 시뮬레이션의 남은 힘(1 → 0)
let clock = 0;

function makeNode(key, id, kind) {
  return {
    key, id, kind, pos: new T.Vector3(), vel: new T.Vector3(), parent: null, partner: null, depth: 0,
    scale: 0, scaleV: 0, alive: true, delay: 0, hl: 0, seed: Math.random(),
    color: new T.Color(), radius: R_PERSON, hidden: 0, trunk: false, lineal: false, notable: false, spouses: [], beads: [],
    shellVis: 0, born: clock,
  };
}

function rebuild({ instant = false } = {}) {
  const { model } = state;
  descMemo.clear();
  state.rels.clear();
  const anchor = anchorOf(state.ego);
  state.trunk = new Set(anchor ? [anchor, ...ancestorsInTree(anchor)] : [state.root]);
  state.axisLine = state.descAxis && anchor ? descLine(anchor) : [];
  for (const id of state.axisLine) state.trunk.add(id);

  // 보일 사람: 시조부터, 펼친 사람의 자녀를 따라 내려간다.
  const seen = new Set();
  const list = [];
  const tucks = []; // 부모 품에 들어간 자식: 가지를 더 내려가지 않는다
  const walk = (id, parent, depth) => {
    list.push({ id, parent, depth });
    seen.add(id);
    if (!state.expanded.has(id)) return;
    for (const k of kids(id)) {
      if (isTucked(k.id)) { tucks.push({ id: k.id, parent: id }); seen.add(k.id); continue; }
      walk(k.id, id, depth + k.steps);
    }
  };
  walk(state.root, null, 0);

  for (const n of nodes.values()) n.alive = false;
  const getNode = (key, id, kind) => {
    let n = nodes.get(key);
    if (!n) { n = makeNode(key, id, kind); nodes.set(key, n); n.isNew = true; }
    n.alive = true;
    return n;
  };
  // 사라지는 중인 구슬의 연결선은 함께 흐려지도록 남겨 둔다.
  const fading = linkList.filter((l) => !l.a.alive || !l.b.alive);
  linkList = [];
  let maxDepth = 0;
  for (const { id, parent, depth } of list) {
    const n = getNode(id, id, 'person');
    const p = parent ? nodes.get(parent) : null;
    n.parent = p; n.depth = depth; maxDepth = Math.max(maxDepth, depth);
    const hidden = state.expanded.has(id) ? 0 : descCount(id);
    n.hidden = hidden;
    n.trunk = state.trunk.has(id);
    n.notable = state.notable.has(id);
    n.lineal = isLineal(relOf(id));
    n.radius = (id === state.ego ? 1.3 : n.notable ? 1.12 : R_PERSON) * (hidden ? 1 + 0.16 * Math.cbrt(hidden) : 1);
    n.color.set(colorOf(id));
    n.unknown = model.isUnknown(id);
    if (n.isNew) {
      const from = p || n;
      n.pos.copy(from.pos).add(new T.Vector3((Math.random() - 0.5) * 0.6, 0, (Math.random() - 0.5) * 0.6));
      if (!p) n.pos.set(0, 0, 0);
      n.delay = instant ? Math.min(0.6, depth * 0.04) : 0.02 + Math.random() * 0.08;
      n.isNew = false;
    }
    if (p) linkList.push({ a: p, b: n, kind: 'child' });
    n.spouses = [];
    n.beads = [];
    if (state.showSpouses) {
      for (const s of model.spouses(id)) {
        if (seen.has(s.id) || hiddenPerson(s.id) || state.lineage.has(s.id)) continue;
        const sn = getNode(`s:${id}:${s.id}`, s.id, 'spouse');
        sn.partner = n; sn.depth = depth; sn.radius = R_SPOUSE * (s.id === state.ego ? 1.4 : 1);
        sn.color.set(s.id === state.ego ? COLORS.ego : COLORS.spouse);
        sn.unknown = model.isUnknown(s.id);
        sn.concubine = s.union.type === '첩';
        if (sn.scale === 0 && sn.delay === 0) { sn.pos.copy(n.pos); sn.delay = (instant ? Math.min(0.6, depth * 0.04) : 0) + 0.15; }
        n.spouses.push(sn);
        linkList.push({ a: n, b: sn, kind: 'marriage' });
      }
    }
  }
  // 품은 자식: 부모 구슬 아래에 아주 작은 구슬로 붙는다. 연결선은 긋지 않는다(이미 들어가 있으므로).
  for (const { id, parent } of tucks) {
    const p = nodes.get(parent);
    if (!p || !p.alive) continue;
    const bn = getNode(`t:${parent}:${id}`, id, 'bead');
    const sub = descCount(id) + 1; // 자기 자신까지
    bn.parent = p; bn.depth = p.depth; bn.sub = sub;
    bn.radius = Math.min(R_SPOUSE * 0.8, R_BEAD * (1 + 0.14 * Math.cbrt(sub - 1)));
    bn.hidden = 0; bn.trunk = false; bn.lineal = false; bn.notable = false;
    bn.spouses = []; bn.beads = [];
    bn.color.set(colorOf(id));
    bn.unknown = model.isUnknown(id);
    if (bn.isNew) { bn.pos.copy(p.pos); bn.delay = 0.04; bn.isNew = false; }
    p.beads.push(bn);
  }
  // 사건: 보이는 인물(배우자 구슬 포함)이 얽힌 사건마다 결정 하나. 높이는 얽힌 인물들의 세대 평균.
  if (state.showEvents) {
    const byEv = new Map();
    for (const n of nodes.values()) {
      if (!n.alive || (n.kind !== 'person' && n.kind !== 'spouse')) continue;
      for (const ev of state.eventsByPerson.get(n.id) || []) {
        if (!byEv.has(ev)) byEv.set(ev, []);
        const arr = byEv.get(ev);
        if (!arr.includes(n)) arr.push(n);
      }
    }
    for (const [ev, anchors] of byEv) {
      const key = `ev:${ev.id}`;
      const en = getNode(key, key, 'event');
      en.ev = ev; en.anchors = anchors; en.parent = anchors[0];
      en.depth = anchors.reduce((t, a) => t + a.depth, 0) / anchors.length;
      en.radius = R_EVENT; en.hidden = 0; en.trunk = false; en.lineal = false; en.notable = false; en.unknown = false;
      en.spouses = []; en.beads = [];
      en.color.set(EVENT_COLORS[ev.type] || EVENT_COLORS['기타']);
      if (en.isNew) { en.pos.copy(anchors[0].pos); en.delay = instant ? 0.5 : 0.12; en.isNew = false; }
      for (const a of anchors) linkList.push({ a, b: en, kind: 'event' });
    }
  }
  linkList.push(...fading.filter((l) => !l.a.alive || !l.b.alive));
  state.hoverLink = null; // 선 목록을 새로 만들었으므로 가리키던 선은 잊는다
  state.maxDepth = maxDepth;
  order = [...nodes.values()];
  alpha = 1;
  updateLabelsContent();
  renderInfo();
}

// 힘 기반 배치: 높이는 세대로 고정하고, 가로(x, z)만 움직인다.
//   자녀 ↔ 부모 용수철, 같은 층끼리 밀어내기, 기준 인물의 직계 조상은 가운데 축에 고정.
function simulate(dt) {
  const persons = order.filter((n) => n.kind === 'person' && n.alive);
  alpha = Math.max(0, alpha - dt * 0.22);
  const a = alpha;
  const yRate = 1 - Math.exp(-dt * 5);
  if (a > 0.002) {
    for (const n of persons) { n.fx = 0; n.fz = 0; n.reff = n.radius + (n.spouses.length ? 2.4 : 0.6) + (n.hidden ? 1.2 : 0); }
    for (const n of persons) {
      const p = n.parent;
      if (p) { n.fx += (p.pos.x - n.pos.x) * 1.4; n.fz += (p.pos.z - n.pos.z) * 1.4; }
      n.fx -= n.pos.x * 0.02; n.fz -= n.pos.z * 0.02;
    }
    for (let i = 0; i < persons.length; i++) {
      const A = persons[i];
      for (let j = i + 1; j < persons.length; j++) {
        const B = persons[j];
        const dy = Math.abs(A.depth - B.depth);
        if (dy > 1) continue;
        let dx = A.pos.x - B.pos.x, dz = A.pos.z - B.pos.z;
        let d2 = dx * dx + dz * dz;
        if (d2 < 1e-4) { dx = Math.random() - 0.5; dz = Math.random() - 0.5; d2 = dx * dx + dz * dz; }
        const d = Math.sqrt(d2);
        const min = A.reff + B.reff + 1.4;
        let f = (dy ? 40 : 160) * (A.reff * B.reff) / (d2 + 4);
        if (!dy && d < min) f += (min - d) * 30;
        const ux = dx / d, uz = dz / d;
        A.fx += ux * f; A.fz += uz * f;
        B.fx -= ux * f; B.fz -= uz * f;
      }
    }
    for (const n of persons) {
      if (n.trunk) continue; // 축에 선 사람은 아래에서 축으로 고정한다
      n.vel.x = (n.vel.x + n.fx * dt * a) * Math.exp(-dt * 5);
      n.vel.z = (n.vel.z + n.fz * dt * a) * Math.exp(-dt * 5);
      const sp = Math.hypot(n.vel.x, n.vel.z), max = 60;
      if (sp > max) { n.vel.x *= max / sp; n.vel.z *= max / sp; }
      n.pos.x += n.vel.x * dt; n.pos.z += n.vel.z * dt;
    }
  }
  for (const n of persons) {
    n.pos.y += (-n.depth * GEN_H - n.pos.y) * yRate;
    // 축에 선 사람은 밀려나지 않게 속도를 버리고 축으로 끌어온다.
    if (n.trunk) { const k = 1 - Math.exp(-dt * 6); n.pos.x -= n.pos.x * k; n.pos.z -= n.pos.z * k; n.vel.x = 0; n.vel.z = 0; }
  }
  // 배우자: 짝 옆(가지 방향과 직각)에 붙는다.
  for (const n of persons) {
    if (!n.spouses.length) continue;
    let ang;
    if (n.parent && !n.trunk) ang = Math.atan2(n.pos.z - n.parent.pos.z, n.pos.x - n.parent.pos.x) + Math.PI / 2;
    else ang = n.depth * 2.39996 + 0.6;
    const k = n.spouses.length;
    n.spouses.forEach((s, i) => {
      const t = ang + (k === 1 ? 0 : k === 2 ? i * Math.PI : (i / k) * Math.PI * 2);
      const r = n.radius + s.radius + 1.25;
      const tx = n.pos.x + Math.cos(t) * r, tz = n.pos.z + Math.sin(t) * r, ty = n.pos.y - 0.15;
      const q = 1 - Math.exp(-dt * 7);
      s.pos.x += (tx - s.pos.x) * q; s.pos.y += (ty - s.pos.y) * q; s.pos.z += (tz - s.pos.z) * q;
    });
  }
  // 품은 자식: 부모 구슬 바로 아래에 둘러 붙는다. 여럿이면 작은 고리를 이룬다.
  for (const n of persons) {
    if (!n.beads.length) continue;
    const k = n.beads.length;
    const spin = clock * 0.2 + n.seed * 6;
    n.beads.forEach((b, i) => {
      const t = spin + (i / k) * Math.PI * 2;
      const rr = k === 1 ? 0 : (n.radius * 0.5 + b.radius * 1.2);
      const tx = n.pos.x + Math.cos(t) * rr, tz = n.pos.z + Math.sin(t) * rr;
      const ty = n.pos.y - (n.radius * Math.max(0.4, n.scale) + b.radius * 1.9);
      const q = 1 - Math.exp(-dt * 8);
      b.pos.x += (tx - b.pos.x) * q; b.pos.y += (ty - b.pos.y) * q; b.pos.z += (tz - b.pos.z) * q;
    });
  }
  // 사건: 카메라에서 본 왼쪽, 가장 큰 세대 고리 바깥에 한 줄로 세로로 늘어선다(오른쪽 끝에는 세대 표시가 있다).
  // 같은 세대의 사건은 그 세대 띠 안에서 위(이른 사건)→아래로 쌓고, 띠가 차면 바깥에 한 줄을 더 세운다.
  // 카메라가 돌아도 늘 화면 왼쪽에 선다.
  const evs = order.filter((n) => n.kind === 'event' && n.alive);
  if (evs.length) {
    const Rmax = evLaneBase();
    const left = _evL.setFromMatrixColumn(camera.matrix, 0).setY(0);
    if (left.lengthSq() < 1e-6) left.set(1, 0, 0);
    left.normalize().multiplyScalar(-1);
    const bands = new Map();
    for (const n of evs) {
      const d = Math.round(n.depth);
      if (!bands.has(d)) bands.set(d, []);
      bands.get(d).push(n);
    }
    evReach = 0;
    fitAge += dt;
    const q = 1 - Math.exp(-dt * 4);
    const cap = Math.floor((GEN_H * 0.9) / EV_ROW) + 1; // 한 세대 띠에 세로로 들어가는 수
    for (const [d, list] of bands) {
      list.sort((a, b) => a.ev.start - b.ev.start || (a.ev.id < b.ev.id ? -1 : 1));
      list.forEach((n, i) => {
        const col = Math.floor(i / cap), row = i % cap;
        const rows = Math.min(cap, list.length - col * cap);
        const y = -d * GEN_H + ((rows - 1) / 2 - row) * EV_ROW;
        const dist = Rmax + col * EV_STEP;
        evReach = Math.max(evReach, dist);
        n.pos.x += (left.x * dist - n.pos.x) * q; n.pos.y += (y - n.pos.y) * q; n.pos.z += (left.z * dist - n.pos.z) * q;
      });
    }
    // 맞춘 직후 가계도가 퍼지며 사건 줄이 바깥으로 밀려나면 다시 맞춘다.
    // 손대는 중이거나, 한참 지났거나, 그 사이 확대·가까이 보기로 거리를 바꿨으면 그대로 둔다.
    if (fitLane > 0 && evReach > fitLane + 2 && ctl.idle > 0.5 && fitAge < 6 && ctl.radiusGoal === fitRadius) fit();
  }
  // 크기: 태어날 때 살짝 튀어 오르고(스프링), 사라질 때는 부모 쪽으로 빨려 들어간다.
  for (const n of order) {
    if (n.delay > 0) { n.delay -= dt; continue; }
    const target = n.alive ? 1 : 0;
    n.scaleV += (target - n.scale) * 170 * dt;
    n.scaleV *= Math.exp(-dt * (n.alive ? 13 : 22));
    n.scale = Math.max(0, n.scale + n.scaleV * dt);
    if (!n.alive) {
      const home = n.kind === 'spouse' ? n.partner : n.parent;
      if (home) n.pos.lerp(home.pos, 1 - Math.exp(-dt * 7));
    }
    // 길게 누르는 동안 차오르는 값(0→1). 손을 떼면 빠르게 빠진다.
    n.pressAmt = n.pressing ? Math.min(1, (performance.now() - n.pressT0) / LONG_PRESS_MS) : Math.max(0, (n.pressAmt || 0) - dt * 5);
    const hlT = n.id === state.hovered ? 1 : n.id === state.selected ? 0.75 : 0;
    n.hl += (hlT - n.hl) * (1 - Math.exp(-dt * 10));
    const shellT = n.alive && n.hidden ? 1 : 0;
    n.shellVis += (shellT - n.shellVis) * (1 - Math.exp(-dt * 6));
  }
  for (const n of [...order]) {
    if (!n.alive && n.scale < 0.02 && Math.abs(n.scaleV) < 0.05) {
      nodes.delete(n.key);
      removeLabel(n);
      linkList = linkList.filter((l) => l.a !== n && l.b !== n);
    }
  }
  order = [...nodes.values()];
}

// ── GPU 버퍼 채우기 ──────────────────────────────────────
const _evL = new T.Vector3();
// 사건 줄의 기준 거리: 세대 고리와 가장 바깥 구슬보다 한참 바깥. evReach는 가장 먼 사건까지(맞춤에 쓴다).
const EV_GAP = 14, EV_STEP = 5.2, EV_ROW = 2.4;
let evReach = 0, fitLane = 0, fitAge = 0, fitRadius = -1; // fitAge: 마지막 맞춤 뒤 흐른 시뮬레이션 시간(초)
function evLaneBase() {
  let R = 8;
  for (const v of genState.smooth.values()) R = Math.max(R, v);
  for (const n of order) if (n.alive && n.kind !== 'event') R = Math.max(R, Math.hypot(n.pos.x, n.pos.z) + n.radius);
  return R + EV_GAP;
}
const _m = new T.Matrix4(), _q = new T.Quaternion(), _s = new T.Vector3(), _v = new T.Vector3(), _up = new T.Vector3(0, 1, 0);
const _c = new T.Color();
let drawn = [];  // 구슬 instanceId → node
let shellDrawn = [];
let crystalDrawn = [];

function writeInstances() {
  // 구슬
  const sc = spheres.geometry.attributes.aColor.array, sp = spheres.geometry.attributes.aParams.array;
  const sx = spheres.geometry.attributes.aSex.array;
  const hc = shells.geometry.attributes.aColor.array, hp = shells.geometry.attributes.aParams.array;
  const rc = rings.geometry.attributes.aColor.array, rp = rings.geometry.attributes.aParams.array;
  drawn = []; shellDrawn = []; crystalDrawn = [];
  const cc = crystals.geometry.attributes.aColor.array, cp = crystals.geometry.attributes.aParams.array;
  let i = 0, h = 0, r = 0, c = 0;
  for (const n of order) {
    if (n.scale <= 0.001) continue;
    if (n.kind === 'event') {
      const rad = n.radius * n.scale;
      _q.setFromAxisAngle(_up, clock * 0.25 + n.seed * 6);
      _m.compose(n.pos, _q, _s.set(rad, rad * 1.12, rad));
      crystals.setMatrixAt(c, _m);
      cc[c * 3] = n.color.r; cc[c * 3 + 1] = n.color.g; cc[c * 3 + 2] = n.color.b;
      cp[c * 4] = 1.3; cp[c * 4 + 1] = n.hl; cp[c * 4 + 2] = 0; cp[c * 4 + 3] = n.seed;
      crystalDrawn[c] = n; c++;
      continue;
    }
    const pa = n.pressAmt || 0;
    const rad = n.radius * n.scale * (1 + 0.22 * pa * pa + 0.03 * pa * Math.sin(clock * 40));
    _q.identity();
    _m.compose(n.pos, _q, _s.set(rad, rad, rad));
    spheres.setMatrixAt(i, _m);
    sc[i * 3] = n.color.r; sc[i * 3 + 1] = n.color.g; sc[i * 3 + 2] = n.color.b;
    const bright = n.id === state.ego ? 1.5 : n.lineal ? 1.2 : n.kind === 'bead' ? 0.8 : n.kind === 'spouse' ? 0.85 : 1.0;
    sp[i * 4] = bright * (n.unknown ? 0.6 : 1) * (1 + pa * 0.8); sp[i * 4 + 1] = Math.min(1.6, n.hl + pa); sp[i * 4 + 2] = n.unknown ? 0.75 : 0; sp[i * 4 + 3] = n.seed;
    const g = state.model.get(n.id);
    sx[i] = g && g.gender === 'M' ? 1 : g && g.gender === 'F' ? -1 : 0;
    drawn[i] = n;
    i++;
    if (n.shellVis > 0.01 && n.kind === 'person') {
      const R = rad * (1.55 + 0.1 * Math.cbrt(n.hidden || 1));
      _q.setFromAxisAngle(_up, clock * 0.15 + n.seed * 6);
      _m.compose(n.pos, _q, _s.set(R, R, R));
      shells.setMatrixAt(h, _m);
      hc[h * 3] = n.color.r; hc[h * 3 + 1] = n.color.g; hc[h * 3 + 2] = n.color.b;
      hp[h * 4] = n.shellVis * Math.min(1, n.scale); hp[h * 4 + 1] = n.hl; hp[h * 4 + 3] = n.seed;
      shellDrawn[h] = n;
      h++;
    }
    if ((n.notable || n.id === state.ego) && n.kind === 'person') {
      const two = n.notable && n.id === state.ego ? 2 : 1;
      for (let k = 0; k < two; k++) {
        const isEgoRing = n.id === state.ego && k === 0;
        const R = rad * (isEgoRing ? 1.9 : 1.55);
        _q.setFromEuler(new T.Euler(Math.PI / 2 + Math.sin(clock * 0.6 + n.seed * 9) * 0.35 + (isEgoRing ? 0.5 : 0), clock * (isEgoRing ? 0.9 : -0.5), 0));
        _m.compose(n.pos, _q, _s.set(R, R, R));
        rings.setMatrixAt(r, _m);
        _c.set(isEgoRing ? COLORS.ego : COLORS.notable);
        rc[r * 3] = _c.r; rc[r * 3 + 1] = _c.g; rc[r * 3 + 2] = _c.b;
        rp[r * 4] = Math.min(1, n.scale);
        r++;
      }
    }
  }
  spheres.count = i; shells.count = h; rings.count = r; crystals.count = c;
  spheres.geometry.attributes.aSex.needsUpdate = true;
  for (const m of [spheres, shells, rings, crystals]) {
    m.instanceMatrix.needsUpdate = true;
    m.geometry.attributes.aColor.needsUpdate = true;
    m.geometry.attributes.aParams.needsUpdate = true;
  }
  spheres.boundingSphere = null; shells.boundingSphere = null; crystals.boundingSphere = null;

  // 연결선: 부모 아래쪽에서 자녀 위쪽으로 S자 곡선(3차 베지에), 배우자 사이는 짧은 직선
  const E = edges.geometry.attributes;
  const ca = E.aColA.array, cb = E.aColB.array, sg = E.aSeg.array, ep = E.aParams.array;
  let e = 0;
  const P0 = new T.Vector3(), P1 = new T.Vector3(), P2 = new T.Vector3(), P3 = new T.Vector3(), A = new T.Vector3(), B = new T.Vector3();
  const bez = (t, out) => {
    const u = 1 - t;
    return out.set(0, 0, 0).addScaledVector(P0, u * u * u).addScaledVector(P1, 3 * u * u * t).addScaledVector(P2, 3 * u * t * t).addScaledVector(P3, t * t * t);
  };
  for (const L of linkList) {
    const a = L.a, b = L.b;
    const vis = Math.min(a.scale, b.scale);
    if (vis < 0.02 || e + SEG > MAX_EDGE_INST) continue;
    if (L.kind === 'event') {
      // 인물 구슬 중심에서 사건 결정까지: 가로로 뻗는 완만한 곡선, 빛이 인물에서 사건 쪽으로 흐른다.
      const hotE = b.id === state.selected || b.id === state.hovered || a.id === state.selected || a.id === state.hovered;
      P0.copy(a.pos); P3.copy(b.pos);
      P1.lerpVectors(P0, P3, 0.35); P1.y = P0.y;
      P2.lerpVectors(P0, P3, 0.7); P2.y = P3.y;
      const segs = 8;
      if (e + segs > MAX_EDGE_INST) continue;
      const w = (hotE ? 0.07 : 0.035) * vis;
      for (let k = 0; k < segs; k++) {
        const t0 = k / segs, t1 = (k + 1) / segs;
        bez(t0, A); bez(t1, B);
        _v.subVectors(B, A);
        const len = _v.length();
        if (len < 1e-4) continue;
        _q.setFromUnitVectors(_up, _v.divideScalar(len));
        _m.compose(A.add(B).multiplyScalar(0.5), _q, _s.set(w, len * 1.02, w));
        edges.setMatrixAt(e, _m);
        ca[e * 3] = a.color.r; ca[e * 3 + 1] = a.color.g; ca[e * 3 + 2] = a.color.b;
        cb[e * 3] = b.color.r; cb[e * 3 + 1] = b.color.g; cb[e * 3 + 2] = b.color.b;
        sg[e * 2] = t0; sg[e * 2 + 1] = t1;
        ep[e * 4] = hotE ? 0.9 : 0.45; ep[e * 4 + 1] = 0.35; ep[e * 4 + 2] = hotE ? 0.9 : 0.15; ep[e * 4 + 3] = vis * (hotE ? 1 : 0.55);
        e++;
      }
      continue;
    }
    const marriage = L.kind === 'marriage';
    const lineal = !marriage && a.lineal && b.lineal;
    const hov = L === state.hoverLink;
    const hot = hov || (!marriage && (a.id === state.selected || b.id === state.selected || a.id === state.hovered || b.id === state.hovered));
    if (marriage) {
      P0.copy(a.pos); P3.copy(b.pos); P1.lerpVectors(P0, P3, 0.33); P2.lerpVectors(P0, P3, 0.66);
    } else {
      P0.copy(a.pos); P0.y -= a.radius * a.scale * 0.9;
      P3.copy(b.pos); P3.y += b.radius * b.scale * 0.9;
      const hgt = Math.max(1, P0.y - P3.y);
      P1.copy(P0); P1.y -= hgt * 0.5;
      P2.copy(P3); P2.y += hgt * 0.5;
    }
    const segs = marriage ? 3 : SEG;
    // 종통 줄기: 청록 겹선(바깥의 넓고 옅은 빛 + 안쪽 심)으로 그리고 빛 마디가 빠르게 흐른다.
    const heir = !marriage && state.showHeir && state.heir.edges.has(`${a.id}>${b.id}`);
    const base = (marriage ? 0.05 : lineal ? 0.13 : 0.06) * (hov ? 2.6 : hot ? 1.5 : 1) * vis;
    const passes = heir
      ? [{ w: base * 2.9 + 0.12 * vis, mix: 1, int: 0.55, speed: 0.5, z: 0.25, a: 0.32 },
         { w: Math.max(base, 0.1 * vis), mix: 0.55, int: 1.1, speed: 0.6, z: 1, a: 1 }]
      : [{ w: base, mix: 0, int: marriage ? 0.5 : lineal ? 1.0 : 0.55, speed: marriage ? 0.15 : lineal ? 0.55 : 0.3,
           z: hov ? 1.2 : lineal ? 1 : hot ? 0.7 : 0.15, a: 1 }];
    if (e + segs * passes.length > MAX_EDGE_INST) continue;
    for (const ps of passes) {
      _c.copy(a.color).lerp(HEIR_COLOR, ps.mix); const cA = [_c.r, _c.g, _c.b];
      _c.copy(b.color).lerp(HEIR_COLOR, ps.mix); const cB = [_c.r, _c.g, _c.b];
      for (let k = 0; k < segs; k++) {
        const t0 = k / segs, t1 = (k + 1) / segs;
        bez(t0, A); bez(t1, B);
        _v.subVectors(B, A);
        const len = _v.length();
        if (len < 1e-4) continue;
        _q.setFromUnitVectors(_up, _v.divideScalar(len));
        _m.compose(A.add(B).multiplyScalar(0.5), _q, _s.set(ps.w, len * 1.02, ps.w));
        edges.setMatrixAt(e, _m);
        ca[e * 3] = cA[0]; ca[e * 3 + 1] = cA[1]; ca[e * 3 + 2] = cA[2];
        cb[e * 3] = cB[0]; cb[e * 3 + 1] = cB[1]; cb[e * 3 + 2] = cB[2];
        sg[e * 2] = t0; sg[e * 2 + 1] = t1;
        ep[e * 4] = ps.int;
        ep[e * 4 + 1] = ps.speed;
        ep[e * 4 + 2] = ps.z;
        ep[e * 4 + 3] = vis * ps.a * (marriage && b.concubine ? 0.5 : 1) * (hov ? 1.8 : hot ? 1.3 : 1);
        e++;
      }
    }
  }
  edges.count = e;
  edges.instanceMatrix.needsUpdate = true;
  for (const k of ['aColA', 'aColB', 'aSeg', 'aParams']) E[k].needsUpdate = true;

  // 세대 고리
  const levels = new Map();
  for (const n of order) {
    if (n.kind !== 'person' || !n.alive || n.scale < 0.05) continue;
    const r0 = Math.hypot(n.pos.x, n.pos.z) + n.radius + 3;
    levels.set(n.depth, Math.max(levels.get(n.depth) || 6, r0));
  }
  genState.levels = levels;
  const N = 96;
  const arr = new Float32Array(levels.size * N * 6);
  let o = 0;
  for (const [depth, R0] of levels) {
    const R = genState.smooth.get(depth) ?? R0;
    const Rs = R + (R0 - R) * 0.08;
    genState.smooth.set(depth, Rs);
    const y = -depth * GEN_H;
    for (let k = 0; k < N; k++) {
      const t0 = (k / N) * Math.PI * 2, t1 = ((k + 1) / N) * Math.PI * 2;
      if (k % 2) continue;
      arr[o++] = Math.cos(t0) * Rs; arr[o++] = y; arr[o++] = Math.sin(t0) * Rs;
      arr[o++] = Math.cos(t1) * Rs; arr[o++] = y; arr[o++] = Math.sin(t1) * Rs;
    }
  }
  genLines.geometry.setAttribute('position', new T.BufferAttribute(arr.subarray(0, o), 3));
  genLines.geometry.attributes.position.needsUpdate = true;

  // 가운데 축 빛기둥: 시조 위에서 축에 선 맨 아래 사람 밑까지
  const av = axis.material.uniforms.uVis;
  av.value += ((state.descAxis ? 1 : 0) - av.value) * 0.06;
  axis.visible = av.value > 0.01;
  if (axis.visible) {
    let bottom = 0;
    for (const n of order) if (n.trunk && n.alive && n.kind === 'person') bottom = Math.min(bottom, n.pos.y);
    const top = 4, bot = bottom - 5;
    axis.position.set(0, (top + bot) / 2, 0);
    axis.scale.set(0.09, top - bot, 0.09);
  }

  // 바닥은 가장 아래 세대 밑에 둔다.
  const fy = -(state.maxDepth + 1.2) * GEN_H;
  floor.position.y += (fy - floor.position.y) * 0.05;
}
const genState = { levels: new Map(), smooth: new Map() };

// ── 카메라 조작(회전·확대·이동, 관성, 자동 회전, 날아가기) ──────────
const ctl = {
  target: new T.Vector3(), goal: null, theta: 0.7, phi: 1.12, radius: 80, radiusGoal: 80,
  vTheta: 0, vPhi: 0, idle: 0, flyK: 0,
};
function updateCamera(dt) {
  if (ctl.goal) {
    const k = 1 - Math.exp(-dt * 3.2);
    ctl.target.lerp(ctl.goal, k);
    if (ctl.target.distanceTo(ctl.goal) < 0.05) ctl.goal = null;
  }
  ctl.radius += (ctl.radiusGoal - ctl.radius) * (1 - Math.exp(-dt * 5));
  ctl.theta += ctl.vTheta; ctl.phi += ctl.vPhi;
  const damp = Math.exp(-dt * 6);
  ctl.vTheta *= damp; ctl.vPhi *= damp;
  ctl.idle += dt;
  if (state.autoRotate && ctl.idle > 2.5) ctl.theta += dt * 0.06 * Math.min(1, (ctl.idle - 2.5) / 2);
  ctl.phi = Math.min(Math.PI - 0.2, Math.max(0.2, ctl.phi));
  ctl.radiusGoal = Math.min(900, Math.max(6, ctl.radiusGoal));
  const sp = Math.sin(ctl.phi);
  camera.position.set(
    ctl.target.x + ctl.radius * sp * Math.sin(ctl.theta),
    ctl.target.y + ctl.radius * Math.cos(ctl.phi),
    ctl.target.z + ctl.radius * sp * Math.cos(ctl.theta));
  camera.lookAt(ctl.target);
}
// 기준 인물 라벨은 처음 로딩·맞춤(자리 잡기) 직후에만 앞세운다.
// 그 뒤로는 다른 라벨과 같은 규칙으로 보이거나 숨는다.
let egoPinUntil = 0;
function pinEgoLabel(ms = 1600) { egoPinUntil = Math.max(egoPinUntil, performance.now() + ms); }
function fit(onlyAlive = true) {
  pinEgoLabel();
  const box = new T.Box3();
  let any = false;
  let hasEv = false;
  for (const n of nodes.values()) {
    if (onlyAlive && !n.alive) continue;
    if (n.kind === 'event') { hasEv = true; continue; } // 사건 줄은 카메라를 따라 움직이므로 폭으로만 셈한다
    const y = n.kind === 'person' ? -n.depth * GEN_H : n.pos.y;
    box.expandByPoint(new T.Vector3(n.pos.x, y, n.pos.z));
    any = true;
  }
  if (!any) return;
  // 세로(세대 높이)와 가로(퍼진 폭)를 따로 맞춘다. 휴대폰처럼 세로로 긴 화면도 꽉 차게.
  const size = box.getSize(new T.Vector3());
  ctl.goal = box.getCenter(new T.Vector3());
  const tanV = Math.tan((camera.fov * Math.PI) / 360);
  // 사건 줄은 화면 왼쪽에만 서므로, 가운데를 기준으로 양쪽을 그만큼 넓혀야 잘리지 않는다
  fitLane = hasEv ? Math.max(evReach, evLaneBase()) : 0;
  fitAge = 0;
  const evW = hasEv ? 2 * (fitLane + 3) : 0;
  const w = Math.max(Math.max(size.x, size.z) + 8, evW), h = size.y * Math.sin(ctl.phi) + 10;
  const dist = Math.max(h / 2 / tanV, w / 2 / (tanV * camera.aspect));
  ctl.radiusGoal = Math.max(20, dist + w * 0.35);
  fitRadius = ctl.radiusGoal;
}
function flyTo(n, closer) {
  if (!n) return;
  ctl.goal = n.pos.clone();
  fitRadius = -1; // 사람을 찾아 옮겼으면 자동 맞춤이 끌어내지 않는다
  if (closer) ctl.radiusGoal = Math.min(ctl.radiusGoal, 46);
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
  // 길게 누르기(탭으로 펼치기를 끈 경우): 누른 자리에 원이 차오르고 구슬이 부풀다가,
  // 시간이 차면 진동과 함께 터지듯 자녀를 펼치거나 접는다.
  const ring = $('pressRing');
  let press = null;
  const startPress = (x, y) => {
    const hit = pick(x, y);
    // 구슬 위: 자녀 펼치기·접기(탭으로 펼치기를 끈 경우에만). 빈 곳이면 연결선을 찾아 자식을 품는다.
    let n = null, link = null;
    if (hit) {
      if (state.tapExpand) return;
      if (!hit.alive || hit.kind !== 'person' || !(hit.hidden || state.expanded.has(hit.id))) return;
      n = hit;
    } else {
      link = pickLink(x, y);
      if (!link) return;
      n = link.b;
    }
    press = { n, link, fired: false };
    hideTip();
    n.pressing = true; n.pressT0 = performance.now();
    ring.style.left = `${x}px`; ring.style.top = `${y}px`;
    ring.style.setProperty('--dur', `${LONG_PRESS_MS}ms`);
    ring.style.setProperty('--c', '#' + n.color.getHexString(T.SRGBColorSpace));
    ring.classList.remove('burst', 'run');
    ring.hidden = false;
    void ring.offsetWidth; // 애니메이션 다시 시작
    ring.classList.add('run');
    press.timer = setTimeout(() => {
      press.fired = true;
      n.pressing = false;
      ring.classList.add('burst');
      setTimeout(() => { if (!press || press.fired) ring.hidden = true; }, 380);
      haptic([18, 40, 30]);
      n.scaleV += 7; // 톡 튀어 오르기
      // 길게 누르기는 자녀 펼치기·접기만 한다. 선택을 바꾸지 않으므로 상세 카드도 열리지 않는다.
      if (press.link) tuck(n.id);
      else { toggle(n.id); flyTo(n, false); }
    }, LONG_PRESS_MS);
  };
  const cancelPress = () => {
    if (!press) return;
    clearTimeout(press.timer);
    press.n.pressing = false;
    if (!press.fired) { ring.classList.remove('run'); ring.hidden = true; }
    press = null;
  };

  canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  // 터치가 끝난 뒤 브라우저가 덧붙이는 click·mouse 이벤트를 막는다. 막지 않으면 구슬을 누른 자리에
  // 막 열린 상세 카드가 그 click을 받아 곧바로 닫힌다. 탭 처리는 pointerup에서 이미 끝났다.
  canvas.addEventListener('touchend', (e) => { if (e.cancelable) e.preventDefault(); }, { passive: false });
  canvas.addEventListener('pointerdown', (e) => {
    canvas.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    ctl.idle = 0;
    if (pointers.size === 1) {
      downAt = { x: e.clientX, y: e.clientY, t: performance.now() };
      mode = e.button === 2 || e.shiftKey || e.ctrlKey || e.metaKey ? 'pan' : 'rotate';
      if (mode === 'rotate') startPress(e.clientX, e.clientY);
    } else if (pointers.size === 2) {
      cancelPress();
      const [a, b] = [...pointers.values()];
      lastPinch = Math.hypot(a.x - b.x, a.y - b.y);
      lastMid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      mode = 'pinch'; downAt = null;
    }
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!pointers.has(e.pointerId)) { hoverAt(e.clientX, e.clientY); return; }
    const prev = pointers.get(e.pointerId);
    const dx = e.clientX - prev.x, dy = e.clientY - prev.y;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    ctl.idle = 0;
    if (downAt && Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y) > 8) { downAt = null; cancelPress(); canvas.classList.add('dragging'); state.hoverLink = null; hideTip(); }
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
    const longFired = press && press.fired;
    cancelPress();
    if (downAt && pointers.size === 0 && !longFired && performance.now() - downAt.t < 600) clickAt(e.clientX, e.clientY);
    downAt = null;
    if (pointers.size === 1) { mode = 'rotate'; lastPinch = 0; lastMid = null; }
  };
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);
  canvas.addEventListener('pointerleave', () => { if (!pointers.size) { state.hovered = null; state.hoverLink = null; hideTip(); canvas.classList.remove('pointing'); } });
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    ctl.idle = 0;
    ctl.radiusGoal *= Math.exp(e.deltaY * (e.deltaMode === 1 ? 0.05 : 0.0012));
  }, { passive: false });
  canvas.tabIndex = 0;
  canvas.addEventListener('keydown', (e) => {
    const step = 0.08;
    if (e.key === 'ArrowLeft') ctl.vTheta = step;
    else if (e.key === 'ArrowRight') ctl.vTheta = -step;
    else if (e.key === 'ArrowUp') ctl.vPhi = -step * 0.6;
    else if (e.key === 'ArrowDown') ctl.vPhi = step * 0.6;
    else if (e.key === '+' || e.key === '=') ctl.radiusGoal *= 0.8;
    else if (e.key === '-') ctl.radiusGoal *= 1.25;
    else if ((e.key === 'Enter' || e.key === ' ') && state.selected) { toggle(state.selected); }
    else return;
    e.preventDefault(); ctl.idle = 0;
  });
  $('zoomIn').addEventListener('click', () => { ctl.radiusGoal *= 0.72; ctl.idle = 0; });
  $('zoomOut').addEventListener('click', () => { ctl.radiusGoal *= 1.38; ctl.idle = 0; });
  $('zoomFit').addEventListener('click', () => { fit(); ctl.idle = 0; });
}

// ── 고르기(레이캐스트) ───────────────────────────────────
const ray = new T.Raycaster();
const ndc = new T.Vector2();
function pick(x, y) {
  const rect = canvas.getBoundingClientRect();
  ndc.set(((x - rect.left) / rect.width) * 2 - 1, -((y - rect.top) / rect.height) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  const hit = ray.intersectObject(spheres, false)[0];
  const hc = ray.intersectObject(crystals, false)[0];
  if (hc && crystalDrawn[hc.instanceId] && (!hit || hc.distance < hit.distance)) return crystalDrawn[hc.instanceId];
  if (hit && drawn[hit.instanceId]) return drawn[hit.instanceId];
  const sh = ray.intersectObject(shells, false)[0];
  if (sh && shellDrawn[sh.instanceId]) return shellDrawn[sh.instanceId];
  return null;
}
// 연결선 고르기: 그릴 때와 같은 S자 곡선을 화면에 투영해, 점이 아니라 '선분'까지의 거리를 잰다.
// (점만 재면 선이 길게 보일 때 샘플 사이가 벌어져 한가운데를 눌러도 잡히지 않는다.)
const _lq = new T.Vector3(), _q0 = new T.Vector3(), _q1 = new T.Vector3(), _q2 = new T.Vector3(), _q3 = new T.Vector3();
function segDist(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1;
  const L2 = dx * dx + dy * dy;
  let t = L2 ? ((px - x1) * dx + (py - y1) * dy) / L2 : 0;
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  return Math.hypot(px - (x1 + dx * t), py - (y1 + dy * t));
}
const LINK_PICK_N = 20;
function pickLink(x, y) {
  const rect = canvas.getBoundingClientRect();
  const px = x - rect.left, py = y - rect.top;
  let best = null, bestD = isNarrow() ? 26 : 16;
  for (const L of linkList) {
    const a = L.a, b = L.b;
    if (L.kind !== 'child' || !a.alive || !b.alive) continue;
    if (b.kind !== 'person' || !state.lineage.has(b.id)) continue;
    if (Math.min(a.scale, b.scale) < 0.4) continue;
    _q0.copy(a.pos); _q0.y -= a.radius * a.scale * 0.9;
    _q3.copy(b.pos); _q3.y += b.radius * b.scale * 0.9;
    const hgt = Math.max(1, _q0.y - _q3.y);
    _q1.copy(_q0); _q1.y -= hgt * 0.5;
    _q2.copy(_q3); _q2.y += hgt * 0.5;
    let pX = 0, pY = 0, pOK = false;
    for (let i = 0; i <= LINK_PICK_N; i++) {
      const t = i / LINK_PICK_N, u = 1 - t;
      _lq.set(0, 0, 0)
        .addScaledVector(_q0, u * u * u).addScaledVector(_q1, 3 * u * u * t)
        .addScaledVector(_q2, 3 * u * t * t).addScaledVector(_q3, t * t * t)
        .project(camera);
      const ok = _lq.z <= 1 && _lq.z >= -1;
      const sx = (_lq.x * 0.5 + 0.5) * rect.width, sy = (-_lq.y * 0.5 + 0.5) * rect.height;
      if (ok && pOK) {
        const d = segDist(px, py, pX, pY, sx, sy);
        if (d < bestD) { bestD = d; best = L; }
      }
      pX = sx; pY = sy; pOK = ok;
    }
  }
  return best;
}
let hoverQueued = null;
function hoverAt(x, y) { hoverQueued = { x, y }; }
function processHover() {
  if (!hoverQueued) return;
  const { x, y } = hoverQueued;
  hoverQueued = null;
  const n = pick(x, y);
  const id = n && n.alive ? n.id : null;
  state.hovered = id;
  state.hoverLink = id ? null : pickLink(x, y);
  canvas.classList.toggle('pointing', !!id || !!state.hoverLink);
  if (id) showTip(n, x, y);
  else if (state.hoverLink) showLinkTip(state.hoverLink, x, y);
  else hideTip();
}
function clickAt(x, y) {
  const n = pick(x, y);
  if (!n || !n.alive) {
    const L = pickLink(x, y);
    if (L) { // 선을 짧게 누르면 그 자식을 고른다. 품기는 길게 누르기.
      haptic(8);
      state.selected = L.b.id;
      updateLabelsContent(); renderInfo();
      flyTo(L.b, false);
      return;
    }
    if (isNarrow()) closeInfo(); // 휴대폰: 빈 곳을 누르면 상세 카드를 닫는다
    return;
  }
  if (n.kind === 'bead') { untuck(n.id); return; } // 품은 구슬: 누르면 다시 나온다
  if (n.kind === 'event') { // 사건: 상세 카드만 연다
    haptic(10);
    state.selected = n.id;
    updateLabelsContent(); renderInfo();
    return;
  }
  haptic(10);
  state.selected = n.id;
  // '탭으로 펼치기'가 켜져 있으면 누르기만으로 자녀를 펼치고 접는다. 꺼져 있으면 선택만 하고, 펼치기는 길게 누르기로.
  if (state.tapExpand && n.kind === 'person' && (n.hidden || state.expanded.has(n.id))) toggle(n.id);
  else { updateLabelsContent(); renderInfo(); }
  flyTo(n, false);
}
function closeInfo() {
  if (!state.selected && $('info').hidden) return;
  state.selected = null;
  $('info').hidden = true;
  $('info').classList.remove('open');
}
// 자식을 부모 품에 넣는다(연결선을 길게 눌렀을 때). 펼쳐 둔 상태는 그대로 기억해 둔다.
function tuck(id) {
  if (!state.lineage.has(id) || isTucked(id)) return;
  state.openCollateral.delete(id);
  state.tucked.add(id);
  rebuild();
}
// 품은 구슬을 누르면 다시 나온다.
function untuck(id) {
  if (state.tucked.delete(id)) { /* 연결선으로 넣은 자녀 */ }
  else if (!state.showCollateral && isCollateralRoot(id)) state.openCollateral.add(id); // 접힌 방계 가지
  else return;
  haptic([12, 30]);
  const n = nodes.get(`t:${treeParent(id)}:${id}`);
  rebuild();
  const back = nodes.get(id);
  if (back) { back.scaleV += 6; if (n) back.pos.copy(n.pos); }
}
// 방계 보기·접기. 다시 접으면 구슬을 눌러 꺼내 둔 가지도 함께 접는다.
function setShowCollateral(on) {
  state.showCollateral = on;
  state.openCollateral.clear();
  $('showCollateral').checked = on;
  try { localStorage.setItem('genealogy.showCollateral', on ? '1' : '0'); } catch (err) { /* 저장 불가: 무시 */ }
}
function toggle(id) {
  if (!state.lineage.has(id)) return;
  if (state.expanded.has(id)) state.expanded.delete(id);
  else if (kids(id).length) state.expanded.add(id);
  rebuild();
}

// ── 툴팁 ────────────────────────────────────────────────
const tip = $('tip');
// 연결선 위: 어느 부모와 자식을 잇는 줄인지, 길게 누르면 무엇이 되는지 알려 준다.
function showLinkTip(L, x, y) {
  const { model } = state;
  const sub = descCount(L.b.id) + 1;
  tip.style.setProperty('--c', '#' + L.b.color.getHexString(T.SRGBColorSpace));
  tip.innerHTML = `<b>${esc(model.displayName(L.a.id))} → ${esc(model.displayName(L.b.id))}</b>` +
    `<div>길게 누르면 ${esc(model.displayName(L.b.id))}${sub > 1 ? ` 이하 ${sub}명` : ''}을 부모 품에</div>` +
    '<div class="k">누르면 그 사람 보기</div>';
  tip.hidden = false;
  const W = window.innerWidth, H = window.innerHeight;
  const tw = tip.offsetWidth, th = tip.offsetHeight;
  tip.style.left = `${Math.min(W - tw - 10, x + 16)}px`;
  tip.style.top = `${Math.min(H - th - 10, Math.max(10, y + 16))}px`;
}
function showEventTip(n, x, y) {
  const ev = n.ev;
  tip.style.setProperty('--c', '#' + n.color.getHexString(T.SRGBColorSpace));
  const who = n.anchors.filter((a) => a.alive).map((a) => state.model.displayName(a.id));
  tip.innerHTML = `<b>${esc(ev.name)}${ev.hanja ? ` <small>${esc(ev.hanja)}</small>` : ''}</b>` +
    `<span class="t">${esc(ev.type)}</span> ${esc(evYears(ev))}<div>${esc(who.slice(0, 4).join(', '))}${who.length > 4 ? ` 외 ${who.length - 4}명` : ''}</div>` +
    '<div class="k">누르면 사건 보기</div>';
  tip.hidden = false;
  const W = window.innerWidth, H = window.innerHeight;
  tip.style.left = `${Math.min(W - tip.offsetWidth - 10, x + 16)}px`;
  tip.style.top = `${Math.min(H - tip.offsetHeight - 10, Math.max(10, y + 16))}px`;
}
const evYears = (ev) => (ev.end && ev.end !== ev.start ? `${ev.start}–${ev.end}` : `${ev.start}`);
function showTip(n, x, y) {
  if (n.kind === 'event') { showEventTip(n, x, y); return; }
  const { model } = state;
  const p = model.get(n.id);
  const r = relOf(n.id);
  const kidsN = n.kind === 'person' ? kids(n.id).length : 0;
  const verb = state.tapExpand ? '누르면' : '길게 누르면';
  const action = n.kind === 'bead' ? `${state.tucked.has(n.id) ? '' : '방계 · '}누르면 다시 나옵니다${n.sub > 1 ? ` · 자손까지 ${n.sub}명` : ''}`
    : n.kind !== 'person' || !kidsN ? '' : state.expanded.has(n.id) ? `${verb} 자녀 접기` : `${verb} 자녀 ${kidsN}명 펼치기 · 자손 ${descCount(n.id)}명`;
  tip.style.setProperty('--c', '#' + n.color.getHexString(T.SRGBColorSpace));
  tip.innerHTML = `<b>${esc(model.displayName(n.id))}${p.hanja ? ` <small>${esc(p.hanja)}</small>` : ''}</b>` +
    `<span class="t">${esc(n.id === state.ego ? '기준 인물' : r.term)}</span> ${esc(n.id === state.ego ? '' : chonText(r))}` +
    `<div>${esc(years(p))}${p.gen != null ? ` · ${p.gen}世` : ''}${state.showHeir && state.heir.members.has(n.id) ? ' · 宗 종통' : ''}</div>` + (action ? `<div class="k">${esc(action)}</div>` : '');
  tip.hidden = false;
  const W = window.innerWidth, H = window.innerHeight;
  const tw = tip.offsetWidth, th = tip.offsetHeight;
  tip.style.left = `${Math.min(W - tw - 10, x + 16)}px`;
  tip.style.top = `${Math.min(H - th - 10, Math.max(10, y + 16))}px`;
}
function hideTip() { tip.hidden = true; }

// ── 이름표(HTML) ─────────────────────────────────────────
const labelBox = $('labels');
const labels = new Map(); // node.key → element
const genLabels = new Map();
function labelFor(n) {
  let el = labels.get(n.key);
  if (!el) { el = document.createElement('div'); el.className = 'lbl'; labelBox.append(el); labels.set(n.key, el); el.style.opacity = '0'; }
  return el;
}
function removeLabel(n) { const el = labels.get(n.key); if (el) { el.remove(); labels.delete(n.key); } }
function updateLabelsContent() {
  const { model } = state;
  for (const n of nodes.values()) {
    if (n.kind === 'bead') { removeLabel(n); continue; }
    if (n.kind === 'event') {
      const el = labelFor(n);
      const key = `ev|${n.ev.id}`;
      if (el.dataset.key !== key) {
        el.dataset.key = key;
        el.className = 'lbl ev';
        el.innerHTML = `<b>${esc(n.ev.name)}</b><span>${esc(evYears(n.ev))} · ${esc(n.ev.type)}</span>`;
        el.style.setProperty('--c', '#' + n.color.getHexString(T.SRGBColorSpace));
        el._w = 0;
      }
      continue;
    }
    const el = labelFor(n);
    const p = model.get(n.id);
    const r = relOf(n.id);
    const term = n.id === state.ego ? '기준 인물' : r.term;
    const short = term.length > 14 ? term.slice(0, 13) + '…' : term;
    const c = '#' + n.color.getHexString(T.SRGBColorSpace);
    const heirMark = state.showHeir && n.kind === 'person' && state.heir.members.has(n.id);
    const key = `${n.id}|${short}|${n.hidden}|${c}|${heirMark}`;
    if (el.dataset.key !== key) {
      el.dataset.key = key;
      el.innerHTML = `<b>${heirMark ? '<i class="heir" title="종통">宗</i>' : ''}${esc(model.displayName(n.id))}${p.hanja ? `<small>${esc(p.hanja)}</small>` : ''}</b>` +
        `<span>${esc(short)}${n.id !== state.ego && chonText(r) ? ` · ${esc(chonText(r))}` : ''}</span>` +
        (n.hidden ? `<em>+${n.hidden}</em>` : '');
      el.style.setProperty('--c', c);
      el._w = 0; // 크기는 처음 보일 때 잰다
    }
    el.classList.toggle('ego', n.id === state.ego);
  }
}
const _p = new T.Vector3();
function updateLabels() {
  const W = canvas.clientWidth, H = canvas.clientHeight;
  const camPos = camera.position;
  const placed = [];
  const items = [];
  const egoPinned = performance.now() < egoPinUntil;
  for (const n of order) {
    const el = labels.get(n.key);
    if (!el) continue;
    if (!n.alive || n.scale < 0.4) { el.style.opacity = '0'; continue; }
    const dist = camPos.distanceTo(n.pos);
    let pri = n.id === state.hovered ? 200 : n.id === state.selected ? 150 : (n.id === state.ego && egoPinned) ? 140 : 0;
    if (!pri && n.kind === 'event') pri = 30 + Math.min(20, n.anchors.length * 4);
    if (!pri) pri = (n.lineal ? 60 : 0) + (n.notable ? 40 : 0) + (n.hidden ? 10 + Math.log2(1 + n.hidden) * 4 : 0) + (n.kind === 'spouse' ? -15 : 10);
    items.push({ n, el, dist, pri });
  }
  items.sort((a, b) => (b.pri - a.pri) || (a.dist - b.dist));
  const many = items.length > 40;
  for (const it of items) {
    const { n, el, dist, pri } = it;
    _p.copy(n.pos); _p.y += n.radius * n.scale + 0.35;
    _p.project(camera);
    const behind = _p.z > 1 || _p.z < -1;
    const x = (_p.x * 0.5 + 0.5) * W, y = (-_p.y * 0.5 + 0.5) * H;
    const near = dist < (many ? 70 : 140);
    let show = !behind && x > -80 && x < W + 80 && y > -40 && y < H + 40 && (pri >= 60 || near);
    // 멀면 어떤 라벨이든 이름만 남긴다(기준 인물도 예외가 아니다). 직접 고르거나 가리킨 것만 자세히.
    const small = dist > 95 && n.id !== state.hovered && n.id !== state.selected;
    if (show && (!el._w || el._small !== small)) {
      el.classList.toggle('small', small);
      el._small = small; el._w = el.offsetWidth; el._h = el.offsetHeight;
    }
    const w = (el._w || 90) + 6, h = (el._h || 34) + 4;
    const rect = { l: x - w / 2, r: x + w / 2, t: y - h, b: y };
    if (show && pri < 150) {
      for (const q of placed) if (rect.l < q.r && rect.r > q.l && rect.t < q.b && rect.b > q.t) { show = false; break; }
    }
    if (!show) { if (el.style.opacity !== '0') el.style.opacity = '0'; continue; }
    placed.push(rect);
    const fade = pri >= 140 ? 1 : Math.max(0.35, Math.min(1, 1.25 - dist / 260));
    el.style.opacity = String(fade);
    el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -100%)`;
    el.style.zIndex = String(Math.round(pri));
    el.classList.toggle('small', small);
    el.classList.toggle('sel', n.id === state.selected);
    el.classList.toggle('hov', n.id === state.hovered);
  }
  // 세대 표시: 고리의 카메라 오른쪽 끝
  const right = new T.Vector3().setFromMatrixColumn(camera.matrix, 0).setY(0).normalize();
  // 세(世): 화면의 구슬 중 세 기록이 있는 사람에서 시조 쪽 값을 거꾸로 구한다.
  let gen0 = null;
  for (const n of order) {
    const g = n.kind === 'person' && state.model.get(n.id).gen;
    if (g != null && g !== false) { gen0 = g - n.depth; if (n.trunk) break; }
  }
  const seenDepth = new Set();
  for (const [depth, R] of genState.smooth) {
    if (!genState.levels.has(depth)) continue;
    seenDepth.add(depth);
    let el = genLabels.get(depth);
    if (!el) { el = document.createElement('div'); el.className = 'gen'; labelBox.append(el); genLabels.set(depth, el); }
    const label = gen0 != null ? (gen0 + depth >= 1 ? `${gen0 + depth}世` : '') : `${depth + 1}세대`;
    el.textContent = label;
    if (!label) { el.style.opacity = '0'; continue; }
    _p.copy(right).multiplyScalar(R + 1.5); _p.y = -depth * GEN_H;
    _p.project(camera);
    if (_p.z > 1) { el.style.opacity = '0'; continue; }
    el.style.opacity = '1';
    el.style.transform = `translate3d(${((_p.x * 0.5 + 0.5) * W).toFixed(1)}px, ${((-_p.y * 0.5 + 0.5) * H).toFixed(1)}px, 0) translate(4px, -50%)`;
  }
  for (const [d, el] of genLabels) if (!seenDepth.has(d)) { el.remove(); genLabels.delete(d); }
}

// ── 상세 패널 ────────────────────────────────────────────
// 사건 상세: 이 가계도에서 얽힌 인물(누르면 그 사람으로), 다른 가계도·가계도 밖 인물, 이어진 사건, 출처
function renderEventInfo(box, n) {
  const ev = n.ev;
  const ds = state.data.meta.id;
  const here = ev.participants.filter((p) => p.ds === ds && state.model.get(p.id));
  const other = ev.participants.filter((p) => p.ds !== ds);
  const sets = new Map((window.GENEALOGY_DATASETS || []).map((d) => [d.meta.id, d]));
  const nameOf = (p) => { const d = sets.get(p.ds); const q = d && d.persons.find((x) => x.id === p.id); return q ? q.name || q.clan || p.id : p.id; };
  const all = (window.GENEALOGY_EVENTS && window.GENEALOGY_EVENTS.events) || [];
  const rels = ((window.GENEALOGY_EVENTS && window.GENEALOGY_EVENTS.relations) || []).filter((r) => r.from === ev.id || r.to === ev.id)
    .map((r) => ({ r, other: all.find((x) => x.id === (r.from === ev.id ? r.to : r.from)), out: r.from === ev.id })).filter((x) => x.other);
  box.style.setProperty('--c', '#' + n.color.getHexString(T.SRGBColorSpace));
  box.innerHTML = `
    <button type="button" class="close" aria-label="닫기"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10.25"/><path d="M8.6 8.6l6.8 6.8M15.4 8.6l-6.8 6.8"/></svg></button>
    <p class="kicker">EVENT · ${esc(ev.type)}</p>
    <h2>${esc(ev.name)}${ev.hanja ? `<small>${esc(ev.hanja)}</small>` : ''}</h2>
    <div class="rel"><b>${esc(evYears(ev))}</b><span>인물 ${ev.participants.length + (ev.external || []).length}명</span></div>
    ${ev.summary ? `<p class="note">${esc(ev.summary)}</p>` : ''}
    <div class="grp"><p class="grp-h">이 가계도의 인물</p><ul class="plist">${here.map((p) => `<li><button type="button" data-person="${esc(p.id)}">${esc(state.model.displayName(p.id))}${state.model.get(p.id).hanja ? `<small>${esc(state.model.get(p.id).hanja)}</small>` : ''}</button><span>${esc(p.role || '')}</span></li>`).join('')}</ul></div>
    ${other.length ? `<div class="grp"><p class="grp-h">다른 가계도의 인물</p><ul class="plist">${other.map((p) => `<li><span class="nm">${esc(nameOf(p))}</span><span>${esc(p.role || '')}</span></li>`).join('')}</ul></div>` : ''}
    ${(ev.external || []).length ? `<div class="grp"><p class="grp-h">가계도 밖 인물</p><ul class="plist">${ev.external.map((x) => `<li><span class="nm">${esc(x.name)}</span><span>${esc(x.role || '')}</span></li>`).join('')}</ul></div>` : ''}
    ${rels.length ? `<div class="grp"><p class="grp-h">이어진 사건</p><ul class="plist">${rels.map((x) => `<li><span class="nm">${esc(x.other.name)} <small>${esc(evYears(x.other))}</small></span><span>${x.out ? '→' : '←'} ${esc(x.r.type)}</span></li>`).join('')}</ul></div>` : ''}
    ${(ev.sources || []).length ? `<p class="srcs">출처: ${ev.sources.map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a>`).join(', ')}</p>` : ''}
    <div class="acts"><a class="glass-btn primary" href="events.html#${esc(ds)}">인물과 사건에서 보기</a></div>`;
  box.querySelectorAll('[data-person]').forEach((b) => b.addEventListener('click', (e) => {
    e.stopPropagation();
    const id = b.dataset.person;
    haptic(8);
    reveal(id);
    state.selected = id;
    rebuild();
    setTimeout(() => flyTo(nodes.get(id) || [...nodes.values()].find((x) => x.id === id), true), 300);
  }));
}
function renderInfo() {
  const box = $('info');
  const id = state.selected;
  const en = id && id.startsWith('ev:') && nodes.get(id);
  if (en) {
    if (box.hidden) box._openedAt = performance.now();
    renderEventInfo(box, en);
    box.hidden = false;
    return;
  }
  if (!id || !state.model.get(id)) { box.hidden = true; return; }
  const { model } = state;
  const p = model.get(id);
  const r = relOf(id);
  const n = nodes.get(id) || [...nodes.values()].find((x) => x.id === id);
  const c = '#' + (n ? n.color : col(colorOf(id))).getHexString(T.SRGBColorSpace);
  const inTree = state.lineage.has(id);
  const kidsN = inTree ? kids(id).length : 0;
  const desc = inTree ? descCount(id) : 0;
  const bo = model.birthOrder(id);
  const rows = [
    ['생몰년', years(p)],
    p.clan ? ['본관', `${p.clan}${p.gen != null ? ` · ${p.gen}世` : ''}`] : null,
    bo && (bo.sons + bo.daughters > 1 || inTree) ? ['출생 순서', bo.full] : null,
    p.pen ? ['호', p.pen] : null,
    p.courtesy ? ['자', p.courtesy] : null,
  ].filter(Boolean);
  const kicker = id === state.ego ? 'REFERENCE' : isLineal(r) ? 'LINEAL · 직계' : r.kind === 'blood' ? 'COLLATERAL · 방계' : r.kind === 'spouse' || r.kind === 'affinal' ? 'IN-LAW · 인척' : 'RELATION';
  box.style.setProperty('--c', c);
  box.innerHTML = `
    <button type="button" class="close" aria-label="닫기"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10.25"/><path d="M8.6 8.6l6.8 6.8M15.4 8.6l-6.8 6.8"/></svg></button>
    <p class="kicker">${esc(kicker)}</p>
    <h2>${esc(model.displayName(id))}${p.hanja ? `<small>${esc(p.hanja)}</small>` : ''}</h2>
    <div class="rel"><b>${esc(id === state.ego ? '기준 인물' : r.term)}</b><span>${esc(id === state.ego ? '' : chonText(r))}</span></div>
    ${state.showHeir && state.heir.members.has(id) ? '<p class="heir-tag"><i>宗</i>종통 줄기 · 대를 이은 사람</p>' : ''}
    <div class="stats">
      <div class="stat"><b>${kidsN}</b><span>자녀</span></div>
      <div class="stat"><b>${desc}</b><span>자손</span></div>
      <div class="stat"><b>${p.gen != null ? p.gen : '–'}</b><span>세(世)</span></div>
    </div>
    <dl>${rows.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>
    ${p.note ? `<p class="note">${esc(p.note.length > 160 ? p.note.slice(0, 158) + '…' : p.note)}</p>` : ''}
    <div class="acts">
      ${kidsN ? `<button type="button" class="glass-btn primary" data-act="toggle">${state.expanded.has(id) ? '자녀 접기' : `자녀 ${kidsN}명 펼치기`}</button>` : ''}
      ${id !== state.ego && !model.isUnknown(id) ? '<button type="button" class="glass-btn" data-act="ego">기준 인물로</button>' : ''}
      <button type="button" class="glass-btn" data-act="focus">가까이 보기</button>
      <button type="button" class="glass-btn only-narrow" data-act="more">${box.classList.contains('open') ? '간단히' : '자세히'}</button>
    </div>`;
  if (box.hidden) box._openedAt = performance.now();
  box.hidden = false;
  box.querySelectorAll('[data-act]').forEach((b) => b.addEventListener('click', () => {
    const act = b.dataset.act;
    haptic(8);
    // 휴대폰에서는 단추를 누르면 카드를 닫아 바뀐 장면이 바로 보이게 한다('자세히'는 제외).
    const narrow = isNarrow() && act !== 'more';
    if (narrow) closeInfo();
    if (act === 'toggle') toggle(id);
    if (act === 'ego') setEgo(id);
    if (act === 'more') { box.classList.toggle('open'); b.textContent = box.classList.contains('open') ? '간단히' : '자세히'; }
    if (act === 'focus') flyTo(nodes.get(id) || [...nodes.values()].find((x) => x.id === id), true);
  }));
}
// 상세 카드: 닫기 단추, 그리고 휴대폰에서는 카드의 아무 곳이나 눌러도 닫힌다(단추 제외).
function setupInfoCard() {
  const box = $('info');
  box.addEventListener('click', (ev) => {
    // 구슬을 누른 손가락이 떨어질 때 뒤따르는 click이 막 열린 카드에 닿아 바로 닫히지 않도록 잠깐 무시한다.
    if (performance.now() - (box._openedAt || 0) < 450) return;
    if (ev.target.closest('.close')) { haptic(8); closeInfo(); return; }
    if (ev.target.closest('[data-act]')) return;
    if (isNarrow()) { haptic(8); closeInfo(); }
  });
}
function updateHint() {
  $('hint').textContent = (state.tapExpand
    ? '끌기: 회전 · 휠/두 손가락: 확대 · 오른쪽 끌기: 이동 · 구슬 누르기: 자손 펼치기/접기'
    : '끌기: 회전 · 휠/두 손가락: 확대 · 구슬 누르기: 정보 · 길게 누르기: 자손 펼치기/접기')
    + ' · 선 길게 누르기: 자식을 부모 품에';
}

// ── 기준 인물·가계도 바꾸기 ───────────────────────────────
function setEgo(id) {
  state.ego = id;
  state.selected = id;
  $('ego').value = id;
  G.nav?.saveEgo(state.data.meta.id, id);
  reveal(id);
  const a = anchorOf(id);
  if (a) state.expanded.add(a);
  expandDescLine();
  rebuild();
  setTimeout(() => flyTo(nodes.get(a || id), true), 350);
}

function personLabel(id) {
  const p = state.model.get(id);
  return p.hanja ? `${state.model.displayName(id)}(${p.hanja})` : state.model.displayName(id);
}

function loadDataset(data) {
  const model = buildModel(data);
  state.data = data;
  state.model = model;
  state.kin = new Kinship(model);
  let root = data.meta.subject;
  while (model.father(root)) root = model.father(root);
  state.root = root;
  state.lineage = new Set();
  for (const stack = [root]; stack.length;) {
    const id = stack.pop();
    if (state.lineage.has(id)) continue;
    state.lineage.add(id);
    stack.push(...model.children(id, 'legal'));
  }
  state.notable = new Set((data.meta.notable || []).filter((id) => model.get(id)));
  state.eventsByPerson = new Map();
  for (const ev of (window.GENEALOGY_EVENTS && window.GENEALOGY_EVENTS.events) || []) {
    for (const p of ev.participants) {
      if (p.ds !== data.meta.id || !model.get(p.id)) continue;
      if (!state.eventsByPerson.has(p.id)) state.eventsByPerson.set(p.id, []);
      const arr = state.eventsByPerson.get(p.id);
      if (!arr.includes(ev)) arr.push(ev);
    }
  }
  computeHeir();
  const kept = G.nav?.loadEgo(data.meta.id);
  state.ego = kept && model.get(kept) && !model.isUnknown(kept) ? kept : data.meta.subject;
  // 휴대폰은 화면이 좁아 처음에는 상세 패널을 닫아 둔다.
  state.selected = isNarrow() ? null : state.ego;
  state.expanded = new Set([root]);
  state.tucked.clear();
  state.openCollateral.clear();
  reveal(state.ego);
  const a = anchorOf(state.ego);
  if (a) state.expanded.add(a);
  expandDescLine();
  expandHeir();

  for (const n of nodes.values()) removeLabel(n);
  nodes.clear();
  for (const el of genLabels.values()) el.remove();
  genLabels.clear(); genState.smooth.clear();

  const short = data.meta.title.replace(/\(.*?\)/g, '').replace(/가계도$/, '').trim();
  document.title = `${short} · 버블 가계도`;
  $('title').textContent = `${short} 버블 가계도`;
  $('subtitle').textContent = `${data.meta.clan} · 시조부터 자손까지 · 목업 데이터`;
  const ids = [...model.persons.keys()].filter((id) => !model.isUnknown(id));
  $('ego').replaceChildren(...ids.map((id) => new Option(personLabel(id), id)));
  $('ego').value = state.ego;
  $('dataset').value = data.meta.id;
  $('people').replaceChildren(...ids.map((id) => { const o = document.createElement('option'); o.value = personLabel(id); return o; }));
  $('find').value = '';

  rebuild({ instant: true });
  // 처음에는 멀리서 다가오며 전체를 맞춘다.
  ctl.radius = 260; ctl.theta = 0.2; ctl.phi = 1.25;
  ctl.target.set(0, -state.maxDepth * GEN_H * 0.5, 0);
  setTimeout(() => fit(), 60);
  // 배치가 퍼진 뒤 한 번 더 맞춘다(그사이 사용자가 움직였으면 그대로 둔다).
  setTimeout(() => { if (ctl.idle > 1.5) fit(); }, 1800);
}

// ── 시작 ────────────────────────────────────────────────
function resize() {
  const w = canvas.clientWidth || window.innerWidth, h = canvas.clientHeight || window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  post.setSize(w, h, renderer.getPixelRatio());
}

let last = performance.now();
function frame(now) {
  requestAnimationFrame(frame);
  if (document.hidden) { last = now; return; }
  const dt = Math.min(1 / 30, (now - last) / 1000);
  last = now;
  clock += dt;
  uTime.value = clock;
  processHover();
  simulate(dt);
  writeInstances();
  updateCamera(dt);
  dust.rotation.y += dt * 0.01;
  post.render();
  updateLabels();
}

function main() {
  try { state.descAxis = localStorage.getItem('genealogy.descAxis') === '1'; } catch (err) { /* 저장 불가: 기본값 */ }
  try { state.showHeir = localStorage.getItem('genealogy.showHeir') !== '0'; } catch (err) { /* 저장 불가: 기본값 */ }
  try { state.tapExpand = localStorage.getItem('genealogy.tapExpand') !== '0'; } catch (err) { /* 저장 불가: 기본값 */ }
  try { state.showCollateral = localStorage.getItem('genealogy.showCollateral') === '1'; } catch (err) { /* 저장 불가: 기본값(접기) */ }
  try { state.showEvents = localStorage.getItem('genealogy.showEvents') !== '0'; } catch (err) { /* 저장 불가: 기본값(켬) */ }
  const datasets = window.GENEALOGY_DATASETS || [];
  if (!datasets.length) throw new Error('가계 데이터(data/*.js)를 불러오지 못했습니다');
  if (!initGL()) return;
  const byId = new Map(datasets.map((d) => [d.meta.id, d]));
  const shortName = (d) => d.meta.title.replace(/\(.*?\)/g, '').replace(/가계도$/, '').trim();
  $('dataset').replaceChildren(...datasets.map((d) => new Option(shortName(d), d.meta.id)));
  const fromHash = () => byId.get(decodeURIComponent(location.hash.slice(1)));
  $('dataset').addEventListener('change', (e) => { location.hash = e.target.value; });
  window.addEventListener('hashchange', () => { const d = fromHash(); if (d && d !== state.data) loadDataset(d); });
  $('ego').addEventListener('change', (e) => setEgo(e.target.value));
  $('find').addEventListener('change', (e) => {
    const q = e.target.value.trim();
    if (!q) return;
    const { model } = state;
    const ids = [...model.persons.keys()].filter((id) => !model.isUnknown(id));
    const hit = ids.find((id) => personLabel(id) === q) ||
      ids.find((id) => personLabel(id).includes(q) || (model.get(id).hanja || '').includes(q));
    if (!hit) return;
    reveal(hit);
    state.selected = hit;
    rebuild();
    setTimeout(() => flyTo(nodes.get(hit) || [...nodes.values()].find((x) => x.id === hit), true), 300);
    e.target.blur();
  });
  $('showSpouses').addEventListener('change', (e) => { state.showSpouses = e.target.checked; rebuild(); });
  $('hideUnknown').addEventListener('change', (e) => { state.hideUnknown = e.target.checked; rebuild(); });
  $('showEvents').checked = state.showEvents;
  $('showEvents').addEventListener('change', (e) => {
    state.showEvents = e.target.checked;
    try { localStorage.setItem('genealogy.showEvents', state.showEvents ? '1' : '0'); } catch (err) { /* 저장 불가: 무시 */ }
    if (!state.showEvents && state.selected && state.selected.startsWith('ev:')) state.selected = null;
    rebuild();
  });
  $('autoRotate').checked = state.autoRotate;
  $('autoRotate').addEventListener('change', (e) => { state.autoRotate = e.target.checked; });
  $('tapExpand').checked = state.tapExpand;
  $('tapExpand').addEventListener('change', (e) => {
    state.tapExpand = e.target.checked;
    try { localStorage.setItem('genealogy.tapExpand', state.tapExpand ? '1' : '0'); } catch (err) { /* 저장 불가: 무시 */ }
    updateHint();
  });
  updateHint();
  setupInfoCard();
  $('showHeir').checked = state.showHeir;
  $('showHeir').addEventListener('change', (e) => {
    state.showHeir = e.target.checked;
    try { localStorage.setItem('genealogy.showHeir', state.showHeir ? '1' : '0'); } catch (err) { /* 저장 불가: 무시 */ }
    expandHeir();
    rebuild();
  });
  $('descAxis').checked = state.descAxis;
  $('descAxis').addEventListener('change', (e) => {
    state.descAxis = e.target.checked;
    try { localStorage.setItem('genealogy.descAxis', state.descAxis ? '1' : '0'); } catch (err) { /* 저장 불가: 무시 */ }
    expandDescLine();
    rebuild();
    setTimeout(() => fit(), 900);
  });
  $('expandAll').addEventListener('click', () => {
    state.tucked.clear();
    setShowCollateral(true); // 모두 펼치기는 방계도 보이게 한다
    for (const id of state.lineage) state.expanded.add(id);
    rebuild();
    setTimeout(() => fit(), 900);
  });
  $('collapseAll').addEventListener('click', () => {
    state.expanded = new Set([state.root]);
    state.tucked.clear();
    state.openCollateral.clear();
    reveal(state.ego);
    expandDescLine();
    expandHeir();
    rebuild();
    setTimeout(() => fit(), 600);
  });
  $('toggleControls').addEventListener('click', () => {
    const on = !document.body.classList.contains('controls-open');
    document.body.classList.toggle('controls-open', on);
    $('toggleControls').setAttribute('aria-expanded', String(on));
  });

  $('showCollateral').checked = state.showCollateral;
  $('showCollateral').addEventListener('change', (e) => {
    setShowCollateral(e.target.checked);
    rebuild();
    setTimeout(() => fit(), 900);
  });

  setupControls();
  window.addEventListener('resize', resize);
  resize();
  loadDataset(fromHash() || byId.get(DEFAULT_DATASET) || datasets[0]);
  requestAnimationFrame(frame);
  // 테스트·디버그용
  window.__bubble = { state, nodes, ctl, toggle, tuck, untuck, pickLink, fit, setEgo, camera: () => camera, scene: () => scene };
}

main();
})();
