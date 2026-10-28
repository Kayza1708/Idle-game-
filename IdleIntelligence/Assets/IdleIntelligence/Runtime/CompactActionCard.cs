using UnityEngine;
using UnityEngine.UI;
namespace IdleIntelligence.Runtime
{
    [DefaultExecutionOrder(12000)]
    [RequireComponent(typeof(ActionCard))]
    public sealed class CompactActionCard : MonoBehaviour
    {
        ActionCard card;LayoutElement size;string signature;float width=-1;
        void Awake()
        {
            card=GetComponent<ActionCard>();size=GetComponent<LayoutElement>();
            var column=card.Title.transform.parent.GetComponent<VerticalLayoutGroup>();if(column!=null){column.childForceExpandHeight=false;column.spacing=4;}
            GameTheme.SurfaceOn(GetComponent<Image>(),GameTheme.Surface);
            card.Title.font=GameTheme.Bold;card.Title.fontSize=15;card.Detail.font=GameTheme.Body;card.Detail.fontSize=13;
            card.Title.alignment=card.Detail.alignment=TextAnchor.UpperLeft;
            AdaptiveTextHeight.Attach(card.Title);AdaptiveTextHeight.Attach(card.Detail);
        }
        public void RefreshNow()=>LateUpdate();
        void LateUpdate()
        {
            if(size==null)return;string next=card.Title.text+"\n"+card.Detail.text;float current=card.Title.rectTransform.rect.width;
            if(signature==next&&Mathf.Abs(current-width)<.5f)return;signature=next;width=current;if(current<1)return;
            float height=Mathf.Max(card.Icon.gameObject.activeSelf?80:64,Mathf.Ceil(card.Title.preferredHeight+card.Detail.preferredHeight)+24);
            size.minHeight=size.preferredHeight=height;size.flexibleHeight=0;
        }
    }
}
