"""Convert existing licensed source subsets; requires fonttools==4.60.2 and brotli==1.2.0.
No font download, renaming, glyph invention or replacement artwork.
Run outside Unity import: python scripts/prepare-unity-fonts.py.
"""
from pathlib import Path
from tempfile import TemporaryDirectory
from fontTools.ttLib import TTFont
from fontTools.merge import Merger
import shutil
ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / 'public/assets/fonts'
OUTPUT = ROOT / 'IdleIntelligence/Assets/IdleIntelligence/Resources/Fonts'
OUTPUT.mkdir(parents=True, exist_ok=True)
with TemporaryDirectory() as directory:
    for family, weight, name in [('ibm-plex-mono', 400, 'Body'), ('ibm-plex-mono', 700, 'Bold'), ('silkscreen', 400, 'Display')]:
        parts = []
        for subset in ['latin', 'latin-ext']:
            font = TTFont(SOURCE / f'{family}-{subset}-{weight}-normal.woff2')
            font.flavor = None
            target = Path(directory) / f'{name}-{subset}.ttf'
            font.save(target)
            parts.append(str(target))
        combined = Merger().merge(parts)
        combined.save(OUTPUT / f'Idle{name}.ttf')
        print(name, len(combined.getBestCmap()), 'mapped codepoints')
for family in ['ibm-plex-mono', 'silkscreen']:
    shutil.copyfile(SOURCE / f'{family}-LICENSE.txt', OUTPUT / f'{family}-LICENSE.txt')
