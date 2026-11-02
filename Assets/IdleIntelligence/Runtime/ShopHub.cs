using IdleIntelligence.Core;
using UnityEngine;
using UnityEngine.UI;

namespace IdleIntelligence.Runtime
{
    // One usable shop storefront, rather than a page of category-only cards.
    // Purchases still go through Market, GemShop, Capsules and PurchaseService.
    public sealed class ShopHub:MonoBehaviour
    {
        GameRuntime game;
        Transform storefront;
        Text heading;
        MarketView market;
        GemFeatureView gems;
        NativeStoreView packages;
        string page="chests";
        readonly System.Collections.Generic.Dictionary<string,Button> tabs=
            new System.Collections.Generic.Dictionary<string,Button>();

        public void Initialize(GameRuntime runtime)
        {
            game=runtime;
            bool de=game.State.Settings.language=="de";
            heading=WorkshopUIFactory.Label("ShopHeading",transform,"",19,38);
            AddTabs(new[]{"chests","materials","permanent","capsule","packages"},new[]{
                de?"Angebote":"Offers",de?"Komponenten":"Parts","Upgrades","Gumball",de?"Pakete":"Bundles"});
            storefront=WorkshopUIFactory.Vertical("StorefrontProducts",transform).transform;
            game.Act(Market.Visit);ShowPage("chests");
        }

        void AddTabs(string[] ids,string[] labels)
        {
            var row=StorefrontUI.Tabs("StoreTabs",transform);
            for(int i=0;i<ids.Length;i++)
            {
                string id=ids[i];
                if(id=="capsule"&&!ProgressionVisibility.Gumball(game.State))continue;
                var button=WorkshopUIFactory.Button("ShopTab-"+id,row,labels[i],
                    ()=>ShowPage(id));
                var size=button.GetComponent<LayoutElement>()??
                    button.gameObject.AddComponent<LayoutElement>();
                size.minHeight=size.preferredHeight=44;
                size.minWidth=0;
                size.flexibleWidth=1;
                StorefrontUI.Tab(button);tabs[id]=button;
            }
        }

        public void OpenGumball()=>ShowPage("capsule");

        public void ShowPage(string selected)
        {
            if(selected=="capsule"&&!ProgressionVisibility.Gumball(game.State))selected="chests";
            page=selected;
            foreach(var pair in tabs)
            {
                var text=pair.Value.GetComponentInChildren<Text>();
                if(text!=null)text.color=pair.Key==page?
                    GameTheme.Accent:GameTheme.Muted;
            }
            if(heading!=null)
                heading.text=(game.State.Settings.language=="de"?"SHOP":"SHOP")+
                    "    <color=#39E4F2>◆ "+game.State.Retention.gems+" Gems</color>";

            bool marketPage=selected=="chests"||selected=="materials"||selected=="odds";
            bool gemPage=selected=="capsule"||selected=="permanent";
            if(marketPage&&market==null)
            {
                var root=WorkshopUIFactory.Vertical("MarketStorefront",storefront);
                market=root.AddComponent<MarketView>();
                market.Initialize(game,true);
            }
            if(gemPage&&gems==null)
            {
                var root=WorkshopUIFactory.Vertical("GumballStorefront",storefront);
                gems=root.AddComponent<GemFeatureView>();
                gems.Initialize(game,true);
            }
            if(selected=="packages"&&packages==null)
            {
                var root=WorkshopUIFactory.Vertical("BundlesStorefront",storefront);
                packages=root.AddComponent<NativeStoreView>();
                packages.Initialize(game);
            }
            if(market!=null)
            {
                market.gameObject.SetActive(marketPage);
                if(marketPage)market.OpenPage(selected=="chests"?"offers":selected=="materials"?"materials":"odds");
            }
            if(gems!=null)
            {
                gems.gameObject.SetActive(gemPage);
                if(gemPage)gems.OpenPage(selected);
            }
            if(packages!=null)packages.gameObject.SetActive(selected=="packages");
            Canvas.ForceUpdateCanvases();
            if(tabs.TryGetValue(page,out var active)){
                var rail=active.GetComponentInParent<ScrollRect>();rail.StopMovement();
                var bounds=RectTransformUtility.CalculateRelativeRectTransformBounds(rail.viewport,(RectTransform)active.transform);
                float shift=bounds.min.x<rail.viewport.rect.xMin?rail.viewport.rect.xMin-bounds.min.x:bounds.max.x>rail.viewport.rect.xMax?rail.viewport.rect.xMax-bounds.max.x:0;
                rail.content.anchoredPosition+=Vector2.right*shift;
            }
            var scroll=game.Content.GetComponentInParent<ScrollRect>();
            if(scroll!=null)scroll.verticalNormalizedPosition=1;
        }

        void Update()
        {
            if(heading!=null&&game!=null)
                heading.text="SHOP   <color=#38F3FF>◆ "+
                    game.State.Retention.gems+" Gems</color>";
        }
    }
}
