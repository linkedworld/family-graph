#!/usr/bin/env node
// 가계도 데이터 검사 도구.
//   node tools/check-dataset.cjs <가계도 id> [--list]
// 데이터를 읽어 모델을 만들고(참조 오류는 여기서 드러남), 주인공 기준으로 모든 인물의 호칭·촌수를 계산한다.
//   - 방계 혈족이 10촌을 넘으면 경고 (직계 조상·후손은 촌수와 무관하게 허용)
//   - 관계를 계산할 수 없는 인물, 출처가 없는 인물을 경고
// --list 를 붙이면 인물별 호칭·촌수 표를 출력한다.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const dataFiles = [...html.matchAll(/<script src="(data\/[^"?]+\.js)(?:\?[^"]*)?"><\/script>/g)].map((m) => m[1]);

const ctx = vm.createContext({});
ctx.window = ctx;
ctx.globalThis = ctx;
for (const f of [...dataFiles, 'js/model.js', 'js/kinship.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
}

const [id, flag] = process.argv.slice(2);
const sets = ctx.GENEALOGY_DATASETS || [];
if (!id) {
  console.log('가계도 id:', sets.map((d) => d.meta.id).join(', '));
  process.exit(0);
}
const data = sets.find((d) => d.meta.id === id);
if (!data) {
  console.error(`가계도 "${id}"가 없습니다. 있는 것: ${sets.map((d) => d.meta.id).join(', ')}`);
  process.exit(1);
}

const { buildModel, Kinship } = ctx.Genealogy;
const m = buildModel(data);
const k = new Kinship(m);
const ego = data.meta.subject;

const problems = [];
const rows = [];
const counts = { blood: 0, spouse: 0, affinal: 0, sadon: 0, distant: 0, none: 0, placeholder: 0 };
for (const [pid, p] of m.persons) {
  const r = k.relation(ego, pid);
  if (p.placeholder) counts.placeholder++;
  else if (counts[r.kind] != null) counts[r.kind]++;
  rows.push([m.displayName(pid), pid, r.kind, r.chon ?? '-', r.term, r.detail || '']);
  if (r.kind === 'none') problems.push(`관계 없음: ${pid}`);
  if (r.kind === 'blood' && r.path && r.path.up > 0 && r.path.down > 0 && r.chon > 10) {
    problems.push(`방계 10촌 초과: ${pid} (${r.term}, ${r.chon}촌)`);
  }
  if (!p.placeholder) {
    if (!p.sources || !p.sources.length) problems.push(`출처 없음: ${pid}`);
    for (const s of p.sources || []) if (!data.meta.sources[s]) problems.push(`없는 출처 키 ${s}: ${pid}`);
  }
}

if (flag === '--list') {
  for (const r of rows) console.log(r.map(String).join('\t'));
  console.log('');
}
const maxChon = Math.max(0, ...rows.filter((r) => r[2] === 'blood').map((r) => Number(r[3]) || 0));
console.log(`${data.meta.title}: 인물 ${m.persons.size}명 (혈족 ${counts.blood}, 배우자 ${counts.spouse}, 인척 ${counts.affinal}, ` +
  `사돈 ${counts.sadon}, 기타 ${counts.distant}, 자동 생성 미상 ${counts.placeholder}), 혈족 최대 ${maxChon}촌`);
const byChon = {};
for (const r of rows) if (r[2] === 'blood') byChon[r[3]] = (byChon[r[3]] || 0) + 1;
console.log('혈족 촌수별 인원:', Object.entries(byChon).sort((a, b) => a[0] - b[0]).map(([c, n]) => `${c}촌 ${n}`).join(', '));
if (problems.length) {
  console.log(`\n문제 ${problems.length}건:`);
  for (const p of problems) console.log(' - ' + p);
  process.exit(2);
}
console.log('문제 없음');
