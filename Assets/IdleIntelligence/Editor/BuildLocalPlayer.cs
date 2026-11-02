using System;
using System.IO;
using UnityEditor;
using UnityEditor.Build;
using UnityEditor.Build.Reporting;
using UnityEngine;

namespace IdleIntelligence.Editor
{
    public static class BuildLocalPlayer
    {
        // Existing local build entry point remains unchanged.
        public static void Build()
        {
            string output = Environment.GetEnvironmentVariable("IDLE_PLAYER_OUTPUT") ?? "/tmp/IdleIntelligence-local.app";
            if (Directory.Exists(output)) throw new InvalidOperationException("Choose a new local player output");
            var report = BuildPipeline.BuildPlayer(new BuildPlayerOptions
            {
                scenes = CreateBootScene.PlayerScenes,
                locationPathName = output,
                target = BuildTarget.StandaloneOSX,
                options = BuildOptions.Development | BuildOptions.StrictMode
            });
            Debug.Log("LOCAL_PLAYER_BUILD " + report.summary.result + " platform=" + report.summary.platform +
                      " bytes=" + report.summary.totalSize + " errors=" + report.summary.totalErrors);
            if (report.summary.result != BuildResult.Succeeded) throw new Exception("Local player build failed");
            File.WriteAllText(output + ".report.txt", report.summary.result + "\n" + report.summary.platform +
                              "\n" + report.summary.totalSize + " bytes\n" + report.summary.totalTime);
        }

        // An opt-in standalone build for balance testing. Different company/product/bundle
        // values make Application.persistentDataPath independent from the normal Unity app.
        // Do not enable partially migrated V3 persistence as part of a playtest build.
        public static void BuildBalancePlaytest()
        {
            string output = Environment.GetEnvironmentVariable("IDLE_PLAYER_OUTPUT");
            if (string.IsNullOrWhiteSpace(output) || !Path.IsPathRooted(output) ||
                !output.EndsWith(".app", StringComparison.OrdinalIgnoreCase))
                throw new InvalidOperationException("IDLE_PLAYER_OUTPUT must be an absolute, new .app path.");
            if (Directory.Exists(output) || File.Exists(output))
                throw new InvalidOperationException("Existing playtest output cannot be overwritten.");

            const string playtestCompany = "IdleIntelligenceBalance";
            const string playtestProduct = "Idle Intelligence Balance Playtest";
            const string playtestIdentifier = "com.kayza1708.idleintelligence.balanceplaytest";
            string originalCompany = PlayerSettings.companyName;
            string originalProduct = PlayerSettings.productName;
            string originalIdentifier = PlayerSettings.GetApplicationIdentifier(NamedBuildTarget.Standalone);
            try
            {
                PlayerSettings.companyName = playtestCompany;
                PlayerSettings.productName = playtestProduct;
                PlayerSettings.SetApplicationIdentifier(NamedBuildTarget.Standalone, playtestIdentifier);
                var report = BuildPipeline.BuildPlayer(new BuildPlayerOptions
                {
                    scenes = CreateBootScene.PlayerScenes,
                    locationPathName = output,
                    target = BuildTarget.StandaloneOSX,
                    options = BuildOptions.Development | BuildOptions.StrictMode
                });
                Debug.Log("BALANCE_PLAYTEST_BUILD " + report.summary.result + " platform=" +
                          report.summary.platform + " errors=" + report.summary.totalErrors);
                if (report.summary.result != BuildResult.Succeeded)
                    throw new InvalidOperationException("Balance playtest build failed: " + report.summary.result);
                File.WriteAllText(output + ".report.txt",
                    report.summary.result + "\n" + report.summary.platform + "\n" +
                    report.summary.totalSize + " bytes\n" + report.summary.totalTime +
                    "\ncompany=" + playtestCompany + "\nproduct=" + playtestProduct +
                    "\nbundle=" + playtestIdentifier + "\ncommit=" +
                    (Environment.GetEnvironmentVariable("IDLE_BUILD_COMMIT") ?? "unknown") + "\n");
            }
            finally
            {
                PlayerSettings.SetApplicationIdentifier(NamedBuildTarget.Standalone, originalIdentifier);
                PlayerSettings.companyName = originalCompany;
                PlayerSettings.productName = originalProduct;
                AssetDatabase.SaveAssets();
            }
        }
    }
}
