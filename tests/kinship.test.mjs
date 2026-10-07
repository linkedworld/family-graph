import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildModel } from '../js/model.js';
import { Kinship } from '../js/kinship.js';

const yiHwang = JSON.parse(readFileSync(new URL('../data/yi-hwang.json', import.meta.url), 'utf8'));

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
