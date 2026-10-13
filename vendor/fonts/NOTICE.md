# 내려받아 둔 글꼴

인물 계보(`lineage.html`)는 인터넷 없이 `file://`로 열어도 같은 모습이어야 하므로 글꼴을 저장소에 둔다.
`@font-face` 선언은 `css/fonts.css`에 있다.

| 파일 | 글꼴 | 만든 곳 | 라이선스 |
| --- | --- | --- | --- |
| `NotoSerifKR-Medium.woff2`, `NotoSerifKR-Bold.woff2` | 본명조 (Noto Serif KR / Source Han Serif K) | Google·Adobe, [notofonts/noto-cjk](https://github.com/notofonts/noto-cjk) | SIL Open Font License 1.1 |
| `MaruBuri-Regular.woff2`, `MaruBuri-SemiBold.woff2`, `MaruBuri-Bold.woff2` | 마루 부리 | 네이버, [한글한글 아름답게](https://hangeul.naver.com/font) | SIL Open Font License 1.1 |

## 왜 이 둘인가

- **한자**: 구글 폰트의 한글 명조 가운데 한자가 들어 있는 것은 본명조뿐이다(나눔명조·고운바탕·Hahmlet·송명·마루 부리는 한자 0자).
  이름 옆 한자를 크게 쓰는 계보도이므로 본명조가 필수다.
- **한글 잔글씨**: 마루 부리가 본명조보다 획이 곱고 글줄이 차분해 호칭·연도 같은 작은 글씨에 어울린다.
  한자는 없으므로 브라우저가 글자마다 본명조로 넘긴다(`font-family`에 둘을 차례로 적어 둔다).

## 다시 만들기

본명조 원본은 22MB짜리 가변 글꼴이다. 저장소에 실제로 쓰인 한자(1,100여 자)와 한글 음절 전체만 남겨 woff2로 줄였다.

```bash
pip install fonttools brotli      # 이 도구에만 필요하다
python tools/build-fonts.py       # vendor/fonts/NotoSerifKR-*.woff2 다시 만들기
```

새 한자를 쓰는 가계도 데이터를 넣었다면 이 도구를 다시 돌리고 `vendor/fonts/`를 함께 커밋한다.
돌리지 않으면 그 한자만 시스템 글꼴로 떨어진다(화면은 깨지지 않는다).

마루 부리는 배포본 woff2를 그대로 받아 썼다(서브셋하지 않았다).
