using System;
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
                CollectionAssert.AreEqual(d.Components[0],q.Components,d.Id);
            }
            Assert.AreEqual(100,EconomyBalance.CraftData(false,100,-1));
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
