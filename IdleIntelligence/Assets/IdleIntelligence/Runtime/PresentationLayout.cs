using UnityEngine;
using UnityEngine.UI;
namespace IdleIntelligence.Runtime
{
    public static class PresentationLayout
    {
        public static Transform Grid(string name,Transform parent,int columns,int count,float height=44)
        {
            var node=WorkshopUIFactory.Node(name,parent,typeof(GridLayoutGroup));
            var grid=node.GetComponent<GridLayoutGroup>();grid.constraint=GridLayoutGroup.Constraint.FixedColumnCount;grid.constraintCount=columns;grid.spacing=new Vector2(4,4);
            WorkshopUIFactory.Size(node,Mathf.CeilToInt(count/(float)columns)*(height+4)-4);
            node.AddComponent<ItemGrid>().Height=height;
            return node.transform;
        }
    }
}
