using System.IO;
using IdleIntelligence.Runtime;
using UnityEditor;
using UnityEngine;
using UnityEngine.UI;

namespace IdleIntelligence.Editor
{
 public static class BuildChestInventoryRefinement
 {
  const string Folder="Assets/IdleIntelligence/Resources/PixelUI/";
  static void Save(Object value,string path){var old=AssetDatabase.LoadMainAssetAtPath(path);if(old==null)AssetDatabase.CreateAsset(value,path);else{EditorUtility.CopySerialized(value,old);Object.DestroyImmediate(value);}}
  static Sprite InnerLid(Color32[] original,int tier,int width,int height)
  {
   const int w=627,h=337;var pixels=new Color32[w*h];int sx=tier%2*627,sy=(tier<2?627:0)+290;var accent=tier==0?GameTheme.Accent:tier==1?GameTheme.Hex("22B5FF"):tier==2?GameTheme.Hex("D55AFF"):GameTheme.Gold;
   bool Solid(int x,int y)=>x>=0&&y>=0&&x<w&&y<h&&original[(sy+y)*width+sx+x].a>100;
   for(int y=0;y<h;y++)for(int x=0;x<w;x++)
   {
    var source=original[(sy+y)*width+sx+x];if(source.a<10)continue;
    bool edge=!Solid(x-9,y)||!Solid(x+9,y)||!Solid(x,y-9)||!Solid(x,y+9);
    Color tint=edge?(Color)source:GameTheme.Hex((x/48)%2==0?"172E3B":"1D3745");
    if(!edge&&((x>56&&x<570&&(y==58||y==59))||(x>56&&x<570&&(y==238||y==239))))tint=accent*.72f;
    if(!edge&&x%72<3)tint=GameTheme.Hex("0B1924");tint.a=source.a/255f;pixels[y*w+x]=tint;
   }
   var texture=new Texture2D(w,h,TextureFormat.RGBA32,false);texture.SetPixels32(pixels);texture.Apply();string path=Folder+"chest-inner-"+tier+".png";File.WriteAllBytes(path,texture.EncodeToPNG());Object.DestroyImmediate(texture);AssetDatabase.ImportAsset(path,ImportAssetOptions.ForceSynchronousImport);
   var importer=(TextureImporter)AssetImporter.GetAtPath(path);importer.textureType=TextureImporterType.Default;importer.filterMode=FilterMode.Point;importer.mipmapEnabled=false;importer.textureCompression=TextureImporterCompression.Uncompressed;importer.SaveAndReimport();
   Save(Sprite.Create(AssetDatabase.LoadAssetAtPath<Texture2D>(path),new Rect(0,0,w,h),Vector2.one*.5f,100,0,SpriteMeshType.FullRect),Folder+"chest-inner-"+tier+".asset");return AssetDatabase.LoadAssetAtPath<Sprite>(Folder+"chest-inner-"+tier+".asset");
  }
  static void At(RectTransform r,Vector2 point,Vector2 size){r.anchorMin=r.anchorMax=Vector2.one*.5f;r.pivot=Vector2.one*.5f;r.anchoredPosition=point;r.sizeDelta=size;}
  public static void Build()
  {
   CreateWorkshop.BuildComponentSprites();var source=new Texture2D(2,2);source.LoadImage(File.ReadAllBytes("Assets/IdleIntelligence/Resources/ShopChests.png"));var art=AssetDatabase.LoadAssetAtPath<PresentationArt>(Folder+"PresentationArt.asset");art.ChestInner=new Sprite[4];var pixels=source.GetPixels32();for(int i=0;i<4;i++)art.ChestInner[i]=InnerLid(pixels,i,source.width,source.height);Object.DestroyImmediate(source);EditorUtility.SetDirty(art);
   string path=Folder+"RewardStage.prefab";var root=PrefabUtility.LoadPrefabContents(path);
   try
   {
    var stage=root.GetComponent<RewardStage>();var rig=root.GetComponent<HingedChestRig>()??root.AddComponent<HingedChestRig>();stage.Chest=rig;
    rig.Assembly=(RectTransform)stage.Stage.Find("ChestAssembly");if(rig.Assembly==null)rig.Assembly=(RectTransform)WorkshopUIFactory.Node("ChestAssembly",stage.Stage).transform;At(rig.Assembly,Vector2.zero,Vector2.zero);rig.Assembly.SetSiblingIndex(0);rig.Body=stage.Body;rig.Lid=stage.Lid;rig.Lid.transform.SetParent(rig.Assembly,false);rig.Body.transform.SetParent(rig.Assembly,false);
    rig.Hinge=rig.Lid.GetComponent<HingedLidMesh>()??rig.Lid.gameObject.AddComponent<HingedLidMesh>();rig.Well=rig.Assembly.GetComponentInChildren<ChestWellGraphic>(true);if(rig.Well==null)rig.Well=WorkshopUIFactory.Node("ChestInterior",rig.Assembly,typeof(ChestWellGraphic)).GetComponent<ChestWellGraphic>();At(rig.Well.rectTransform,Vector2.zero,new Vector2(256,180));rig.Well.raycastTarget=false;rig.Well.transform.SetSiblingIndex(1);rig.Prepare(art,0);PrefabUtility.SaveAsPrefabAsset(root,path);
   }
   finally{PrefabUtility.UnloadPrefabContents(root);}
   BuildOverview();AssetDatabase.SaveAssets();Debug.Log("CHEST_GRID_READY fixed hinge, four derived inner lids, cavity, persistent component overview");
  }
  static void BuildOverview()
  {
   var tile=WorkshopUIFactory.Node("ComponentTile",null,typeof(Image),typeof(Button));tile.GetComponent<Image>().color=new Color(.15f,.35f,.43f,.08f);
   var icon=WorkshopUIFactory.Node("Art",tile.transform,typeof(Image)).GetComponent<Image>();icon.preserveAspect=true;icon.raycastTarget=false;At(icon.rectTransform,new Vector2(0,9),Vector2.one*30);
   var amount=WorkshopUIFactory.Label("Amount",tile.transform,"0",13,18);Object.DestroyImmediate(amount.GetComponent<LayoutElement>());At(amount.rectTransform,new Vector2(0,-18),new Vector2(68,18));amount.alignment=TextAnchor.MiddleCenter;amount.resizeTextForBestFit=true;amount.resizeTextMinSize=11;amount.resizeTextMaxSize=13;
   var tileAsset=PrefabUtility.SaveAsPrefabAsset(tile,Folder+"ComponentTile.prefab");Object.DestroyImmediate(tile);
   var root=WorkshopUIFactory.Vertical("ComponentOverview",null);var layout=root.GetComponent<VerticalLayoutGroup>();layout.spacing=3;layout.padding=new RectOffset(4,4,4,6);var overview=root.AddComponent<ComponentOverview>();overview.Title=WorkshopUIFactory.Label("ComponentHeading",root.transform,"Komponenten",15,24);overview.Title.font=GameTheme.Bold;overview.Fragments=WorkshopUIFactory.Label("BlueprintFragments",root.transform,"",12,20);overview.Fragments.color=GameTheme.Muted;
   var grid=WorkshopUIFactory.Node("AllComponents",root.transform,typeof(GridLayoutGroup),typeof(ItemGrid));WorkshopUIFactory.Size(grid,228);overview.Grid=grid.GetComponent<GridLayoutGroup>();overview.Grid.constraint=GridLayoutGroup.Constraint.FixedColumnCount;overview.Grid.constraintCount=5;overview.Grid.spacing=new Vector2(4,4);overview.Grid.cellSize=new Vector2(68,54);grid.GetComponent<ItemGrid>().Height=54;overview.TilePrefab=tileAsset.GetComponent<Button>();PrefabUtility.SaveAsPrefabAsset(root,Folder+"ComponentOverview.prefab");Object.DestroyImmediate(root);
  }
 }
}
