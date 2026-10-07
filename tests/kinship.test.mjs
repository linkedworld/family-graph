import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import vm from 'node:vm';

// 브라우저와 똑같이 일반 스크립트를 순서대로 실행해 전역에 등록된 객체를 꺼낸다.
const DATA_FILES = ['data/yi-hwang.js', 'data/yi-i.js', 'data/yi-sunsin.js', 'data/jeong-yakyong.js'];
const ctx = vm.createContext({ window: {} });
ctx.globalThis = ctx;
ctx.window = ctx;
for (const f of [...DATA_FILES, 'js/model.js', 'js/kinship.js']) {
  vm.runInContext(readFileSync(new URL(`../${f}`, import.meta.url), 'utf8'), ctx, { filename: f });
}
const { buildModel, Kinship } = ctx.Genealogy;
const dataset = (id) => ctx.GENEALOGY_DATASETS.find((d) => d.meta.id === id);
const yiHwang = dataset('yi-hwang');

function rel(k, ego, target) {
  const r = k.relation(ego, target);
  return [r.term, r.chon];
}

test('이황 데이터: 미상 인물 자동 생성', () => {
  const m = buildModel(yiHwang);
  // 외조모(박치의 처)는 기록이 없지만 반드시 존재한다.
  const grandma = m.mother('chuncheon_park');
  assert.ok(grandma);
  assert.equal(m.get(grandma).placeholder, true);
  assert.equal(m.displayName(grandma), '미상');
  assert.equal(m.isUnknown(grandma), true);
  // 본관만 전하는 인물은 '미상'이 아니다.
  assert.equal(m.displayName('yeongyang_kim'), '영양 김씨');
  assert.equal(m.isUnknown('yeongyang_kim'), false);
  // 이안도와 이충호 사이 10대가 미상으로 채워진다.
  let cur = 'yi_chungho', steps = 0;
  while (cur !== 'yi_ando') { cur = m.father(cur); steps++; }
  assert.equal(steps, 11);
});

test('이황 기준 호칭과 촌수', () => {
  const k = new Kinship(buildModel(yiHwang));
  const E = 'yi_hwang';
  assert.deepEqual(rel(k, E, 'yi_sik'), ['부', 1]);
  assert.deepEqual(rel(k, E, 'chuncheon_park'), ['모', 1]);
  assert.deepEqual(rel(k, E, 'uiseong_kim'), ['전모', 1]);
  assert.deepEqual(rel(k, E, 'yi_gyeyang'), ['조부', 2]);
  assert.deepEqual(rel(k, E, 'yi_jeong'), ['증조부', 3]);
  assert.deepEqual(rel(k, E, 'yi_unhu'), ['고조부', 4]);
  assert.deepEqual(rel(k, E, 'yi_jasu'), ['현조부', 5]);
  assert.deepEqual(rel(k, E, 'yi_seok'), ['6대조부', 6]);
  assert.deepEqual(rel(k, E, 'yi_u'), ['숙부', 3]);
  assert.deepEqual(rel(k, E, 'yi_uyang'), ['종조부', 4]);
  assert.deepEqual(rel(k, E, 'yi_ungu'), ['종고조부', 6]);
  assert.deepEqual(rel(k, E, 'yi_hae'), ['형', 2]);
  assert.deepEqual(rel(k, E, 'yi_jam'), ['이복형', 2]);
  assert.deepEqual(rel(k, E, 'yi_daughter_sik'), ['이복누나', 2]);
  assert.deepEqual(rel(k, E, 'sin_dam'), ['자형', 2]);
  assert.deepEqual(rel(k, E, 'park_chi'), ['외조부', 2]);
  assert.deepEqual(rel(k, E, m(k).mother('chuncheon_park')), ['외조모', 2]);
  assert.deepEqual(rel(k, E, 'kim_youyong'), ['진외조부', 3]);
  assert.deepEqual(rel(k, E, 'gimhae_heo'), ['아내', 0]);
  assert.deepEqual(rel(k, E, 'heo_chan'), ['장인', 1]);
  assert.deepEqual(rel(k, E, 'duhyang'), ['첩', 0]);
  assert.deepEqual(rel(k, E, 'yi_jun'), ['아들', 1]);
  assert.deepEqual(rel(k, E, 'bonghwa_geum'), ['며느리', 1]);
  assert.deepEqual(rel(k, E, 'yi_ando'), ['손자', 2]);
  assert.deepEqual(rel(k, E, 'andong_gwon_ando'), ['손부', 2]);
  assert.deepEqual(rel(k, E, 'yi_chungho'), ['13대손', 13]);
  assert.equal(k.relation(E, 'geum_jae').term, '사돈');
});

test('다른 기준 인물: 손자 이안도, 서자 이적, 며느리 허씨', () => {
  const k = new Kinship(buildModel(yiHwang));
  assert.deepEqual(rel(k, 'yi_ando', 'yi_hwang'), ['조부', 2]);
  assert.deepEqual(rel(k, 'yi_ando', 'yi_hae'), ['종조부', 4]);
  assert.deepEqual(rel(k, 'yi_ando', 'yi_u'), ['종증조부', 5]);
  assert.deepEqual(rel(k, 'yi_ando', 'yi_daughter_sik'), ['대고모', 4]);
  assert.deepEqual(rel(k, 'yi_ando', 'sin_dam'), ['대고모부', 4]);
  assert.deepEqual(rel(k, 'yi_ando', 'yi_chae'), ['숙부', 3]);
  assert.deepEqual(rel(k, 'yi_ando', 'heo_chan'), ['진외조부', 3]);
  assert.deepEqual(rel(k, 'yi_ando', 'geum_jae'), ['외조부', 2]);
  assert.deepEqual(rel(k, 'yi_ando', 'yi_yeongdo'), ['아우', 2]);
  assert.deepEqual(rel(k, 'yi_ando', 'park_chi'), ['조부의 외조부', 4]);
  assert.deepEqual(rel(k, 'yi_jeok', 'gimhae_heo'), ['적모', 1]);
  assert.deepEqual(rel(k, 'yi_jeok', 'duhyang'), ['서모', 1]);
  assert.deepEqual(rel(k, 'gimhae_heo', 'yi_sik'), ['시아버지', 1]);
  assert.deepEqual(rel(k, 'gimhae_heo', 'yi_hae'), ['아주버니', 2]);
  assert.deepEqual(rel(k, 'gimhae_heo', 'yi_u'), ['시숙부', 3]);
  assert.deepEqual(rel(k, 'gimhae_heo', 'uiseong_kim'), ['시전모', 1]);
  assert.equal(k.relation('gimhae_heo', 'andong_gwon').term, '후처');
  assert.equal(k.relation('andong_gwon', 'gimhae_heo').term, '전처');
});

test('모든 가계도 데이터: 형식 검사', () => {
  assert.equal(ctx.GENEALOGY_DATASETS.length, DATA_FILES.length);
  const ids = new Set();
  for (const d of ctx.GENEALOGY_DATASETS) {
    assert.ok(!ids.has(d.meta.id), `중복 id ${d.meta.id}`);
    ids.add(d.meta.id);
    const m = buildModel(d); // 잘못된 참조가 있으면 예외
    assert.ok(m.get(d.meta.subject), `${d.meta.id}: subject 없음`);
    for (const [, p] of m.persons) {
      for (const s of p.sources || []) assert.ok(d.meta.sources[s], `${d.meta.id}/${p.id}: 출처 ${s} 없음`);
    }
    // 기준 인물에서 모든 인물의 관계를 계산할 수 있어야 한다.
    const k = new Kinship(m);
    for (const [id] of m.persons) {
      const r = k.relation(d.meta.subject, id);
      assert.notEqual(r.kind, 'none', `${d.meta.id}/${id}`);
      // 방계 혈족은 10촌까지만 싣는다(직계 조상·후손은 예외).
      if (r.kind === 'blood' && r.path && r.path.up > 0 && r.path.down > 0) {
        assert.ok(r.chon <= 10, `${d.meta.id}/${id}: 방계 ${r.chon}촌`);
      }
    }
  }
});

test('율곡 이이', () => {
  const k = new Kinship(buildModel(dataset('yi-i')));
  const E = 'yi_i';
  assert.deepEqual(rel(k, E, 'shin_saimdang'), ['모', 1]);
  assert.deepEqual(rel(k, E, 'shin_myeonghwa'), ['외조부', 2]);
  assert.deepEqual(rel(k, E, 'yi_uimu'), ['종증조부', 5]);
  assert.deepEqual(rel(k, E, 'yi_gi'), ['재종조부', 6]);
  assert.deepEqual(rel(k, E, 'myeongsin_son'), ['고조부', 4]);
  assert.deepEqual(rel(k, E, 'yi_maechang'), ['누나', 2]);
  assert.deepEqual(rel(k, E, 'jo_jun'), ['생질', 3]);
  assert.deepEqual(rel(k, E, 'deoksan_hwang'), ['제수', 2]);
  assert.deepEqual(rel(k, E, 'kwon_seomo'), ['서모', 1]);
  assert.deepEqual(rel(k, E, 'kim_jip'), ['사위', 1]);
  assert.equal(k.relation(E, 'kim_jangsaeng').term, '사돈');
  assert.equal(k.relation(E, 'lee_saon').term, '어머니의 외조부');
  // 아버지 이원수 기준으로 이기는 당숙(종숙)
  assert.deepEqual(rel(k, 'yi_wonsu', 'yi_gi'), ['종숙', 5]);
});

test('충무공 이순신', () => {
  const k = new Kinship(buildModel(dataset('yi-sunsin')));
  const E = 'yi_sunsin';
  assert.deepEqual(rel(k, E, 'yi_huisin'), ['형', 2]);
  assert.deepEqual(rel(k, E, 'yi_wan'), ['조카', 3]);
  assert.deepEqual(rel(k, E, 'byeon_seong'), ['진외조부', 3]);
  assert.deepEqual(rel(k, E, 'bang_jin'), ['장인', 1]);
  assert.deepEqual(rel(k, E, 'bang_junggyu'), ['처조부', 2]);
  assert.deepEqual(rel(k, E, 'haeju_oh'), ['첩', 0]);
  assert.equal(k.relation(E, 'hong_gasin').term, '사돈');
  // 이완과 서자 이신은 사촌
  assert.deepEqual(rel(k, 'yi_wan', 'yi_sin'), ['종형제', 4]); // 이신의 생년 미상이라 손위·손아래를 정하지 않음
});

test('다산 정약용', () => {
  const k = new Kinship(buildModel(dataset('jeong-yakyong')));
  const E = 'jeong_yakyong';
  assert.deepEqual(rel(k, E, 'jeong_yakhyeon'), ['이복형', 2]);
  assert.deepEqual(rel(k, E, 'uiryeong_nam'), ['전모', 1]);
  assert.deepEqual(rel(k, E, 'yun_duseo'), ['외증조부', 3]);
  assert.deepEqual(rel(k, E, 'yun_seondo'), ['외6대조부', 6]);
  assert.deepEqual(rel(k, E, 'jeong_sister'), ['누이', 2]);
  assert.deepEqual(rel(k, E, 'yi_seunghun'), ['매부', 2]);
  assert.deepEqual(rel(k, E, 'hwang_sayeong'), ['질서', 3]);
  assert.deepEqual(rel(k, E, 'jeong_jiyeol'), ['종조부', 4]);
  assert.deepEqual(rel(k, E, 'jeong_yakhoeng'), ['이복아우', 2]);
  assert.equal(k.relation(E, 'yi_byeok').term, '형수의 남자 형제');
  // 누이 입장에서 정약용은 오라비(손위·손아래 미상)
  assert.deepEqual(rel(k, 'jeong_sister', E), ['오라비', 2]);
});

test('양자(출계): 양가 기준 호칭과 생가 표시', () => {
  const m = buildModel(dataset('jeong-yakyong'));
  const k = new Kinship(m);
  // 정재운은 작은할아버지 정지열의 양자
  assert.equal(m.father('jeong_jaeun'), 'jeong_jiyeol');
  assert.equal(m.father('jeong_jaeun', 'birth'), 'jeong_jihae');
  assert.ok(m.children('jeong_jiyeol').includes('jeong_jaeun'));
  assert.ok(!m.children('jeong_jihae').includes('jeong_jaeun'));
  assert.ok(m.children('jeong_jihae', 'all').includes('jeong_jaeun'));

  assert.deepEqual(rel(k, 'jeong_jaeun', 'jeong_jiyeol'), ['양부', 1]);
  assert.deepEqual(rel(k, 'jeong_jaeun', 'jeong_jihae'), ['생부', 1]);
  assert.deepEqual(rel(k, 'jeong_jiyeol', 'jeong_jaeun'), ['양자', 1]);
  assert.deepEqual(rel(k, 'jeong_jihae', 'jeong_jaeun'), ['출계한 아들', 1]);
  // 정약용에게 출계한 숙부는 양가 기준 종숙(5촌), 생가 기준 숙부(3촌)
  const r = k.relation('jeong_yakyong', 'jeong_jaeun');
  assert.deepEqual([r.term, r.chon], ['종숙', 5]);
  assert.match(r.detail, /생가 기준 숙부 3촌/);
  // 정문섭은 생부 정대무, 양부 정대림. 정약용에게는 어느 쪽으로도 증손자
  const mun = k.relation('jeong_yakyong', 'jeong_munseop');
  assert.deepEqual([mun.term, mun.chon, mun.detail], ['증손자', 3, null]);
  assert.deepEqual(rel(k, 'jeong_daemu', 'jeong_munseop'), ['출계한 아들', 1]);

  const ks = new Kinship(buildModel(dataset('yi-sunsin')));
  assert.deepEqual(rel(ks, 'yi_ye', 'yi_jiseok'), ['양자', 1]);
  assert.deepEqual(rel(ks, 'yi_hoe', 'yi_jiseok'), ['출계한 아들', 1]);
  // 이지백(1596)과 이지석(1612): 양가 기준 사촌 동생, 생가 기준 아우
  const bro = ks.relation('yi_jibaek', 'yi_jiseok');
  assert.equal(bro.term, '종제');
  assert.match(bro.detail, /생가 기준 아우 2촌/);
});

test('양자 데이터 검사: 잘못된 입양은 오류', () => {
  const base = dataset('yi-sunsin');
  const bad = { ...base, adoptions: [{ id: 'x', child: 'yi_jiseok', union: 'u_hoe' }] };
  assert.throws(() => buildModel(bad), /same as birth parents/);
  const twice = { ...base, adoptions: [...base.adoptions, { id: 'y', child: 'yi_jiseok', union: 'u_jeong' }] };
  assert.throws(() => buildModel(twice), /adopted twice/);
});

test('출생 순서: 몇남 몇녀 중 몇째 (장남·차남·장녀·차녀)', () => {
  const m = buildModel(yiHwang);
  // 이식의 자녀: 이잠, 이하, 딸, 이서린, 이의, 이해, 이징, 이황 (7남 1녀)
  assert.equal(m.birthOrder('yi_jam').full, '7남 1녀 중 장남');
  assert.equal(m.birthOrder('yi_ha').full, '7남 1녀 중 차남');
  assert.equal(m.birthOrder('yi_daughter_sik').full, '7남 1녀 중 장녀');
  assert.equal(m.birthOrder('yi_hae').full, '7남 1녀 중 여섯째');
  assert.equal(m.birthOrder('yi_hwang').full, '7남 1녀 중 여덟째');
  assert.equal(m.birthOrder('yi_hwang').label, '여덟째');
  assert.deepEqual([...m.orderedChildren('yi_sik').slice(-2)], ['yi_jing', 'yi_hwang']);
  const s = buildModel(dataset('yi-sunsin'));
  assert.equal(s.birthOrder('yi_sunsin').full, '4남 중 셋째');
  assert.equal(s.birthOrder('yi_ye').label, '차남');     // 이회 1567, 이예 1571, 이훈 1574(서자) 순
  assert.deepEqual([...s.orderedChildren('yi_sunsin').filter((c) => s.get(c).gender === 'M')],
    ['yi_hoe', 'yi_ye', 'yi_hun', 'yi_sin', 'yi_myeon']);
  // 자녀가 하나뿐이면 외아들·외동딸
  const only = [...m.persons.keys()].find((id) => { const o = m.birthOrder(id); return o && o.sons + o.daughters === 1; });
  assert.match(m.birthOrder(only).full, /^(외아들|외동딸)$/);
});

test('index.html·tree.html: 로컬 CSS·JS·데이터에 같은 캐시 버전(?v=)이 붙어 있음', () => {
  const all = new Set();
  for (const page of ['index.html', 'tree.html']) {
    const html = readFileSync(new URL(`../${page}`, import.meta.url), 'utf8');
    const refs = [...html.matchAll(/(?:src|href)="((?:css|js|data|vendor)\/[^"]+)"/g)].map((m) => m[1]);
    assert.ok(refs.length >= 8, `${page}: 로컬 자원 ${refs.length}개`);
    const versions = new Set(refs.map((r) => (r.match(/\?v=([^"&]+)/) || [])[1]));
    assert.ok(!versions.has(undefined), `${page}: 버전이 빠진 자원: ${refs.filter((r) => !r.includes('?v=')).join(', ')}`);
    for (const v of versions) all.add(v);
    for (const f of DATA_FILES) assert.ok(refs.some((r) => r.startsWith(f + '?')), `${f}가 ${page}에 없음`);
    for (const r of refs) assert.ok(existsSync(new URL(`../${r.split('?')[0]}`, import.meta.url)), `${page}: 없는 파일 ${r}`);
  }
  assert.equal(all.size, 1, `버전이 서로 다름: ${[...all].join(', ')}`);
});

// ── 가상의 가족으로 일반 호칭 검증 ─────────────────────────────
//
//            gf ─ gm                       mgf ─ mgm
//     ┌──────┼───────┐                ┌──────┴──────┐
//   uncle  father ─ mother          m_bro         m_sis
//     │       │   ┌───┴───┐            │             │
//   cousin   ego  sister  ...      m_cousin      i_cousin
//           (+wife)  │
//                  nephew
function sample() {
  const P = (id, gender, birth, extra = {}) => ({ id, name: id, gender, birth, clan: 'X', ...extra });
  return {
    persons: [
      P('ggf', 'M', '1880'), P('gf', 'M', '1910'), P('gf_bro', 'M', '1915'),
      P('gm', 'F', '1912'), P('father', 'M', '1940', { sibIndex: 2 }), P('uncle', 'M', '1938', { sibIndex: 1 }),
      P('young_uncle', 'M', '1945', { sibIndex: 3 }), P('aunt', 'F', '1943', { sibIndex: 2.5 }),
      P('dangsuk', 'M', '1942'), P('jae_cousin', 'M', '1972'),
      P('mother', 'F', '1942'), P('mgf', 'M', '1915'), P('mgm', 'F', '1918'),
      P('m_bro', 'M', '1940'), P('m_sis', 'F', '1946'), P('m_cousin', 'M', '1968'), P('i_cousin', 'F', '1975'),
      P('ego', 'M', '1970'), P('brother', 'M', '1973'), P('sister', 'F', '1965'), P('sis_husband', 'M', '1963'),
      P('nephew', 'M', '1990'), P('bro_wife', 'F', '1975'), P('cousin', 'M', '1965'), P('go_cousin', 'F', '1971'),
      P('aunt_husband', 'M', '1940'),
      P('wife', 'F', '1972'), P('wife_father', 'M', '1945'), P('wife_mother', 'F', '1947'),
      P('wife_bro', 'M', '1968'), P('wife_bro_wife', 'F', '1969'), P('wife_sis', 'F', '1975'), P('wife_sis_husband', 'M', '1973'),
      P('son', 'M', '2000'), P('daughter', 'F', '2002'), P('son_wife', 'F', '2001'), P('son_wife_father', 'M', '1970'),
      P('daughter_husband', 'M', '2000'), P('daughter_son', 'M', '2025'),
    ],
    unions: [
      { id: 'u0', husband: 'ggf', wife: null, children: ['gf', 'gf_bro'] },
      { id: 'u1', husband: 'gf', wife: 'gm', children: ['uncle', 'father', 'aunt', 'young_uncle'] },
      { id: 'u1b', husband: 'gf_bro', wife: null, children: ['dangsuk'] },
      { id: 'u1c', husband: 'dangsuk', wife: null, children: ['jae_cousin'] },
      { id: 'u2', husband: 'father', wife: 'mother', children: ['sister', 'ego', 'brother'] },
      { id: 'u3', husband: 'mgf', wife: 'mgm', children: ['m_bro', 'mother', 'm_sis'] },
      { id: 'u4', husband: 'm_bro', wife: null, children: ['m_cousin'] },
      { id: 'u5', husband: null, wife: 'm_sis', children: ['i_cousin'] },
      { id: 'u6', husband: 'uncle', wife: null, children: ['cousin'] },
      { id: 'u7', husband: 'aunt_husband', wife: 'aunt', children: ['go_cousin'] },
      { id: 'u8', husband: 'sis_husband', wife: 'sister', children: ['nephew'] },
      { id: 'u9', husband: 'brother', wife: 'bro_wife', children: [] },
      { id: 'u10', husband: 'wife_father', wife: 'wife_mother', children: ['wife_bro', 'wife', 'wife_sis'] },
      { id: 'u11', husband: 'ego', wife: 'wife', children: ['son', 'daughter'] },
      { id: 'u12', husband: 'wife_bro', wife: 'wife_bro_wife', children: [] },
      { id: 'u13', husband: 'wife_sis_husband', wife: 'wife_sis', children: [] },
      { id: 'u14', husband: 'son_wife_father', wife: null, children: ['son_wife'] },
      { id: 'u15', husband: 'son', wife: 'son_wife', children: [] },
      { id: 'u16', husband: 'daughter_husband', wife: 'daughter', children: ['daughter_son'] },
    ],
  };
}

test('가상 가족: 친가·외가·고모·이모 계열', () => {
  const k = new Kinship(buildModel(sample()));
  const cases = {
    uncle: ['백부', 3], young_uncle: ['숙부', 3], aunt: ['고모', 3], aunt_husband: ['고모부', 3],
    cousin: ['종형', 4], go_cousin: ['내종매', 4], gf_bro: ['종조부', 4],
    dangsuk: ['종숙', 5], jae_cousin: ['재종제', 6],
    m_bro: ['외숙', 3], m_sis: ['이모', 3], m_cousin: ['외종형', 4], i_cousin: ['이종매', 4],
    mgf: ['외조부', 2], sister: ['누나', 2], brother: ['아우', 2], sis_husband: ['자형', 2],
    bro_wife: ['제수', 2], nephew: ['생질', 3], daughter_son: ['외손자', 2],
  };
  for (const [id, want] of Object.entries(cases)) {
    assert.deepEqual(rel(k, 'ego', id), want, id);
  }
  assert.equal(k.relation('ego', 'uncle').alt, '큰아버지');
  assert.equal(k.relation('ego', 'dangsuk').alt, '당숙');
  assert.equal(k.relation('ego', 'm_bro').alt, '외삼촌');
  assert.equal(k.relation('ego', 'cousin').alt, '사촌 형');
});

test('가상 가족: 인척과 사돈', () => {
  const k = new Kinship(buildModel(sample()));
  const cases = {
    wife: ['아내', 0], wife_father: ['장인', 1], wife_mother: ['장모', 1],
    wife_bro: ['처남', 2], wife_sis: ['처제', 2], wife_bro_wife: ['처남댁', 2], wife_sis_husband: ['동서', 2],
    son_wife: ['며느리', 1], daughter_husband: ['사위', 1],
  };
  for (const [id, want] of Object.entries(cases)) {
    assert.deepEqual(rel(k, 'ego', id), want, id);
  }
  assert.equal(k.relation('ego', 'son_wife_father').term, '사돈');
  // 아내 입장
  assert.deepEqual(rel(k, 'wife', 'father'), ['시아버지', 1]);
  assert.deepEqual(rel(k, 'wife', 'brother'), ['시동생', 2]);
  assert.deepEqual(rel(k, 'wife', 'sister'), ['시누이', 2]);
  assert.deepEqual(rel(k, 'wife', 'bro_wife'), ['동서', 2]);
  // 여성 기준 형제 호칭
  assert.deepEqual(rel(k, 'sister', 'ego'), ['남동생', 2]);
  assert.deepEqual(rel(k, 'i_cousin', 'm_sis'), ['모', 1]);
});

function m(k) { return k.m; }
