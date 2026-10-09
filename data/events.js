// 인물과 사건(events.html) 데이터. 집안별 조사 결과를 합친 것으로, 사건을 더하거나 고칠 때는 이 파일을 직접 고친다.
// participants: 가계도 인물({ ds: 가계도 id, id: 인물 id, role }), external: 가계도 밖 주요 인물.
// relations: 사건 사이의 관계(원인·결과로 이어짐·일부·영향·대립·계승). from → to 방향.
window.GENEALOGY_EVENTS = {
 "events": [
  {
   "id": "wangja_nan",
   "name": "왕자의 난",
   "hanja": "王子의 亂",
   "start": 1398,
   "end": 1400,
   "type": "정변",
   "summary": "태조의 후계 문제를 둘러싸고 1398년(제1차) 이방원이 정도전 일파와 세자 이방석을 제거하고, 1400년(제2차) 넷째 형 이방간의 군사를 꺾은 두 차례의 정변. 이방원은 1400년 세자를 거쳐 왕위(태종)에 올랐다.",
   "participants": [
    {
     "ds": "yi-sunsin-muui",
     "id": "taejong",
     "role": "주도"
    },
    {
     "ds": "yi-wonik",
     "id": "taejong",
     "role": "주도"
    },
    {
     "ds": "yi-sunsin-muui",
     "id": "taejo",
     "role": "선위"
    }
   ],
   "external": [
    {
     "name": "정도전",
     "hanja": "鄭道傳",
     "role": "피살"
    },
    {
     "name": "이방석",
     "hanja": "李芳碩",
     "role": "세자, 피살"
    },
    {
     "name": "이방간",
     "hanja": "李芳幹",
     "role": "제2차 난 패배·유배"
    },
    {
     "name": "정종",
     "hanja": "定宗",
     "role": "즉위 후 선위"
    }
   ],
   "sources": [
    {
     "title": "위키백과 「제1차 왕자의 난」",
     "url": "https://ko.wikipedia.org/wiki/제1차_왕자의_난"
    },
    {
     "title": "위키백과 「제2차 왕자의 난」",
     "url": "https://ko.wikipedia.org/wiki/제2차_왕자의_난"
    },
    {
     "title": "위키백과 「태종 (조선)」",
     "url": "https://ko.wikipedia.org/wiki/태종_(조선)"
    }
   ]
  },
  {
   "id": "yangnyeong_pyeseja",
   "name": "양녕대군 폐세자",
   "hanja": "讓寧大君 廢世子",
   "start": 1418,
   "end": null,
   "type": "정변",
   "summary": "세자 양녕대군이 거듭된 비행과 태종을 원망하는 상서로 신망을 잃자, 1418년 유정현 등의 탄핵을 받아 태종이 세자를 폐하고 셋째 아들 충녕대군을 세자로 세웠다. 양녕은 경기 광주·이천 등지로 내쳐졌다.",
   "participants": [
    {
     "ds": "yi-sunsin-muui",
     "id": "yangnyeong",
     "role": "폐위"
    },
    {
     "ds": "yi-wonik",
     "id": "yangnyeong",
     "role": "폐위"
    },
    {
     "ds": "yi-sunsin-muui",
     "id": "taejong",
     "role": "폐세자 결정"
    },
    {
     "ds": "yi-wonik",
     "id": "taejong",
     "role": "폐세자 결정"
    },
    {
     "ds": "yi-sunsin-muui",
     "id": "sejong",
     "role": "세자 책봉"
    },
    {
     "ds": "yi-wonik",
     "id": "sejong",
     "role": "세자 책봉"
    }
   ],
   "external": [
    {
     "name": "유정현",
     "hanja": "柳廷顯",
     "role": "폐세자 주청"
    },
    {
     "name": "황희",
     "hanja": "黃喜",
     "role": "폐세자 반대"
    }
   ],
   "sources": [
    {
     "title": "위키백과 「양녕대군」",
     "url": "https://ko.wikipedia.org/wiki/양녕대군"
    },
    {
     "title": "한국민족문화대백과사전 「양녕대군(讓寧大君)」",
     "url": "https://encykorea.aks.ac.kr/Article/E0035446"
    }
   ]
  },
  {
   "id": "sejong_jeugwi",
   "name": "세종 즉위",
   "hanja": "世宗 卽位",
   "start": 1418,
   "end": null,
   "type": "기타",
   "summary": "세자가 된 지 두 달 만인 1418년 8월 태종의 선위로 충녕대군이 즉위했다. 태종은 상왕으로서 1422년까지 병권을 쥐었다.",
   "participants": [
    {
     "ds": "yi-sunsin-muui",
     "id": "sejong",
     "role": "즉위"
    },
    {
     "ds": "yi-wonik",
     "id": "sejong",
     "role": "즉위"
    },
    {
     "ds": "yi-sunsin-muui",
     "id": "taejong",
     "role": "선위(상왕)"
    },
    {
     "ds": "yi-wonik",
     "id": "taejong",
     "role": "선위(상왕)"
    }
   ],
   "external": [],
   "sources": [
    {
     "title": "위키백과 「세종」",
     "url": "https://ko.wikipedia.org/wiki/세종"
    },
    {
     "title": "위키백과 「태종 (조선)」",
     "url": "https://ko.wikipedia.org/wiki/태종_(조선)"
    }
   ]
  },
  {
   "id": "hunminjeongeum",
   "name": "훈민정음 창제·반포",
   "hanja": "訓民正音",
   "start": 1443,
   "end": 1446,
   "type": "학문·저술",
   "summary": "세종이 1443년 백성이 쉽게 익혀 쓸 수 있는 28자의 문자를 만들고, 1446년 해례본과 함께 『훈민정음』으로 반포했다. 문종(당시 세자)과 수양대군 등 왕자들이 언해·불경 번역(『석보상절』) 사업에 참여했다.",
   "participants": [
    {
     "ds": "yi-sunsin-muui",
     "id": "sejong",
     "role": "창제"
    },
    {
     "ds": "yi-wonik",
     "id": "sejong",
     "role": "창제"
    },
    {
     "ds": "yi-sunsin-muui",
     "id": "munjong",
     "role": "보좌(세자)"
    },
    {
     "ds": "yi-sunsin-muui",
     "id": "sejo",
     "role": "언해 사업(석보상절)"
    }
   ],
   "external": [
    {
     "name": "정인지",
     "hanja": "鄭麟趾",
     "role": "해례 서문"
    },
    {
     "name": "신숙주",
     "hanja": "申叔舟",
     "role": "집현전 학사"
    },
    {
     "name": "성삼문",
     "hanja": "成三問",
     "role": "집현전 학사"
    },
    {
     "name": "최만리",
     "hanja": "崔萬理",
     "role": "반대 상소"
    }
   ],
   "sources": [
    {
     "title": "위키백과 「훈민정음」",
     "url": "https://ko.wikipedia.org/wiki/훈민정음"
    },
    {
     "title": "위키백과 「세종」",
     "url": "https://ko.wikipedia.org/wiki/세종"
    }
   ]
  },
  {
   "id": "hangul-opposition-1444",
   "name": "최만리 등의 언문 반대 상소",
   "hanja": "諺文反對上疏",
   "start": 1444,
   "end": null,
   "type": "학문·저술",
   "summary": "1444년(세종 26) 2월 집현전 부제학 최만리가 학사들과 함께 언문(훈민정음) 창제와 한자음 개혁을 반대하는 상소를 올렸다. 세종의 친국을 받고 이튿날 풀려났으나 곧 사직하고 낙향했다. 한국민족문화대백과사전은 상소의 진의를 한글 창제 자체보다 한자음 개혁 반대로 본다.",
   "participants": [
    {
     "ds": "yi-i",
     "id": "choi_manri",
     "role": "상소 주도"
    }
   ],
   "external": [
    {
     "name": "세종",
     "hanja": "世宗",
     "role": "훈민정음 창제, 친국"
    },
    {
     "name": "정창손",
     "hanja": "鄭昌孫",
     "role": "연명 상소"
    }
   ],
   "sources": [
    {
     "title": "한국민족문화대백과사전 「최만리」",
     "url": "https://encykorea.aks.ac.kr/Article/E0057279"
    },
    {
     "title": "위키백과 「훈민정음」",
     "url": "https://ko.wikipedia.org/wiki/훈민정음"
    }
   ]
  },
  {
   "id": "gyeyu_jeongnan",
   "name": "계유정난",
   "hanja": "癸酉靖難",
   "start": 1453,
   "end": null,
   "type": "정변",
   "summary": "단종 1년(1453) 수양대군이 김종서·황보인 등 고명대신을 죽이고 안평대군을 몰아내 정권을 잡은 정변. 양녕대군은 조카 수양대군의 편에 서서 안평대군의 처벌을 주청했다.",
   "participants": [
    {
     "ds": "yi-sunsin-muui",
     "id": "sejo",
     "role": "주도"
    },
    {
     "ds": "yi-sunsin-muui",
     "id": "yangnyeong",
     "role": "지지·처벌 주청"
    },
    {
     "ds": "yi-wonik",
     "id": "yangnyeong",
     "role": "지지·처벌 주청"
    }
   ],
   "external": [
    {
     "name": "단종",
     "hanja": "端宗",
     "role": "국왕"
    },
    {
     "name": "김종서",
     "hanja": "金宗瑞",
     "role": "피살"
    },
    {
     "name": "안평대군",
     "hanja": "安平大君",
     "role": "유배·사사"
    },
    {
     "name": "한명회",
     "hanja": "韓明澮",
     "role": "모주"
    }
   ],
   "sources": [
    {
     "title": "위키백과 「계유정난」",
     "url": "https://ko.wikipedia.org/wiki/계유정난"
    },
    {
     "title": "위키백과 「양녕대군」",
     "url": "https://ko.wikipedia.org/wiki/양녕대군"
    }
   ]
  },
  {
   "id": "jwaik_gongsin",
   "name": "세조 즉위와 좌익공신 녹훈",
   "hanja": "佐翼功臣",
   "start": 1455,
   "end": null,
   "type": "정변",
   "summary": "1455년 단종의 선위로 수양대군이 즉위(세조)하자, 즉위를 도운 이들을 좌익공신으로 녹훈했다. 충무공의 고조부 이효조가 수충좌익공신 3등, 5대조 이변이 좌익원종공신 2등에 올랐다.",
   "participants": [
    {
     "ds": "yi-sunsin-muui",
     "id": "sejo",
     "role": "즉위"
    },
    {
     "ds": "yi-sunsin",
     "id": "yi_hyojo",
     "role": "좌익공신 3등"
    },
    {
     "ds": "yi-sunsin",
     "id": "yi_byeon",
     "role": "좌익원종공신 2등"
    }
   ],
   "external": [
    {
     "name": "단종",
     "hanja": "端宗",
     "role": "선위"
    }
   ],
   "sources": [
    {
     "title": "위키백과 「좌익공신」",
     "url": "https://ko.wikipedia.org/wiki/좌익공신"
    },
    {
     "title": "위키백과 「이효조」",
     "url": "https://ko.wikipedia.org/wiki/이효조"
    },
    {
     "title": "위키백과 「이변 (1391년)」",
     "url": "https://ko.wikipedia.org/wiki/이변_(1391년)"
    }
   ]
  },
  {
   "id": "nam-i-incident-1468",
   "name": "남이의 옥",
   "hanja": "南怡獄",
   "start": 1468,
   "end": null,
   "type": "사화·옥사",
   "summary": "예종 즉위년(1468) 유자광이 남이가 혜성을 보고 한 말을 역모로 고변하여 남이·강순 등이 처형되었다. 임진왜란 뒤 야사에서는 유자광의 모함으로 날조된 옥사로 그려졌고, 순조 때 후손 남공철의 상소로 신원되었다.",
   "participants": [
    {
     "ds": "yi-i",
     "id": "nam_i",
     "role": "희생(처형)"
    }
   ],
   "external": [
    {
     "name": "유자광",
     "hanja": "柳子光",
     "role": "고변, 익대공신"
    },
    {
     "name": "예종",
     "hanja": "睿宗",
     "role": "국왕"
    },
    {
     "name": "강순",
     "hanja": "康純",
     "role": "함께 처형"
    }
   ],
   "sources": [
    {
     "title": "한국민족문화대백과사전 「남이의 옥」",
     "url": "https://encykorea.aks.ac.kr/Article/E0012102"
    },
    {
     "title": "위키백과 「남이의 옥」",
     "url": "https://ko.wikipedia.org/wiki/남이의_옥"
    }
   ]
  },
  {
   "id": "muo-sahwa-1498",
   "name": "무오사화",
   "hanja": "戊午士禍",
   "start": 1498,
   "end": null,
   "type": "사화·옥사",
   "summary": "1498년(연산군 4) 김일손이 사초에 실은 김종직의 「조의제문」이 문제 되어 유자광·이극돈 등 훈구파가 김종직 문인들을 숙청한 사화이다. 김종직의 문인 이의무도 평안도 어천역에 유배되었다가 이듬해 풀려났다.",
   "participants": [
    {
     "ds": "yi-i",
     "id": "yi_uimu",
     "role": "피화(유배)"
    }
   ],
   "external": [
    {
     "name": "김종직",
     "hanja": "金宗直",
     "role": "부관참시"
    },
    {
     "name": "김일손",
     "hanja": "金馹孫",
     "role": "사초 작성, 처형"
    },
    {
     "name": "유자광",
     "hanja": "柳子光",
     "role": "주도"
    }
   ],
   "sources": [
    {
     "title": "위키백과 「무오사화」",
     "url": "https://ko.wikipedia.org/wiki/무오사화"
    },
    {
     "title": "위키백과 「이의무 (1449년)」",
     "url": "https://ko.wikipedia.org/wiki/이의무_(1449년)"
    },
    {
     "title": "한국민족문화대백과사전 「사화」",
     "url": "https://encykorea.aks.ac.kr/Article/E0026117"
    }
   ]
  },
  {
   "id": "gapja-sahwa-1504",
   "name": "갑자사화",
   "hanja": "甲子士禍",
   "start": 1504,
   "end": 1505,
   "type": "사화·옥사",
   "summary": "1504년(연산군 10) 연산군이 생모 폐비 윤씨의 폐출·사사에 관여한 신하와 추숭에 반대한 신하들을 대거 처벌한 사화이다. 폐비에게 사약을 가져간 권주는 장형과 정역에 처해졌다가 이듬해 죽었고 아들 권질도 유배되었다. 추숭에 반대한 이행은 장 60대를 맞고 충주로 유배되었으며, 박은은 사냥을 간한 일로 효수되었다.",
   "participants": [
    {
     "ds": "yi-hwang",
     "id": "gwon_ju",
     "role": "희생(1505년 사사)"
    },
    {
     "ds": "yi-hwang",
     "id": "gwon_jil",
     "role": "연좌 유배"
    },
    {
     "ds": "yi-i",
     "id": "yi_haeng",
     "role": "추숭 반대, 장형·유배"
    },
    {
     "ds": "yi-i",
     "id": "park_eun",
     "role": "희생(효수)"
    }
   ],
   "external": [
    {
     "name": "연산군",
     "hanja": "燕山君",
     "role": "주도"
    },
    {
     "name": "폐비 윤씨",
     "hanja": "廢妃尹氏",
     "role": "발단"
    },
    {
     "name": "임사홍",
     "hanja": "任士洪",
     "role": "주도 세력"
    }
   ],
   "sources": [
    {
     "title": "위키백과 「갑자사화」(연산군일기 인용 피화자 목록)",
     "url": "https://ko.wikipedia.org/wiki/갑자사화"
    },
    {
     "title": "위키백과 「이행 (조선)」",
     "url": "https://ko.wikipedia.org/wiki/이행_(조선)"
    },
    {
     "title": "위키백과 「박은 (1479년)」",
     "url": "https://ko.wikipedia.org/wiki/박은_(1479년)"
    },
    {
     "title": "위키백과 「이황」 – 가족 관계",
     "url": "https://ko.wikipedia.org/wiki/이황"
    }
   ]
  },
  {
   "id": "jungjong-banjeong-1506",
   "name": "중종반정",
   "hanja": "中宗反正",
   "start": 1506,
   "end": null,
   "type": "정변",
   "summary": "1506년 박원종·성희안 등이 연산군을 폐하고 진성대군(중종)을 옹립한 정변이다. 마침 입직하던 동부승지 이우(이황의 숙부)가 가담해 정국공신 4등·청해군에 봉해졌다가 1514년 삭훈되었다. 갑자사화로 거제에 위리안치되었던 이행은 반정 직후 풀려나 홍문관에 복귀했다.",
   "participants": [
    {
     "ds": "yi-hwang",
     "id": "yi_u",
     "role": "가담, 정국공신 4등(뒤에 삭훈)"
    },
    {
     "ds": "yi-i",
     "id": "yi_haeng",
     "role": "유배에서 석방·복귀"
    },
    {
     "ds": "yi-i",
     "id": "park_eun",
     "role": "사후 신원"
    }
   ],
   "external": [
    {
     "name": "박원종",
     "hanja": "朴元宗",
     "role": "주도"
    },
    {
     "name": "성희안",
     "hanja": "成希顔",
     "role": "주도"
    },
    {
     "name": "중종",
     "hanja": "中宗",
     "role": "옹립"
    },
    {
     "name": "연산군",
     "hanja": "燕山君",
     "role": "폐위"
    }
   ],
   "sources": [
    {
     "title": "한국민족문화대백과사전 「이우(李堣)」",
     "url": "https://encykorea.aks.ac.kr/Article/E0045282"
    },
    {
     "title": "위키백과 「중종반정」",
     "url": "https://ko.wikipedia.org/wiki/중종반정"
    },
    {
     "title": "위키백과 「이행 (조선)」",
     "url": "https://ko.wikipedia.org/wiki/이행_(조선)"
    }
   ]
  },
  {
   "id": "gimyo-sahwa-1519",
   "name": "기묘사화",
   "hanja": "己卯士禍",
   "start": 1519,
   "end": null,
   "type": "사화·옥사",
   "summary": "1519년(중종 14) 남곤·심정·홍경주 등 훈구 세력이 정국공신 위훈 삭제 등을 추진하던 조광조 일파를 몰아낸 사화이다. 신사임당의 숙부뻘인 신명인은 대궐 뜰에 엎드려 간하는 상소를 올렸고, 아버지 신명화도 유생들 틈에 있다가 나흘간 옥고를 치른 뒤 벼슬을 단념하고 강릉으로 내려갔다(위키백과 「신사임당」).",
   "participants": [
    {
     "ds": "yi-i",
     "id": "shin_myeongin",
     "role": "구명 상소"
    },
    {
     "ds": "yi-i",
     "id": "shin_myeonghwa",
     "role": "옥고, 뒤에 은거"
    }
   ],
   "external": [
    {
     "name": "조광조",
     "hanja": "趙光祖",
     "role": "희생(사사)"
    },
    {
     "name": "남곤",
     "hanja": "南袞",
     "role": "주도"
    },
    {
     "name": "심정",
     "hanja": "沈貞",
     "role": "주도"
    },
    {
     "name": "중종",
     "hanja": "中宗",
     "role": "국왕"
    }
   ],
   "sources": [
    {
     "title": "한국민족문화대백과사전 「기묘사화」",
     "url": "https://encykorea.aks.ac.kr/Article/E0008223"
    },
    {
     "title": "위키백과 「신사임당」",
     "url": "https://ko.wikipedia.org/wiki/신사임당"
    }
   ]
  },
  {
   "id": "eulsa-sahwa-1545",
   "name": "을사사화",
   "hanja": "乙巳士禍",
   "start": 1545,
   "end": null,
   "type": "사화·옥사",
   "summary": "명종 즉위년(1545) 소윤 윤원형 일파가 대윤 윤임 일파를 역모로 몰아 숙청하면서 많은 사림이 화를 입었다. 이이의 재종조부 이기는 윤원형과 손잡고 공격을 주도해 보익공신 1등이 되었으나 선조 때 훈작이 삭탈되었다. 이황도 탄핵을 받아 삭직되었다가, 위키백과 「이기」에 따르면 이기가 조카 이원록의 권고로 이황의 서용을 청해 곧 복관되었다.",
   "participants": [
    {
     "ds": "yi-i",
     "id": "yi_gi",
     "role": "주도, 보익공신 1등"
    },
    {
     "ds": "yi-hwang",
     "id": "yi_hwang",
     "role": "삭직 후 복관"
    },
    {
     "ds": "yi-i",
     "id": "yi_wonrok",
     "role": "이황 서용 권고"
    },
    {
     "ds": "yi-hwang",
     "id": "yi_hae",
     "role": "인종 때 이기 등용 반대(원한의 발단)"
    }
   ],
   "external": [
    {
     "name": "윤원형",
     "hanja": "尹元衡",
     "role": "소윤, 주도"
    },
    {
     "name": "윤임",
     "hanja": "尹任",
     "role": "대윤, 희생"
    },
    {
     "name": "문정왕후",
     "hanja": "文定王后",
     "role": "수렴청정"
    }
   ],
   "sources": [
    {
     "title": "한국민족문화대백과사전 「을사사화」",
     "url": "https://encykorea.aks.ac.kr/Article/E0042955"
    },
    {
     "title": "위키백과 「이기 (1476년)」",
     "url": "https://ko.wikipedia.org/wiki/이기_(1476년)"
    },
    {
     "title": "위키백과 「이황」",
     "url": "https://ko.wikipedia.org/wiki/이황"
    },
    {
     "title": "한국민족문화대백과사전 「이해」",
     "url": "https://encykorea.aks.ac.kr/Article/E0046436"
    }
   ]
  },
  {
   "id": "yangjaeyeok-byeokseo-1547",
   "name": "양재역 벽서 사건(정미사화)",
   "hanja": "良才驛壁書事件",
   "start": 1547,
   "end": null,
   "type": "사화·옥사",
   "summary": "1547년(명종 2) 9월 양재역에서 문정왕후와 이기 등을 비방하는 익명 벽서가 발견되자 소윤 세력이 이를 빌미로 반대파를 숙청했다. 이기는 관련자 처벌을 요구하는 데 가담했고, 이언적·노수신·유희춘·백인걸 등 20여 명이 유배되었다. 1565년 소윤 몰락 뒤 무고로 공인되었다.",
   "participants": [
    {
     "ds": "yi-i",
     "id": "yi_gi",
     "role": "벽서의 비방 대상, 처벌 주장"
    }
   ],
   "external": [
    {
     "name": "윤원형",
     "hanja": "尹元衡",
     "role": "주도"
    },
    {
     "name": "이언적",
     "hanja": "李彦迪",
     "role": "피화(유배)"
    },
    {
     "name": "문정왕후",
     "hanja": "文定王后",
     "role": "벽서의 비방 대상"
    }
   ],
   "sources": [
    {
     "title": "한국민족문화대백과사전 「양재역 벽서사건」",
     "url": "https://encykorea.aks.ac.kr/Article/E0035718"
    },
    {
     "title": "위키백과 「정미사화」",
     "url": "https://ko.wikipedia.org/wiki/정미사화"
    },
    {
     "title": "위키백과 「이기 (1476년)」",
     "url": "https://ko.wikipedia.org/wiki/이기_(1476년)"
    }
   ]
  },
  {
   "id": "sosu-seowon-1550",
   "name": "이황의 단양·풍기군수 재임과 소수서원 사액",
   "hanja": "紹修書院賜額",
   "start": 1548,
   "end": 1550,
   "type": "교육·서원",
   "summary": "이황은 1548년 단양군수로 부임했다가(이때 기녀 두향을 만났다고 전함) 곧 풍기군수로 옮겼다. 풍기에서 주세붕이 세운 백운동서원에 국가의 사액과 지원을 청해 1550년 명종이 '소수서원' 편액과 서책·토지·노비를 내렸다. 우리나라 최초의 사액서원이 되어 이후 사액서원의 선례가 되었다.",
   "participants": [
    {
     "ds": "yi-hwang",
     "id": "yi_hwang",
     "role": "사액 건의(풍기군수)"
    },
    {
     "ds": "yi-hwang",
     "id": "duhyang",
     "role": "단양 시절 인연(전승)"
    }
   ],
   "external": [
    {
     "name": "주세붕",
     "hanja": "周世鵬",
     "role": "백운동서원 창건"
    },
    {
     "name": "명종",
     "hanja": "明宗",
     "role": "사액"
    },
    {
     "name": "안향",
     "hanja": "安珦",
     "role": "제향 인물"
    }
   ],
   "sources": [
    {
     "title": "한국민족문화대백과사전 「영주 소수서원」",
     "url": "https://encykorea.aks.ac.kr/Article/E0030146"
    },
    {
     "title": "위키백과 「소수서원」",
     "url": "https://ko.wikipedia.org/wiki/소수서원"
    },
    {
     "title": "위키백과 「이황」",
     "url": "https://ko.wikipedia.org/wiki/이황"
    }
   ]
  },
  {
   "id": "gudo-jangwon",
   "name": "이이의 구도장원",
   "hanja": "九度壯元",
   "start": 1548,
   "end": 1564,
   "type": "기타",
   "summary": "이이는 13세(1548) 진사 초시 합격을 시작으로 1558년 별시 「천도책」, 1564년 생원·진사시와 문과에 이르기까지 아홉 차례 장원하여 '구도장원공'으로 불렸다. 1564년부터 호조좌랑 등으로 관직에 나갔다.",
   "participants": [
    {
     "ds": "yi-i",
     "id": "yi_i",
     "role": "장원"
    }
   ],
   "external": [],
   "sources": [
    {
     "title": "한국민족문화대백과사전 「이이」",
     "url": "https://encykorea.aks.ac.kr/Article/E0045546"
    },
    {
     "title": "위키백과 「이이」",
     "url": "https://ko.wikipedia.org/wiki/이이"
    }
   ]
  },
  {
   "id": "yi-hae-exile-1550",
   "name": "이해 탄핵과 유배 중 사망",
   "hanja": null,
   "start": 1550,
   "end": null,
   "type": "사화·옥사",
   "summary": "인종 때 대사헌으로 이기의 우의정 등용을 반대해 원한을 산 이해(이황의 형)는 1550년 이기의 심복 사간 이무강의 탄핵으로 무고 사건에 연좌된 구수담의 일파로 몰려 투옥되었다. 명종이 갑산 유배로 그치게 했으나 유배 길에 양주에서 병사했다. 아들 이교가 이 과정을 「가정경술일기」로 남겼다.",
   "participants": [
    {
     "ds": "yi-hwang",
     "id": "yi_hae",
     "role": "희생(유배 중 사망)"
    },
    {
     "ds": "yi-i",
     "id": "yi_gi",
     "role": "탄핵 배후"
    },
    {
     "ds": "yi-hwang",
     "id": "yi_gyo",
     "role": "기록(「가정경술일기」)"
    }
   ],
   "external": [
    {
     "name": "이무강",
     "hanja": "李無彊",
     "role": "탄핵"
    },
    {
     "name": "구수담",
     "hanja": "具壽聃",
     "role": "같은 옥사로 사사"
    },
    {
     "name": "명종",
     "hanja": "明宗",
     "role": "감형"
    }
   ],
   "sources": [
    {
     "title": "한국민족문화대백과사전 「이해」",
     "url": "https://encykorea.aks.ac.kr/Article/E0046436"
    },
    {
     "title": "위키백과 「이해 (정민공)」",
     "url": "https://ko.wikipedia.org/wiki/이해_(정민공)"
    },
    {
     "title": "위키백과 「이기 (1476년)」",
     "url": "https://ko.wikipedia.org/wiki/이기_(1476년)"
    }
   ]
  },
  {
   "id": "dosan-seodang",
   "name": "도산서당 건립",
   "hanja": "陶山書堂",
   "start": 1557,
   "end": 1561,
   "type": "교육·서원",
   "summary": "이황은 1557년 고향 예안 도산 남쪽에 서당 터를 정하고 공사를 시작해 1560~1561년 무렵 완성했다(위키백과 「이황」은 1560년). 이곳에서 만년의 저술과 제자 교육에 힘썼으며, 사후 이 서당 뒤편에 도산서원이 세워졌다.",
   "participants": [
    {
     "ds": "yi-hwang",
     "id": "yi_hwang",
     "role": "건립, 강학"
    }
   ],
   "external": [],
   "sources": [
    {
     "title": "위키백과 「도산서당」",
     "url": "https://ko.wikipedia.org/wiki/도산서당"
    },
    {
     "title": "위키백과 「이황」",
     "url": "https://ko.wikipedia.org/wiki/이황"
    }
   ]
  },
  {
   "id": "yi-i-visits-yi-hwang-1558",
   "name": "이이의 도산 방문",
   "hanja": null,
   "start": 1558,
   "end": null,
   "type": "학문·저술",
   "summary": "1558년 봄 23세의 이이가 예안 도산(계상)으로 58세의 이황을 찾아가 이틀간 머물며 학문을 논했다. 두 사람은 이후 편지로 문답을 이어 갔다. 같은 해 겨울 이이는 별시에서 「천도책」으로 장원했다.",
   "participants": [
    {
     "ds": "yi-i",
     "id": "yi_i",
     "role": "방문"
    },
    {
     "ds": "yi-hwang",
     "id": "yi_hwang",
     "role": "맞이함, 문답"
    }
   ],
   "external": [],
   "sources": [
    {
     "title": "한국민족문화대백과사전 「이이」",
     "url": "https://encykorea.aks.ac.kr/Article/E0045546"
    },
    {
     "title": "위키백과 「이이」",
     "url": "https://ko.wikipedia.org/wiki/이이"
    }
   ]
  },
  {
   "id": "sachil-debate",
   "name": "사단칠정 논쟁(사칠논변)",
   "hanja": "四七論辨",
   "start": 1559,
   "end": 1566,
   "type": "학문·저술",
   "summary": "정지운의 「천명도설」을 이황이 고친 표현을 두고 기대승이 문제를 제기하면서 1559~1566년 편지로 이어진 논변이다. 이황은 사단은 이가 발하여 기가 따르고 칠정은 기가 발하여 이가 탄다는 이기호발설을, 기대승은 사단이 칠정 밖에 따로 있지 않다는 입장을 폈다. 뒤에 이이가 기대승의 설을 지지하며 성혼과 논쟁하면서 주리·주기 학파 논의로 확대되었다.",
   "participants": [
    {
     "ds": "yi-hwang",
     "id": "yi_hwang",
     "role": "논쟁 당사자(이기호발설)"
    },
    {
     "ds": "yi-i",
     "id": "yi_i",
     "role": "후속 논쟁(기대승 설 지지)"
    }
   ],
   "external": [
    {
     "name": "기대승",
     "hanja": "奇大升",
     "role": "논쟁 상대"
    },
    {
     "name": "정지운",
     "hanja": "鄭之雲",
     "role": "「천명도설」 저자"
    },
    {
     "name": "성혼",
     "hanja": "成渾",
     "role": "이이와 후속 논쟁(1572)"
    }
   ],
   "sources": [
    {
     "title": "한국민족문화대백과사전 「사칠논변」",
     "url": "https://encykorea.aks.ac.kr/Article/E0026054"
    },
    {
     "title": "한국민족문화대백과사전 「기대승」",
     "url": "https://encykorea.aks.ac.kr/Article/E0008148"
    },
    {
     "title": "위키백과 「사단칠정론」",
     "url": "https://ko.wikipedia.org/wiki/사단칠정론"
    }
   ]
  },
  {
   "id": "seonghak-sipdo-1568",
   "name": "『성학십도』·「무진육조소」 진상",
   "hanja": "聖學十圖",
   "start": 1568,
   "end": null,
   "type": "학문·저술",
   "summary": "1568년(선조 1) 이황은 17세에 즉위한 선조에게 「무진육조소」를 올리고, 12월에는 성왕의 학문 요체를 열 개의 도식으로 정리한 『성학십도』(원제 「진성학십도차병도」)를 지어 올렸다. 이듬해 이이가 「동호문답」을 올리는 등 신진 사림의 제왕학 저술이 잇따랐다.",
   "participants": [
    {
     "ds": "yi-hwang",
     "id": "yi_hwang",
     "role": "저술·진상"
    }
   ],
   "external": [
    {
     "name": "선조",
     "hanja": "宣祖",
     "role": "받은 국왕"
    }
   ],
   "sources": [
    {
     "title": "한국민족문화대백과사전 「성학십도」",
     "url": "https://encykorea.aks.ac.kr/Article/E0029678"
    },
    {
     "title": "위키백과 「성학십도」",
     "url": "https://ko.wikipedia.org/wiki/성학십도"
    }
   ]
  },
  {
   "id": "yulgok-hyangyak",
   "name": "이이의 향약 시행(서원향약·해주향약)",
   "hanja": "西原鄕約·海州鄕約",
   "start": 1571,
   "end": 1577,
   "type": "정책·제도",
   "summary": "이이는 1571년 청주목사로 부임해 면 단위로 계장·유사를 두고 향교·서숙 조직과 결합한 서원향약을 시행했다. 1577년 해주 석담에 물러나서는 해주향약과 사창·계·향약을 결합한 「사창계약속」을 만들었다. 이 향약들은 뒤에 기호 지방 향약의 본보기가 되었다.",
   "participants": [
    {
     "ds": "yi-i",
     "id": "yi_i",
     "role": "제정·시행"
    }
   ],
   "external": [],
   "sources": [
    {
     "title": "한국민족문화대백과사전 「향약계」",
     "url": "https://encykorea.aks.ac.kr/Article/E0062950"
    },
    {
     "title": "한국민족문화대백과사전 「향약조목」",
     "url": "https://encykorea.aks.ac.kr/Article/E0062960"
    }
   ]
  },
  {
   "id": "dosan-seowon-1574",
   "name": "도산서원 건립과 사액",
   "hanja": "陶山書院",
   "start": 1574,
   "end": 1575,
   "type": "교육·서원",
   "summary": "이황 사후 4년인 1574년(선조 7) 지방 유림의 공의로 도산서당 뒤편에 서원을 세워 이황의 위패를 모셨다. 1575년 선조가 한석봉이 쓴 '陶山書院' 편액을 내려 사액서원이 되었다. 2019년 '한국의 서원'으로 유네스코 세계유산에 등재되었다.",
   "participants": [
    {
     "ds": "yi-hwang",
     "id": "yi_hwang",
     "role": "제향 인물"
    }
   ],
   "external": [
    {
     "name": "선조",
     "hanja": "宣祖",
     "role": "사액"
    },
    {
     "name": "한호(한석봉)",
     "hanja": "韓濩",
     "role": "편액 글씨"
    },
    {
     "name": "조목",
     "hanja": "趙穆",
     "role": "종향 제자"
    }
   ],
   "sources": [
    {
     "title": "한국민족문화대백과사전 「안동 도산서원」",
     "url": "https://encykorea.aks.ac.kr/Article/E0015677"
    },
    {
     "title": "위키백과 「도산서원」",
     "url": "https://ko.wikipedia.org/wiki/도산서원"
    }
   ]
  },
  {
   "id": "seonghak-jibyo-1575",
   "name": "『성학집요』 진상",
   "hanja": "聖學輯要",
   "start": 1575,
   "end": null,
   "type": "학문·저술",
   "summary": "1575년(선조 8) 홍문관 부제학 이이가 경전과 사서에서 수기·치인에 긴요한 말을 가려 5편으로 엮어 선조에게 올린 제왕학서이다. 『율곡전서』 권19~26에 실려 있다(위키백과 「이이」는 1581년 저술로 적어 차이가 있음).",
   "participants": [
    {
     "ds": "yi-i",
     "id": "yi_i",
     "role": "저술·진상"
    }
   ],
   "external": [
    {
     "name": "선조",
     "hanja": "宣祖",
     "role": "받은 국왕"
    }
   ],
   "sources": [
    {
     "title": "한국민족문화대백과사전 「성학집요」",
     "url": "https://encykorea.aks.ac.kr/Article/E0029682"
    },
    {
     "title": "위키백과 「성학집요」",
     "url": "https://ko.wikipedia.org/wiki/성학집요"
    }
   ]
  },
  {
   "id": "dongseo-bundang-1575",
   "name": "동서 분당과 이이의 조정(을해당론)",
   "hanja": "東西分黨",
   "start": 1575,
   "end": null,
   "type": "기타",
   "summary": "이조전랑 자리를 둘러싼 김효원과 심의겸의 대립으로 1575년 사림이 동인과 서인으로 갈라졌다. 대사헌 이이는 양시양비론을 내세워 두 사람을 각각 경흥부사·개성유수로 내보내도록 했으나, 이 처분이 오히려 동서 명목을 굳혔다는 평가를 받는다. 이후 이이는 서인 쪽 인물로 동인의 공격을 받게 되었다.",
   "participants": [
    {
     "ds": "yi-i",
     "id": "yi_i",
     "role": "조정(양시양비)"
    }
   ],
   "external": [
    {
     "name": "김효원",
     "hanja": "金孝元",
     "role": "동인의 중심"
    },
    {
     "name": "심의겸",
     "hanja": "沈義謙",
     "role": "서인의 중심"
    },
    {
     "name": "노수신",
     "hanja": "盧守愼",
     "role": "외직 파견 주청"
    }
   ],
   "sources": [
    {
     "title": "한국민족문화대백과사전 「을해당론」",
     "url": "https://encykorea.aks.ac.kr/Article/E0042979"
    },
    {
     "title": "한국민족문화대백과사전 「심의겸」",
     "url": "https://encykorea.aks.ac.kr/Article/E0033897"
    },
    {
     "title": "위키백과 「동서분당」",
     "url": "https://ko.wikipedia.org/wiki/동서분당"
    }
   ]
  },
  {
   "id": "gyeokmong-yogyeol-1577",
   "name": "『격몽요결』 저술",
   "hanja": "擊蒙要訣",
   "start": 1577,
   "end": null,
   "type": "학문·저술",
   "summary": "1577년 해주 석담에 물러난 이이가 처음 배우는 이들을 위해 입지·혁구습·지신 등 학문과 일상의 요체를 정리한 아동·초학 교육서이다. 조선 후기 서당과 향교의 기본 교재로 널리 쓰였다.",
   "participants": [
    {
     "ds": "yi-i",
     "id": "yi_i",
     "role": "저술"
    }
   ],
   "external": [],
   "sources": [
    {
     "title": "위키백과 「격몽요결」",
     "url": "https://ko.wikipedia.org/wiki/격몽요결"
    },
    {
     "title": "한국민족문화대백과사전 「이이」",
     "url": "https://encykorea.aks.ac.kr/Article/E0045546"
    }
   ]
  },
  {
   "id": "simu-yukjo-1583",
   "name": "「시무육조」와 십만양병설",
   "hanja": "時務六條·十萬養兵說",
   "start": 1583,
   "end": null,
   "type": "정책·제도",
   "summary": "1583년(선조 16) 이탕개의 난을 계기로 병조판서 이이가 인재 등용·군민 양성·재용 확보 등을 담은 「시무육조」를 올리고 서얼 허통 등을 주장했다. 이때 경연에서 '십만양병'을 주청했다는 이야기는 김장생의 「율곡행장」과 송시열 등의 「율곡연보」에 처음 보이며, 당대 실록 기록이 없고 연보의 시호 표기 등 시대착오가 지적되어 후대 서인 측 창작이라는 진위 논란이 있다.",
   "participants": [
    {
     "ds": "yi-i",
     "id": "yi_i",
     "role": "상소(병조판서)"
    },
    {
     "ds": "yi-i",
     "id": "kim_jangsaeng",
     "role": "「율곡행장」에 십만양병 주청을 기록(전승의 출처)"
    }
   ],
   "external": [
    {
     "name": "선조",
     "hanja": "宣祖",
     "role": "국왕"
    },
    {
     "name": "유성룡",
     "hanja": "柳成龍",
     "role": "반대했다고 전해짐(논란)"
    },
    {
     "name": "송시열",
     "hanja": "宋時烈",
     "role": "「율곡연보」에 1583년으로 특정"
    }
   ],
   "sources": [
    {
     "title": "한국민족문화대백과사전 「이이」",
     "url": "https://encykorea.aks.ac.kr/Article/E0045546"
    },
    {
     "title": "주간경향 「십만양병설은 조작됐다?」(2009)",
     "url": "https://weekly.khan.co.kr/article/200909101350251"
    },
    {
     "title": "위키백과 「이이」",
     "url": "https://ko.wikipedia.org/wiki/이이"
    }
   ]
  },
  {
   "id": "gyemi-samchan-1583",
   "name": "계미삼찬",
   "hanja": "癸未三竄",
   "start": 1583,
   "end": null,
   "type": "사화·옥사",
   "summary": "1583년(선조 16) 이이가 병조사목을 왕에게 아뢰지 않고 시행한 일 등을 들어 동인 계열의 박근원·송응개·허봉 등이 이이를 탄핵하다가 오히려 모두 유배된 사건이다. 성혼이 이이를 옹호하는 상소를 올려 동서 대립이 격화되었다.",
   "participants": [
    {
     "ds": "yi-i",
     "id": "yi_i",
     "role": "탄핵 대상"
    }
   ],
   "external": [
    {
     "name": "허봉",
     "hanja": "許篈",
     "role": "탄핵, 유배"
    },
    {
     "name": "송응개",
     "hanja": "宋應漑",
     "role": "탄핵, 유배"
    },
    {
     "name": "박근원",
     "hanja": "朴謹元",
     "role": "탄핵, 유배"
    },
    {
     "name": "성혼",
     "hanja": "成渾",
     "role": "이이 옹호"
    }
   ],
   "sources": [
    {
     "title": "한국민족문화대백과사전 「계미삼찬」",
     "url": "https://encykorea.aks.ac.kr/Article/E0003130"
    }
   ]
  },
  {
   "id": "nokdundo",
   "name": "녹둔도 전투",
   "hanja": "鹿屯島 戰鬪",
   "start": 1587,
   "end": null,
   "type": "전투",
   "summary": "1587년 조산보만호 겸 녹둔도 둔전관이던 이순신이 추수 때 기습한 여진족과 싸워 포로를 되찾았으나, 피해의 책임을 물은 북병사 이일의 장계로 파직되어 첫 백의종군을 했다.",
   "participants": [
    {
     "ds": "yi-sunsin",
     "id": "yi_sunsin",
     "role": "방어·백의종군"
    }
   ],
   "external": [
    {
     "name": "이일",
     "hanja": "李鎰",
     "role": "북병사, 문책"
    }
   ],
   "sources": [
    {
     "title": "위키백과 「녹둔도 전투」",
     "url": "https://ko.wikipedia.org/wiki/녹둔도_전투"
    },
    {
     "title": "위키백과 「이순신」",
     "url": "https://ko.wikipedia.org/wiki/이순신"
    }
   ]
  },
  {
   "id": "okpo",
   "name": "옥포 해전",
   "hanja": "玉浦 海戰",
   "start": 1592,
   "end": null,
   "type": "전투",
   "summary": "1592년 5월 7일 이순신의 전라좌수군이 원균의 경상우수군과 함께 거제 옥포에서 일본 수군을 처음으로 격파한 해전(제1차 출전). 무의공 이순신(방답첨사)은 중위장, 흥양현감 배흥립은 전부장으로 싸웠다.",
   "participants": [
    {
     "ds": "yi-sunsin",
     "id": "yi_sunsin",
     "role": "지휘"
    },
    {
     "ds": "yi-sunsin-muui",
     "id": "yi_sunsin_m",
     "role": "중위장"
    },
    {
     "ds": "yi-sunsin-muui",
     "id": "bae_heungrip",
     "role": "전부장"
    }
   ],
   "external": [
    {
     "name": "원균",
     "hanja": "元均",
     "role": "경상우수사, 합동"
    },
    {
     "name": "도도 다카토라",
     "hanja": "藤堂高虎",
     "role": "일본 수군"
    }
   ],
   "sources": [
    {
     "title": "위키백과 「옥포 해전」",
     "url": "https://ko.wikipedia.org/wiki/옥포_해전"
    },
    {
     "title": "한국민족문화대백과사전 「배흥립(裵興立)」",
     "url": "https://encykorea.aks.ac.kr/Article/E0021959"
    },
    {
     "title": "서울신문 「노량해전에서 경상우수사로 ‘충무공의 최후’ 지키다」(2022.7.10)",
     "url": "https://www.seoul.co.kr/news/2022/07/10/20220710500022"
    }
   ]
  },
  {
   "id": "sacheon",
   "name": "사천 해전",
   "hanja": "泗川 海戰",
   "start": 1592,
   "end": null,
   "type": "전투",
   "summary": "1592년 5월 29일 제2차 출전 첫 전투로, 거북선이 처음 실전에 투입되어 사천 선창의 일본 선단을 격파했다. 이순신은 이 싸움에서 왼쪽 어깨에 총탄을 맞았다.",
   "participants": [
    {
     "ds": "yi-sunsin",
     "id": "yi_sunsin",
     "role": "지휘(부상)"
    },
    {
     "ds": "yi-sunsin-muui",
     "id": "yi_sunsin_m",
     "role": "참전"
    },
    {
     "ds": "yi-sunsin-muui",
     "id": "bae_heungrip",
     "role": "참전"
    }
   ],
   "external": [
    {
     "name": "원균",
     "hanja": "元均",
     "role": "합동"
    }
   ],
   "sources": [
    {
     "title": "위키백과 「사천 해전」",
     "url": "https://ko.wikipedia.org/wiki/사천_해전"
    },
    {
     "title": "위키백과 「이순신 (1554년)」",
     "url": "https://ko.wikipedia.org/wiki/이순신_(1554년)"
    }
   ]
  },
  {
   "id": "dangpo",
   "name": "당포 해전",
   "hanja": "唐浦 海戰",
   "start": 1592,
   "end": null,
   "type": "전투",
   "summary": "1592년 6월 2일 통영 당포에 정박한 일본 선단을 거북선을 앞세워 공격해 왜장 구루시마 미치유키를 죽이고 적선 20여 척을 불태운 해전. 이어 6월 5일 당항포에서도 승리했다.",
   "participants": [
    {
     "ds": "yi-sunsin",
     "id": "yi_sunsin",
     "role": "지휘"
    },
    {
     "ds": "yi-sunsin-muui",
     "id": "yi_sunsin_m",
     "role": "중위장"
    }
   ],
   "external": [
    {
     "name": "구루시마 미치유키",
     "hanja": "來島通之",
     "role": "일본 장수, 전사"
    },
    {
     "name": "이억기",
     "hanja": "李億祺",
     "role": "전라우수사(당항포 합류)"
    }
   ],
   "sources": [
    {
     "title": "위키백과 「당포 해전」",
     "url": "https://ko.wikipedia.org/wiki/당포_해전"
    },
    {
     "title": "위키백과 「이순신 (1554년)」",
     "url": "https://ko.wikipedia.org/wiki/이순신_(1554년)"
    }
   ]
  },
  {
   "id": "hansando",
   "name": "한산도 대첩",
   "hanja": "閑山島 大捷",
   "start": 1592,
   "end": null,
   "type": "전투",
   "summary": "1592년 7월 8일 견내량의 일본 수군을 한산도 앞바다로 유인해 학익진으로 섬멸한 해전으로, 일본군의 서해 진출 계획을 꺾었다. 무의공 이순신이 유인 임무를 맡았고 배흥립·이회도 참전했다.",
   "participants": [
    {
     "ds": "yi-sunsin",
     "id": "yi_sunsin",
     "role": "지휘"
    },
    {
     "ds": "yi-sunsin-muui",
     "id": "yi_sunsin_m",
     "role": "유인"
    },
    {
     "ds": "yi-sunsin-muui",
     "id": "bae_heungrip",
     "role": "참전"
    },
    {
     "ds": "yi-sunsin",
     "id": "yi_hoe",
     "role": "참전"
    }
   ],
   "external": [
    {
     "name": "와키자카 야스하루",
     "hanja": "脇坂安治",
     "role": "일본 수군 패장"
    },
    {
     "name": "이억기",
     "hanja": "李億祺",
     "role": "전라우수사"
    },
    {
     "name": "원균",
     "hanja": "元均",
     "role": "경상우수사"
    }
   ],
   "sources": [
    {
     "title": "위키백과 「한산도 대첩」",
     "url": "https://ko.wikipedia.org/wiki/한산도_대첩"
    },
    {
     "title": "위키백과 「이순신 (1554년)」",
     "url": "https://ko.wikipedia.org/wiki/이순신_(1554년)"
    },
    {
     "title": "위키백과 「이회 (1567년)」",
     "url": "https://ko.wikipedia.org/wiki/이회_(1567년)"
    }
   ]
  },
  {
   "id": "busanpo",
   "name": "부산포 해전",
   "hanja": "釜山浦 海戰",
   "start": 1592,
   "end": null,
   "type": "전투",
   "summary": "1592년 9월 1일 일본군의 근거지 부산포를 공격해 적선 100여 척을 부순 해전(제4차 출전). 녹도만호 정운이 전사했다.",
   "participants": [
    {
     "ds": "yi-sunsin",
     "id": "yi_sunsin",
     "role": "지휘"
    },
    {
     "ds": "yi-sunsin-muui",
     "id": "yi_sunsin_m",
     "role": "참전"
    },
    {
     "ds": "yi-sunsin-muui",
     "id": "bae_heungrip",
     "role": "참전"
    }
   ],
   "external": [
    {
     "name": "정운",
     "hanja": "鄭運",
     "role": "녹도만호, 전사"
    },
    {
     "name": "이억기",
     "hanja": "李億祺",
     "role": "전라우수사"
    }
   ],
   "sources": [
    {
     "title": "위키백과 「부산포 해전」",
     "url": "https://ko.wikipedia.org/wiki/부산포_해전"
    },
    {
     "title": "한국민족문화대백과사전 「배흥립(裵興立)」",
     "url": "https://encykorea.aks.ac.kr/Article/E0021959"
    }
   ]
  },
  {
   "id": "yongin-battle-1592",
   "name": "용인 전투",
   "hanja": "龍仁戰鬪",
   "start": 1592,
   "end": null,
   "type": "전투",
   "summary": "1592년 6월 전라도관찰사 이광이 맹주가 되어 이끈 전라·충청·경상 삼도 근왕군이 용인 일대에서 소수의 일본군에게 대패한 전투이다. 이광은 권율·곽영의 반대에도 공격을 명했고, 선봉 백광언·이지시가 전사한 뒤 본진이 기습을 받아 무너졌다. 이광은 파직된 뒤 백의종군·유배를 거쳐 1594년 귀향했다.",
   "participants": [
    {
     "ds": "yi-i",
     "id": "yi_gwang",
     "role": "근왕군 맹주, 패전 책임"
    }
   ],
   "external": [
    {
     "name": "권율",
     "hanja": "權慄",
     "role": "공격 반대, 군 보전"
    },
    {
     "name": "윤선각",
     "hanja": "尹先覺",
     "role": "충청도관찰사"
    },
    {
     "name": "와키자카 야스하루",
     "hanja": "脇坂安治",
     "role": "일본군 장수"
    }
   ],
   "sources": [
    {
     "title": "한국민족문화대백과사전 「용인전투」",
     "url": "https://encykorea.aks.ac.kr/Article/E0039643"
    },
    {
     "title": "한국민족문화대백과사전 「이광」",
     "url": "https://encykorea.aks.ac.kr/Article/E0043670"
    },
    {
     "title": "위키백과 「용인 전투」",
     "url": "https://ko.wikipedia.org/wiki/용인_전투"
    }
   ]
  },
  {
   "id": "imjin_waeran",
   "name": "임진왜란",
   "hanja": "壬辰倭亂",
   "start": 1592,
   "end": 1598,
   "type": "전쟁",
   "summary": "1592년 도요토미 히데요시의 일본군이 조선을 침공해 1598년까지 이어진 전쟁(1597년 재침은 정유재란). 수군은 이순신의 지휘로 제해권을 지켰고, 이원익은 평안도 도순찰사·4도 체찰사로 민심 수습과 군무를 맡았다.",
   "participants": [
    {
     "ds": "yi-sunsin",
     "id": "yi_sunsin",
     "role": "전라좌수사·삼도수군통제사"
    },
    {
     "ds": "yi-sunsin-muui",
     "id": "yi_sunsin_m",
     "role": "방답첨사·중위장"
    },
    {
     "ds": "yi-sunsin-muui",
     "id": "bae_heungrip",
     "role": "흥양현감·전부장"
    },
    {
     "ds": "yi-wonik",
     "id": "yi_wonik",
     "role": "평안도 도순찰사·체찰사"
    },
    {
     "ds": "yi-sunsin",
     "id": "yi_bun",
     "role": "진중 문서·명 장수 접대"
    },
    {
     "ds": "yi-sunsin",
     "id": "yi_hoe",
     "role": "진중 보좌"
    },
    {
     "ds": "yi-sunsin",
     "id": "yi_wan",
     "role": "종군"
    },
    {
     "ds": "yi-sunsin",
     "id": "hong_gasin",
     "role": "홍주목사"
    },
    {
     "ds": "yi-i",
     "id": "yi_gwang",
     "role": "전라도관찰사, 근왕군 지휘"
    },
    {
     "ds": "yi-hwang",
     "id": "yi_jeonghoe",
     "role": "의흥현감"
    },
    {
     "ds": "yi-i",
     "id": "kim_jangsaeng",
     "role": "군량 조달(호조정랑)"
    }
   ],
   "external": [
    {
     "name": "선조",
     "hanja": "宣祖",
     "role": "국왕"
    },
    {
     "name": "도요토미 히데요시",
     "hanja": "豊臣秀吉",
     "role": "침공 주도"
    },
    {
     "name": "류성룡",
     "hanja": "柳成龍",
     "role": "영의정·도체찰사"
    },
    {
     "name": "원균",
     "hanja": "元均",
     "role": "경상우수사"
    },
    {
     "name": "권율",
     "hanja": "權慄",
     "role": "이광의 후임 전라도관찰사"
    }
   ],
   "sources": [
    {
     "title": "위키백과 「임진왜란」",
     "url": "https://ko.wikipedia.org/wiki/임진왜란"
    },
    {
     "title": "한국민족문화대백과사전 「이원익(李元翼)」",
     "url": "https://encykorea.aks.ac.kr/Article/E0045372"
    },
    {
     "title": "위키백과 「이광 (1541년)」",
     "url": "https://ko.wikipedia.org/wiki/이광_(1541년)"
    },
    {
     "title": "디지털안동문화대전 「진성이씨」",
     "url": "https://andong.grandculture.net/andong/toc/GC02401126"
    },
    {
     "title": "위키백과 「김장생」",
     "url": "https://ko.wikipedia.org/wiki/김장생"
    }
   ]
  },
  {
   "id": "nanjung_ilgi",
   "name": "『난중일기』 집필",
   "hanja": "亂中日記",
   "start": 1592,
   "end": 1598,
   "type": "학문·저술",
   "summary": "이순신이 1592년 1월부터 1598년 11월 노량 해전 직전까지 진중에서 쓴 일기로, 국보이자 유네스코 세계기록유산이다. 무의공 이순신(자 입부)은 일기에 '입부'로 140여 차례 등장하며, 조카 이분은 뒤에 「충무공행장」을 지었다.",
   "participants": [
    {
     "ds": "yi-sunsin",
     "id": "yi_sunsin",
     "role": "저술"
    },
    {
     "ds": "yi-sunsin-muui",
     "id": "yi_sunsin_m",
     "role": "일기에 자주 등장"
    },
    {
     "ds": "yi-sunsin",
     "id": "yi_bun",
     "role": "행장 저술"
    }
   ],
   "external": [
    {
     "name": "정조",
     "hanja": "正祖",
     "role": "『이충무공전서』 간행(1795)"
    }
   ],
   "sources": [
    {
     "title": "위키백과 「난중일기」",
     "url": "https://ko.wikipedia.org/wiki/난중일기"
    },
    {
     "title": "위키백과 「이분 (1566년)」",
     "url": "https://ko.wikipedia.org/wiki/이분_(1566년)"
    }
   ]
  },
  {
   "id": "tongjesa_1593",
   "name": "이순신 삼도수군통제사 임명",
   "hanja": "三道水軍統制使",
   "start": 1593,
   "end": null,
   "type": "정책·제도",
   "summary": "1593년 8월 조정이 경상·전라·충청 3도 수군을 통괄하는 삼도수군통제사를 처음 두고 전라좌수사 이순신을 겸임시켰다. 통제영은 한산도에 두었다.",
   "participants": [
    {
     "ds": "yi-sunsin",
     "id": "yi_sunsin",
     "role": "초대 통제사"
    }
   ],
   "external": [
    {
     "name": "선조",
     "hanja": "宣祖",
     "role": "임명"
    },
    {
     "name": "원균",
     "hanja": "元均",
     "role": "경상우수사(갈등)"
    }
   ],
   "sources": [
    {
     "title": "위키백과 「삼도수군통제사」",
     "url": "https://ko.wikipedia.org/wiki/삼도수군통제사"
    },
    {
     "title": "위키백과 「이순신」",
     "url": "https://ko.wikipedia.org/wiki/이순신"
    }
   ]
  },
  {
   "id": "wonik_chechalsa",
   "name": "이원익 4도 체찰사 활동",
   "hanja": "四道體察使",
   "start": 1595,
   "end": 1598,
   "type": "기타",
   "summary": "1595년 우의정 이원익이 경상·전라·충청·강원 4도 체찰사를 겸해 성주 등 영남 체찰사영에서 군무와 민심 수습을 맡았다. 수군 문제에서 '경상도 여러 장수 가운데 이순신이 가장 뛰어나다'며 이순신을 신뢰·옹호한 것으로 전한다.",
   "participants": [
    {
     "ds": "yi-wonik",
     "id": "yi_wonik",
     "role": "4도 체찰사"
    },
    {
     "ds": "yi-sunsin",
     "id": "yi_sunsin",
     "role": "옹호받음"
    }
   ],
   "external": [
    {
     "name": "선조",
     "hanja": "宣祖",
     "role": "임명"
    },
    {
     "name": "류성룡",
     "hanja": "柳成龍",
     "role": "영의정·도체찰사"
    }
   ],
   "sources": [
    {
     "title": "한국민족문화대백과사전 「이원익(李元翼)」",
     "url": "https://encykorea.aks.ac.kr/Article/E0045372"
    },
    {
     "title": "위키백과 「이원익」",
     "url": "https://ko.wikipedia.org/wiki/이원익"
    }
   ]
  },
  {
   "id": "imongnak_nan",
   "name": "이몽학의 난",
   "hanja": "李夢鶴의 亂",
   "start": 1596,
   "end": null,
   "type": "정변",
   "summary": "1596년 7월 왕족 서얼 이몽학이 전란 중 민심 이반을 틈타 충청도 홍산에서 일으킨 반란. 홍주목사 홍가신이 홍주성을 지키며 관군·민병을 지휘해 반란군을 흩었고, 이몽학은 부하에게 살해되었다. 홍가신은 청난공신 1등에 올랐다.",
   "participants": [
    {
     "ds": "yi-sunsin",
     "id": "hong_gasin",
     "role": "진압(홍주목사)"
    },
    {
     "ds": "yi-sunsin",
     "id": "bang_huimin",
     "role": "청난원종공신"
    }
   ],
   "external": [
    {
     "name": "이몽학",
     "hanja": "李夢鶴",
     "role": "반란 주도"
    },
    {
     "name": "최호",
     "hanja": "崔湖",
     "role": "충청수사, 공동 방어"
    },
    {
     "name": "박명현",
     "hanja": "朴名賢",
     "role": "추격"
    },
    {
     "name": "김덕령",
     "hanja": "金德齡",
     "role": "연루 무고로 옥사"
    }
   ],
   "sources": [
    {
     "title": "위키백과 「이몽학의 난」",
     "url": "https://ko.wikipedia.org/wiki/이몽학의_난"
    },
    {
     "title": "위키백과 「홍가신」",
     "url": "https://ko.wikipedia.org/wiki/홍가신"
    },
    {
     "title": "위키백과 「방진 (1514년)」",
     "url": "https://ko.wikipedia.org/wiki/방진_(1514년)"
    }
   ]
  },
  {
   "id": "sunsin_tugok",
   "name": "이순신 투옥과 백의종군",
   "hanja": "白衣從軍",
   "start": 1597,
   "end": null,
   "type": "사화·옥사",
   "summary": "1597년 2월 이순신은 부산 출격 명령을 따르지 않았다는 등의 죄로 통제사에서 파직되어 한양 의금부에 갇혔고, 정탁의 신구차 등으로 죽음을 면해 4월 1일 풀려나 도원수 권율 휘하에서 백의종군했다. 출옥하던 날 무의공의 넷째 형 비변랑 이순지가 찾아왔다(『난중일기』). 통제사 자리는 원균이 이었다.",
   "participants": [
    {
     "ds": "yi-sunsin",
     "id": "yi_sunsin",
     "role": "투옥·백의종군"
    },
    {
     "ds": "yi-sunsin-muui",
     "id": "yi_sunji",
     "role": "출옥 때 방문"
    }
   ],
   "external": [
    {
     "name": "선조",
     "hanja": "宣祖",
     "role": "하옥 명령"
    },
    {
     "name": "원균",
     "hanja": "元均",
     "role": "후임 통제사"
    },
    {
     "name": "정탁",
     "hanja": "鄭琢",
     "role": "신구차로 구명"
    },
    {
     "name": "권율",
     "hanja": "權慄",
     "role": "도원수"
    }
   ],
   "sources": [
    {
     "title": "위키백과 「백의종군」",
     "url": "https://ko.wikipedia.org/wiki/백의종군"
    },
    {
     "title": "위키백과 「이순신」",
     "url": "https://ko.wikipedia.org/wiki/이순신"
    },
    {
     "title": "『난중일기』 정유년(1597) 4월 1일 (한국고전종합DB)",
     "url": "https://db.itkc.or.kr/"
    }
   ]
  },
  {
   "id": "chilcheollyang",
   "name": "칠천량 해전",
   "hanja": "漆川梁 海戰",
   "start": 1597,
   "end": null,
   "type": "전투",
   "summary": "1597년 7월 통제사 원균이 이끈 조선 수군이 거제 칠천량에서 일본 수군의 기습을 받아 거의 전멸한 해전. 원균과 전라우수사 이억기가 전사했고, 조방장 배흥립은 원균이 달아난 뒤 남은 배로 적의 진격을 늦췄다.",
   "participants": [
    {
     "ds": "yi-sunsin-muui",
     "id": "bae_heungrip",
     "role": "조방장, 지연 전투"
    }
   ],
   "external": [
    {
     "name": "원균",
     "hanja": "元均",
     "role": "통제사, 패전·전사"
    },
    {
     "name": "이억기",
     "hanja": "李億祺",
     "role": "전라우수사, 전사"
    },
    {
     "name": "배설",
     "hanja": "裵楔",
     "role": "경상우수사, 퇴각"
    },
    {
     "name": "권율",
     "hanja": "權慄",
     "role": "도원수, 출전 독촉"
    }
   ],
   "sources": [
    {
     "title": "위키백과 「칠천량 해전」",
     "url": "https://ko.wikipedia.org/wiki/칠천량_해전"
    },
    {
     "title": "한국민족문화대백과사전 「배흥립(裵興立)」",
     "url": "https://encykorea.aks.ac.kr/Article/E0021959"
    }
   ]
  },
  {
   "id": "tongjesa_bokgwi",
   "name": "이순신 삼도수군통제사 재임명",
   "hanja": null,
   "start": 1597,
   "end": null,
   "type": "정책·제도",
   "summary": "칠천량 패전 소식에 조정은 1597년 8월 백의종군하던 이순신을 다시 삼도수군통제사에 임명했다. 이순신은 배설이 남긴 전선 12척(뒤에 13척)을 수습해 수군을 재건했다.",
   "participants": [
    {
     "ds": "yi-sunsin",
     "id": "yi_sunsin",
     "role": "재임명"
    }
   ],
   "external": [
    {
     "name": "선조",
     "hanja": "宣祖",
     "role": "재임명"
    },
    {
     "name": "배설",
     "hanja": "裵楔",
     "role": "전선 인계"
    }
   ],
   "sources": [
    {
     "title": "위키백과 「이순신」",
     "url": "https://ko.wikipedia.org/wiki/이순신"
    },
    {
     "title": "위키백과 「삼도수군통제사」",
     "url": "https://ko.wikipedia.org/wiki/삼도수군통제사"
    }
   ]
  },
  {
   "id": "myeongnyang",
   "name": "명량 해전",
   "hanja": "鳴梁 海戰",
   "start": 1597,
   "end": null,
   "type": "전투",
   "summary": "1597년 9월 16일 이순신이 13척의 전선으로 진도 울돌목(명량)의 빠른 물살을 이용해 일본 수군 130여 척을 물리친 해전. 일본 수군의 서해 진출을 막았고, 장남 이회도 참전했다.",
   "participants": [
    {
     "ds": "yi-sunsin",
     "id": "yi_sunsin",
     "role": "지휘"
    },
    {
     "ds": "yi-sunsin",
     "id": "yi_hoe",
     "role": "참전"
    }
   ],
   "external": [
    {
     "name": "안위",
     "hanja": "安衛",
     "role": "거제현령, 분전"
    },
    {
     "name": "김억추",
     "hanja": "金億秋",
     "role": "전라우수사"
    },
    {
     "name": "구루시마 미치후사",
     "hanja": "來島通總",
     "role": "일본 장수, 전사"
    }
   ],
   "sources": [
    {
     "title": "위키백과 「명량 해전」",
     "url": "https://ko.wikipedia.org/wiki/명량_해전"
    },
    {
     "title": "위키백과 「이회 (1567년)」",
     "url": "https://ko.wikipedia.org/wiki/이회_(1567년)"
    }
   ]
  },
  {
   "id": "jeongyu_jaeran",
   "name": "정유재란",
   "hanja": "丁酉再亂",
   "start": 1597,
   "end": 1598,
   "type": "전쟁",
   "summary": "강화 교섭이 깨진 뒤 1597년 일본군이 다시 침공해 1598년 도요토미 히데요시의 죽음으로 철수하기까지의 전쟁. 칠천량 패전 뒤 복귀한 이순신이 명량·노량에서 싸웠고, 그의 셋째 아들 이면은 1597년 아산에 침입한 일본군과 싸우다 전사했다.",
   "participants": [
    {
     "ds": "yi-sunsin",
     "id": "yi_sunsin",
     "role": "통제사"
    },
    {
     "ds": "yi-sunsin",
     "id": "yi_myeon",
     "role": "아산에서 전사"
    },
    {
     "ds": "yi-sunsin-muui",
     "id": "yi_sunsin_m",
     "role": "유부수군장·흥양 승전"
    },
    {
     "ds": "yi-sunsin-muui",
     "id": "bae_heungrip",
     "role": "조방장"
    }
   ],
   "external": [
    {
     "name": "선조",
     "hanja": "宣祖",
     "role": "국왕"
    },
    {
     "name": "원균",
     "hanja": "元均",
     "role": "통제사, 칠천량 전사"
    },
    {
     "name": "진린",
     "hanja": "陳璘",
     "role": "명 수군 도독"
    },
    {
     "name": "고니시 유키나가",
     "hanja": "小西行長",
     "role": "일본 장수"
    }
   ],
   "sources": [
    {
     "title": "위키백과 「정유재란」",
     "url": "https://ko.wikipedia.org/wiki/정유재란"
    },
    {
     "title": "위키백과 「이면 (1577년)」",
     "url": "https://ko.wikipedia.org/wiki/이면_(1577년)"
    }
   ]
  },
  {
   "id": "noryang",
   "name": "노량 해전",
   "hanja": "露梁 海戰",
   "start": 1598,
   "end": null,
   "type": "전투",
   "summary": "1598년 11월 19일 조명 연합 수군이 철수하는 일본군을 노량에서 요격한 임진왜란 마지막 해전. 이순신은 총탄에 맞아 전사하며 죽음을 알리지 말라 했고, 아들 이회와 조카 이완이 이를 숨긴 채 싸움을 독려했다. 무의공 이순신은 충무공 전사 뒤 함대 지휘를 이어받았다.",
   "participants": [
    {
     "ds": "yi-sunsin",
     "id": "yi_sunsin",
     "role": "지휘·전사"
    },
    {
     "ds": "yi-sunsin-muui",
     "id": "yi_sunsin_m",
     "role": "중위장, 지휘 대행"
    },
    {
     "ds": "yi-sunsin",
     "id": "yi_wan",
     "role": "전사 은폐·독전"
    },
    {
     "ds": "yi-sunsin",
     "id": "yi_hoe",
     "role": "전사 은폐·독전"
    },
    {
     "ds": "yi-sunsin",
     "id": "yi_ye",
     "role": "대장선 동승"
    },
    {
     "ds": "yi-sunsin-muui",
     "id": "bae_heungrip",
     "role": "조방장"
    }
   ],
   "external": [
    {
     "name": "진린",
     "hanja": "陳璘",
     "role": "명 수군 도독"
    },
    {
     "name": "등자룡",
     "hanja": "鄧子龍",
     "role": "명 부총병, 전사"
    },
    {
     "name": "시마즈 요시히로",
     "hanja": "島津義弘",
     "role": "일본 구원군"
    },
    {
     "name": "고니시 유키나가",
     "hanja": "小西行長",
     "role": "순천 왜성에서 철수"
    }
   ],
   "sources": [
    {
     "title": "위키백과 「노량 해전」",
     "url": "https://ko.wikipedia.org/wiki/노량_해전"
    },
    {
     "title": "위키백과 「이완 (1579년)」",
     "url": "https://ko.wikipedia.org/wiki/이완_(1579년)"
    },
    {
     "title": "위키백과 「이순신 (1554년)」",
     "url": "https://ko.wikipedia.org/wiki/이순신_(1554년)"
    },
    {
     "title": "서울신문 「노량해전에서 경상우수사로 ‘충무공의 최후’ 지키다」(2022.7.10)",
     "url": "https://www.seoul.co.kr/news/2022/07/10/20220710500022"
    }
   ]
  },
  {
   "id": "gongsin_1604",
   "name": "선무·호성·청난공신 녹훈",
   "hanja": "宣武·扈聖·淸難功臣",
   "start": 1604,
   "end": 1605,
   "type": "정책·제도",
   "summary": "1604년 임진왜란의 공으로 선무공신(전공)·호성공신(호종)·청난공신(이몽학의 난 진압)을 녹훈하고 1605년 원종공신을 정했다. 충무공 이순신은 선무공신 1등, 무의공 이순신은 3등, 이원익은 호성공신 2등, 홍가신은 청난공신 1등이 되었고 충무공의 아들·조카들은 선무원종공신에 들었다. 배흥립은 후보 26인에 올랐으나 최종 18인에서 빠졌다.",
   "participants": [
    {
     "ds": "yi-sunsin",
     "id": "yi_sunsin",
     "role": "선무공신 1등"
    },
    {
     "ds": "yi-sunsin-muui",
     "id": "yi_sunsin_m",
     "role": "선무공신 3등"
    },
    {
     "ds": "yi-wonik",
     "id": "yi_wonik",
     "role": "호성공신 2등"
    },
    {
     "ds": "yi-sunsin",
     "id": "hong_gasin",
     "role": "청난공신 1등"
    },
    {
     "ds": "yi-sunsin",
     "id": "yi_hoe",
     "role": "선무원종공신 1등"
    },
    {
     "ds": "yi-sunsin",
     "id": "yi_bun",
     "role": "선무원종공신 3등"
    },
    {
     "ds": "yi-sunsin",
     "id": "yi_bong",
     "role": "선무원종공신"
    },
    {
     "ds": "yi-sunsin-muui",
     "id": "bae_heungrip",
     "role": "후보에서 탈락"
    }
   ],
   "external": [
    {
     "name": "선조",
     "hanja": "宣祖",
     "role": "녹훈"
    },
    {
     "name": "원균",
     "hanja": "元均",
     "role": "선무공신 1등"
    },
    {
     "name": "권율",
     "hanja": "權慄",
     "role": "선무공신 1등"
    }
   ],
   "sources": [
    {
     "title": "위키백과 「선무공신」",
     "url": "https://ko.wikipedia.org/wiki/선무공신"
    },
    {
     "title": "위키백과 「호성공신」",
     "url": "https://ko.wikipedia.org/wiki/호성공신"
    },
    {
     "title": "한국민족문화대백과사전 「배흥립(裵興立)」",
     "url": "https://encykorea.aks.ac.kr/Article/E0021959"
    },
    {
     "title": "위키백과 「이회 (1567년)」",
     "url": "https://ko.wikipedia.org/wiki/이회_(1567년)"
    }
   ]
  },
  {
   "id": "daedongbeop",
   "name": "대동법(경기 선혜법) 시행",
   "hanja": "大同法",
   "start": 1608,
   "end": null,
   "type": "정책·제도",
   "summary": "광해군 즉위년(1608) 영의정 이원익의 주도로 공물을 토지 1결당 쌀 16두로 대신 거두는 대동법을 경기도에 먼저 시행하고, 이를 맡을 선혜청을 두었다. 이후 100년에 걸쳐 전국으로 확대되었다.",
   "participants": [
    {
     "ds": "yi-wonik",
     "id": "yi_wonik",
     "role": "건의·시행(영의정)"
    }
   ],
   "external": [
    {
     "name": "광해군",
     "hanja": "光海君",
     "role": "국왕"
    },
    {
     "name": "한백겸",
     "hanja": "韓百謙",
     "role": "호조참의, 방안 제시"
    },
    {
     "name": "김육",
     "hanja": "金堉",
     "role": "뒤에 충청·전라 확대"
    }
   ],
   "sources": [
    {
     "title": "위키백과 「대동법」",
     "url": "https://ko.wikipedia.org/wiki/대동법"
    },
    {
     "title": "한국민족문화대백과사전 「이원익(李元翼)」",
     "url": "https://encykorea.aks.ac.kr/Article/E0045372"
    }
   ]
  },
  {
   "id": "ohyeon-munmyo-1610",
   "name": "오현 문묘 종사",
   "hanja": "五賢文廟從祀",
   "start": 1610,
   "end": null,
   "type": "교육·서원",
   "summary": "1610년(광해군 2) 대간·성균관·각 도 유생의 지속적인 상소로 김굉필·정여창·조광조·이언적·이황이 '오현'으로 문묘에 종사되었다. 이듬해 정인홍이 이언적·이황의 종사를 반대하며 이황을 비판하자(회퇴변척) 성균관 유생들이 정인홍을 청금록에서 삭제했다.",
   "participants": [
    {
     "ds": "yi-hwang",
     "id": "yi_hwang",
     "role": "문묘 종사"
    }
   ],
   "external": [
    {
     "name": "광해군",
     "hanja": "光海君",
     "role": "국왕"
    },
    {
     "name": "정인홍",
     "hanja": "鄭仁弘",
     "role": "반대(회퇴변척, 1611)"
    },
    {
     "name": "조광조",
     "hanja": "趙光祖",
     "role": "함께 종사"
    }
   ],
   "sources": [
    {
     "title": "한국민족문화대백과사전 「김굉필」",
     "url": "https://encykorea.aks.ac.kr/Article/E0008739"
    },
    {
     "title": "한국민족문화대백과사전 「회퇴변척」",
     "url": "https://encykorea.aks.ac.kr/Article/E0076447"
    },
    {
     "title": "위키백과 「동방 18현」",
     "url": "https://ko.wikipedia.org/wiki/동방_18현"
    }
   ]
  },
  {
   "id": "pyemoron",
   "name": "인목대비 폐모론",
   "hanja": "廢母論",
   "start": 1615,
   "end": 1618,
   "type": "사화·옥사",
   "summary": "계축옥사(1613)로 영창대군이 죽은 뒤 대북 세력이 인목대비 폐위를 주장하자, 이원익은 반대 상소를 올렸다가 1615년 홍천에 유배되었고(1619년 석방) 소북의 남이공도 함께 반대하다 파직·유배되었다. 1618년 대비는 서궁에 유폐되었다.",
   "participants": [
    {
     "ds": "yi-wonik",
     "id": "yi_wonik",
     "role": "반대·홍천 유배"
    },
    {
     "ds": "yi-sunsin-muui",
     "id": "nam_igong",
     "role": "반대·파직·유배"
    },
    {
     "ds": "yi-wonik",
     "id": "yi_eoksu",
     "role": "반대"
    }
   ],
   "external": [
    {
     "name": "광해군",
     "hanja": "光海君",
     "role": "국왕"
    },
    {
     "name": "인목대비",
     "hanja": "仁穆大妃",
     "role": "폐위 대상"
    },
    {
     "name": "이이첨",
     "hanja": "李爾瞻",
     "role": "폐모 주도(대북)"
    },
    {
     "name": "기자헌",
     "hanja": "奇自獻",
     "role": "이원익 변호·반대"
    }
   ],
   "sources": [
    {
     "title": "위키백과 「인목왕후」",
     "url": "https://ko.wikipedia.org/wiki/인목왕후"
    },
    {
     "title": "위키백과 「이원익」",
     "url": "https://ko.wikipedia.org/wiki/이원익"
    },
    {
     "title": "한국민족문화대백과사전 「남이공(南以恭)」",
     "url": "https://encykorea.aks.ac.kr/Article/E0012097"
    }
   ]
  },
  {
   "id": "injo_banjeong",
   "name": "인조반정",
   "hanja": "仁祖反正",
   "start": 1623,
   "end": null,
   "type": "정변",
   "summary": "1623년 서인 세력이 광해군을 몰아내고 능양군(인조)을 옹립한 정변. 인조는 남인 원로 이원익을 가장 먼저 영의정에 불렀고, 이원익은 광해군을 죽이자는 여론을 막아 그 목숨을 구했다. 소북의 남이공은 반정으로 파직되었다.",
   "participants": [
    {
     "ds": "yi-wonik",
     "id": "yi_wonik",
     "role": "영의정 기용·광해군 구명"
    },
    {
     "ds": "yi-sunsin-muui",
     "id": "nam_igong",
     "role": "파직"
    }
   ],
   "external": [
    {
     "name": "인조",
     "hanja": "仁祖",
     "role": "즉위"
    },
    {
     "name": "광해군",
     "hanja": "光海君",
     "role": "폐위"
    },
    {
     "name": "김류",
     "hanja": "金瑬",
     "role": "반정 주도"
    },
    {
     "name": "이귀",
     "hanja": "李貴",
     "role": "반정 주도"
    }
   ],
   "sources": [
    {
     "title": "위키백과 「인조반정」",
     "url": "https://ko.wikipedia.org/wiki/인조반정"
    },
    {
     "title": "한국민족문화대백과사전 「이원익(李元翼)」",
     "url": "https://encykorea.aks.ac.kr/Article/E0045372"
    },
    {
     "title": "한국민족문화대백과사전 「남이공(南以恭)」",
     "url": "https://encykorea.aks.ac.kr/Article/E0012097"
    }
   ]
  },
  {
   "id": "igwal_nan",
   "name": "이괄의 난",
   "hanja": "李适의 亂",
   "start": 1624,
   "end": null,
   "type": "정변",
   "summary": "1624년 반정공신 논공에 불만을 품은 평안병사 이괄이 일으킨 반란으로, 한때 한양을 점령해 인조가 공주로 피란했다. 영의정 이원익이 80세 가까운 나이로 호종했고, 충무공의 서자 이훈은 안현(길마재) 전투에서 전사했으며, 무의공의 맏아들 이탁은 진무원종공신 1등에 올랐다.",
   "participants": [
    {
     "ds": "yi-wonik",
     "id": "yi_wonik",
     "role": "공주 호종"
    },
    {
     "ds": "yi-sunsin",
     "id": "yi_hun",
     "role": "안현 전투 전사"
    },
    {
     "ds": "yi-sunsin-muui",
     "id": "yi_tak",
     "role": "진무원종공신 1등"
    }
   ],
   "external": [
    {
     "name": "이괄",
     "hanja": "李适",
     "role": "반란 주도, 피살"
    },
    {
     "name": "인조",
     "hanja": "仁祖",
     "role": "공주 피란"
    },
    {
     "name": "장만",
     "hanja": "張晩",
     "role": "도원수, 진압"
    },
    {
     "name": "정충신",
     "hanja": "鄭忠信",
     "role": "안현 승전"
    }
   ],
   "sources": [
    {
     "title": "위키백과 「이괄의 난」",
     "url": "https://ko.wikipedia.org/wiki/이괄의_난"
    },
    {
     "title": "위키백과 「이훈 (1574년)」",
     "url": "https://ko.wikipedia.org/wiki/이훈_(1574년)"
    },
    {
     "title": "허목, 『기언』 별집 권22 「완천군 갈」",
     "url": "https://db.itkc.or.kr/dir/item?itemId=BT#/dir/node?dataId=ITKC_BT_0344A_0910_010_0070"
    },
    {
     "title": "한국민족문화대백과사전 「이원익(李元翼)」",
     "url": "https://encykorea.aks.ac.kr/Article/E0045372"
    }
   ]
  },
  {
   "id": "jeongmyo_horan",
   "name": "정묘호란",
   "hanja": "丁卯胡亂",
   "start": 1627,
   "end": null,
   "type": "전쟁",
   "summary": "1627년 후금이 침입해 의주·평양을 거쳐 남하하자 인조는 강화도로, 세자는 전주로 피했고 형제의 맹약을 맺고 강화했다. 의주부윤 이완은 성이 함락되자 군기고에 불을 지르고 종형제 이신과 함께 죽었으며, 도체찰사 이원익은 세자를 호위해 전주로 갔다.",
   "participants": [
    {
     "ds": "yi-sunsin",
     "id": "yi_wan",
     "role": "의주에서 분사"
    },
    {
     "ds": "yi-sunsin",
     "id": "yi_sin",
     "role": "전사"
    },
    {
     "ds": "yi-wonik",
     "id": "yi_wonik",
     "role": "도체찰사, 세자 호위"
    }
   ],
   "external": [
    {
     "name": "인조",
     "hanja": "仁祖",
     "role": "강화도 피란"
    },
    {
     "name": "아민",
     "hanja": "阿敏",
     "role": "후금 장수"
    },
    {
     "name": "소현세자",
     "hanja": "昭顯世子",
     "role": "전주 분조"
    },
    {
     "name": "최몽량",
     "hanja": "崔夢亮",
     "role": "의주 판관, 전사"
    }
   ],
   "sources": [
    {
     "title": "위키백과 「정묘호란」",
     "url": "https://ko.wikipedia.org/wiki/정묘호란"
    },
    {
     "title": "위키백과 「이완 (1579년)」",
     "url": "https://ko.wikipedia.org/wiki/이완_(1579년)"
    },
    {
     "title": "한국민족문화대백과사전 「이원익(李元翼)」",
     "url": "https://encykorea.aks.ac.kr/Article/E0045372"
    }
   ]
  },
  {
   "id": "byeongja_horan",
   "name": "병자호란",
   "hanja": "丙子胡亂",
   "start": 1636,
   "end": 1637,
   "type": "전쟁",
   "summary": "1636년 12월 청 태종이 침입하자 인조는 남한산성으로 들어가 47일간 버티다 1637년 1월 삼전도에서 항복했다. 김상헌은 끝까지 척화를 주장하며 항복 국서를 찢었고 뒤에 심양에 끌려갔다. 이원익의 아들 이의전은 남한산성에 호종했다.",
   "participants": [
    {
     "ds": "yi-wonik",
     "id": "kim_sangheon",
     "role": "척화"
    },
    {
     "ds": "yi-wonik",
     "id": "yi_uijeon",
     "role": "남한산성 호종"
    },
    {
     "ds": "yi-i",
     "id": "yi_annul",
     "role": "인조 호종"
    },
    {
     "ds": "yi-hwang",
     "id": "yi_hoebo",
     "role": "호종, 『산성일기』 저술"
    },
    {
     "ds": "yi-i",
     "id": "yi_sik",
     "role": "척화론, 뒤에 선양 압송"
    }
   ],
   "external": [
    {
     "name": "인조",
     "hanja": "仁祖",
     "role": "남한산성 농성·항복"
    },
    {
     "name": "홍타이지",
     "hanja": "皇太極",
     "role": "청 태종"
    },
    {
     "name": "최명길",
     "hanja": "崔鳴吉",
     "role": "주화"
    },
    {
     "name": "김류",
     "hanja": "金瑬",
     "role": "영의정·체찰사"
    },
    {
     "name": "홍타이지(청 태종)",
     "hanja": "皇太極",
     "role": "침략 주도"
    },
    {
     "name": "김상헌",
     "hanja": "金尙憲",
     "role": "척화 대신"
    }
   ],
   "sources": [
    {
     "title": "위키백과 「병자호란」",
     "url": "https://ko.wikipedia.org/wiki/병자호란"
    },
    {
     "title": "위키백과 「김상헌」",
     "url": "https://ko.wikipedia.org/wiki/김상헌"
    },
    {
     "title": "허목, 『기언』 권45 「완선군 묘갈음기」",
     "url": "https://db.itkc.or.kr/dir/item?itemId=BT#/dir/node?dataId=ITKC_BT_0344A_0470_010_0130"
    },
    {
     "title": "위키백과 「이안눌」",
     "url": "https://ko.wikipedia.org/wiki/이안눌"
    },
    {
     "title": "위키백과 「이식 (1584년)」",
     "url": "https://ko.wikipedia.org/wiki/이식_(1584년)"
    },
    {
     "title": "디지털안동문화대전 「진성이씨」",
     "url": "https://andong.grandculture.net/andong/toc/GC02401126"
    }
   ]
  },
  {
   "id": "boguildo_eungeo",
   "name": "윤선도의 보길도 부용동 은거",
   "hanja": "甫吉島 芙蓉洞",
   "start": 1637,
   "end": 1671,
   "type": "기타",
   "summary": "병자호란 때 강화도로 향하던 윤선도는 인조가 청에 항복했다는 소식을 듣고 세상을 등지기로 하고, 제주로 가던 길에 보길도를 만나 '부용동'이라 이름 짓고 낙서재·세연정을 지었다. 호종하지 않았다는 탄핵으로 1638년 영덕에 유배되기도 했으며, 만년까지 이곳을 오가다 1671년 낙서재에서 세상을 떠났다.",
   "participants": [
    {
     "ds": "jeong-yakyong",
     "id": "yun_seondo",
     "role": "은거·원림 조성"
    }
   ],
   "external": [
    {
     "name": "인조",
     "hanja": "仁祖",
     "role": "남한산성 항복(1637)"
    }
   ],
   "sources": [
    {
     "title": "한국민족문화대백과사전 「윤선도」",
     "url": "https://encykorea.aks.ac.kr/Article/E0042393"
    },
    {
     "title": "한국민족문화대백과사전 「보길도」",
     "url": "https://encykorea.aks.ac.kr/Article/E0023238"
    },
    {
     "title": "위키백과 「윤선도」",
     "url": "https://ko.wikipedia.org/wiki/윤선도"
    }
   ]
  },
  {
   "id": "seonjo-sujeong-sillok",
   "name": "『선조수정실록』 편찬",
   "hanja": "宣祖修正實錄",
   "start": 1641,
   "end": 1657,
   "type": "학문·저술",
   "summary": "인조반정 뒤 집권한 서인은 북인 주도로 편찬된 『선조실록』에 잘못이 많다며 수정을 추진했고, 1641년(인조 19) 이식에게 개수를 명했다. 작업은 이식 사후 미루어지다가 1657년(효종 8) 『선조소경대왕수정실록』으로 완성되었다. 조선에서 실록을 수정한 첫 사례이다.",
   "participants": [
    {
     "ds": "yi-i",
     "id": "yi_sik",
     "role": "수정 전담"
    }
   ],
   "external": [
    {
     "name": "인조",
     "hanja": "仁祖",
     "role": "수정 명령"
    },
    {
     "name": "효종",
     "hanja": "孝宗",
     "role": "완성 당시 국왕"
    }
   ],
   "sources": [
    {
     "title": "한국민족문화대백과사전 「선조실록」",
     "url": "https://encykorea.aks.ac.kr/Article/E0028917"
    },
    {
     "title": "위키백과 「선조수정실록」",
     "url": "https://ko.wikipedia.org/wiki/선조수정실록"
    },
    {
     "title": "위키백과 「이식 (1584년)」",
     "url": "https://ko.wikipedia.org/wiki/이식_(1584년)"
    }
   ]
  },
  {
   "id": "sanjung_singok",
   "name": "『산중신곡』과 「오우가」",
   "hanja": "山中新曲",
   "start": 1642,
   "end": null,
   "type": "학문·저술",
   "summary": "해남 금쇄동에 은거하던 윤선도가 1642년 「만흥」·「오우가」 등 18수의 시조를 묶어 『산중신곡』을 지었다. 물·돌·소나무·대나무·달을 벗으로 노래한 「오우가」는 국문 시조의 대표작으로 꼽힌다.",
   "participants": [
    {
     "ds": "jeong-yakyong",
     "id": "yun_seondo",
     "role": "저술"
    }
   ],
   "external": [],
   "sources": [
    {
     "title": "위키백과 「윤선도」",
     "url": "https://ko.wikipedia.org/wiki/윤선도"
    },
    {
     "title": "한국민족문화대백과사전 「윤선도」",
     "url": "https://encykorea.aks.ac.kr/Article/E0042393"
    }
   ]
  },
  {
   "id": "eobu_sasisa",
   "name": "「어부사시사」 창작",
   "hanja": "漁父四時詞",
   "start": 1651,
   "end": null,
   "type": "학문·저술",
   "summary": "1651년(효종 2) 윤선도가 보길도 부용동을 무대로 지은 40수의 연시조로, 춘하추동 각 10수씩 어촌의 경치와 강호 생활의 흥취를 읊었다. 고려 「어부가」와 이현보 「어부사」의 전통을 이어 국문 시가의 정수로 평가된다.",
   "participants": [
    {
     "ds": "jeong-yakyong",
     "id": "yun_seondo",
     "role": "저술"
    }
   ],
   "external": [],
   "sources": [
    {
     "title": "한국민족문화대백과사전 「어부사시사」",
     "url": "https://encykorea.aks.ac.kr/Article/E0035984"
    }
   ]
  },
  {
   "id": "gihae_yesong",
   "name": "기해예송",
   "hanja": "己亥禮訟",
   "start": 1659,
   "end": 1660,
   "type": "정변",
   "summary": "1659년 효종이 승하하자 자의대비의 복상 기간을 두고 서인(기년복)과 남인(삼년복)이 맞선 예송이다. 기년복으로 확정된 뒤 1660년 윤선도가 송시열의 논리가 효종의 종통을 낮춘다고 공격하는 상소를 올렸다가 탄핵을 받아 삼수에 유배되고 상소는 불태워졌다(경자분소).",
   "participants": [
    {
     "ds": "jeong-yakyong",
     "id": "yun_seondo",
     "role": "상소·삼수 유배"
    },
    {
     "ds": "yi-wonik",
     "id": "heo_mok",
     "role": "남인, 삼년설"
    }
   ],
   "external": [
    {
     "name": "송시열",
     "hanja": "宋時烈",
     "role": "서인 영수, 기년설"
    },
    {
     "name": "현종",
     "hanja": "顯宗",
     "role": "국왕"
    },
    {
     "name": "자의대비",
     "hanja": "慈懿大妃",
     "role": "복상 당사자"
    }
   ],
   "sources": [
    {
     "title": "한국민족문화대백과사전 「기해예송」",
     "url": "https://encykorea.aks.ac.kr/Article/E0076451"
    },
    {
     "title": "한국민족문화대백과사전 「경자분소사건」",
     "url": "https://encykorea.aks.ac.kr/Article/E0002755"
    }
   ]
  },
  {
   "id": "yesong",
   "name": "예송 논쟁",
   "hanja": "禮訟",
   "start": 1659,
   "end": 1674,
   "type": "사화·옥사",
   "summary": "효종과 효종비의 상에 자의대비가 입을 상복 기간을 두고 서인(송시열)과 남인(허목·윤휴)이 다툰 논쟁. 1659년 기해예송에서는 서인의 기년설이 채택되었고, 1674년 갑인예송에서 남인의 주장이 받아들여져 허목 등 남인이 집권했다.",
   "participants": [
    {
     "ds": "yi-wonik",
     "id": "heo_mok",
     "role": "남인 논객(삼년설)"
    }
   ],
   "external": [
    {
     "name": "송시열",
     "hanja": "宋時烈",
     "role": "서인, 기년설"
    },
    {
     "name": "윤휴",
     "hanja": "尹鑴",
     "role": "남인"
    },
    {
     "name": "현종",
     "hanja": "顯宗",
     "role": "국왕"
    },
    {
     "name": "자의대비",
     "hanja": "慈懿大妃",
     "role": "복상 주체"
    }
   ],
   "sources": [
    {
     "title": "위키백과 「예송 논쟁」",
     "url": "https://ko.wikipedia.org/wiki/예송_논쟁"
    },
    {
     "title": "위키백과 「허목」",
     "url": "https://ko.wikipedia.org/wiki/허목"
    }
   ]
  },
  {
   "id": "yulgok-munmyo-1682",
   "name": "이이·성혼 문묘 종사와 출향·복향",
   "hanja": "文廟從祀·黜享",
   "start": 1682,
   "end": 1694,
   "type": "교육·서원",
   "summary": "1624년 서인이 이이와 성혼의 문묘 배향을 건의했으나 남인은 이이의 입산 전력 등을 들어 반대했고, 진성 이씨 이회보도 두 사람의 배향을 주장했다. 1682년(숙종 8) 송시열·김석주 주도로 종사되었으나 1689년 기사환국으로 남인이 집권하자 출향되었고, 1694년 갑술환국으로 복향되었다. 문묘 출입이 서인·남인 당쟁의 향방을 그대로 따랐다.",
   "participants": [
    {
     "ds": "yi-i",
     "id": "yi_i",
     "role": "문묘 종사·출향·복향 대상"
    },
    {
     "ds": "yi-hwang",
     "id": "yi_hoebo",
     "role": "배향 주장"
    }
   ],
   "external": [
    {
     "name": "성혼",
     "hanja": "成渾",
     "role": "함께 종사·출향"
    },
    {
     "name": "송시열",
     "hanja": "宋時烈",
     "role": "종사 주도"
    },
    {
     "name": "숙종",
     "hanja": "肅宗",
     "role": "국왕"
    }
   ],
   "sources": [
    {
     "title": "한국민족문화대백과사전 「문묘출향」",
     "url": "https://encykorea.aks.ac.kr/Article/E0076446"
    },
    {
     "title": "디지털안동문화대전 「진성이씨」",
     "url": "https://andong.grandculture.net/andong/toc/GC02401126"
    }
   ]
  },
  {
   "id": "yun_duseo_jahwasang",
   "name": "윤두서 자화상",
   "hanja": "尹斗緖 自畵像",
   "start": 1710,
   "end": null,
   "type": "기타",
   "summary": "공재 윤두서가 그린 자화상으로, 정면을 응시하는 얼굴과 터럭 하나하나를 세밀하게 묘사해 조선 초상화의 걸작으로 꼽힌다. 해남 녹우당에 전하며 1987년 국보로 지정되었다. 정확한 제작 연대는 기록이 없어 40대 무렵(1710년 전후)으로 추정한다.",
   "participants": [
    {
     "ds": "jeong-yakyong",
     "id": "yun_duseo",
     "role": "제작"
    }
   ],
   "external": [],
   "sources": [
    {
     "title": "한국민족문화대백과사전 「윤두서 자화상」",
     "url": "https://encykorea.aks.ac.kr/Article/E0042298"
    },
    {
     "title": "위키백과 「윤두서」",
     "url": "https://ko.wikipedia.org/wiki/윤두서"
    }
   ]
  },
  {
   "id": "iinjwa_nan",
   "name": "이인좌의 난",
   "hanja": "李麟佐의 亂",
   "start": 1728,
   "end": null,
   "type": "정변",
   "summary": "1728년(영조 4) 소론 강경파와 남인 일부가 영조의 정통성을 부정하며 일으킨 반란(무신란). 이인좌가 청주성을 기습해 함락하자 충청병사 이봉상(충무공 5대손)은 항복 권유를 '충무가의 충의'로 거절하고 작은아버지 이홍무와 함께 죽었다.",
   "participants": [
    {
     "ds": "yi-sunsin",
     "id": "yi_bongsang",
     "role": "충청병사, 순절"
    },
    {
     "ds": "yi-sunsin",
     "id": "yi_hongmu",
     "role": "함께 피살"
    }
   ],
   "external": [
    {
     "name": "이인좌",
     "hanja": "李麟佐",
     "role": "반란 주도"
    },
    {
     "name": "영조",
     "hanja": "英祖",
     "role": "국왕"
    },
    {
     "name": "오명항",
     "hanja": "吳命恒",
     "role": "도순무사, 진압"
    },
    {
     "name": "남연년",
     "hanja": "南延年",
     "role": "영장, 순절"
    }
   ],
   "sources": [
    {
     "title": "위키백과 「이인좌의 난」",
     "url": "https://ko.wikipedia.org/wiki/이인좌의_난"
    },
    {
     "title": "한국민족문화대백과사전 「이봉상(李鳳祥)」",
     "url": "https://encykorea.aks.ac.kr/Article/E0044461"
    }
   ]
  },
  {
   "id": "jeongsi_1773",
   "name": "이원익 봉사손 이겸환 정시 급제",
   "hanja": "庭試",
   "start": 1773,
   "end": null,
   "type": "기타",
   "summary": "1773년(영조 49) 영조가 '고 상신 이원익의 봉사손'이라 하여 정시에서 이겸환을 뽑았다. 이겸환은 큰아버지 이언수의 양자로 이원익의 종통을 이었고 뒤에 승지·대사간에 올랐다.",
   "participants": [
    {
     "ds": "yi-wonik",
     "id": "yi_gyeomhwan",
     "role": "장원 급제"
    },
    {
     "ds": "yi-wonik",
     "id": "yi_wonik",
     "role": "현조(추숭 대상)"
    }
   ],
   "external": [
    {
     "name": "영조",
     "hanja": "英祖",
     "role": "발탁"
    }
   ],
   "sources": [
    {
     "title": "『영조실록』 영조 49년(1773) 10월 18일",
     "url": "https://sillok.history.go.kr/id/kua_14910018_001"
    },
    {
     "title": "디지털광명문화대전 「이겸환」",
     "url": "https://gwangmyeong.grandculture.net/gwangmyeong/toc/GC03100526"
    }
   ]
  },
  {
   "id": "jueosa_ganghak",
   "name": "주어사·천진암 강학회",
   "hanja": "走魚寺 天眞菴 講學會",
   "start": 1779,
   "end": null,
   "type": "교육·서원",
   "summary": "1779년 겨울 성호학파 권철신이 주도해 경기도 주어사와 천진암에서 열린 강학으로, 정약전·이벽·김원성·권상학·이총억 등이 참여했다. 주로 유학 경전을 강론했으나 이후 이들 가운데 천주교 신앙을 실천하는 이가 나와, 천주교 측에서는 교회 창설의 출발점으로 기린다. 장소와 연도(1777년설)에는 이견이 있다.",
   "participants": [
    {
     "ds": "jeong-yakyong",
     "id": "jeong_yakjeon",
     "role": "강학 참여"
    },
    {
     "ds": "jeong-yakyong",
     "id": "yi_byeok",
     "role": "강학 참여"
    }
   ],
   "external": [
    {
     "name": "권철신",
     "hanja": "權哲身",
     "role": "강학 주도"
    }
   ],
   "sources": [
    {
     "title": "한국민족문화대백과사전 「한국 천주교 강학지」",
     "url": "https://encykorea.aks.ac.kr/Article/E0081603"
    },
    {
     "title": "한국민족문화대백과사전 「주어사」",
     "url": "https://encykorea.aks.ac.kr/Article/E0053342"
    }
   ]
  },
  {
   "id": "yi_seunghun_serye",
   "name": "이승훈의 북경 세례와 천주교 수용",
   "hanja": "李承薰 受洗",
   "start": 1784,
   "end": null,
   "type": "종교",
   "summary": "동지사 서장관인 아버지 이동욱을 따라 북경에 간 이승훈이 1784년 초(음력 1월) 그라몽 신부에게 '베드로'라는 이름으로 세례를 받아 한국인 첫 영세자가 되었다. 귀국 뒤 이벽 등에게 세례를 베풀었고, 정약전·정약종·정약용 형제도 이벽을 통해 서학을 접하며 신앙 공동체가 생겨났다.",
   "participants": [
    {
     "ds": "jeong-yakyong",
     "id": "yi_seunghun",
     "role": "세례"
    },
    {
     "ds": "jeong-yakyong",
     "id": "yi_donguk",
     "role": "동지사 서장관(동행)"
    },
    {
     "ds": "jeong-yakyong",
     "id": "yi_byeok",
     "role": "전교·세례"
    },
    {
     "ds": "jeong-yakyong",
     "id": "jeong_yakjeon",
     "role": "입교"
    },
    {
     "ds": "jeong-yakyong",
     "id": "jeong_yakjong",
     "role": "입교"
    },
    {
     "ds": "jeong-yakyong",
     "id": "jeong_yakyong",
     "role": "서학 접함"
    }
   ],
   "external": [
    {
     "name": "그라몽",
     "hanja": "梁棟材",
     "role": "세례를 준 북경 북당 신부"
    },
    {
     "name": "권일신",
     "hanja": "權日身",
     "role": "초기 신자"
    }
   ],
   "sources": [
    {
     "title": "한국민족문화대백과사전 「이승훈」",
     "url": "https://encykorea.aks.ac.kr/Article/E0044963"
    },
    {
     "title": "위키백과 「이승훈 (1756년)」",
     "url": "https://ko.wikipedia.org/wiki/이승훈_(1756년)"
    },
    {
     "title": "한국민족문화대백과사전 「이벽」",
     "url": "https://encykorea.aks.ac.kr/Article/E0044377"
    }
   ]
  },
  {
   "id": "eulsa_chujo",
   "name": "을사추조적발사건(명례방 사건)",
   "hanja": "乙巳秋曹摘發事件",
   "start": 1785,
   "end": null,
   "type": "종교",
   "summary": "1784년 겨울부터 명례방 김범우의 집에서 이벽의 강론을 듣던 신앙 모임이 1785년 봄 형조 관원에게 적발된 사건이다. 이승훈과 정약전·정약종·정약용 형제, 권일신 부자 등 양반 자제는 풀려나고 중인 김범우만 유배되어 이듬해 무렵 죽었다. 조선 천주교 박해의 출발점으로 평가된다.",
   "participants": [
    {
     "ds": "jeong-yakyong",
     "id": "yi_byeok",
     "role": "강론 주도"
    },
    {
     "ds": "jeong-yakyong",
     "id": "yi_seunghun",
     "role": "참석·석방"
    },
    {
     "ds": "jeong-yakyong",
     "id": "jeong_yakjeon",
     "role": "참석·석방"
    },
    {
     "ds": "jeong-yakyong",
     "id": "jeong_yakjong",
     "role": "참석·석방"
    },
    {
     "ds": "jeong-yakyong",
     "id": "jeong_yakyong",
     "role": "참석·석방"
    }
   ],
   "external": [
    {
     "name": "김범우",
     "hanja": "金範禹",
     "role": "집주인, 유배"
    },
    {
     "name": "권일신",
     "hanja": "權日身",
     "role": "참석"
    },
    {
     "name": "김화진",
     "hanja": "金華鎭",
     "role": "형조판서"
    }
   ],
   "sources": [
    {
     "title": "한국민족문화대백과사전 「추조적발사건」",
     "url": "https://encykorea.aks.ac.kr/Article/E0057898"
    },
    {
     "title": "한국민족문화대백과사전 「명례방공동체」",
     "url": "https://encykorea.aks.ac.kr/Article/E0069925"
    }
   ]
  },
  {
   "id": "dasan_mungwa",
   "name": "정약용의 문과 급제와 규장각 초계문신",
   "hanja": "丁若鏞 文科及第",
   "start": 1789,
   "end": null,
   "type": "기타",
   "summary": "정약용은 1789년(정조 13) 식년 문과에 갑과 2위로 급제해 희릉직장으로 벼슬을 시작했고, 초계문신으로 뽑혀 규장각에서 정조의 총애를 받았다. 이후 정조 곁에서 한강 배다리와 수원 화성 설계 등 실무를 맡았다.",
   "participants": [
    {
     "ds": "jeong-yakyong",
     "id": "jeong_yakyong",
     "role": "급제"
    }
   ],
   "external": [
    {
     "name": "정조",
     "hanja": "正祖",
     "role": "국왕"
    }
   ],
   "sources": [
    {
     "title": "한국민족문화대백과사전 「정약용」",
     "url": "https://encykorea.aks.ac.kr/Article/E0050549"
    },
    {
     "title": "위키백과 「정약용」",
     "url": "https://ko.wikipedia.org/wiki/정약용"
    }
   ]
  },
  {
   "id": "hangang_baedari",
   "name": "한강 배다리(주교) 가설",
   "hanja": "漢江 舟橋",
   "start": 1789,
   "end": null,
   "type": "정책·제도",
   "summary": "정조가 사도세자의 묘를 수원 화산(현륭원)으로 옮긴 뒤 능행 때 한강을 건너기 위해 노량진에 배를 잇대어 놓은 다리로, 1789년 정약용이 설계해 준공했다. 이를 전담할 주교사를 두고 「주교절목」으로 경강 선박을 동원했으며, 그 모습은 『원행을묘정리의궤』 「주교도」에 남아 있다.",
   "participants": [
    {
     "ds": "jeong-yakyong",
     "id": "jeong_yakyong",
     "role": "설계"
    }
   ],
   "external": [
    {
     "name": "정조",
     "hanja": "正祖",
     "role": "능행·주교사 설치"
    },
    {
     "name": "정민시",
     "hanja": "鄭民始",
     "role": "주교당상"
    }
   ],
   "sources": [
    {
     "title": "한국민족문화대백과사전 「배다리」",
     "url": "https://encykorea.aks.ac.kr/Article/E0071928"
    },
    {
     "title": "한국민족문화대백과사전 「정약용」",
     "url": "https://encykorea.aks.ac.kr/Article/E0050549"
    }
   ]
  },
  {
   "id": "sinhae_bakhae",
   "name": "진산사건(신해박해)",
   "hanja": "辛亥迫害",
   "start": 1791,
   "end": null,
   "type": "종교",
   "summary": "1791년 전라도 진산의 윤지충과 외사촌 권상연이 어머니 상을 당해 신주를 불사르고 제사를 지내지 않은 일이 알려져 '무부무군'의 죄로 12월 8일 전주에서 참수되었다. 사건은 남인 내부의 공서파·신서파 대립으로 번져 이승훈이 체포·삭직되었고, 이후 양반 신자들이 교회를 떠나는 계기가 되었다.",
   "participants": [
    {
     "ds": "jeong-yakyong",
     "id": "yun_jichung",
     "role": "순교"
    },
    {
     "ds": "jeong-yakyong",
     "id": "yi_seunghun",
     "role": "체포·삭직"
    }
   ],
   "external": [
    {
     "name": "권상연",
     "hanja": "權尙然",
     "role": "순교"
    },
    {
     "name": "홍낙안",
     "hanja": "洪樂安",
     "role": "공론화(공서파)"
    },
    {
     "name": "채제공",
     "hanja": "蔡濟恭",
     "role": "확대 억제(남인 영수)"
    },
    {
     "name": "정조",
     "hanja": "正祖",
     "role": "국왕"
    }
   ],
   "sources": [
    {
     "title": "한국민족문화대백과사전 「신해박해」",
     "url": "https://encykorea.aks.ac.kr/Article/E0033544"
    },
    {
     "title": "한국민족문화대백과사전 「윤지충」",
     "url": "https://encykorea.aks.ac.kr/Article/E0042601"
    }
   ]
  },
  {
   "id": "suwon_hwaseong",
   "name": "수원 화성 설계와 축조",
   "hanja": "水原 華城",
   "start": 1792,
   "end": 1796,
   "type": "정책·제도",
   "summary": "정조의 명으로 정약용이 1792년 「성설」과 『기중도설』을 지어 화성의 축성 방식을 설계하고, 『기기도설』을 참고해 도르래를 이용한 거중기를 고안했다. 공사는 1794년 정월 시작해 1796년 완공되었고, 그 과정은 『화성성역의궤』에 자세히 기록되었다.",
   "participants": [
    {
     "ds": "jeong-yakyong",
     "id": "jeong_yakyong",
     "role": "설계·거중기 고안"
    }
   ],
   "external": [
    {
     "name": "정조",
     "hanja": "正祖",
     "role": "축성 명령"
    },
    {
     "name": "채제공",
     "hanja": "蔡濟恭",
     "role": "총리대신"
    },
    {
     "name": "조심태",
     "hanja": "趙心泰",
     "role": "감동당상"
    }
   ],
   "sources": [
    {
     "title": "한국민족문화대백과사전 「수원 화성」",
     "url": "https://encykorea.aks.ac.kr/Article/E0064671"
    },
    {
     "title": "한국민족문화대백과사전 「거중기」",
     "url": "https://encykorea.aks.ac.kr/Article/E0001891"
    },
    {
     "title": "한국민족문화대백과사전 「화성성역의궤」",
     "url": "https://encykorea.aks.ac.kr/Article/E0064682"
    }
   ]
  },
  {
   "id": "eulmyo_jumunmo",
   "name": "주문모 신부 사건(을묘박해)과 금정찰방 좌천",
   "hanja": "乙卯迫害",
   "start": 1795,
   "end": null,
   "type": "사화·옥사",
   "summary": "1794년 말~1795년 초 청나라 신부 주문모가 몰래 입국했다가 밀고로 발각되자 신부는 피신하고 최인길 등이 대신 잡혀 죽었다. 박장설 등의 상소로 정치 문제가 되자 정조는 이승훈을 예산으로 유배하고, 이가환을 충주목사로, 정약용을 금정찰방으로 좌천시켰다.",
   "participants": [
    {
     "ds": "jeong-yakyong",
     "id": "jeong_yakyong",
     "role": "금정찰방 좌천"
    },
    {
     "ds": "jeong-yakyong",
     "id": "yi_seunghun",
     "role": "예산 유배"
    }
   ],
   "external": [
    {
     "name": "주문모",
     "hanja": "周文謨",
     "role": "입국 신부, 피신"
    },
    {
     "name": "최인길",
     "hanja": "崔仁吉",
     "role": "순교"
    },
    {
     "name": "이가환",
     "hanja": "李家煥",
     "role": "충주목사 좌천"
    },
    {
     "name": "정조",
     "hanja": "正祖",
     "role": "처분"
    }
   ],
   "sources": [
    {
     "title": "한국민족문화대백과사전 「을묘박해」",
     "url": "https://encykorea.aks.ac.kr/Article/E0042943"
    },
    {
     "title": "위키백과 「정약용」",
     "url": "https://ko.wikipedia.org/wiki/정약용"
    }
   ]
  },
  {
   "id": "jeongjo_seunghha",
   "name": "정조 승하",
   "hanja": "正祖 昇遐",
   "start": 1800,
   "end": null,
   "type": "기타",
   "summary": "1800년 6월 28일 정조가 승하하고 열한 살 순조가 즉위해 대왕대비 정순왕후가 수렴청정을 했다. 후원자를 잃은 정약용은 장례를 치른 뒤 고향 마재로 물러났고, 노론 벽파가 정국을 쥐면서 남인 신서파와 천주교에 대한 대대적 탄압의 길이 열렸다.",
   "participants": [
    {
     "ds": "jeong-yakyong",
     "id": "jeong_yakyong",
     "role": "마재로 낙향"
    }
   ],
   "external": [
    {
     "name": "정조",
     "hanja": "正祖",
     "role": "승하"
    },
    {
     "name": "순조",
     "hanja": "純祖",
     "role": "즉위"
    },
    {
     "name": "정순왕후",
     "hanja": "貞純王后",
     "role": "수렴청정"
    }
   ],
   "sources": [
    {
     "title": "위키백과 「정약용」",
     "url": "https://ko.wikipedia.org/wiki/정약용"
    },
    {
     "title": "한국민족문화대백과사전 「신유박해」",
     "url": "https://encykorea.aks.ac.kr/Article/E0033249"
    }
   ]
  },
  {
   "id": "sinyu_bakhae",
   "name": "신유박해",
   "hanja": "辛酉迫害",
   "start": 1801,
   "end": null,
   "type": "사화·옥사",
   "summary": "1801년(순조 1) 정월 정순왕후의 금교령으로 시작된 대규모 천주교 박해로, 300여 명이 순교했다. 정약종과 아들 정철상, 이승훈, 윤지헌 등이 처형되고 주문모 신부도 자수 후 효수되었으며, 정약전은 신지도, 정약용은 장기로 유배되었다. 노론 벽파가 남인 시파를 몰아낸 정치적 옥사이기도 했다.",
   "participants": [
    {
     "ds": "jeong-yakyong",
     "id": "jeong_yakjong",
     "role": "순교"
    },
    {
     "ds": "jeong-yakyong",
     "id": "jeong_cheolsang",
     "role": "순교"
    },
    {
     "ds": "jeong-yakyong",
     "id": "yi_seunghun",
     "role": "처형"
    },
    {
     "ds": "jeong-yakyong",
     "id": "yun_jiheon",
     "role": "순교"
    },
    {
     "ds": "jeong-yakyong",
     "id": "jeong_yakjeon",
     "role": "유배(신지도)"
    },
    {
     "ds": "jeong-yakyong",
     "id": "jeong_yakyong",
     "role": "유배(장기)"
    },
    {
     "ds": "jeong-yakyong",
     "id": "jeong_yakhyeon",
     "role": "화를 면함"
    }
   ],
   "external": [
    {
     "name": "정순왕후",
     "hanja": "貞純王后",
     "role": "금교령 반포"
    },
    {
     "name": "주문모",
     "hanja": "周文謨",
     "role": "순교"
    },
    {
     "name": "이가환",
     "hanja": "李家煥",
     "role": "옥사"
    },
    {
     "name": "권철신",
     "hanja": "權哲身",
     "role": "옥사"
    }
   ],
   "sources": [
    {
     "title": "한국민족문화대백과사전 「신유박해」",
     "url": "https://encykorea.aks.ac.kr/Article/E0033249"
    },
    {
     "title": "위키백과 「정약종」",
     "url": "https://ko.wikipedia.org/wiki/정약종"
    },
    {
     "title": "한국민족문화대백과사전 「이승훈」",
     "url": "https://encykorea.aks.ac.kr/Article/E0044963"
    }
   ]
  },
  {
   "id": "hwang_sayeong_baekseo",
   "name": "황사영 백서 사건",
   "hanja": "黃嗣永 帛書事件",
   "start": 1801,
   "end": null,
   "type": "사화·옥사",
   "summary": "신유박해 중 제천 배론에 숨은 황사영이 박해의 경과와 교회 재건책을 흰 비단에 13,384자로 적어 북경 주교에게 보내려다 발각된 사건이다. 서양 군선 파견 요청 등이 담겨 대역죄로 몰려 황사영은 11월 능지처참되고, 아내 정난주는 제주 대정현 관비, 두 살 아들 황경한은 추자도로 보내졌다. 이 여파로 정약용·정약전이 다시 국문을 받고 강진·흑산도로 옮겨졌다.",
   "participants": [
    {
     "ds": "jeong-yakyong",
     "id": "hwang_sayeong",
     "role": "백서 작성·처형"
    },
    {
     "ds": "jeong-yakyong",
     "id": "jeong_nanju",
     "role": "제주 관비"
    },
    {
     "ds": "jeong-yakyong",
     "id": "hwang_gyeonghan",
     "role": "추자도 유배"
    },
    {
     "ds": "jeong-yakyong",
     "id": "jeong_yakyong",
     "role": "재국문·강진 이배"
    },
    {
     "ds": "jeong-yakyong",
     "id": "jeong_yakjeon",
     "role": "재국문·흑산도 이배"
    }
   ],
   "external": [
    {
     "name": "황심",
     "hanja": "黃沁",
     "role": "백서 전달 모의"
    },
    {
     "name": "옥천희",
     "hanja": "玉千禧",
     "role": "밀사"
    }
   ],
   "sources": [
    {
     "title": "한국민족문화대백과사전 「황사영 백서」",
     "url": "https://encykorea.aks.ac.kr/Article/E0065170"
    },
    {
     "title": "한국민족문화대백과사전 「황사영」",
     "url": "https://encykorea.aks.ac.kr/Article/E0065169"
    },
    {
     "title": "위키백과 「황사영」",
     "url": "https://ko.wikipedia.org/wiki/황사영"
    }
   ]
  },
  {
   "id": "yakjeon_heuksando",
   "name": "정약전의 흑산도 유배",
   "hanja": "黑山島 流配",
   "start": 1801,
   "end": 1816,
   "type": "기타",
   "summary": "신유박해로 신지도에 유배된 정약전은 황사영 백서 사건 뒤 흑산도로 옮겨져 섬 아이들을 가르치며 지냈다. 동생 정약용과 편지로 학문을 나누었으나 끝내 풀려나지 못하고 1816년 우이도에서 세상을 떠났다.",
   "participants": [
    {
     "ds": "jeong-yakyong",
     "id": "jeong_yakjeon",
     "role": "유배"
    }
   ],
   "external": [],
   "sources": [
    {
     "title": "한국민족문화대백과사전 「정약전」",
     "url": "https://encykorea.aks.ac.kr/Article/E0050551"
    },
    {
     "title": "위키백과 「정약전」",
     "url": "https://ko.wikipedia.org/wiki/정약전"
    }
   ]
  },
  {
   "id": "dasan_gangjin_yubae",
   "name": "정약용의 강진 유배와 다산초당",
   "hanja": "康津 流配 茶山草堂",
   "start": 1801,
   "end": 1818,
   "type": "기타",
   "summary": "장기에 유배되었던 정약용은 1801년 겨울 황사영 백서 사건의 여파로 강진으로 옮겨져 18년을 보냈다. 읍내 주막(사의재) 등을 거쳐 1808년 윤두서의 손자 윤단의 산정인 다산초당으로 옮겨 제자를 가르치고 경학·경세학 저술에 몰두했으며, 1818년 해배되어 마재로 돌아갔다.",
   "participants": [
    {
     "ds": "jeong-yakyong",
     "id": "jeong_yakyong",
     "role": "유배·강학·저술"
    },
    {
     "ds": "jeong-yakyong",
     "id": "namdangne",
     "role": "유배지 동반"
    }
   ],
   "external": [
    {
     "name": "윤단",
     "hanja": "尹慱",
     "role": "다산초당 제공"
    },
    {
     "name": "혜장",
     "hanja": "惠藏",
     "role": "교유(백련사)"
    }
   ],
   "sources": [
    {
     "title": "한국민족문화대백과사전 「강진 정약용 유적」",
     "url": "https://encykorea.aks.ac.kr/Article/E0050060"
    },
    {
     "title": "한국민족문화대백과사전 「정약용」",
     "url": "https://encykorea.aks.ac.kr/Article/E0050549"
    },
    {
     "title": "위키백과 「정약용」",
     "url": "https://ko.wikipedia.org/wiki/정약용"
    }
   ]
  },
  {
   "id": "jasan_eobo",
   "name": "『자산어보』 저술",
   "hanja": "玆山魚譜",
   "start": 1814,
   "end": null,
   "type": "학문·저술",
   "summary": "정약전이 흑산도 유배 중 근해의 어류·패류·해조류 등을 직접 관찰하고 문헌을 참고해 1814년 지은 3권 1책의 해양 생물 백과이다. 비늘 있는 어류·비늘 없는 어류·잡류로 나누어 55항목을 다뤘고, 서명의 '자산'은 흑산을 뜻한다.",
   "participants": [
    {
     "ds": "jeong-yakyong",
     "id": "jeong_yakjeon",
     "role": "저술"
    }
   ],
   "external": [
    {
     "name": "장덕순(창대)",
     "hanja": "張德順",
     "role": "흑산도 주민, 관찰 조력"
    }
   ],
   "sources": [
    {
     "title": "한국민족문화대백과사전 「자산어보」",
     "url": "https://encykorea.aks.ac.kr/Article/E0047944"
    }
   ]
  },
  {
   "id": "nongga_wollyeongga",
   "name": "「농가월령가」",
   "hanja": "農家月令歌",
   "start": 1816,
   "end": null,
   "type": "학문·저술",
   "summary": "정약용의 둘째 아들 정학유가 1816년 지은 것으로 고증된 월령체 장편가사로, 서사·12달·결사의 14단락에 달마다 할 농사일과 세시풍속을 노래했다. 우리말 노래로 농업기술을 보급하려 한 첫 시도로 평가된다.",
   "participants": [
    {
     "ds": "jeong-yakyong",
     "id": "jeong_hakyu",
     "role": "저술"
    }
   ],
   "external": [],
   "sources": [
    {
     "title": "한국민족문화대백과사전 「정학유」",
     "url": "https://encykorea.aks.ac.kr/Article/E0051093"
    },
    {
     "title": "한국민족문화대백과사전 「농가월령가」",
     "url": "https://encykorea.aks.ac.kr/Article/E0013072"
    }
   ]
  },
  {
   "id": "joseon_daemokgu",
   "name": "성직자 영입 운동과 조선대목구 설정",
   "hanja": "朝鮮代牧區",
   "start": 1816,
   "end": 1837,
   "type": "종교",
   "summary": "신유박해로 목자를 잃은 교회를 다시 세우려 정하상은 1816년부터 역관의 하인 신분으로 열 차례 가까이 북경을 오가며 성직자 파견을 청했고, 1825년 유진길 등과 교황에게 직접 청원서를 보냈다. 그 결과 1831년 조선대목구가 설정되고 1836~1837년 모방·샤스탕 신부와 앵베르 주교가 입국했다.",
   "participants": [
    {
     "ds": "jeong-yakyong",
     "id": "jeong_hasang",
     "role": "성직자 영입 주도"
    }
   ],
   "external": [
    {
     "name": "유진길",
     "hanja": "劉進吉",
     "role": "청원 동참"
    },
    {
     "name": "브뤼기에르",
     "hanja": null,
     "role": "초대 조선대목구장"
    },
    {
     "name": "앵베르",
     "hanja": null,
     "role": "제2대 대목구장, 1837 입국"
    }
   ],
   "sources": [
    {
     "title": "한국민족문화대백과사전 「정하상」",
     "url": "https://encykorea.aks.ac.kr/Article/E0051088"
    }
   ]
  },
  {
   "id": "gyeongse_yupyo",
   "name": "『경세유표』 저술",
   "hanja": "經世遺表",
   "start": 1817,
   "end": null,
   "type": "학문·저술",
   "summary": "정약용이 강진 유배 중 1817년 『주례』의 체제를 본떠 국가 제도 전반의 개혁안을 담은 책으로, 원제는 『방례초본』이며 미완성이다. 관제·토지·부세·환곡 개혁과 여러 산업에 대한 과세를 제안했으며, 『목민심서』·『흠흠신서』와 함께 '1표 2서'로 불린다.",
   "participants": [
    {
     "ds": "jeong-yakyong",
     "id": "jeong_yakyong",
     "role": "저술"
    }
   ],
   "external": [],
   "sources": [
    {
     "title": "한국민족문화대백과사전 「경세유표」",
     "url": "https://encykorea.aks.ac.kr/Article/E0002596"
    }
   ]
  },
  {
   "id": "mokmin_simseo",
   "name": "『목민심서』 저술",
   "hanja": "牧民心書",
   "start": 1818,
   "end": null,
   "type": "학문·저술",
   "summary": "정약용이 강진 다산초당에서 1818년 무렵 완성한 48권의 지방 행정 지침서로, 부임에서 해관까지 수령이 지켜야 할 규율과 애민·이전·호전 등 6전의 실무를 다뤘다. 곡산부사 등 지방관 경험과 유배지에서 본 백성의 실상이 바탕이 되었다.",
   "participants": [
    {
     "ds": "jeong-yakyong",
     "id": "jeong_yakyong",
     "role": "저술"
    }
   ],
   "external": [],
   "sources": [
    {
     "title": "한국민족문화대백과사전 「목민심서」",
     "url": "https://encykorea.aks.ac.kr/Article/E0018631"
    }
   ]
  },
  {
   "id": "heumheum_sinseo",
   "name": "『흠흠신서』 저술",
   "hanja": "欽欽新書",
   "start": 1819,
   "end": 1822,
   "type": "학문·저술",
   "summary": "해배 후 마재에서 정약용이 형사 사건의 조사·심리·처형을 맡은 관리를 계몽하려 지은 30권의 형법서다. 곡산부사·형조참의 때 다룬 사건과 유배지에서 보고 들은 사례에 대한 비평 등을 실었다. 1819년 무렵 초고를 마치고 1822년 편찬한 것으로 본다.",
   "participants": [
    {
     "ds": "jeong-yakyong",
     "id": "jeong_yakyong",
     "role": "저술"
    }
   ],
   "external": [],
   "sources": [
    {
     "title": "한국민족문화대백과사전 「흠흠신서」",
     "url": "https://encykorea.aks.ac.kr/Article/E0065946"
    }
   ]
  },
  {
   "id": "gihae_bakhae",
   "name": "기해박해",
   "hanja": "己亥迫害",
   "start": 1839,
   "end": null,
   "type": "종교",
   "summary": "1839년(헌종 5) 풍양 조씨 세력 주도로 벌어진 천주교 박해로, 앵베르 주교와 모방·샤스탕 신부를 비롯해 많은 신자가 처형되었다. 정하상은 체포된 뒤 호교론 「상재상서」를 올리고 9월 22일 서소문 밖에서 순교했으며, 어머니 유소사와 누이 정정혜도 순교했다.",
   "participants": [
    {
     "ds": "jeong-yakyong",
     "id": "jeong_hasang",
     "role": "「상재상서」·순교"
    },
    {
     "ds": "jeong-yakyong",
     "id": "yu_sosa",
     "role": "순교"
    },
    {
     "ds": "jeong-yakyong",
     "id": "jeong_jeonghye",
     "role": "순교"
    }
   ],
   "external": [
    {
     "name": "앵베르",
     "hanja": null,
     "role": "주교, 순교"
    },
    {
     "name": "유진길",
     "hanja": "劉進吉",
     "role": "순교"
    },
    {
     "name": "이지연",
     "hanja": "李止淵",
     "role": "우의정, 「상재상서」 수신"
    }
   ],
   "sources": [
    {
     "title": "한국민족문화대백과사전 「기해박해」",
     "url": "https://encykorea.aks.ac.kr/Article/E0008473"
    },
    {
     "title": "한국민족문화대백과사전 「상재상서」",
     "url": "https://encykorea.aks.ac.kr/Article/E0027277"
    },
    {
     "title": "한국민족문화대백과사전 「정하상」",
     "url": "https://encykorea.aks.ac.kr/Article/E0051088"
    }
   ]
  },
  {
   "id": "byeongin_bakhae",
   "name": "병인박해",
   "hanja": "丙寅迫害",
   "start": 1866,
   "end": 1871,
   "type": "종교",
   "summary": "1866년 흥선대원군이 프랑스 선교사와 신자들을 처형하며 시작해 1871년까지 이어진 조선 최대의 천주교 박해로, 병인양요·오페르트 사건(1868)·신미양요를 거치며 8천여 명이 희생된 것으로 전한다. 이승훈 집안에서도 1868년 아들(이신규)과 손자, 1871년 증손이 순교해 4대에 걸친 순교 가문이 되었다.",
   "participants": [
    {
     "ds": "jeong-yakyong",
     "id": "yi_singyu",
     "role": "순교(1868)"
    }
   ],
   "external": [
    {
     "name": "흥선대원군",
     "hanja": "興宣大院君",
     "role": "박해 주도"
    },
    {
     "name": "베르뇌",
     "hanja": null,
     "role": "주교, 순교"
    }
   ],
   "sources": [
    {
     "title": "위키백과 「병인박해」",
     "url": "https://ko.wikipedia.org/wiki/병인박해"
    },
    {
     "title": "위키백과 「이승훈 (1756년)」",
     "url": "https://ko.wikipedia.org/wiki/이승훈_(1756년)"
    }
   ]
  }
 ],
 "relations": [
  {
   "from": "wangja_nan",
   "to": "yangnyeong_pyeseja",
   "type": "영향",
   "note": "태종 즉위가 양녕의 세자 책봉으로 이어짐"
  },
  {
   "from": "yangnyeong_pyeseja",
   "to": "sejong_jeugwi",
   "type": "결과로 이어짐",
   "note": "충녕대군이 세자를 거쳐 즉위"
  },
  {
   "from": "sejong_jeugwi",
   "to": "hunminjeongeum",
   "type": "결과로 이어짐",
   "note": "세종 치세의 업적"
  },
  {
   "from": "gyeyu_jeongnan",
   "to": "jwaik_gongsin",
   "type": "결과로 이어짐",
   "note": "정권 장악 뒤 세조 즉위"
  },
  {
   "from": "yangnyeong_pyeseja",
   "to": "gyeyu_jeongnan",
   "type": "영향",
   "note": "양녕이 세조 편에 섬(동기 논란)"
  },
  {
   "from": "nokdundo",
   "to": "imjin_waeran",
   "type": "영향",
   "note": "이순신이 류성룡 천거로 전라좌수사(1591) 발탁되는 경력 배경"
  },
  {
   "from": "okpo",
   "to": "imjin_waeran",
   "type": "일부",
   "note": "제1차 출전"
  },
  {
   "from": "sacheon",
   "to": "imjin_waeran",
   "type": "일부",
   "note": "제2차 출전, 거북선 첫 출전"
  },
  {
   "from": "dangpo",
   "to": "imjin_waeran",
   "type": "일부",
   "note": "제2차 출전"
  },
  {
   "from": "hansando",
   "to": "imjin_waeran",
   "type": "일부",
   "note": "제3차 출전"
  },
  {
   "from": "busanpo",
   "to": "imjin_waeran",
   "type": "일부",
   "note": "제4차 출전"
  },
  {
   "from": "okpo",
   "to": "sacheon",
   "type": "계승",
   "note": "연속 출전"
  },
  {
   "from": "hansando",
   "to": "tongjesa_1593",
   "type": "결과로 이어짐",
   "note": "해전 공적으로 통제사 신설·임명"
  },
  {
   "from": "wonik_chechalsa",
   "to": "imjin_waeran",
   "type": "일부",
   "note": "체찰사로 전시 군무 총괄"
  },
  {
   "from": "imongnak_nan",
   "to": "imjin_waeran",
   "type": "일부",
   "note": "전란 중 민심 이반으로 발생"
  },
  {
   "from": "imongnak_nan",
   "to": "gongsin_1604",
   "type": "결과로 이어짐",
   "note": "청난공신 녹훈"
  },
  {
   "from": "sunsin_tugok",
   "to": "chilcheollyang",
   "type": "원인",
   "note": "원균이 통제사를 이어 출전"
  },
  {
   "from": "chilcheollyang",
   "to": "tongjesa_bokgwi",
   "type": "결과로 이어짐",
   "note": "수군 궤멸로 이순신 재기용"
  },
  {
   "from": "tongjesa_bokgwi",
   "to": "myeongnyang",
   "type": "결과로 이어짐",
   "note": "남은 13척으로 승리"
  },
  {
   "from": "myeongnyang",
   "to": "jeongyu_jaeran",
   "type": "일부",
   "note": "정유재란의 해전"
  },
  {
   "from": "chilcheollyang",
   "to": "jeongyu_jaeran",
   "type": "일부",
   "note": "정유재란의 해전"
  },
  {
   "from": "noryang",
   "to": "jeongyu_jaeran",
   "type": "일부",
   "note": "마지막 해전"
  },
  {
   "from": "jeongyu_jaeran",
   "to": "imjin_waeran",
   "type": "일부",
   "note": "임진왜란의 재침 국면"
  },
  {
   "from": "myeongnyang",
   "to": "noryang",
   "type": "계승",
   "note": "통제사 이순신의 연속 작전"
  },
  {
   "from": "nanjung_ilgi",
   "to": "imjin_waeran",
   "type": "일부",
   "note": "전란 중 진중 기록"
  },
  {
   "from": "imjin_waeran",
   "to": "gongsin_1604",
   "type": "결과로 이어짐",
   "note": "전후 논공행상"
  },
  {
   "from": "noryang",
   "to": "gongsin_1604",
   "type": "결과로 이어짐",
   "note": "이순신 선무공신 1등"
  },
  {
   "from": "imjin_waeran",
   "to": "daedongbeop",
   "type": "원인",
   "note": "전란 뒤 공납 폐단과 재정 파탄"
  },
  {
   "from": "pyemoron",
   "to": "injo_banjeong",
   "type": "원인",
   "note": "폐모살제가 반정의 명분"
  },
  {
   "from": "injo_banjeong",
   "to": "igwal_nan",
   "type": "원인",
   "note": "반정 논공 불만"
  },
  {
   "from": "igwal_nan",
   "to": "jeongmyo_horan",
   "type": "영향",
   "note": "이괄 잔당이 후금에 남침 유도"
  },
  {
   "from": "jeongmyo_horan",
   "to": "byeongja_horan",
   "type": "결과로 이어짐",
   "note": "형제 맹약이 군신 관계 요구로 악화"
  },
  {
   "from": "byeongja_horan",
   "to": "yesong",
   "type": "영향",
   "note": "효종(봉림대군) 볼모·즉위가 예송의 배경"
  },
  {
   "from": "boguildo_eungeo",
   "to": "eobu_sasisa",
   "type": "결과로 이어짐",
   "note": "부용동 생활이 「어부사시사」의 무대"
  },
  {
   "from": "sanjung_singok",
   "to": "eobu_sasisa",
   "type": "계승",
   "note": "은거 시가의 연장선"
  },
  {
   "from": "jueosa_ganghak",
   "to": "yi_seunghun_serye",
   "type": "영향",
   "note": "강학 동료들이 초기 신자가 됨"
  },
  {
   "from": "yi_seunghun_serye",
   "to": "eulsa_chujo",
   "type": "결과로 이어짐",
   "note": "세례 후 명례방 집회 → 적발"
  },
  {
   "from": "yi_seunghun_serye",
   "to": "sinhae_bakhae",
   "type": "영향",
   "note": "신앙 확산이 제사 거부로 이어짐"
  },
  {
   "from": "dasan_mungwa",
   "to": "hangang_baedari",
   "type": "결과로 이어짐",
   "note": "정조의 신임으로 설계 맡음"
  },
  {
   "from": "dasan_mungwa",
   "to": "suwon_hwaseong",
   "type": "결과로 이어짐",
   "note": "정조의 명으로 설계"
  },
  {
   "from": "hangang_baedari",
   "to": "suwon_hwaseong",
   "type": "영향",
   "note": "현륭원 능행·화성 경영의 일환"
  },
  {
   "from": "sinhae_bakhae",
   "to": "eulmyo_jumunmo",
   "type": "영향",
   "note": "공서파의 서학 공세 지속"
  },
  {
   "from": "eulmyo_jumunmo",
   "to": "sinyu_bakhae",
   "type": "원인",
   "note": "주문모 추적이 정사·신유박해로 확대"
  },
  {
   "from": "sinhae_bakhae",
   "to": "sinyu_bakhae",
   "type": "원인",
   "note": "천주교를 반인륜으로 규정한 명분"
  },
  {
   "from": "jeongjo_seunghha",
   "to": "sinyu_bakhae",
   "type": "원인",
   "note": "후원자 상실, 벽파 집권"
  },
  {
   "from": "hwang_sayeong_baekseo",
   "to": "sinyu_bakhae",
   "type": "일부",
   "note": "신유박해 중 일어난 사건"
  },
  {
   "from": "hwang_sayeong_baekseo",
   "to": "dasan_gangjin_yubae",
   "type": "원인",
   "note": "장기에서 강진으로 이배"
  },
  {
   "from": "hwang_sayeong_baekseo",
   "to": "yakjeon_heuksando",
   "type": "원인",
   "note": "신지도에서 흑산도로 이배"
  },
  {
   "from": "sinyu_bakhae",
   "to": "dasan_gangjin_yubae",
   "type": "결과로 이어짐",
   "note": "정약용 유배"
  },
  {
   "from": "sinyu_bakhae",
   "to": "yakjeon_heuksando",
   "type": "결과로 이어짐",
   "note": "정약전 유배"
  },
  {
   "from": "yakjeon_heuksando",
   "to": "jasan_eobo",
   "type": "결과로 이어짐",
   "note": "유배지 해양생물 관찰"
  },
  {
   "from": "dasan_gangjin_yubae",
   "to": "gyeongse_yupyo",
   "type": "결과로 이어짐",
   "note": "유배 중 저술"
  },
  {
   "from": "dasan_gangjin_yubae",
   "to": "mokmin_simseo",
   "type": "결과로 이어짐",
   "note": "다산초당에서 완성"
  },
  {
   "from": "dasan_gangjin_yubae",
   "to": "heumheum_sinseo",
   "type": "결과로 이어짐",
   "note": "유배지 견문 사례 수록, 해배 후 완성"
  },
  {
   "from": "gyeongse_yupyo",
   "to": "mokmin_simseo",
   "type": "계승",
   "note": "1표 2서"
  },
  {
   "from": "mokmin_simseo",
   "to": "heumheum_sinseo",
   "type": "계승",
   "note": "1표 2서"
  },
  {
   "from": "sinyu_bakhae",
   "to": "joseon_daemokgu",
   "type": "결과로 이어짐",
   "note": "성직자 잃은 교회 재건 운동"
  },
  {
   "from": "joseon_daemokgu",
   "to": "gihae_bakhae",
   "type": "원인",
   "note": "입국한 서양 성직자 체포·처형"
  },
  {
   "from": "sinyu_bakhae",
   "to": "gihae_bakhae",
   "type": "계승",
   "note": "정약종 일가의 2대 순교"
  },
  {
   "from": "gihae_bakhae",
   "to": "byeongin_bakhae",
   "type": "계승",
   "note": "19세기 박해의 연속"
  },
  {
   "from": "nam-i-incident-1468",
   "to": "muo-sahwa-1498",
   "type": "영향",
   "note": "고변으로 익대공신이 된 유자광이 무오사화를 주도"
  },
  {
   "from": "muo-sahwa-1498",
   "to": "gapja-sahwa-1504",
   "type": "영향",
   "note": "연산군 대 두 번째 사화로 이어짐"
  },
  {
   "from": "gapja-sahwa-1504",
   "to": "jungjong-banjeong-1506",
   "type": "원인",
   "note": "연산군의 폭정이 반정의 명분"
  },
  {
   "from": "jungjong-banjeong-1506",
   "to": "gimyo-sahwa-1519",
   "type": "원인",
   "note": "조광조의 정국공신 위훈 삭제 추진이 훈구의 반발을 부름"
  },
  {
   "from": "gimyo-sahwa-1519",
   "to": "eulsa-sahwa-1545",
   "type": "영향",
   "note": "사림 피화의 연속"
  },
  {
   "from": "eulsa-sahwa-1545",
   "to": "yangjaeyeok-byeokseo-1547",
   "type": "결과로 이어짐",
   "note": "소윤이 잔여 반대파를 추가 숙청"
  },
  {
   "from": "eulsa-sahwa-1545",
   "to": "yi-hae-exile-1550",
   "type": "원인",
   "note": "이해가 이기의 등용을 반대한 원한과 소윤 집권"
  },
  {
   "from": "yangjaeyeok-byeokseo-1547",
   "to": "yi-hae-exile-1550",
   "type": "영향",
   "note": "이기·윤원형 세력의 반대파 제거가 계속됨"
  },
  {
   "from": "sosu-seowon-1550",
   "to": "dosan-seowon-1574",
   "type": "영향",
   "note": "이황이 연 사액서원의 선례"
  },
  {
   "from": "dosan-seodang",
   "to": "dosan-seowon-1574",
   "type": "계승",
   "note": "서당 뒤편에 서원 건립"
  },
  {
   "from": "yi-i-visits-yi-hwang-1558",
   "to": "sachil-debate",
   "type": "영향",
   "note": "두 학자의 교류 뒤 이이가 이기론 논쟁에 가담"
  },
  {
   "from": "gudo-jangwon",
   "to": "yi-i-visits-yi-hwang-1558",
   "type": "일부",
   "note": "1558년 겨울 별시 장원이 같은 해"
  },
  {
   "from": "seonghak-sipdo-1568",
   "to": "seonghak-jibyo-1575",
   "type": "영향",
   "note": "선조에게 올린 제왕학 저술의 계보"
  },
  {
   "from": "gimyo-sahwa-1519",
   "to": "yulgok-hyangyak",
   "type": "영향",
   "note": "조광조의 향약 보급 노력이 사림 향약 운동으로 이어짐"
  },
  {
   "from": "yulgok-hyangyak",
   "to": "gyeokmong-yogyeol-1577",
   "type": "영향",
   "note": "1577년 해주 석담 은거 시기의 교화 활동"
  },
  {
   "from": "dongseo-bundang-1575",
   "to": "gyemi-samchan-1583",
   "type": "원인",
   "note": "동인의 이이 공격"
  },
  {
   "from": "simu-yukjo-1583",
   "to": "gyemi-samchan-1583",
   "type": "원인",
   "note": "병조사목 독단 시행이 탄핵 사유"
  },
  {
   "from": "simu-yukjo-1583",
   "to": "imjin_waeran",
   "type": "영향",
   "note": "십만양병설은 임란 뒤 대비 실패 담론과 결부(진위 논란)"
  },
  {
   "from": "imjin_waeran",
   "to": "yongin-battle-1592",
   "type": "일부",
   "note": "삼도 근왕군의 패전"
  },
  {
   "from": "imjin_waeran",
   "to": "seonjo-sujeong-sillok",
   "type": "영향",
   "note": "전란기 선조 대 기록의 당파적 재서술"
  },
  {
   "from": "dongseo-bundang-1575",
   "to": "seonjo-sujeong-sillok",
   "type": "영향",
   "note": "북인 편찬 실록을 서인이 수정"
  },
  {
   "from": "ohyeon-munmyo-1610",
   "to": "yulgok-munmyo-1682",
   "type": "영향",
   "note": "사림 문묘 종사의 선례"
  },
  {
   "from": "dongseo-bundang-1575",
   "to": "yulgok-munmyo-1682",
   "type": "영향",
   "note": "서인·남인 당쟁에 따라 종사·출향·복향"
  },
  {
   "from": "sachil-debate",
   "to": "ohyeon-munmyo-1610",
   "type": "영향",
   "note": "이황 학설의 권위가 종사 논의의 배경"
  },
  {
   "from": "gihae_yesong",
   "to": "yesong",
   "type": "일부",
   "note": "예송 논쟁의 첫 번째(기해예송)"
  },
  {
   "from": "byeongja_horan",
   "to": "boguildo_eungeo",
   "type": "원인",
   "note": "인조의 항복 소식을 듣고 은거"
  }
 ]
};
