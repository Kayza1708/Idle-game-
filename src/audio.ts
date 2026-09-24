import type { GameState } from './economy';

export type SoundId='ui-click'|'purchase'|'unlock'|'research-complete'|'prestige'|'gem-pickup'|'error';
const sources=(id:SoundId|'idle-loop')=>[`/assets/audio/${id}.ogg`,`/assets/audio/${id}.mp3`];

export function actionSound(action:string,before:GameState,after:GameState):SoundId|null{
 if(after.discovered.length>before.discovered.length)return'unlock';
 if(action==='prestige'&&after.prestigeCount>before.prestigeCount)return'prestige';
 if(['buy-class','class-upgrade','buy','research-lab','node','breakthrough','gem-components','gem-boost'].includes(action)&&after!==before)return'purchase';
 if(['claim','mail','claim-intro'].includes(action)&&after.gems>before.gems)return'gem-pickup';
 if(action==='research-project'&&after===before)return'error';
 return null;
}

export class AudioPlayer{
 private music?:HTMLAudioElement;private lastClick=0;
 constructor(private create:(src:string)=>HTMLAudioElement=(src)=>new Audio(src)){}
 private audio(id:SoundId|'idle-loop'){const a=this.create(sources(id)[0]);if(!a.canPlayType?.('audio/ogg'))a.src=sources(id)[1];return a}
 play(id:SoundId,settings:GameState['settings']){if(settings.sfxMuted||settings.sfxVolume<=0)return;if(id==='ui-click'){const now=Date.now();if(now-this.lastClick<90)return;this.lastClick=now}const a=this.audio(id);a.volume=settings.sfxVolume;void a.play().catch(()=>undefined)}
 syncMusic(settings:GameState['settings'],userGesture=false){if(!this.music)this.music=this.audio('idle-loop');this.music.loop=true;this.music.volume=settings.musicVolume;if(!settings.musicEnabled||document.hidden){this.music.pause();return}if(userGesture)void this.music.play().catch(()=>undefined)}
 handleVisibility(settings:GameState['settings']){if(document.hidden)this.music?.pause();else if(settings.musicEnabled)void this.music?.play().catch(()=>undefined)}
 dispose(){this.music?.pause()}
}
