import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

// 인물 계보의 족보식 쪽 나눔(js/pagebook.js). 브라우저처럼 스크립트를 순서대로 실행한다.
const DATA_FILES = ['data/yi-hwang.js', 'data/yi-i.js', 'data/yi-sunsin.js', 'data/yi-sunsin-muui.js', 'data/yi-wonik.js', 'data/jeong-yakyong.js', 'data/geumcheon-kang.js'];
const ctx = vm.createContext({ console });
ctx.globalThis = ctx;
ctx.window = ctx;
for (const f of ['vendor/dagre.min.js', ...DATA_FILES, 'js/model.js', 'js/kinship.js', 'js/layout.js', 'js/pagebook.js']) {
  vm.runInContext(readFileSync(new URL(`../${f}`, import.meta.url), 'utf8'), ctx, { filename: f });
}
const { paginateBook, buildModel, buildView, layout, coreSet, CARD } = ctx.Genealogy;

const H = 100;
const GAP = 60;
// 시험용 칸: 이름, 세대(줄), 가로 위치
const block = (id, row, x, width = 100) => ({ id, order: [id], x, y: row * (H + GAP), width });
const opts = (o = {}) => ({ cardH: H, innerW: 450, innerH: 6 * H + 5 * GAP, rows: 6, trunkX: null, left0: 0, top0: 0, ...o });
const union = (parent, ...kids) => ({ partners: [parent], children: kids.map((id) => ({ id })) });

test('외줄 10대: 둘째 장 첫 줄에 첫 장의 6대째를 다시 싣는다', () => {
  const blocks = Array.from({ length: 10 }, (_, i) => block(`g${i}`, i, 0));
  const unions = Array.from({ length: 9 }, (_, i) => union(`g${i}`, `g${i + 1}`));
  const { pages, realPage } = paginateBook(blocks, unions, opts());
  assert.equal(pages.length, 2);
  assert.deepEqual([...pages[0].ids], ['g0', 'g1', 'g2', 'g3', 'g4', 'g5']);
  assert.deepEqual([...pages[1].ids], ['g6', 'g7', 'g8', 'g9']);
  assert.deepEqual([...pages[1].ghosts.keys()], ['g5']);
  assert.equal(realPage.get('g5'), 0);
  // 사본 줄이 판면 맨 위에 온다.
  assert.equal(blocks[5].y - H / 2 + pages[1].dy, 0);
});

test('넓은 가지: 자녀 가지로 쪼개고 쪼갠 장마다 부모 사본을 세운다', () => {
  // 부모 r 아래 자녀 넷, 자녀마다 손자 둘. 한 장에는 자녀 가지 둘까지 들어간다.
  const blocks = [block('r', 0, 445)];
  const unions = [];
  const kids = [];
  for (let i = 0; i < 4; i++) {
    const k = `k${i}`;
    kids.push(k);
    blocks.push(block(k, 1, 115 + i * 220));
    blocks.push(block(`${k}a`, 2, 60 + i * 220), block(`${k}b`, 2, 170 + i * 220));
    unions.push(union(k, `${k}a`, `${k}b`));
  }
  unions.push(union('r', ...kids));
  const { pages, realPage } = paginateBook(blocks, unions, opts({ innerW: 500 }));
  // 형제 가지(자녀와 그 손자)는 한 장에 함께 있다.
  for (const k of kids) {
    assert.equal(realPage.get(k), realPage.get(`${k}a`));
    assert.equal(realPage.get(k), realPage.get(`${k}b`));
  }
  // r의 실제 칸은 한 장에만, 나머지 장에는 사본으로 선다.
  const real = pages.filter((p) => p.ids.has('r'));
  const ghost = pages.filter((p) => p.ghosts.has('r'));
  assert.equal(real.length, 1);
  assert.equal(real.length + ghost.length, pages.length);
  assert.equal(pages.length, 2);
  // 사본은 판면 밖에 놓이지 않는다.
  for (const p of ghost) {
    const x = 445 + p.ghosts.get('r') + p.dx;
    assert.ok(x - 50 >= -0.5 && x + 50 <= 500.5, `사본 x=${x}`);
  }
});

test('접힌 형제 줄은 쪽 사이로 가르지 않는다', () => {
  // g0~g4 외줄, g4 아래 접힌 형제 넷이 두 줄(5·6줄째)로 쌓인다.
  const blocks = Array.from({ length: 5 }, (_, i) => block(`g${i}`, i, 0));
  const unions = Array.from({ length: 4 }, (_, i) => union(`g${i}`, `g${i + 1}`));
  const fold = ['s0', 's1', 's2', 's3'];
  fold.forEach((id, i) => blocks.push(block(id, 5 + (i % 2), Math.floor(i / 2) * 120)));
  unions.push({ partners: ['g4'], children: fold.map((id) => ({ id, spineX: -20 })) });
  const { realPage } = paginateBook(blocks, unions, opts());
  const at = fold.map((id) => realPage.get(id));
  assert.ok(at.every((p) => p === at[0]), `접힌 형제 장: ${at}`);
});

// 실제 가계도 전부를 엔진으로 배치해 쪽 나눔의 불변식을 본다.
for (const data of ctx.GENEALOGY_DATASETS) {
  test(`${data.meta.id}: 족보식 쪽 나눔 불변식`, () => {
    const model = buildModel(data);
    let root = data.meta.subject;
    while (model.father(root)) root = model.father(root);
    const core = coreSet(model, root);
    const view = buildView(model, { hideUnknown: false, showInlaws: true, core, keep: new Set(model.persons.keys()) });
    view.fold = true;
    const lay = layout(view);
    const blocks = lay.blocks.filter((b) => b.order.some((id) => lay.pos.has(id)));
    const rowsH = 6 * CARD.h + 5 * 96;
    const mm = Math.max(rowsH / 145, Math.max(...blocks.map((b) => b.width)) / 237);
    const o = { cardH: CARD.h, innerW: 237 * mm, innerH: rowsH, rows: 6, left0: 30 * mm, top0: 35 * mm,
      trunkX: lay.pos.get(data.meta.subject).x };
    const { pages, realPage } = paginateBook(blocks, lay.unions, o);

    // 모든 칸은 정확히 한 장에 실제로 실린다.
    const count = new Map();
    for (const p of pages) for (const id of p.ids) count.set(id, (count.get(id) || 0) + 1);
    for (const b of blocks) for (const id of b.order) assert.equal(count.get(id), 1, `${id} 실린 횟수`);
    // 실제 칸은 판면 가로 안에 든다.
    for (const p of pages) {
      for (const id of p.ids) {
        const b = blocks.find((x) => x.order.includes(id));
        if (b.width > o.innerW) continue;
        const l = b.x - b.width / 2 + p.dx;
        assert.ok(l >= o.left0 - 1 && l + b.width <= o.left0 + o.innerW + 1, `${id} 가로 ${l}`);
      }
    }
    // 사본은 그 장에 자녀가 있는 사람이고, 실제 칸은 다른 장에 있다.
    const kids = new Map();
    for (const un of lay.unions) for (const c of un.children) {
      if (!kids.has(un.partners[0])) kids.set(un.partners[0], []);
      kids.get(un.partners[0]).push(c.id);
    }
    for (const [i, p] of pages.entries()) {
      for (const id of p.ghosts.keys()) {
        assert.notEqual(realPage.get(id), i, `${id} 사본과 실제가 같은 장`);
        // 이 화면은 부부를 한 칸으로 묶지 않으므로, 같은 칸의 누구에게든 자녀가 이 장에 있으면 된다.
        const b = blocks.find((x) => x.order.includes(id));
        const ks = b.order.flatMap((m) => kids.get(m) || []).filter((k) => p.ids.has(k) || p.ghosts.has(k));
        assert.ok(ks.length, `${id} 사본 아래 자녀 없음`);
      }
    }
    // 기준 인물은 판면 가로 가운데에 선다.
    const ego = pages[realPage.get(data.meta.subject)];
    assert.ok(Math.abs(o.trunkX + ego.dx - (o.left0 + o.innerW / 2)) < 1);
  });
}
