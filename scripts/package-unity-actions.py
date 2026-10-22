"""Package the five real Unity action recordings at their actual timestamps.
Requires imageio-ffmpeg==0.6.0 (same runtime as encode-unity-review.py).
Usage: python scripts/package-unity-actions.py [frames_directory] [media_directory]
Run ActionSequenceTests first. Audio is the actual captured Unity listener WAV.
"""
from pathlib import Path
import subprocess,shutil,json,hashlib,sys,wave
import imageio_ffmpeg
root=Path(__file__).resolve().parents[1];out=Path(sys.argv[2]).resolve() if len(sys.argv)>2 else root/'docs/media/unity-design-05';out.mkdir(parents=True,exist_ok=True)
source=Path(sys.argv[1]).resolve() if len(sys.argv)>1 else Path('/tmp/idle-design5-motion');times=[float(x)for x in (source/'times.txt').read_text().splitlines()];ff=imageio_ffmpeg.get_ffmpeg_exe()
for p in Path('/tmp/idle-design5-review').glob('*.png'):shutil.copy2(p,out/p.name)
# Preserve actual additional visual checks, captured by the existing full regression.
for pattern in ['empty-*.png','equipped-*.png','long-*.png','drawback-en.png']:
 for p in Path('/tmp/idle-design2-review').glob(pattern):shutil.copy2(p,out/p.name)
shutil.copy2(root/'docs/media/unity-design-04/labor-de-390.png',out/'before-labor-de-390.png')
for name in ['times.txt','segments.txt','audio-probe.txt']:shutil.copy2(source/name,out/name)
segments=[('all-five-actions',0,len(times)-1)]+[(a,int(b),int(c))for a,b,c in(x.split()for x in(source/'segments.txt').read_text().splitlines())]
metadata=[]
for name,start,end in segments:
 d=Path('/tmp/idle-design5-encode')/name;d.mkdir(parents=True,exist_ok=True)
 for n,idx in enumerate(range(start,end+1)):
  p=d/f'{n:04}.png'
  if p.exists():p.unlink()
  p.symlink_to(source/f'{idx:04}.png')
 (d/'times.txt').write_text('\n'.join(str(t)for t in times[start:end+1]))
 silent=d/'video.mp4'
 subprocess.run([sys.executable,str(root/'scripts/encode-unity-review.py'),str(d),str(silent)],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
 duration=times[end]-times[start]+(times[end]-times[end-1]);offset=times[start]-times[0]
 dest=out/(name+'.mp4')
 subprocess.run([ff,'-v','error','-y','-i',str(silent),'-ss',str(offset),'-i',str(source/'game-audio.wav'),'-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-b:a','128k','-t',str(duration),'-movflags','+faststart',str(dest)],check=True)
 subprocess.run([ff,'-v','error','-i',str(dest),'-fps_mode','passthrough','-f','null','-'],check=True)
 frames,seconds=imageio_ffmpeg.count_frames_and_secs(str(dest));assert frames==end-start+1,(name,frames,end-start+1);metadata.append(dict(file=str(dest.relative_to(root)),startFrame=start,endFrame=end,sourceFrames=end-start+1,encodedFrames=frames,measuredSeconds=round(duration,6),containerSeconds=seconds,audio='Actual Unity AudioListener mix, AAC; no substitute clips',sha256=hashlib.sha256(dest.read_bytes()).hexdigest()))
(out/'video-metadata.json').write_text(json.dumps(metadata,indent=2)+'\n');print(json.dumps(metadata,indent=2))
