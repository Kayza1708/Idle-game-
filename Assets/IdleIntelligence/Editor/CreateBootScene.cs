using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using IdleIntelligence.Runtime;
namespace IdleIntelligence.Editor
{
    public static class CreateBootScene
    {
        public static readonly string[] PlayerScenes = { "Assets/Scenes/Boot.unity", "Assets/Scenes/IdleIntelligence.unity" };
        public static void Build()
        {
            var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
            new GameObject("GameBoot", typeof(GameBoot));
            EditorSceneManager.SaveScene(scene, PlayerScenes[0]);
            EditorBuildSettings.scenes = new[] { new EditorBuildSettingsScene(PlayerScenes[0], true), new EditorBuildSettingsScene(PlayerScenes[1], true) };
            AssetDatabase.SaveAssets();
        }
    }
}
