// 임시 시험 데이터(조사 결과로 바꿀 예정)
window.GENEALOGY_EVENTS = {
  events: [
    { id: 'imjin', name: '임진왜란', hanja: '壬辰倭亂', start: 1592, end: 1598, type: '전쟁', summary: '시험', participants: [{ ds: 'yi-sunsin', id: 'yi_sunsin', role: '삼도수군통제사' }, { ds: 'yi-sunsin-muui', id: 'yi_sunsin_m', role: '중위장' }, { ds: 'yi-wonik', id: 'yi_wonik', role: '체찰사' }], external: [{ name: '선조', hanja: '宣祖', role: '임금' }], sources: [{ title: 't', url: 'https://example.org' }] },
    { id: 'noryang', name: '노량해전', hanja: '露梁海戰', start: 1598, type: '전투', summary: '시험', participants: [{ ds: 'yi-sunsin', id: 'yi_sunsin', role: '전사' }, { ds: 'yi-sunsin-muui', id: 'yi_sunsin_m', role: '지휘 이어받음' }], sources: [{ title: 't', url: 'https://example.org' }] },
    { id: 'daedong', name: '대동법', start: 1608, type: '정책·제도', summary: '시험', participants: [{ ds: 'yi-wonik', id: 'yi_wonik', role: '건의' }], sources: [{ title: 't', url: 'https://example.org' }] },
    { id: 'gimyo', name: '기묘사화', start: 1519, type: '사화·옥사', summary: '시험', participants: [{ ds: 'yi-hwang', id: 'yi_hwang', role: '시험' }], sources: [{ title: 't', url: 'https://example.org' }] },
    { id: 'sinyu', name: '신유박해', start: 1801, type: '종교', summary: '시험', participants: [{ ds: 'jeong-yakyong', id: 'jeong_yakyong', role: '유배' }, { ds: 'jeong-yakyong', id: 'jeong_yakjong', role: '순교' }], sources: [{ title: 't', url: 'https://example.org' }] },
  ],
  relations: [{ from: 'noryang', to: 'imjin', type: '일부' }, { from: 'imjin', to: 'daedong', type: '원인' }],
};
