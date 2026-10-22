"""Original deterministic synthesized UI cues. No samples or third-party assets.
Run with Python 3. Outputs 44.1 kHz mono PCM16 WAV; cosmetic audio only.
"""
import math, random, struct, wave
from pathlib import Path
OUT = Path(__file__).resolve().parents[2] / 'IdleIntelligence/Assets/IdleIntelligence/Resources/Audio'
RATE = 44100

def render(name, duration, partials, strikes=()):
    rng = random.Random(name)
    samples = []
    for i in range(round(duration * RATE)):
        t = i / RATE
        value = 0.
        for start, freq, decay, gain, sweep in partials:
            u = t - start
            if u >= 0:
                attack = min(1., u / .004)
                value += gain * attack * math.exp(-u / decay) * math.sin(2 * math.pi * (freq * u + sweep * u * u / 2))
        for start, decay, gain in strikes:
            u = t - start
            if u >= 0:
                value += rng.uniform(-1, 1) * gain * min(1., u / .001) * math.exp(-u / decay)
        value *= min(1., (duration-t)/.025)
        samples.append(value)
    peak = max(abs(x) for x in samples)
    samples = [x * .7 / max(1., peak) for x in samples]
    with wave.open(str(OUT / (name + '.wav')), 'wb') as wav:
        wav.setparams((1, 2, RATE, len(samples), 'NONE', 'not compressed'))
        wav.writeframes(b''.join(struct.pack('<h', round(x*32767)) for x in samples))
    print(name, len(samples), 'peak', round(max(abs(x) for x in samples), 3))

render('forge-impact', .52, [(0,95,.095,.62,-35),(0,610,.12,.28,0),(.018,1310,.07,.16,0),(.05,1830,.15,.08,0)], [(0,.027,.55),(.065,.07,.12)])
render('fusion-impact', .74, [(0,72,.12,.6,-20),(.018,440,.2,.3,250),(.04,660,.24,.22,300),(.07,880,.24,.16,240),(.12,1320,.2,.09,100)], [(0,.035,.5)])
render('purchase-confirm', .27, [(0,880,.06,.28,0),(.055,1320,.09,.24,0),(.055,1760,.06,.08,0)], [(0,.008,.16)])
render('gumball-turn', .47, [(k*.06,200+k*35,.025,.16,0) for k in range(6)], [(k*.06,.012,.2) for k in range(6)])
render('gumball-open', .49, [(0,130,.055,.4,0),(.04,784,.12,.24,0),(.085,1176,.16,.2,0),(.11,1568,.16,.1,0)], [(0,.018,.3)])
