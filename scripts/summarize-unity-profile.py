"""Summarize the actual opt-in native ProfilerRecorder capture (no external packages)."""
import csv, json, math, statistics, sys
from pathlib import Path
folder=Path(sys.argv[1]); rows=list(csv.DictReader((folder/'frames.csv').open()))
result={}
for phase in dict.fromkeys(row['phase'] for row in rows):
    frames=[r for r in rows if r['phase']==phase]; summary={'frames':len(frames)}
    for key in frames[0]:
        if key=='phase': continue
        values=sorted(float(row[key]) for row in frames)
        summary[key]={'mean':round(statistics.mean(values),3),'p95':values[max(0,math.ceil(len(values)*.95)-1)],'max':values[-1]}
    summary['uiNodesCreated']=int(frames[-1]['uiNodes'])-int(frames[0]['uiNodes'])
    summary['framesOver20Ms']=sum(float(r['frameMs'])>20 for r in frames)
    result[phase]=summary
(folder/'summary.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({p:{k:v for k,v in s.items() if k in ['frames','frameMs','gcBytes','saveNs','tickNs','refreshNs','uiNodesCreated','framesOver20Ms']} for p,s in result.items()},indent=2))
