"""Package untouched Unity test camera captures; no image processing."""
from pathlib import Path
import hashlib,json,shutil,struct
repo=Path(__file__).resolve().parent.parent
source=Path('/tmp/idle-analysis-review')
target=repo/'docs/media/unity-analysis-planning'
target.mkdir(parents=True,exist_ok=True)
rows=[]
for name in sorted(source.glob('*.png')):
    raw=name.read_bytes()
    assert raw[:8]==b'\x89PNG\r\n\x1a\n'
    width,height=struct.unpack('>II',raw[16:24])
    shutil.copyfile(name,target/name.name)
    rows.append({'file':name.name,'width':width,'height':height,'sha256':hashlib.sha256(raw).hexdigest()})
assert len(rows)==13, len(rows)
(target/'capture.json').write_text(json.dumps({'capture':'Actual Unity scene-camera rendering, no image edits','test':'IdleIntelligence.PlayTests.AnalysisOverviewTests.ActualMobileViewsAndNoTickRecreation','prepared':True,'saveIsolation':'Temporary separate SavePathOverride; normal simulator save untouched','languages':['de','en'],'widths':[320,390,430],'files':rows},indent=2)+'\n')
print('Packaged',len(rows),'unaltered Unity captures')
