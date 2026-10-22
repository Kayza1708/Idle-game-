using UnityEngine;using UnityEngine.UI;using IdleIntelligence.Core;
namespace IdleIntelligence.Runtime {
 public sealed class ModelLoadout:MonoBehaviour {
  public RectTransform Network,Universal;public Image Core;public Text Name,Stats;GameRuntime game;float feedback=1;public static readonly Vector2[] Positions={new Vector2(.17f,.76f),new Vector2(.5f,.83f),new Vector2(.83f,.76f),new Vector2(.17f,.24f),new Vector2(.5f,.17f),new Vector2(.83f,.24f)};
  public void Initialize(GameRuntime runtime){game=runtime;}
  public void Receipt(bool reduced){feedback=reduced?1:0;}
  void LateUpdate(){if(game==null)return;feedback+=Time.unscaledDeltaTime;var s=game.State;Name.text=s.Retention.aiName+" · Lv. "+s.ModelLevel;Stats.text="Q "+Game.TrainingLevel(s,"quality")+"   E "+Game.TrainingLevel(s,"efficiency")+"   G "+Game.TrainingLevel(s,"integration")+"\n"+NumberFormatting.Format(Game.Income(s),s.Settings.numberFormat)+" C/s · "+NumberFormatting.Format(Game.DataRate(s),s.Settings.numberFormat)+" D/s";Core.color=feedback<.28f?Color.Lerp(GameTheme.Accent,Color.white,feedback/.28f):Color.white;Stats.color=feedback<.6f?GameTheme.Enough:GameTheme.Text;Core.rectTransform.anchoredPosition=new Vector2(0,feedback<.28f?Mathf.Sin(feedback/.28f*Mathf.PI)*3:0);}
 }
}
