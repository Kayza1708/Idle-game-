using System;
using System.IO;
using System.Linq;
using System.Collections;
using IdleIntelligence.Core;
using IdleIntelligence.Runtime;
using NUnit.Framework;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.TestTools;
using UnityEngine.UI;

namespace IdleIntelligence.PlayTests
{
    public sealed class LocalMobileTests
    {
        string dir;
        GameRuntime game;
        [UnitySetUp] public IEnumerator Setup()
        {
            dir=Path.Combine(Path.GetTempPath(),"idle-local-mobile-"+Guid.NewGuid());
            Directory.CreateDirectory(dir);
            GameRuntime.SavePathOverride=Path.Combine(dir,"save.json");
            yield return SceneManager.LoadSceneAsync("IdleIntelligence");
            yield return null;
            game=UnityEngine.Object.FindFirstObjectByType<GameRuntime>();
            game.Act(s=>NarrativeBridge.Action(s,"name","AURA"));
            for(int i=0;i<5;i++)game.Act(s=>NarrativeBridge.Action(s,"continue"));
            game.Act(s=>NarrativeBridge.Action(s,"skip-tutorial"));
            game.Act(s=>{var n=s.Copy();n.Legacy.prepared=true;n.Story.enabled=false;n.Story.open=null;n.Story.queue=Array.Empty<string>();n.Story.seen=NarrativeCatalog.Dialogues.Select(d=>d.Id).ToArray();return n;});
        }
        [UnityTearDown] public IEnumerator Cleanup()
        {
            if(game!=null)UnityEngine.Object.Destroy(game.gameObject);
            yield return null;
            GameRuntime.SavePathOverride=null;
            Directory.Delete(dir,true);
        }
        [UnityTest] public IEnumerator DistinctCuesHonorMuteWithoutChangingTransactions()
        {
            game.Audio.Unlock();
            yield return new WaitForSecondsRealtime(.2f);
            var credits=game.State.Credits;
            var gems=game.State.Retention.gems;
            foreach(var id in new[]{"forge-impact","fusion-impact","purchase-confirm","gumball-turn","gumball-open"})
            {
                var clip=Resources.Load<AudioClip>("Audio/"+id);
                Assert.That(clip,Is.Not.Null,id);
                Assert.That(clip.length,Is.InRange(.2f,.8f));
                Assert.That(game.Audio.Play(id),Is.True,id);
                Assert.That(game.Audio.LastPlayed,Is.EqualTo(id));
                yield return new WaitForSecondsRealtime(.85f);
            }
            game.Act(s=>{var n=s.Copy();n.Settings.sfxMuted=true;return n;});
            Assert.That(game.Audio.Play("fusion-impact"),Is.False);
            Assert.That(game.State.Credits.CompareTo(credits),Is.Zero);
            Assert.That(game.State.Retention.gems,Is.EqualTo(gems));
        }
        [UnityTest] public IEnumerator BadgeRevealFollowsSavedClaimAndCancelsOnNavigation()
        {
            Debug.Log("PREPARED_BADGE_UI: isolated funded stock, real paid hardware and actual achievement claim");
            game.Act(s=>{var n=s.Copy();n.Credits=ScientificNumber.From(1e12);return Game.Buy(n,Balance.Hardware[0].Id,25);});
            game.Show("profile");yield return null;
            GameObject.Find("ShowAchievements").GetComponent<Button>().onClick.Invoke();yield return null;
            GameObject.Find("Achievement-hardware").GetComponent<ActionCard>().Button.onClick.Invoke();yield return null;
            var icon=GameObject.Find("Achievement-hardware").GetComponent<ActionCard>().Icon;
            Assert.That(icon.GetComponent<PanelMotion>(),Is.Not.Null);
            Assert.That(game.State.Retention.achievementClaims,Does.Contain("hardware:0"));
            var saved=new AtomicSaveStore(game.SavePath,new UnitySaveCodec()).Load(game.State.SavedAt);
            Assert.That(saved.State.Retention.achievementClaims,Does.Contain("hardware:0"));
            WorkshopTests.Capture(390,844,"/tmp/idle-local-badge-prepared-390.png");
            game.Show("company");yield return null;
            Assert.That(game.State.Retention.achievementClaims.Count(x=>x=="hardware:0"),Is.EqualTo(1));
        }
        [UnityTest] public IEnumerator CompanyTextAndCompactProfileRemainReachableAtMobileWidths()
        {
            foreach(var lang in new[]{"de","en"})
            {
                game.Act(s=>SettingsRules.Change(s,"language",lang));
                foreach(int width in new[]{320,390,430})
                {
                    game.Act(s=>{var n=s.Copy();n.Prestige.resets=0;n.Prestige.Total=ScientificNumber.Zero;return n;});
                    game.Show("company");
                    yield return null;
                    WorkshopTests.Capture(width,width==320?568:width==390?844:932,"/tmp/idle-local-company-"+lang+"-"+width+".png");
                    yield return null;yield return null;
                    Canvas.ForceUpdateCanvases();
                    var text=GameObject.Find("CompanyState").GetComponent<Text>();
                    Assert.That(text.GetComponent<LayoutElement>().preferredHeight,Is.GreaterThanOrEqualTo(text.preferredHeight));
                    game.Act(s=>{var n=s.Copy();n.Prestige.resets=1;n.Prestige.Total=ScientificNumber.From(1000);return n;});
                    Debug.Log("PREPARED_COMPANY_UI: isolated test save, 1,000 total INT; no verified server entitlement");
                    game.Show("company");yield return null;
                    WorkshopTests.Capture(width,width==320?568:width==390?844:932,"/tmp/idle-local-company-prepared-"+lang+"-"+width+".png");
                    game.Show("profile");yield return null;
                    Assert.That(GameObject.Find("ShowBadges").GetComponent<Button>().interactable,Is.True);
                    Assert.That(GameObject.Find("RetentionPrimary").GetComponent<LayoutElement>().preferredHeight,Is.EqualTo(48));
                    WorkshopTests.Capture(width,width==320?568:width==390?844:932,"/tmp/idle-local-profile-"+lang+"-"+width+".png");
                }
            }
        }
    }
}
