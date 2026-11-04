using System;
using System.Linq;
using IdleIntelligence.Core;
using NUnit.Framework;
namespace IdleIntelligence.Tests
{
    public sealed class EconomyBalanceTests
    {
        [Test] public void ResearchPricesIncreaseWithoutChangingLegacyQuotes()
        {
            var s=Game.NewV3(1000,"balance-contract",true);
            int i=Game.ResearchIndex("blueprints");
            Assert.AreEqual(1200,Game.ResearchCost(s,i).ToDouble());
            Assert.AreEqual(1,EconomyBalance.ResearchFactor(false,20).ToDouble());
            Assert.Greater(EconomyBalance.ResearchFactor(true,10).ToDouble(),16);
            Assert.AreEqual(4,EconomyBalance.ResearchFactor(true,0).ToDouble());
            Assert.Greater(EconomyBalance.ResearchFactor(true,10000).CompareTo(ScientificNumber.Parse("1e600")),0);
        }
        [Test] public void StarterRecipesStayAffordableAndOtherRecipesCostSixTimesMore()
        {
            var s=Game.NewV3(1000,"balance-contract",true);
            foreach(var d in ItemBalance.Items)
            {
                var q=Workshop.Quote(s,d.Id);
                Assert.AreEqual(d.Data*(d.Starter>=0&&d.Starter<3?1:6),q.Data,d.Id);
                if(d.Starter>=0)CollectionAssert.AreEqual(d.Components[0],q.Components,d.Id);
            }
            Assert.AreEqual(100,EconomyBalance.CraftData(false,100,-1));
        }
        [Test] public void MaterialRecipesAreBoundedGrindableAndDoNotMutateTheCatalog()
        {
            var s=Game.NewV3(1000,"recipe-balance",true);
            foreach(var d in ItemBalance.Items){
                var original=(double[])d.Components[0].Clone();var quote=Workshop.Quote(s,d.Id);
                CollectionAssert.AreEqual(original,d.Components[0],d.Id+" immutable catalog");
                CollectionAssert.AreEqual(original,EconomyBalance.CraftComponents(false,d,0),d.Id+" legacy");
                Assert.LessOrEqual(quote.Components.Count(v=>v>0),5,d.Id);
                Assert.IsTrue(quote.Components.All(v=>v>=0&&v==Math.Ceiling(v)),d.Id);
                if(d.Starter>=0)continue;
                Assert.GreaterOrEqual(quote.Components.Count(v=>v>0),4,d.Id);
                Assert.Greater(quote.Components.Sum(),original.Sum()*3,d.Id+" meaningful grind increase");
                int oldFamily=Enumerable.Range(0,original.Length).Where(c=>original[c]>0).Max(MaterialAnalysis.Family);
                Assert.IsTrue(Enumerable.Range(0,original.Length).Where(c=>quote.Components[c]>0).All(c=>MaterialAnalysis.Family(c)<=oldFamily),d.Id+" no later material family");
                var mastered=EconomyBalance.CraftComponents(true,d,4);
                for(int c=0;c<mastered.Length;c++)Assert.That(mastered[c],Is.EqualTo(Math.Ceiling(quote.Components[c]*.8)),d.Id+" mastery");
            }
        }
        [Test] public void FiveComponentCraftAndBatchAreAtomicForEveryMissingIngredient()
        {
            var s=Game.NewV3(1000,"five-input-payment",true);const string id="singularity-lens";
            s.Meta.resets=3;s.Research[Game.ResearchIndex("blueprints")]=1;s.Workshop.learned[Workshop.Index(id)]=true;s.Workshop.nodes=new[]{"W07"};
            s.Data=ScientificNumber.Parse("1e15");s.Workshop.modules=Enumerable.Repeat(1000000L,s.Workshop.modules.Length).ToArray();
            s.Workshop.components=Enumerable.Repeat(1000000000L,s.Workshop.components.Length).ToArray();
            var single=Workshop.Quote(s,id);var batch=Workshop.BatchQuote(s,id,3);Assert.IsTrue(batch.Allowed);Assert.AreEqual(5,single.Components.Count(v=>v>0));
            for(int c=0;c<single.Components.Length;c++)if(single.Components[c]>0){
                var missing=s.Copy();missing.Workshop.components[c]=(long)single.Components[c]-1;Assert.AreSame(missing,Workshop.Craft(missing,id),"missing ingredient "+c);
                missing.Workshop.components[c]=(long)batch.Components[c]-1;Assert.AreSame(missing,Workshop.CraftBatch(missing,id,3),"batch missing ingredient "+c);
            }
            var made=Workshop.CraftBatch(s,id,3);Assert.AreEqual(3,made.Workshop.inventory.Length);
            for(int c=0;c<single.Components.Length;c++){Assert.AreEqual(s.Workshop.components[c]-batch.Components[c],made.Workshop.components[c]);Assert.AreEqual(single.Components[c],made.Workshop.inventory[0].materialBasis[c]);}
            Assert.AreEqual(1000000000,s.Workshop.components[9],"input remains pure");Assert.DoesNotThrow(()=>Game.Validate(made));
        }
        [Test] public void ResearchDebitsExactlyItsQuoteAndRecordsThePaidReceipt()
        {
            var s=Game.NewV3(1000,"balance-research-payment",true);
            s=NarrativeBridge.Action(s,"skip-tutorial");s.ResearchUsed=true;
            var price=Game.ResearchCost(s,Game.ResearchIndex("dataGeneration"));
            s.Data=price.Subtract(ScientificNumber.One);
            Assert.AreSame(s,Game.Research(s,"dataGeneration"));
            s.Data=price;var started=Game.Research(s,"dataGeneration");
            Assert.AreNotSame(s,started);Assert.IsTrue(started.Data.IsZero);
            Assert.AreEqual(0,ScientificNumber.FromData(started.ResearchJob.paidData).CompareTo(price));
            Assert.AreSame(started,Game.Research(started,"dataGeneration"));
            Assert.AreEqual(0,s.Data.CompareTo(price));
            Assert.DoesNotThrow(()=>Game.Validate(started));
        }
        [Test] public void TutorialResearchRemainsFree()
        {
            var s=Game.NewV3(1000,"balance-tutorial",true);
            s.Story.legacyIntro=false;s.Story.tutorial="active";s.Story.target="research";
            Assert.IsTrue(Game.IntroResearch(s));
            Assert.IsTrue(Game.ResearchCost(s,Game.ResearchIndex("dataGeneration")).IsZero);
        }
        [Test] public void CraftDebitsTheDisplayedPriceAndPreservesPaidMaterialBasis()
        {
            var s=Game.NewV3(1000,"balance-payment",true);
            const string id="neural-asic";int n=Workshop.Index(id);
            s.Research[Game.ResearchIndex("blueprints")]=1;s.Workshop.learned[n]=true;
            for(int c=0;c<s.Workshop.components.Length;c++)s.Workshop.components[c]=100000;
            for(int c=0;c<s.Workshop.modules.Length;c++)s.Workshop.modules[c]=100000;
            var q=Workshop.Quote(s,id);s.Data=ScientificNumber.From(q.Data-1);
            Assert.AreSame(s,Workshop.Craft(s,id));
            s.Data=ScientificNumber.From(q.Data);var made=Workshop.Craft(s,id);
            Assert.AreNotSame(s,made);Assert.IsTrue(made.Data.IsZero);
            Assert.AreEqual(1,made.Workshop.inventory.Length);
            CollectionAssert.AreEqual(q.Components,made.Workshop.inventory[0].materialBasis);
            Assert.AreEqual(q.Data,s.Data.ToDouble());
        }
        [Test] public void UpgradePriceDoesNotRevalueExistingPaidMaterials()
        {
            var s=Game.NewV3(1000,"balance-contract",true);
            var item=new ItemInstance{id="owned",type="impulse-relay",materialBasis=new double[ItemBalance.ComponentIds.Length]};
            item.materialBasis[0]=12;
            var q=Workshop.UpgradeQuote(s,item);
            Assert.AreEqual(400,q.Data);
            Assert.AreEqual(12,item.materialBasis[0]);
            Assert.AreEqual(1,item.level);
            Assert.AreEqual(1,EconomyBalance.UpgradeFactor(false));
        }
    }
}
