using UnityEngine;using UnityEngine.UI;
namespace IdleIntelligence.Runtime {
 // Presentation tokens only. Economy and save data never depend on this class.
 public static class GameTheme {
  public static readonly Color Background=Hex("101724"),Surface=Hex("1D2A3B"),Raised=Hex("293B50"),Text=Hex("F0F6FF"),Muted=Hex("A4B7CD"),Accent=Hex("65E6CD"),Gold=Hex("FFC96B"),Enough=Hex("81F4AD"),Missing=Hex("FF929B");
  public static Font Body=>Resources.Load<Font>("Fonts/IdleBody")??Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");public static Font Bold=>Resources.Load<Font>("Fonts/IdleBold")??Body;public static Font Display=>Resources.Load<Font>("Fonts/IdleDisplay")??Bold;
  public static Color Hex(string value){ColorUtility.TryParseHtmlString("#"+value,out var c);return c;}
  static Sprite rounded;public static Sprite Rounded {get {if(rounded!=null)return rounded;rounded=Resources.Load<Sprite>("ThemeSurface");if(rounded!=null)return rounded;var texture=new Texture2D(32,32,TextureFormat.RGBA32,false);texture.name="UI rounded surface";texture.wrapMode=TextureWrapMode.Clamp;for(int y=0;y<32;y++)for(int x=0;x<32;x++){var point=new Vector2(Mathf.Max(8-x,Mathf.Max(x-23,0)),Mathf.Max(8-y,Mathf.Max(y-23,0)));texture.SetPixel(x,y,new Color(1,1,1,Mathf.Clamp01(8.5f-point.magnitude)));}texture.Apply();rounded=Sprite.Create(texture,new Rect(0,0,32,32),new Vector2(.5f,.5f),100,0,SpriteMeshType.FullRect,new Vector4(10,10,10,10));return rounded;}}
  public static void SurfaceOn(Image image,Color color){image.sprite=Rounded;image.type=Image.Type.Sliced;image.color=color;}
  public static void ButtonStyle(Button button,bool primary=false){var image=button.GetComponent<Image>();if(image!=null)SurfaceOn(image,primary?Accent:Raised);var colors=button.colors;colors.normalColor=Color.white;colors.highlightedColor=new Color(.85f,1,1);colors.pressedColor=new Color(.65f,.8f,.86f);colors.disabledColor=new Color(.65f,.7f,.8f,.7f);button.colors=colors;foreach(var text in button.GetComponentsInChildren<Text>(true)){text.font=Body;text.fontSize=14;text.color=primary?Background:Text;text.resizeTextForBestFit=true;text.resizeTextMinSize=12;text.resizeTextMaxSize=14;text.rectTransform.offsetMin=new Vector2(8,4);text.rectTransform.offsetMax=new Vector2(-8,-4);}}
 }
}
