using UnityEngine;
using UnityEngine.UI;
namespace IdleIntelligence.Runtime
{
    // A decorative sliced sprite must not impose its source texture height on layout.
    [RequireComponent(typeof(VerticalLayoutGroup))]
    public sealed class NaturalPanel:MonoBehaviour,ILayoutElement
    {
        VerticalLayoutGroup layout;
        VerticalLayoutGroup Layout=>layout!=null?layout:(layout=GetComponent<VerticalLayoutGroup>());
        public float minWidth=>-1;public float preferredWidth=>-1;public float flexibleWidth=>-1;
        public float minHeight=>Layout.preferredHeight;public float preferredHeight=>Layout.preferredHeight;public float flexibleHeight=>0;
        public int layoutPriority=>2;
        public void CalculateLayoutInputHorizontal(){}public void CalculateLayoutInputVertical(){}
    }
}
