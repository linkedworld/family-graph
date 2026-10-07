// 다산 정약용 가계 데이터 목업. 형식은 README의 '데이터 형식' 참고.
(window.GENEALOGY_DATASETS = window.GENEALOGY_DATASETS || []).push({
  "meta": {
    "id": "jeong-yakyong",
    "title": "다산 정약용(茶山 丁若鏞) 가계도",
    "subject": "jeong_yakyong",
    "clan": "나주 정씨(羅州丁氏)",
    "description": "다산 정약용을 중심으로 조부 정지해부터 손자 대, 외가(해남 윤씨, 윤선도·윤두서)·처가, 매부 이승훈과 조카사위 황사영까지 정리한 목업 데이터.",
    "updated": "2026-10-07",
    "sources": {
      "wiki_dasan": { "title": "위키백과 「정약용」 – 가계", "url": "https://ko.wikipedia.org/wiki/정약용" },
      "wiki_yakjeon": { "title": "위키백과 「정약전」", "url": "https://ko.wikipedia.org/wiki/정약전" },
      "wiki_seunghun": { "title": "위키백과 「이승훈 (1756년)」", "url": "https://ko.wikipedia.org/wiki/이승훈_(1756년)" }
    }
  },

  "persons": [
    { "id": "jeong_jihae", "name": "정지해", "hanja": "丁志諧", "gender": "M", "clan": "나주 정씨", "sibIndex": 1,
      "birth": "1712", "death": "1756", "courtesy": "우경(虞卿)", "note": "정약용의 조부.", "sources": ["wiki_dasan"] },
    { "id": "jeong_jiyeol", "name": "정지열", "hanja": "丁志說", "gender": "M", "clan": "나주 정씨", "sibIndex": 2,
      "note": "정지해의 아우. 조카 정재운을 양자로 들임.", "sources": ["wiki_dasan"] },
    { "id": "hong_gilbo", "name": "홍길보", "hanja": "洪吉輔", "gender": "M", "clan": "풍산 홍씨", "sources": ["wiki_dasan"] },
    { "id": "pungsan_hong_gm", "name": null, "gender": "F", "clan": "풍산 홍씨", "clanHanja": "豊山洪氏",
      "birth": "1712", "death": "1753", "note": "정지해의 처, 홍길보의 딸.", "sources": ["wiki_dasan"] },

    { "id": "jeong_jaewon", "name": "정재원", "hanja": "丁載遠", "gender": "M", "clan": "나주 정씨", "sibIndex": 1,
      "birth": "1730", "death": "1792", "courtesy": "기백(器伯)", "title": "생원, 진주목사", "sources": ["wiki_dasan"] },
    { "id": "jeong_jaeun", "name": "정재운", "hanja": "丁載運", "gender": "M", "clan": "나주 정씨", "sibIndex": 2,
      "note": "작은할아버지 정지열의 양자로 출계.", "sources": ["wiki_dasan"] },
    { "id": "jeong_jaejin", "name": "정재진", "hanja": "丁載進", "gender": "M", "clan": "나주 정씨", "sibIndex": 3,
      "sources": ["wiki_dasan"] },

    { "id": "nam_hadeok", "name": "남하덕", "hanja": "南夏德", "gender": "M", "clan": "의령 남씨", "sources": ["wiki_dasan"] },
    { "id": "uiryeong_nam", "name": null, "gender": "F", "clan": "의령 남씨", "clanHanja": "宜寧南氏",
      "birth": "1729", "death": "1752", "note": "정재원의 초취, 남하덕의 딸. 정약용에게는 전모.", "sources": ["wiki_dasan"] },

    { "id": "yun_seondo", "name": "윤선도", "hanja": "尹善道", "gender": "M", "clan": "해남 윤씨", "birth": "1587", "death": "1671",
      "pen": "고산(孤山)", "note": "정약용의 어머니 윤소온이 윤선도의 5대손녀.", "sources": ["wiki_dasan"] },
    { "id": "yun_duseo", "name": "윤두서", "hanja": "尹斗緖", "gender": "M", "clan": "해남 윤씨", "birth": "1668", "death": "1715",
      "pen": "공재(恭齋)", "note": "자화상으로 이름난 화가. 윤선도의 증손, 정약용의 외증조부.", "sources": ["wiki_dasan"] },
    { "id": "yun_deokryeol", "name": "윤덕렬", "hanja": "尹德烈", "gender": "M", "clan": "해남 윤씨", "sources": ["wiki_dasan"] },
    { "id": "yun_soon", "name": "윤소온", "hanja": "尹小溫", "gender": "F", "clan": "해남 윤씨", "clanHanja": "海南尹氏",
      "birth": "1728", "death": "1770", "note": "정재원의 재취, 윤덕렬의 딸. 정약전·정약종·정약용의 생모.", "sources": ["wiki_dasan"] },
    { "id": "kim_seomo", "name": null, "gender": "F", "clan": "김씨", "birth": "1754", "death": "1813",
      "note": "생모 윤씨 별세 후 정재원의 소실로 들어와 정약용 형제를 양육함. 본관은 전하지 않음.", "sources": ["wiki_dasan"] },

    { "id": "jeong_yakhyeon", "name": "정약현", "hanja": "丁若鉉", "gender": "M", "clan": "나주 정씨", "sibIndex": 1,
      "birth": "1751", "death": "1821", "courtesy": "태현(太玄)", "title": "진사", "note": "3남 6녀를 둠.", "sources": ["wiki_dasan"] },
    { "id": "yi_byeok", "name": "이벽", "hanja": "李檗", "gender": "M", "clan": "경주 이씨", "birth": "1754", "death": "1786",
      "note": "조선 천주교회 창설에 참여한 학자. 정약현의 처남.", "sources": ["wiki_dasan"] },
    { "id": "gyeongju_lee", "name": null, "gender": "F", "clan": "경주 이씨", "clanHanja": "慶州李氏",
      "note": "정약현의 처, 이벽의 누이.", "sources": ["wiki_dasan"] },
    { "id": "jeong_nanju", "name": "정난주", "hanja": "丁蘭珠", "gender": "F", "clan": "나주 정씨", "birth": "1773", "death": "1848",
      "note": "정약현의 맏딸. 황사영과 혼인.", "sources": ["wiki_dasan"] },
    { "id": "hwang_sayeong", "name": "황사영", "hanja": "黃嗣永", "gender": "M", "birth": "1775", "death": "1801",
      "note": "황사영 백서 사건으로 처형됨.", "sources": ["wiki_dasan"] },
    { "id": "hwang_gyeonghan", "name": "황경한", "hanja": "黃景漢", "gender": "M", "sources": ["wiki_dasan"] },

    { "id": "jeong_yakjeon", "name": "정약전", "hanja": "丁若銓", "gender": "M", "clan": "나주 정씨", "sibIndex": 2,
      "birth": "1758", "death": "1816", "courtesy": "천전(天全)", "pen": "손암(巽庵)",
      "note": "흑산도 유배 중 《자산어보》를 지음.", "sources": ["wiki_dasan", "wiki_yakjeon"] },

    { "id": "jeong_yakjong", "name": "정약종", "hanja": "丁若鍾", "gender": "M", "clan": "나주 정씨", "sibIndex": 3,
      "birth": "1760", "death": "1801", "courtesy": "양중(養重)", "note": "신유박해 때 순교.", "sources": ["wiki_dasan"] },
    { "id": "yu_sosa", "name": "유소사", "hanja": "柳召史", "gender": "F", "birth": "1761", "death": "1839",
      "note": "정약종의 후처. 세례명 세실리아. 기해박해 때 순교.", "sources": ["wiki_dasan"] },
    { "id": "jeong_cheolsang", "name": "정철상", "hanja": "丁哲祥", "gender": "M", "clan": "나주 정씨", "sibIndex": 1, "death": "1801",
      "note": "정약종의 장남(전처 소생). 아버지와 함께 순교.", "sources": ["wiki_dasan"] },
    { "id": "jeong_hasang", "name": "정하상", "hanja": "丁夏祥", "gender": "M", "clan": "나주 정씨", "sibIndex": 2,
      "birth": "1795", "death": "1839", "note": "세례명 바오로. 기해박해 때 순교.", "sources": ["wiki_dasan"] },
    { "id": "jeong_jeonghye", "name": "정정혜", "hanja": "丁情惠", "gender": "F", "clan": "나주 정씨", "sibIndex": 3,
      "birth": "1796", "death": "1839", "note": "기해박해 때 순교.", "sources": ["wiki_dasan"] },

    { "id": "jeong_yakyong", "name": "정약용", "hanja": "丁若鏞", "gender": "M", "clan": "나주 정씨", "sibIndex": 4,
      "birth": "1762", "death": "1836", "pen": "다산(茶山)",
      "note": "정재원의 4남. 6남 3녀를 낳았으나 4남 2녀가 일찍 죽음. 강진 유배 중 《목민심서》 등을 지음.",
      "sources": ["wiki_dasan"] },
    { "id": "hong_hwabo", "name": "홍화보", "hanja": "洪和輔", "gender": "M", "clan": "풍산 홍씨", "title": "경상우도 병마절도사",
      "sources": ["wiki_dasan"] },
    { "id": "pungsan_hong", "name": null, "gender": "F", "clan": "풍산 홍씨", "clanHanja": "豊山洪氏",
      "birth": "1761", "death": "1839", "note": "정약용의 부인, 홍화보의 딸. 1776년 혼인.", "sources": ["wiki_dasan"] },
    { "id": "namdangne", "name": null, "gender": "F",
      "note": "정약용의 첩. 유배 생활을 함께 했으며 '남당네'로 불림. 한시 《남당사》의 저자로 추정.", "sources": ["wiki_dasan"] },
    { "id": "hongim", "name": "홍임", "gender": "F", "clan": "나주 정씨", "note": "서녀.", "sources": ["wiki_dasan"] },

    { "id": "jeong_hakyeon", "name": "정학연", "hanja": "丁學淵", "gender": "M", "clan": "나주 정씨", "sibIndex": 1,
      "birth": "1783", "death": "1859", "courtesy": "치수(穉修)", "sources": ["wiki_dasan"] },
    { "id": "jeong_daerim", "name": "정대림", "hanja": "丁大林", "gender": "M", "clan": "나주 정씨", "birth": "1807", "death": "1895",
      "title": "진사, 단양군수", "sources": ["wiki_dasan"] },
    { "id": "jeong_hakyu", "name": "정학유", "hanja": "丁學游", "gender": "M", "clan": "나주 정씨", "sibIndex": 2,
      "birth": "1786", "death": "1855", "courtesy": "치구(穉求)", "note": "《농가월령가》의 작자로 전함.", "sources": ["wiki_dasan"] },
    { "id": "sim_o", "name": "심오", "hanja": "沈澳", "gender": "M", "clan": "청송 심씨", "sources": ["wiki_dasan"] },
    { "id": "cheongsong_sim", "name": null, "gender": "F", "clan": "청송 심씨", "clanHanja": "靑松沈氏",
      "note": "정학유의 처, 심오의 딸.", "sources": ["wiki_dasan"] },
    { "id": "jeong_daemu", "name": "정대무", "hanja": "丁大懋", "gender": "M", "clan": "나주 정씨", "birth": "1824",
      "courtesy": "자원(子園)", "title": "참봉, 삼척부사", "sources": ["wiki_dasan"] },
    { "id": "sim_dongryang", "name": "심동량", "hanja": "沈東亮", "gender": "M", "clan": "청송 심씨", "sources": ["wiki_dasan"] },
    { "id": "cheongsong_sim_daemu", "name": null, "gender": "F", "clan": "청송 심씨", "clanHanja": "靑松沈氏",
      "note": "정대무의 처, 심동량의 딸.", "sources": ["wiki_dasan"] },
    { "id": "jeong_munseop", "name": "정문섭", "hanja": "丁文燮", "gender": "M", "clan": "나주 정씨", "birth": "1855", "death": "1908",
      "title": "문과 급제, 비서원승",
      "note": "생부는 정대무. 큰집 정대림의 양자가 되어 정약용의 종손 계통을 이음.", "sources": ["wiki_dasan"] },
    { "id": "jeong_daughter3", "name": null, "gender": "F", "clan": "나주 정씨", "sibIndex": 3, "birth": "1793",
      "note": "정약용의 삼녀. 1812년 윤창모와 혼인.", "sources": ["wiki_dasan"] },
    { "id": "yun_changmo", "name": "윤창모", "hanja": "尹昌模", "gender": "M", "birth": "1795", "death": "1856", "sources": ["wiki_dasan"] },
    { "id": "yun_seoyu", "name": "윤서유", "hanja": "尹書有", "gender": "M", "birth": "1764", "death": "1821",
      "note": "정약용의 친구이자 사돈.", "sources": ["wiki_dasan"] },

    { "id": "jeong_sister", "name": null, "gender": "F", "clan": "나주 정씨",
      "note": "정약용의 누이. 이승훈에게 출가. 손위·손아래는 확인하지 못함.", "sources": ["wiki_dasan"] },
    { "id": "yi_seunghun", "name": "이승훈", "hanja": "李承薰", "gender": "M", "clan": "평창 이씨", "birth": "1756", "death": "1801",
      "note": "한국인 최초로 세례를 받은 천주교인(세례명 베드로). 신유박해 때 처형됨.", "sources": ["wiki_dasan", "wiki_seunghun"] },

    { "id": "jeong_yakhoeng", "name": "정약횡", "hanja": "丁若鐄", "gender": "M", "clan": "나주 정씨", "sibIndex": 5,
      "birth": "1785", "death": "1829", "courtesy": "규황(奎黃)", "note": "서모 김씨 소생.", "sources": ["wiki_dasan"] },
    { "id": "jeong_halfsister", "name": null, "gender": "F", "clan": "나주 정씨", "sibIndex": 6,
      "note": "서모 김씨 소생. 채홍근(蔡弘謹)에게 출가.", "sources": ["wiki_dasan"] },
    { "id": "chae_honggeun", "name": "채홍근", "hanja": "蔡弘謹", "gender": "M", "sources": ["wiki_dasan"] }
  ],

  "unions": [
    { "id": "u_jihae_parents", "husband": null, "wife": null, "children": ["jeong_jihae", "jeong_jiyeol"] },
    { "id": "u_hong_gilbo", "husband": "hong_gilbo", "wife": null, "children": ["pungsan_hong_gm"] },
    { "id": "u_jiyeol", "husband": "jeong_jiyeol", "wife": null, "children": [] },
    { "id": "u_jihae", "husband": "jeong_jihae", "wife": "pungsan_hong_gm",
      "children": ["jeong_jaewon", "jeong_jaeun", "jeong_jaejin"] },

    { "id": "u_nam_hadeok", "husband": "nam_hadeok", "wife": null, "children": ["uiryeong_nam"] },
    { "id": "u_deokryeol", "husband": "yun_deokryeol", "wife": null, "children": ["yun_soon"] },
    { "id": "u_duseo", "husband": "yun_duseo", "wife": null, "children": ["yun_deokryeol"] },

    { "id": "u_jaewon_1", "husband": "jeong_jaewon", "wife": "uiryeong_nam", "type": "정실", "order": 1, "note": "초취",
      "children": ["jeong_yakhyeon"] },
    { "id": "u_jaewon_2", "husband": "jeong_jaewon", "wife": "yun_soon", "type": "계실", "order": 2, "note": "재취",
      "children": ["jeong_yakjeon", "jeong_yakjong", "jeong_yakyong", "jeong_sister"] },
    { "id": "u_jaewon_3", "husband": "jeong_jaewon", "wife": "kim_seomo", "type": "첩", "order": 3, "note": "소실",
      "children": ["jeong_yakhoeng", "jeong_halfsister"] },

    { "id": "u_byeok_parents", "husband": null, "wife": null, "children": ["yi_byeok", "gyeongju_lee"] },
    { "id": "u_yakhyeon", "husband": "jeong_yakhyeon", "wife": "gyeongju_lee", "children": ["jeong_nanju"] },
    { "id": "u_nanju", "husband": "hwang_sayeong", "wife": "jeong_nanju", "children": ["hwang_gyeonghan"] },

    { "id": "u_yakjong_1", "husband": "jeong_yakjong", "wife": null, "type": "정실", "order": 1, "note": "전처",
      "children": ["jeong_cheolsang"] },
    { "id": "u_yakjong_2", "husband": "jeong_yakjong", "wife": "yu_sosa", "type": "계실", "order": 2, "note": "후처",
      "children": ["jeong_hasang", "jeong_jeonghye"] },

    { "id": "u_hong_hwabo", "husband": "hong_hwabo", "wife": null, "children": ["pungsan_hong"] },
    { "id": "u_yakyong_1", "husband": "jeong_yakyong", "wife": "pungsan_hong", "type": "정실", "order": 1,
      "children": ["jeong_hakyeon", "jeong_hakyu", "jeong_daughter3"] },
    { "id": "u_yakyong_2", "husband": "jeong_yakyong", "wife": "namdangne", "type": "첩", "order": 2,
      "children": ["hongim"] },
    { "id": "u_hakyeon", "husband": "jeong_hakyeon", "wife": null, "children": ["jeong_daerim"] },
    { "id": "u_sim_o", "husband": "sim_o", "wife": null, "children": ["cheongsong_sim"] },
    { "id": "u_hakyu", "husband": "jeong_hakyu", "wife": "cheongsong_sim", "children": ["jeong_daemu"] },
    { "id": "u_daerim", "husband": "jeong_daerim", "wife": null, "children": [] },
    { "id": "u_sim_dongryang", "husband": "sim_dongryang", "wife": null, "children": ["cheongsong_sim_daemu"] },
    { "id": "u_daemu", "husband": "jeong_daemu", "wife": "cheongsong_sim_daemu", "children": ["jeong_munseop"] },
    { "id": "u_yun_seoyu", "husband": "yun_seoyu", "wife": null, "children": ["yun_changmo"] },
    { "id": "u_daughter3", "husband": "yun_changmo", "wife": "jeong_daughter3", "children": [] },

    { "id": "u_sister", "husband": "yi_seunghun", "wife": "jeong_sister", "children": [] },
    { "id": "u_halfsister", "husband": "chae_honggeun", "wife": "jeong_halfsister", "children": [] }
  ],

  "adoptions": [
    { "id": "ad_jaeun", "child": "jeong_jaeun", "union": "u_jiyeol", "note": "작은할아버지 정지열의 양자로 출계", "sources": ["wiki_dasan"] },
    { "id": "ad_munseop", "child": "jeong_munseop", "union": "u_daerim", "note": "생부 정대무, 양부 정대림(계후)", "sources": ["wiki_dasan"] }
  ],

  "lineageGaps": [
    { "id": "gap_yun", "ancestor": "yun_seondo", "descendant": "yun_duseo", "generations": 3, "confidence": "기록",
      "note": "윤두서는 윤선도의 증손. 사이 2대는 이 목업에 수록하지 않아 미상으로 생성된다." }
  ]
});
