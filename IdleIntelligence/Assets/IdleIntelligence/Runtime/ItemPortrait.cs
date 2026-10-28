using IdleIntelligence.Core;
using UnityEngine;
using UnityEngine.UI;
namespace IdleIntelligence.Runtime
{
    public sealed class ItemPortrait:MonoBehaviour
    {
  void Awake(){PerformanceMarkers.UiNodes++;}

        public bool ShowLevel=true;public Image Art;public ShapeFrame Frame;public Text Caption;public Button Button;
        void OnRectTransformDimensionsChange(){if(Art!=null&&Frame!=null&&Caption!=null)LayoutPortrait();}
        public static string SlotName(string slot,string language){string name=slot.StartsWith("processor")?"Prozessorsockel":slot.StartsWith("core")?"Kernsockel":slot.StartsWith("research")?"Forschungssockel":"Universalsockel";return UiLocalizedText.Translate(name,language)+(slot.EndsWith("Aux")||slot=="universal2"?" II":slot=="universal1"?" I":"");}
        public static Sprite[] Sprites;static ItemArtMetrics metrics;public ItemInstance Item {get;private set;}
        public static Color RarityColor(int rarity){ColorUtility.TryParseHtmlString(ItemBalance.RarityColors[Mathf.Clamp(rarity,0,5)],out var c);return c;}
        public void Bind(ItemInstance item,string family=null,string empty="")
        {
            Item=item?.Copy();string shape=item!=null?Workshop.Definition(item).Family:(family??"research");Frame.Shape=shape;Frame.color=item!=null?RarityColor(item.rarity):new Color(.3f,.45f,.52f);Frame.SetVerticesDirty();
            Art.gameObject.SetActive(item!=null);Caption.text=ShowLevel?(item==null?empty:"Lv. "+item.level+(item.locked?" · ◆":"")):"";
            if(item!=null){Art.sprite=Sprites[Workshop.Index(item.type)];Art.preserveAspect=true;Art.useSpriteMesh=true;}
            if(item==null){Art.rectTransform.anchorMin=Art.rectTransform.anchorMax=new Vector2(.5f,ShowLevel ? .585f : .5f);Art.rectTransform.pivot=new Vector2(.5f,.5f);Art.rectTransform.anchoredPosition=Vector2.zero;}LayoutPortrait();
        }
        // Layout can run during RectMask2D culling: never activate/deactivate or rebind graphics here.
        void LayoutPortrait(){string shape=Frame.Shape;
            Frame.rectTransform.anchorMin=new Vector2(0,ShowLevel ? .17f : 0);Frame.rectTransform.anchorMax=Vector2.one;Frame.rectTransform.offsetMin=Frame.rectTransform.offsetMax=Vector2.zero;if(Item==null)return;var item=Item;var r=Art.rectTransform;r.anchorMin=r.anchorMax=new Vector2(.5f,ShowLevel ? .585f : .5f);r.pivot=new Vector2(.5f,.5f);float socket=Mathf.Round(Mathf.Min(((RectTransform)transform).rect.width,((RectTransform)transform).rect.height*(ShowLevel ? .83f : 1)));float footprint=socket*(shape=="core"?.50f:.72f);if(metrics==null)metrics=Resources.Load<ItemArtMetrics>("PixelUI/ItemArtMetrics");var visible=metrics!=null?metrics.For(Art.sprite):new Rect(0,0,1,1);var pixels=Art.sprite.rect.size;float factor=footprint/Mathf.Max(visible.width*pixels.x,visible.height*pixels.y);r.sizeDelta=pixels*factor;r.anchoredPosition=-Vector2.Scale(visible.center-new Vector2(.5f,.5f),r.sizeDelta);


        }
    }
}
