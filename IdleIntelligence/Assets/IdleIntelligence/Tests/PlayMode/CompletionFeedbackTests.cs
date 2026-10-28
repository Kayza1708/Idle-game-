using System;
using System.IO;
using System.Linq;
using System.Collections;
using System.Collections.Generic;
using IdleIntelligence.Core;
using IdleIntelligence.Runtime;
using NUnit.Framework;
using UnityEngine;
using UnityEngine.UI;
using UnityEngine.SceneManagement;
using UnityEngine.TestTools;
namespace IdleIntelligence.PlayTests
{
    public sealed class CompletionFeedbackTests
    {
        GameRuntime game;
        [UnitySetUp]public IEnumerator Setup(){GameRuntime.SavePathOverride=Path.Combine(Path.GetTempPath(),"idle-completion-"+Guid.NewGuid(),"save.json");yield return SceneManager.LoadSceneAsync("IdleIntelligence");yield return null;game=UnityEngine.Object.FindFirstObjectByType<GameRuntime>();game.Act(s=>NarrativeBridge.Action(s,"name","AURA"));game.Act(s=>NarrativeBridge.Action(s,"skip-tutorial"));game.Act(s=>{var n=s.Copy();n.Story.enabled=false;n.Story.open=null;n.Story.queue=Array.Empty<string>();n.Story.seen=NarrativeCatalog.Dialogues.Select(d=>d.Id).ToArray();n.Settings.sfxMuted=false;n.Settings.musicEnabled=false;return n;});}
        [UnityTearDown]public IEnumerator Cleanup(){if(game!=null)UnityEngine.Object.Destroy(game.gameObject);yield return null;GameRuntime.SavePathOverride=null;}
        [UnityTest]public IEnumerator BoundedReceiptReducedMotionNavigationAndReloadNeverGrant()
        {
            var feedback=game.GetComponent<CompletionFeedback>();Assert.That(feedback.Presentations,Is.Zero);
            game.Act(s=>{var n=s.Copy();n.Lifetime.analysesCompleted++;return n;});Assert.That(feedback.Presentations,Is.EqualTo(1));Assert.That(feedback.LastText,Does.Contain("Analyse"));var before=game.State.Copy();
            feedback.Saved(game.State);feedback.Saved(game.State);Assert.That(feedback.Presentations,Is.EqualTo(1));
            game.Act(s=>SettingsRules.Change(s,"toggle-effects"));game.Act(s=>{var n=s.Copy();n.Lifetime.researchCompleted++;return n;});Assert.That(feedback.Presentations,Is.EqualTo(2));
            for(int i=0;i<8;i++)game.Act(s=>{var n=s.Copy();n.Lifetime.analysesCompleted++;return n;});Assert.That(GameObject.FindObjectsByType<CanvasGroup>(FindObjectsSortMode.None).Count(g=>g.name=="SavedCompletionReceipt"),Is.EqualTo(1));
            Assert.That(GameObject.Find("SavedCompletionReceipt").GetComponent<CanvasGroup>().blocksRaycasts,Is.False);Assert.That(game.State.Credits.CompareTo(before.Credits),Is.Zero);Assert.That(game.State.Retention.gems,Is.EqualTo(before.Retention.gems));
            game.Show("research");Assert.That(GameObject.Find("SavedCompletionReceipt"),Is.Null,"Navigation cancels the presentation");
            yield return SceneManager.LoadSceneAsync("IdleIntelligence");yield return null;game=UnityEngine.Object.FindFirstObjectByType<GameRuntime>();Assert.That(game.GetComponent<CompletionFeedback>().Presentations,Is.Zero,"Reload does not replay historical completions");
        }
        [UnityTest]public IEnumerator BrokenCosmeticConsumerCannotTurnSuccessfulCommitIntoSaveFailure()
        {
            var feedback=game.GetComponent<CompletionFeedback>();var field=typeof(CompletionFeedback).GetField("game",System.Reflection.BindingFlags.Instance|System.Reflection.BindingFlags.NonPublic);field.SetValue(feedback,null);
            LogAssert.Expect(LogType.Warning,new System.Text.RegularExpressions.Regex("^Saved feedback failed:"));
            double count=game.State.Lifetime.analysesCompleted;Assert.That(game.Act(s=>{var n=s.Copy();n.Lifetime.analysesCompleted++;return n;}),Is.True);Assert.That(game.Writable,Is.True);
            var saved=new AtomicSaveStore(game.SavePath,new UnitySaveCodec()).Load(game.State.SavedAt);Assert.That(saved.Writable,Is.True);Assert.That(saved.State.Lifetime.analysesCompleted,Is.EqualTo(count+1));field.SetValue(feedback,game);yield return null;
        }
        [UnityTest]public IEnumerator RecordActualIntroTrainingCompletionWithoutTimeGrants()
        {
            GameRuntime.SavePathOverride=Path.Combine(Path.GetTempPath(),"idle-completion-fresh-"+Guid.NewGuid(),"save.json");yield return SceneManager.LoadSceneAsync("IdleIntelligence");yield return null;game=UnityEngine.Object.FindFirstObjectByType<GameRuntime>();
            game.Act(s=>NarrativeBridge.Action(s,"name","AURA"));for(int i=0;i<5;i++)game.Act(s=>NarrativeBridge.Action(s,"continue"));game.TapButton.onClick.Invoke();Assert.That(game.Act(s=>Game.Buy(s,Balance.Hardware[0].Id,1),"buy-class"),Is.True);Assert.That(game.State.Story.target,Is.EqualTo("training"));
            string output="/tmp/idle-completion-motion";Directory.CreateDirectory(output);PortraitGameView.Set(390,846);game.Show("training");yield return null;yield return null;
            var listener=new GameObject("CompletionAudio",typeof(AudioListener));listener.transform.SetParent(game.transform);var existing=game.GetComponent<AudioListener>();if(existing!=null)existing.enabled=false;var audio=listener.AddComponent<ReviewAudioCapture>();audio.Begin();
            var times=new List<float>();int frame=0;float started=Time.realtimeSinceStartup;bool clicked=false;int initial=game.State.Quality;
            while(Time.realtimeSinceStartup-started<29){float age=Time.realtimeSinceStartup-started;if(!clicked&&age>=.6f){GameObject.Find("training-quality").GetComponent<LearningCard>().StartAction.onClick.Invoke();clicked=true;Assert.That(game.State.Training,Is.Not.Null);}
                times.Add(Time.realtimeSinceStartup);WorkshopTests.Capture(390,846,output+"/"+(frame++).ToString("D4")+".png");yield return null;
            }
            audio.Save(output);File.WriteAllLines(output+"/times.txt",times.Select(t=>t.ToString("R",System.Globalization.CultureInfo.InvariantCulture)));Assert.That(game.State.Quality,Is.EqualTo(initial+1));Assert.That(game.GetComponent<CompletionFeedback>().Presentations,Is.GreaterThanOrEqualTo(1));
            var saved=new AtomicSaveStore(game.SavePath,new UnitySaveCodec()).Load(game.State.SavedAt);Assert.That(saved.Writable,Is.True);Assert.That(saved.State.Quality,Is.EqualTo(initial+1));
            Debug.Log("REAL_INTRO_TRAINING: original twenty-second job, fresh isolated save, no elapsed-time injection, no reward grants from animation");
        }
    }
}
