using System.IO;
using System.Linq;
using UnityEditor;
using UnityEngine;
using IdleIntelligence.Core;
using IdleIntelligence.Runtime;
namespace IdleIntelligence.Editor {
 public static class ProgressionArtBuilder {
  const string Art="Assets/IdleIntelligence/Art/",Fx="Assets/IdleIntelligence/Resources/PixelUI/";
  // Semantic category motifs from the project's dedicated progression atlas. Never item IDs.
  static readonly int[][] IntMap={new[]{8,8,8,8,8,14,10,12,14,15},new[]{13,13,9,13,9,8,12,2,14,3},new[]{11,2,8,11,8,9,2,11,13,15},new[]{14,13,5,7,6,11,7,8,6,3},new[]{0,6,6,4,6,6,9,1,4,15},new[]{12,1,13,2,12,8,9,5,3,15}};
  static readonly int[] AxiomMap={6,12,14,6,14,13,8,1,6,8,9,8,10,5,7,6,8,7,5,13,13,8,14,15};
  static void Save(Object value,string path){var old=AssetDatabase.LoadMainAssetAtPath(path);if(old==null)AssetDatabase.CreateAsset(value,path);else{EditorUtility.CopySerialized(value,old);Object.DestroyImmediate(value);}}
  static Texture2D Import(string file){var path=Art+file;AssetDatabase.ImportAsset(path,ImportAssetOptions.ForceSynchronousImport);var importer=(TextureImporter)AssetImporter.GetAtPath(path);importer.textureType=TextureImporterType.Default;importer.filterMode=FilterMode.Point;importer.mipmapEnabled=false;importer.textureCompression=TextureImporterCompression.Uncompressed;importer.SaveAndReimport();return AssetDatabase.LoadAssetAtPath<Texture2D>(path);}
  public static Sprite Symbol(int index)=>AssetDatabase.LoadAssetAtPath<Sprite>(Fx+"progression-symbol-"+index+".asset");
  public static Sprite[] IntSprites()=>PrestigeBalance.Nodes.Select(n=>Symbol(IntMap[n.Branch][n.Depth-1])).ToArray();
  public static Sprite[] AxiomSprites()=>AxiomMap.Select(Symbol).ToArray();
  public static void Build(){
   var texture=Import("progression-symbols.png");for(int i=0;i<16;i++)Save(Sprite.Create(texture,new Rect(i%4*texture.width/4,(3-i/4)*texture.height/4,texture.width/4,texture.height/4),Vector2.one*.5f,100,0,SpriteMeshType.FullRect),Fx+"progression-symbol-"+i+".asset");
   var mira=Import("mira-expressions-v1.png");var frames=ScriptableObject.CreateInstance<MiraPortraitFrames>();frames.Frames=new Sprite[6];for(int i=0;i<6;i++){int x=i%3*mira.width/3,y=(1-i/3)*mira.height/2;var rect=new Rect(x+mira.width/3*.07f,y+mira.height/2*.57f,mira.width/3*.86f,mira.height/2*.40f);string path=Fx+"mira-expression-"+i+".asset";Save(Sprite.Create(mira,rect,Vector2.one*.5f,100,0,SpriteMeshType.FullRect),path);frames.Frames[i]=AssetDatabase.LoadAssetAtPath<Sprite>(path);}Save(frames,Fx+"MiraPortraitFrames.asset");
   string prefab="Assets/IdleIntelligence/Prefabs/PrestigeNetwork.prefab";var root=PrefabUtility.LoadPrefabContents(prefab);var view=root.GetComponent<PrestigeNetworkView>();view.NodeSprites=IntSprites();view.AxiomSprites=AxiomSprites();var core=root.transform.Find("NetworkViewport/NetworkWorld/INTCore/INTCoreArt");if(core!=null)core.GetComponent<UnityEngine.UI.Image>().sprite=Symbol(1);view.Pulse.GetComponentsInChildren<UnityEngine.UI.Image>(true).First(i=>i.name=="PulseCore").sprite=Symbol(1);PrefabUtility.SaveAsPrefabAsset(root,prefab);PrefabUtility.UnloadPrefabContents(root);AssetDatabase.SaveAssets();Debug.Log("PROGRESSION_ART_READY dedicated 60 INT /24 Axiom node assignments and six Mira expressions");
  }
 }
}
