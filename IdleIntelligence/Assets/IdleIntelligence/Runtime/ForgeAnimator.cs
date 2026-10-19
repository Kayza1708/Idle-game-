using System.Collections;
using System.Collections.Generic;
using IdleIntelligence.Core;
using UnityEngine;
using UnityEngine.UI;
namespace IdleIntelligence.Runtime
{
    // A presentation-only receipt player. No reference to GameRuntime, save store or grants.
    public sealed class ForgeAnimator:MonoBehaviour
    {
        public RectTransform Layer;public ItemPortrait PortraitPrefab,Result;public ItemPortrait[] Inputs;public Text Message;public Image Flash;public Sprite[] Components;
        readonly List<GameObject> transient=new List<GameObject>();Coroutine running;int generation;ItemInstance receipt;
        public bool IsAnimating=>running!=null;
        public void Cancel()
        {
            generation++;if(running!=null)StopCoroutine(running);running=null;foreach(var g in transient)if(g!=null){g.SetActive(false);Destroy(g);}transient.Clear();Flash.color=Color.clear;
            foreach(var p in Inputs)p.gameObject.SetActive(true);if(receipt!=null){Result.Bind(receipt);Result.transform.localScale=Vector3.one;Result.gameObject.SetActive(true);Message.text="Im Inventar · "+ItemBalance.Rarities[receipt.rarity];}
        }
        void OnDisable()=>Cancel();
        public void Play(ItemInstance[] items,int[] componentIds,ItemInstance result,bool reduced)
        {
            Cancel();receipt=result.Copy();Result.Bind(receipt);Result.gameObject.SetActive(reduced);Message.text=reduced?"Fertig · im Inventar":"Schmieden …";if(reduced)return;
            int token=generation;running=StartCoroutine(Animate(items,componentIds,result,token));
        }
        IEnumerator Animate(ItemInstance[] items,int[] components,ItemInstance result,int token)
        {
            var ghosts=new List<RectTransform>();var starts=new List<Vector2>();var particles=new List<RectTransform>();
            for(int n=0;n<3;n++)
            {
                Inputs[n].gameObject.SetActive(false);var ghost=Instantiate(PortraitPrefab,Layer);ghost.gameObject.name="ForgeFlight";ghost.Button.interactable=false;ghost.Button.targetGraphic.raycastTarget=false;((RectTransform)ghost.transform).sizeDelta=new Vector2(62,62);
                if(items.Length>n)ghost.Bind(items[n]);else {ghost.Bind(null);ghost.Art.gameObject.SetActive(true);ghost.Art.sprite=Components[components[n%components.Length]];ghost.Art.rectTransform.sizeDelta=new Vector2(42,42);ghost.Caption.text="";}
                var rt=(RectTransform)ghost.transform;rt.anchorMin=rt.anchorMax=new Vector2(.5f,.5f);rt.sizeDelta=new Vector2(62,62);Vector2 origin=Layer.InverseTransformPoint(Inputs[n].transform.position);rt.anchoredPosition=origin;starts.Add(origin);ghosts.Add(rt);transient.Add(ghost.gameObject);
            }
            Vector2 destination=Layer.InverseTransformPoint(Result.transform.position);
            for(int i=0;i<18;i++) {var g=new GameObject("ForgeSpark",typeof(RectTransform),typeof(Image));g.transform.SetParent(Layer,false);g.GetComponent<Image>().raycastTarget=false;g.GetComponent<Image>().color=Color.clear;var r=(RectTransform)g.transform;r.anchorMin=r.anchorMax=new Vector2(.5f,.5f);r.sizeDelta=new Vector2(i%3==0?6:3,i%3==0?6:3);particles.Add(r);transient.Add(g);}
            float time=0;while(time<1.75f&&token==generation)
            {
                time+=Time.unscaledDeltaTime;float fly=Mathf.Clamp01(time/.7f),smooth=fly*fly*(3-2*fly);for(int i=0;i<ghosts.Count;i++){var g=ghosts[i];g.anchoredPosition=Vector2.Lerp(starts[i],destination,smooth)+new Vector2(Mathf.Sin(fly*Mathf.PI)*(i-1)*14,Mathf.Sin(fly*Mathf.PI)*40);g.localScale=Vector3.one*Mathf.Lerp(1,.25f,smooth);g.localEulerAngles=new Vector3(0,0,Mathf.Sin(fly*Mathf.PI)*(i-1)*25);g.gameObject.SetActive(time<.72f);}
                float burst=Mathf.Clamp01((time-.6f)/.65f);Flash.color=new Color(1,.75f,.3f,Mathf.Max(0,1-Mathf.Abs(time-.72f)*6)*.6f);
                for(int i=0;i<particles.Count;i++){float a=(i*137.5f)*Mathf.Deg2Rad;var p=particles[i];p.anchoredPosition=destination+new Vector2(Mathf.Cos(a),Mathf.Sin(a))*burst*(35+i%4*13)+Vector2.down*burst*burst*45;p.localEulerAngles=new Vector3(0,0,time*160+i*30);p.GetComponent<Image>().color=new Color(1,.55f+i%3*.15f,.15f,burst>0?1-burst:0);}
                if(time>.8f){Result.gameObject.SetActive(true);float reveal=Mathf.Clamp01((time-.8f)/.4f);Result.transform.localScale=Vector3.one*(1+Mathf.Sin(reveal*Mathf.PI)*.15f);Message.text=""+Workshop.Definition(result).Name+" · "+ItemBalance.Rarities[result.rarity];}
                yield return null;
            }
            running=null;Cancel();
        }
        public void SetReduced(bool reduced){if(reduced)Cancel();}
    }
}
