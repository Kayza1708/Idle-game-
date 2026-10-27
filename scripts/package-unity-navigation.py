"""Package actual Unity navigation review frames, preserving recorded timing.

Run after NavigationFlowTests/MainViewRepairTests. Requires ffmpeg; pass
--ffmpeg or set IMAGEIO_FFMPEG_EXE when it is not on PATH. No generated frames,
replacement sounds, image alterations, or player saves are included.
"""
from pathlib import Path
import argparse
import hashlib
import json
import os
import shutil
import subprocess
import tempfile

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('source', nargs='?', default='/tmp/idle-navigation-review')
parser.add_argument('--ffmpeg', default=os.environ.get('IMAGEIO_FFMPEG_EXE') or shutil.which('ffmpeg'))
args = parser.parse_args()
if not args.ffmpeg:
    parser.error('Provide --ffmpeg or IMAGEIO_FFMPEG_EXE.')
root = Path(__file__).resolve().parents[1]
source = Path(args.source).resolve()
output = root / 'docs/media/unity-navigation-forge'
output.mkdir(parents=True, exist_ok=True)
for picture in source.glob('*.png'):
    shutil.copy2(picture, output / picture.name)
for language in ('de', 'en'):
    for width in (320, 390, 430):
        picture = Path('/tmp/idle-mainview-review') / f'hardware-{language}-1-{width}.png'
        shutil.copy2(picture, output / f'fresh-four-tabs-{language}-{width}.png')
for name, before in {
    'before-research-de-390.png': 'docs/media/unity-iphone-repair/research-de-390.png',
    'before-navigation-de-390.png': 'docs/media/unity-prestige-skin/int-de-390.png',
}.items():
    shutil.copy2(root / before, output / name)
frames = source / 'motion'
times = [float(line) for line in (frames / 'times.txt').read_text().splitlines()]
assert len(times) > 1 and all(b > a for a, b in zip(times, times[1:]))
for name, at in (('craft-reveal', 2.6), ('fusion-reveal', 7.1)):
    index = min(range(len(times)), key=lambda i: abs(times[i] - at))
    shutil.copy2(frames / f'{index:04d}.png', output / f'{name}.png')
probe = (frames / 'audio-probe.txt').read_text()
values = dict(token.split('=') for token in probe.split())
has_audio = int(values['channels']) > 0 and float(values['peak']) > .00001
video = output / 'craft-and-fusion.mp4'
with tempfile.TemporaryDirectory() as directory:
    manifest = Path(directory) / 'frames.ffconcat'
    entries = []
    for index, time in enumerate(times):
        picture = frames / f'{index:04d}.png'
        assert picture.is_file()
        duration = times[index + 1] - time if index + 1 < len(times) else times[-1] - times[-2]
        escaped = str(picture).replace("'", "'\\''")
        entries.extend([f"file '{escaped}'", 'option framerate 1000', f'duration {duration:.9f}'])
    manifest.write_text('\n'.join(entries) + '\n')
    command = [args.ffmpeg, '-y', '-f', 'concat', '-safe', '0', '-i', str(manifest)]
    if has_audio:
        command.extend(['-i', str(frames / 'game-audio.wav')])
    command.extend(['-fps_mode', 'vfr', '-c:v', 'libx264', '-crf', '20', '-pix_fmt', 'yuv420p', '-movflags', '+faststart'])
    if has_audio:
        # Do not use -shortest: a slightly shorter AudioListener buffer must
        # never discard the final actual video frames.
        command.extend(['-c:a', 'aac', '-b:a', '160k'])
    subprocess.run(command + [str(video)], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
decoded = subprocess.run([args.ffmpeg, '-v', 'error', '-i', str(video), '-fps_mode', 'passthrough', '-enc_time_base', '1/1000', '-progress', 'pipe:1', '-f', 'null', '-'], check=True, capture_output=True, text=True)
assert not decoded.stderr, decoded.stderr
encoded = int([line.split('=')[1] for line in decoded.stdout.splitlines() if line.startswith('frame=')][-1])
assert encoded == len(times), (encoded, len(times))
metadata = dict(frames=len(times), encodedFrames=encoded, elapsedSeconds=times[-1] - times[0],
                originalTimestamps=times, audio=probe.strip(), hasAudio=has_audio,
                decode='Full audio/video decode, zero errors at 1/1000 timebase',
                encoding='Original variable timestamps; no interpolated frames or added effects',
                isolatedPreparedSave=True, sha256=hashlib.sha256(video.read_bytes()).hexdigest())
(output / 'capture.json').write_text(json.dumps(metadata, indent=2) + '\n')
print(f'{encoded} actual frames; {metadata["elapsedSeconds"]:.3f} s; actual game audio: {has_audio}')
