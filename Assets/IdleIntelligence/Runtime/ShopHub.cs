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
        Text heading,balance;
        MarketView market;
        GemFeatureView gems;
        NativeStoreView packages;
        string page="chests";
        readonly System.Collections.Generic.Dictionary<string,Button> tabs=
            new System.Collections.Generic.Dictionary<string,Button>();

        public void Initialize(GameRuntime runtime)
        {
            game=runtime;StorefrontUI.FitWidth(transform);
            bool de=game.State.Settings.language=="de";
            var header=WorkshopUIFactory.Horizontal("ShopHeader",transform,44);StorefrontUI.FitWidth(header.transform);heading=WorkshopUIFactory.Label("ShopHeading",header.transform,"SHOP",19,44);StorefrontUI.FitWidth(heading.transform);balance=StorefrontUI.CurrencyLine(header.transform,44,18);var balanceSize=balance.transform.parent.GetComponent<LayoutElement>();balanceSize.preferredWidth=164;balanceSize.flexibleWidth=0;
            AddTabs(new[]{"chests","materials","permanent","capsule","packages"},new[]{
                de?"Angebote":"Offers",de?"Komponenten":"Parts","Upgrades","Gumball",de?"Pakete":"Bundles"});
            storefront=WorkshopUIFactory.Vertical("StorefrontProducts",transform).transform;StorefrontUI.FitWidth(storefront);
            game.Act(Market.Visit);ShowPage("chests");
        }

        void AddTabs(string[] ids,string[] labels)
        {
            int count=ids.Length-(ProgressionVisibility.Gumball(game.State)?0:1);var row=PresentationLayout.Grid("StoreTabs",transform,count>4?3:2,count,44);StorefrontUI.FitWidth(row);
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
                GameTheme.CompactAction(button,false);size.minWidth=size.preferredWidth=0;tabs[id]=button;
            }
        }

        public void OpenGumball()=>ShowPage("capsule");
        public void OpenAdFree(){ShowPage("packages");packages.FocusAdFree();}

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
            RefreshBalance();

            bool marketPage=selected=="chests"||selected=="materials"||selected=="odds";
            bool gemPage=selected=="capsule"||selected=="permanent";
            if(marketPage&&market==null)
            {
                var root=WorkshopUIFactory.Vertical("MarketStorefront",storefront);
                StorefrontUI.FitWidth(root.transform);market=root.AddComponent<MarketView>();
                market.Initialize(game,true);
            }
            if(gemPage&&gems==null)
            {
                var root=WorkshopUIFactory.Vertical("GumballStorefront",storefront);
                StorefrontUI.FitWidth(root.transform);gems=root.AddComponent<GemFeatureView>();
                gems.Initialize(game,true);
            }
            if(selected=="packages"&&packages==null)
            {
                var root=WorkshopUIFactory.Vertical("BundlesStorefront",storefront);
                StorefrontUI.FitWidth(root.transform);packages=root.AddComponent<NativeStoreView>();
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
            var scroll=game.Content.GetComponentInParent<ScrollRect>();
            if(scroll!=null)scroll.verticalNormalizedPosition=1;
        }

        void RefreshBalance()
        {
            if(game==null||balance==null)return;
            StorefrontUI.Price(balance,StorefrontUI.Gem(game),NumberFormatting.Format(ScientificNumber.From(game.State.Retention.gems),game.State.Settings.numberFormat,game.State.Settings.language)+" Gems",GameTheme.Accent);
        }
        void Update()=>RefreshBalance();
    }
}
