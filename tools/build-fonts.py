# -*- coding: utf-8 -*-
"""본명조(Noto Serif KR)를 이 저장소가 쓰는 글자만 남겨 woff2로 만든다 — 인물 계보(lineage.html) 전용.

  python tools/build-fonts.py            # vendor/fonts/*.woff2 다시 만들기
  python tools/build-fonts.py --keep     # 내려받은 원본(수십 MB)을 scratch에 남겨 두기

왜 서브셋인가: 본명조 원본은 22MB다. 한자는 저장소 안에 실제로 나오는 글자만,
한글은 음절 전체(11,172자)를 넣어 검색창에 무엇을 쳐도 깨지지 않게 한다.
한자를 새로 쓰는 데이터를 넣었으면 이 도구를 다시 돌리고 vendor/fonts를 함께 커밋한다.

필요한 것: Python 3 + fonttools + brotli (`pip install fonttools brotli`). 평소 개발에는 필요 없다.
"""
import argparse, glob, io, os, subprocess, sys, tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'vendor', 'fonts')
SRC_URL = 'https://github.com/notofonts/noto-cjk/raw/main/Serif/Variable/OTF/Subset/NotoSerifKR-VF.otf'
# 뽑아 쓸 굵기: 이름·한자는 굵게, 본문은 보통.
WEIGHTS = [('Medium', 500), ('Bold', 700)]
SCAN = ['data/*.js', 'js/*.js', 'css/*.css', '*.html', 'docs/*.md', '*.md']


def wanted_chars():
    """저장소 글자 + 한글 음절 전체 + 계보도에서 쓰는 기호."""
    chars = set()
    for pat in SCAN:
        for p in glob.glob(os.path.join(ROOT, pat)):
            chars |= set(io.open(p, encoding='utf-8', errors='ignore').read())
    chars |= {chr(c) for c in range(0x20, 0x7F)}              # 아스키
    chars |= {chr(c) for c in range(0xAC00, 0xD7A4)}          # 한글 음절 전체
    chars |= {chr(c) for c in range(0x3131, 0x318F)}          # 낱자(ㄱ, ㅏ …)
    chars |= set('·…–—‥※○●◯△▲▽□■◇◆「」『』〈〉《》【】＋－×÷≒≠°※¶†‡')
    chars |= set('⼀一二三四五六七八九十百千万世代宗名基男女子女父母兄弟姉妹夫婦')
    return {c for c in chars if c.isprintable() or c == ' '}


def fetch(dst):
    if os.path.exists(dst) and os.path.getsize(dst) > 10_000_000:
        print(f'원본 있음: {dst}')
        return dst
    print(f'내려받는 중: {SRC_URL}')
    subprocess.run(['curl', '-sL', '--fail', '-m', '600', '-o', dst, SRC_URL], check=True)
    print(f'  → {os.path.getsize(dst):,} 바이트')
    return dst


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--keep', action='store_true', help='내려받은 원본을 지우지 않는다')
    args = ap.parse_args()

    from fontTools.ttLib import TTFont
    from fontTools.varLib import instancer
    from fontTools import subset

    chars = wanted_chars()
    hanja = sorted(c for c in chars if 0x3400 <= ord(c) <= 0x9FFF or 0xF900 <= ord(c) <= 0xFAFF)
    print(f'남길 글자 {len(chars):,}자 (한자 {len(hanja):,}자)')

    os.makedirs(OUT, exist_ok=True)
    cache = os.path.join(tempfile.gettempdir(), 'NotoSerifKR-VF.otf')
    src = fetch(cache)

    text = ''.join(sorted(chars))
    for name, wght in WEIGHTS:
        font = instancer.instantiateVariableFont(TTFont(src), {'wght': wght}, inplace=False, updateFontNames=False)
        opts = subset.Options()
        opts.flavor = 'woff2'
        opts.desubroutinize = True
        opts.layout_features = ['*']
        opts.name_IDs = ['*']
        opts.notdef_outline = True
        opts.recalc_bounds = True
        s = subset.Subsetter(options=opts)
        s.populate(text=text)
        s.subset(font)
        dst = os.path.join(OUT, f'NotoSerifKR-{name}.woff2')
        font.flavor = 'woff2'
        font.save(dst)
        print(f'  {os.path.basename(dst):<28} {os.path.getsize(dst):>9,} 바이트  (wght {wght})')

    if not args.keep and os.path.exists(cache):
        os.remove(cache)
        print('원본 지움 (--keep 로 남길 수 있다)')


if __name__ == '__main__':
    sys.exit(main())
