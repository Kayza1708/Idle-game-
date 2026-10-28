using UnityEngine;
using UnityEngine.UI;
namespace IdleIntelligence.Runtime
{
    // Content height follows the rendered, localized text. Unchanged labels do no layout work.
    [DefaultExecutionOrder(11000)]
    [RequireComponent(typeof(Text),typeof(LayoutElement))]
    public sealed class AdaptiveTextHeight : MonoBehaviour
    {
        Text label; LayoutElement size; string previous; float width=-1;
        public float Minimum=24,Padding=8;
        public static void Attach(Text text) { if(text.GetComponent<LayoutElement>()!=null&&text.GetComponent<AdaptiveTextHeight>()==null&&text.GetComponent<ContentTextHeight>()==null)text.gameObject.AddComponent<AdaptiveTextHeight>(); }
        void Awake(){label=GetComponent<Text>();size=GetComponent<LayoutElement>();}
        public void RefreshNow()=>LateUpdate();
        void LateUpdate()
        {
            float current=label.rectTransform.rect.width;
            if(previous==label.text&&Mathf.Abs(current-width)<.5f)return;
            previous=label.text;width=current;
            if(current<1)return;
            float height=Mathf.Max(Minimum,Mathf.Ceil(label.preferredHeight)+Padding);
            size.minHeight=Minimum;
            if(Mathf.Abs(size.preferredHeight-height)>.5f)size.preferredHeight=height;
            size.flexibleHeight=0;
        }
    }
}
