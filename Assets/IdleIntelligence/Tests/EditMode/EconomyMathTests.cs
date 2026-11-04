using System;
using System.Linq;
using IdleIntelligence.Core;
using NUnit.Framework;
namespace IdleIntelligence.Tests
{
    public sealed class EconomyMathTests
    {
        [Test]public void SharedSlotOptimizationCountsCoProductsOnceAndReturnsFeasibleSchedule()
        {
            var sources=new[]{new MaterialSource{Id="both",PerSecond=new[]{1d,1d},DataPerSecond=2},new MaterialSource{Id="first",PerSecond=new[]{3d,0d}},new MaterialSource{Id="second",PerSecond=new[]{0d,3d}}};
            var needs=new[]{9d,3d};var q=MaterialEffort.Quote(needs,sources);
            Assert.That(q.Seconds,Is.EqualTo(4).Within(1e-8));Assert.That(q.SourceSeconds.Sum(),Is.EqualTo(q.Seconds).Within(1e-8));
            for(int c=0;c<2;c++)Assert.GreaterOrEqual(q.SourceSeconds.Select((t,i)=>t*sources[i].PerSecond[c]).Sum()+1e-8,needs[c]);
            var co=MaterialEffort.Quote(new[]{3d,3d},new[]{sources[0]});Assert.AreEqual(3,co.Seconds);
            Assert.Throws<InvalidOperationException>(()=>MaterialEffort.Quote(new[]{1d,0d},new[]{sources[2]}));
        }
        [Test]public void EveryRegularRecipeMatchesItsReferenceEffortAndHasAFeasibleSupplyPlan()
        {
            foreach(var d in ItemBalance.Items){var tier=EconomyBalance.TierOf(d.Id);if(!tier.HasValue)continue;
                double target=EconomyBalance.RecipeTargetSeconds(tier.Value);var q=EconomyBalance.RecipeEffort(d.Id);var costs=EconomyBalance.CraftComponents(true,d,0);var sources=EconomyBalance.RecipeSources(d.Id);
                Assert.That(EconomyBalance.RecipeLearningSeconds(d.Id),Is.InRange(target*.99,target*1.02),d.Id+" target and per-input rounding");
                Assert.That(q.SourceSeconds.Sum(),Is.EqualTo(q.Seconds).Within(q.Seconds*1e-8),d.Id+" one shared slot");
                for(int c=0;c<costs.Length;c++)Assert.GreaterOrEqual(q.SourceSeconds.Select((t,i)=>t*sources[i].PerSecond[c]).Sum()+1e-5,costs[c],d.Id+" feasible input "+c);
                double mastered=EconomyBalance.RecipeLearningSeconds(d.Id,4);Assert.That(mastered/EconomyBalance.RecipeLearningSeconds(d.Id),Is.InRange(.70,.91),d.Id+" mastery reduces effort");
                Assert.IsFalse(sources.Any(s=>s.Id.Split(':')[0].Split('+').Contains(d.Id)),d.Id+" no self-farming assumption");
            }
        }
        [Test]public void EffortPowerCurveHasExplicitAnchorsAndLateTiersFitOneToTwoWeeks()
        {
            Assert.AreEqual(21600,EconomyBalance.RecipeTargetSeconds(EconomyBalance.RecipeTier.Mid));
            Assert.That(EconomyBalance.RecipeTargetSeconds(EconomyBalance.RecipeTier.Apex)/86400,Is.EqualTo(12).Within(1e-10));
            double previous=0;foreach(EconomyBalance.RecipeTier tier in Enum.GetValues(typeof(EconomyBalance.RecipeTier))){double t=EconomyBalance.RecipeTargetSeconds(tier);Assert.Greater(t,previous);previous=t;}
            foreach(var tier in new[]{EconomyBalance.RecipeTier.Lab,EconomyBalance.RecipeTier.Axiom,EconomyBalance.RecipeTier.Apex})Assert.That(EconomyBalance.RecipeTargetSeconds(tier)/86400,Is.InRange(6.9,14.01));
        }
        [Test]public void ScannerLearningIntegralAgreesWithDiscreteCompletionsAndStaysBounded()
        {
            foreach(double power in new[]{1d,2d,4d})foreach(int start in new[]{0,25,200,250,1000000}){
                double discrete=Enumerable.Range(0,1000).Sum(i=>1/(1+ItemV3Balance.Get("scanner.perAnalysis")*power*EconomyBalance.ScannerLearning(start+i)));
                double integral=MaterialEffort.ScannerTime(start,1000,power);Assert.That(integral/discrete,Is.InRange(.99,1.00001));
            }
            Assert.AreEqual(EconomyBalance.ScannerLearning(250),EconomyBalance.ScannerLearning(1000000000));
        }
        [Test]public void VeryHighValidTrainingDoesNotOverflowProductionOrDiscardCounters()
        {
            var s=Game.NewV3(1000,"extreme-training");s.Hardware[0]=1;s.Quality=s.Efficiency=int.MaxValue;
            var item=new ItemInstance{id="distillation",type="distillation-module",rarity=5,level=69,forge=20};s.Workshop.inventory=new[]{item};s.Workshop.equipped[1]=item.id;
            var rates=Game.ViewRates(s);Assert.Greater(rates.Income.Exponent,300);Assert.Greater(rates.Data.Exponent,300);
            s.ItemSystemV3.scannerAnalyses=1000000;Assert.AreEqual(1000000,s.ItemSystemV3.scannerAnalyses);Assert.AreEqual(100,EconomyBalance.ScannerLearning(s.ItemSystemV3.scannerAnalyses));
            var sources=EconomyBalance.RecipeSources("singularity-lens");sources[0].PerSecond[0]=-100;Assert.GreaterOrEqual(EconomyBalance.RecipeSources("singularity-lens")[0].PerSecond[0],0);
        }
        [Test]public void PricesCannotFollowPlayerWalletOrOwnedBonuses()
        {
            var s=Game.NewV3(1000,"stable-price");var a=Workshop.Quote(s,"singularity-lens").Components;
            s.Data=ScientificNumber.Parse("1e200");s.Prestige.Cycle=ScientificNumber.Parse("1e100");s.Hardware[0]=1000000;s.Research[Game.ResearchIndex("labAutomation")]=100;
            CollectionAssert.AreEqual(a,Workshop.Quote(s,"singularity-lens").Components);
        }
        [Test]public void GeometricHardwareBatchesAndMarginalCostsAgreeAtLargeCounts()
        {
            var s=Game.NewV3(1000,"geometric-price");foreach(int h in new[]{0,5,14})foreach(long owned in new[]{0L,25L,1000L}){
                s.Hardware[h]=owned;var bulk=Game.HardwareCost(s,h,10);var sum=ScientificNumber.Zero;
                for(int i=0;i<10;i++){s.Hardware[h]=owned+i;sum=sum.Add(Game.HardwareCost(s,h));}s.Hardware[h]=owned;
                Assert.That(bulk.Divide(sum).ToDouble(),Is.EqualTo(1).Within(1e-10));
                var previous=Game.HardwareCost(s,h);s.Hardware[h]=owned+1;Assert.That(Game.HardwareCost(s,h).Divide(previous).ToDouble(),Is.EqualTo(Balance.Hardware[h].Growth).Within(1e-10));
            }
        }
    }
}
