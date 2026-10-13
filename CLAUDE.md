# CLAUDE.md

한국 역사 인물 가계도 목업. 빌드·서버·의존성 없는 순수 정적 웹(`file://`로 바로 열림). 사용자용 설명은 `README.md`.

## 명령

```bash
npm test                                    # 엔진 테스트 + ?v= 버전 일치 검사 (Node 18+, 설치할 패키지 없음)
node tools/check-dataset.cjs <id> [--list]  # 데이터 검사: 참조 오류, 10촌 넘는 방계, 출처 누락
```

가계도 id: `yi-hwang`, `yi-i`, `yi-sunsin`, `yi-sunsin-muui`, `yi-wonik`, `jeong-yakyong`, `geumcheon-kang`.

## 구조

- `index.html` + `js/bubble.js` + `css/bubble.css`: 3D 버블 가계도(첫 화면, three.js r158 + 직접 쓴 셰이더). `data/events.js`를 읽어 인물 옆에 사건 결정을 세운다.
- `tree.html` + `js/app.js` + `css/style.css`: 카드 가계도(SVG, dagre 배치).
- `lineage.html` + `js/lineage.js` + `css/lineage.css`: 인물 계보. `tree.html`의 `js/app.js`·`css/style.css`를 복사해 와 거기서부터 따로 간다
  (계보도는 지금 모습을 지킨다). 엔진은 계보도와 함께 쓴다. 부부는 한 칸, 사돈은 두 줄 겹선, 이름은 한자를 크게 병기,
  인쇄는 장마다 A4 가로 한 쪽이고, 한 장에는 카드가 세로로 최대 6줄이다. 장마다 머리말·꼬리말 선과 쪽 번호가 있고
  카드와 선은 그 사이 판면에만 그린다. 카드는 겹테두리의 공식 꼴이다. 여백은 한글 기본 편집 용지(위 20·머리말 15·꼬리말 15·아래 15·좌우 30mm).
  배우자는 칸 주인의 칸 아래 띠에 함께 적고(`mergeHouseholds`, 엔진에는 주인만 넘긴다), 기준 인물의 직계는 장마다 같은 가로 자리에 세로로 선다.
  자녀선마다 출생 순서(장남·차녀…) 이름표를 단다.
  쪽 나눔은 두 방식을 고른다(`state.pageMode`). `book`(기본, `js/pagebook.js`, 테스트 `tests/pagebook.test.mjs`)은 족보식이다:
  세대 경계에서 끊어 앞 장 마지막 세대를 다음 장 첫 줄에 사본(흐린 점선 칸)으로 다시 싣고, 가로는 가지 경계에서 나누며
  한 장보다 넓은 가지는 자녀 가지로 쪼개 쪼갠 장마다 부모 사본을 세운다. 쪽을 건너는 선은 판면 안에서 끝내고 見上·見下 쪽 번호를 단다.
  `clip`은 이전 방식(전체 배치를 판면 크기로 잘라 이어 붙임)이다.
- `events.html` + `js/events.js` + `css/events.css` + `data/events.js`: 인물과 사건(3D). css/bubble.css를 함께 쓰고(사건 이름표·상세 목록 스타일은 bubble.css에 있다),
  셰이더·후처리 함수는 js/bubble.js에서 복사해 왔다(한쪽을 고치면 다른 쪽도 맞출 것). 사건 데이터는 `npm test`가 검사한다.
- `gwangmyeong.html` + `data/gwangmyeong.js`: 광명의 명사. 엔진은 `js/world.js`+`js/fx3d.js`+`css/world.css`(lonycell/videojs-simpleoverlay의
  세계사 연관도·루이 14세 화면에서 그대로 가져옴, 원본과 다른 점은 world.js 머리 주석). `js/gm-world.js`가 광명 데이터를 엔진 자료로 바꾼다(테스트 있음).
  현재 인물은 공적 정보만 싣는다(가족·주소·SNS 금지, 테스트가 칸을 검사). 원자료 조립은 직접 고친 data 파일이 기준.
- `js/nav.js`, `css/nav.css`: 다섯 페이지 공용 도구 막대·페이지 메뉴. 기준 인물은 sessionStorage로 넘긴다.
- 엔진(두 페이지 공용, DOM 없음 → Node 테스트 가능):
  - `js/model.js`: 데이터 → 그래프 모델, 미상 인물·lineageGaps 생성, 양자(`legal`/`birth`/`all` mode).
  - `js/kinship.js`: 호칭·촌수 계산(`Kinship.relation(ego, target)` → `{kind, term, alt, chon, detail, path}`). 규칙은 `docs/kinship-terms.md`.
  - `js/layout.js`: 표시 노드 구성(숨김 처리)과 dagre 배치(`tree.html`만 사용).
- `data/*.js`: 가계도 하나씩 `window.GENEALOGY_DATASETS`에 push. 형식은 README "데이터 형식".
- `vendor/`: dagre 0.8.5, three.js r158(비모듈판). 수정하지 않는다.
- `vendor/fonts/` + `css/fonts.css`: 인물 계보 전용 글꼴(본명조·마루 부리). 인터넷 없이 열어도 같은 모습이 되도록 내려받아 둔다.
  본명조는 저장소에 쓰인 한자만 남긴 서브셋이라, 새 한자를 쓰는 데이터를 넣으면 `python tools/build-fonts.py`를 다시 돌린다
  (fonttools·brotli 필요, 평소 개발에는 안 쓴다). 한글 명조 가운데 한자가 있는 것은 본명조뿐이다 — 자세한 내용은 `vendor/fonts/NOTICE.md`.

## 규칙

- ES 모듈·`fetch`·번들러를 쓰지 않는다. 모든 JS는 IIFE로 전역 `window.Genealogy`에 등록하고 HTML의 `<script>` 순서로 읽힌다.
- **캐시 버전**: CSS·JS·데이터를 바꾸면 `index.html`·`tree.html`·`lineage.html`·`events.html`·`gwangmyeong.html`의 모든 `?v=` 값을 같은 새 값(`YYYYMMDD-N`)으로 올린다. 다르면 `npm test` 실패.
- 가계도 추가: `data/<id>.js` 작성 후 `index.html`·`tree.html`·`lineage.html`·`events.html`에 `<script>` 추가, 테스트의 `DATA_FILES`에도 추가.
- 코드 주석·UI 문구·README는 한국어. 커밋 메시지는 영어 명령형 한 줄(기존 로그 참고).
- 엔진을 바꾸면 `tests/kinship.test.mjs`에 사례를 더하고 네 가계도 모두 `check-dataset`으로 "문제 없음"을 확인한다.
- UI 변경은 브라우저로 확인: Playwright(전역 설치, Chromium `/opt/pw-browsers`)로 `file://.../index.html#<id>`, `tree.html#<id>`를
  데스크톱(1280)·휴대폰(390) 폭에서 열어 콘솔 오류와 스크린샷을 본다. WebGL은 `--use-gl=swiftshader`로 뜬다.
