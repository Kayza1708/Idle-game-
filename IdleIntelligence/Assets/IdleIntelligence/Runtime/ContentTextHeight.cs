using UnityEngine;
using UnityEngine.UI;

namespace IdleIntelligence.Runtime
{
    /// <summary>Wrap long social/privacy text without truncating or shrinking the font.</summary>
    [RequireComponent(typeof(Text), typeof(LayoutElement))]
    public sealed class ContentTextHeight : MonoBehaviour
    {
        public float Minimum = 44;
        Text label;
        LayoutElement layout;
        void LateUpdate() => Refresh();
        void OnRectTransformDimensionsChange() => Refresh();
        void Refresh()
        {
            if (label == null) { label = GetComponent<Text>(); layout = GetComponent<LayoutElement>(); }
            if (label.rectTransform.rect.width <= 0) return;
            if (Mathf.Abs(layout.minHeight - Minimum) > .5f) layout.minHeight = Minimum;
            var height = Mathf.Ceil(Mathf.Max(Minimum, label.preferredHeight + 12));
            if (Mathf.Abs(layout.preferredHeight - height) > .5f) layout.preferredHeight = height;
        }
    }
}
