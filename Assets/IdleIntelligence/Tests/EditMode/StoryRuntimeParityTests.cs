using System;using System.IO;using System.Linq;using IdleIntelligence.Core;using IdleIntelligence.Runtime;using UnityEngine;using NUnit.Framework;
namespace IdleIntelligence.Tests
{
 [Serializable]public sealed class StoryLiveCase{public string op,id,aiName,text,navigation;public double value;public StoryState story;public bool trainingEvidence,analysisEvidence;}
 [Serializable]public sealed class StoryLiveCases{public StoryLiveCase[] rows;}
 public sealed class StoryRuntimeParityTests
 {
  [Test]public void ConnectedTransactionsDialogsAndRepeatedReloadMatchSource(){var cases=JsonUtility.FromJson<StoryLiveCases>(File.ReadAllText(Path.Combine(Application.dataPath,"IdleIntelligence/Tests/EditMode/StoryRuntimeReferenceCases.json")));var s=Game.New(1000000,"story-live-reference",true);int index=0;foreach(var c in cases.rows){var b=s;switch(c.op){case "name":s=NarrativeBridge.Action(s,"name",c.id);break;case "continue":s=NarrativeBridge.Action(s,"continue");break;case "skip":s=NarrativeBridge.Action(s,"skip");break;case "end":s=NarrativeBridge.Action(s,"skip-tutorial");break;case "resume":s=NarrativeBridge.Action(s,"resume");break;case "tap":s=Game.Tap(s,s.SavedAt);break;case "buy":s=Game.Buy(s,c.id);break;case "train":s=Game.Train(s,c.id);break;case "research":s=Game.Research(s,c.id);break;case "advance":s=Game.Advance(s,s.SavedAt+c.value);break;case "analysis":s=MaterialAnalysis.Start(s,0);break;case "craft":s=Workshop.Craft(s,c.id);break;case "equip":s=Workshop.Equip(s,s.Workshop.inventory.Last().id);break;case "prepared":s=s.Copy();s.Credits=s.Credits.Add(ScientificNumber.Parse("1e35"));s.Data=s.Data.Add(ScientificNumber.Parse("1e20"));for(int i=0;i<s.Workshop.components.Length;i++){s.Workshop.components[i]+=1000000;Lifetime.Components(s,i,1000000);}break;case "prepared-eligible":s=s.Copy();PrestigeRules.Earn(s,ScientificNumber.Parse("1e20"));break;case "reset":s=PrestigeRules.Reset(s);break;case "chapter":s=NarrativeBridge.Action(s,"chapter",c.id);break;case "reopen":s=NarrativeBridge.Action(s,"reopen",c.id);break;default:Assert.Fail(c.op);break;}s=NarrativeBridge.Sync(b,s);Assert.That(JsonUtility.ToJson(s.Story),Is.EqualTo(JsonUtility.ToJson(c.story)),index+" "+c.op);Assert.That(s.Retention.aiName,Is.EqualTo(c.aiName),index+" name");Assert.That(s.Journal.Has("training-start"),Is.EqualTo(c.trainingEvidence),index+" training evidence");Assert.That(s.Journal.Has("experiment-start"),Is.EqualTo(c.analysisEvidence),index+" analysis evidence");if(s.Story.open!=null){
  string expected=c.text;
  if(s.Story.open=="first-analysis"){
   // The source fixture records UTC clock text; the runtime intentionally
   // displays the player's local clock. This dialogue remains visible even
   // after an analysis completes, when it falls back to the save timestamp.
   var culture=System.Globalization.CultureInfo.GetCultureInfo(s.Settings.language);
   double deadline=s.Workshop.hasAnalysis?
       s.SavedAt+Math.Max(0,s.Workshop.analysis.required-s.Workshop.analysis.done)/
           MaterialAnalysis.Speed(s)*1000:s.SavedAt;
   var utc=DateTimeOffset.FromUnixTimeMilliseconds((long)deadline);
   string sourceClock=utc.ToString("T",culture);
   Assert.That(expected,Does.Contain(sourceClock),
       index+" UTC fixture deadline must match state, whether active or complete");
   expected=expected.Replace(sourceClock,utc.ToLocalTime().ToString("T",culture));
  }
  Assert.That(NarrativeBridge.Text(s,s.Story.open),Is.EqualTo(expected),index+" dialogue "+s.Story.open);
 }if(c.navigation!=""&&c.navigation!=null){string expected=c.navigation.Replace("tutorial-buy-calculator","hardware-calculator").Replace("tutorial-buy-sbc","hardware-sbc").Replace("tutorial-buy-one","BuyMode-1").Replace("tutorial-quality-training","training-quality").Replace("tutorial-data-generation","research-dataGeneration").Replace("tutorial-hardware-analysis","analysis-hardware-short").Replace("tutorial-production","Compute").Replace("tutorial-credits","Credits").Replace("tutorial-prestige-action","PrestigeReset").Replace("tutorial-recipe-","recipe-").Replace("tutorial-tap","TapLab");Assert.That(TutorialNavigation.Quote(s).Element,Is.EqualTo(expected),index+" reachable guide target");}Game.Validate(s);var codec=new UnitySaveCodec();s=codec.Decode(codec.Encode(StateData.From(s)),AtomicSaveStore.Version).ToState();index++;}Assert.That(s.Story.chapters,Is.EquivalentTo(NarrativeCatalog.Chapters));}
 }
}
