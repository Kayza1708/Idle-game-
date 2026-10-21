using System;
namespace IdleIntelligence.Core {
 public static class ResetControls {
  static void ClearIntent(GameState s){s.Prestige.resetIntent=false;s.Meta.intentAxiom=false;s.Prestige.intentTraining=false;s.Prestige.intentAnalysis=false;s.Prestige.intentCrafting=false;s.Prestige.intentResearch=Array.Empty<string>();}
  public static void TogglePrestige(GameState s){s.Prestige.agent=!s.Prestige.agent;if(!s.Meta.intentAxiom)ClearIntent(s);}
  public static void ToggleAxiom(GameState s){s.Meta.axiomAuto=!s.Meta.axiomAuto;if(s.Meta.intentAxiom)ClearIntent(s);}
  public static GameState Pause(GameState state){var s=state.Copy();s.Prestige.agent=false;s.Meta.axiomAuto=false;ClearIntent(s);s.Prestige.revision++;return s;}
 }
}
