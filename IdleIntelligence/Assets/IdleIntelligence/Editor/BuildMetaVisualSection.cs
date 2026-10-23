using UnityEditor;
namespace IdleIntelligence.Editor {
 public static class BuildMetaVisualSection {
  public static void Build(){ProgressionArtBuilder.Build();MetaItemArtBuilder.Build();AssetDatabase.SaveAssets();}
 }
}
