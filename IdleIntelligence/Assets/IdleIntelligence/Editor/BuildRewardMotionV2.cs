using System.IO;
using System.Collections.Generic;
using UnityEditor;
using UnityEngine;
using UnityEngine.UI;
using IdleIntelligence.Runtime;
namespace IdleIntelligence.Editor
{
 public static class BuildRewardMotionV2
 {
  const string Art="Assets/IdleIntelligence/Art/",Folder="Assets/IdleIntelligence/Resources/PixelUI/";
  static void Save(Object value,string path){var old=AssetDatabase.LoadMainAssetAtPath(path);if(old==null)AssetDatabase.CreateAsset(value,path);else{EditorUtility.CopySerialized(value,old);Object.DestroyImmediate(value);}}
  static Texture2D Texture(string path){AssetDatabase.ImportAsset(path,ImportAssetOptions.ForceSynchronousImport);var importer=(TextureImporter)AssetImporter.GetAtPath(path);importer.textureType=TextureImporterType.Default;importer.filterMode=FilterMode.Point;importer.mipmapEnabled=false;importer.textureCompression=TextureImporterCompression.Uncompressed;importer.maxTextureSize=2048;importer.SaveAndReimport();return AssetDatabase.LoadAssetAtPath<Texture2D>(path);}
  static Sprite Sprite(Texture2D texture,Rect rect,Vector2 pivot,string name){Save(UnityEngine.Sprite.Create(texture,rect,pivot,100,0,SpriteMeshType.FullRect),Folder+name+".asset");return AssetDatabase.LoadAssetAtPath<Sprite>(Folder+name+".asset");}
  public static void Build()
  {
   var art=AssetDatabase.LoadAssetAtPath<PresentationArt>(Folder+"PresentationArt.asset");var texture=Texture(Art+"chest-opening-v2.png");
   var readable=new Texture2D(2,2);readable.LoadImage(File.ReadAllBytes(Art+"chest-opening-v2.png"));var colors=readable.GetPixels32();int w=readable.width/6,h=readable.height/4;
   art.ChestOpening=new Sprite[24];
   for(int column=0;column<6;column++){
    int sx=column*w;var runs=new List<Vector2Int>();int start=-1;
    // The authored atlas has six columns, but open lids extend across the
    // nominal row boundaries. Slice the four real silhouettes, not a blind grid.
    for(int y=0;y<=readable.height;y++){
     int occupied=0;if(y<readable.height)for(int x=0;x<w;x++)if(colors[y*readable.width+sx+x].a>160)occupied++;
     if(occupied>4&&start<0)start=y;
     if(occupied<=4&&start>=0){if(y-start>100)runs.Add(new Vector2Int(start,y));start=-1;}
    }
    if(runs.Count!=4)throw new System.InvalidOperationException("Expected four separated chest silhouettes in column "+column);
    for(int row=0;row<4;row++){
     var run=runs[3-row];int sy=Mathf.Max(0,run.x-1),height=Mathf.Min(readable.height,run.y+1)-sy,minX=w,maxX=0;
     for(int y=run.x;y<Mathf.Min(run.y,run.x+72);y++)for(int x=0;x<w;x++)if(colors[y*readable.width+sx+x].a>160){minX=Mathf.Min(minX,x);maxX=Mathf.Max(maxX,x);}
     art.ChestOpening[row*6+column]=Sprite(texture,new Rect(sx,sy,w,height),new Vector2((minX+maxX)*.5f/w,(float)(run.x-sy)/height),"chest-opening-v2-"+row+"-"+column);
    }
   }
   Object.DestroyImmediate(readable);
   var machine=Texture(Art+"capsule-machine-empty-v2.png");art.MachineEmpty=Sprite(machine,new Rect(0,0,machine.width,machine.height),Vector2.one*.5f,"machine-empty-v2");
   var original=AssetDatabase.LoadAssetAtPath<Texture2D>("Assets/IdleIntelligence/Resources/MobileSprites.png");float cw=original.width*.25f,ch=original.height*.25f;
   art.CapsuleTop=Sprite(original,new Rect(cw*3,original.height-264,cw,264),Vector2.one*.5f,"capsule-top-v2");art.CapsuleBottom=Sprite(original,new Rect(cw*3,ch*2,cw,original.height*.5f-264),Vector2.one*.5f,"capsule-bottom-v2");EditorUtility.SetDirty(art);
   BuildChestInventoryRefinement.ConfigureChest();Bubble();AssetDatabase.SaveAssets();Debug.Log("REWARD_MOTION_V2_READY 24 registered chest poses, empty cabinet, independent capsule halves, compact Mira bubble");
  }
  static void Anchor(RectTransform r,Vector2 min,Vector2 max,Vector2 from,Vector2 to){r.anchorMin=min;r.anchorMax=max;r.offsetMin=from;r.offsetMax=to;}
  static void Bubble()
  {
   const string path=Folder+"MiraCoach.prefab";var root=PrefabUtility.LoadPrefabContents(path);
   try{
    var coach=root.GetComponent<MiraCoach>();var bubble=(RectTransform)root.transform.Find("SpeechBubble");Object.DestroyImmediate(bubble.GetComponent<VerticalLayoutGroup>());Anchor(bubble,Vector2.zero,Vector2.one,Vector2.zero,Vector2.zero);
    // One speech surface contains the portrait, copy and its bottom action row.
    coach.Portrait.transform.SetParent(bubble,false);Anchor(coach.Portrait.rectTransform,new Vector2(0,1),new Vector2(0,1),new Vector2(8,-112),new Vector2(76,-8));
    Anchor(coach.Speaker.rectTransform,new Vector2(0,1),Vector2.one,new Vector2(84,-30),new Vector2(-10,-8));
    Anchor(coach.Speech.rectTransform,Vector2.zero,Vector2.one,new Vector2(84,58),new Vector2(-10,-32));coach.Speech.fontSize=15;coach.Speech.raycastTarget=false;
    var actions=(RectTransform)bubble.Find("StoryActions");Anchor(actions,new Vector2(0,0),new Vector2(1,0),new Vector2(8,8),new Vector2(-8,52));
    Anchor((RectTransform)coach.Name.transform,new Vector2(0,0),new Vector2(1,0),new Vector2(84,58),new Vector2(-10,102));
    Anchor(coach.Error.rectTransform,new Vector2(0,0),new Vector2(1,0),new Vector2(84,104),new Vector2(-10,120));
    foreach(var button in new[]{coach.Next,coach.Skip,coach.Target,coach.Confirm}){var size=button.GetComponent<LayoutElement>();size.minWidth=0;size.preferredWidth=0;size.flexibleWidth=1;}
    coach.Skip.transform.SetAsFirstSibling();PrefabUtility.SaveAsPrefabAsset(root,path);
   }finally{PrefabUtility.UnloadPrefabContents(root);}
  }
 }
}
