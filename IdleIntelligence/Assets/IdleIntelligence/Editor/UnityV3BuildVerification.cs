#if UNITY_EDITOR
using System;
using System.IO;
using System.Linq;
using UnityEditor;
using UnityEditor.Build.Reporting;
using UnityEngine;
namespace IdleIntelligence.Editor
{
    /// <summary>
    /// Native V3 player build entry points. Player builds are created only by
    /// an explicitly invoked Editor menu/CLI action on a licensed Unity host.
    /// No automatic release or uploading to App Store Connect.
    /// </summary>
    public static class UnityV3BuildVerification
    {
        static string[] Scenes()
        {
            var paths=EditorBuildSettings.scenes.Where(s=>s.enabled)
                .Select(s=>s.path).ToArray();
            if(paths.Length==0)throw new InvalidOperationException("No enabled Unity scenes to build.");
            return paths;
        }
        static void Build(BuildTarget target,string path)
        {
            string[] scenes=Scenes();
            string full=Path.GetFullPath(path);
            Directory.CreateDirectory(Path.GetDirectoryName(full));
            var result=BuildPipeline.BuildPlayer(new BuildPlayerOptions{
                scenes=scenes,locationPathName=full,target=target,
                options=BuildOptions.None});
            if(result.summary.result!=BuildResult.Succeeded)
                throw new InvalidOperationException("Native Unity V3 "+target+
                    " build failed: "+result.summary.result);
            Debug.Log("Unity V3 native "+target+" build completed: "+full);
        }
        [MenuItem("Idle Intelligence/V3/Build iOS Player")]
        public static void BuildIos()
            =>Build(BuildTarget.iOS,"Builds/V3-iOS");
        [MenuItem("Idle Intelligence/V3/Build macOS Smoke Player")]
        public static void BuildMac()
            =>Build(BuildTarget.StandaloneOSX,"Builds/V3-Smoke.app");
    }
}
#endif
