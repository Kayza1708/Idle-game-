using System;
using System.IO;
using System.Linq;
using IdleIntelligence.Core;
using UnityEngine;
using UnityEngine.UI;
namespace IdleIntelligence.Runtime
{
    // Explicit backup/restore. No background account prompts and no automatic conflict winner.
    public sealed class CloudSaveView:MonoBehaviour
    {
        GameRuntime game;PlatformCloudService service;Transform body,entries;Text status;Button upload,refresh,restore;AtomicSaveStore.Candidate candidate;
        string T(string value)=>UiLocalizedText.Translate(value,game.State.Settings.language);
        Text Paragraph(string id,string value){var text=WorkshopUIFactory.Label(id,body,value,14,24);AdaptiveTextHeight.Attach(text);return text;}
        public void Initialize(GameRuntime runtime)
        {
            game=runtime;service=game.GetComponentInChildren<PlatformCloudService>();if(service==null){var root=new GameObject("PlatformCloud");root.transform.SetParent(game.transform);service=root.AddComponent<PlatformCloudService>();}
            var toggle=WorkshopUIFactory.Button("OpenPlatformCloud",transform,T("Cloud-Backup"),()=>{body.gameObject.SetActive(!body.gameObject.activeSelf);});toggle.transform.SetAsFirstSibling();
            body=WorkshopUIFactory.Vertical("CloudBackup",transform).transform;body.SetSiblingIndex(1);body.gameObject.SetActive(false);
            Paragraph("CloudHeading","Cloud-Backup").font=GameTheme.Bold;
            Paragraph("CloudExplanation","Apple iCloud auf iOS; Google Play Games auf Android. Lokale Spielstände bleiben unabhängig. Abweichende Stände ausdrücklich wählen, niemals Belohnungen zusammenführen.");
            status=Paragraph("CloudStatus",service.Available?service.Provider:service.Unavailable);
            var actions=WorkshopUIFactory.Horizontal("CloudActions",body,44);
            refresh=WorkshopUIFactory.Button("CloudRefresh",actions.transform,T("Cloud prüfen"),Fetch);
            upload=WorkshopUIFactory.Button("CloudUpload",actions.transform,T("Stand hochladen"),Upload);
            entries=WorkshopUIFactory.Vertical("CloudSnapshots",body).transform;
            restore=WorkshopUIFactory.Button("CloudRestore",body,T("Gewählten Cloudstand nach Originalkopie laden"),Restore);restore.interactable=false;
        }
        void Update(){if(service==null)return;refresh.interactable=!service.Busy;upload.interactable=!service.Busy&&game.Writable;restore.interactable=!service.Busy&&candidate?.Valid==true;}
        void Request(string operation,string value,Action<CloudReply> success)
        {
            if(service.Busy)return;status.text=T("Cloud wird geprüft · lokaler Stand bleibt erhalten");
            service.Begin(operation,value,reply=>{if(this==null)return;if(!reply.ok){status.text=reply.error;return;}try{success(reply);}catch(Exception e){status.text=e.Message;}});
        }
        void Fetch(){candidate=null;restore.interactable=false;Request("list","",reply=>{WorkshopUIFactory.Clear(entries);foreach(var entry in (reply.entries??Array.Empty<CloudEntry>()).OrderByDescending(e=>e.modified)){var selected=entry;WorkshopUIFactory.Button("CloudCandidate-"+entry.key,entries,Date(entry.modified)+" · "+entry.device,()=>Read(selected));}status.text=T((reply.entries?.Length??0)==0?"Keine Cloud-Sicherung vorhanden":"Cloudstände gefunden · Vorschau auswählen");});}
        void Read(CloudEntry entry){candidate=null;Request("read",entry.key,reply=>{byte[] bytes=Convert.FromBase64String(reply.payload);candidate=CloudSnapshotStore.Stage(bytes,Path.Combine(Path.GetDirectoryName(game.SavePath),"CloudOriginals"),game.Storage);var s=candidate.State;status.text=T("Cloud-Vorschau")+"\n"+Date(s.SavedAt)+" · "+s.Workshop.inventory.Length+" "+T("Items")+" · "+s.Prestige.resets+" Prestige\n"+T("Lokaler Stand")+": "+Date(game.State.SavedAt)+" · "+game.State.Workshop.inventory.Length+" "+T("Items")+"\n"+T("Laden ersetzt den lokalen Fortschritt nach unveränderter Originalkopie. Keine Zusammenführung.");});}
        [Serializable]sealed class WriteArgs{public string name,payload;}
        void Upload()
        {
            try{
                game.SaveButton.onClick.Invoke();if(!game.Writable)throw new IOException("Local save is protected; cloud upload blocked");
                // Preserve and validate precisely the bytes to be uploaded, including retained web originals.
                byte[] packed=CloudSnapshotStore.Pack(File.ReadAllBytes(game.SavePath));CloudSnapshotStore.Stage(packed,Path.Combine(Path.GetDirectoryName(game.SavePath),"CloudOriginals"),game.Storage);
                string deviceKey="idle-cloud-device";string id=PlayerPrefs.GetString(deviceKey,"");if(id.Length!=32){id=Guid.NewGuid().ToString("N");PlayerPrefs.SetString(deviceKey,id);PlayerPrefs.Save();}
                // Per-device slots avoid one device overwriting another device's snapshots.
                int slot=PlayerPrefs.GetInt("idle-cloud-slot",0)%3;
                Request("write",JsonUtility.ToJson(new WriteArgs{name="idle-unity-"+id+"-"+slot,payload=Convert.ToBase64String(packed)}),reply=>{PlayerPrefs.SetInt("idle-cloud-slot",(slot+1)%3);PlayerPrefs.Save();status.text=T("Cloud-Sicherung bestätigt");});
            }catch(Exception e){status.text=e.Message;}
        }
        void Restore(){if(candidate?.Valid!=true)return;try{var chosen=candidate;candidate=null;game.RecoverSave(chosen.Path,chosen.Hash);}catch(Exception e){status.text=e.Message;}}
        static string Date(double milliseconds){try{return DateTimeOffset.FromUnixTimeMilliseconds((long)milliseconds).ToLocalTime().ToString("g");}catch{return "?";}}
    }
}
