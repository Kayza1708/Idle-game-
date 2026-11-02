using UnityEngine;
using UnityEngine.UI;
namespace IdleIntelligence.Runtime
{
    // Shared styling for the remaining legacy information views. Existing controls/actions stay intact.
    public sealed class CompactView : MonoBehaviour
    {
        long generation=-1;
        public static void Attach(GameObject view){if(view.GetComponent<CompactView>()==null)view.AddComponent<CompactView>();}
        void LateUpdate()
        {
            if(generation==PerformanceMarkers.UiNodes)return;
            generation=PerformanceMarkers.UiNodes;
            foreach(var label in GetComponentsInChildren<Text>(true))
                if(label.GetComponent<LayoutElement>()!=null&&label.transform.parent.GetComponent<VerticalLayoutGroup>()!=null)AdaptiveTextHeight.Attach(label);
            foreach(var card in GetComponentsInChildren<ActionCard>(true))
                if(card.GetComponent<CompactActionCard>()==null)card.gameObject.AddComponent<CompactActionCard>();
        }
    }
}
