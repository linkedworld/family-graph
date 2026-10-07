// 퇴계 이황 가계 데이터 목업. 형식은 README의 '데이터 형식' 참고.
// 서버 없이 file://로 열 수 있도록 JSON 대신 전역 목록에 넣는다.
(window.GENEALOGY_DATASETS = window.GENEALOGY_DATASETS || []).push({
  "meta": {
    "id": "yi-hwang",
    "title": "퇴계 이황(退溪 李滉) 가계도",
    "subject": "yi_hwang",
    "clan": "진성 이씨(眞城李氏, 진보 이씨 眞寶李氏)",
    "description": "퇴계 이황을 중심으로 시조 이석의 윗대부터 손자 대, 외가·처가까지 정리한 목업 데이터. 이름이 전하지 않는 인물은 name을 null로 두며, 자료가 전혀 없지만 반드시 존재해야 하는 인물(어머니, 중간 세대 등)은 엔진이 '미상' 인물로 자동 생성한다.",
    "updated": "2026-10-07",
    "sources": {
      "wiki_yihwang": {
        "title": "위키백과 「이황」 – 가족 관계",
        "url": "https://ko.wikipedia.org/wiki/이황"
      },
      "wiki_clan": {
        "title": "위키백과 「진보 이씨」 – 역사·분파",
        "url": "https://ko.wikipedia.org/wiki/진보_이씨"
      },
      "wiki_gyeyang": {
        "title": "위키백과 「이계양」",
        "url": "https://ko.wikipedia.org/wiki/이계양"
      },
      "wiki_hae": {
        "title": "위키백과 「이해 (정민공)」",
        "url": "https://ko.wikipedia.org/wiki/이해_(정민공)"
      },
      "aks_jongtaek": {
        "title": "한국학중앙연구원 디지털 인문학 「퇴계종택」",
        "url": "https://dh.aks.ac.kr/~heritage/wiki/index.php/퇴계종택"
      },
      "hangyo_jongga": {
        "title": "한국교육신문 「진성 이씨 퇴계 이황 종가」",
        "url": "https://hangyo.com/news/article.html?no=74217"
      },
      "asiae_jucheon": {
        "title": "아시아경제 – 진성이씨 주촌 종택(이운후·이정)",
        "url": "https://view.asiae.co.kr/article/2024072210205802217"
      }
    }
  },

  "persons": [
    {
      "id": "yi_songju", "name": "이송주", "hanja": "李松柱", "gender": "M",
      "clan": "진성 이씨", "title": "호장(戶長)",
      "note": "시조 이석의 조부. 송안군 이자수의 정안(政案)에 따름.",
      "sources": ["wiki_clan"]
    },
    {
      "id": "yi_yeongchan", "name": "이영찬", "hanja": "李英贊", "gender": "M",
      "clan": "진성 이씨", "title": "호장(戶長)",
      "note": "시조 이석의 부친.",
      "sources": ["wiki_clan"]
    },
    {
      "id": "yi_seok", "name": "이석", "hanja": "李碩", "gender": "M",
      "clan": "진성 이씨", "gen": 1, "title": "시조(始祖), 증 봉익대부 밀직사",
      "note": "고려 충렬왕 때 진보현 아전으로 생원시 합격. 아들 이자수가 귀하게 되어 추봉.",
      "sources": ["wiki_clan"]
    },
    {
      "id": "yi_jasu", "name": "이자수", "hanja": "李子脩", "gender": "M",
      "clan": "진성 이씨", "gen": 2, "sibIndex": 1, "title": "송안군(松安君)",
      "note": "1330년 문과 급제, 홍건적 평정으로 안사공신. 만년에 안동 주촌으로 이거.",
      "sources": ["wiki_clan", "asiae_jucheon"]
    },
    {
      "id": "yi_jabang", "name": "이자방", "hanja": "李子芳", "gender": "M",
      "clan": "진성 이씨", "gen": 2, "sibIndex": 2,
      "note": "진보현에 그대로 거주(후평파).",
      "sources": ["wiki_clan"]
    },
    {
      "id": "yi_ungu", "name": "이운구", "hanja": "李云具", "gender": "M",
      "clan": "진성 이씨", "gen": 3, "sibIndex": 1, "title": "공조참의",
      "sources": ["wiki_clan"]
    },
    {
      "id": "yi_unhu", "name": "이운후", "hanja": "李云侯", "gender": "M",
      "clan": "진성 이씨", "gen": 3, "sibIndex": 2, "title": "군기시부정",
      "note": "진성 이씨 안동(주촌) 입향조.",
      "sources": ["wiki_clan", "asiae_jucheon"]
    },
    {
      "id": "yi_jeong", "name": "이정", "hanja": "李禎", "gender": "M",
      "clan": "진성 이씨", "gen": 4, "title": "선산부사",
      "note": "이운후의 외동아들. 영변판관 시절 영변진을 쌓아 여진을 막음. 이황의 증조부.",
      "sources": ["wiki_clan", "asiae_jucheon"]
    },
    {
      "id": "yi_uyang", "name": "이우양", "hanja": "李遇陽", "gender": "M",
      "clan": "진성 이씨", "gen": 5, "sibIndex": 1,
      "note": "주촌파 파조.",
      "sources": ["wiki_clan"]
    },
    {
      "id": "yi_heungyang", "name": "이흥양", "hanja": "李興陽", "gender": "M",
      "clan": "진성 이씨", "gen": 5, "sibIndex": 2,
      "note": "망천파 파조.",
      "sources": ["wiki_clan"]
    },
    {
      "id": "yi_gyeyang", "name": "이계양", "hanja": "李繼陽", "gender": "M",
      "clan": "진성 이씨", "gen": 5, "sibIndex": 3, "birth": "1424", "death": "1488",
      "pen": "노송정(老松亭)", "courtesy": "달부(達父)",
      "title": "진사, 봉화현교도, 증 이조판서, 진성군",
      "note": "이정의 3남. 온혜파 파조. 단종 폐위 후 예안으로 낙향.",
      "sources": ["wiki_gyeyang", "wiki_clan", "wiki_yihwang"]
    },
    {
      "id": "kim_youyong", "name": "김유용", "hanja": "金有庸", "gender": "M",
      "clan": "영양 김씨",
      "sources": ["wiki_yihwang"]
    },
    {
      "id": "yeongyang_kim", "name": null, "gender": "F",
      "clan": "영양 김씨", "clanHanja": "英陽金氏",
      "note": "이계양의 처, 김유용의 딸. 이름은 전하지 않음.",
      "sources": ["wiki_yihwang"]
    },
    {
      "id": "yi_sik", "name": "이식", "hanja": "李埴", "gender": "M",
      "clan": "진성 이씨", "gen": 6, "sibIndex": 1, "birth": "1463", "death": "1502",
      "title": "진사",
      "note": "이계양의 장남. 7남 1녀를 둠.",
      "sources": ["wiki_yihwang", "wiki_clan"]
    },
    {
      "id": "yi_u", "name": "이우", "hanja": "李堣", "gender": "M",
      "clan": "진성 이씨", "gen": 6, "sibIndex": 2, "birth": "1469", "death": "1517",
      "pen": "송재(松齋)",
      "title": "형조참판, 강원도관찰사, 청해군(靑海君)",
      "note": "중종반정 정국공신. 송당파 파조. 이황이 12세에 그에게 《논어》를 배움.",
      "sources": ["wiki_clan", "wiki_gyeyang"]
    },
    {
      "id": "kim_hancheol", "name": "김한철", "hanja": "金漢哲", "gender": "M",
      "clan": "의성 김씨",
      "sources": ["wiki_yihwang"]
    },
    {
      "id": "uiseong_kim", "name": null, "gender": "F",
      "clan": "의성 김씨", "clanHanja": "義城金氏", "birth": "1460", "death": "1488",
      "note": "이식의 초취(정실), 김한철의 딸. 이황에게는 전모(前母).",
      "sources": ["wiki_yihwang"]
    },
    {
      "id": "park_chi", "name": "박치", "hanja": "朴緇", "gender": "M",
      "clan": "춘천 박씨",
      "sources": ["wiki_yihwang"]
    },
    {
      "id": "chuncheon_park", "name": null, "gender": "F",
      "clan": "춘천 박씨", "clanHanja": "春川朴氏", "birth": "1470", "death": "1537",
      "note": "이식의 재취, 박치의 딸. 이황의 생모.",
      "sources": ["wiki_yihwang"]
    },
    {
      "id": "yi_jam", "name": "이잠", "hanja": "李潛", "gender": "M",
      "clan": "진성 이씨", "gen": 7, "sibIndex": 1, "birth": "1479", "death": "1536",
      "sources": ["wiki_yihwang", "wiki_clan"]
    },
    {
      "id": "yi_ha", "name": "이하", "hanja": "李河", "gender": "M",
      "clan": "진성 이씨", "gen": 7, "sibIndex": 2, "birth": "1482", "death": "1544",
      "sources": ["wiki_yihwang", "wiki_clan"]
    },
    {
      "id": "yi_daughter_sik", "name": null, "gender": "F",
      "clan": "진성 이씨", "gen": 7, "sibIndex": 2.5,
      "note": "이식의 외동딸. 신담(辛聃)에게 출가. 이름은 전하지 않음.",
      "sources": ["wiki_yihwang"]
    },
    {
      "id": "sin_dam", "name": "신담", "hanja": "辛聃", "gender": "M",
      "note": "이식의 사위.",
      "sources": ["wiki_yihwang"]
    },
    {
      "id": "yi_seorin", "name": "이서린", "hanja": "李瑞麟", "gender": "M",
      "clan": "진성 이씨", "gen": 7, "sibIndex": 3,
      "note": "요절.",
      "sources": ["wiki_yihwang"]
    },
    {
      "id": "yi_ui", "name": "이의", "hanja": "李漪", "gender": "M",
      "clan": "진성 이씨", "gen": 7, "sibIndex": 4, "birth": "1494", "death": "1532",
      "sources": ["wiki_yihwang"]
    },
    {
      "id": "yi_hae", "name": "이해", "hanja": "李瀣", "gender": "M",
      "clan": "진성 이씨", "gen": 7, "sibIndex": 5, "birth": "1496", "death": "1550",
      "pen": "온계(溫溪)", "title": "예조참판, 증 이조판서, 시호 정민(貞愍)",
      "note": "온계파 파조.",
      "sources": ["wiki_yihwang", "wiki_hae", "wiki_clan"]
    },
    {
      "id": "yi_jing", "name": "이징", "hanja": "李澄", "gender": "M",
      "clan": "진성 이씨", "gen": 7, "sibIndex": 6, "birth": "1498", "death": "1582",
      "sources": ["wiki_yihwang"]
    },
    {
      "id": "yi_hwang", "name": "이황", "hanja": "李滉", "gender": "M",
      "clan": "진성 이씨", "gen": 7, "sibIndex": 7, "birth": "1501", "death": "1570",
      "pen": "퇴계(退溪)", "courtesy": "경호(景浩)",
      "title": "대제학, 우찬성, 시호 문순(文純)",
      "note": "이식의 7남. 상계파 파조. 문묘 배향.",
      "sources": ["wiki_yihwang", "wiki_clan"]
    },
    {
      "id": "heo_chan", "name": "허찬", "hanja": "許瓚", "gender": "M",
      "clan": "김해 허씨",
      "sources": ["wiki_yihwang"]
    },
    {
      "id": "gimhae_heo", "name": null, "gender": "F",
      "clan": "김해 허씨", "clanHanja": "金海許氏", "birth": "1501", "death": "1528",
      "note": "이황의 초취, 허찬의 딸. 27세에 별세.",
      "sources": ["wiki_yihwang"]
    },
    {
      "id": "gwon_jil", "name": "권질", "hanja": "權礩", "gender": "M",
      "clan": "안동 권씨",
      "sources": ["wiki_yihwang"]
    },
    {
      "id": "andong_gwon", "name": null, "gender": "F",
      "clan": "안동 권씨", "clanHanja": "安東權氏", "birth": "1502", "death": "1546",
      "note": "이황의 재취, 권질의 딸.",
      "sources": ["wiki_yihwang"]
    },
    {
      "id": "concubine_hwang", "name": null, "gender": "F",
      "note": "이황의 첩. 서자 이적의 생모. 이름·본관이 전하지 않음.",
      "sources": ["wiki_yihwang"]
    },
    {
      "id": "duhyang", "name": "두향", "hanja": "杜香", "gender": "F",
      "title": "기녀",
      "note": "이황이 소실로 맞이함(단양군수 시절). 소생 기록 없음.",
      "sources": ["wiki_yihwang"]
    },
    {
      "id": "yi_jun", "name": "이준", "hanja": "李寯", "gender": "M",
      "clan": "진성 이씨", "gen": 8, "sibIndex": 1, "birth": "1523", "death": "1583",
      "note": "이황의 장남. 진성 이씨 족보 간행을 주관.",
      "sources": ["wiki_yihwang"]
    },
    {
      "id": "geum_jae", "name": "금재", "hanja": "琴梓", "gender": "M",
      "clan": "봉화 금씨",
      "sources": ["wiki_yihwang"]
    },
    {
      "id": "bonghwa_geum", "name": null, "gender": "F",
      "clan": "봉화 금씨", "clanHanja": "奉化琴氏",
      "note": "이준의 처, 금재의 딸.",
      "sources": ["wiki_yihwang"]
    },
    {
      "id": "yi_chae", "name": "이채", "hanja": "李寀", "gender": "M",
      "clan": "진성 이씨", "gen": 8, "sibIndex": 2, "birth": "1527", "death": "1548",
      "note": "이황의 차남. 일찍 죽자 이황이 며느리를 친정으로 돌려보내 재혼할 수 있게 함.",
      "sources": ["wiki_yihwang"]
    },
    {
      "id": "wife_chae", "name": null, "gender": "F",
      "note": "이채의 처. 이름·본관이 전하지 않음.",
      "sources": ["wiki_yihwang"]
    },
    {
      "id": "yi_jeok", "name": "이적", "hanja": "李寂", "gender": "M",
      "clan": "진성 이씨", "gen": 8, "sibIndex": 3, "birth": "1531", "death": "1608",
      "note": "서자. 이황이 호적에 올려 차별하지 않음.",
      "sources": ["wiki_yihwang"]
    },
    {
      "id": "yi_ando", "name": "이안도", "hanja": "李安道", "gender": "M",
      "clan": "진성 이씨", "gen": 9, "sibIndex": 1, "birth": "1541", "death": "1584",
      "pen": "몽재(蒙齋)",
      "note": "이황의 장손. 이황이 보낸 편지 125통이 전함.",
      "sources": ["wiki_yihwang", "aks_jongtaek", "hangyo_jongga"]
    },
    {
      "id": "andong_gwon_ando", "name": null, "gender": "F",
      "clan": "안동 권씨", "clanHanja": "安東權氏",
      "note": "이안도의 처. 퇴계종택 솟을대문에 정려가 걸려 있음.",
      "sources": ["aks_jongtaek", "hangyo_jongga"]
    },
    {
      "id": "yi_sundo", "name": "이순도", "hanja": "李純道", "gender": "M",
      "clan": "진성 이씨", "gen": 9, "sibIndex": 2, "birth": "1554", "death": "1584",
      "sources": ["wiki_yihwang"]
    },
    {
      "id": "yi_yeongdo", "name": "이영도", "hanja": "李詠道", "gender": "M",
      "clan": "진성 이씨", "gen": 9, "sibIndex": 3, "birth": "1559", "death": "1637",
      "pen": "동암(東巖)",
      "title": "원주목사",
      "note": "1600년 도산서원에서 진성 이씨 족보 초간본 간행.",
      "sources": ["wiki_yihwang", "wiki_clan"]
    },
    {
      "id": "yi_chungho", "name": "이충호", "hanja": "李忠鎬", "gender": "M",
      "clan": "진성 이씨", "gen": 20, "birth": "1872", "death": "1951",
      "note": "이황의 13대손. 1926년부터 3년에 걸쳐 퇴계종택을 새로 지음.",
      "sources": ["aks_jongtaek"]
    }
  ],

  "unions": [
    { "id": "u_songju", "husband": "yi_songju", "wife": null,
      "children": ["yi_yeongchan"] },
    { "id": "u_yeongchan", "husband": "yi_yeongchan", "wife": null,
      "children": ["yi_seok"] },
    { "id": "u_seok", "husband": "yi_seok", "wife": null,
      "children": ["yi_jasu", "yi_jabang"] },
    { "id": "u_jasu", "husband": "yi_jasu", "wife": null,
      "children": ["yi_ungu", "yi_unhu"] },
    { "id": "u_unhu", "husband": "yi_unhu", "wife": null,
      "children": ["yi_jeong"] },
    { "id": "u_jeong", "husband": "yi_jeong", "wife": null,
      "children": ["yi_uyang", "yi_heungyang", "yi_gyeyang"] },

    { "id": "u_kim_youyong", "husband": "kim_youyong", "wife": null,
      "children": ["yeongyang_kim"] },
    { "id": "u_gyeyang", "husband": "yi_gyeyang", "wife": "yeongyang_kim", "type": "정실",
      "children": ["yi_sik", "yi_u"] },

    { "id": "u_kim_hancheol", "husband": "kim_hancheol", "wife": null,
      "children": ["uiseong_kim"] },
    { "id": "u_park_chi", "husband": "park_chi", "wife": null,
      "children": ["chuncheon_park"] },
    { "id": "u_sik_1", "husband": "yi_sik", "wife": "uiseong_kim", "type": "정실", "order": 1,
      "note": "초취",
      "children": ["yi_jam", "yi_ha", "yi_daughter_sik"] },
    { "id": "u_sik_2", "husband": "yi_sik", "wife": "chuncheon_park", "type": "계실", "order": 2,
      "note": "재취",
      "children": ["yi_seorin", "yi_ui", "yi_hae", "yi_jing", "yi_hwang"] },
    { "id": "u_sindam", "husband": "sin_dam", "wife": "yi_daughter_sik", "type": "정실",
      "children": [] },

    { "id": "u_heo_chan", "husband": "heo_chan", "wife": null,
      "children": ["gimhae_heo"] },
    { "id": "u_gwon_jil", "husband": "gwon_jil", "wife": null,
      "children": ["andong_gwon"] },
    { "id": "u_hwang_1", "husband": "yi_hwang", "wife": "gimhae_heo", "type": "정실", "order": 1,
      "note": "초취",
      "children": ["yi_jun", "yi_chae"] },
    { "id": "u_hwang_2", "husband": "yi_hwang", "wife": "andong_gwon", "type": "계실", "order": 2,
      "note": "재취, 소생 없음",
      "children": [] },
    { "id": "u_hwang_3", "husband": "yi_hwang", "wife": "concubine_hwang", "type": "첩", "order": 3,
      "children": ["yi_jeok"] },
    { "id": "u_hwang_4", "husband": "yi_hwang", "wife": "duhyang", "type": "첩", "order": 4,
      "note": "소실, 소생 기록 없음",
      "children": [] },

    { "id": "u_geum_jae", "husband": "geum_jae", "wife": null,
      "children": ["bonghwa_geum"] },
    { "id": "u_jun", "husband": "yi_jun", "wife": "bonghwa_geum", "type": "정실",
      "children": ["yi_ando", "yi_sundo", "yi_yeongdo"] },
    { "id": "u_chae", "husband": "yi_chae", "wife": "wife_chae", "type": "정실",
      "note": "이채 사후 친정으로 돌아가 재혼",
      "children": [] },
    { "id": "u_ando", "husband": "yi_ando", "wife": "andong_gwon_ando", "type": "정실",
      "children": [] }
  ],

  "lineageGaps": [
    {
      "id": "gap_jongson",
      "ancestor": "yi_ando",
      "descendant": "yi_chungho",
      "generations": 11,
      "confidence": "추정",
      "note": "이충호는 이황의 13대손(이안도의 11대손)으로 전한다. 종손 계통으로 추정되나 중간 10대의 인물은 이 목업에 수록하지 않아 '미상'으로 자동 생성된다."
    }
  ]
});
