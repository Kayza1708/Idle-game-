using System;using System.Collections.Generic;using System.IO;using System.Linq;using UnityEngine;
namespace IdleIntelligence.PlayTests {
 // Test-only listener probe: records actual Unity mixed samples, never substitutes clip files.
 public sealed class ReviewAudioCapture:MonoBehaviour {
  readonly object gate=new object();readonly List<float> samples=new List<float>();bool recording;int channels;int rate;
  public void Begin(){rate=AudioSettings.outputSampleRate;lock(gate){samples.Clear();recording=true;}}
  void OnAudioFilterRead(float[] data,int count){lock(gate){if(!recording||samples.Count>rate*2*120)return;channels=count;samples.AddRange(data);}}
  public void Save(string path){lock(gate){recording=false;float peak=samples.Count==0?0:samples.Max(x=>Math.Abs(x));File.WriteAllText(path+"/audio-probe.txt","sampleRate="+rate+" channels="+channels+" samples="+samples.Count+" peak="+peak+"\n");if(channels==0||peak<.00001f)return;using(var writer=new BinaryWriter(File.Create(path+"/game-audio.wav"))){int bytes=samples.Count*2;writer.Write(System.Text.Encoding.ASCII.GetBytes("RIFF"));writer.Write(36+bytes);writer.Write(System.Text.Encoding.ASCII.GetBytes("WAVEfmt "));writer.Write(16);writer.Write((short)1);writer.Write((short)channels);writer.Write(rate);writer.Write(rate*channels*2);writer.Write((short)(channels*2));writer.Write((short)16);writer.Write(System.Text.Encoding.ASCII.GetBytes("data"));writer.Write(bytes);foreach(float sample in samples)writer.Write((short)(Mathf.Clamp(sample,-1,1)*32767));}}}
 }
}
