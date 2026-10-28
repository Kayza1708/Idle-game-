using System;
using System.IO;
using System.Collections;
using IdleIntelligence.Core;
using IdleIntelligence.Runtime;
using NUnit.Framework;
using UnityEngine;
using UnityEngine.UI;
using UnityEngine.SceneManagement;
using UnityEngine.TestTools;
namespace IdleIntelligence.PlayTests
{
    public sealed class AnalysisGuideUITests
    {
        GameRuntime game;
        [UnityTearDown] public IEnumerator Cleanup(){if(game!=null)UnityEngine.Object.Destroy(game.gameObject);yield return null;GameRuntime.SavePathOverride=null;}
        [UnityTest] public IEnumerator ExistingSaveCanRequestMiraGuideThenResumeAndReloadWithoutAwards()
        {
            GameRuntime.SavePathOverride=Path.Combine(Path.GetTempPath(),"idle-guide-ui-"+Guid.NewGuid(),"save.json");yield return SceneManager.LoadSceneAsync("IdleIntelligence");yield return null;
            game=UnityEngine.Object.FindFirstObjectByType<GameRuntime>();game.Act(s=>NarrativeBridge.Action(s,"name","AURA"));game.Act(s=>NarrativeBridge.Action(s,"skip-tutorial"));
            game.Act(s=>{var n=s.Copy();n.Story.enabled=false;n.Prestige.Total=n.Prestige.Free=n.Prestige.Cycle=n.Prestige.Entitlement=ScientificNumber.From(1e7);return n;});
            Assert.That(game.Act(s=>PrestigeRules.Buy(s,"F02")),Is.True);Assert.That(game.State.Story.open,Is.Not.EqualTo("analysis-queue"),"Disabled automatic analysis guidance must not open");while(game.State.Story.open!=null)game.Act(s=>NarrativeBridge.Action(s,"skip"));
            game.Show("items");game.WorkshopView.ChangeMode("components");yield return null;yield return null;
            var help=GameObject.Find("AnalysisGuide-analysis-queue").GetComponent<Button>();Assert.That(help.interactable,Is.True);double credits=game.State.Credits.ToDouble();long gems=game.State.Retention.gems;int items=game.State.Workshop.inventory.Length;
            help.onClick.Invoke();yield return null;yield return null;Assert.That(game.State.Story.open,Is.EqualTo("analysis-queue"));
            var loaded=new AtomicSaveStore(game.SavePath,new UnitySaveCodec()).Load(game.State.SavedAt);Assert.That(loaded.Writable,Is.True,loaded.Message);Assert.That(loaded.State.Story.seen,Does.Contain("analysis-queue"));
            Directory.CreateDirectory("/tmp/idle-audit-followup");WorkshopTests.Capture(390,846,"/tmp/idle-audit-followup/analysis-guide-de.png");
            var coach=UnityEngine.Object.FindFirstObjectByType<MiraCoach>();Assert.That(coach,Is.Not.Null);for(int i=0;i<20&&game.State.Story.open!=null;i++){coach.Next.onClick.Invoke();yield return null;}
            Assert.That(game.State.Story.open,Is.Null);Assert.That(game.State.Credits.ToDouble(),Is.EqualTo(credits));Assert.That(game.State.Retention.gems,Is.EqualTo(gems));Assert.That(game.State.Workshop.inventory.Length,Is.EqualTo(items));
            yield return SceneManager.LoadSceneAsync("IdleIntelligence");yield return null;game=UnityEngine.Object.FindFirstObjectByType<GameRuntime>();Assert.That(game.Writable,Is.True);Assert.That(game.State.Story.open,Is.Null);Assert.That(game.State.Story.seen,Does.Contain("analysis-queue"));Assert.That(game.State.Story.enabled,Is.False);
        }
    }
}
