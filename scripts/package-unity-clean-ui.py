"""Copy unmodified Unity camera captures. All new captures use isolated prepared QA saves."""
from pathlib import Path
import shutil,json,hashlib
root=Path(__file__).resolve().parents[1]
output=root/'docs/media/unity-clean-ui';output.mkdir(parents=True,exist_ok=True)
files=list(Path('/tmp/idle-clean-ui-review').glob('*.png'))+list(Path('/tmp/idle-meta-visual-review').glob('loadout-filled-*.png'))
for p in files:shutil.copy2(p,output/p.name)
for name,source in {'before-labor-de-390.png':'unity-navigation-forge/hardware-de-390.png','before-research-de-390.png':'unity-navigation-forge/research-de-390.png','before-equipment-de-390.png':'unity-meta-visual/loadout-filled-de-390.png'}.items():shutil.copy2(root/'docs/media'/source,output/name)
(output/'capture.json').write_text(json.dumps({'source':'Actual Unity 6000.3.26f1 camera renders, no image alteration','preparedQAStates':True,'preparedFlagRetainedInSave':True,'testFooterIntentionallyHidden':True,'before':'Historical actual Unity captures, progression/navigation may differ','files':{p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(output.glob('*.png'))}},indent=2)+'\n')
print(len(list(output.glob('*.png'))),'original PNG captures copied')
