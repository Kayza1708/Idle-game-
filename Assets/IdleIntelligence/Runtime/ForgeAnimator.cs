using System.Collections;using System.Collections.Generic;using System.Linq;
using IdleIntelligence.Core;using UnityEngine;using UnityEngine.UI;
namespace IdleIntelligence.Runtime {
 // Presentation of a persisted receipt, with a single replaceable, bounded sequence.
 public sealed class ForgeAnimator:MonoBehaviour {
  public RectTransform Layer;public ItemPortrait PortraitPrefab,Result;public ItemPortrait[] Inputs;public Text Message;public Image Flash;public Sprite[] Components;
  readonly List<GameObject> transient=new List<GameObject>();public RectTransform InventoryTarget;public System.Action<string> ImpactSound;ForgeSequence sequence;Coroutine running;ItemInstance receipt;string language="de";int materialCount=-1;public int PresentedCount{get;private set;}=1;
  public void Shorten(){if(sequence!=null)sequence.Shorten=true;}
  public bool IsAnimating=>running!=null;public int FlightCount{get;private set;}
  public void Cancel(){if(running!=null)StopCoroutine(running);running=null;if(sequence!=null){sequence.gameObject.SetActive(false);}foreach(var g in transient)if(g!=null){g.SetActive(false);Destroy(g);}transient.Clear();FlightCount=0;Flash.color=Color.clear;for(int n=0;n<Inputs.Length;n++)Inputs[n].gameObject.SetActive(materialCount<0||n<materialCount);if(receipt!=null){Result.Bind(receipt);Result.transform.localScale=Vector3.one;Result.gameObject.SetActive(true);Message.text=UiLocalizedText.Translate("Im Inventar",language)+(PresentedCount>1?" ×"+PresentedCount:"")+" · "+SettingsRules.Text(language,"rarity:"+ItemBalance.Rarities[receipt.rarity]);}}
  public void ClearPresentation(){Cancel();receipt=null;Result.Bind(null);Result.gameObject.SetActive(false);Message.text="";}
  public void FusionInputs(){materialCount=-1;for(int i=0;i<Inputs.Length;i++){Inputs[i].ShowLevel=false;((RectTransform)Inputs[i].transform).anchoredPosition=new Vector2((i-1)*104,80);Inputs[i].gameObject.SetActive(true);}}
  public void ShowMaterials(double[] costs,int quantity){var ids=costs.Select((n,i)=>new{n,i}).Where(v=>v.n>0).ToArray();materialCount=ids.Length;for(int n=0;n<Inputs.Length;n++){var p=Inputs[n];p.ShowLevel=true;p.gameObject.SetActive(n<ids.Length);if(n>=ids.Length)continue;((RectTransform)p.transform).anchoredPosition=new Vector2((n-(Mathf.Min(3,ids.Length)-1)*.5f)*104,80);p.Bind(null);p.Art.gameObject.SetActive(true);p.Art.sprite=Components[ids[n].i];p.Art.preserveAspect=true;p.Art.rectTransform.sizeDelta=new Vector2(42,42);p.Caption.text="×"+(ids[n].n*quantity);}}
  void OnDisable()=>Cancel();
  public void Play(ItemInstance[] items,int[] componentIds,ItemInstance result,bool reduced,double[] amounts=null,string locale="de",string improvement=null,int quantity=1){int count=IsAnimating&&receipt?.type==result.type&&receipt.rarity==result.rarity?PresentedCount+quantity:quantity;Cancel();PresentedCount=count;language=locale;receipt=result.Copy();Result.Bind(receipt);Result.gameObject.SetActive(reduced);if(reduced){Cancel();return;}Message.text=UiLocalizedText.Translate("Material wird verbunden …",language);running=StartCoroutine(ComposedFusion(items,result,improvement,componentIds,amounts));}

  IEnumerator ComposedFusion(ItemInstance[] items,ItemInstance result,string improvement,int[] components,double[] amounts){FlightCount=items.Length>0?items.Length:components.Length;foreach(var input in Inputs)input.gameObject.SetActive(false);Result.gameObject.SetActive(false);Message.text="";if(sequence==null)sequence=Instantiate(Resources.Load<ForgeSequence>("PixelUI/ForgeSequence"),Layer);sequence.gameObject.SetActive(true);WorkshopUIFactory.Fill((RectTransform)sequence.transform);yield return sequence.Present(items,result,language,improvement,InventoryTarget!=null?InventoryTarget:(RectTransform)Result.transform,()=>ImpactSound?.Invoke(items.Length>0?"fusion-impact":"forge-impact"),components,amounts,Components,PresentedCount);running=null;Cancel();}
  public void SetReduced(bool reduced){if(reduced)Cancel();}
 }
}
