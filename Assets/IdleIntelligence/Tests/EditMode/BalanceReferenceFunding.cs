using System;
using IdleIntelligence.Core;
namespace IdleIntelligence.Tests
{
    // Frozen effect/work reference fixtures predate native price tuning. Explicitly
    // fund only their extra data charge, preserving the original wallet, timing,
    // material and receipt expectations. Not used in paid progression simulations.
    internal static class BalanceReferenceFunding
    {
        public static GameState ExtraData(GameState state,double amount)
        {
            if(amount<=0)return state;
            var s=state.Copy();s.Data=s.Data.Add(ScientificNumber.From(amount));return s;
        }
        public static GameState Research(GameState state,string id)
        {
            int i=Game.ResearchIndex(id);
            if(!ItemSystemV3.Enabled(state)||Game.ResearchBlock(state,i)!=null||Game.IntroResearch(state)&&id=="dataGeneration")return state;
            var d=Balance.Research[i];int level=state.Research[i];
            double basis=!d.Project&&d.Early&&level<Balance.EarlyLevels?Math.Min(d.Cost,Balance.EarlyDataCap[level]):d.Cost;
            var original=Game.Ceil(ScientificNumber.From(basis).Multiply(d.Project?ScientificNumber.One:ScientificNumber.From(Balance.ResearchGrowth).Pow(level)).Times(PrestigeRules.Has(state,"F07")?PrestigeRules.EFor(state,"F07"):1));
            return ExtraData(state,Game.ResearchCost(state,i).Subtract(original).ToDouble());
        }
    }
}
