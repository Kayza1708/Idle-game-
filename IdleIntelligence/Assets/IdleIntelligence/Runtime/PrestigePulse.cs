using System.Collections;using UnityEngine;using UnityEngine.UI;
namespace IdleIntelligence.Runtime {
// Cosmetic receipt only: cancellation and completion cannot call any domain transaction.
public sealed class PrestigePulse:MonoBehaviour
{
 public CanvasGroup Group;public RectTransform Core;public Image Glow;public Text Message;Coroutine running,dismiss;public bool IsAnimating=>running!=null;
 public void Play(string receipt,bool reduced){Cancel();gameObject.SetActive(true);Message.text=receipt;Core.gameObject.SetActive(!reduced);if(reduced){Group.alpha=1;Glow.color=Color.clear;dismiss=StartCoroutine(StaticReceipt());return;}running=StartCoroutine(Animate());}
 IEnumerator StaticReceipt(){yield return new WaitForSecondsRealtime(1.25f);dismiss=null;Cancel();}
 IEnumerator Animate(){float t=0;while(t<1.25f){t+=Time.unscaledDeltaTime;float p=Mathf.Clamp01(t/1.25f);Group.alpha=p<.8f?1:1-(p-.8f)/.2f;Core.localScale=Vector3.one*(1+.18f*Mathf.Sin(p*Mathf.PI));Glow.color=new Color(.3f,.8f,1,Mathf.Sin(p*Mathf.PI)*.5f);yield return null;}running=null;Cancel();}
 public void Cancel(){if(running!=null)StopCoroutine(running);if(dismiss!=null)StopCoroutine(dismiss);dismiss=null;running=null;if(Core!=null)Core.localScale=Vector3.one;if(Group!=null)Group.alpha=0;gameObject.SetActive(false);}
 void OnDisable(){if(running!=null)StopCoroutine(running);if(dismiss!=null)StopCoroutine(dismiss);dismiss=null;running=null;}
}}
