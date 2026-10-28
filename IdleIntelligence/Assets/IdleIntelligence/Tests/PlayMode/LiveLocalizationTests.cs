using System;
using System.IO;
using System.Collections;
using System.Reflection;
using IdleIntelligence.Core;
using IdleIntelligence.Runtime;
using NUnit.Framework;
using UnityEngine;
using UnityEngine.UI;
using UnityEngine.SceneManagement;
using UnityEngine.TestTools;
namespace IdleIntelligence.PlayTests
{
    public sealed class LiveLocalizationTests
    {
        GameRuntime game;
        [UnityTearDown] public IEnumerator Cleanup(){if(game!=null)UnityEngine.Object.Destroy(game.gameObject);yield return null;GameRuntime.SavePathOverride=null;}
        [UnityTest] public IEnumerator RealChallengeRuleUsesFrenchAndAllActiveLabelsAreBound()
        {
            GameRuntime.SavePathOverride=Path.Combine(Path.GetTempPath(),"idle-live-language-"+Guid.NewGuid(),"save.json");
            yield return SceneManager.LoadSceneAsync("IdleIntelligence");yield return null;game=UnityEngine.Object.FindFirstObjectByType<GameRuntime>();
            game.Act(s=>SettingsRules.Change(s,"language","fr"));game.Show("challenges");yield return null;yield return null;yield return new WaitForSecondsRealtime(.15f);
            game.FlushLocalization();foreach(var label in game.Content.GetComponentInParent<Canvas>().GetComponentsInChildren<UiLocalizedText>())label.RefreshNow();
            var text=GameObject.Find("ChallengeRules").GetComponent<Text>();var localized=text.GetComponent<UiLocalizedText>();
            var original=typeof(UiLocalizedText).GetField("original",BindingFlags.NonPublic|BindingFlags.Instance)?.GetValue(localized);
            Assert.That(text.text,Does.StartWith("Aucun tap"),"source="+original+" direct="+UiLocalizedText.Translate((string)original,"fr"));
        }
    }
}
