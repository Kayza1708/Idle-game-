using System;using System.Linq;using IdleIntelligence.Core;using UnityEngine;using UnityEngine.UI;
namespace IdleIntelligence.Runtime {
 public sealed class MobileShell:MonoBehaviour {
  GameRuntime game;public Sprite[] ResourceIcons;public LaboratoryView Laboratory;public void Initialize(GameRuntime runtime){game=runtime;Laboratory.Initialize(game);}
  void LateUpdate(){if(game?.State==null)return;var s=game.State;var tabs=new[]{game.HardwareTab,game.TrainingTab,game.ResearchTab,game.ItemsTab,game.PrestigeTab};string[] names={"hardware","training","research","items","prestige"};string selected=names.Contains(game.NavigationTab)?game.NavigationTab:"research";for(int i=0;i<5;i++){bool active=selected==names[i];tabs[i].GetComponent<Image>().color=active?GameTheme.Hex("17353F"):Color.clear;var line=tabs[i].transform.Find("ActiveLine");if(line!=null)line.gameObject.SetActive(active);foreach(var t in tabs[i].GetComponentsInChildren<Text>())t.color=active?GameTheme.Accent:GameTheme.Muted;}Laboratory.gameObject.SetActive(game.CurrentTab=="hardware");}
 }
}
