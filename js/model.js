// 가계 데이터(window.GENEALOGY_DATASETS의 한 항목)를 탐색 가능한 그래프 모델로 만든다.
//
// - 혼인(union)의 한쪽 배우자가 null이면, 자녀가 있는 경우 반드시 존재해야 하는
//   상대(대개 어머니)를 '미상' 인물로 자동 생성한다.
// - lineageGaps(중간 세대가 기록에 없는 직계)는 빠진 세대 수만큼 '미상' 인물을 생성해
//   조상과 후손을 이어 준다.
// - adoptions(양자·출계)는 생가 혼인(parentUnion)과 별도로 양가 혼인(adoptiveUnion)을 기록한다.
//   부모·자녀를 물을 때 mode로 어느 쪽을 볼지 고른다.
//     'legal': 족보의 계통(양자는 양가 기준). 기본값.
//     'birth': 혈연(생가 기준).
//     'all'  : 둘 다(자녀 목록에서만 의미가 있음).
// 서버 없이 file://로도 열리도록 모듈 대신 전역 Genealogy 객체에 등록한다.
(function (G) {
  'use strict';

  const UNKNOWN_NAME = '미상';

  function buildModel(data) {
    const persons = new Map();
    const unions = new Map();

    for (const raw of data.persons) {
      persons.set(raw.id, { ...raw, parentUnion: null, adoptiveUnion: null, spouseUnions: [] });
    }

    const addPlaceholder = (id, gender, note, extra = {}) => {
      const p = {
        id, name: null, gender, placeholder: true, note,
        parentUnion: null, adoptiveUnion: null, spouseUnions: [], ...extra,
      };
      persons.set(id, p);
      return p;
    };

    const addUnion = (u) => {
      const union = { type: '정실', order: 1, children: [], adoptees: [], ...u };
      unions.set(union.id, union);
      for (const pid of [union.husband, union.wife]) {
        if (pid) must(persons, pid, `union ${union.id}`).spouseUnions.push(union.id);
      }
      for (const cid of union.children) {
        const child = must(persons, cid, `union ${union.id} child`);
        if (child.parentUnion) throw new Error(`${cid} has two parent unions`);
        child.parentUnion = union.id;
      }
      return union;
    };

    for (const raw of data.unions) {
      const u = { ...raw, children: [...(raw.children || [])] };
      // 자녀가 있는데 부/모 한쪽이 기록되지 않았다면 그 사람은 반드시 존재한다.
      if (u.children.length > 0) {
        if (!u.wife) {
          u.wife = addPlaceholder(`${u.id}__wife`, 'F', '기록 없음 – 관계상 반드시 존재하는 인물').id;
          u.placeholderSpouse = true;
        }
        if (!u.husband) {
          u.husband = addPlaceholder(`${u.id}__husband`, 'M', '기록 없음 – 관계상 반드시 존재하는 인물').id;
          u.placeholderSpouse = true;
        }
      }
      addUnion(u);
    }

    for (const gap of data.lineageGaps || []) {
      const anc = must(persons, gap.ancestor, `gap ${gap.id}`);
      const desc = must(persons, gap.descendant, `gap ${gap.id}`);
      if (desc.parentUnion) throw new Error(`gap ${gap.id}: descendant already has parents`);
      let parent = anc;
      for (let i = 1; i < gap.generations; i++) {
        const ph = addPlaceholder(`${gap.id}__${i}`, 'M',
          `기록 없음 – ${anc.name ?? anc.id}의 ${i}대손 (${gap.confidence || '추정'}, 부계 직계 가정)`,
          { gap: gap.id, gen: anc.gen != null ? anc.gen + i : undefined });
        addUnion({ id: `${gap.id}__u${i - 1}`, husband: parent.id, wife: null,
          children: [ph.id], gap: gap.id });
        parent = ph;
      }
      addUnion({ id: `${gap.id}__u${gap.generations - 1}`, husband: parent.id, wife: null,
        children: [desc.id], gap: gap.id });
    }

    for (const ad of data.adoptions || []) {
      const child = must(persons, ad.child, `adoption ${ad.id}`);
      const union = unions.get(ad.union);
      if (!union) throw new Error(`adoption ${ad.id}: unknown union "${ad.union}"`);
      if (!child.parentUnion) throw new Error(`adoption ${ad.id}: ${ad.child} has no birth parents`);
      if (child.adoptiveUnion) throw new Error(`adoption ${ad.id}: ${ad.child} adopted twice`);
      if (union.id === child.parentUnion) throw new Error(`adoption ${ad.id}: same as birth parents`);
      child.adoptiveUnion = union.id;
      child.adoption = ad;
      union.adoptees.push(child.id);
    }

    return new Model(data.meta || {}, persons, unions);
  }

  function must(map, id, ctx) {
    const v = map.get(id);
    if (!v) throw new Error(`unknown person "${id}" referenced by ${ctx}`);
    return v;
  }

  class Model {
    constructor(meta, persons, unions) {
      this.meta = meta;
      this.persons = persons;
      this.unions = unions;
      this.hasAdoptions = [...unions.values()].some((u) => u.adoptees.length > 0);
    }

    get(id) { return this.persons.get(id); }

    // 부모가 되는 혼인. 양자는 'legal'에서 양가, 'birth'에서 생가 혼인을 돌려준다.
    parentUnionOf(id, mode = 'legal') {
      const p = this.get(id);
      if (!p) return null;
      return (mode === 'legal' && p.adoptiveUnion) || p.parentUnion;
    }

    father(id, mode = 'legal') {
      return this.unions.get(this.parentUnionOf(id, mode))?.husband ?? null;
    }

    mother(id, mode = 'legal') {
      return this.unions.get(this.parentUnionOf(id, mode))?.wife ?? null;
    }

    parents(id, mode = 'legal') {
      return [this.father(id, mode), this.mother(id, mode)].filter(Boolean);
    }

    // 혼인 하나의 자녀. 'legal'은 출계한 자녀를 빼고 들어온 양자를 더한다.
    unionChildren(u, mode = 'legal') {
      if (mode === 'birth') return u.children;
      if (mode === 'all') return [...u.children, ...u.adoptees];
      return [...u.children.filter((c) => !this.get(c).adoptiveUnion), ...u.adoptees];
    }

    children(id, mode = 'legal') {
      const out = [];
      for (const uid of this.get(id).spouseUnions) out.push(...this.unionChildren(this.unions.get(uid), mode));
      return out;
    }

    isAdopted(id) {
      return !!this.get(id).adoptiveUnion;
    }

    // 한 부모의 자녀를 태어난 순서대로. 족보처럼 아버지의 자녀 전체(부인이 여럿이어도)를 함께 센다.
    // 순서 근거: 기록된 출생 순서(sibIndex) → 출생 연도 → 데이터에 적힌 순서.
    orderedChildren(parentId, mode = 'legal') {
      const kids = this.children(parentId, mode);
      const sib = (c) => this.get(c).sibIndex;
      const year = (c) => { const y = parseInt(this.get(c).birth, 10); return Number.isNaN(y) ? null : y; };
      // 자녀마다 하나의 순서 값을 정한 뒤 그 값으로 정렬한다(근거가 섞여 있어도 순서가 일관되도록).
      const hasSib = kids.some((c) => sib(c) != null);
      const val = new Map();
      for (const c of kids) {
        if (hasSib) {
          if (sib(c) != null) { val.set(c, sib(c)); continue; }
          const y = year(c);
          if (y == null) continue;
          // 생년만 있으면, 출생 순서와 생년이 모두 있는 형제들 사이에 끼워 넣는다.
          const ref = kids.filter((k) => sib(k) != null && year(k) != null);
          const later = ref.filter((k) => year(k) > y).map(sib);
          const earlier = ref.filter((k) => year(k) <= y).map(sib);
          if (later.length) val.set(c, Math.min(...later) - 0.5);
          else if (earlier.length) val.set(c, Math.max(...earlier) + 0.5);
        } else if (year(c) != null) {
          val.set(c, year(c));
        }
      }
      // 근거가 없는 자녀는 데이터에서 바로 앞 형제 다음에 둔다.
      let prev = null, k = 0;
      for (const c of kids) {
        if (val.has(c)) { prev = val.get(c); k = 0; continue; }
        const next = kids.slice(kids.indexOf(c) + 1).find((x) => val.has(x));
        const base = prev != null ? prev : (next != null ? val.get(next) - 1 : 0);
        val.set(c, base + 0.001 * ++k);
      }
      const pos = new Map(kids.map((c, i) => [c, i]));
      return [...kids].sort((a, b) => (val.get(a) - val.get(b)) || (pos.get(a) - pos.get(b)));
    }

    // '1남', '2녀'처럼 아들·딸을 따로 센 출생 순서. 부모가 없거나 성별을 모르면 null.
    birthOrder(id) {
      const parent = this.father(id) || this.mother(id);
      const g = this.get(id).gender;
      if (!parent || (g !== 'M' && g !== 'F')) return null;
      const same = this.orderedChildren(parent).filter((c) => this.get(c).gender === g);
      const n = same.indexOf(id) + 1;
      if (n < 1) return null;
      return { n, total: same.length, label: `${n}${g === 'M' ? '남' : '녀'}` };
    }

    spouses(id) {
      const out = [];
      for (const uid of this.get(id).spouseUnions) {
        const u = this.unions.get(uid);
        const other = u.husband === id ? u.wife : u.husband;
        if (other) out.push({ id: other, union: u });
      }
      return out;
    }

    // 이름·본관 어느 것도 전하지 않는 인물. '미상 숨기기' 옵션의 대상이다.
    isUnknown(id) {
      const p = this.get(id);
      return !p.name && !p.clan;
    }

    displayName(id) {
      const p = this.get(id);
      if (p.name) return p.name;
      if (p.clan) return p.clan;
      return UNKNOWN_NAME;
    }

    // 이름은 전하지 않지만 본관 등으로 식별되는 인물(예: 영양 김씨).
    isNameless(id) {
      const p = this.get(id);
      return !p.name && !!p.clan;
    }
  }

  G.UNKNOWN_NAME = UNKNOWN_NAME;
  G.buildModel = buildModel;
  G.Model = Model;
})(globalThis.Genealogy = globalThis.Genealogy || {});
