// 인물과 사건: 가계도 인물들이 얽힌 역사적 사건과, 사건 사이의 인과를 3D 관계망으로 그린다.
//   · 세로는 시간(위에서 아래로). 사건이 몰린 시기는 넓게 펴서(밀도 보정) 겹치지 않게 한다.
//   · 사건은 종류별 색의 결정(多面體) 구슬, 기간이 있는 사건은 시작에서 끝까지 빛기둥을 세운다.
//   · 인물은 가계도별 색의 작은 유리 구슬로, 자기가 얽힌 사건들 가까이에 모인다.
//     가계도마다 둘레의 한 방향을 맡아, 여러 집안이 한 사건에 모이는 모습이 드러난다.
//   · 선: 인물–사건(역할), 사건–사건(원인·결과·일부·영향·대립·계승, 화살표 방향으로 빛이 흐른다),
//     인물–인물(가계 줄기: 가계도의 핏줄로 이은 조상 → 자손. 시대가 떨어진 사건들이 한 집안으로 이어진다).
//   · 사건이나 인물을 누르면 그와 이어진 관계만 밝게 남고 나머지는 흐려진다.
//   · 렌더링 셰이더(유리 구슬, 흐르는 선, 성운 하늘, 블룸)는 버블 가계도(js/bubble.js)와 같다.
(function () {
'use strict';

const G = window.Genealogy || {};
const T = window.THREE;

const missing = new Map();
const $ = (id) => document.getElementById(id) || missing.get(id) ||
  (missing.set(id, document.createElement('div')), missing.get(id));

// ── 설정 ────────────────────────────────────────────────
const HOME_R = 38;         // 가계도별 '집' 방향의 거리(인물이 모이는 둘레)
let Y_SPAN = 110;          // 맨 위 사건에서 맨 아래 사건까지의 높이(사건 수에 맞춰 정한다)
const R_EVENT = 1.15;
const R_PERSON = 0.62;
const SEG = 14;
const MAX_EDGE_INST = 20000;
const TYPES = ['전쟁', '전투', '사화·옥사', '정변', '정책·제도', '학문·저술', '교육·서원', '종교', '외교', '기타'];
const TYPE_COLORS = {
  '전쟁': '#ff5a4a', '전투': '#ff9446', '사화·옥사': '#c77dff', '정변': '#ff4f9a', '정책·제도': '#ffd166',
  '학문·저술': '#5fe3ff', '교육·서원': '#7dffd8', '종교': '#b9f26b', '외교': '#8ab4ff', '기타': '#a9c4dc',
};
const REL_TYPES = ['원인', '결과로 이어짐', '일부', '영향', '대립', '계승'];
const REL_COLORS = {
  '원인': '#ff7a5c', '결과로 이어짐': '#ffb14a', '일부': '#8ab4ff', '영향': '#6fe6ff', '대립': '#ff4f9a', '계승': '#7dffd8',
};
const FAMILY_COLORS = ['#ffc95c', '#5fe3ff', '#ff8fbf', '#a58bff', '#7dffd8', '#ff9a5c', '#b9f26b', '#8ab4ff'];
const EXTERNAL_COLOR = '#8796ad';
const col = (hex) => new T.Color(hex);

function haptic(pattern) {
  try { if (navigator.vibrate) navigator.vibrate(pattern); } catch (e) { /* 지원 안 함 */ }
}
const isNarrow = () => window.matchMedia('(max-width: 820px)').matches;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const state = {
  families: new Map(),   // ds id → { id, short, color, index, persons: Map }
  events: [], eventById: new Map(),
  people: new Map(),     // 인물 key → { key, name, hanja, refs: [{ ds, id }], fam, external, roles: [{ ev, role }] }
  famOn: new Set(), type: '', showRelations: true, showExternal: true, showKin: true,
  models: new Map(),     // ds id → { model, kin } (가계 줄기 계산용) autoRotate: !reduceMotion,
  selected: null, hovered: null, focus: null, selLink: null, hoverLink: null, // focus: 선택한 노드와 이어진 노드 key 집합
};

// ── 데이터 읽기 ──────────────────────────────────────────
function shortName(d) { return d.meta.title.replace(/\(.*?\)/g, '').replace(/가계도$/, '').trim(); }
function years(p) {
  if (!p) return '';
  if (!p.birth && !p.death) return '생몰년 미상';
  return `${p.birth ?? '?'}–${p.death ?? '?'}`;
}
function evYears(ev) { return ev.end && ev.end !== ev.start ? `${ev.start}–${ev.end}` : `${ev.start}`; }

function loadData() {
  const sets = window.GENEALOGY_DATASETS || [];
  sets.forEach((d, i) => {
    const persons = new Map(d.persons.map((p) => [p.id, p]));
    state.families.set(d.meta.id, { id: d.meta.id, short: shortName(d), color: FAMILY_COLORS[i % FAMILY_COLORS.length], index: i, persons, notable: new Set(d.meta.notable || []) });
  });
  if (G.buildModel) {
    for (const d of sets) {
      try { const model = G.buildModel(d); state.models.set(d.meta.id, { model, kin: G.Kinship ? new G.Kinship(model) : null }); }
      catch (e) { console.warn('가계 모델을 만들지 못함', d.meta.id, e); }
    }
  }
  const src = window.GENEALOGY_EVENTS || { events: [], relations: [] };
  // 같은 사람이 두 가계도에 있으면(예: 태종) 이름+한자로 한 구슬에 모은다.
  const personKey = (p) => `${p.name}|${p.hanja || ''}`;
  for (const raw of src.events) {
    const ev = { ...raw, kind: 'event', parts: [], rels: [] };
    state.events.push(ev);
    state.eventById.set(ev.id, ev);
    for (const pt of raw.participants || []) {
      const fam = state.families.get(pt.ds);
      const p = fam && fam.persons.get(pt.id);
      if (!p) { console.warn('사건 참여자 없음', ev.id, pt.ds, pt.id); continue; }
      const key = personKey(p);
      let P = state.people.get(key);
      if (!P) { P = { key, name: p.name, hanja: p.hanja, raw: p, refs: [], fam: pt.ds, external: false, roles: [] }; state.people.set(key, P); }
      if (!P.refs.some((r) => r.ds === pt.ds)) P.refs.push({ ds: pt.ds, id: pt.id });
      if (P.roles.some((r) => r.ev === ev)) continue; // 두 가계도에 같은 사람이 있으면 한 번만
      P.roles.push({ ev, role: pt.role });
      ev.parts.push({ P, role: pt.role });
    }
    for (const x of raw.external || []) {
      const key = `x:${x.name}|${x.hanja || ''}`;
      let P = state.people.get(key);
      if (!P) { P = { key, name: x.name, hanja: x.hanja, raw: null, refs: [], fam: null, external: true, roles: [] }; state.people.set(key, P); }
      if (!P.roles.some((r) => r.ev === ev)) P.roles.push({ ev, role: x.role });
      ev.parts.push({ P, role: x.role });
    }
  }
  for (const r of src.relations || []) {
    const a = state.eventById.get(r.from), b = state.eventById.get(r.to);
    if (!a || !b) { console.warn('사건 관계의 사건 없음', r); continue; }
    const rel = { a, b, type: r.type, note: r.note };
    a.rels.push(rel); b.rels.push(rel);
  }
  for (const P of state.people.values()) P.roles.sort((x, y) => x.ev.start - y.ev.start);
  state.events.sort((a, b) => a.start - b.start || (a.end || a.start) - (b.end || b.start));
  buildTimeScale();
}

// 시간 → 높이: 선형 눈금과 '사건 순위' 눈금을 반씩 섞는다. 사건이 몰린 시기(예: 임진왜란 7년)가 넓게 펴진다.
let yearMin = 0, yearMax = 1, rankYears = [];
function buildTimeScale() {
  const ys = [...new Set(state.events.flatMap((e) => [e.start, e.end || e.start]))].sort((a, b) => a - b);
  yearMin = ys[0] ?? 1400; yearMax = ys[ys.length - 1] ?? 1900;
  if (yearMax === yearMin) yearMax = yearMin + 1;
  rankYears = ys;
  Y_SPAN = Math.max(70, Math.min(150, state.events.length * 1.5));
}
function yearToY(year) {
  const lin = (year - yearMin) / (yearMax - yearMin);
  // 순위: year 이하인 서로 다른 사건 연도의 비율(사이 값은 선형 보간)
  const R = rankYears, n = R.length;
  let rank;
  if (n < 2) rank = lin;
  else if (year <= R[0]) rank = 0;
  else if (year >= R[n - 1]) rank = 1;
  else {
    let i = 0; while (R[i + 1] < year) i++;
    rank = (i + (year - R[i]) / (R[i + 1] - R[i])) / (n - 1);
  }
  return -(lin * 0.45 + rank * 0.55) * Y_SPAN;
}

// ── 3D 장면 ──────────────────────────────────────────────
let renderer, scene, camera, post;
let spheres, crystals, rings, edges, timeLines, dust, sky;
const canvas = $('gl');

// ── 아래 셰이더·후처리는 js/bubble.js와 같다(버블 가계도와 같은 화면 질감) ──
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

function sphereMaterial() {
  return new T.ShaderMaterial({
    uniforms: { uTime, uLight: { value: new T.Vector3(0.5, 0.75, 0.42).normalize() } },
    vertexShader: /* glsl */`
      attribute vec3 aColor;
      attribute vec4 aParams; // x 밝기, y 강조(마우스·선택), z 미상(채도 낮춤), w 고유값
      varying vec3 vN, vV, vObj, vColor; varying vec4 vP;
      void main() {
        vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
        vN = normalize(mat3(modelMatrix * instanceMatrix) * normal);
        vV = normalize(cameraPosition - wp.xyz);
        vObj = position; vColor = aColor; vP = aParams;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }`,
    fragmentShader: /* glsl */`
      uniform float uTime; uniform vec3 uLight;
      varying vec3 vN, vV, vObj, vColor; varying vec4 vP;
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
        float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
        c = mix(c, vec3(l) * vec3(0.8, 0.86, 1.0) * 0.7, vP.z);
        gl_FragColor = vec4(clamp(c, 0.0, 32.0), 1.0);
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
  dust = makeDust();
  scene.add(dust);

  const attrs = [['aColor', 3], ['aParams', 4]];
  const segs = isNarrow() ? 32 : 44;
  spheres = instanced(new T.SphereGeometry(1, segs, Math.round(segs * 0.7)), sphereMaterial(), 1500, attrs);
  // 사건: 면이 보이는 결정(이십면체). 꼭짓점이 면마다 따로 있어 면마다 법선이 선다(평평한 면).
  const crystalGeo = new T.IcosahedronGeometry(1, 0);
  crystals = instanced(crystalGeo, sphereMaterial(), 600, attrs);
  rings = instanced(new T.TorusGeometry(1, 0.03, 8, 160), ringMaterial(), 600, attrs);
  edges = instanced(new T.CylinderGeometry(1, 1, 1, 8, 1, true), edgeMaterial(), MAX_EDGE_INST,
    [['aColA', 3], ['aColB', 3], ['aSeg', 2], ['aParams', 4]]);
  rings.renderOrder = 4; edges.renderOrder = 2;
  scene.add(spheres, crystals, edges, rings);

  // 연대 고리(50년마다 가는 원)
  timeLines = new T.LineSegments(new T.BufferGeometry(), new T.LineBasicMaterial({
    color: new T.Color('#5aa8ff'), transparent: true, opacity: 0.14, depthWrite: false, blending: T.AdditiveBlending,
  }));
  timeLines.frustumCulled = false;
  scene.add(timeLines);

  post = makePost();
  return true;
}

// ── 노드 ────────────────────────────────────────────────
// key: 'e:<사건 id>' | 'p:<인물 key>'
const nodes = new Map();
let order = [];
let linkList = []; // { a: 사건 노드, b: 인물 노드 | 사건 노드, kind: 'role' | 'rel', role?, rel? }
let alpha = 1;
let clock = 0;

function makeNode(key, kind) {
  return {
    key, kind, pos: new T.Vector3(), vel: new T.Vector3(), radius: 1, color: new T.Color(),
    scale: 0, scaleV: 0, alive: true, delay: 0, hl: 0, dim: 0, seed: Math.random(), y: 0,
  };
}

// 가계도별 '집' 방향: 둘레를 나눠 맡는다.
function homeOf(famId) {
  const f = state.families.get(famId);
  const n = state.families.size || 1;
  const a = (f ? f.index : 0) / n * Math.PI * 2 + 0.4;
  return { x: Math.cos(a), z: Math.sin(a) };
}

// 인물을 어느 가계도 사람으로 보일지: 두 가계도에 있으면(예: 태종) 지금 고른 가계도 쪽을 앞세운다.
function famOf(P) {
  if (P.external) return null;
  return (P.refs.find((r) => state.famOn.has(r.ds)) || P.refs[0]).ds;
}
function famLabel(P) {
  if (P.external) return '가계도 밖 인물';
  const on = P.refs.filter((r) => state.famOn.has(r.ds));
  return (on.length ? on : P.refs).map((r) => state.families.get(r.ds).short).join(' · ');
}

function eventVisible(ev) {
  if (state.type && ev.type !== state.type) return false;
  return ev.parts.some(({ P }) => !P.external && P.refs.some((r) => state.famOn.has(r.ds)));
}
function personVisible(P) {
  if (P.external) return state.showExternal;
  return P.refs.some((r) => state.famOn.has(r.ds));
}

function rebuild({ instant = false } = {}) {
  for (const n of nodes.values()) n.alive = false;
  const get = (key, kind) => {
    let n = nodes.get(key);
    if (!n) { n = makeNode(key, kind); nodes.set(key, n); n.isNew = true; }
    n.alive = true;
    return n;
  };
  const fading = linkList.filter((l) => !l.a.alive || !l.b.alive);
  linkList = [];
  const visEvents = state.events.filter(eventVisible);
  for (const ev of visEvents) {
    const n = get(`e:${ev.id}`, 'event');
    n.ev = ev;
    n.y = yearToY(ev.start);
    n.yEnd = ev.end && ev.end !== ev.start ? yearToY(ev.end) : null;
    n.radius = R_EVENT * (1 + 0.1 * Math.sqrt(ev.parts.length));
    n.color.set(TYPE_COLORS[ev.type] || TYPE_COLORS['기타']);
    if (n.isNew) {
      // 참여 가계도들의 집 방향 평균에서 태어난다.
      let x = 0, z = 0;
      for (const { P } of ev.parts) if (!P.external && personVisible(P)) { const h = homeOf(famOf(P)); x += h.x; z += h.z; }
      const L = Math.hypot(x, z) || 1;
      n.pos.set((x / L) * HOME_R * 0.45 + (Math.random() - 0.5) * 4, n.y, (z / L) * HOME_R * 0.45 + (Math.random() - 0.5) * 4);
      n.delay = instant ? Math.min(0.8, (-n.y / Y_SPAN) * 0.8) : 0.02 + Math.random() * 0.1;
      n.isNew = false;
    }
  }
  const visKeys = new Set(visEvents.map((e) => e.id));
  for (const P of state.people.values()) {
    if (!personVisible(P)) continue;
    const evs = P.roles.filter((r) => visKeys.has(r.ev.id));
    if (!evs.length) continue;
    const n = get(`p:${P.key}`, 'person');
    n.P = P;
    // 높이: 이어진 사건들의 평균(생몰년이 아니라 사건 시점에 둔다)
    n.y = evs.reduce((s, r) => s + yearToY(r.ev.start), 0) / evs.length;
    n.radius = R_PERSON * (1 + 0.12 * Math.sqrt(evs.length - 1));
    n.fam = famOf(P);
    n.color.set(P.external ? EXTERNAL_COLOR : state.families.get(n.fam).color);
    n.notable = !P.external && P.refs.some((r) => state.families.get(r.ds)?.notable.has(r.id));
    if (n.isNew) {
      const ev0 = nodes.get(`e:${evs[0].ev.id}`);
      const h = P.external ? { x: 0, z: 0 } : homeOf(n.fam);
      n.pos.set((ev0 ? ev0.pos.x : 0) + h.x * 3 + (Math.random() - 0.5) * 2, n.y, (ev0 ? ev0.pos.z : 0) + h.z * 3 + (Math.random() - 0.5) * 2);
      n.delay = instant ? 0.3 + Math.random() * 0.6 : 0.05 + Math.random() * 0.1;
      n.isNew = false;
    }
    for (const r of evs) linkList.push({ a: nodes.get(`e:${r.ev.id}`), b: n, kind: 'role', role: r.role });
  }
  if (state.showKin) addKinLinks();
  if (state.showRelations) {
    const seen = new Set();
    for (const ev of visEvents) for (const rel of ev.rels) {
      if (seen.has(rel)) continue;
      seen.add(rel);
      const a = nodes.get(`e:${rel.a.id}`), b = nodes.get(`e:${rel.b.id}`);
      if (a && b && a.alive && b.alive) linkList.push({ a, b, kind: 'rel', rel });
    }
  }
  linkList.push(...fading.filter((l) => !l.a.alive || !l.b.alive));
  order = [...nodes.values()];
  alpha = 1;
  computeFocus();
  updateLabelsContent();
  renderInfo();
  updateLegendCounts();
  updateSubtitle(visEvents.length);
}
// 지금 무엇이 보이는지: 고른 가계도가 일부이면 그 가계도 인물이 얽힌 사건만 보인다는 것을 밝힌다.
function updateSubtitle(nEv) {
  const on = [...state.famOn].map((d) => state.families.get(d).short);
  const all = state.famOn.size === state.families.size;
  const fam = all ? '여섯 가계도' : on.join(' · ') + ' 가계';
  $('subtitle').textContent = `${fam} 인물이 얽힌 사건 ${nEv}개${state.type ? ` (${state.type})` : ''}` +
    (all ? ' · 위에서 아래로 흐르는 시간' : ' · 함께한 다른 가계도 인물은 숨김(칩으로 켜기)');
}

// 가계 줄기: 화면에 보이는 인물마다 가계도에서 위로(부모 → 조부모 …) 올라가다가, 처음 만나는 '화면에 보이는 조상'과 잇는다.
// 그 조상 너머로는 더 올라가지 않으므로, 한 집안의 인물들이 사슬처럼 이어진다(태종 → 익녕군 계통 → 이원익 …).
function addKinLinks() {
  const byRef = new Map();
  for (const n of nodes.values()) {
    if (!n.alive || n.kind !== 'person' || n.P.external) continue;
    for (const r of n.P.refs) byRef.set(`${r.ds}|${r.id}`, n);
  }
  const made = new Set();
  for (const n of [...nodes.values()]) {
    if (!n.alive || n.kind !== 'person' || n.P.external) continue;
    for (const r of n.P.refs) {
      if (!state.famOn.has(r.ds)) continue;
      const M = state.models.get(r.ds);
      if (!M) continue;
      const seen = new Set([r.id]);
      let frontier = [r.id];
      for (let gen = 1; gen <= 30 && frontier.length; gen++) {
        const next = [];
        for (const id of frontier) for (const pid of M.model.parents(id, 'legal')) {
          if (seen.has(pid)) continue;
          seen.add(pid);
          const a = byRef.get(`${r.ds}|${pid}`);
          if (a && a !== n) {
            const key = `${a.key}>${n.key}`;
            if (!made.has(key)) {
              made.add(key);
              const rel = M.kin ? M.kin.relation(pid, r.id) : null;
              linkList.push({ a, b: n, kind: 'kin', ds: r.ds, gen, term: rel ? rel.term : `${gen}대` });
            }
            continue; // 보이는 조상에서 멈춘다
          }
          next.push(pid);
        }
        frontier = next;
      }
    }
  }
  bridgeKin(byRef);
}
// 조상 사슬로도 안 이어지는 덩어리(예: 숙부·처가 쪽 사람들만 나온 사건)는, 같은 가계도 안에서
// 가장 가까운 친척(혈족 촌수가 작은 쪽, 인척은 한 촌 더 먼 것으로 친다)과 한 줄로 잇는다.
function bridgeKin(byRef) {
  const persons = [...new Set(byRef.values())];
  const parent = new Map([...nodes.values()].filter((n) => n.alive).map((n) => [n, n]));
  const find = (x) => { while (parent.get(x) !== x) { parent.set(x, parent.get(parent.get(x))); x = parent.get(x); } return x; };
  const unite = (a, b) => parent.set(find(a), find(b));
  for (const L of linkList) if (L.a.alive && L.b.alive) unite(L.a, L.b);
  const dist = (r) => r.kind === 'blood' ? r.chon : r.kind === 'spouse' ? 1 : (r.kind === 'affinal' || r.kind === 'sadon') ? (r.chon ?? 2) + 1 : Infinity;
  for (const ds of state.famOn) {
    const M = state.models.get(ds);
    if (!M || !M.kin) continue;
    const mine = persons.filter((n) => n.P.refs.some((r) => r.ds === ds));
    const idOf = (n) => n.P.refs.find((r) => r.ds === ds).id;
    for (let guard = 0; guard < 20; guard++) {
      const groups = new Map();
      for (const n of mine) { const g = find(n); if (!groups.has(g)) groups.set(g, []); groups.get(g).push(n); }
      if (groups.size < 2) break;
      const list = [...groups.values()].sort((a, b) => a.length - b.length);
      const small = list[0], rest = list.slice(1).flat();
      let best = null;
      for (const x of small) for (const y of rest) {
        const r = M.kin.relation(idOf(y), idOf(x));
        const d = dist(r);
        if (d < Infinity && (!best || d < best.d)) best = { x, y, r, d };
      }
      if (!best) break;
      // 위(먼저 산 사람)에서 아래로 긋는다
      const [a, b] = best.x.pos.y > best.y.pos.y ? [best.x, best.y] : [best.y, best.x];
      const r = M.kin.relation(idOf(a), idOf(b));
      linkList.push({ a, b, kind: 'kin', ds, bridge: true, chon: r.chon, term: `${r.term}${r.kind === 'blood' && r.chon ? ` · ${r.chon}촌` : ''}` });
      unite(a, b);
    }
  }
}

// 고른 노드와 이어진 것들: 사건이면 참여 인물과 인과로 이어진 사건, 인물이면 그가 얽힌 사건과 함께한 인물.
function computeFocus() {
  if (state.selLink) {
    const L = state.selLink;
    state.focus = L.a.alive && L.b.alive ? new Set([L.a.key, L.b.key]) : null;
    if (!state.focus) state.selLink = null;
    return;
  }
  const k = state.selected;
  const n = k && nodes.get(k);
  if (!n || !n.alive) { state.focus = null; return; }
  const f = new Set([k]);
  for (const L of linkList) {
    if (!L.a.alive || !L.b.alive) continue;
    if (L.a.key === k) f.add(L.b.key);
    if (L.b.key === k) f.add(L.a.key);
  }
  // 인물을 고르면 그 사람의 사건에 함께 얽힌 사람도 은은하게 남긴다.
  if (n.kind === 'person') {
    const evKeys = [...f].filter((x) => x.startsWith('e:'));
    for (const L of linkList) if (L.kind === 'role' && evKeys.includes(L.a.key)) f.add(L.b.key);
  }
  state.focus = f;
}
const inFocus = (n) => !state.focus || state.focus.has(n.key);
const linkInFocus = (L) => !state.focus || L === state.selLink || (!state.selLink && state.focus.has(L.a.key) && state.focus.has(L.b.key) &&
  (L.a.key === state.selected || L.b.key === state.selected || (L.kind === 'role' && nodes.get(state.selected)?.kind === 'person')));

// ── 배치: 높이는 시간으로 고정, 가로(x, z)만 힘으로 움직인다 ──────────
function simulate(dt) {
  const live = order.filter((n) => n.alive);
  alpha = Math.max(0, alpha - dt * 0.16);
  const a = alpha;
  if (a > 0.002) {
    for (const n of live) { n.fx = 0; n.fz = 0; }
    for (const n of live) {
      // 집 방향으로 은근히: 인물은 자기 가계도 쪽, 사건은 가운데 쪽
      if (n.kind === 'person' && !n.P.external) {
        const h = homeOf(n.fam);
        n.fx += (h.x * HOME_R - n.pos.x) * 0.05; n.fz += (h.z * HOME_R - n.pos.z) * 0.05;
      } else { n.fx -= n.pos.x * 0.012; n.fz -= n.pos.z * 0.012; }
    }
    for (const L of linkList) {
      if (!L.a.alive || !L.b.alive) continue;
      const k = L.kind === 'role' ? 0.9 : L.kind === 'kin' ? 0.12 : 0.35;
      const dx = L.b.pos.x - L.a.pos.x, dz = L.b.pos.z - L.a.pos.z;
      L.a.fx += dx * k * (L.kind === 'role' ? 0.25 : 1); L.a.fz += dz * k * (L.kind === 'role' ? 0.25 : 1);
      L.b.fx -= dx * k; L.b.fz -= dz * k;
    }
    for (let i = 0; i < live.length; i++) {
      const A = live[i];
      for (let j = i + 1; j < live.length; j++) {
        const B = live[j];
        const dy = Math.abs(A.pos.y - B.pos.y);
        if (dy > 12) continue;
        let dx = A.pos.x - B.pos.x, dz = A.pos.z - B.pos.z;
        let d2 = dx * dx + dz * dz;
        if (d2 < 1e-4) { dx = Math.random() - 0.5; dz = Math.random() - 0.5; d2 = dx * dx + dz * dz; }
        const d = Math.sqrt(d2);
        const w = 1 - dy / 12;
        const min = (A.radius + B.radius) * 1.8 + 1.6;
        let f = 110 * w * (A.radius * B.radius) / (d2 + 3);
        if (d < min) f += (min - d) * 24 * w;
        const ux = dx / d, uz = dz / d;
        A.fx += ux * f; A.fz += uz * f;
        B.fx -= ux * f; B.fz -= uz * f;
      }
    }
    for (const n of live) {
      n.vel.x = (n.vel.x + n.fx * dt * a) * Math.exp(-dt * 5);
      n.vel.z = (n.vel.z + n.fz * dt * a) * Math.exp(-dt * 5);
      const sp = Math.hypot(n.vel.x, n.vel.z), max = 50;
      if (sp > max) { n.vel.x *= max / sp; n.vel.z *= max / sp; }
      n.pos.x += n.vel.x * dt; n.pos.z += n.vel.z * dt;
    }
  }
  const yRate = 1 - Math.exp(-dt * 5);
  for (const n of live) n.pos.y += (n.y - n.pos.y) * yRate;
  for (const n of order) {
    if (n.delay > 0) { n.delay -= dt; continue; }
    const target = n.alive ? 1 : 0;
    n.scaleV += (target - n.scale) * 170 * dt;
    n.scaleV *= Math.exp(-dt * (n.alive ? 13 : 22));
    n.scale = Math.max(0, n.scale + n.scaleV * dt);
    const hlT = n.key === state.hovered ? 1 : n.key === state.selected ? 0.8 : 0;
    n.hl += (hlT - n.hl) * (1 - Math.exp(-dt * 10));
    const dimT = inFocus(n) ? 0 : 1;
    n.dim += (dimT - n.dim) * (1 - Math.exp(-dt * 6));
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
const _m = new T.Matrix4(), _q = new T.Quaternion(), _s = new T.Vector3(), _v = new T.Vector3(), _up = new T.Vector3(0, 1, 0);
const _c = new T.Color();
let drawnS = [], drawnC = [];

// 선의 3차 곡선 조절점. 사건→인물은 짧은 곡선, 사건→사건은 바깥으로 휘는 아치.
function linkCurve(L, P0, P1, P2, P3) {
  P0.copy(L.a.pos); P3.copy(L.b.pos);
  const mx = (P0.x + P3.x) / 2, my = (P0.y + P3.y) / 2, mz = (P0.z + P3.z) / 2;
  if (L.kind === 'kin') {
    // 조상(위)에서 자손(아래)으로 곧게 내려오는 S자
    const h = (P0.y - P3.y) * 0.45;
    P1.set(P0.x, P0.y - h, P0.z); P2.set(P3.x, P3.y + h, P3.z);
  } else if (L.kind === 'role') {
    P1.set(P0.x + (mx - P0.x) * 0.6, P0.y, P0.z + (mz - P0.z) * 0.6);
    P2.set(P3.x + (mx - P3.x) * 0.6, P3.y, P3.z + (mz - P3.z) * 0.6);
  } else {
    let ox = mx, oz = mz;
    const ol = Math.hypot(ox, oz);
    if (ol < 0.03) { ox = 1; oz = 0; } else { ox /= ol; oz /= ol; }
    const k = 4 + P0.distanceTo(P3) * 0.25;
    P1.set((P0.x + mx) / 2 + ox * k, (P0.y + my) / 2, (P0.z + mz) / 2 + oz * k);
    P2.set((P3.x + mx) / 2 + ox * k, (P3.y + my) / 2, (P3.z + mz) / 2 + oz * k);
  }
}

function writeInstances() {
  const sc = spheres.geometry.attributes.aColor.array, sp = spheres.geometry.attributes.aParams.array;
  const cc = crystals.geometry.attributes.aColor.array, cp = crystals.geometry.attributes.aParams.array;
  const rc = rings.geometry.attributes.aColor.array, rp = rings.geometry.attributes.aParams.array;
  drawnS = []; drawnC = [];
  let i = 0, c = 0, r = 0;
  for (const n of order) {
    if (n.scale <= 0.001) continue;
    const rad = n.radius * n.scale;
    const dimK = 1 - n.dim * 0.9;
    if (n.kind === 'event') {
      _q.setFromAxisAngle(_up, clock * 0.25 + n.seed * 6);
      _m.compose(n.pos, _q, _s.set(rad, rad * 1.12, rad));
      crystals.setMatrixAt(c, _m);
      cc[c * 3] = n.color.r; cc[c * 3 + 1] = n.color.g; cc[c * 3 + 2] = n.color.b;
      cp[c * 4] = 1.35 * dimK; cp[c * 4 + 1] = n.hl; cp[c * 4 + 2] = n.dim * 0.85; cp[c * 4 + 3] = n.seed;
      drawnC[c] = n; c++;
    } else {
      _q.identity();
      _m.compose(n.pos, _q, _s.set(rad, rad, rad));
      spheres.setMatrixAt(i, _m);
      sc[i * 3] = n.color.r; sc[i * 3 + 1] = n.color.g; sc[i * 3 + 2] = n.color.b;
      sp[i * 4] = (n.P.external ? 0.7 : 1.05) * dimK; sp[i * 4 + 1] = n.hl; sp[i * 4 + 2] = n.P.external ? Math.max(0.6, n.dim * 0.85) : n.dim * 0.85; sp[i * 4 + 3] = n.seed;
      drawnS[i] = n; i++;
    }
    // 고리: 고른 노드, 그리고 이름난 인물
    const ringed = n.key === state.selected || (n.kind === 'person' && n.notable);
    if (ringed) {
      const sel = n.key === state.selected;
      const R = rad * (sel ? 1.9 : 1.55);
      _q.setFromEuler(new T.Euler(Math.PI / 2 + Math.sin(clock * 0.6 + n.seed * 9) * 0.35, clock * (sel ? 0.9 : -0.5), 0));
      _m.compose(n.pos, _q, _s.set(R, R, R));
      rings.setMatrixAt(r, _m);
      _c.set(sel ? '#ffffff' : '#7dffd8');
      rc[r * 3] = _c.r; rc[r * 3 + 1] = _c.g; rc[r * 3 + 2] = _c.b;
      rp[r * 4] = Math.min(1, n.scale) * (sel ? 1 : 0.6 * dimK);
      r++;
    }
  }
  spheres.count = i; crystals.count = c; rings.count = r;
  // 레이캐스트는 경계구로 먼저 거른다. 구슬이 움직이므로 매번 다시 잰다.
  spheres.boundingSphere = null; crystals.boundingSphere = null;
  for (const m of [spheres, crystals, rings]) {
    m.instanceMatrix.needsUpdate = true;
    m.geometry.attributes.aColor.needsUpdate = true;
    m.geometry.attributes.aParams.needsUpdate = true;
  }

  // 선
  const E = edges.geometry.attributes;
  const ca = E.aColA.array, cb = E.aColB.array, sg = E.aSeg.array, ep = E.aParams.array;
  let e = 0;
  const P0 = new T.Vector3(), P1 = new T.Vector3(), P2 = new T.Vector3(), P3 = new T.Vector3(), A = new T.Vector3(), B = new T.Vector3();
  const bez = (t, out) => {
    const u = 1 - t;
    return out.set(0, 0, 0).addScaledVector(P0, u * u * u).addScaledVector(P1, 3 * u * u * t).addScaledVector(P2, 3 * u * t * t).addScaledVector(P3, t * t * t);
  };
  const put = (segs, w, cA, cB, inten, speed, z, vis) => {
    for (let k = 0; k < segs; k++) {
      if (e >= MAX_EDGE_INST) return;
      const t0 = k / segs, t1 = (k + 1) / segs;
      bez(t0, A); bez(t1, B);
      _v.subVectors(B, A);
      const len = _v.length();
      if (len < 1e-4) continue;
      _q.setFromUnitVectors(_up, _v.divideScalar(len));
      _m.compose(A.add(B).multiplyScalar(0.5), _q, _s.set(w, len * 1.02, w));
      edges.setMatrixAt(e, _m);
      ca[e * 3] = cA.r; ca[e * 3 + 1] = cA.g; ca[e * 3 + 2] = cA.b;
      cb[e * 3] = cB.r; cb[e * 3 + 1] = cB.g; cb[e * 3 + 2] = cB.b;
      sg[e * 2] = t0; sg[e * 2 + 1] = t1;
      ep[e * 4] = inten; ep[e * 4 + 1] = speed; ep[e * 4 + 2] = z; ep[e * 4 + 3] = vis;
      e++;
    }
  };
  const cA = new T.Color(), cB = new T.Color();
  for (const L of linkList) {
    const a = L.a, b = L.b;
    const vis0 = Math.min(a.scale, b.scale);
    if (vis0 < 0.02) continue;
    const focus = linkInFocus(L);
    const hot = (state.focus && focus) || L === state.hoverLink;
    const vis = vis0 * (focus ? 1 : 0.06);
    if (L.kind === 'role') {
      // 사건 → 인물: 짧은 곡선(사건 색에서 인물 색으로)
      linkCurve(L, P0, P1, P2, P3);
      cA.copy(a.color); cB.copy(b.color);
      put(8, (hot ? 0.07 : 0.045) * vis0, cA, cB, hot ? 0.9 : 0.55, 0.25, hot ? 0.8 : 0.15, vis);
    } else if (L.kind === 'kin') {
      // 가계 줄기: 집안 색의 가는 금실. 빛이 조상에서 자손 쪽으로 흐른다.
      linkCurve(L, P0, P1, P2, P3);
      cA.set(state.families.get(L.ds).color); cB.copy(cA);
      put(SEG, (hot ? 0.06 : 0.035) * vis0, cA, cB, hot ? 0.9 : 0.5, 0.45, hot ? 0.9 : 0.35, vis * 0.85);
    } else {
      // 사건 → 사건: 바깥으로 휘는 아치. 빛 마디가 원인에서 결과 쪽으로 흐른다.
      linkCurve(L, P0, P1, P2, P3);
      cA.set(REL_COLORS[L.rel.type] || '#ffffff');
      cB.copy(cA).lerp(b.color, 0.35);
      const w = (hot ? 0.16 : 0.1) * vis0;
      put(SEG, w * 2.6, cA, cB, 0.45, 0.6, 0.25, vis * 0.35); // 바깥 빛
      put(SEG, w, cA, cB, hot ? 1.3 : 0.9, 0.7, 1, vis);       // 심
    }
  }
  // 기간이 있는 사건: 시작에서 끝까지 빛기둥
  for (const n of order) {
    if (n.kind !== 'event' || n.yEnd == null || n.scale < 0.05) continue;
    P0.set(n.pos.x, n.pos.y, n.pos.z); P3.set(n.pos.x, n.pos.y + (n.yEnd - n.y), n.pos.z);
    P1.lerpVectors(P0, P3, 0.33); P2.lerpVectors(P0, P3, 0.66);
    const focus = inFocus(n);
    put(10, 0.32 * n.scale, n.color, n.color, 0.5, 0.35, 0.4, n.scale * (focus ? 0.55 : 0.08));
  }
  edges.count = e;
  edges.instanceMatrix.needsUpdate = true;
  for (const k of ['aColA', 'aColB', 'aSeg', 'aParams']) E[k].needsUpdate = true;

  // 연대 고리: 50년마다
  let maxR = 12;
  for (const n of order) if (n.alive) maxR = Math.max(maxR, Math.hypot(n.pos.x, n.pos.z) + 3);
  timeState.R += (maxR - timeState.R) * 0.05;
  const ticks = timeTicks();
  const N = 120;
  const arr = new Float32Array(ticks.length * N * 6);
  let o = 0;
  for (const t of ticks) {
    const y = yearToY(t);
    for (let k = 0; k < N; k += 2) {
      const t0 = (k / N) * Math.PI * 2, t1 = ((k + 1) / N) * Math.PI * 2;
      arr[o++] = Math.cos(t0) * timeState.R; arr[o++] = y; arr[o++] = Math.sin(t0) * timeState.R;
      arr[o++] = Math.cos(t1) * timeState.R; arr[o++] = y; arr[o++] = Math.sin(t1) * timeState.R;
    }
  }
  timeLines.geometry.setAttribute('position', new T.BufferAttribute(arr.subarray(0, o), 3));
}
const timeState = { R: 20 };
function timeTicks() {
  const out = [];
  for (let y = Math.ceil(yearMin / 50) * 50; y <= yearMax; y += 50) out.push(y);
  return out;
}

// ── 카메라 ──────────────────────────────────────────────
const ctl = { target: new T.Vector3(), goal: null, theta: 0.6, phi: 1.2, radius: 160, radiusGoal: 160, vTheta: 0, vPhi: 0, idle: 0 };
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
  if (state.autoRotate && ctl.idle > 2.5) ctl.theta += dt * 0.05 * Math.min(1, (ctl.idle - 2.5) / 2);
  ctl.phi = Math.min(Math.PI - 0.2, Math.max(0.2, ctl.phi));
  ctl.radiusGoal = Math.min(900, Math.max(6, ctl.radiusGoal));
  const s = Math.sin(ctl.phi);
  camera.position.set(ctl.target.x + ctl.radius * s * Math.sin(ctl.theta), ctl.target.y + ctl.radius * Math.cos(ctl.phi), ctl.target.z + ctl.radius * s * Math.cos(ctl.theta));
  camera.lookAt(ctl.target);
}
function fit(keys) {
  const box = new T.Box3();
  let any = false;
  for (const n of nodes.values()) {
    if (!n.alive || (keys && !keys.has(n.key))) continue;
    box.expandByPoint(new T.Vector3(n.pos.x, n.y, n.pos.z));
    if (n.yEnd != null) box.expandByPoint(new T.Vector3(n.pos.x, n.yEnd, n.pos.z));
    any = true;
  }
  if (!any) return;
  const size = box.getSize(new T.Vector3());
  ctl.goal = box.getCenter(new T.Vector3());
  const tanV = Math.tan((camera.fov * Math.PI) / 360);
  const w = Math.max(size.x, size.z) + 10, h = size.y * Math.sin(ctl.phi) + 12;
  const dist = Math.max(h / 2 / tanV, w / 2 / (tanV * camera.aspect));
  ctl.radiusGoal = Math.max(24, dist + w * 0.3);
}
function flyTo(n, closer) {
  if (!n) return;
  ctl.goal = n.pos.clone();
  if (closer) ctl.radiusGoal = Math.min(ctl.radiusGoal, 60);
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
    if (!pointers.has(e.pointerId)) { hoverQueued = { x: e.clientX, y: e.clientY }; return; }
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
  canvas.addEventListener('pointerleave', () => { if (!pointers.size) { state.hovered = null; hideTip(); canvas.classList.remove('pointing'); } });
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
    else if (e.key === 'Escape') select(null);
    else return;
    e.preventDefault(); ctl.idle = 0;
  });
  $('zoomIn').addEventListener('click', () => { ctl.radiusGoal *= 0.72; ctl.idle = 0; });
  $('zoomOut').addEventListener('click', () => { ctl.radiusGoal *= 1.38; ctl.idle = 0; });
  $('zoomFit').addEventListener('click', () => { fit(state.focus); ctl.idle = 0; });
}

// ── 고르기 ──────────────────────────────────────────────
const ray = new T.Raycaster();
const ndc = new T.Vector2();
// opts.near: 정확히 맞지 않았을 때 가까운 구슬까지 고를지. 반환: 노드(또는 null). pick.dist에 화면 거리(정확히 맞으면 0).
function pick(x, y, opts = { near: true }) {
  const rect = canvas.getBoundingClientRect();
  ndc.set(((x - rect.left) / rect.width) * 2 - 1, -((y - rect.top) / rect.height) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  const hc = ray.intersectObject(crystals, false)[0];
  const hs = ray.intersectObject(spheres, false)[0];
  const c = hc && drawnC[hc.instanceId], s = hs && drawnS[hs.instanceId];
  pick.dist = 0;
  if (c && s) return hc.distance < hs.distance ? c : s;
  if (c || s) return c || s;
  if (!opts.near) return null;
  // 정확히 맞지 않으면 화면에서 가까운 구슬(휴대폰은 손가락 크기만큼 넉넉히)
  const px = x - rect.left, py = y - rect.top;
  const tol = isNarrow() ? 22 : 9;
  let best = null, bestD = Infinity;
  const right = _pr.setFromMatrixColumn(camera.matrix, 0);
  for (const n of order) {
    if (!n.alive || n.scale < 0.3 || (state.focus && n.dim > 0.5)) continue;
    _pa.copy(n.pos).project(camera);
    if (_pa.z > 1 || _pa.z < -1) continue;
    const sx = (_pa.x * 0.5 + 0.5) * rect.width, sy = (-_pa.y * 0.5 + 0.5) * rect.height;
    _pb.copy(n.pos).addScaledVector(right, n.radius * n.scale).project(camera);
    const rpx = Math.abs((_pb.x - _pa.x) * 0.5 * rect.width);
    const d = Math.hypot(px - sx, py - sy);
    if (d < rpx + tol && d - rpx < bestD) { bestD = d - rpx; best = n; }
  }
  pick.dist = bestD;
  return best;
}
const _pa = new T.Vector3(), _pb = new T.Vector3(), _pr = new T.Vector3();
const _l0 = new T.Vector3(), _l1 = new T.Vector3(), _l2 = new T.Vector3(), _l3 = new T.Vector3(), _lq = new T.Vector3();
function segDist(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1;
  const L2 = dx * dx + dy * dy;
  let t = L2 ? ((px - x1) * dx + (py - y1) * dy) / L2 : 0;
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  return Math.hypot(px - (x1 + dx * t), py - (y1 + dy * t));
}
// 선 고르기: 그릴 때와 같은 곡선을 화면에 투영해 선분까지의 거리를 잰다.
function pickLink(x, y) {
  const rect = canvas.getBoundingClientRect();
  const px = x - rect.left, py = y - rect.top;
  let best = null, bestD = isNarrow() ? 20 : 9;
  for (const L of linkList) {
    if (!L.a.alive || !L.b.alive || Math.min(L.a.scale, L.b.scale) < 0.4) continue;
    if (state.focus && !linkInFocus(L)) continue;
    linkCurve(L, _l0, _l1, _l2, _l3);
    let pX = 0, pY = 0, pOK = false;
    const N = 16;
    for (let i = 0; i <= N; i++) {
      const t = i / N, u = 1 - t;
      _lq.set(0, 0, 0).addScaledVector(_l0, u * u * u).addScaledVector(_l1, 3 * u * u * t)
        .addScaledVector(_l2, 3 * u * t * t).addScaledVector(_l3, t * t * t).project(camera);
      const ok = _lq.z <= 1 && _lq.z >= -1;
      const sx = (_lq.x * 0.5 + 0.5) * rect.width, sy = (-_lq.y * 0.5 + 0.5) * rect.height;
      if (ok && pOK) { const d = segDist(px, py, pX, pY, sx, sy); if (d < bestD) { bestD = d; best = L; } }
      pX = sx; pY = sy; pOK = ok;
    }
  }
  pickLink.dist = bestD;
  return best;
}
let hoverQueued = null;
function processHover() {
  if (!hoverQueued) return;
  const { x, y } = hoverQueued;
  hoverQueued = null;
  let n = pick(x, y);
  const nd = n ? pick.dist : Infinity;
  const L = nd > 0 ? pickLink(x, y) : null;
  if (L && pickLink.dist < nd) n = null;
  const key = n && n.alive ? n.key : null;
  state.hovered = key;
  state.hoverLink = key ? null : L;
  canvas.classList.toggle('pointing', !!key || !!state.hoverLink);
  if (key) showTip(n, x, y);
  else if (state.hoverLink) showLinkTip(state.hoverLink, x, y);
  else hideTip();
}
function clickAt(x, y) {
  // 구슬 위를 정확히 누르면 구슬. 아니면 가까운 구슬과 가까운 선 가운데 더 가까운 쪽.
  let n = pick(x, y);
  const nd = n ? pick.dist : Infinity;
  const L = nd > 0 ? pickLink(x, y) : null;
  if (L && pickLink.dist < nd) n = null;
  if (!n || !n.alive) {
    if (L) { haptic(8); selectLink(L === state.selLink ? null : L); return; }
    select(null);
    return;
  }
  haptic(10);
  select(n.key === state.selected ? null : n.key);
}
// 선을 고르면 그 관계(사건–사건의 인과, 또는 인물의 역할)만 남기고 상세 패널에 보여 준다.
function selectLink(L) {
  state.selected = null;
  state.selLink = L;
  computeFocus();
  updateLabelsContent();
  renderInfo();
  if (L) { ctl.goal = new T.Vector3().lerpVectors(L.a.pos, L.b.pos, 0.5); }
}
function select(key) {
  state.selLink = null;
  state.selected = key;
  computeFocus();
  updateLabelsContent();
  renderInfo();
  const n = key && nodes.get(key);
  if (n) flyTo(n, false);
}

// ── 툴팁 ────────────────────────────────────────────────
const tip = $('tip');
function showTip(n, x, y) {
  tip.style.setProperty('--c', '#' + n.color.getHexString(T.SRGBColorSpace));
  if (n.kind === 'event') {
    const ev = n.ev;
    tip.innerHTML = `<b>${esc(ev.name)}${ev.hanja ? ` <small>${esc(ev.hanja)}</small>` : ''}</b>` +
      `<span class="t">${esc(ev.type)}</span> ${esc(evYears(ev))}` +
      `<div>인물 ${ev.parts.length}명${ev.rels.length ? ` · 이어진 사건 ${ev.rels.length}` : ''}</div><div class="k">누르면 이어진 관계만 보기</div>`;
  } else {
    const P = n.P;
    tip.innerHTML = `<b>${esc(P.name)}${P.hanja ? ` <small>${esc(P.hanja)}</small>` : ''}</b>` +
      `<span class="t">${esc(P.external ? '가계도 밖 인물' : P.refs.map((r) => state.families.get(r.ds).short).join(' · '))}</span>` +
      `${P.raw ? ` ${esc(years(P.raw))}` : ''}<div>사건 ${P.roles.length}개</div><div class="k">누르면 이 사람의 사건만 보기</div>`;
  }
  tip.hidden = false;
  const W = window.innerWidth, H = window.innerHeight;
  const tw = tip.offsetWidth, th = tip.offsetHeight;
  tip.style.left = `${Math.min(W - tw - 10, x + 16)}px`;
  tip.style.top = `${Math.min(H - th - 10, Math.max(10, y + 16))}px`;
}
function linkText(L) {
  if (L.kind === 'kin') return { title: `${L.a.P.name} → ${L.b.P.name}`, kind: '가계 줄기', note: `${L.b.P.name}은(는) ${L.a.P.name}의 ${L.term}` };
  if (L.kind === 'rel') return { title: `${L.a.ev.name} → ${L.b.ev.name}`, kind: L.rel.type, note: L.rel.note || '' };
  return { title: `${L.b.P.name} · ${L.a.ev.name}`, kind: '역할', note: L.role || '' };
}
function showLinkTip(L, x, y) {
  const t = linkText(L);
  tip.style.setProperty('--c', L.kind === 'rel' ? (REL_COLORS[L.rel.type] || '#fff') : L.kind === 'kin' ? state.families.get(L.ds).color : '#' + L.b.color.getHexString(T.SRGBColorSpace));
  tip.innerHTML = `<b>${esc(t.title)}</b><span class="t">${esc(t.kind)}</span> ${esc(t.note)}<div class="k">누르면 이 관계 보기</div>`;
  tip.hidden = false;
  const W = window.innerWidth, H = window.innerHeight;
  tip.style.left = `${Math.min(W - tip.offsetWidth - 10, x + 16)}px`;
  tip.style.top = `${Math.min(H - tip.offsetHeight - 10, Math.max(10, y + 16))}px`;
}
function hideTip() { tip.hidden = true; }

// ── 이름표 ──────────────────────────────────────────────
const labelBox = $('labels');
const labels = new Map();
const timeLabels = new Map();
function labelFor(n) {
  let el = labels.get(n.key);
  if (!el) { el = document.createElement('div'); el.className = 'lbl'; labelBox.append(el); labels.set(n.key, el); el.style.opacity = '0'; }
  return el;
}
function removeLabel(n) { const el = labels.get(n.key); if (el) { el.remove(); labels.delete(n.key); } }
function updateLabelsContent() {
  for (const n of nodes.values()) {
    const el = labelFor(n);
    const c = '#' + n.color.getHexString(T.SRGBColorSpace);
    let key, html;
    if (n.kind === 'event') {
      const ev = n.ev;
      key = `e|${ev.id}`;
      html = `<b>${esc(ev.name)}</b><span>${esc(evYears(ev))} · ${esc(ev.type)}</span>`;
      el.classList.add('ev');
    } else {
      const P = n.P;
      key = `p|${P.key}`;
      key = `p|${P.key}|${famLabel(P)}`;
      html = `<b>${esc(P.name)}${P.hanja ? `<small>${esc(P.hanja)}</small>` : ''}</b><span>${esc(P.external ? '가계도 밖' : famLabel(P))}</span>`;
      el.classList.toggle('ext', P.external);
    }
    if (el.dataset.key !== key) { el.dataset.key = key; el.innerHTML = html; el.style.setProperty('--c', c); el._w = 0; }
  }
}
const _p = new T.Vector3();
function updateLabels() {
  const W = canvas.clientWidth, H = canvas.clientHeight;
  const camPos = camera.position;
  const placed = [];
  const items = [];
  for (const n of order) {
    const el = labels.get(n.key);
    if (!el) continue;
    if (!n.alive || n.scale < 0.4) { el.style.opacity = '0'; continue; }
    const dist = camPos.distanceTo(n.pos);
    const foc = state.focus && state.focus.has(n.key);
    let pri = n.key === state.hovered ? 200 : n.key === state.selected ? 160 : foc ? 90 : 0;
    if (!pri) pri = n.kind === 'event' ? 40 + Math.min(30, n.ev.parts.length * 2) : (n.notable ? 25 : 5) + n.P.roles.length * 3;
    if (state.focus && !foc) pri -= 120; // 고른 관계 밖의 이름표는 감춘다
    items.push({ n, el, dist, pri, foc });
  }
  items.sort((a, b) => (b.pri - a.pri) || (a.dist - b.dist));
  for (const it of items) {
    const { n, el, dist, pri, foc } = it;
    _p.copy(n.pos); _p.y += n.radius * n.scale + 0.4;
    _p.project(camera);
    const behind = _p.z > 1 || _p.z < -1;
    const x = (_p.x * 0.5 + 0.5) * W, y = (-_p.y * 0.5 + 0.5) * H;
    const near = dist < (n.kind === 'event' ? 260 : 120);
    let show = !behind && x > -80 && x < W + 80 && y > -40 && y < H + 40 && (pri >= 60 || near) && pri > -20;
    const small = !foc && dist > 110 && n.key !== state.hovered && n.key !== state.selected;
    if (show && (!el._w || el._small !== small)) {
      el.classList.toggle('small', small);
      el._small = small; el._w = el.offsetWidth; el._h = el.offsetHeight;
    }
    const w = (el._w || 90) + 6, h = (el._h || 34) + 4;
    const rect = { l: x - w / 2, r: x + w / 2, t: y - h, b: y };
    if (show && pri < 160) {
      for (const q of placed) if (rect.l < q.r && rect.r > q.l && rect.t < q.b && rect.b > q.t) { show = false; break; }
    }
    if (!show) { if (el.style.opacity !== '0') el.style.opacity = '0'; continue; }
    placed.push(rect);
    const fade = pri >= 90 ? 1 : Math.max(0.35, Math.min(1, 1.3 - dist / 320));
    el.style.opacity = String(fade);
    el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -100%)`;
    el.style.zIndex = String(Math.round(pri + 100));
    el.classList.toggle('small', small);
    el.classList.toggle('sel', n.key === state.selected);
    el.classList.toggle('hov', n.key === state.hovered);
  }
  // 연도 표시: 고리의 카메라 오른쪽 끝
  const right = new T.Vector3().setFromMatrixColumn(camera.matrix, 0).setY(0).normalize();
  const seen = new Set();
  for (const t of timeTicks()) {
    seen.add(t);
    let el = timeLabels.get(t);
    if (!el) { el = document.createElement('div'); el.className = 'gen'; el.textContent = `${t}년`; labelBox.append(el); timeLabels.set(t, el); }
    _p.copy(right).multiplyScalar(timeState.R + 1.5); _p.y = yearToY(t);
    _p.project(camera);
    if (_p.z > 1) { el.style.opacity = '0'; continue; }
    el.style.opacity = '1';
    el.style.transform = `translate3d(${((_p.x * 0.5 + 0.5) * W).toFixed(1)}px, ${((-_p.y * 0.5 + 0.5) * H).toFixed(1)}px, 0) translate(4px, -50%)`;
  }
  for (const [t, el] of timeLabels) if (!seen.has(t)) { el.remove(); timeLabels.delete(t); }
}

// ── 상세 패널 ────────────────────────────────────────────
function famDot(dsOrNull) {
  const c = dsOrNull ? state.families.get(dsOrNull).color : EXTERNAL_COLOR;
  return `<i class="fdot" style="--c:${c}"></i>`;
}
function relPhrase(rel, ev) {
  // ev 쪽에서 본 관계 문장
  const out = rel.a === ev;
  const other = out ? rel.b : rel.a;
  const arrow = out ? '→' : '←';
  return { other, text: `${arrow} ${rel.type}`, note: rel.note };
}
function renderLinkInfo(box, L) {
  const ev = L.a.ev;
  let html = '<button type="button" class="close" aria-label="닫기"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10.25"/><path d="M8.6 8.6l6.8 6.8M15.4 8.6l-6.8 6.8"/></svg></button>';
  if (L.kind === 'kin') {
    const fam = state.families.get(L.ds);
    box.style.setProperty('--c', fam.color);
    const pa = L.a.P.raw, pb = L.b.P.raw;
    html += `<p class="kicker">LINEAGE · 가계 줄기</p>
      <h2>${esc(L.term)}</h2>
      <p class="note">${esc(fam.short)} 가계도에서 ${esc(L.b.P.name)}은(는) ${esc(L.a.P.name)}의 ${esc(L.term)}입니다${L.bridge ? '. 직계로는 이어지지 않아 가장 가까운 친척 관계로 이었습니다.' : `(${L.gen}대 아래). 사이의 세대는 화면에 사건이 없어 생략했습니다.`}</p>
      <ul class="plist link-ends">
        <li><button type="button" data-go="${esc(L.a.key)}">${famDot(L.ds)}${esc(L.a.P.name)}${L.a.P.hanja ? `<small>${esc(L.a.P.hanja)}</small>` : ''}</button><span>${esc(pa ? years(pa) : '')}</span></li>
        <li class="arrow" aria-hidden="true">↓ ${L.bridge ? esc(L.term) : `${L.gen}대`}</li>
        <li><button type="button" data-go="${esc(L.b.key)}">${famDot(L.ds)}${esc(L.b.P.name)}${L.b.P.hanja ? `<small>${esc(L.b.P.hanja)}</small>` : ''}</button><span>${esc(pb ? years(pb) : '')}</span></li>
      </ul>
      <div class="acts"><a class="glass-btn" href="index.html#${esc(L.ds)}" data-ego="${esc(L.ds)}|${esc(L.b.P.refs.find((r) => r.ds === L.ds).id)}">${esc(fam.short)} 버블 가계도에서</a></div>`;
    return html;
  }
  if (L.kind === 'rel') {
    const c = REL_COLORS[L.rel.type] || '#fff';
    box.style.setProperty('--c', c);
    html += `<p class="kicker">RELATION · 사건과 사건</p>
      <h2>${esc(L.rel.type)}</h2>
      ${L.rel.note ? `<p class="note">${esc(L.rel.note)}</p>` : ''}
      <ul class="plist link-ends">
        <li><button type="button" data-go="${esc(L.a.key)}"><i class="rdot" style="--c:${TYPE_COLORS[L.a.ev.type]}"></i>${esc(L.a.ev.name)}<small>${esc(evYears(L.a.ev))}</small></button><span>앞(원인 쪽)</span></li>
        <li class="arrow" aria-hidden="true">↓ ${esc(L.rel.type)}</li>
        <li><button type="button" data-go="${esc(L.b.key)}"><i class="rdot" style="--c:${TYPE_COLORS[L.b.ev.type]}"></i>${esc(L.b.ev.name)}<small>${esc(evYears(L.b.ev))}</small></button><span>뒤(결과 쪽)</span></li>
      </ul>`;
  } else {
    const P = L.b.P;
    box.style.setProperty('--c', '#' + L.b.color.getHexString(T.SRGBColorSpace));
    html += `<p class="kicker">ROLE · 인물과 사건</p>
      <h2>${esc(L.role || '참여')}</h2>
      <ul class="plist link-ends">
        <li><button type="button" data-go="${esc(L.b.key)}">${famDot(famOf(P))}${esc(P.name)}${P.hanja ? `<small>${esc(P.hanja)}</small>` : ''}</button><span>${esc(famLabel(P))}</span></li>
        <li class="arrow" aria-hidden="true">↓</li>
        <li><button type="button" data-go="${esc(L.a.key)}"><i class="rdot" style="--c:${TYPE_COLORS[ev.type]}"></i>${esc(ev.name)}<small>${esc(evYears(ev))}</small></button><span>${esc(ev.type)}</span></li>
      </ul>
      ${ev.summary ? `<p class="note">${esc(ev.summary)}</p>` : ''}`;
  }
  return html;
}
// 자손 쪽에서 본 조상 호칭(예: 5대조부)
function M_up(L) {
  const M = state.models.get(L.ds);
  const ra = L.a.P.refs.find((r) => r.ds === L.ds), rb = L.b.P.refs.find((r) => r.ds === L.ds);
  return M && M.kin && ra && rb ? M.kin.relation(rb.id, ra.id).term : '조상';
}
function renderInfo() {
  const box = $('info');
  if (state.selLink) {
    if (box.hidden) box._openedAt = performance.now();
    box.innerHTML = renderLinkInfo(box, state.selLink);
    box.hidden = false;
    wireInfo(box);
    return;
  }
  const n = state.selected && nodes.get(state.selected);
  if (!n || !n.alive) { box.hidden = true; return; }
  const c = '#' + n.color.getHexString(T.SRGBColorSpace);
  box.style.setProperty('--c', c);
  let html = '<button type="button" class="close" aria-label="닫기"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10.25"/><path d="M8.6 8.6l6.8 6.8M15.4 8.6l-6.8 6.8"/></svg></button>';
  if (n.kind === 'event') {
    const ev = n.ev;
    const byFam = new Map();
    for (const pt of ev.parts) {
      const k = pt.P.external ? '' : pt.P.refs.map((r) => r.ds).join('+');
      if (!byFam.has(k)) byFam.set(k, []);
      byFam.get(k).push(pt);
    }
    const famRows = [...byFam.entries()].sort((a, b) => (a[0] === '') - (b[0] === '')).map(([k, pts]) => `
      <div class="grp"><p class="grp-h">${k ? k.split('+').map((d) => famDot(d)).join('') : famDot(null)}${esc(k ? k.split('+').map((d) => state.families.get(d).short).join(' · ') + ' 가계' : '가계도 밖 인물')}</p>
      <ul class="plist">${pts.map((pt) => `<li><button type="button" data-go="p:${esc(pt.P.key)}">${esc(pt.P.name)}${pt.P.hanja ? `<small>${esc(pt.P.hanja)}</small>` : ''}</button><span>${esc(pt.role || '')}</span></li>`).join('')}</ul></div>`).join('');
    const rels = ev.rels.map((r) => relPhrase(r, ev)).sort((a, b) => a.other.start - b.other.start);
    html += `
      <p class="kicker">EVENT · ${esc(ev.type)}</p>
      <h2>${esc(ev.name)}${ev.hanja ? `<small>${esc(ev.hanja)}</small>` : ''}</h2>
      <div class="rel"><b>${esc(evYears(ev))}</b><span>인물 ${ev.parts.length}명</span></div>
      ${ev.summary ? `<p class="note">${esc(ev.summary)}</p>` : ''}
      ${famRows}
      ${rels.length ? `<div class="grp"><p class="grp-h">이어진 사건</p><ul class="plist rels">${rels.map((r) => `<li><button type="button" data-go="e:${esc(r.other.id)}"><i class="rdot" style="--c:${REL_COLORS[r.text.slice(2)] || '#fff'}"></i>${esc(r.other.name)}<small>${esc(evYears(r.other))}</small></button><span title="${esc(r.note || '')}">${esc(r.text)}</span></li>`).join('')}</ul></div>` : ''}
      ${(ev.sources || []).length ? `<p class="srcs">출처: ${ev.sources.map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a>`).join(', ')}</p>` : ''}`;
  } else {
    const P = n.P;
    const evs = P.roles;
    html += `
      <p class="kicker">${P.external ? 'PERSON · 가계도 밖' : 'PERSON · ' + esc(P.refs.map((r) => state.families.get(r.ds).short + ' 가계').join(' · '))}</p>
      <h2>${esc(P.name)}${P.hanja ? `<small>${esc(P.hanja)}</small>` : ''}</h2>
      <div class="rel"><b>${esc(P.raw ? years(P.raw) : '')}</b><span>사건 ${evs.length}개</span></div>
      ${P.raw && P.raw.title ? `<p class="note">${esc(P.raw.title)}</p>` : ''}
      <div class="grp"><p class="grp-h">얽힌 사건 (시간순)</p>
      <ul class="plist">${evs.map((r) => `<li><button type="button" data-go="e:${esc(r.ev.id)}"><i class="rdot" style="--c:${TYPE_COLORS[r.ev.type]}"></i>${esc(r.ev.name)}<small>${esc(evYears(r.ev))}</small></button><span>${esc(r.role || '')}</span></li>`).join('')}</ul></div>
      ${(() => {
        const kin = linkList.filter((L) => L.kind === 'kin' && L.a.alive && L.b.alive && (L.a === n || L.b === n));
        if (!kin.length) return '';
        return `<div class="grp"><p class="grp-h">가계 줄기 (화면에 보이는 조상·자손)</p><ul class="plist">${kin.map((L) => {
          const o = L.a === n ? L.b : L.a;
          const t = L.a === n ? L.term : M_up(L);
          return `<li><button type="button" data-go="${esc(o.key)}">${famDot(L.ds)}${esc(o.P.name)}${o.P.hanja ? `<small>${esc(o.P.hanja)}</small>` : ''}</button><span>${esc(t)}</span></li>`;
        }).join('')}</ul></div>`;
      })()}
      ${P.refs.length ? `<div class="acts">${P.refs.map((r) => `<a class="glass-btn" href="index.html#${esc(r.ds)}" data-ego="${esc(r.ds)}|${esc(r.id)}">${esc(state.families.get(r.ds).short)} 버블 가계도에서</a>`).join('')}</div>` : ''}`;
  }
  if (box.hidden) box._openedAt = performance.now();
  box.innerHTML = html;
  box.hidden = false;
  wireInfo(box);
}
function wireInfo(box) {
  box.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', (ev) => {
    ev.stopPropagation();
    const key = b.dataset.go;
    if (!nodes.get(key)?.alive) return;
    haptic(8);
    select(key);
    flyTo(nodes.get(key), true);
  }));
  box.querySelectorAll('[data-ego]').forEach((a) => a.addEventListener('click', () => {
    const [ds, id] = a.dataset.ego.split('|');
    G.nav?.saveEgo(ds, id);
  }));
}
function setupInfoCard() {
  const box = $('info');
  box.addEventListener('click', (ev) => {
    if (performance.now() - (box._openedAt || 0) < 450) return;
    if (ev.target.closest('.close')) { haptic(8); select(null); }
    // 휴대폰: 단추가 아닌 곳을 누르면 카드를 닫는다(버블 가계도와 같이)
    else if (isNarrow() && !ev.target.closest('button, a')) { haptic(8); select(null); }
  });
}

// 화면에 보이는 그래프가 몇 덩어리인지(시험용)
function components() {
  const alive = [...nodes.values()].filter((n) => n.alive);
  const parent = new Map(alive.map((n) => [n, n]));
  const find = (x) => { while (parent.get(x) !== x) { parent.set(x, parent.get(parent.get(x))); x = parent.get(x); } return x; };
  for (const L of linkList) if (L.a.alive && L.b.alive) parent.set(find(L.a), find(L.b));
  const groups = new Map();
  for (const n of alive) { const r = find(n); if (!groups.has(r)) groups.set(r, []); groups.get(r).push(n.ev ? n.ev.name : n.P.name); }
  return [...groups.values()].sort((a, b) => b.length - a.length);
}

// ── 범례·필터 ────────────────────────────────────────────
function buildLegend() {
  const used = new Set(state.events.map((e) => e.type));
  const usedRel = new Set(state.events.flatMap((e) => e.rels.map((r) => r.type)));
  $('legend').innerHTML =
    TYPES.filter((t) => used.has(t)).map((t) => `<li data-type="${esc(t)}"><i class="cdot" style="--c:${TYPE_COLORS[t]}"></i>${esc(t)}<em></em></li>`).join('') +
    '<li class="sep"></li>' +
    REL_TYPES.filter((t) => usedRel.has(t)).map((t) => `<li><i class="rline" style="--c:${REL_COLORS[t]}"></i>${esc(t)}</li>`).join('') +
    '<li><i class="rline kin"></i>가계 줄기(조상→자손)</li>' +
    '<li class="sep"></li><li><i class="dot unknown"></i>가계도 밖 인물</li><li><i class="ring-sample"></i>이름난 인물</li><li><i class="pillar-sample"></i>기간(시작→끝)</li>';
}
function updateLegendCounts() {
  const count = new Map();
  for (const n of nodes.values()) if (n.alive && n.kind === 'event') count.set(n.ev.type, (count.get(n.ev.type) || 0) + 1);
  document.querySelectorAll('#legend li[data-type]').forEach((li) => { li.querySelector('em').textContent = count.get(li.dataset.type) || ''; });
}
function buildFilters() {
  const chips = $('famChips');
  chips.innerHTML = '';
  const all = document.createElement('button');
  all.type = 'button'; all.className = 'glass-btn'; all.textContent = '전체';
  all.addEventListener('click', () => { for (const f of state.families.keys()) state.famOn.add(f); syncFamChips(); rebuild(); setTimeout(() => fit(), 900); });
  chips.append(all);
  for (const f of state.families.values()) {
    const label = document.createElement('label');
    label.className = 'chip fam';
    label.style.setProperty('--c', f.color);
    label.innerHTML = `<input type="checkbox" value="${esc(f.id)}"><span>${esc(f.short)}</span>`;
    label.querySelector('input').addEventListener('change', (e) => {
      if (e.target.checked) state.famOn.add(f.id); else state.famOn.delete(f.id);
      rebuild();
      setTimeout(() => fit(), 900);
    });
    chips.append(label);
  }
  syncFamChips();
  const sel = $('typeFilter');
  const used = new Set(state.events.map((e) => e.type));
  sel.replaceChildren(new Option('전체', ''), ...TYPES.filter((t) => used.has(t)).map((t) => new Option(t, t)));
  sel.addEventListener('change', (e) => { state.type = e.target.value; rebuild(); setTimeout(() => fit(), 900); });
  // 찾기: 사건 이름·인물 이름
  const list = $('findList');
  list.replaceChildren(
    ...state.events.map((e) => new Option(`${e.name} (${evYears(e)})`)),
    ...[...state.people.values()].map((P) => new Option(P.hanja ? `${P.name}(${P.hanja})` : P.name)));
  $('find').addEventListener('change', (e) => {
    const q = e.target.value.trim();
    if (!q) return;
    let key = null;
    const ev = state.events.find((x) => `${x.name} (${evYears(x)})` === q) || state.events.find((x) => x.name.includes(q) || (x.hanja || '').includes(q));
    if (ev) key = `e:${ev.id}`;
    else {
      const P = [...state.people.values()].find((x) => (x.hanja ? `${x.name}(${x.hanja})` : x.name) === q) ||
        [...state.people.values()].find((x) => x.name.includes(q) || (x.hanja || '').includes(q));
      if (P) key = `p:${P.key}`;
    }
    if (!key) return;
    if (!nodes.get(key)?.alive) { // 걸러져 안 보이면 필터를 풀어 보이게 한다
      state.type = ''; $('typeFilter').value = '';
      for (const f of state.families.keys()) state.famOn.add(f);
      state.showExternal = true; $('showExternal').checked = true;
      syncFamChips(); rebuild();
    }
    select(key);
    setTimeout(() => flyTo(nodes.get(key), true), 300);
    e.target.blur();
  });
}
function syncFamChips() {
  document.querySelectorAll('#famChips input').forEach((i) => { i.checked = state.famOn.has(i.value); });
}

// ── 크기·그리기 ──────────────────────────────────────────
function resize() {
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  post.setSize(w, h, renderer.getPixelRatio());
}
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  clock += dt;
  uTime.value = clock;
  processHover();
  simulate(dt);
  updateCamera(dt);
  writeInstances();
  dust.rotation.y += dt * 0.01;
  post.render();
  updateLabels();
  requestAnimationFrame(frame);
}

function main() {
  loadData();
  if (!state.events.length) throw new Error('사건 데이터(data/events.js)를 불러오지 못했습니다');
  if (!initGL()) return;
  // 주소의 #가계도 id가 있으면 그 집안부터 보인다(다른 페이지에서 메뉴로 넘어온 경우). 없으면 모든 집안.
  const fromHash = decodeURIComponent(location.hash.slice(1));
  if (state.families.has(fromHash)) state.famOn.add(fromHash);
  else for (const f of state.families.keys()) state.famOn.add(f);
  buildFilters();
  buildLegend();
  setupInfoCard();
  try { state.autoRotate = localStorage.getItem('genealogy.autoRotate') !== '0' && !reduceMotion; } catch (e) { /* 기본값 */ }
  $('autoRotate').checked = state.autoRotate;
  $('autoRotate').addEventListener('change', (e) => { state.autoRotate = e.target.checked; });
  $('showRelations').addEventListener('change', (e) => { state.showRelations = e.target.checked; rebuild(); });
  $('showKin').addEventListener('change', (e) => { state.showKin = e.target.checked; rebuild(); });
  $('showExternal').addEventListener('change', (e) => { state.showExternal = e.target.checked; rebuild(); });
  $('toggleControls').addEventListener('click', () => {
    const on = !document.body.classList.contains('controls-open');
    document.body.classList.toggle('controls-open', on);
    $('toggleControls').setAttribute('aria-expanded', String(on));
  });
  window.addEventListener('hashchange', () => {
    const id = decodeURIComponent(location.hash.slice(1));
    if (!state.families.has(id)) return;
    state.famOn = new Set([id]); syncFamChips(); rebuild(); setTimeout(() => fit(), 900);
  });
  setupControls();
  window.addEventListener('resize', resize);
  resize();
  rebuild({ instant: true });
  ctl.target.set(0, -Y_SPAN / 2, 0);
  setTimeout(() => fit(), 1600);
  requestAnimationFrame(frame);
  // 테스트·디버그용
  window.__events = { state, nodes, pick, components, select, selectLink, fit, rebuild, linkCurve, links: () => linkList, camera: () => camera };
}

try { main(); } catch (err) {
  console.error(err);
  const fb = $('fallback');
  fb.hidden = false;
  fb.querySelector('p').textContent = `화면을 그리지 못했습니다: ${err.message}`;
}
})();
