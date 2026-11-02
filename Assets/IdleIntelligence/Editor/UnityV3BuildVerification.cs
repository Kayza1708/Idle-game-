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
            // Persist explicit player-build evidence for the batchmode smoke gate.
            // This file is written only after Unity reports a successful build.
            File.WriteAllText(full+".report.txt", "Succeeded\n"+
                "Target: "+target+"\n"+
                "Size: "+result.summary.totalSize+"\n"+
                "Duration: "+result.summary.totalTime+"\n");
            Debug.Log("Unity V3 native "+target+" build completed: "+full);
        }
        /// <summary>
        /// Explicit fresh editor playtest. Archive (do not delete) every V3 save
        /// candidate in the current Unity Editor persistent directory.
        /// No old V1, Capacitor or other game's save is touched.
        /// </summary>
        [MenuItem("Idle Intelligence/V3/Archive Editor V3 Save For Fresh Playtest")]
        public static void ArchiveEditorV3Save()
        {
            if(EditorApplication.isPlayingOrWillChangePlaymode)
            {
                EditorUtility.DisplayDialog("Idle Intelligence",
                    "Stop Play Mode before archiving the editor's V3 save.", "OK");
                return;
            }
            string root=Application.persistentDataPath;
            string prefix="idle-intelligence-unity-v3.json";
            if(!Directory.Exists(root))return;
            string[] files=Directory.GetFiles(root,prefix+"*",SearchOption.TopDirectoryOnly);
            if(files.Length==0)
            {
                Debug.Log("No editor V3 save exists. The next Play run starts a fresh V3 campaign.");
                return;
            }
            if(!EditorUtility.DisplayDialog("Start fresh V3 playtest?",
                "This archives "+files.Length+" V3 save file(s) into a separate folder. "+
                "The next Play run starts a fresh campaign. No saves are deleted.\n\n"+
                root,"Archive V3 saves","Cancel"))return;
            string archive=Path.Combine(root,"V3EditorSaveArchive",
                DateTime.UtcNow.ToString("yyyyMMdd-HHmmss")+"-"+Guid.NewGuid().ToString("N"));
            Directory.CreateDirectory(archive);
            foreach(string file in files)
                File.Move(file,Path.Combine(archive,Path.GetFileName(file)));
            Debug.Log("V3 editor save files safely archived: "+archive);
        }
        [MenuItem("Idle Intelligence/V3/Build iOS Player")]
        public static void BuildIos()
            =>Build(BuildTarget.iOS,"Builds/V3-iOS");
        [MenuItem("Idle Intelligence/V3/Build macOS Smoke Player")]
        public static void BuildMac()
        {
            string output=Environment.GetEnvironmentVariable("IDLE_PLAYER_OUTPUT");
            Build(BuildTarget.StandaloneOSX,
                string.IsNullOrWhiteSpace(output)?"Builds/V3-Smoke.app":output);
        }
    }
}
#endif
