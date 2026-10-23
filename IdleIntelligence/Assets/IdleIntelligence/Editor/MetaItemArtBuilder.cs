using System.IO;
using System.Linq;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using UnityEngine;
using UnityEditor;
using IdleIntelligence.Runtime;
using IdleIntelligence.Core;
namespace IdleIntelligence.Editor {
 public static class MetaItemArtBuilder {
  const string Root="Assets/IdleIntelligence/";
  static Dictionary<string,Vector2Int> Cells(){var source=File.ReadAllText(Path.GetFullPath("../src/GameArt.tsx"));var table=Regex.Match(source,@"metaItemCells[^=]*=\{([^}]+)\}");return Regex.Matches(table.Groups[1].Value,"\"([^\"]+)\":\\[(\\d+),(\\d+)\\]").Cast<Match>().ToDictionary(m=>m.Groups[1].Value,m=>new Vector2Int(int.Parse(m.Groups[2].Value),int.Parse(m.Groups[3].Value)));}
  public static bool IsMeta(string id)=>Cells().ContainsKey(id);
  public static Sprite SpriteFor(string id)=>AssetDatabase.LoadAssetAtPath<Sprite>(Root+"Art/item-"+id+".asset");
  static void Save(Object value,string path){var old=AssetDatabase.LoadMainAssetAtPath(path);if(old==null)AssetDatabase.CreateAsset(value,path);else{EditorUtility.CopySerialized(value,old);Object.DestroyImmediate(value);}}
  public static void Build(){
   string path=Root+"Art/meta-items-v1.png";AssetDatabase.ImportAsset(path,ImportAssetOptions.ForceSynchronousImport);var importer=(TextureImporter)AssetImporter.GetAtPath(path);importer.textureType=TextureImporterType.Default;importer.filterMode=FilterMode.Point;importer.mipmapEnabled=false;importer.textureCompression=TextureImporterCompression.Uncompressed;importer.SaveAndReimport();var texture=AssetDatabase.LoadAssetAtPath<Texture2D>(path);
   foreach(var pair in Cells()){var cell=pair.Value;Save(Sprite.Create(texture,new Rect(cell.x*texture.width/3,(1-cell.y)*texture.height/2,texture.width/3,texture.height/2),Vector2.one*.5f,100,0,SpriteMeshType.FullRect),Root+"Art/item-"+pair.Key+".asset");}
   var root=PrefabUtility.LoadPrefabContents(Root+"Prefabs/WorkshopScreen.prefab");var view=root.GetComponent<WorkshopUI>();view.ItemSprites=ItemBalance.Items.Select(d=>SpriteFor(d.Id)).ToArray();if(view.ItemSprites.Any(s=>s==null))throw new System.InvalidOperationException("Item art missing; do not substitute another item's graphic.");PrefabUtility.SaveAsPrefabAsset(root,Root+"Prefabs/WorkshopScreen.prefab");PrefabUtility.UnloadPrefabContents(root);
   var old=AssetDatabase.LoadAssetAtPath<ItemArtMetrics>(Root+"Resources/PixelUI/ItemArtMetrics.asset");var metrics=ScriptableObject.CreateInstance<ItemArtMetrics>();// Use persistent sprites after unloading prefab contents.
   metrics.Sprites=ItemBalance.Items.Select(d=>SpriteFor(d.Id)).ToArray();metrics.AlphaRects=new Rect[metrics.Sprites.Length];var pixels=new Texture2D(2,2);pixels.LoadImage(File.ReadAllBytes(path));
   for(int i=0;i<metrics.Sprites.Length;i++){var sprite=metrics.Sprites[i];if(!Cells().ContainsKey(ItemBalance.Items[i].Id)){metrics.AlphaRects[i]=old.For(sprite);continue;}var rect=sprite.rect;int left=(int)rect.width,right=-1,bottom=(int)rect.height,top=-1;for(int y=0;y<(int)rect.height;y++)for(int x=0;x<(int)rect.width;x++)if(pixels.GetPixel((int)rect.x+x,(int)rect.y+y).a>.1f){left=System.Math.Min(left,x);right=System.Math.Max(right,x);bottom=System.Math.Min(bottom,y);top=System.Math.Max(top,y);}metrics.AlphaRects[i]=new Rect((float)left/rect.width,(float)bottom/rect.height,(right-left+1)/rect.width,(top-bottom+1)/rect.height);}
   Object.DestroyImmediate(pixels);Save(metrics,Root+"Resources/PixelUI/ItemArtMetrics.asset");AssetDatabase.SaveAssets();Debug.Log("META_ITEM_ART_READY six distinct original sprites; old sprite GUIDs and visible bounds preserved");
  }
 }
}
