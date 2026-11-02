using System;using System.Linq;
namespace IdleIntelligence.Core {
 public sealed class ItemSpecialQuote {public string Effect;public bool Active;public double Scale,BonusSeconds,INTWeight;public int TriggerInterval;}
 public sealed class ItemRatePreview {public GameState Before,After;public string Slot;}
 public static class ItemDetailRules {
  // Same-context canonical baseline, as specialItemEffectQuote; UI units are seconds/INT weight, not the raw effect percentage.
  public static ItemSpecialQuote Special(GameState s,ItemInstance i){if(i.type!="impulse-relay"&&i.type!="insight-archive")return null;double scale=Workshop.SpecialScale(s,i);bool relay=i.type=="impulse-relay";return new ItemSpecialQuote{Effect=relay?"relay":"int-yield",Scale=scale,Active=Workshop.Equipped(s).Any(x=>x.id==i.id),TriggerInterval=relay?10:0,BonusSeconds=relay?2*scale:0,INTWeight=relay?0:.25*scale};}
  // A comparison is a copied hypothetical loadout, never an equipment transaction.
  public static ItemRatePreview Upgrade(GameState state,string id){var item=state.Workshop.inventory.FirstOrDefault(i=>i.id==id);if(item==null||item.level>=ItemBalance.MaxLevel)return null;string slot=state.Workshop.equipped.Contains(id)?ItemBalance.Slots[Array.IndexOf(state.Workshop.equipped,id)]:Workshop.EquipmentSlot(state,id)??Workshop.Definition(item).Family;int n=Array.IndexOf(ItemBalance.Slots,slot);if(n<0||!Workshop.ActiveSlots(state)[n])return null;var before=state.Copy();before.Workshop.equipped[n]=id;var after=before.Copy();after.Workshop.inventory.First(i=>i.id==id).level++;return new ItemRatePreview{Before=before,After=after,Slot=slot};}
 }
}
