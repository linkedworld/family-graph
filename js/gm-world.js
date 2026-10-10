// 광명의 명사(gwangmyeong.html)를 세계사 연관도 엔진(js/world.js, 루이 14세 화면과 같은 시간 축 3D)으로 보이게
// data/gwangmyeong.js · 광명 연고 가계도 · data/events.js를 엔진의 자료 모양(WORLD_DATASETS)으로 바꾼다. DOM 없음 → Node 테스트 가능.
//   · 인물: 가계도 인물 가운데 생몰년이 하나라도 있거나 사건에 얽힌 사람, 명단 인물 전원, 사건의 명단 밖 인물.
//     생몰년을 모르면 사건 연도로 '활동 시기'를 생애선으로 쓰고, 한쪽만 알면 다른 쪽을 어림해 이름표에 ?를 붙인다.
//     가계도에서 생몰년도 사건도 없는 사람은 부모·자녀·배우자의 연도에서 한 세대(27년)씩 어림해 세대의 줄을 잇는다('생몰 미상').
//     그런 사람은 연도를 아는 자손으로 이어질 때만 싣는다(끝자리의 어림 인물은 덜어 낸다).
//   · 부모: 가계도 혼인의 자녀(생가). 같은 사람이 두 가계도에 있으면(예: 인조) 이름+한자로 한 사람으로 모은다.
//   · 사건: 광명 사건 + include로 가져온 사건(참여자는 광명 가계도 인물만, addParticipants를 더함).
(function (G) {
'use strict';

const NOW = 2026;
const APPROX_LIFE = 60;   // 한쪽 생몰년만 알 때 어림하는 수명
const GEN = 27;           // 한 세대의 어림 햇수
// 분류 = 축 둘레의 각도 구역(위 90°가 중심 인물의 직계). 루이 14세 자료처럼 한 구역에 사람이 몰리지 않게 가문을 나눈다.
const GROUPS = [
  { id: 'wonik-line', name: '이원익 직계 (조상·자녀)', color: '#ffcf5c', angle: 90 },
  { id: 'wonik-grand', name: '이원익의 손자 대', color: '#ffe08a', angle: 66 },
  { id: 'wonik-desc', name: '이원익의 증손 이하', color: '#ffc46b', angle: 112 },
  { id: 'wonik-kin', name: '전주 이씨 방계', color: '#ff9f5a', angle: 42 },
  { id: 'gm-past', name: '광명의 옛 명사', color: '#ff7eb6', angle: 18 },
  { id: 'gov', name: '오늘의 명사 · 시장·국회의원', color: '#a9b8ff', angle: -10 },
  { id: 'province', name: '오늘의 명사 · 경기도의원', color: '#5fa8ff', angle: -35 },
  { id: 'council', name: '오늘의 명사 · 광명시의원', color: '#3ee0d0', angle: -60 },
  { id: 'culture', name: '오늘의 명사 · 문화·예술', color: '#6fe6ff', angle: -88 },
  { id: 'sports', name: '오늘의 명사 · 체육', color: '#c9d66b', angle: -112 },
  { id: 'wonik-inlaw', name: '이원익 가계의 외가·처가', color: '#b48cff', angle: 134 },
  { id: 'royal', name: '소현세자 가계 (왕실)', color: '#ff5d5d', angle: 156 },
  { id: 'kang', name: '민회빈 강씨 가계 (금천 강씨)', color: '#ffd1a6', angle: 178 },
  { id: 'kang-inlaw', name: '강씨 가계의 외가·사돈', color: '#7dffb0', angle: 204 },
  { id: 'ext', name: '명단 밖 인물 (임금·관련 인물)', color: '#e8eeff', angle: 228 },
];
const SUBJECT = 'yi-wonik/yi_wonik';
const familyGroup = (ds, p) => ds === 'yi-wonik' ? (p.clan === '전주 이씨' ? 'wonik-kin' : 'wonik-inlaw')
  : ds === 'geumcheon-kang' ? (p.clan === '금천 강씨' ? 'kang' : p.clan === '전주 이씨' ? 'royal' : 'kang-inlaw') : 'ext';
const LIST_GROUP = { '시장': 'gov', '국회의원': 'gov', '도의원': 'province', '시의원': 'council', '체육': 'sports' };
// 사건 종류: js/events.js의 색과 같다. size는 수정 크기(전쟁은 크게).
const EVENT_TYPES = {
  '전쟁': { name: '전쟁', color: '#ff5a4a', size: 1.25 }, '전투': { name: '전투', color: '#ff9446', size: 0.8 },
  '사화·옥사': { name: '사화·옥사', color: '#c77dff' }, '정변': { name: '정변', color: '#ff4f9a' },
  '정책·제도': { name: '정책·제도', color: '#ffd166' }, '학문·저술': { name: '학문·저술', color: '#5ad1ff' },
  '교육·서원': { name: '교육·서원', color: '#6dffc4' }, '종교': { name: '종교', color: '#b8ff6a' },
  '외교': { name: '외교', color: '#8fa8ff' }, '선거': { name: '선거', color: '#4f8dff' },
  '의회·행정': { name: '의회·행정', color: '#e6c24a' }, '문화·체육': { name: '문화·체육', color: '#ff7ad9' },
  '기타': { name: '기타', color: '#c8d2e6' },
};
// 시대 띠: 통상의 한국사 시대 구분에 광명의 행정 연혁(1981년 광명시 승격)을 더했다.
const ERAS = [
  { from: 900, to: 1392, name: '고려', color: '#4a5a7a' },
  { from: 1392, to: 1592, name: '조선 전기', color: '#5f6fa0' },
  { from: 1592, to: 1637, name: '임진왜란·병자호란', color: '#b0563f' },
  { from: 1637, to: 1724, name: '조선 후기: 예송·환국', color: '#8a5aa8' },
  { from: 1724, to: 1800, name: '영조·정조', color: '#5a9a8a' },
  { from: 1800, to: 1876, name: '세도 정치', color: '#4f86b0' },
  { from: 1876, to: 1910, name: '개항기·대한제국', color: '#b0844f' },
  { from: 1910, to: 1945, name: '일제강점기', color: '#a84a5a' },
  { from: 1945, to: 1981, name: '해방 이후 · 시흥군 시절', color: '#5b8fb0' },
  { from: 1981, to: NOW + 4, name: '광명시', color: '#d8a735' },
];

const year = (s) => { const m = String(s ?? '').match(/\d{3,4}/); return m ? +m[0] : null; };

function build(GM, datasets, eventsSrc) {
  const sets = datasets.filter((d) => GM.families.includes(d.meta.id));
  const keyOf = (p) => `${p.name}|${p.hanja || ''}`;
  const idByKey = new Map();          // 이름+한자 → 엔진 id (두 가계도에 있는 사람을 하나로)
  const idOf = new Map();             // `${ds}/${id}` → 엔진 id
  const persons = new Map();          // 엔진 id → 인물(조립 중)
  const srcUrl = (d, k) => d.meta.sources && d.meta.sources[k];

  // 1) 가계도 인물과 부모
  for (const d of sets) {
    for (const p of d.persons) {
      if (!p.name) continue; // 이름 미상은 싣지 않는다
      const k = keyOf(p);
      let id = idByKey.get(k);
      if (!id) {
        id = `${d.meta.id}/${p.id}`;
        idByKey.set(k, id);
        persons.set(id, {
          id, ko: p.name, en: p.hanja || '', g: p.gender === 'F' ? 'F' : 'M', group: familyGroup(d.meta.id, p),
          title: p.title || [p.pen && `호 ${p.pen}`, p.clan].filter(Boolean).join(' · '), note: p.note || '',
          links: (p.sources || []).map((s) => srcUrl(d, s)).filter(Boolean).slice(0, 3),
          by: year(p.birth), dy: year(p.death), f: null, m: null, evYears: [],
        });
      }
      idOf.set(`${d.meta.id}/${p.id}`, id);
    }
    for (const u of d.unions || []) {
      const f = u.husband && idOf.get(`${d.meta.id}/${u.husband}`), m = u.wife && idOf.get(`${d.meta.id}/${u.wife}`);
      for (const c of u.children || []) {
        const P = persons.get(idOf.get(`${d.meta.id}/${c}`));
        if (!P) continue;
        if (f && !P.f) P.f = f;
        if (m && !P.m) P.m = m;
      }
    }
  }
  // 이원익의 직계 조상과 자녀는 맨 위 구역, 손자 대와 증손 이하는 그 양옆 구역에
  const lineOf = (id, up, depth = 0) => {
    if (!up) for (const P of persons.values()) {
      if (P.id !== id && (P.f === id || P.m === id)) { P.group = ['wonik-line', 'wonik-grand'][depth] || 'wonik-desc'; lineOf(P.id, false, depth + 1); }
    }
    if (up) { const P = persons.get(id); for (const x of [P.f, P.m]) if (persons.has(x)) { persons.get(x).group = 'wonik-line'; lineOf(x, true); } }
  };
  if (persons.has(SUBJECT)) { persons.get(SUBJECT).group = 'wonik-line'; lineOf(SUBJECT, true); lineOf(SUBJECT, false); }
  // 2) 명단 인물(공적 정보만: 직함·이력·출처)
  for (const g of GM.groups) {
    for (const p of g.people) {
      const id = `gm/${p.id}`;
      const group = g.id === 'gm-past' ? 'gm-past' : LIST_GROUP[p.group] || 'culture';
      persons.set(id, {
        id, ko: p.name, en: p.hanja || '', g: p.gender === 'F' ? 'F' : 'M', group,
        title: [p.group, p.party, p.district, p.role].filter(Boolean).join(' · '), note: (p.career || []).join(' / '),
        links: (p.sources || []).slice(0, 3), by: year(p.birth || p.born), dy: year(p.death), alive: !!p.born && !p.death, f: null, m: null, evYears: [],
      });
      idOf.set(`${g.id}/${p.id}`, id);
    }
  }
  // 3) 사건
  const inc = new Set(GM.include || []);
  const picked = (eventsSrc.events || []).filter((e) => inc.has(e.id)).map((e) => ({
    ...e, participants: [...(e.participants || []).filter((p) => GM.families.includes(p.ds)), ...((GM.addParticipants || {})[e.id] || [])],
  }));
  const events = [];
  for (const e of [...GM.events, ...picked]) {
    const from = e.start, to = e.end || e.start;
    const people = [];
    const add = (id, role) => {
      if (!id || people.some(([x]) => x === id)) return;
      people.push([id, role || '']);
      persons.get(id).evYears.push(from, to);
    };
    for (const pt of e.participants || []) add(idOf.get(`${pt.ds}/${pt.id}`), pt.role);
    for (const x of e.external || []) {
      // 가계도·명단에 같은 사람이 있으면 그 사람으로, 아니면 이름으로 모은다(한자를 한쪽만 적은 경우).
      const known = idByKey.get(keyOf(x));
      if (known) { add(known, x.role); continue; }
      const id = `x/${x.name}`;
      if (!persons.has(id)) persons.set(id, { id, ko: x.name, en: x.hanja || '', g: 'M', group: 'ext', title: '명단 밖 인물', note: '', links: [], by: null, dy: null, f: null, m: null, evYears: [] });
      add(id, x.role);
    }
    events.push({
      id: e.id, ko: e.name, en: e.hanja || '', from, to, type: EVENT_TYPES[e.type] ? e.type : '기타',
      place: e.place || '', summary: e.summary || '', links: (e.sources || []).slice(0, 3), people,
    });
  }
  // 4) 생애: 생몰년 → 한쪽만 알면 어림 → 모르면 사건 연도(활동 시기) → 그것도 없으면 가족에게서 세대로 어림.
  for (const P of persons.values()) {
    let b = P.by, d = P.dy, life = null;
    const ev = P.evYears;
    if (b && d) life = `${b}–${d}`;
    else if (b && P.alive) { d = NOW; life = `${b}년생`; }
    else if (b) { d = Math.min(NOW, b + APPROX_LIFE); if (ev.length) d = Math.max(d, ...ev); life = `${b}–?`; }
    else if (d) { b = d - APPROX_LIFE; if (ev.length) b = Math.min(b, ...ev); life = `?–${d}`; }
    else if (ev.length) { b = Math.min(...ev); d = Math.max(...ev); life = `활동 ${b === d ? b : `${b}–${d}`}`; }
    Object.assign(P, { b, d, life, exact: !!(P.by && (P.dy || P.alive)) });
  }
  const kidsOf = new Map();
  const spousesOf = new Map();
  for (const P of persons.values()) for (const par of [P.f, P.m]) if (par) (kidsOf.get(par) || kidsOf.set(par, []).get(par)).push(P);
  for (const d of sets) for (const u of d.unions || []) {
    const a = idOf.get(`${d.meta.id}/${u.husband}`), w = idOf.get(`${d.meta.id}/${u.wife}`);
    if (a && w) { (spousesOf.get(a) || spousesOf.set(a, []).get(a)).push(w); (spousesOf.get(w) || spousesOf.set(w, []).get(w)).push(a); }
  }
  for (let round = 0, changed = true; changed && round < 40; round++) {
    changed = false;
    for (const P of persons.values()) {
      if (P.life) continue;
      const par = [P.f, P.m].map((x) => persons.get(x)).find((x) => x && x.life);
      const kid = (kidsOf.get(P.id) || []).filter((x) => x.life).sort((x, y) => x.b - y.b)[0];
      const sp = (spousesOf.get(P.id) || []).map((x) => persons.get(x)).find((x) => x && x.life);
      const b = par ? par.b + GEN : kid ? kid.b - GEN : sp ? sp.b : null;
      if (b == null) continue;
      Object.assign(P, { b, d: Math.min(NOW, b + APPROX_LIFE), life: '생몰 미상', exact: false });
      changed = true;
    }
  }
  // 어림한 사람('생몰 미상')은 연도를 아는 사람들 사이의 세대를 잇는 데만 쓴다: 아래로 이어지는 자손이 없는 끝자리는 덜어 낸다.
  for (let changed = true; changed;) {
    changed = false;
    for (const P of persons.values()) {
      if (P.life !== '생몰 미상' || P.id === SUBJECT) continue;
      if ((kidsOf.get(P.id) || []).some((k) => k.life)) continue;
      P.life = null;
      changed = true;
    }
  }
  const out = [];
  for (const P of persons.values()) {
    if (!P.life) continue; // 이어진 사람도 연도도 없는 사람
    if (P.d < P.b) P.d = P.b;
    out.push({ ...P });
  }
  const kept = new Set(out.map((p) => p.id));
  for (const p of out) { if (!kept.has(p.f)) p.f = null; if (!kept.has(p.m)) p.m = null; delete p.evYears; delete p.by; delete p.dy; delete p.alive; }
  // 혼인: 두 사람이 모두 실렸을 때. 연도를 모르니 둘 다 살아 있던 때의 이른 쪽(아내 나이 열여덟 무렵)으로 둔다.
  const unions = [];
  const seenU = new Set();
  for (const d of sets) for (const u of d.unions || []) {
    const a = idOf.get(`${d.meta.id}/${u.husband}`), w = idOf.get(`${d.meta.id}/${u.wife}`);
    if (!kept.has(a) || !kept.has(w) || seenU.has(`${a}|${w}`)) continue;
    seenU.add(`${a}|${w}`);
    const A = out.find((p) => p.id === a), W = out.find((p) => p.id === w);
    const lo = Math.max(A.b, W.b), hi = Math.min(A.d, W.d);
    unions.push([a, w, Math.round(lo <= hi ? Math.min(hi, Math.max(lo, W.b + 18)) : (lo + hi) / 2), 'm']);
  }
  const minB = Math.min(...out.map((p) => p.b), ...events.map((e) => e.from));
  return {
    meta: {
      id: 'gwangmyeong', title: '광명의 명사', page: '광명의 명사', subject: SUBJECT, consort: '아내',
      range: [Math.floor((minB - 10) / 50) * 50, NOW + 4], startYear: 1608, focus: [1590, 1640], startFocus: true,
      groups: GROUPS, eventTypes: EVENT_TYPES, eras: ERAS.filter((e) => e.to > minB - 10),
      note: '현재 인물은 공적 정보(직함·이력·출처)만 싣는다.',
    },
    persons: out,
    unions,
    relations: [],
    events,
  };
}

G.gmWorld = build;
if (typeof window !== 'undefined' && window.GWANGMYEONG) {
  (window.WORLD_DATASETS = window.WORLD_DATASETS || []).push(build(window.GWANGMYEONG, window.GENEALOGY_DATASETS || [], window.GENEALOGY_EVENTS || { events: [] }));
}
})(window.Genealogy = window.Genealogy || {});
