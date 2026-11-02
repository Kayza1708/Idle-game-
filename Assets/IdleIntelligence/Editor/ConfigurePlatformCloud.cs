#if UNITY_IOS
using System;
using System.IO;
using UnityEditor;
using UnityEditor.Callbacks;
using UnityEditor.iOS.Xcode;
namespace IdleIntelligence.Editor
{
    public static class ConfigurePlatformCloud
    {
        // Container must already exist in the user's Apple Developer account.
        // No invented team, container, provisioning profile or account login.
        [PostProcessBuild(1500)]public static void Configure(BuildTarget target,string output)
        {
            if(target!=BuildTarget.iOS)return;
            var project=new PBXProject();string path=PBXProject.GetPBXProjectPath(output);project.ReadFromFile(path);
            project.AddFrameworkToProject(project.GetUnityFrameworkTargetGuid(),"GameKit.framework",false);project.WriteToFile(path);
            var plist=new PlistDocument();string info=Path.Combine(output,"Info.plist");plist.ReadFromFile(info);plist.root.SetBoolean("IdleCloudEnabled",false);
            string container=Environment.GetEnvironmentVariable("IDLE_ICLOUD_CONTAINER");
            if(!string.IsNullOrEmpty(container)){
                if(!container.StartsWith("iCloud.",StringComparison.Ordinal))throw new InvalidOperationException("Invalid iCloud container identifier");
                var capabilities=new ProjectCapabilityManager(path,"IdleCloud.entitlements",null,project.GetUnityMainTargetGuid());
                capabilities.AddiCloud(enableKeyValueStorage:false,enableiCloudDocument:true,enablecloudKit:false,addDefaultContainers:false,customContainers:new[]{container});capabilities.WriteToFile();
                plist.root.SetBoolean("IdleCloudEnabled",true);
            }
            plist.WriteToFile(info);
        }
    }
}
#endif
