using IdleIntelligence.Core;using NUnit.Framework;
namespace IdleIntelligence.Tests
{
 public sealed class PrestigeContractTests
 {
  [Test]public void W03AppliesToNewAnalysisContractsWithoutRewritingPaidWork()
  {var s=Game.New(1000);s.Data=ScientificNumber.From(1000);s.Prestige.Cycle=s.Prestige.Total=s.Prestige.Free=s.Prestige.Entitlement=ScientificNumber.From(100);s=MaterialAnalysis.Start(s,0);Assert.That(s.Workshop.hasAnalysis,Is.True);double required=s.Workshop.analysis.required;s=PrestigeRules.Buy(s,"W03");Assert.That(s.Workshop.analysis.rareGuarantee,Is.False);Assert.That(s.Workshop.analysis.required,Is.EqualTo(required));var completed=Game.Advance(s,s.SavedAt+600000);completed=MaterialAnalysis.Start(completed,0);Assert.That(completed.Workshop.analysis.rareGuarantee,Is.True);}
  [Test]public void ScientificFloorPreservesTheUnitBelowAnEnormousSparseNumber()
  {var enormous=ScientificNumber.Parse("1e100");Assert.That(enormous.Subtract(ScientificNumber.From(.1)).Floor().CompareTo(enormous.Subtract(ScientificNumber.One)),Is.Zero);}
 }
}
