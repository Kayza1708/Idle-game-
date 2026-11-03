using System;
using System.IO;
using System.Linq;
using System.Collections;
using IdleIntelligence.Core;
using IdleIntelligence.Runtime;
using NUnit.Framework;
using UnityEngine;
using UnityEngine.UI;
using UnityEngine.EventSystems;
using System.Collections.Generic;
using UnityEngine.SceneManagement;
using UnityEngine.TestTools;
namespace IdleIntelligence.PlayTests
{
    public sealed class UnifiedPresentationTests
    {
        GameRuntime game;
        const string Output="/tmp/idle-unified-review";
        [UnitySetUp] public IEnumerator Setup()
        {
            Directory.CreateDirectory(Output);
            var directory=Path.Combine(Path.GetTempPath(),"unified-ui-"+Guid.NewGuid());Directory.CreateDirectory(directory);GameRuntime.SavePathOverride=Path.Combine(directory,"save.json");
            yield return SceneManager.LoadSceneAsync("IdleIntelligence");yield return null;
            game=UnityEngine.Object.FindFirstObjectByType<GameRuntime>();
            game.Act(s=>NarrativeBridge.Action(s,"name","AURA"));
            game.Act(s=>NarrativeBridge.Action(s,"skip-tutorial"));
            game.Act(s=>{var n=s.Copy();n.Story.enabled=false;n.Story.open=null;n.Story.queue=Array.Empty<string>();n.Story.seen=NarrativeCatalog.Dialogues.Select(d=>d.Id).ToArray();n.Story.tutorial="skipped";return n;});
        }
        [UnityTearDown] public IEnumerator Cleanup()
        {if(game!=null)UnityEngine.Object.Destroy(game.gameObject);yield return null;GameRuntime.SavePathOverride=null;}
        [UnityTest] public IEnumerator IllustratedForgeAndBorderlessChestsFitBothLanguagesAndAllWidths()
        {
            Assert.That(ItemBalance.Items.Length,Is.EqualTo(42));
            foreach(var id in UnityV3Catalog.AddedIds)Assert.That(UnityV3PixelArt.Get(id),Is.Not.Null,id);
            foreach(string language in new[]{"de","en"})foreach(int width in new[]{320,390,430})
            {
                PortraitGameView.Set(width,width==320?694:width==390?846:932);
                game.Act(s=>SettingsRules.Change(s,"language",language));
                game.Show("items");yield return null;game.WorkshopView.ChangeMode("inventory");yield return null;game.FlushLocalization();Canvas.ForceUpdateCanvases();
                Assert.That(Screen.width,Is.EqualTo(width),"Actual GameView size");
                var display=UnityEngine.Object.FindFirstObjectByType<ModelLoadout>();
                var viewport=game.Content.GetComponentInParent<ScrollRect>().viewport;
                Assert.That(((RectTransform)game.WorkshopView.transform).rect.width,Is.LessThanOrEqualTo(viewport.rect.width+.5f),"Forge must shrink with viewport");
                Assert.That(display.Network.Find("ForgeIllustration").GetComponent<Image>().sprite,Is.Not.Null);
                Assert.That(display.Network.GetComponentInChildren<ModelLinks>().enabled,Is.False);
                var sockets=display.Network.GetComponentsInChildren<ItemPortrait>();Assert.That(sockets.Length,Is.EqualTo(6));
                foreach(var socket in sockets){Assert.That(socket.Frame.enabled,Is.False);Assert.That(((RectTransform)socket.Button.targetGraphic.transform).rect.width,Is.GreaterThanOrEqualTo(44));
                    var pointer=new PointerEventData(EventSystem.current){position=RectTransformUtility.WorldToScreenPoint(null,socket.Button.targetGraphic.transform.position)};
                    var hits=new List<RaycastResult>();EventSystem.current.RaycastAll(pointer,hits);Assert.That(hits.Count,Is.GreaterThan(0));Assert.That(ExecuteEvents.GetEventHandler<IPointerClickHandler>(hits[0].gameObject),Is.EqualTo(socket.Button.gameObject),socket.name+" real touch target");}
                WorkshopTests.Capture(width,Screen.height,Output+"/forge-"+language+"-"+width+".png");
                game.Show("shop");yield return null;GameObject.Find("ShopTab-chests").GetComponent<Button>().onClick.Invoke();yield return null;yield return null;game.FlushLocalization();Canvas.ForceUpdateCanvases();
                var cards=game.Content.GetComponentsInChildren<ActionCard>().Where(c=>c.name.StartsWith("MarketOffer-")).ToArray();
                Assert.That(cards.Length,Is.GreaterThanOrEqualTo(5));
                foreach(var card in cards){Assert.That(card.GetComponent<Image>().color.a,Is.Zero,card.name);Assert.That(card.Icon.rectTransform.rect.height,Is.GreaterThanOrEqualTo(100));Assert.That(card.GetComponentsInChildren<Text>().First(t=>t.name=="ProductPrice").text,Is.Not.Empty);}
                foreach(var card in cards.Where(c=>c.name.Contains("chest:")||c.name.EndsWith("free-common")))Assert.That(card.Icon.sprite.rect.width,Is.EqualTo(card.Icon.sprite.rect.height),"Chest body and lid must both be visible");
                WorkshopTests.Capture(width,Screen.height,Output+"/shop-"+language+"-"+width+".png");
            }
        }
        static void InsideHorizontally(RectTransform item,RectTransform viewport)
        {
            var corners=new Vector3[4];item.GetWorldCorners(corners);
            Assert.That(viewport.InverseTransformPoint(corners[0]).x,Is.GreaterThanOrEqualTo(viewport.rect.xMin-1),item.name+" left edge");
            Assert.That(viewport.InverseTransformPoint(corners[2]).x,Is.LessThanOrEqualTo(viewport.rect.xMax+1),item.name+" right edge");
        }
        [UnityTest] public IEnumerator ShopCurrencyArtAndProductsStayInsideWhileResizingTheSameShop()
        {
            game.Act(s=>{var n=s.Copy();n.Prestige.resets=1;n.Retention.gems=9000000000000000;return n;});
            foreach(string language in new[]{"de","en"})
            {
                game.Act(s=>SettingsRules.Change(s,"language",language));game.Show("shop");yield return null;
                var shop=game.Content.GetComponentInChildren<ShopHub>();
                foreach(int width in new[]{430,320,390,320})
                {
                    PortraitGameView.Set(width,width==320?694:width==390?846:932);yield return null;yield return null;
                    foreach(string page in new[]{"chests","materials","permanent","packages","capsule"})
                    {
                        GameObject.Find("ShopTab-"+page).GetComponent<Button>().onClick.Invoke();yield return null;yield return null;game.FlushLocalization();Canvas.ForceUpdateCanvases();
                        Assert.That(game.Content.GetComponentInChildren<ShopHub>(),Is.SameAs(shop),"Resize the existing page, not a newly rebuilt viewport");
                        var viewport=game.Content.GetComponentInParent<ScrollRect>().viewport;
                        foreach(var tab in shop.GetComponentsInChildren<Button>().Where(b=>b.name.StartsWith("ShopTab-"))){InsideHorizontally((RectTransform)tab.transform,viewport);Assert.That(((RectTransform)tab.transform).rect.height,Is.GreaterThanOrEqualTo(44));}
                        foreach(var card in shop.GetComponentsInChildren<ActionCard>()){InsideHorizontally((RectTransform)card.transform,viewport);InsideHorizontally(card.Title.rectTransform,viewport);}
                        foreach(var label in shop.GetComponentsInChildren<Text>().Where(t=>t.name=="ProductPrice"))
                        {
                            InsideHorizontally(label.rectTransform,viewport);var icon=label.transform.parent.Find("GemCurrencyIcon").GetComponent<Image>();
                            if(icon.gameObject.activeInHierarchy){Assert.That(icon.sprite,Is.SameAs(StorefrontUI.Gem(game)));InsideHorizontally(icon.rectTransform,viewport);}
                            Assert.That(label.text,Does.Not.Contain("◆"));
                            var generated=new TextGenerator();generated.Populate(label.text,label.GetGenerationSettings(label.rectTransform.rect.size));Assert.That(generated.characterCountVisible,Is.GreaterThanOrEqualTo(label.text.Length),"Price cannot be clipped: "+label.text);((IDisposable)generated).Dispose();
                        }
                        WorkshopTests.Capture(width,Screen.height,Output+"/shop-"+page+"-"+language+"-"+width+".png");
                        var scroll=game.Content.GetComponentInParent<ScrollRect>();scroll.verticalNormalizedPosition=0;yield return null;Canvas.ForceUpdateCanvases();
                        foreach(var card in shop.GetComponentsInChildren<ActionCard>())InsideHorizontally((RectTransform)card.transform,viewport);
                        WorkshopTests.Capture(width,Screen.height,Output+"/shop-"+page+"-bottom-"+language+"-"+width+".png");scroll.verticalNormalizedPosition=1;
                    }
                }
            }
        }
        static void Touch(UnityEngine.UI.Button button)
        {
            var data=new PointerEventData(EventSystem.current){button=PointerEventData.InputButton.Left,position=RectTransformUtility.WorldToScreenPoint(null,((RectTransform)button.transform).TransformPoint(((RectTransform)button.transform).rect.center))};
            var hits=new List<RaycastResult>();EventSystem.current.RaycastAll(data,hits);Assert.That(hits.Count,Is.GreaterThan(0));
            Assert.That(ExecuteEvents.GetEventHandler<IPointerClickHandler>(hits[0].gameObject),Is.EqualTo(button.gameObject),button.name+" must receive the actual touch");
            ExecuteEvents.Execute(button.gameObject,data,ExecuteEvents.pointerClickHandler);
        }
        [UnityTest] public IEnumerator TinyHomeLinksFitBothEdgesAndNeverDrawOrSpendOnNavigation()
        {
            Assert.That(GameObject.Find("HomeGumballDock"),Is.Null);Assert.That(GameObject.Find("HomeAdFree"),Is.Null);
            game.Act(s=>{var n=s.Copy();n.Prestige.resets=1;return n;});yield return null;
            foreach(string language in new[]{"de","en"})foreach(var resolution in new[]{new Vector2Int(320,568),new Vector2Int(320,694),new Vector2Int(390,846),new Vector2Int(430,932)})
            {
                int width=resolution.x;game.Act(s=>SettingsRules.Change(s,"language",language));PortraitGameView.Set(width,resolution.y);game.Show("hardware");yield return null;yield return null;Canvas.ForceUpdateCanvases();
                var quick=GameObject.Find("GumballQuick").GetComponent<UnityEngine.UI.Button>();var adFree=GameObject.Find("HomeAdFree").GetComponent<UnityEngine.UI.Button>();
                var dock=(RectTransform)GameObject.Find("HomeGumballDock").transform;var stage=(RectTransform)dock.parent;
                foreach(var b in new[]{quick,adFree}){var rect=(RectTransform)b.transform;Assert.That(rect.rect.width,Is.EqualTo(44));Assert.That(rect.rect.height,Is.EqualTo(52));InsideHorizontally(rect,stage);var corners=new Vector3[4];rect.GetWorldCorners(corners);Assert.That(stage.InverseTransformPoint(corners[0]).y,Is.GreaterThanOrEqualTo(stage.rect.yMin));Assert.That(stage.InverseTransformPoint(corners[2]).y,Is.LessThanOrEqualTo(stage.rect.yMax));Assert.That(b.GetComponent<Image>().color.a,Is.Zero,"No framed home card");Assert.That(b.GetComponentInChildren<Text>().preferredHeight,Is.LessThanOrEqualTo(b.GetComponentInChildren<Text>().rectTransform.rect.height+1),"Tiny caption remains on one line");}
                Assert.That(GameObject.Find("HomeGumballDraw"),Is.Null,"Home never offers a direct paid draw");Assert.That(quick.transform.Find("GumballArt").GetComponent<Image>().rectTransform.rect.height,Is.LessThanOrEqualTo(36));Assert.That(adFree.transform.position.x,Is.LessThan(game.TapButton.transform.position.x));Assert.That(quick.transform.position.x,Is.GreaterThan(game.TapButton.transform.position.x));
                var tapPointer=new PointerEventData(EventSystem.current){position=RectTransformUtility.WorldToScreenPoint(null,game.TapButton.transform.position)};var tapHits=new List<RaycastResult>();EventSystem.current.RaycastAll(tapPointer,tapHits);Assert.That(ExecuteEvents.GetEventHandler<IPointerClickHandler>(tapHits[0].gameObject),Is.EqualTo(game.TapButton.gameObject));
                WorkshopTests.Capture(width,Screen.height,Output+"/home-tiny-links-"+language+"-"+width+(resolution.y==568?"-short":"")+".png");long gems=game.State.Retention.gems,draws=game.State.Capsules.draws;double taps=game.State.Lifetime.taps;Touch(quick);yield return null;
                Assert.That(game.CurrentTab,Is.EqualTo("shop"));Assert.That(GameObject.Find("CapsuleDraw"),Is.Not.Null);Assert.That(game.State.Retention.gems,Is.EqualTo(gems));Assert.That(game.State.Capsules.draws,Is.EqualTo(draws));Assert.That(game.State.Lifetime.taps,Is.EqualTo(taps));game.Show("hardware");yield return null;
            }
        }
        [UnityTest] public IEnumerator LeftHomeLinkOpensTheActualAdFreeOfferWithoutInventingPurchaseRights()
        {
            game.Act(s=>{var n=s.Copy();n.Prestige.resets=1;return n;});PortraitGameView.Set(390,846);yield return null;yield return null;Canvas.ForceUpdateCanvases();
            long gems=game.State.Retention.gems;Touch(GameObject.Find("HomeAdFree").GetComponent<UnityEngine.UI.Button>());yield return null;yield return null;yield return null;Canvas.ForceUpdateCanvases();
            Assert.That(game.CurrentTab,Is.EqualTo("shop"));var target=GameObject.Find("StoreProduct-ai_singularity.pass.adfree").GetComponent<ActionCard>();var viewport=game.Content.GetComponentInParent<ScrollRect>().viewport;var corners=new Vector3[4];((RectTransform)target.transform).GetWorldCorners(corners);
            Assert.That(viewport.InverseTransformPoint(corners[1]).y,Is.LessThanOrEqualTo(viewport.rect.yMax+1));Assert.That(viewport.InverseTransformPoint(corners[0]).y,Is.GreaterThanOrEqualTo(viewport.rect.yMin));Assert.That(target.Button.interactable,Is.False,"Existing store provider is unavailable, no fake checkout");
            Assert.That(game.State.Retention.gems,Is.EqualTo(gems));Assert.That(PurchaseRules.AdFree(game.State),Is.False);Assert.That(game.State.Rewards.transactions,Is.Empty);WorkshopTests.Capture(390,846,Output+"/home-adfree-destination-de-390.png");
        }
    }
}
