using UnityEngine;
using UnityEngine.UI;
namespace IdleIntelligence.Runtime
{
    // Shared presentation only. Never changes actions, quotes, access gates or save data.
    [DefaultExecutionOrder(13000)]
    public sealed class PagePresentation:MonoBehaviour
    {
        GameRuntime game;long generation=-1;string route;float width=-1;
        public static void Attach(GameObject canvas,GameRuntime runtime)
        {var view=canvas.GetComponent<PagePresentation>()??canvas.AddComponent<PagePresentation>();view.game=runtime;}
        bool Page(Transform target)
        {
            if(target.GetComponentInParent<LaboratoryView>()!=null||target.GetComponentInParent<HardwarePresentation>()!=null)return false;
            if(target.IsChildOf(game.Content))return true;
            var safe=target.GetComponentInParent<SafeArea>();return safe!=null&&safe!=game.Content.GetComponentInParent<SafeArea>();
        }
        bool Network(Transform target)=>target.GetComponentInParent<PrestigeNetworkView>()!=null;
        void LateUpdate()
        {
            if(game==null||game.State==null)return;
            float current=((RectTransform)game.Content).rect.width;
            if(generation==PerformanceMarkers.UiNodes&&route==game.CurrentTab&&Mathf.Abs(width-current)<.5f)return;
            route=game.CurrentTab;width=current;var contentLayout=game.Content.GetComponent<VerticalLayoutGroup>();if(contentLayout!=null){int inset=route=="hardware"?0:8;contentLayout.padding=new RectOffset(inset,inset,0,0);}
            foreach(var group in GetComponentsInChildren<VerticalLayoutGroup>(true))
            {
                if(!Page(group.transform)||Network(group.transform))continue;
                var size=group.GetComponent<LayoutElement>();
                if(size==null||size.preferredWidth<0)StorefrontUI.FitWidth(group.transform);
            }
            foreach(var group in GetComponentsInChildren<HorizontalLayoutGroup>(true))
            {
                if(!Page(group.transform)||Network(group.transform))continue;
                bool flexible=false,fixedWidth=false;foreach(Transform child in group.transform){var size=child.GetComponent<LayoutElement>();if(size==null)continue;flexible|=size.flexibleWidth>0;fixedWidth|=size.minWidth>0&&size.flexibleWidth<=0;}
                if(flexible&&fixedWidth)group.childForceExpandWidth=false;
            }
            foreach(var grid in GetComponentsInChildren<GridLayoutGroup>(true))
                if(Page(grid.transform)&&!Network(grid.transform))StorefrontUI.FitWidth(grid.transform);
            foreach(var image in GetComponentsInChildren<Image>(true))
            {
                if(image.sprite!=GameTheme.Steel||!Page(image.transform)||Network(image.transform))continue;
                image.sprite=null;image.type=Image.Type.Simple;
                image.color=image.name.EndsWith("Panel")?GameTheme.Background:image.GetComponent<InputField>()!=null?GameTheme.Raised:Color.clear;
            }
            foreach(var button in GetComponentsInChildren<Button>(true))
            {
                if(!Page(button.transform)||Network(button.transform))continue;
                var image=button.GetComponent<Image>();
                if(image!=null&&image.sprite!=GameTheme.GoldButton&&image.sprite!=GameTheme.MintButton&&image.sprite==null)image.color=Color.clear;
                if(button.name.StartsWith("Show")&&button.GetComponentInParent<RetentionView>()!=null){var label=button.GetComponentInChildren<Text>();if(label!=null)label.resizeTextMinSize=10;}
                var size=button.GetComponent<LayoutElement>();
                if(size!=null&&!size.ignoreLayout&&button.GetComponent<ActionCard>()==null&&button.GetComponent<ItemPortrait>()==null){size.minHeight=size.preferredHeight=44;size.minWidth=Mathf.Max(44,size.minWidth);}
            }
            foreach(var card in GetComponentsInChildren<ActionCard>(true))
                if(Page(card.transform)&&card.GetComponent<LearningCard>()==null)StorefrontUI.FitWidth(card.transform);
            generation=PerformanceMarkers.UiNodes;
        }
    }
}
