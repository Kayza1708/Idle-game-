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
        [Test]public void UnityJsonV2RoundTripDoesNotInventUnmarkedNativeV3()
        {
            // Regression: Unity JsonUtility converts a null custom class into a
            // default object. Most historical V2 parity/save tests must remain
            // valid without granting any V3 state.
            var source=Game.New(1000,"unity-v2-null-v3",true);
            var codec=new UnitySaveCodec();
            var json=codec.Encode(StateData.From(source));
            var decoded=codec.Decode(json);
            Assert.That(decoded.itemV3Recorded,Is.False);
            Assert.That(decoded.itemV3,Is.Null,
                "A serializer placeholder is not a paid native V3 payload");
            var loaded=decoded.ToState();
            Assert.That(loaded.ItemSystemV3,Is.Null);
            Assert.That(loaded.Credits.CompareTo(source.Credits),Is.EqualTo(0));

            // Same rule applies to an independently serialized challenge main.
            var snapshot=StateData.From(source);
            snapshot.hasChallenge=true;
            snapshot.challengeMain=MainStateData.FromMain(source);
            var withChallenge=codec.Decode(codec.Encode(snapshot));
            Assert.That(withChallenge.itemV3,Is.Null);
            Assert.That(withChallenge.challengeMain.itemV3,Is.Null);
        }
        [Test]public void UnityJsonRejectsRealUnmarkedNativeV3InjectedIntoLegacyState()
        {
            var source=Game.New(1000,"unmarked-v3-rejected",true);
            var injected=StateData.From(source);
            injected.itemV3=UnityV3SaveData.From(
                Game.NewV3(1000,"native-v3-snapshot",true).ItemSystemV3);
            Assert.That(injected.itemV3Recorded,Is.False);
            var codec=new UnitySaveCodec();
            string payload=codec.Encode(injected);
            Assert.Throws<FormatException>(()=>codec.Decode(payload),
                "V3 data must never be silently accepted or discarded without an explicit marker");
        }
        [Test]public void FreshUnityV3EditorSaveCanReloadAdvanceOfflineAndSaveAgain()
        {
            string dir=Path.Combine(Path.GetTempPath(),"unity-v3-first-boot-"+Guid.NewGuid().ToString("N"));
            Directory.CreateDirectory(dir);
            try {
                string file=Path.Combine(dir,"idle-intelligence-unity-v3.json");
                var store=new AtomicSaveStore(file,new UnitySaveCodec(),freshV3:true);
                var initial=store.Load(1000);
                Assert.That(initial.Writable,Is.True,initial.Message);
                Assert.That(ItemSystemV3.Enabled(initial.State),Is.True);
                Assert.That(initial.State.Credits.CompareTo(ScientificNumber.From(50)),Is.EqualTo(0));
                store.Save(initial.State);
                var reopened=new AtomicSaveStore(file,new UnitySaveCodec(),freshV3:true);
                var loaded=reopened.Load(1000);
                Assert.That(loaded.Writable,Is.True,loaded.Message);
                var after=Game.AdvanceMeasured(loaded.State,loaded.State.SavedAt+60000).State;
                Assert.DoesNotThrow(()=>Game.Validate(after));
                Assert.DoesNotThrow(()=>reopened.Save(after));
                var finished=new AtomicSaveStore(file,new UnitySaveCodec(),freshV3:true).Load(61000);
                Assert.That(finished.Writable,Is.True,finished.Message);
                Assert.That(finished.State.ItemSystemV3.synthesisContract,Is.Null);
                Assert.That(finished.State.ItemSystemV3.synthesisRemainders.Length,
                    Is.EqualTo(ItemBalance.ComponentIds.Length));
            } finally {Directory.Delete(dir,true);}
        }
        [Test]public void UnityJsonDoesNotTurnMissingPaidReceiptsIntoActiveContracts()
        {
            var s=Game.NewV3(1000,"unity-json-null-receipts",true);
            var wire=UnityV3SaveData.From(s.ItemSystemV3);
            var encoded=UnityEngine.JsonUtility.ToJson(wire);
            var decoded=UnityEngine.JsonUtility.FromJson<UnityV3SaveData>(encoded);
            var state=decoded.ToState();
            Assert.That(state.synthesisContract,Is.Null);
            Assert.That(state.overdrive,Is.Null);
            s.ItemSystemV3=state;
            Assert.DoesNotThrow(()=>Game.Validate(s));

            // A real paid receipt must not be dropped to work around a null
            // Unity JsonUtility placeholder.
            string component=ItemBalance.ComponentIds[0];
            s.Industry.synthesis=new Job{id=component,key="synthesis-1",required=10};
            s.Industry.hasSynthesis=true;
            s.ItemSystemV3.synthesisContract=new ItemV3Synthesis{
                id="synthesis-1",component=component,multiplier=1.5};
            var active=UnityEngine.JsonUtility.FromJson<UnityV3SaveData>(
                UnityEngine.JsonUtility.ToJson(UnityV3SaveData.From(s.ItemSystemV3))).ToState();
            Assert.That(active.synthesisContract,Is.Not.Null);
            Assert.That(active.synthesisContract.id,Is.EqualTo("synthesis-1"));
            Assert.That(active.synthesisContract.multiplier,Is.EqualTo(1.5));
            s.ItemSystemV3=active;
            Assert.DoesNotThrow(()=>Game.Validate(s));

            var altered=UnityV3SaveData.From(s.ItemSystemV3);
            altered.hasSynthesisContract=false;
            Assert.Throws<FormatException>(()=>{altered.ToState();},
                "Conflicting presence flag must not silently erase a paid receipt.");
        }
        [Test]public void OlderV25ReceiptFieldsRemainReadableWithoutInventedOwnership()
        {
            var state=Game.NewV3(1000,"older-v25-compatibility",true);
            var codec=new UnitySaveCodec();
            string payload=codec.Encode(StateData.From(state));
            payload=System.Text.RegularExpressions.Regex.Replace(payload,
                ",?\\\"receiptPresenceRecorded\\\":(?:true|false)|,?\\\"hasSynthesisContract\\\":(?:true|false)|,?\\\"hasOverdrive\\\":(?:true|false)","");
            var decoded=codec.Decode(payload,25).ToState();
            Assert.That(decoded.ItemSystemV3,Is.Not.Null);
            Assert.That(decoded.ItemSystemV3.synthesisContract,Is.Null);
            Assert.That(decoded.ItemSystemV3.overdrive,Is.Null);
            Assert.DoesNotThrow(()=>Game.Validate(decoded));
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
