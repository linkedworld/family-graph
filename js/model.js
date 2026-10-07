// 가계 데이터(window.GENEALOGY_DATA)를 탐색 가능한 그래프 모델로 만든다.
//
// - 혼인(union)의 한쪽 배우자가 null이면, 자녀가 있는 경우 반드시 존재해야 하는
//   상대(대개 어머니)를 '미상' 인물로 자동 생성한다.
// - lineageGaps(중간 세대가 기록에 없는 직계)는 빠진 세대 수만큼 '미상' 인물을 생성해
//   조상과 후손을 이어 준다.
// 서버 없이 file://로도 열리도록 모듈 대신 전역 Genealogy 객체에 등록한다.
(function (G) {
  'use strict';

  const UNKNOWN_NAME = '미상';

  function buildModel(data) {
    const persons = new Map();
    const unions = new Map();

    for (const raw of data.persons) {
      persons.set(raw.id, { ...raw, parentUnion: null, spouseUnions: [] });
    }

    const addPlaceholder = (id, gender, note, extra = {}) => {
      const p = {
        id, name: null, gender, placeholder: true, note,
        parentUnion: null, spouseUnions: [], ...extra,
      };
      persons.set(id, p);
      return p;
    };

    const addUnion = (u) => {
      const union = { type: '정실', order: 1, children: [], ...u };
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
    }

    get(id) { return this.persons.get(id); }

    father(id) {
      const u = this.unions.get(this.get(id)?.parentUnion);
      return u?.husband ?? null;
    }

    mother(id) {
      const u = this.unions.get(this.get(id)?.parentUnion);
      return u?.wife ?? null;
    }

    parents(id) {
      return [this.father(id), this.mother(id)].filter(Boolean);
    }

    children(id) {
      const out = [];
      for (const uid of this.get(id).spouseUnions) out.push(...this.unions.get(uid).children);
      return out;
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
