using System;
using System.IO;
using System.Collections;
using IdleIntelligence.Runtime;
using NUnit.Framework;
using UnityEngine;
using UnityEngine.UI;
using UnityEngine.SceneManagement;
using UnityEngine.TestTools;
namespace IdleIntelligence.PlayTests
{
    public sealed class PlatformCloudTests
    {
        sealed class Transport:IPlatformCloudTransport{public string token;public int calls;public void Request(string receiver,string request,string operation,string value){token=request;calls++;}}
        [UnityTest]public IEnumerator RepliesAreCorrelatedExactlyOnceAndDoNotGrantResources()
        {
            var root=new GameObject();var service=root.AddComponent<PlatformCloudService>();var fake=new Transport();service.ConfigureForTest(fake);int results=0;
            Assert.That(service.Begin("list","",r=>{Assert.That(r.ok,Is.True);results++;}),Is.True);Assert.That(service.Begin("list","",r=>results++),Is.False);Assert.That(fake.calls,Is.EqualTo(1));
            service.OnCloudReply("{\"request\":\"stale\",\"ok\":true}");Assert.That(service.Busy,Is.True);
            string reply="{\"request\":\""+fake.token+"\",\"ok\":true,\"entries\":[]}";service.OnCloudReply(reply);service.OnCloudReply(reply);Assert.That(results,Is.EqualTo(1));Assert.That(service.Busy,Is.False);
            UnityEngine.Object.Destroy(root);yield return null;
        }
        [UnityTest]public IEnumerator ActualStorageUiReportsUnavailableProviderWithoutPretendingToUpload()
        {
            GameRuntime.SavePathOverride=Path.Combine(Path.GetTempPath(),"idle-cloud-ui-"+Guid.NewGuid(),"save.json");yield return SceneManager.LoadSceneAsync("IdleIntelligence");yield return null;var game=UnityEngine.Object.FindFirstObjectByType<GameRuntime>();
            try{
                game.Act(s=>IdleIntelligence.Core.NarrativeBridge.Action(s,"name","AURA"));game.Act(s=>IdleIntelligence.Core.NarrativeBridge.Action(s,"skip-tutorial"));game.Act(s=>IdleIntelligence.Core.SettingsRules.Change(s,"language","en"));game.Show("storage");yield return null;
                GameObject.Find("OpenPlatformCloud").GetComponent<Button>().onClick.Invoke();yield return null;GameObject.Find("CloudRefresh").GetComponent<Button>().onClick.Invoke();yield return null;
                string message=GameObject.Find("CloudStatus").GetComponent<Text>().text;Assert.That(message,Does.Contain("physical"));Assert.That(game.Writable,Is.True);Assert.That(game.State.Retention.gems,Is.EqualTo(50));
            }finally{UnityEngine.Object.Destroy(game.gameObject);GameRuntime.SavePathOverride=null;}
            yield return null;
        }
    }
}
