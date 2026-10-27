using UnityEngine;using UnityEngine.UI;
namespace IdleIntelligence.Runtime {
 public sealed class PrestigeNodeView:MonoBehaviour {
  public Text Title,Price;public Image Art,Panel;public Button Button;public string Id;string fullName;
  public void SetTitle(string value){if(fullName==value)return;fullName=value;var settings=Title.GetGenerationSettings(new Vector2(2000,100));settings.resizeTextForBestFit=false;settings.fontSize=14;settings.horizontalOverflow=HorizontalWrapMode.Overflow;string copy=value;while(copy.Length>1&&Title.cachedTextGeneratorForLayout.GetPreferredWidth(copy==value?copy:copy+"…",settings)/Title.pixelsPerUnit>104)copy=copy.Substring(0,copy.Length-1);Title.text=copy==value?copy:copy.TrimEnd()+"…";}
 }
}
