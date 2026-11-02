using UnityEngine;
using UnityEngine.UI;
namespace IdleIntelligence.Runtime
{
    public sealed class ActionCard : MonoBehaviour
    {
        public Text Title,Detail;public Image Icon;public Button Button;
        void Awake(){PerformanceMarkers.UiNodes++;if(Button!=null&&GetComponent<PressMotion>()==null)gameObject.AddComponent<PressMotion>();}
    }
}
