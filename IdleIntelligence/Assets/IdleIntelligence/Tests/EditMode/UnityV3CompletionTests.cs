using System;
using System.IO;
using System.Linq;
using NUnit.Framework;
using IdleIntelligence.Core;
using IdleIntelligence.Runtime;

namespace IdleIntelligence.Tests
{
    public sealed class UnityV3CompletionTests
    {
        static ItemInstance Item(string type)=>new ItemInstance{id="prepared-"+type,type=type,rarity=0,level=1};
        static GameState Equipped(params string[] types)
        {
            var s=UnityV3Migration.Upgrade(Game.New(1000,"unity-v3-tests"));
            s.Workshop.inventory=types.Select(Item).ToArray();
            foreach(var item in s.Workshop.inventory){
                int slot=Array.FindIndex(ItemBalance.Slots,x=>x==Workshop.Definition(item).Family);
                if(!string.IsNullOrEmpty(s.Workshop.equipped[slot])){
                    s.Workshop.nodes=s.Workshop.nodes.Concat(new[]{"W01","W02","W06"}).Distinct().ToArray();
                    slot=Array.FindIndex(ItemBalance.Slots,x=>x==Workshop.Definition(item).Family+"Aux");
                }
                s.Workshop.equipped[slot]=item.id;
            }
            Game.Validate(s);
            return s;
        }
        [Test]public void FixedUnityCatalogHas42PreservedOldOrdinalsAndSixUniquePortraitNames()
        {
            Assert.That(ItemBalance.Items.Length,Is.EqualTo(42));
            Assert.That(UnityV3Catalog.AddedIds.Distinct().Count(),Is.EqualTo(6));
            for(int i=0;i<6;i++){
                string id=UnityV3Catalog.AddedIds[i];
                Assert.That(Workshop.Index(id),Is.EqualTo(36+i));
                Assert.That(UnityV3PixelArt.Get(id),Is.Not.Null);
                Assert.That(UnityV3PixelArt.Get(id).rect.width,Is.EqualTo(32));
            }
        }
        [Test]public void Old36SaveArraysAreExpandedWithNoOwnershipGrantOrLoss()
        {
            var s=Game.New(1000);var w=s.Workshop;
            Array.Resize(ref w.learned,36);Array.Resize(ref w.knownBlueprints,36);
            Array.Resize(ref w.mastery,36);Array.Resize(ref w.crafted,36);
            w.learned[7]=true;w.knownBlueprints[29]=true;w.mastery[12]=3;w.crafted[0]=91;
            UnityV3Migration.ExpandWorkshopArrays(w);
            Assert.That(w.learned.Length,Is.EqualTo(42));
            Assert.That(w.learned[7],Is.True);
            Assert.That(w.knownBlueprints[29],Is.True);
            Assert.That(w.mastery[12],Is.EqualTo(3));
            Assert.That(w.crafted[0],Is.EqualTo(91));
            Assert.That(w.learned.Skip(36).Any(x=>x),Is.False);
            Game.Validate(s);
        }
        [Test]public void RealPaidCapacitorCompletionCannotChargeTwice()
        {
            var s=Equipped("overdrive-capacitor");
            var job=new Job{key="v3-research-17",id="blueprints",required=100,done=100,
                paidDataRecorded=true,identityRecorded=true,researchStartVersion=3};
            ItemSystemV3.CompleteCapacitorResearch(s,job);
            Assert.That(s.Charge,Is.EqualTo(2));
            ItemSystemV3.CompleteCapacitorResearch(s,job);
            Assert.That(s.Charge,Is.EqualTo(2));
            var saved=UnityV3SaveData.From(s.ItemSystemV3).ToState();
            s.ItemSystemV3=saved;ItemSystemV3.CompleteCapacitorResearch(s,job);
            Assert.That(s.Charge,Is.EqualTo(2));
        }
        [Test]public void GradientCreditsOnlyTimeWorkedWhileEquippedAndConsumesOnce()
        {
            var s=Equipped("gradient-buffer");
            s.Training=new Job{id="quality",key="v3-training-1",required=200,done=0};
            ItemSystemV3.RecordGradientWork(s,100);
            ItemSystemV3.FinishGradientTraining(s,s.Training);
            Assert.That(s.ItemSystemV3.gradientStoredWork,Is.EqualTo(10).Within(1e-7));
            s.Training=new Job{id="efficiency",key="v3-training-2",required=8};
            ItemSystemV3.ApplyGradientStart(s);
            Assert.That(s.Training.done,Is.EqualTo(4).Within(1e-7));
            Assert.That(s.ItemSystemV3.gradientStoredWork,Is.EqualTo(0));
            ItemSystemV3.ApplyGradientStart(s);
            Assert.That(s.Training.done,Is.EqualTo(4).Within(1e-7));
        }
        [Test]public void AxiomMemoryTwoStagesDoNotStack()
        {
            var before=Equipped("axiom-anchor","axiom-lattice","cycle-observatory");
            var after=before.Copy();after.Meta.resets=1;
            ItemSystemV3.CaptureAxiomAnchor(before,after);
            Assert.That(ItemSystemV3.AxiomAnchorFactor(after),Is.EqualTo(10));
            Assert.That(ItemSystemV3.AxiomAnchorBoundary(after),Is.EqualTo(900));
            ItemSystemV3.RecordProduction(after,900,ScientificNumber.Zero,ScientificNumber.Zero);
            Assert.That(ItemSystemV3.AxiomAnchorFactor(after),Is.EqualTo(3));
            Assert.That(ItemSystemV3.AxiomAnchorBoundary(after),Is.EqualTo(900));
            ItemSystemV3.RecordProduction(after,900,ScientificNumber.Zero,ScientificNumber.Zero);
            Assert.That(ItemSystemV3.AxiomAnchorFactor(after),Is.EqualTo(1));
        }
        [Test]public void OldV24SaveMissingV3OnlyFieldsLoadsWithOriginalOwnership()
        {
            string dir=Path.Combine(Path.GetTempPath(),"unity-old-v24-"+Guid.NewGuid().ToString("N"));
            Directory.CreateDirectory(dir);
            try {
                string file=Path.Combine(dir,"save.json");
                var state=Game.New(1000,"old-v24-compatibility");
                state.Workshop.learned[0]=true;
                var data=StateData.From(state);
                string payload=UnityEngine.JsonUtility.ToJson(data);
                // Construct a true v24-style schema, without the newly introduced
                // V3 receipt fields. The old schema did not serialize these values.
                payload=System.Text.RegularExpressions.Regex.Replace(
                    payload,"(,?\\\"itemV3Recorded\\\":false|,?\\\"itemV3\\\":null)","");
                using(var sha=System.Security.Cryptography.SHA256.Create()){
                    byte[] hash=sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(payload));
                    string digest=BitConverter.ToString(hash).Replace("-","").ToLowerInvariant();
                    File.WriteAllText(file,UnityEngine.JsonUtility.ToJson(new SaveEnvelope{
                        format=AtomicSaveStore.Format,version=24,payload=payload,sha256=digest}));
                }
                var loaded=new AtomicSaveStore(file,new UnitySaveCodec()).Load(1000);
                Assert.That(loaded.Writable,Is.True);
                Assert.That(loaded.State.ItemSystemV3,Is.Null);
                Assert.That(loaded.State.Workshop.learned.Length,Is.EqualTo(42));
                Assert.That(loaded.State.Workshop.learned[0],Is.True);
                Assert.That(Directory.GetFiles(dir,"*.v24-original-*").Length,Is.EqualTo(1));
            }finally{Directory.Delete(dir,true);}
        }
        [Test]public void VersionedUnitySavePreservesV3CountersOnReload()
        {
            string dir=Path.Combine(Path.GetTempPath(),"unity-v3-"+Guid.NewGuid().ToString("N"));
            Directory.CreateDirectory(dir);
            try{
                string file=Path.Combine(dir,"save.json");var store=new AtomicSaveStore(file,new UnitySaveCodec());
                var first=store.Load(1000);Assert.That(first.Writable,Is.True);
                var s=Equipped("gradient-buffer");s.ItemSystemV3.gradientLastRequirement=200;
                s.ItemSystemV3.gradientStoredWork=10;
                store.Save(s);var reloaded=new AtomicSaveStore(file,new UnitySaveCodec()).Load(1000);
                Assert.That(reloaded.Writable,Is.True);
                Assert.That(reloaded.State.ItemSystemV3,Is.Not.Null);
                Assert.That(reloaded.State.ItemSystemV3.gradientStoredWork,Is.EqualTo(10));
                Assert.That(reloaded.State.Workshop.inventory.Single().type,Is.EqualTo("gradient-buffer"));
                Assert.That(reloaded.State.Workshop.learned.Length,Is.EqualTo(42));
            }finally{Directory.Delete(dir,true);}
        }
    }
}
