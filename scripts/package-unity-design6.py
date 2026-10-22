"""Package native Unity review frames at their measured timestamps, with actual listener audio.
Run ActionSequenceTests + RewardPresentationTests. Requires imageio-ffmpeg==0.6.0.
No frame interpolation, retiming, image edits or replacement audio.
"""
from pathlib import Path
import subprocess,shutil,json,hashlib,sys
import imageio_ffmpeg
root=Path(__file__).resolve().parents[1];out=root/'docs/media/unity-design-06';out.mkdir(parents=True,exist_ok=True)
ff=imageio_ffmpeg.get_ffmpeg_exe();metadata=[]
for folder,full,individual in [('idle-design6-motion','all-five-actions',True),('idle-design6-rewards','all-reward-actions',True),('idle-design6-menus','menu-walk',False)]:
 source=Path('/tmp')/folder
 times=[float(x) for x in (source/'times.txt').read_text().splitlines()]
 segments=[(full,0,len(times)-1)]+([(a,int(b),int(c)) for a,b,c in (x.split() for x in (source/'segments.txt').read_text().splitlines())] if individual else [])
 for name,start,end in segments:
  d=Path('/tmp/idle-design6-encode')/name;d.mkdir(parents=True,exist_ok=True)
  for link in d.glob('*.png'):
   if link.is_symlink():link.unlink()
  for n,idx in enumerate(range(start,end+1)):
   p=d/f'{n:04}.png'
   if p.exists():p.unlink()
   original=source/f'{idx:04}.png';assert original.is_file(),original
   p.symlink_to(original)
  (d/'times.txt').write_text('\n'.join(str(t) for t in times[start:end+1]))
  silent=d/'video.mp4'
  subprocess.run([sys.executable,str(root/'scripts/encode-unity-review.py'),str(d),str(silent)],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
  duration=times[end]-times[start]+(times[end]-times[end-1]);offset=times[start]-times[0];dest=out/(name+'.mp4')
  subprocess.run([ff,'-v','error','-y','-i',str(silent),'-ss',str(offset),'-i',str(source/'game-audio.wav'),'-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-b:a','128k','-t',str(duration),'-movflags','+faststart',str(dest)],check=True)
  subprocess.run([ff,'-v','error','-i',str(dest),'-fps_mode','passthrough','-f','null','-'],check=True)
  frames,seconds=imageio_ffmpeg.count_frames_and_secs(str(dest));assert frames==end-start+1,(name,frames,end-start+1)
  metadata.append(dict(file=str(dest.relative_to(root)),source=folder,sourceFrames=end-start+1,encodedFrames=frames,measuredSeconds=round(duration,6),containerSeconds=seconds,sha256=hashlib.sha256(dest.read_bytes()).hexdigest(),audio='Actual Unity AudioListener mix, 48 kHz stereo, AAC; no substituted clips'))
 for name in ['times.txt','segments.txt','audio-probe.txt']:shutil.copy2(source/name,out/(folder+'-'+name))
for folder in ['idle-design6-review','idle-design2-review']:
 for p in (Path('/tmp')/folder).glob('*.png'):shutil.copy2(p,out/p.name)
shutil.copy2(root/'docs/media/unity-design-05/04-fusion.mp4',out/'before-fusion.mp4')
shutil.copy2(root/'docs/media/unity-design-05/fusion-de-390.png',out/'before-fusion-de-390.png')
(out/'video-metadata.json').write_text(json.dumps(metadata,indent=2)+'\n')
print(json.dumps(metadata,indent=2))
