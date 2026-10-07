// 충무공 이순신 가계 데이터 목업. 형식은 README의 '데이터 형식' 참고.
(window.GENEALOGY_DATASETS = window.GENEALOGY_DATASETS || []).push({
  "meta": {
    "id": "yi-sunsin",
    "title": "충무공 이순신(李舜臣) 가계도",
    "subject": "yi_sunsin",
    "clan": "덕수 이씨(德水李氏)",
    "description": "충무공 이순신을 중심으로 증조부 이거부터 손자 대, 외가(초계 변씨)·처가(상주 방씨)·사돈까지 정리한 목업 데이터.",
    "updated": "2026-10-07",
    "sources": {
      "wiki_sunsin": { "title": "위키백과 「이순신」 – 가계, 충무공 가계", "url": "https://ko.wikipedia.org/wiki/이순신" }
    }
  },

  "persons": [
    { "id": "yi_geo", "name": "이거", "hanja": "李琚", "gender": "M", "clan": "덕수 이씨",
      "title": "사헌부장령, 순천부사, 병조참의", "note": "이순신의 증조부.", "sources": ["wiki_sunsin"] },
    { "id": "yi_baengnok", "name": "이백록", "hanja": "李百祿", "gender": "M", "clan": "덕수 이씨",
      "title": "생원, 평시서 봉사", "note": "기묘사림. 이순신의 조부.", "sources": ["wiki_sunsin"] },
    { "id": "byeon_seong", "name": "변성", "hanja": "卞誠", "gender": "M", "clan": "초계 변씨", "sources": ["wiki_sunsin"] },
    { "id": "chogye_byeon_gm", "name": null, "gender": "F", "clan": "초계 변씨", "clanHanja": "草溪卞氏",
      "note": "이백록의 처, 변성의 딸.", "sources": ["wiki_sunsin"] },

    { "id": "yi_jeong", "name": "이정", "hanja": "李貞", "gender": "M", "clan": "덕수 이씨", "birth": "1511", "death": "1583",
      "title": "증 좌의정, 덕연부원군(德淵府院君)", "sources": ["wiki_sunsin"] },
    { "id": "byeon_surim", "name": "변수림", "hanja": "卞守琳", "gender": "M", "clan": "초계 변씨", "sources": ["wiki_sunsin"] },
    { "id": "chogye_byeon", "name": null, "gender": "F", "clan": "초계 변씨", "clanHanja": "草溪卞氏",
      "birth": "1515", "death": "1597", "title": "증 정경부인",
      "note": "이순신의 어머니, 변수림의 딸. 1588년 자녀에게 재산을 나눠 준 별급문기가 전함.", "sources": ["wiki_sunsin"] },

    { "id": "yi_huisin", "name": "이희신", "hanja": "李羲臣", "gender": "M", "clan": "덕수 이씨", "sibIndex": 1,
      "birth": "1535", "death": "1587", "title": "증 병조참판", "sources": ["wiki_sunsin"] },
    { "id": "kang_seon", "name": "강세온", "hanja": "姜世溫", "gender": "M", "clan": "진주 강씨", "sources": ["wiki_sunsin"] },
    { "id": "jinju_kang", "name": null, "gender": "F", "clan": "진주 강씨", "clanHanja": "晉州姜氏",
      "note": "이희신의 처, 강세온의 딸.", "sources": ["wiki_sunsin"] },
    { "id": "yi_roe", "name": "이뢰", "hanja": "李蕾", "gender": "M", "clan": "덕수 이씨", "birth": "1561", "death": "1648",
      "title": "선무원종공신 3등, 찰방", "sources": ["wiki_sunsin"] },
    { "id": "yi_bun", "name": "이분", "hanja": "李芬", "gender": "M", "clan": "덕수 이씨", "birth": "1566", "death": "1619",
      "title": "선무원종공신 3등, 병조정랑", "note": "임진왜란 때 숙부 이순신을 도움.", "sources": ["wiki_sunsin"] },
    { "id": "yi_beon", "name": "이번", "hanja": "李蕃", "gender": "M", "clan": "덕수 이씨", "birth": "1575", "death": "1668",
      "title": "선무원종공신 3등, 효릉참봉", "sources": ["wiki_sunsin"] },
    { "id": "yi_wan", "name": "이완", "hanja": "李莞", "gender": "M", "clan": "덕수 이씨", "birth": "1579", "death": "1627",
      "title": "의주부윤, 증 병조판서, 시호 강민(剛愍)",
      "note": "노량해전에서 숙부의 죽음을 숨기고 싸움을 이끎. 정묘호란 때 전사.", "sources": ["wiki_sunsin"] },

    { "id": "yi_yosin", "name": "이요신", "hanja": "李堯臣", "gender": "M", "clan": "덕수 이씨", "sibIndex": 2,
      "birth": "1542", "death": "1580", "title": "증 호조참판", "sources": ["wiki_sunsin"] },
    { "id": "cheongpung_kim", "name": null, "gender": "F", "clan": "청풍 김씨", "clanHanja": "淸風金氏",
      "note": "이요신의 처.", "sources": ["wiki_sunsin"] },
    { "id": "yi_bong", "name": "이봉", "hanja": "李菶", "gender": "M", "clan": "덕수 이씨", "birth": "1563", "death": "1650",
      "title": "선무원종공신 2등, 포도대장", "sources": ["wiki_sunsin"] },
    { "id": "yi_hae", "name": "이해", "hanja": "李荄", "gender": "M", "clan": "덕수 이씨", "birth": "1566", "death": "1645",
      "title": "선무원종공신 3등, 훈련원주부", "sources": ["wiki_sunsin"] },

    { "id": "yi_sunsin", "name": "이순신", "hanja": "李舜臣", "gender": "M", "clan": "덕수 이씨", "sibIndex": 3,
      "birth": "1545", "death": "1598", "courtesy": "여해(汝諧)",
      "title": "삼도수군통제사, 증 영의정, 시호 충무(忠武)",
      "note": "이정의 3남. 노량해전에서 전사.", "sources": ["wiki_sunsin"] },
    { "id": "bang_hong", "name": "방홍", "hanja": "方弘", "gender": "M", "clan": "온양 방씨", "title": "평창군수",
      "sources": ["wiki_sunsin"] },
    { "id": "bang_junggyu", "name": "방중규", "hanja": "方中規", "gender": "M", "clan": "온양 방씨", "title": "영동현감",
      "sources": ["wiki_sunsin"] },
    { "id": "bang_jin", "name": "방진", "hanja": "方震", "gender": "M", "clan": "온양 방씨", "birth": "1514",
      "title": "보성군수", "note": "사위 이순신의 무과 준비를 후원함.", "sources": ["wiki_sunsin"] },
    { "id": "sangju_bang", "name": null, "gender": "F", "clan": "상주 방씨", "clanHanja": "尙州方氏",
      "title": "정경부인", "note": "이순신의 부인, 방진의 딸(온양 방씨라고도 함). 1565년 혼인.", "sources": ["wiki_sunsin"] },
    { "id": "haeju_oh", "name": null, "gender": "F", "clan": "해주 오씨", "clanHanja": "海州吳氏",
      "note": "이순신의 첩.", "sources": ["wiki_sunsin"] },

    { "id": "yi_hoe", "name": "이회", "hanja": "李薈", "gender": "M", "clan": "덕수 이씨", "sibIndex": 1,
      "birth": "1567", "death": "1625", "title": "선무원종공신 1등, 훈련원 첨정", "sources": ["wiki_sunsin"] },
    { "id": "gwangsan_kim", "name": null, "gender": "F", "clan": "광산 김씨", "clanHanja": "光山金氏",
      "note": "이회의 처.", "sources": ["wiki_sunsin"] },
    { "id": "yi_jibaek", "name": "이지백", "hanja": "李之白", "gender": "M", "clan": "덕수 이씨", "sibIndex": 1,
      "sources": ["wiki_sunsin"] },
    { "id": "yi_jiseok", "name": "이지석", "hanja": "李之晳", "gender": "M", "clan": "덕수 이씨", "sibIndex": 2,
      "note": "숙부 이예의 양자로 입적(출계).", "sources": ["wiki_sunsin"] },
    { "id": "yi_hoe_daughter", "name": null, "gender": "F", "clan": "덕수 이씨", "sibIndex": 3,
      "note": "이회의 딸. 윤헌징(尹獻徵)에게 출가.", "sources": ["wiki_sunsin"] },

    { "id": "yi_ye", "name": "이예", "hanja": "李䓲", "gender": "M", "clan": "덕수 이씨", "sibIndex": 2,
      "birth": "1571", "death": "1631", "title": "선무원종공신 3등, 형조정랑",
      "note": "자녀가 없어 조카 이지석을 양자로 들임.", "sources": ["wiki_sunsin"] },
    { "id": "sinchang_maeng", "name": null, "gender": "F", "clan": "신창 맹씨", "clanHanja": "新昌孟氏",
      "note": "이예의 처.", "sources": ["wiki_sunsin"] },
    { "id": "yi_myeon", "name": "이면", "hanja": "李葂", "gender": "M", "clan": "덕수 이씨", "sibIndex": 5,
      "birth": "1577", "death": "1597", "title": "선무원종공신 3등, 증 이조참의",
      "note": "정유재란 때 왜군과 싸우다 전사.", "sources": ["wiki_sunsin"] },
    { "id": "yi_sunsin_daughter", "name": null, "gender": "F", "clan": "덕수 이씨",
      "note": "이순신의 딸. 홍가신의 아들 홍비에게 출가.", "sources": ["wiki_sunsin"] },
    { "id": "hong_bi", "name": "홍비", "hanja": "洪棐", "gender": "M", "sources": ["wiki_sunsin"] },
    { "id": "hong_gasin", "name": "홍가신", "hanja": "洪可臣", "gender": "M", "title": "청난공신",
      "note": "이순신의 사돈.", "sources": ["wiki_sunsin"] },

    { "id": "yi_hun", "name": "이훈", "hanja": "李薰", "gender": "M", "clan": "덕수 이씨", "sibIndex": 3,
      "birth": "1574", "death": "1624", "title": "선무원종공신 3등, 증 병조참의",
      "note": "서자. 이괄의 난 진압 중 전사. 현존 후손은 이훈의 계통으로 전함.", "sources": ["wiki_sunsin"] },
    { "id": "kim_chunyeo", "name": "김춘여", "gender": "M", "clan": "순천 김씨", "sources": ["wiki_sunsin"] },
    { "id": "suncheon_kim", "name": null, "gender": "F", "clan": "순천 김씨", "clanHanja": "順天金氏",
      "note": "이훈의 처, 김춘여의 딸.", "sources": ["wiki_sunsin"] },
    { "id": "yi_jigu", "name": "이지구", "gender": "M", "clan": "덕수 이씨", "sources": ["wiki_sunsin"] },
    { "id": "yi_sin", "name": "이신", "hanja": "李藎", "gender": "M", "clan": "덕수 이씨", "sibIndex": 4, "death": "1627",
      "title": "선무원종공신 3등, 증 병조참의",
      "note": "서자. 정묘호란 때 사촌 이완과 함께 전사.", "sources": ["wiki_sunsin"] },

    { "id": "yi_usin", "name": "이우신", "hanja": "李禹臣", "gender": "M", "clan": "덕수 이씨", "sibIndex": 4,
      "title": "선무원종공신 3등, 참봉", "sources": ["wiki_sunsin"] },
    { "id": "onyang_jeong", "name": null, "gender": "F", "clan": "온양 정씨", "clanHanja": "溫陽鄭氏",
      "note": "이우신의 처.", "sources": ["wiki_sunsin"] }
  ],

  "unions": [
    { "id": "u_geo", "husband": "yi_geo", "wife": null, "children": ["yi_baengnok"] },
    { "id": "u_byeon_seong", "husband": "byeon_seong", "wife": null, "children": ["chogye_byeon_gm"] },
    { "id": "u_baengnok", "husband": "yi_baengnok", "wife": "chogye_byeon_gm", "children": ["yi_jeong"] },
    { "id": "u_byeon_surim", "husband": "byeon_surim", "wife": null, "children": ["chogye_byeon"] },
    { "id": "u_jeong", "husband": "yi_jeong", "wife": "chogye_byeon",
      "children": ["yi_huisin", "yi_yosin", "yi_sunsin", "yi_usin"] },

    { "id": "u_kang", "husband": "kang_seon", "wife": null, "children": ["jinju_kang"] },
    { "id": "u_huisin", "husband": "yi_huisin", "wife": "jinju_kang", "children": ["yi_roe", "yi_bun", "yi_beon", "yi_wan"] },
    { "id": "u_yosin", "husband": "yi_yosin", "wife": "cheongpung_kim", "children": ["yi_bong", "yi_hae"] },
    { "id": "u_usin", "husband": "yi_usin", "wife": "onyang_jeong", "children": [] },

    { "id": "u_bang_hong", "husband": "bang_hong", "wife": null, "children": ["bang_junggyu"] },
    { "id": "u_bang_junggyu", "husband": "bang_junggyu", "wife": null, "children": ["bang_jin"] },
    { "id": "u_bang_jin", "husband": "bang_jin", "wife": null, "children": ["sangju_bang"] },
    { "id": "u_sunsin_1", "husband": "yi_sunsin", "wife": "sangju_bang", "type": "정실", "order": 1,
      "children": ["yi_hoe", "yi_ye", "yi_myeon", "yi_sunsin_daughter"] },
    { "id": "u_sunsin_2", "husband": "yi_sunsin", "wife": "haeju_oh", "type": "첩", "order": 2,
      "children": ["yi_hun", "yi_sin"] },

    { "id": "u_hoe", "husband": "yi_hoe", "wife": "gwangsan_kim", "children": ["yi_jibaek", "yi_jiseok", "yi_hoe_daughter"] },
    { "id": "u_ye", "husband": "yi_ye", "wife": "sinchang_maeng", "note": "소생 없음(이지석 입양)", "children": [] },
    { "id": "u_hong_gasin", "husband": "hong_gasin", "wife": null, "children": ["hong_bi"] },
    { "id": "u_hongbi", "husband": "hong_bi", "wife": "yi_sunsin_daughter", "children": [] },
    { "id": "u_kim_chunyeo", "husband": "kim_chunyeo", "wife": null, "children": ["suncheon_kim"] },
    { "id": "u_hun", "husband": "yi_hun", "wife": "suncheon_kim", "children": ["yi_jigu"] }
  ],

  "adoptions": [
    { "id": "ad_jiseok", "child": "yi_jiseok", "union": "u_ye", "note": "자녀가 없던 숙부 이예의 양자로 입적", "sources": ["wiki_sunsin"] }
  ],

  "lineageGaps": []
});
