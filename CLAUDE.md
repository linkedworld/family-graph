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
- `events.html` + `js/events.js` + `css/events.css` + `data/events.js`: 인물과 사건(3D). css/bubble.css를 함께 쓰고(사건 이름표·상세 목록 스타일은 bubble.css에 있다),
  셰이더·후처리 함수는 js/bubble.js에서 복사해 왔다(한쪽을 고치면 다른 쪽도 맞출 것). 사건 데이터는 `npm test`가 검사한다.
- `gwangmyeong.html` + `data/gwangmyeong.js`: 광명의 명사. js/events.js를 `<body data-scope="gwangmyeong">`로 재사용(GM 분기).
  현재 인물은 공적 정보만 싣는다(가족·주소·SNS 금지, 테스트가 칸을 검사). 원자료 조립은 직접 고친 data 파일이 기준.
- `js/nav.js`, `css/nav.css`: 네 페이지 공용 도구 막대·페이지 메뉴. 기준 인물은 sessionStorage로 넘긴다.
- 엔진(두 페이지 공용, DOM 없음 → Node 테스트 가능):
  - `js/model.js`: 데이터 → 그래프 모델, 미상 인물·lineageGaps 생성, 양자(`legal`/`birth`/`all` mode).
  - `js/kinship.js`: 호칭·촌수 계산(`Kinship.relation(ego, target)` → `{kind, term, alt, chon, detail, path}`). 규칙은 `docs/kinship-terms.md`.
  - `js/layout.js`: 표시 노드 구성(숨김 처리)과 dagre 배치(`tree.html`만 사용).
- `data/*.js`: 가계도 하나씩 `window.GENEALOGY_DATASETS`에 push. 형식은 README "데이터 형식".
- `vendor/`: dagre 0.8.5, three.js r158(비모듈판). 수정하지 않는다.

## 규칙

- ES 모듈·`fetch`·번들러를 쓰지 않는다. 모든 JS는 IIFE로 전역 `window.Genealogy`에 등록하고 HTML의 `<script>` 순서로 읽힌다.
- **캐시 버전**: CSS·JS·데이터를 바꾸면 `index.html`·`tree.html`·`events.html`·`gwangmyeong.html`의 모든 `?v=` 값을 같은 새 값(`YYYYMMDD-N`)으로 올린다. 다르면 `npm test` 실패.
- 가계도 추가: `data/<id>.js` 작성 후 `index.html`·`tree.html`·`events.html`에 `<script>` 추가, 테스트의 `DATA_FILES`에도 추가.
- 코드 주석·UI 문구·README는 한국어. 커밋 메시지는 영어 명령형 한 줄(기존 로그 참고).
- 엔진을 바꾸면 `tests/kinship.test.mjs`에 사례를 더하고 네 가계도 모두 `check-dataset`으로 "문제 없음"을 확인한다.
- UI 변경은 브라우저로 확인: Playwright(전역 설치, Chromium `/opt/pw-browsers`)로 `file://.../index.html#<id>`, `tree.html#<id>`를
  데스크톱(1280)·휴대폰(390) 폭에서 열어 콘솔 오류와 스크린샷을 본다. WebGL은 `--use-gl=swiftshader`로 뜬다.
