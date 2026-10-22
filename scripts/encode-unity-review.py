"""Encode actual Unity render frames using their recorded realtime timestamps.
Requires imageio-ffmpeg==0.6.0; no generated/interpolated animation frames.
"""
from pathlib import Path
from tempfile import TemporaryDirectory
import subprocess
import sys
import imageio_ffmpeg
source, output = [Path(arg).resolve() for arg in sys.argv[1:3]]
times = [float(line) for line in (source / 'times.txt').read_text().splitlines()]
assert len(times) > 1 and all(b > a for a, b in zip(times, times[1:]))
output.parent.mkdir(parents=True, exist_ok=True)
with TemporaryDirectory() as directory:
    manifest = Path(directory) / 'frames.txt'
    lines = []
    for index, time in enumerate(times):
        frame = source / f'{index:04d}.png'
        assert frame.is_file()
        duration = times[index + 1] - time if index + 1 < len(times) else times[-1] - times[-2]
        lines.extend(["file '" + str(frame).replace("'", "'\\''") + "'", 'option framerate 60', f'duration {duration:.9f}'])
    manifest.write_text('\n'.join(lines) + '\n')
    subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(), '-y', '-f', 'concat', '-safe', '0', '-i', str(manifest), '-fps_mode', 'vfr', '-c:v', 'libx264', '-crf', '20', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', str(output)], check=True)
print(f'{len(times)} real Unity frames; {times[-1] - times[0]:.3f} elapsed seconds')
