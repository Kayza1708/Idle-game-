using UnityEngine;
using UnityEngine.UI;
namespace IdleIntelligence.Runtime {
    public sealed class ItemGrid:MonoBehaviour
    {
        void OnEnable()=>Resize();void OnRectTransformDimensionsChange()=>Resize();void Resize(){var g=GetComponent<GridLayoutGroup>();if(g!=null)g.cellSize=new Vector2(Mathf.Max(1,(((RectTransform)transform).rect.width-12)/g.constraintCount),130);}
    }
}
