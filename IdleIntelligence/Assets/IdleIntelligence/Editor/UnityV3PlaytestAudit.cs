#if UNITY_EDITOR
using System;
using System.Linq;
using System.Collections.Generic;
using System.IO;
using UnityEditor;
using UnityEditor.PackageManager;
using UnityEngine;
using UnityEngine.UI;
using IdleIntelligence.Runtime;
using IdleIntelligence.Core;

namespace IdleIntelligence.Editor
{
    /// <summary>
    /// One-command readiness inspection in the real Unity Editor. Does not
    /// change assets, fake an SDK install or claim a successful device build.
    /// </summary>
    public static class UnityV3PlaytestAudit
    {
        [MenuItem("Idle Intelligence/V3/Check Playtest Readiness")]
        public static void Run()
        {
            var issues=new List<string>();
            var info=new List<string>();
            var installed=PackageInfo.GetAllRegisteredPackages()
                .FirstOrDefault(p=>p.name=="com.unity.services.levelplay");
            if(installed==null)
                issues.Add("LevelPlay not resolved. Open Package Manager and resolve Ads Mediation.");
            else info.Add("LevelPlay package: "+installed.version);

            var config=Resources.Load<NativeAdConfiguration>("NativeAdConfiguration");
            if(config==null)issues.Add("NativeAdConfiguration asset missing from Resources.");
            else
            {
                info.Add("iOS rewarded configuration: "+
                    (!string.IsNullOrEmpty(config.iOSAppKey)&&!string.IsNullOrEmpty(config.iOSRewardedAdUnit)));
                info.Add("Android rewarded configuration: "+
                    (!string.IsNullOrEmpty(config.androidAppKey)&&!string.IsNullOrEmpty(config.androidRewardedAdUnit)));
                if(string.IsNullOrWhiteSpace(config.privacyPolicyUrl))
                    issues.Add("Public privacy policy URL missing (required before store publishing).");
                if(!config.certifiedCmpReadyForProduction)
                    issues.Add("Certified ad-consent/CMP production gate is OFF (safe for QA).");
            }
            var scenes=EditorBuildSettings.scenes.Where(s=>s.enabled).ToArray();
            if(scenes.Length==0)issues.Add("No enabled player scene.");
            else info.Add("Enabled Unity scenes: "+scenes.Length);

            int buttons=0,texts=0,prefabs=0,missingTargets=0,missingFonts=0;
            foreach(string guid in AssetDatabase.FindAssets("t:Prefab",
                        new[]{"Assets/IdleIntelligence/Resources/PixelUI"}))
            {
                string path=AssetDatabase.GUIDToAssetPath(guid);
                var prefab=AssetDatabase.LoadAssetAtPath<GameObject>(path);
                if(prefab==null)continue;
                prefabs++;
                foreach(var label in prefab.GetComponentsInChildren<Text>(true))
                {
                    texts++;
                    if(label.font==null){missingFonts++;issues.Add(path+" has a text label without a font");}
                }
                foreach(var button in prefab.GetComponentsInChildren<Button>(true))
                {
                    buttons++;
                    if(button.targetGraphic==null){
                        missingTargets++;
                        issues.Add(path+" has a Button without target Graphic");
                    }
                }
            }
            info.Add("PixelUI prefabs="+prefabs+" labels="+texts+
                " buttons="+buttons+" targetGraphic gaps="+missingTargets+
                " missing fonts="+missingFonts);
            var v3Items=UnityV3Catalog.AddedIds;
            if(v3Items.Length!=6||v3Items.Distinct().Count()!=6||
                ItemBalance.Items.Length!=42)
                issues.Add("Unity V3 native item catalog does not contain 42 unique item definitions.");

            foreach(var item in info)Debug.Log("[Unity V3 readiness] "+item);
            foreach(var issue in issues)Debug.LogWarning("[Unity V3 readiness] "+issue);
            Debug.Log("[Unity V3 readiness] "+issues.Count+
                " issue(s). Warnings are review gates, not automatically a broken game.");
        }
        [MenuItem("Idle Intelligence/V3/Capture Current Game Screen")]
        public static void Screenshot()
        {
            if(!Application.isPlaying)
            {
                Debug.LogWarning("Enter Play mode before capturing Unity V3 UI.");
                return;
            }
            string path=Path.Combine(Directory.GetCurrentDirectory(),"Builds","V3-Screenshots",
                "v3-"+DateTime.UtcNow.ToString("yyyyMMdd-HHmmss")+".png");
            Directory.CreateDirectory(Path.GetDirectoryName(path));
            ScreenCapture.CaptureScreenshot(path,1);
            Debug.Log("Unity V3 screenshot requested: "+path);
        }
    }
}
#endif
