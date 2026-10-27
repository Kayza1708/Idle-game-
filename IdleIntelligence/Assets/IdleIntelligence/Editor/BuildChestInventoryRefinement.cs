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
  static void At(RectTransform r,Vector2 point,Vector2 size){r.anchorMin=r.anchorMax=Vector2.one*.5f;r.pivot=Vector2.one*.5f;r.anchoredPosition=point;r.sizeDelta=size;}
  public static void Build(){CreateWorkshop.BuildComponentSprites();BuildRewardMotionV2.Build();BuildOverview();AssetDatabase.SaveAssets();}
  public static void ConfigureChest()
  {
   string path=Folder+"RewardStage.prefab";var root=PrefabUtility.LoadPrefabContents(path);
   try{
    var stage=root.GetComponent<RewardStage>();var rig=root.GetComponent<HingedChestRig>()??root.AddComponent<HingedChestRig>();stage.Chest=rig;
    rig.Assembly=(RectTransform)stage.Stage.Find("ChestAssembly");if(rig.Assembly==null)rig.Assembly=(RectTransform)WorkshopUIFactory.Node("ChestAssembly",stage.Stage).transform;At(rig.Assembly,Vector2.zero,Vector2.zero);rig.Assembly.SetSiblingIndex(0);rig.Body=stage.Body;rig.Lid=stage.Lid;rig.Lid.transform.SetParent(rig.Assembly,false);rig.Body.transform.SetParent(rig.Assembly,false);
    foreach(var effect in rig.Lid.GetComponents<BaseMeshEffect>())if(effect.GetType().Name=="HingedLidMesh")Object.DestroyImmediate(effect);
    var old=rig.Assembly.Find("ChestInterior");if(old!=null)Object.DestroyImmediate(old.gameObject);
    rig.Prepare(AssetDatabase.LoadAssetAtPath<PresentationArt>(Folder+"PresentationArt.asset"),0);PrefabUtility.SaveAsPrefabAsset(root,path);
   }finally{PrefabUtility.UnloadPrefabContents(root);}
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
