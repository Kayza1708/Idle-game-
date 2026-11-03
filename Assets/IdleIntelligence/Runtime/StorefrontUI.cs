using UnityEngine;
using UnityEngine.UI;

namespace IdleIntelligence.Runtime
{
    // Shared presentation only; quotes remain the authority for price and permission.
    public static class StorefrontUI
    {
        public static Transform Tabs(string name,Transform parent)
        {
            var host=WorkshopUIFactory.Node(name,parent,typeof(ScrollRect));WorkshopUIFactory.Size(host,48);
            var scroll=host.GetComponent<ScrollRect>();scroll.horizontal=true;scroll.vertical=false;scroll.movementType=ScrollRect.MovementType.Clamped;
            var viewport=WorkshopUIFactory.Node("Viewport",host.transform,typeof(Image),typeof(Mask));WorkshopUIFactory.Fill((RectTransform)viewport.transform);viewport.GetComponent<Mask>().showMaskGraphic=false;
            var content=WorkshopUIFactory.Node("Content",viewport.transform,typeof(HorizontalLayoutGroup),typeof(ContentSizeFitter));
            var rect=(RectTransform)content.transform;rect.anchorMin=Vector2.zero;rect.anchorMax=new Vector2(0,1);rect.pivot=new Vector2(0,.5f);rect.sizeDelta=Vector2.zero;
            var layout=content.GetComponent<HorizontalLayoutGroup>();layout.spacing=4;layout.childControlWidth=layout.childControlHeight=true;layout.childForceExpandWidth=false;layout.childForceExpandHeight=true;
            content.GetComponent<ContentSizeFitter>().horizontalFit=ContentSizeFitter.FitMode.PreferredSize;scroll.viewport=(RectTransform)viewport.transform;scroll.content=rect;return content.transform;
        }
        public static void Tab(Button button)
        {
            var size=button.GetComponent<LayoutElement>();size.minWidth=size.preferredWidth=Mathf.Max(92,Mathf.Ceil(button.GetComponentInChildren<Text>().preferredWidth)+24);size.minHeight=size.preferredHeight=44;size.flexibleWidth=0;GameTheme.CompactAction(button,false);
        }
        public static void FitWidth(Transform target)
        {
            var size=target.GetComponent<LayoutElement>()??target.gameObject.AddComponent<LayoutElement>();
            size.minWidth=size.preferredWidth=0;size.flexibleWidth=1;
        }
        public static Sprite Gem(GameRuntime game)=>game.Users.transform.parent.Find("ResourceIcon").GetComponent<Image>().sprite;
        public static Text CurrencyLine(Transform parent,float height=44,int fontSize=14)
        {
            var line=WorkshopUIFactory.Horizontal("GemPriceLine",parent,height);FitWidth(line.transform);
            var layout=line.GetComponent<HorizontalLayoutGroup>();layout.spacing=4;layout.childAlignment=TextAnchor.MiddleCenter;layout.childForceExpandWidth=false;layout.childForceExpandHeight=false;
            var icon=WorkshopUIFactory.Node("GemCurrencyIcon",line.transform,typeof(UnityEngine.UI.Image),typeof(LayoutElement));
            var art=icon.GetComponent<UnityEngine.UI.Image>();art.preserveAspect=true;art.raycastTarget=false;art.color=Color.clear;
            var iconSize=icon.GetComponent<LayoutElement>();iconSize.minWidth=iconSize.preferredWidth=22;iconSize.minHeight=iconSize.preferredHeight=22;iconSize.flexibleWidth=0;
            var label=WorkshopUIFactory.Label("ProductPrice",line.transform,"",fontSize,height);label.font=GameTheme.Bold;label.alignment=TextAnchor.MiddleCenter;
            label.resizeTextForBestFit=true;label.resizeTextMinSize=10;label.resizeTextMaxSize=fontSize;label.horizontalOverflow=HorizontalWrapMode.Wrap;label.verticalOverflow=VerticalWrapMode.Truncate;
            var textSize=label.GetComponent<LayoutElement>();textSize.minWidth=0;textSize.preferredWidth=-1;textSize.flexibleWidth=0;
            return label;
        }
        public static void Price(Text label,Sprite gem,string amount,Color tint,bool free=false)
        {
            label.text=amount;label.color=tint;var icon=label.transform.parent.Find("GemCurrencyIcon").GetComponent<UnityEngine.UI.Image>();icon.sprite=gem;icon.color=Color.white;icon.gameObject.SetActive(!free);
        }
        public static void CurrencyButton(UnityEngine.UI.Button button,Sprite gem)
        {
            var art=WorkshopUIFactory.Node("GemCurrencyIcon",button.transform,typeof(UnityEngine.UI.Image)).GetComponent<UnityEngine.UI.Image>();
            art.sprite=gem;art.preserveAspect=true;art.raycastTarget=false;art.rectTransform.anchorMin=art.rectTransform.anchorMax=new Vector2(0,.5f);art.rectTransform.pivot=new Vector2(0,.5f);art.rectTransform.anchoredPosition=new Vector2(8,0);art.rectTransform.sizeDelta=Vector2.one*22;
            button.GetComponentInChildren<Text>().rectTransform.offsetMin=new Vector2(34,4);
        }
        public static Text Product(ActionCard card,bool gallery=false)
        {
            if(!gallery){
                if(card.GetComponent<CompactActionCard>()==null)card.gameObject.AddComponent<CompactActionCard>();
                var surface=card.GetComponent<Image>();surface.sprite=null;surface.color=Color.clear;
                var row=card.GetComponent<HorizontalLayoutGroup>();row.spacing=6;row.padding=new RectOffset(8,8,8,8);
                var icon=card.Icon.GetComponent<LayoutElement>();icon.minWidth=icon.preferredWidth=48;icon.minHeight=icon.preferredHeight=48;icon.flexibleWidth=0;
                var copySize=card.Title.transform.parent.GetComponent<LayoutElement>()??card.Title.transform.parent.gameObject.AddComponent<LayoutElement>();copySize.minWidth=copySize.preferredWidth=0;copySize.flexibleWidth=1;
                var cost=CurrencyLine(card.transform,44,13);var costSize=cost.transform.parent.GetComponent<LayoutElement>();costSize.minWidth=costSize.preferredWidth=76;costSize.flexibleWidth=0;cost.font=GameTheme.Bold;cost.alignment=TextAnchor.MiddleRight;return cost;
            }
            var compact=card.GetComponent<CompactActionCard>();if(compact!=null)Object.DestroyImmediate(compact);
            var horizontal=card.GetComponent<HorizontalLayoutGroup>();if(horizontal!=null)Object.DestroyImmediate(horizontal);
            var background=card.GetComponent<Image>();background.sprite=null;background.color=Color.clear;
            var colors=card.Button.colors;colors.normalColor=colors.highlightedColor=colors.selectedColor=Color.white;colors.disabledColor=new Color(1,1,1,.65f);card.Button.colors=colors;
            var layout=card.gameObject.AddComponent<VerticalLayoutGroup>();layout.spacing=4;layout.padding=new RectOffset(4,4,4,4);layout.childControlWidth=layout.childControlHeight=true;layout.childForceExpandWidth=true;layout.childForceExpandHeight=false;
            var copy=card.Title.transform.parent;card.Title.transform.SetParent(card.transform,false);copy.gameObject.SetActive(false);
            var adaptive=card.Title.GetComponent<AdaptiveTextHeight>();if(adaptive!=null)Object.DestroyImmediate(adaptive);
            card.Icon.transform.SetSiblingIndex(0);card.Title.transform.SetSiblingIndex(1);
            var art=card.Icon.GetComponent<LayoutElement>();art.minWidth=art.preferredWidth=0;art.minHeight=art.preferredHeight=104;art.flexibleWidth=1;
            card.Title.fontSize=12;card.Title.resizeTextForBestFit=true;card.Title.resizeTextMinSize=10;card.Title.resizeTextMaxSize=12;card.Title.alignment=TextAnchor.MiddleCenter;card.Title.horizontalOverflow=HorizontalWrapMode.Wrap;card.Title.verticalOverflow=VerticalWrapMode.Truncate;
            var titleSize=card.Title.GetComponent<LayoutElement>()??card.Title.gameObject.AddComponent<LayoutElement>();titleSize.minHeight=titleSize.preferredHeight=32;titleSize.minWidth=titleSize.preferredWidth=0;titleSize.flexibleWidth=1;
            var size=card.GetComponent<LayoutElement>();size.minHeight=size.preferredHeight=200;size.flexibleHeight=0;
            var price=CurrencyLine(card.transform);price.font=GameTheme.Bold;price.alignment=TextAnchor.MiddleCenter;
            return price;
        }
        static readonly System.Collections.Generic.Dictionary<int,Sprite> chests=new System.Collections.Generic.Dictionary<int,Sprite>();
        public static Sprite Chest(int tier)
        {
            if(chests.TryGetValue(tier,out var sprite))return sprite;
            var art=Resources.Load<PresentationArt>("PixelUI/PresentationArt");if(art==null||tier<0||tier>=art.ChestBody.Length)return null;
            var body=art.ChestBody[tier];var lid=art.ChestLid[tier];var a=body.rect;var b=lid.rect;
            sprite=Sprite.Create(body.texture,Rect.MinMaxRect(Mathf.Min(a.xMin,b.xMin),Mathf.Min(a.yMin,b.yMin),Mathf.Max(a.xMax,b.xMax),Mathf.Max(a.yMax,b.yMax)),Vector2.one*.5f,body.pixelsPerUnit);
            sprite.name="CompleteChest-"+tier;chests[tier]=sprite;return sprite;
        }

        public static GameObject Info(GameRuntime game,string name,string title,string text)
        {
            var root=Object.Instantiate(game.WorkshopPrefab.DetailRoot,game.Content.GetComponentInParent<Canvas>().transform);root.name=name;root.SetActive(true);WorkshopUIFactory.Fill((RectTransform)root.transform);root.AddComponent<SafeArea>();
            var close=root.transform.Find("DetailPanel/CloseItemDetail").GetComponent<Button>();close.onClick.RemoveAllListeners();close.onClick.AddListener(()=>{root.SetActive(false);Object.Destroy(root);});close.GetComponentInChildren<Text>().text="×";
            var scroll=root.GetComponentInChildren<ScrollRect>(true);foreach(Transform child in scroll.content)child.gameObject.SetActive(false);
            var body=WorkshopUIFactory.Vertical("InfoBody",scroll.content);AdaptiveTextHeight.Attach(WorkshopUIFactory.Label("InfoTitle",body.transform,title,20,44));AdaptiveTextHeight.Attach(WorkshopUIFactory.Label("InfoText",body.transform,text,14,44));
            Canvas.ForceUpdateCanvases();scroll.verticalNormalizedPosition=1;return root;
        }
    }
}
