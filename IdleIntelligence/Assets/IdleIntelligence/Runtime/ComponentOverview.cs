using System;
using IdleIntelligence.Core;
using UnityEngine;
using UnityEngine.UI;

namespace IdleIntelligence.Runtime
{
 // One persistent five-column overview. Ordinary stock changes update labels,
 // rather than recreating the inventory or twenty synthesis buttons.
 public sealed class ComponentOverview : MonoBehaviour
 {
  public Text Title,Fragments;
  public GridLayoutGroup Grid;
  public Button TilePrefab;
  public Button[] Tiles { get; private set; }
  Text[] amounts;long[] shown;GameRuntime game;GameState observed;string language,format;
  public void Initialize(WorkshopUI owner,GameRuntime runtime)
  {
   game=runtime;int count=ItemBalance.ComponentIds.Length;Tiles=new Button[count];amounts=new Text[count];shown=new long[count];
   for(int i=0;i<count;i++){int index=i;shown[i]=-1;var tile=Instantiate(TilePrefab,Grid.transform);tile.name="ComponentTile-"+ItemBalance.ComponentIds[i];tile.transform.Find("Art").GetComponent<Image>().sprite=owner.ComponentSprites[i];amounts[i]=tile.transform.Find("Amount").GetComponent<Text>();tile.onClick.AddListener(()=>owner.OpenComponent(index));Tiles[i]=tile;}
   Refresh();
  }
  public void Refresh()
  {
   if(game?.State==null||ReferenceEquals(observed,game.State))return;observed=game.State;var state=game.State;bool changed=language!=state.Settings.language||format!=state.Settings.numberFormat;language=state.Settings.language;format=state.Settings.numberFormat;
   if(changed)Title.text=UiLocalizedText.Translate("Komponenten",language);
   string fragments=UiLocalizedText.Translate("Bauplanfragmente",language)+": "+NumberFormatting.Format(ScientificNumber.From(state.Workshop.fragments),format);if(Fragments.text!=fragments)Fragments.text=fragments;
   for(int i=0;i<Tiles.Length;i++){long amount=state.Workshop.components[i];if(amount==shown[i]&&!changed)continue;shown[i]=amount;amounts[i].text=NumberFormatting.Format(ScientificNumber.From(amount),format).Replace("\u00a0Mio.","M").Replace("\u00a0Mrd.","B").Replace("\u00a0Bio.","T");amounts[i].color=amount>0?GameTheme.Text:GameTheme.Muted;}
  }
 }
}
