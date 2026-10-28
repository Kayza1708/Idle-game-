using UnityEngine;
using UnityEngine.UI;

namespace IdleIntelligence.Runtime
{
    /// <summary>Wrap long social/privacy text without truncating or shrinking the font.</summary>
    [DefaultExecutionOrder(11000)]
    [RequireComponent(typeof(Text), typeof(LayoutElement))]
    public sealed class ContentTextHeight : MonoBehaviour
    {
        public float Minimum = 44;
        Text label;
        LayoutElement layout;string previous;float width=-1;
        void LateUpdate() => Refresh();
        void OnRectTransformDimensionsChange() => Refresh();
        void Refresh()
        {
            if (label == null) { label = GetComponent<Text>(); layout = GetComponent<LayoutElement>(); }
            float current=label.rectTransform.rect.width;if(current<=0)return;
            if(previous==label.text&&Mathf.Abs(current-width)<.5f)return;previous=label.text;width=current;
            if (Mathf.Abs(layout.minHeight - Minimum) > .5f) layout.minHeight = Minimum;
            var height = Mathf.Ceil(Mathf.Max(Minimum, label.preferredHeight + 12));
            if (Mathf.Abs(layout.preferredHeight - height) > .5f) layout.preferredHeight = height;
        }
    }
}
