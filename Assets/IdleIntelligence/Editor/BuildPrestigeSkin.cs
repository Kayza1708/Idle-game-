using UnityEditor;
using UnityEngine;
using IdleIntelligence.Runtime;
namespace IdleIntelligence.Editor
{
 public static class BuildPrestigeSkin
 {
  public static void Build()
  {
   string path="Assets/IdleIntelligence/Prefabs/PrestigeNode.prefab";var root=PrefabUtility.LoadPrefabContents(path);
   try{PrestigeNetworkSkin.Node(root.GetComponent<PrestigeNodeView>());foreach(var outline in root.GetComponents<UnityEngine.UI.Outline>())Object.DestroyImmediate(outline);PrefabUtility.SaveAsPrefabAsset(root,path);}finally{PrefabUtility.UnloadPrefabContents(root);}
   path="Assets/IdleIntelligence/Prefabs/PrestigeNetwork.prefab";root=PrefabUtility.LoadPrefabContents(path);
   try{PrestigeNetworkSkin.Apply(root.GetComponent<PrestigeNetworkView>());PrefabUtility.SaveAsPrefabAsset(root,path);}finally{PrefabUtility.UnloadPrefabContents(root);}
   AssetDatabase.SaveAssets();Debug.Log("PRESTIGE_SKIN_READY shared steel, fonts, gold action, quiet utility bars and framed core");
  }
 }
}
