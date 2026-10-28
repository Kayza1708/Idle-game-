using System;
using System.IO;
using UnityEditor;
using UnityEditor.Build;
using UnityEditor.Build.Reporting;
using UnityEngine;

namespace IdleIntelligence.Editor
{
    /// <summary>Local Unity app, deliberately separate from the existing Capacitor app and saves.</summary>
    public static class BuildIOSPlayer
    {
        public static void BuildSimulator()
        {
            var output = Environment.GetEnvironmentVariable("IDLE_IOS_OUTPUT");
            var commit = Environment.GetEnvironmentVariable("IDLE_BUILD_COMMIT");
            if (string.IsNullOrEmpty(output) || string.IsNullOrEmpty(commit))
                throw new InvalidOperationException("IDLE_IOS_OUTPUT and IDLE_BUILD_COMMIT are required.");
            if (Directory.Exists(output) || File.Exists(output))
                throw new InvalidOperationException("Choose a new output folder; existing exports are preserved.");
            var target = NamedBuildTarget.iOS;
            var identifier = PlayerSettings.GetApplicationIdentifier(target);
            var sdk = PlayerSettings.iOS.sdkVersion;
            var architecture = PlayerSettings.iOS.simulatorSdkArchitecture;
            var orientation = PlayerSettings.defaultInterfaceOrientation;
            var product = PlayerSettings.productName;
            try
            {
                PlayerSettings.SetApplicationIdentifier(target, "com.kayza1708.idleintelligence.unity");
                PlayerSettings.productName = "Idle Intelligence Unity";
                PlayerSettings.iOS.sdkVersion = iOSSdkVersion.SimulatorSDK;
                PlayerSettings.iOS.simulatorSdkArchitecture = AppleMobileArchitectureSimulator.ARM64;
                PlayerSettings.defaultInterfaceOrientation = UIOrientation.Portrait;
                var report = BuildPipeline.BuildPlayer(new BuildPlayerOptions
                {
                    scenes = CreateBootScene.PlayerScenes,
                    locationPathName = output,
                    target = BuildTarget.iOS,
                    options = BuildOptions.Development | BuildOptions.StrictMode
                });
                Debug.Log("IOS_SIMULATOR_BUILD " + report.summary.result + " commit=" + commit + " errors=" + report.summary.totalErrors);
                if (report.summary.result != BuildResult.Succeeded)
                    throw new InvalidOperationException("Unity iOS export failed: " + report.summary.result);
                var plistPath=Path.Combine(output,"Info.plist");var plist=new System.Xml.XmlDocument();plist.XmlResolver=null;plist.Load(plistPath);var dictionary=plist.DocumentElement.SelectSingleNode("dict");
                foreach(var pair in new[]{new[]{"IdleUnityCommit",commit},new[]{"IdleUnityPlatform","iOS Simulator ARM64"},new[]{"IdleUnityVersion",Application.unityVersion}}){var key=plist.CreateElement("key");key.InnerText=pair[0];var value=plist.CreateElement("string");value.InnerText=pair[1];dictionary.AppendChild(key);dictionary.AppendChild(value);}if(plist.DocumentType!=null)plist.RemoveChild(plist.DocumentType);plist.Save(plistPath);
                File.WriteAllText(Path.Combine(output, "unity-build-provenance.txt"),
                    "commit=" + commit + "\nUnity=" + Application.unityVersion +
                    "\nplatform=iOS Simulator ARM64\nbundle=com.kayza1708.idleintelligence.unity\n" +
                    "result=" + report.summary.result + "\ntime=" + report.summary.totalTime + "\n");
            }
            finally
            {
                PlayerSettings.SetApplicationIdentifier(target, identifier);
                PlayerSettings.productName = product;
                PlayerSettings.iOS.sdkVersion = sdk;
                PlayerSettings.iOS.simulatorSdkArchitecture = architecture;
                PlayerSettings.defaultInterfaceOrientation = orientation;
                AssetDatabase.SaveAssets();
            }
        }
    }
}
