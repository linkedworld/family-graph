#!/usr/bin/env python3
# 조사 결과(JSON 여러 개)를 합쳐 data/events.js를 만든다.
#   python3 tools/build-events.py out.js a.json b.json ...
# 집안 사이를 잇는 보정(같은 사람이 다른 가계도에 있는 경우, 같은 사건의 상위·하위 관계)은 아래 PATCH에 둔다.
import json, sys

out, *inputs = sys.argv[1:]
events, relations = [], []
for f in inputs:
    d = json.load(open(f, encoding='utf-8'))
    events += d['events']; relations += d['relations']
by = {e['id']: e for e in events}
assert len(by) == len(events), '사건 id 중복'

def move_external_to_participant(ev_id, ext_name, ds, pid, role=None):
    e = by.get(ev_id)
    if not e: return
    ext = [x for x in e.get('external', []) if x['name'] == ext_name]
    e['external'] = [x for x in e.get('external', []) if x['name'] != ext_name]
    if not any(p['ds'] == ds and p['id'] == pid for p in e['participants']):
        e['participants'].append({'ds': ds, 'id': pid, 'role': role or (ext[0]['role'] if ext else '')})

def add_rel(a, b, t, note):
    if a in by and b in by and not any(r['from'] == a and r['to'] == b for r in relations):
        relations.append({'from': a, 'to': b, 'type': t, 'note': note})

# ── 집안 사이 잇기 ──
move_external_to_participant('gihae_yesong', '허목', 'yi-wonik', 'heo_mok', '남인, 삼년설')
add_rel('gihae_yesong', 'yesong', '일부', '예송 논쟁의 첫 번째(기해예송)')
add_rel('byeongja_horan', 'boguildo_eungeo', '원인', '인조의 항복 소식을 듣고 은거')

for f in sys.argv[0:0]: pass
events.sort(key=lambda e: (e['start'], e.get('end') or e['start']))
js = ('// 인물과 사건(events.html) 데이터. tools/build-events.py가 조사 결과(JSON)를 합쳐 만든다.\n'
      '// participants: 가계도 인물({ ds: 가계도 id, id: 인물 id, role }), external: 가계도 밖 주요 인물.\n'
      '// relations: 사건 사이의 관계(원인·결과로 이어짐·일부·영향·대립·계승). from → to 방향.\n'
      'window.GENEALOGY_EVENTS = ' + json.dumps({'events': events, 'relations': relations}, ensure_ascii=False, indent=1) + ';\n')
open(out, 'w', encoding='utf-8').write(js)
print(len(events), 'events', len(relations), 'relations')
