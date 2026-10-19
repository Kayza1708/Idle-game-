using IdleIntelligence.Runtime;using UnityEditor;using UnityEngine;
namespace IdleIntelligence.Editor {
 public static class CreateMetaLab {
  static Sprite Sprite(string path){var importer=(TextureImporter)AssetImporter.GetAtPath(path);importer.textureType=TextureImporterType.Sprite;importer.spriteImportMode=SpriteImportMode.Single;importer.alphaIsTransparency=true;importer.SaveAndReimport();return AssetDatabase.LoadAssetAtPath<Sprite>(path);}
  public static MetaLabView Build(){var root=WorkshopUIFactory.Vertical("SecretLab",null);var view=root.AddComponent<MetaLabView>();view.Mira=Sprite("Assets/IdleIntelligence/Art/mira-voss.png");view.ModelArt=Sprite("Assets/IdleIntelligence/Art/model-core.png");string path="Assets/IdleIntelligence/Prefabs/SecretLab.prefab";PrefabUtility.SaveAsPrefabAsset(root,path);Object.DestroyImmediate(root);return AssetDatabase.LoadAssetAtPath<MetaLabView>(path);}
 }
}
