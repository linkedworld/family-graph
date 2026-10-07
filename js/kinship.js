// 한국 친족 호칭·촌수 계산 엔진.
//
// 기준 인물(ego)과 대상 인물(target)의 관계를 다음 순서로 판별한다.
//   1) 혈족: 가장 가까운 공통 조상까지의 세대 수로 촌수를 구하고
//      계통(친가·외가·진외가, 고모·이모·누이 계열)에 따라 호칭을 붙인다.
//   2) 배우자, 혈족의 배우자, 배우자의 혈족, 배우자 혈족의 배우자(인척)
//   3) 사돈
//   4) 그 밖의 관계는 "아버지의 아내의 아버지"처럼 경로를 풀어 쓴다.
//
// 반환값: { kind, term, alt, chon, detail }
//   kind  : self | blood | spouse | affinal | sadon | distant | none
//   term  : 대표 호칭(지칭어)
//   alt   : 일상 호칭·별칭(없으면 null)
//   chon  : 촌수(배우자 0, 계산 불가 null)
// 서버 없이 file://로도 열리도록 모듈 대신 전역 Genealogy 객체에 등록한다.
(function (G) {
  'use strict';

  const PREFIX = ['', '종', '재종', '삼종', '사종', '오종', '육종', '칠종', '팔종', '구종'];
  const pre = (c) => (c < PREFIX.length ? PREFIX[c] : `${c}종`);

  const CHON_WORD = { 2: '이촌', 3: '삼촌', 4: '사촌', 5: '오촌', 6: '육촌', 7: '칠촌', 8: '팔촌', 9: '구촌', 10: '십촌' };
  const chonWord = (n) => CHON_WORD[n] || `${n}촌`;

  function ascTerm(n, g) {
    const m = ['', '부', '조부', '증조부', '고조부', '현조부'];
    const f = ['', '모', '조모', '증조모', '고조모', '현조모'];
    if (n < 6) return g === 'F' ? f[n] : m[n];
    return g === 'F' ? `${n}대조모` : `${n}대조부`;
  }

  function ascColloquial(n, g) {
    const m = ['', '아버지', '할아버지', '증조할아버지', '고조할아버지'];
    const f = ['', '어머니', '할머니', '증조할머니', '고조할머니'];
    if (n < 5) return g === 'F' ? f[n] : m[n];
    if (n === 5) return g === 'F' ? '5대조 할머니' : '5대조 할아버지';
    return g === 'F' ? `${n}대 할머니` : `${n}대 할아버지`;
  }

  function descTerm(n, g) {
    const m = ['', '아들', '손자', '증손자', '현손자'];
    const f = ['', '딸', '손녀', '증손녀', '현손녀'];
    if (n < 5) return g === 'F' ? f[n] : m[n];
    return g === 'F' ? `${n}대손녀` : `${n}대손`;
  }

  function descStem(n) {
    return ['', '', '손', '증손', '현손'][n] || `${n}대손`;
  }

  // 손위·손아래를 모르면 나이와 무관한 말(형제, 누이, 오라비, 자매)을 쓴다.
  function siblingWord(egoG, tG, older) {
    if (tG === 'M') {
      if (older == null) return egoG === 'F' ? '오라비' : '형제';
      if (egoG === 'F') return older ? '오빠' : '남동생';
      return older ? '형' : '아우';
    }
    if (older == null) return egoG === 'F' ? '자매' : '누이';
    if (egoG === 'F') return older ? '언니' : '여동생';
    return older ? '누나' : '누이동생';
  }

  // 친가(부계) 방계 호칭. g = 대상의 세대 - 기준의 세대, c = 방계 차수(0: 형제 계열, 1: 사촌 계열…)
  function agnaticCollateral(g, c, tG, egoG, older) {
    const n = 2 * (c + 1) + Math.abs(g);
    if (g === 0) {
      if (c === 0) {
        const w = siblingWord(egoG, tG, older);
        return { term: w, alt: null };
      }
      const w = siblingWord(egoG, tG, older);
      const hanja = tG === 'M'
        ? (older == null ? '형제' : older ? '형' : '제')
        : (older == null ? '자매' : older ? '자' : '매');
      return { term: `${pre(c)}${hanja}`, alt: `${chonWord(n)} ${w}` };
    }
    if (g === 1) {
      if (tG === 'M') {
        if (c === 0) {
          if (older == null) return { term: '백숙부', alt: '큰아버지·작은아버지' };
          return older ? { term: '백부', alt: '큰아버지' } : { term: '숙부', alt: '작은아버지' };
        }
        return { term: `${pre(c)}숙`, alt: c === 1 ? '당숙' : `${chonWord(n)} 아저씨` };
      }
      if (c === 0) return { term: '고모', alt: null };
      return { term: `${pre(c)}고모`, alt: c === 1 ? '당고모' : null };
    }
    if (g >= 2) {
      if (tG === 'M') {
        const alt = c === 0 && g === 2 && older != null ? (older ? '큰할아버지' : '작은할아버지') : null;
        return { term: `${pre(c + 1)}${ascTerm(g, 'M')}`, alt };
      }
      const lvl = g === 2 ? '' : g === 3 ? '증' : g === 4 ? '고' : `${g}대`;
      return { term: `${pre(c)}${lvl}대고모`, alt: c === 0 && g === 2 ? '왕고모' : null };
    }
    if (g === -1) {
      if (tG === 'M') return c === 0 ? { term: '조카', alt: '질(姪)' } : { term: `${pre(c)}질`, alt: c === 1 ? '당질' : null };
      return c === 0 ? { term: '질녀', alt: '조카딸' } : { term: `${pre(c)}질녀`, alt: c === 1 ? '당질녀' : null };
    }
    // g <= -2
    const stem = `${pre(c + 1)}${descStem(-g)}`;
    return { term: tG === 'F' ? `${stem}녀` : stem, alt: null };
  }

  function lineOf(genders) {
    if (genders.every((g) => g === 'M')) return 'agnatic';
    if (genders[0] === 'F' && genders.slice(1).every((g) => g === 'M')) return 'female1';
    if (genders[0] === 'M' && genders[1] === 'F' && genders.slice(2).every((g) => g === 'M')) return 'female2';
    return 'other';
  }

  class Kinship {
    constructor(model) {
      this.m = model;
      this._anc = new Map();
    }

    gender(id) { return this.m.get(id).gender; }

    // id 자신(거리 0)과 모든 조상까지의 최단 경로. 아버지 쪽을 먼저 탐색한다.
    ancestors(id) {
      if (this._anc.has(id)) return this._anc.get(id);
      const out = new Map([[id, { dist: 0, path: [] }]]);
      const queue = [id];
      while (queue.length) {
        const cur = queue.shift();
        const { dist, path } = out.get(cur);
        for (const p of [this.m.father(cur), this.m.mother(cur)]) {
          if (p && !out.has(p)) {
            out.set(p, { dist: dist + 1, path: [...path, p] });
            queue.push(p);
          }
        }
      }
      this._anc.set(id, out);
      return out;
    }

    // 나이 비교: a가 b보다 손위면 true, 손아래면 false, 알 수 없으면 null.
    isOlder(a, b) {
      const pa = this.m.get(a), pb = this.m.get(b);
      if (pa.parentUnion && pb.parentUnion &&
          this.m.father(a) === this.m.father(b) && pa.sibIndex != null && pb.sibIndex != null) {
        return pa.sibIndex < pb.sibIndex;
      }
      const ya = parseInt(pa.birth, 10), yb = parseInt(pb.birth, 10);
      if (!Number.isNaN(ya) && !Number.isNaN(yb) && ya !== yb) return ya < yb;
      return null;
    }

    // 혈족 관계의 구조(공통 조상, 상향·하향 경로)를 구한다.
    bloodPath(ego, target) {
      const A = this.ancestors(ego), B = this.ancestors(target);
      let best = null;
      for (const [ca, a] of A) {
        const b = B.get(ca);
        if (!b) continue;
        const total = a.dist + b.dist;
        const females = [...a.path, ...b.path].filter((p) => this.gender(p) === 'F').length;
        const score = [total, this.gender(ca) === 'M' ? 0 : 1, females];
        if (!best || lexLess(score, best.score)) best = { ca, a, b, score };
      }
      if (!best) return null;
      const asc = best.a.path;                 // ego의 부모 … 공통 조상
      const descUp = best.b.path;              // target의 부모 … 공통 조상
      const desc = best.b.dist === 0 ? [] : [...descUp.slice(0, -1).reverse(), target];
      return { ca: best.ca, up: asc.length, down: desc.length, asc, desc };
    }

    blood(ego, target) {
      if (ego === target) return null;
      const bp = this.bloodPath(ego, target);
      if (!bp) return null;
      const { up, down, asc, desc } = bp;
      const tG = this.gender(target), egoG = this.gender(ego);
      const ascMid = asc.slice(0, Math.max(0, up - 1)).map((p) => this.gender(p));
      const descMid = desc.slice(0, Math.max(0, down - 1)).map((p) => this.gender(p));
      const chon = up + down;
      const res = (term, alt, detail) => ({ kind: 'blood', term, alt: alt ?? null, chon, detail: detail ?? null, path: bp });
      const composite = () => {
        const c = this.compose(ego, target, [...asc, ...desc]);
        return c ? { ...res(c, null, '계통이 섞인 관계를 두 호칭으로 이어 표현'), composite: true }
          : { ...res(this.describe(ego, target), null), described: true };
      };

      // 직계 존속
      if (down === 0) {
        const line = lineOf(ascMid);
        if (line === 'agnatic') return res(ascTerm(up, tG), ascColloquial(up, tG));
        if (line === 'female1') return res(`외${ascTerm(up, tG)}`, `외${ascColloquial(up, tG)}`);
        if (line === 'female2') return res(`진외${ascTerm(up - 1, tG)}`, `아버지의 외${ascColloquial(up - 1, tG)}`);
        return composite();
      }
      // 직계 비속
      if (up === 0) {
        if (descMid.every((g) => g === 'M')) return res(descTerm(down, tG), null);
        return res(`외${descTerm(down, tG)}`, null);
      }

      // 방계
      const g = up - down;
      const c = Math.min(up, down) - 1;
      // 기준 쪽에서 대상과 같은 세대에 있는 사람(형제 계열 비교용)
      const counterpart = g > 0 ? asc[g - 1] : ego;
      const older = g === 0 ? this.isOlder(target, ego)
        : (c === 0 && g > 0 ? this.isOlder(target, counterpart) : null);

      const aLine = lineOf(ascMid);
      const dLine = lineOf(descMid);

      if (aLine === 'agnatic' && dLine === 'agnatic') {
        const t = agnaticCollateral(g, c, tG, egoG, older);
        if (g === 0 && c === 0) {
          const half = this.halfSibling(ego, target);
          if (half) return res(`${half}${t.term}`, t.term, half === '이복' ? '아버지는 같고 어머니가 다름' : '어머니는 같고 아버지가 다름');
        }
        return res(t.term, t.alt);
      }
      if (aLine === 'agnatic' && dLine === 'female1') {
        // 누이·고모 계열의 자손
        if (c === 0 && g === -1) return res(tG === 'F' ? '생질녀' : '생질', '누이의 자녀');
        if (c === 1 && (g === 0 || g === -1)) {
          const t = agnaticCollateral(g, c, tG, egoG, older);
          return res(t.term.replace(/^종/, '내종'), g === 0 ? `고종${chonWord(4)} ${siblingWord(egoG, tG, older)}` : null);
        }
      }
      if (aLine === 'female1') {
        // 외가(어머니의 친정) 계열
        if (dLine === 'agnatic') {
          if (g === 1 && c === 0) return tG === 'F' ? res('이모', null) : res('외숙', '외삼촌');
          const t = agnaticCollateral(g, c, tG, egoG, older);
          let alt = t.alt;
          if (g === 0 && c === 1) alt = `외사촌 ${siblingWord(egoG, tG, older)}`;
          if (g === 1 && c === 1) alt = '외당숙';
          return res(`외${t.term}`, alt);
        }
        if (dLine === 'female1' && c === 1 && (g === 0 || g === -1)) {
          const t = agnaticCollateral(g, c, tG, egoG, older);
          return res(t.term.replace(/^종/, '이종'), g === 0 ? `이종사촌 ${siblingWord(egoG, tG, older)}` : null);
        }
      }
      if (aLine === 'female2' && dLine === 'agnatic') {
        // 진외가(아버지의 외가) 계열
        const t = agnaticCollateral(g, c, tG, egoG, older);
        return res(`진외${t.term}`, null);
      }
      return composite();
    }

    // 혈연 경로 위의 한 사람(pivot)을 기준으로 "조부의 외조부"처럼 두 호칭을 잇는다.
    // ego에서 가장 먼 pivot부터 시도해 앞쪽 호칭이 최대한 길게 되도록 한다.
    // 뒤쪽 호칭이 '부'·'모' 한 단계로 끝나는 조합("증조모의 부")은 마지막 수단으로 미룬다.
    compose(ego, target, chain) {
      for (const minTail of [2, 1]) {
        for (let i = chain.length - 2; i >= 0; i--) {
          const pivot = chain[i];
          const r1 = this.blood(ego, pivot);
          if (!r1 || r1.described || r1.composite) continue;
          const r2 = this.blood(pivot, target);
          if (!r2 || r2.described || r2.chon < minTail) continue;
          // 부·모처럼 한 글자 호칭은 아버지·어머니로 풀어 쓴다.
          const head = r1.chon === 1 ? r1.alt : r1.term;
          const tail = r2.chon === 1 ? r2.alt : r2.term;
          return `${head}의 ${tail}`;
        }
      }
      return null;
    }

    siblings(id) {
      const out = new Set();
      for (const p of this.m.parents(id)) for (const c of this.m.children(p)) if (c !== id) out.add(c);
      return [...out];
    }

    halfSibling(a, b) {
      const ua = this.m.get(a).parentUnion, ub = this.m.get(b).parentUnion;
      if (!ua || !ub || ua === ub) return null;
      if (this.m.father(a) === this.m.father(b)) return '이복';
      if (this.m.mother(a) === this.m.mother(b)) return '이부';
      return null;
    }

    relation(ego, target, depth = 0) {
      if (ego === target) return { kind: 'self', term: '본인', alt: '기준 인물', chon: null, detail: null };

      const b = this.blood(ego, target);
      if (b) return b;

      const egoG = this.gender(ego);

      // 배우자
      for (const s of this.m.spouses(ego)) {
        if (s.id !== target) continue;
        return { kind: 'spouse', chon: 0, ...this.spouseTerm(egoG, s.union, ego) };
      }

      // 혈족의 배우자
      let best = null;
      for (const s of this.m.spouses(target)) {
        const r = this.blood(ego, s.id);
        if (!r) continue;
        const t = this.spouseOfBlood(ego, s.id, r, target, s.union);
        if (!best || (r.chon ?? 99) < best.chon) best = { kind: 'affinal', chon: r.chon, ...t };
      }
      if (best) return best;

      // 배우자의 혈족 / 배우자 혈족의 배우자
      for (const s of this.m.spouses(ego)) {
        const r = this.blood(s.id, target);
        if (r) return { kind: 'affinal', chon: r.chon, ...this.spouseRelative(egoG, s.id, target, r) };
      }
      for (const s of this.m.spouses(ego)) {
        for (const ts of this.m.spouses(target)) {
          if (ts.id === s.id) return { kind: 'affinal', chon: null, ...this.coSpouse(ego, s, ts.union) };
          const r = this.blood(s.id, ts.id);
          if (!r) continue;
          return { kind: 'affinal', chon: r.chon, ...this.spouseRelativeSpouse(egoG, s.id, ts.id, r, target, ts.union) };
        }
      }

      // 사돈: 자녀의 배우자의 부모
      for (const c of this.m.children(ego)) {
        for (const cs of this.m.spouses(c)) {
          if (this.m.parents(cs.id).includes(target)) {
            return { kind: 'sadon', chon: null, term: '사돈',
              alt: this.gender(target) === 'F' ? '안사돈' : '바깥사돈',
              detail: `${descTerm(1, this.gender(c))}의 배우자의 부모` };
          }
        }
      }

      // 인척의 부모·형제: "전모의 아버지", "형수의 남자 형제"처럼 한 단계만 이어 붙인다.
      if (depth === 0) {
        for (const c of this.m.children(target)) {
          const r = this.relation(ego, c, 1);
          if (['affinal', 'spouse', 'sadon'].includes(r.kind)) {
            return { kind: 'distant', chon: null,
              term: `${r.term}의 ${this.gender(target) === 'F' ? '어머니' : '아버지'}`, alt: null, detail: null };
          }
        }
        for (const sib of this.siblings(target)) {
          const r = this.relation(ego, sib, 1);
          if (['affinal', 'spouse'].includes(r.kind)) {
            return { kind: 'distant', chon: null,
              term: `${r.term}의 ${this.gender(target) === 'F' ? '여자 형제' : '남자 형제'}`, alt: null, detail: null };
          }
        }
      }

      const d = this.describe(ego, target);
      if (d) return { kind: 'distant', chon: null, term: d, alt: null, detail: null };
      return { kind: 'none', chon: null, term: '관계 없음', alt: null, detail: null };
    }

    spouseTerm(egoG, union) {
      if (egoG === 'F') return { term: '남편', alt: '부군', detail: null };
      if (union.type === '첩') return { term: '첩', alt: '소실', detail: union.note ?? null };
      const nth = union.order > 1 ? '재취 부인' : null;
      return { term: '아내', alt: '처', detail: nth || union.note || null };
    }

    // 혈족 R(관계 r)의 배우자 target
    spouseOfBlood(ego, rid, r, target, union) {
      const egoG = this.gender(ego);
      const tG = this.gender(target);
      const t = r.term;
      // 부모·조부모의 다른 배우자
      if (r.path && r.path.down === 0) {
        const base = t.replace(/^(외|진외)/, '');
        if (tG === 'F') {
          if (union.type === '첩') return { term: `서${base.replace(/부$/, '모')}`, alt: null, detail: `${r.alt ?? t}의 첩` };
          const own = this.ownAncestorUnion(ego, rid);
          // 첩의 소생에게 아버지의 정실은 적모(嫡母)다.
          if (base === '부' && own?.type === '첩') return { term: '적모', alt: '큰어머니', detail: '아버지의 정실 부인' };
          const earlier = own && union.order < own.order;
          if (base === '부') return earlier
            ? { term: '전모', alt: '선모(先母)', detail: '아버지의 앞선 정실 부인' }
            : { term: '계모', alt: null, detail: '아버지의 뒤 부인' };
          return { term: `${earlier ? '전' : '계'}${base.replace(/부$/, '모')}`, alt: null, detail: `${r.alt ?? t}의 다른 부인` };
        }
        return { term: base === '모' ? '계부' : `계${base.replace(/모$/, '부')}`, alt: '의부', detail: `${r.alt ?? t}의 다른 남편` };
      }
      // 형제자매의 배우자
      if (r.path && r.path.down === 1 && r.path.up === 1) {
        const older = this.isOlder(rid, ego);
        if (egoG === 'M') {
          if (tG === 'F') return { term: older ? '형수' : '제수', alt: older ? '아주머니' : '계수', detail: null };
          return { term: older ? '자형' : '매부', alt: older ? '매형' : '매제', detail: null };
        }
        if (tG === 'F') return { term: '올케', alt: older ? '새언니' : null, detail: null };
        return { term: older ? '형부' : '제부', alt: null, detail: null };
      }
      const table = [
        [/^(백|숙)부$/, (m) => `${m[1]}모`],
        [/^백숙부$/, () => '백숙모'],
        [/^(.*)숙$/, (m) => `${m[1]}숙모`],
        [/^(.*)조부$/, (m) => `${m[1]}조모`],
        [/^(.*)고모$/, (m) => `${m[1]}고모부`],
        [/^이모$/, () => '이모부'],
        [/^외숙$/, () => '외숙모'],
        [/^아들$/, () => '며느리'],
        [/^딸$/, () => '사위'],
        [/^(.*)손자$/, (m) => `${m[1]}손부`],
        [/^(.*)손녀$/, (m) => `${m[1]}손서`],
        [/^(.*)대손$/, (m) => `${m[1]}대손부`],
        [/^조카$/, () => '질부'],
        [/^질녀$/, () => '질서'],
        [/^(.*)질$/, (m) => `${m[1]}질부`],
        [/^(.*)질녀$/, (m) => `${m[1]}질서`],
        [/^(.*)형$/, (m) => `${m[1]}형수`],
        [/^(.*)제$/, (m) => `${m[1]}제수`],
        [/^(.*)손$/, (m) => `${m[1]}손부`],
        [/^(.*종)자$/, (m) => `${m[1]}자형`],
        [/^(.*종)매$/, (m) => `${m[1]}매부`],
      ];
      for (const [re, fn] of table) {
        const mm = t.match(re);
        if (mm) {
          const term = fn(mm);
          const alt = { 백모: '큰어머니', 숙모: '작은어머니', 며느리: '자부(子婦)', 사위: '서(壻)', 외숙모: '외삼촌댁' }[term] ?? null;
          return { term, alt, detail: `${t}의 ${tG === 'F' ? '아내' : '남편'}` };
        }
      }
      return { term: `${t}의 ${tG === 'F' ? '아내' : '남편'}`, alt: null, detail: null };
    }

    // ego의 직계 조상 계열에서 rid가 맺은 혼인 중 ego 쪽 혈통이 이어지는 혼인
    ownAncestorUnion(ego, rid) {
      let cur = ego;
      const seen = new Set();
      while (cur && !seen.has(cur)) {
        seen.add(cur);
        const u = this.m.unions.get(this.m.get(cur).parentUnion);
        if (!u) return null;
        if (u.husband === rid || u.wife === rid) return u;
        cur = u.husband;
      }
      return null;
    }

    // 배우자 S의 혈족 target (S 기준 관계 r)
    spouseRelative(egoG, sid, target, r) {
      const t = r.term;
      const say = r.alt && /^[가-힣]+$/.test(r.alt) && r.path.up + r.path.down <= 2 ? r.alt : t;
      const base = t.replace(/^이(복|부)/, '');
      if (egoG === 'M') {
        // 아내 입장의 호칭(오빠·언니 등)을 남편 입장의 인척 호칭으로 바꾼다.
        const map = { 부: ['장인', '빙부'], 모: ['장모', '빙모'], 오빠: ['처남', null], 남동생: ['처남', null], 오라비: ['처남', null],
          형제: ['처남', null], 언니: ['처형', null], 여동생: ['처제', null], 자매: ['처형제', null] };
        if (map[base]) return { term: map[base][0], alt: map[base][1], detail: `아내의 ${say}` };
        if (r.path.up === 0 && r.path.down === 1) return { term: t === '딸' ? '의붓딸' : '의붓아들', alt: '전실 소생', detail: `아내의 ${say}` };
        if (base === '조카' || base === '질녀') return { term: `처${base}`, alt: null, detail: `아내의 ${say}` };
        return { term: `처${t}`, alt: null, detail: `아내의 ${say}` };
      }
      const map = { 부: ['시아버지', '시부'], 모: ['시어머니', '시모'], 형: ['아주버니', '시숙'], 아우: ['시동생', '시숙'],
        형제: ['시숙', null], 누나: ['시누이', '형님'], 누이동생: ['시누이', '아가씨'], 누이: ['시누이', null], 자매: ['시누이', null] };
      if (map[base]) return { term: map[base][0], alt: map[base][1], detail: `남편의 ${say}` };
      if (r.path.up === 0 && r.path.down === 1) return { term: t === '딸' ? '의붓딸' : '의붓아들', alt: '전처 소생', detail: `남편의 ${say}` };
      return { term: `시${t}`, alt: null, detail: `남편의 ${say}` };
    }

    // 배우자 S의 다른 배우자(target이 S와 맺은 혼인: otherUnion)
    coSpouse(ego, s, otherUnion) {
      if (this.gender(ego) === 'M') return { term: '아내의 다른 남편', alt: null, detail: null };
      if (otherUnion.type === '첩') return { term: '남편의 첩', alt: '소실', detail: null };
      if (s.union.type === '첩') return { term: '정실 부인', alt: '큰댁', detail: '남편의 정실' };
      return otherUnion.order < s.union.order
        ? { term: '전처', alt: '남편의 선실(先室)', detail: '남편의 앞선 부인' }
        : { term: '후처', alt: '남편의 후실(後室)', detail: '남편의 뒤 부인' };
    }

    // 배우자 S의 혈족 R의 배우자 target
    spouseRelativeSpouse(egoG, sid, rid, r, target, union) {
      const isSibling = r.path.up === 1 && r.path.down === 1;
      const rG = this.gender(rid);
      if (isSibling) {
        if (egoG === 'M') return rG === 'M'
          ? { term: '처남댁', alt: null, detail: '아내의 남자 형제의 아내' }
          : { term: '동서', alt: null, detail: '아내의 자매의 남편' };
        return rG === 'M'
          ? { term: '동서', alt: null, detail: '남편의 형제의 아내' }
          : { term: '시누이 남편', alt: null, detail: '남편의 자매의 남편' };
      }
      if (r.path.down === 0) {
        // 배우자의 부모·조부모의 다른 배우자: 배우자 입장의 호칭(전모·계모…)에 처/시를 붙인다.
        const t = this.spouseOfBlood(sid, rid, r, target, union);
        return { term: `${egoG === 'M' ? '처' : '시'}${t.term}`, alt: null,
          detail: `${egoG === 'M' ? '아내' : '남편'}의 ${t.term}` };
      }
      const rel = this.spouseRelative(egoG, sid, rid, r).term;
      return { term: `${rel}의 ${this.gender(target) === 'F' ? '아내' : '남편'}`, alt: null, detail: null };
    }

    // 부모·자녀·배우자 관계를 따라 가장 짧은 경로를 풀어 쓴다.
    describe(ego, target) {
      const prev = new Map([[ego, null]]);
      const queue = [ego];
      while (queue.length) {
        const cur = queue.shift();
        if (cur === target) break;
        const edges = [];
        const f = this.m.father(cur), mo = this.m.mother(cur);
        if (f) edges.push([f, '아버지']);
        if (mo) edges.push([mo, '어머니']);
        for (const c of this.m.children(cur)) edges.push([c, this.gender(c) === 'F' ? '딸' : '아들']);
        for (const s of this.m.spouses(cur)) edges.push([s.id, this.gender(s.id) === 'F' ? '아내' : '남편']);
        for (const [n, label] of edges) {
          if (!prev.has(n)) { prev.set(n, [cur, label]); queue.push(n); }
        }
      }
      if (!prev.has(target)) return null;
      const labels = [];
      for (let cur = target; prev.get(cur); cur = prev.get(cur)[0]) labels.unshift(prev.get(cur)[1]);
      return labels.join('의 ');
    }
  }

  function lexLess(a, b) {
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return a[i] < b[i];
    }
    return false;
  }

  G.Kinship = Kinship;
})(globalThis.Genealogy = globalThis.Genealogy || {});
