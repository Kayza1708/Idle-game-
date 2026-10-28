using System;
using System.Linq;
using System.Collections.Generic;
using IdleIntelligence.Core;
using UnityEngine;
using UnityEngine.UI;
namespace IdleIntelligence.Runtime
{
    // A bounded cosmetic receipt consumer. All inputs have already reached AtomicSaveStore.
    // Does not advance time, call transactions, grant rewards or request an extra save.
    public sealed class CompletionFeedback:MonoBehaviour
    {
        GameRuntime game;GameState observed;RectTransform root;CanvasGroup opacity;Text label;Image accent;
        float started;bool visible;public int Presentations{get;private set;}public string LastText{get;private set;}="";
        string T(string text)=>UiLocalizedText.Translate(text,game.State.Settings.language);
        public void Initialize(GameRuntime runtime){game=runtime;observed=game.State;}
        public void Rebase(GameState state){observed=state;Cancel();}
        public void Cancel(){visible=false;if(root!=null)root.gameObject.SetActive(false);}
        public static bool Completed(GameState before,GameState after)=>after.Lifetime.trainingCompleted>before.Lifetime.trainingCompleted||after.Lifetime.researchCompleted>before.Lifetime.researchCompleted||after.Lifetime.analysesCompleted>before.Lifetime.analysesCompleted;
        public void Saved(GameState current)
        {
            if(observed==null){observed=current;return;}var previous=observed;observed=current;
            if(current.Challenges.Progress.lastReturnId!=previous.Challenges.Progress.lastReturnId){if(current.Challenges.Progress.lastSuccess)Present(T("Challenge abgeschlossen"));return;}
            // A reset, explicit restore and reload have their own presentation / measured return report.
            if(current.Prestige.resets!=previous.Prestige.resets||current.Meta.resets!=previous.Meta.resets)return;
            var parts=new List<string>();
            Add(parts,"Training abgeschlossen",current.Lifetime.trainingCompleted-previous.Lifetime.trainingCompleted);
            Add(parts,"Forschung abgeschlossen",current.Lifetime.researchCompleted-previous.Lifetime.researchCompleted);
            Add(parts,"Analyse abgeschlossen",current.Lifetime.analysesCompleted-previous.Lifetime.analysesCompleted);
            if(current.Workshop.nodes.Length>previous.Workshop.nodes.Length)parts.Add(T("Knoten aktiviert")+" +"+(current.Workshop.nodes.Length-previous.Workshop.nodes.Length));
            if(current.Meta.axioms.Sum()>previous.Meta.axioms.Sum())parts.Add(T("Axiom verstärkt"));
            if(parts.Count>0)Present(string.Join(" · ",parts));
        }
        void Add(List<string> parts,string title,double count){if(count>0)parts.Add(T(title)+(count>1?" ×"+Math.Floor(count):""));}
        public void Claimed(GameState before,GameState after,string action)
        {
            if(after.Rewards.hasReceipt&&(!before.Rewards.hasReceipt||before.Rewards.receipt.id!=after.Rewards.receipt.id))return;
            if(action!="claim"&&action!="season-claim"&&action!="model-upgrade"&&action!="model-select")return;
            var parts=new List<string>();
            if(action=="model-upgrade"||action=="model-select"){
                if(after.Workshop.activeModel!=before.Workshop.activeModel||!after.Meta.models.SequenceEqual(before.Meta.models))Present(T(action=="model-upgrade"?"Modell verbessert":"Modell aktiviert"));return;
            }
            var credits=after.Credits.Subtract(before.Credits);if(credits.CompareTo(ScientificNumber.Zero)>0)parts.Add("+"+NumberFormatting.Format(credits,after.Settings.numberFormat,after.Settings.language)+" Credits");
            if(after.Retention.points>before.Retention.points)parts.Add("+"+(after.Retention.points-before.Retention.points)+" AP");
            if(after.Retention.gems>before.Retention.gems)parts.Add("+"+(after.Retention.gems-before.Retention.gems)+" Gems");
            if(after.Missions.season.xp>before.Missions.season.xp)parts.Add("+"+(after.Missions.season.xp-before.Missions.season.xp)+" XP");
            long components=after.Workshop.components.Select((v,i)=>Math.Max(0,v-before.Workshop.components[i])).Sum();if(components>0)parts.Add("+"+components+" "+T("Komponenten"));
            if(parts.Count==0&&after.Retention.challengeClaims.Length>before.Retention.challengeClaims.Length)parts.Add(T("Challenge abgeschlossen"));
            if(parts.Count>0)Present(T("Abgeholt")+" · "+string.Join(" · ",parts));
        }
        void Build()
        {
            var canvas=game.Content.GetComponentInParent<Canvas>();var safe=WorkshopUIFactory.Node("CompletionFeedbackSafeArea",canvas.transform);WorkshopUIFactory.Fill((RectTransform)safe.transform);safe.AddComponent<SafeArea>();safe.AddComponent<CanvasGroup>().blocksRaycasts=false;
            root=(RectTransform)WorkshopUIFactory.Node("SavedCompletionReceipt",safe.transform,typeof(Image),typeof(CanvasGroup)).transform;root.anchorMin=new Vector2(0,0);root.anchorMax=new Vector2(1,0);root.pivot=new Vector2(.5f,0);root.anchoredPosition=new Vector2(0,82);root.sizeDelta=new Vector2(-24,64);
            var image=root.GetComponent<Image>();GameTheme.SurfaceOn(image,GameTheme.Surface);image.raycastTarget=false;
            opacity=root.GetComponent<CanvasGroup>();opacity.blocksRaycasts=opacity.interactable=false;
            var line=WorkshopUIFactory.Node("ReceiptAccent",root,typeof(Image));accent=line.GetComponent<Image>();accent.color=GameTheme.Enough;accent.raycastTarget=false;var r=(RectTransform)line.transform;r.anchorMin=Vector2.zero;r.anchorMax=new Vector2(0,1);r.offsetMin=Vector2.zero;r.offsetMax=new Vector2(3,0);
            label=WorkshopUIFactory.Label("ReceiptText",root,"",14,44);Destroy(label.GetComponent<LayoutElement>());WorkshopUIFactory.Fill(label.rectTransform);label.rectTransform.offsetMin=new Vector2(12,6);label.rectTransform.offsetMax=new Vector2(-10,-6);label.raycastTarget=false;label.font=GameTheme.Bold;label.alignment=TextAnchor.MiddleLeft;
        }
        void Present(string text)
        {
            if(!game.State.Settings.effects||game.State.Workshop.reducedMotion){Show(text,false);return;}Show(text,true);
        }
        void Show(string text,bool animated)
        {
            if(root==null)Build();LastText=text;label.text=text;var settings=label.GetGenerationSettings(new Vector2(Mathf.Max(120,root.rect.width-22),0));float height=label.cachedTextGeneratorForLayout.GetPreferredHeight(text,settings)/label.pixelsPerUnit;root.sizeDelta=new Vector2(root.sizeDelta.x,Mathf.Clamp(Mathf.Ceil(height)+12,52,100));Presentations++;started=Time.unscaledTime;visible=true;root.gameObject.SetActive(true);opacity.alpha=1;root.localScale=Vector3.one;
            motion=animated; // Reuses this single visual; rapid results cannot stack objects or block input.
        }
        bool motion;
        void Update(){if(!visible||root==null)return;float age=Time.unscaledTime-started;if(age>=1.8f){Cancel();return;}if(!motion)return;float enter=Mathf.Clamp01(age/.14f);float leave=Mathf.Clamp01((age-1.5f)/.3f);root.anchoredPosition=new Vector2(0,82-6*(1-enter)*(1-enter));opacity.alpha=enter*(1-leave);accent.color=Color.Lerp(GameTheme.Accent,GameTheme.Enough,Mathf.Clamp01(age/.35f));}
        void OnApplicationPause(bool paused){if(paused)Cancel();}void OnApplicationFocus(bool focused){if(!focused)Cancel();}
        void OnDestroy(){if(root!=null)Destroy(root.parent.gameObject);}
    }
}
