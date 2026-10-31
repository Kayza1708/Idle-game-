using System;using System.IO;using IdleIntelligence.Core;using NUnit.Framework;using UnityEngine;
namespace IdleIntelligence.Tests
{
 [Serializable]public sealed class SettingAction{public string action,value;public double amount;public AppSettings expected;}
 [Serializable]public sealed class NumberFormatCase{public NumberData value;public string mode,text;}
 [Serializable]public sealed class FixedCase{public double value;public string text;}
 [Serializable]public sealed class FeedbackCase{public string action,sound,haptic;public bool changed;public StateData before,after;}
 [Serializable]public sealed class MaxPurchaseCase{public StateData state;public long[] counts;}
 [Serializable]public sealed class SettingsCases{public SettingAction[] actions;public NumberFormatCase[] numbers;public FixedCase[] fixedValues;public FeedbackCase[] feedback;public MaxPurchaseCase[] purchases;}
 public sealed class SettingsTests
 {
  [Test]public void SourceSettingsActionsAndFeedbackRoutingArePreserved(){string json=File.ReadAllText(Path.Combine(Application.dataPath,"IdleIntelligence/Tests/EditMode/SettingsReferenceCases.json")).Replace("\"fixed\":","\"fixedValues\":");var f=JsonUtility.FromJson<SettingsCases>(json);var s=Game.New(1000000);foreach(var c in f.actions){s=SettingsRules.Change(s,c.action,c.value,c.amount);Assert.That(JsonUtility.ToJson(s.Settings),Is.EqualTo(JsonUtility.ToJson(c.expected)),c.action);Game.Validate(s);}foreach(var c in f.feedback){var b=c.before.ToState();var a=c.changed?c.after.ToState():b;Assert.That(FeedbackRules.Sound(c.action,b,a)??"",Is.EqualTo(c.sound),c.action+" sound");Assert.That(FeedbackRules.Haptic(c.action,b,a)??"",Is.EqualTo(c.haptic),c.action+" haptic");}}
  [Test]public void ScientificAndCompactFormatsMatchOriginalSource(){var f=JsonUtility.FromJson<SettingsCases>(File.ReadAllText(Path.Combine(Application.dataPath,"IdleIntelligence/Tests/EditMode/SettingsReferenceCases.json")).Replace("\"fixed\":","\"fixedValues\":"));foreach(var c in f.fixedValues)Assert.That(NumberFormatting.Fixed(c.value,2),Is.EqualTo(c.text),c.value.ToString());foreach(var c in f.numbers)Assert.That(NumberFormatting.Format(ScientificNumber.FromData(c.value),c.mode),Is.EqualTo(c.text),c.mode+" "+c.value.e);foreach(var c in f.purchases){var s=c.state.ToState();s.Settings.buyMode="max";for(int i=0;i<c.counts.Length;i++)Assert.That(SettingsRules.BuyQuantity(s,i),Is.EqualTo(c.counts[i]),Balance.Hardware[i].Id);}}
  [Test]public void CatalogsHaveRealSourceCopiesAndOriginalNarrativeFallbacks(){Assert.That(SettingsCatalog.Languages.Length,Is.EqualTo(7));Assert.That(SettingsCatalog.Copies.Length,Is.EqualTo(691));Assert.That(NarrativeCatalog.Dialogues.Length,Is.EqualTo(41));Assert.That(NarrativeCatalog.Chapters.Length,Is.EqualTo(5));foreach(var d in NarrativeCatalog.Dialogues){Assert.That(d.Texts.Length,Is.EqualTo(7));foreach(string text in d.Texts)Assert.That(text,Is.Not.Empty);}Assert.That(SettingsRules.Text("fr","hardware:calculator"),Is.EqualTo("Calculatrice"));}
 }
}
