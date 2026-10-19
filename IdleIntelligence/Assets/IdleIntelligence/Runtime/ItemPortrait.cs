using IdleIntelligence.Core;
using UnityEngine;
using UnityEngine.UI;
namespace IdleIntelligence.Runtime
{
    public sealed class ItemPortrait:MonoBehaviour
    {
        public Image Art;public ShapeFrame Frame;public Text Caption;public Button Button;
        public static Sprite[] Sprites;public ItemInstance Item {get;private set;}
        public static Color RarityColor(int rarity){ColorUtility.TryParseHtmlString(ItemBalance.RarityColors[Mathf.Clamp(rarity,0,5)],out var c);return c;}
        public void Bind(ItemInstance item,string family=null,string empty="")
        {
            Item=item?.Copy();string shape=family??(item!=null?Workshop.Definition(item).Family:"research");Frame.Shape=shape;Frame.color=item!=null?RarityColor(item.rarity):new Color(.3f,.45f,.52f);Frame.SetVerticesDirty();
            Art.gameObject.SetActive(item!=null);Caption.text=item==null?empty:"Lv. "+item.level+(item.locked?" · ◆":"");
            if(item!=null){Art.sprite=Sprites[Workshop.Index(item.type)];Art.preserveAspect=true;Art.useSpriteMesh=true;}
            var r=Art.rectTransform;r.anchorMin=r.anchorMax=new Vector2(.5f,shape=="core"?.40f:.52f);r.pivot=new Vector2(.5f,.5f);float size=((RectTransform)transform).rect.width*(shape=="core"?.49f:.66f);r.sizeDelta=new Vector2(size,size);r.anchoredPosition=Vector2.zero;
        }
    }
}
