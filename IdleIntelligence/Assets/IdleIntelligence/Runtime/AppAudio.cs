using System;using System.Linq;using IdleIntelligence.Core;using UnityEngine;
namespace IdleIntelligence.Runtime
{
 public sealed class AppAudio:MonoBehaviour
 {
  public string LastPlayed{get;private set;}GameRuntime game;AudioSource music;readonly AudioSource[] voices=new AudioSource[4];bool unlocked,visible=true,musicStarted;double lastEffect=-1000;
  public void Initialize(GameRuntime runtime){game=runtime;if(UnityEngine.Object.FindFirstObjectByType<AudioListener>()==null)gameObject.AddComponent<AudioListener>();music=gameObject.AddComponent<AudioSource>();music.playOnAwake=false;music.loop=true;music.clip=Resources.Load<AudioClip>("Audio/idle-loop");for(int i=0;i<voices.Length;i++){voices[i]=gameObject.AddComponent<AudioSource>();voices[i].playOnAwake=false;}Sync();}
  public void Unlock(){if(unlocked)return;unlocked=true;Sync();}
  public void Sync(){if(game==null||music==null)return;var p=game.State.Settings;music.volume=(float)p.musicVolume;if(!p.musicEnabled||!unlocked||!visible){music.Pause();return;}if(!music.isPlaying){if(musicStarted)music.UnPause();if(!music.isPlaying)music.Play();musicStarted=true;}}
  public bool Play(string id){if(game==null||!unlocked||!visible||game.State.Settings.sfxMuted||game.State.Settings.sfxVolume<=0)return false;double now=Time.realtimeSinceStartupAsDouble*1000;if((id=="ui-click"||id=="purchase")&&now-lastEffect<100)return false;var voice=voices.FirstOrDefault(v=>!v.isPlaying);if(voice==null)return false;var clip=Resources.Load<AudioClip>("Audio/"+id);if(clip==null)return false;if(id=="ui-click"||id=="purchase")lastEffect=now;voice.clip=clip;voice.volume=(float)game.State.Settings.sfxVolume;voice.Play();LastPlayed=id;return true;}
  public void Feedback(string action,GameState before,GameState after){Sync();if(after.Settings.effects&&!after.Workshop.reducedMotion&&game.GetComponent<RewardPresentation>()!=null&&((after.Rewards.hasReceipt&&(!before.Rewards.hasReceipt||after.Rewards.receipt.id!=before.Rewards.receipt.id))||(after.Capsules.hasLast&&(!before.Capsules.hasLast||after.Capsules.last.id!=before.Capsules.last.id))))return;if((action=="item-fuse"||action=="item-craft")&&after.Settings.effects&&!after.Workshop.reducedMotion&&game.WorkshopView!=null)return;string sound=FeedbackRules.Sound(action,before,after);if(sound!=null)Play(sound);else if(!ReferenceEquals(before,after)&&action!="tap"&&action!="foreground-tick")Play("ui-click");}
  void OnApplicationPause(bool paused){visible=!paused;Sync();}void OnApplicationFocus(bool focused){visible=focused;Sync();}void OnDisable(){if(music!=null)music.Pause();}
  public bool HapticsAvailable=>false; // No existing Unity native pattern bridge; do not pretend to vibrate.
 }
}
