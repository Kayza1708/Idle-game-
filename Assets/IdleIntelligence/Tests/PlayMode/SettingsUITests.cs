using System;using System.IO;using System.Collections;using IdleIntelligence.Core;using IdleIntelligence.Runtime;using NUnit.Framework;using UnityEngine;using UnityEngine.UI;using UnityEngine.SceneManagement;using UnityEngine.TestTools;
namespace IdleIntelligence.PlayTests
{
 public sealed class SettingsUITests
 {
  void OpenMenuRoute(string route){game.GetComponent<IdleIntelligence.Runtime.GameMenu>().Open();Click("Menu-"+route);}


  string dir;GameRuntime game;
  [UnitySetUp]public IEnumerator Setup(){dir=Path.Combine(Path.GetTempPath(),"unity-settings-ui-"+Guid.NewGuid());Directory.CreateDirectory(dir);GameRuntime.SavePathOverride=Path.Combine(dir,"save.json");yield return SceneManager.LoadSceneAsync("IdleIntelligence");yield return null;game=UnityEngine.Object.FindFirstObjectByType<GameRuntime>();}
  [UnityTearDown]public IEnumerator Cleanup(){if(game!=null)UnityEngine.Object.Destroy(game.gameObject);yield return null;GameRuntime.SavePathOverride=null;Directory.Delete(dir,true);}
  static void Click(string name){var b=GameObject.Find(name)?.GetComponent<Button>();Assert.That(b,Is.Not.Null,name);Assert.That(b.interactable,Is.True,name);b.onClick.Invoke();}
  [UnityTest]public IEnumerator SettingsAffectRealStateBuyModeAndAudioAssetsPersist(){Click("ResearchTab");yield return null;OpenMenuRoute("settings");yield return null;Click("Language-fr");yield return null;Assert.That(game.State.Settings.language,Is.EqualTo("fr"));Assert.That(GameObject.Find("SettingsTitle").GetComponent<Text>().text,Is.EqualTo(SettingsRules.Text("fr","ui:settings")));Click("NumberFormat-scientific");Click("BuyMode-10");Click("Setting-toggle-effects");yield return null;Assert.That(game.State.Workshop.reducedMotion,Is.True);Assert.That(game.State.Settings.effects,Is.False);foreach(string id in new[]{"ui-click","purchase","unlock","research-complete","prestige","gem-pickup","error","idle-loop"}){var clip=Resources.Load<AudioClip>("Audio/"+id);Assert.That(clip,Is.Not.Null,id);Assert.That(clip.length,Is.GreaterThan(0),id);}Click("SettingsSoundTest");Assert.That(game.Audio.HapticsAvailable,Is.False);foreach(int width in new[]{320,390,430})WorkshopTests.Capture(width,width==320?568:width==390?844:932,"/tmp/unity-settings-language-"+width+".png");var load=new AtomicSaveStore(game.SavePath,new UnitySaveCodec()).Load(game.State.SavedAt);Assert.That(load.Writable,Is.True,load.Message);Assert.That(load.State.Settings.language,Is.EqualTo("fr"));Assert.That(load.State.Settings.buyMode,Is.EqualTo("10"));Click("HardwareTab");yield return null;Assert.That(GameObject.Find("hardware-calculator").GetComponent<ActionCard>().Title.text,Does.Contain("Calculatrice"));Assert.That(game.Credits.text,Does.Contain("e+"));}
 }
}
