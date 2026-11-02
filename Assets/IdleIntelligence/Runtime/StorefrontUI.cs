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
        public static Text Product(ActionCard card)
        {
            if(card.GetComponent<CompactActionCard>()==null)card.gameObject.AddComponent<CompactActionCard>();
            var layout=card.GetComponent<HorizontalLayoutGroup>();layout.spacing=6;layout.padding=new RectOffset(8,8,8,8);
            var art=card.Icon.GetComponent<LayoutElement>();art.minWidth=art.preferredWidth=48;art.minHeight=art.preferredHeight=48;art.flexibleWidth=0;
            var copy=card.Title.transform.parent.GetComponent<LayoutElement>()??card.Title.transform.parent.gameObject.AddComponent<LayoutElement>();copy.minWidth=copy.preferredWidth=0;copy.flexibleWidth=1;
            var price=WorkshopUIFactory.Label("ProductPrice",card.transform,"",13,44);var size=price.GetComponent<LayoutElement>();size.minWidth=size.preferredWidth=76;size.flexibleWidth=0;
            price.font=GameTheme.Bold;price.alignment=TextAnchor.MiddleRight;price.horizontalOverflow=HorizontalWrapMode.Overflow;return price;
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
