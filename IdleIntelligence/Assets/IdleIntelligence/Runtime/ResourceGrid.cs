using UnityEngine;
using UnityEngine.UI;
namespace IdleIntelligence.Runtime
{
    [RequireComponent(typeof(GridLayoutGroup))]
    public sealed class ResourceGrid:MonoBehaviour
    {
        void OnRectTransformDimensionsChange(){var grid=GetComponent<GridLayoutGroup>();if(grid!=null)grid.cellSize=new Vector2(Mathf.Max(1,(((RectTransform)transform).rect.width-grid.padding.horizontal-grid.spacing.x)/2),32);}
        void OnEnable()=>OnRectTransformDimensionsChange();
    }
}
