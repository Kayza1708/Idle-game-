using UnityEngine;using UnityEngine.UI;
namespace IdleIntelligence.Runtime {
 public sealed class PrestigeNodeView:MonoBehaviour {
  public Text Title,Price;public Image Art,Panel;public Button Button;public string Id;string fullName;
  public void SetTitle(string value){if(fullName==value)return;fullName=value;Title.horizontalOverflow=HorizontalWrapMode.Wrap;Title.verticalOverflow=VerticalWrapMode.Truncate;Title.resizeTextForBestFit=true;Title.resizeTextMinSize=12;Title.resizeTextMaxSize=14;Title.text=value;}

 }
}
