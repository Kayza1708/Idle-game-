using System;
using System.Collections;
using System.IO;
using IdleIntelligence.Core;
using IdleIntelligence.Runtime;
using NUnit.Framework;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.TestTools;
using UnityEngine.UI;
namespace IdleIntelligence.PlayTests
{
    public sealed class SceneTests
    {
        string directory;
        [UnitySetUp] public IEnumerator Setup()
        {
            directory=Path.Combine(Path.GetTempPath(),"idle-unity-play-"+Guid.NewGuid());Directory.CreateDirectory(directory);GameRuntime.SavePathOverride=Path.Combine(directory,"save.json");
            yield return SceneManager.LoadSceneAsync("IdleIntelligence");yield return null;
        }
        [UnityTearDown] public IEnumerator Cleanup()
        {
            var game=UnityEngine.Object.FindFirstObjectByType<GameRuntime>();if(game!=null)UnityEngine.Object.Destroy(game.gameObject);yield return null;GameRuntime.SavePathOverride=null;if(Directory.Exists(directory))Directory.Delete(directory,true);
        }
        static void Click(string name)
        {
            var g=GameObject.Find(name);Assert.That(g,Is.Not.Null,name);var button=g.GetComponent<Button>();Assert.That(button.interactable,Is.True,name+" disabled");button.onClick.Invoke();
        }
        [UnityTest] public IEnumerator PortraitSceneUsesRealTransactionsAndReusablePrefab()
        {
            var game=UnityEngine.Object.FindFirstObjectByType<GameRuntime>();game.Show("story");yield return null;GameObject.Find("StoryNameInput").GetComponent<InputField>().text="AURA";Click("StoryChooseName");for(int i=0;i<5;i++){yield return null;Click("StoryContinue");}Click("HardwareTab");yield return null;Assert.That(game.Writable,Is.True);Assert.That(game.State.Credits.ToDouble(),Is.EqualTo(Balance.StartCredits).Within(1));
            Assert.That(game.SaveButton.GetComponent<RectTransform>().rect.height,Is.GreaterThanOrEqualTo(44));Assert.That(game.HardwareTab.GetComponent<RectTransform>().rect.height,Is.GreaterThanOrEqualTo(44));Assert.That(game.CardPrefab,Is.Not.Null);Assert.That(game.HardwareSprites.Length,Is.EqualTo(Balance.Hardware.Length));Assert.That(game.TapButton.GetComponent<RectTransform>().rect.height,Is.GreaterThanOrEqualTo(44));
            Click("hardware-calculator");Assert.That(game.State.Hardware[0],Is.EqualTo(1));Assert.That(Game.Compute(game.State).IsZero,Is.False);
            Click("TapLab");Assert.That(game.State.Taps,Is.EqualTo(1));Click("TrainingTab");yield return null;Click("training-quality");Assert.That(game.State.Training,Is.Not.Null);Assert.That(game.State.QualityUsed,Is.True);
            Click("ResearchTab");yield return null;Click("research-dataGeneration");Assert.That(game.State.ResearchJob,Is.Not.Null);Assert.That(game.State.ResearchUsed,Is.True);
            game.Act(s=>Game.Advance(s,s.SavedAt+30000));Assert.That(game.State.Quality,Is.EqualTo(1));Assert.That(game.State.Research[0],Is.EqualTo(1));
            Click("Save");var loaded=new AtomicSaveStore(game.SavePath,new UnitySaveCodec()).Load(game.State.SavedAt);Assert.That(loaded.Writable,Is.True);Assert.That(loaded.State.Quality,Is.EqualTo(1));Assert.That(loaded.State.Hardware[0],Is.EqualTo(1));
            Click("HardwareTab");yield return null;Canvas.ForceUpdateCanvases();var safe=UnityEngine.Object.FindFirstObjectByType<SafeArea>();Assert.That(safe,Is.Not.Null);safe.Apply();Assert.That(((RectTransform)safe.transform).anchorMin.x,Is.GreaterThanOrEqualTo(0));
            yield return null;
            Capture(390,844,"/tmp/idle-intelligence-playable.png");
            Capture(320,568,"/tmp/idle-intelligence-compact.png");
            Capture(430,932,"/tmp/idle-intelligence-large.png");
        }
        static void Capture(int width,int height,string path)
        {
            var canvas=UnityEngine.Object.FindFirstObjectByType<Canvas>();var camera=UnityEngine.Object.FindFirstObjectByType<Camera>();
            var texture=new RenderTexture(width,height,24);camera.targetTexture=texture;canvas.renderMode=RenderMode.ScreenSpaceCamera;canvas.worldCamera=camera;canvas.planeDistance=1;Canvas.ForceUpdateCanvases();
            camera.Render();var prior=RenderTexture.active;RenderTexture.active=texture;var pixels=new Texture2D(width,height,TextureFormat.RGB24,false);pixels.ReadPixels(new Rect(0,0,width,height),0,0);pixels.Apply();File.WriteAllBytes(path,pixels.EncodeToPNG());RenderTexture.active=prior;camera.targetTexture=null;canvas.renderMode=RenderMode.ScreenSpaceOverlay;UnityEngine.Object.Destroy(pixels);UnityEngine.Object.Destroy(texture);
        }
        [UnityTest] public IEnumerator ReopeningScenePersistsOfflineTimeWithoutPayingItTwice()
        {
            var game=UnityEngine.Object.FindFirstObjectByType<GameRuntime>();string path=game.SavePath;UnityEngine.Object.Destroy(game.gameObject);yield return null;
            double now=DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();var store=new AtomicSaveStore(path,new UnitySaveCodec());store.Load(now);store.Save(Game.Buy(Game.New(now-60000),"calculator"));
            yield return SceneManager.LoadSceneAsync("IdleIntelligence");yield return null;game=UnityEngine.Object.FindFirstObjectByType<GameRuntime>();var first=game.State.Copy();
            Assert.That(first.Credits.ToDouble(),Is.GreaterThanOrEqualTo(116));UnityEngine.Object.Destroy(game.gameObject);yield return null;
            yield return SceneManager.LoadSceneAsync("IdleIntelligence");yield return null;game=UnityEngine.Object.FindFirstObjectByType<GameRuntime>();var second=game.State;
            double expected=first.Credits.ToDouble()+Game.Income(first).ToDouble()*(second.SavedAt-first.SavedAt)/1000;
            Assert.That(second.Credits.ToDouble(),Is.EqualTo(expected).Within(.00001));Assert.That(game.Writable,Is.True);
        }
        [UnityTest] public IEnumerator CorruptSaveDisablesActionsAndPreservesFileAcrossSceneReload()
        {
            var game=UnityEngine.Object.FindFirstObjectByType<GameRuntime>();var path=game.SavePath;Click("hardware-calculator");UnityEngine.Object.Destroy(game.gameObject);yield return null;File.WriteAllText(path,"damaged save");
            yield return SceneManager.LoadSceneAsync("IdleIntelligence");yield return null;game=UnityEngine.Object.FindFirstObjectByType<GameRuntime>();Assert.That(game.Writable,Is.False);Assert.That(game.TapButton.interactable,Is.False);Assert.That(game.SaveButton.interactable,Is.False);Assert.That(File.ReadAllText(path),Is.EqualTo("damaged save"));
        }
    }
}
