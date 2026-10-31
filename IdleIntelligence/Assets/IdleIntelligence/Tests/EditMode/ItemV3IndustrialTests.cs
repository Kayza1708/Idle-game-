using System;
using NUnit.Framework;
using IdleIntelligence.Core;

namespace IdleIntelligence.Tests
{
    /** Isolated arithmetic until the six remaining item IDs have actual recipes.
     * Passing this is not native catalogue, persistence or player acceptance. */
    public sealed class ItemV3IndustrialTests
    {
        static ItemInstance Item(string type)
        {
            return new ItemInstance { id="prepared-"+type, type=type, rarity=0, level=1, forge=0 };
        }
        static GameState Prepared()
        {
            var s=Game.New(1000,"v3-industrial-arithmetic");
            s.ItemSystemV3=new ItemV3State();
            s.Hardware[0]=100;
            s.Hardware[1]=101;
            s.Hardware[2]=99;
            return s;
        }
        [Test] public void FleetUsesOnlyCurrentHundredUnitHardwareClasses()
        {
            var s=Prepared();
            Assert.That(ItemSystemV3.FleetFactor(s,Item("fleet-coordinator")).ToDouble(),
                Is.EqualTo(2*(1+.15*2)).Within(1e-10));
            s.Hardware[1]=99;
            Assert.That(ItemSystemV3.FleetFactor(s,Item("fleet-coordinator")).ToDouble(),
                Is.EqualTo(2*(1+.15)).Within(1e-10));
        }
        [Test] public void SynthesisCoordinatorUsesOnlyDocumentedProductionK()
        {
            var s=Prepared();
            var item=Item("synthesis-coordinator");
            Assert.That(ItemSystemV3.SynthesisCoordinatorFactor(s,item),Is.EqualTo(2).Within(1e-10));
            s.ItemSystemV3.componentsProduced=ScientificNumber.From(9999);
            Assert.That(ItemSystemV3.SynthesisCoordinatorFactor(s,item),
                Is.EqualTo(2*Math.Sqrt(2)).Within(1e-10));
            // Unregistered future item must not accidentally affect an ordinary game.
            Assert.That(ItemSystemV3.SynthesisWorkFactor(s),Is.EqualTo(1));
        }
        [Test] public void LensUsesRawHardwareAndOnlyIndustrialTrioBoostsItsExponent()
        {
            var s=Prepared();
            var lens=Item("singularity-lens");
            s.Meta.resets=3;
            var raw=ItemSystemV3.RawHardwareCompute(s);
            double expected=Math.Pow(Math.Max(1,raw.ToDouble()),.02);
            Assert.That(ItemSystemV3.SingularityLensFactor(s,lens,false).ToDouble(),
                Is.EqualTo(expected).Within(1e-8));
            Assert.That(ItemSystemV3.SingularityLensFactor(s,lens,true).ToDouble(),
                Is.EqualTo(Math.Pow(Math.Max(1,raw.ToDouble()),.03)).Within(1e-8));
        }
    }
}
