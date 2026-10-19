using System;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using IdleIntelligence.Core;
using IdleIntelligence.Runtime;
using NUnit.Framework;
using UnityEngine;
namespace IdleIntelligence.Tests
{
    [Serializable]public sealed class ItemWire
    {
        public string lastTrack,lastArea;public double[] hardwareRemainders;public string[] milestones;public ItemInstance[] inventory;public long[] components,modules;public bool[] learned;public int[] mastery,crafted;public string[] equipped,nodes,permanentSlots;public long fragments,nextId;public bool starterGift;public string activeModel;public int activeModelLevel,integration,qualityCompletions,efficiencyCompletions;public double runStartedAt,passiveProgress;public uint materialRng;
        public WorkshopState ToWorkshop()=>new WorkshopState{lastTrack=lastTrack,lastArea=lastArea,hardwareRemainders=hardwareRemainders,milestones=milestones,inventory=inventory,components=components,modules=modules,learned=learned,mastery=mastery,crafted=crafted,equipped=equipped,fragments=fragments,nextId=nextId,starterGift=starterGift,nodes=nodes,permanentSlots=permanentSlots,activeModel=activeModel,activeModelLevel=activeModelLevel,integration=integration,qualityCompletions=qualityCompletions,efficiencyCompletions=efficiencyCompletions,runStartedAt=runStartedAt,materialRng=materialRng,passiveProgress=passiveProgress};
    }
    [Serializable]public sealed class ItemReference {public bool[] discovered;public string[] deviceRoles,comboIds;public double[] deviceBonuses,comboValues;public double savedAt,activeUntil;public string name,action,id,slot;public double at;public long amount;public int[] research;public string[] selection,slots;public ItemWire before,expected;public NumberData credits,data,expectedData,compute,income,dataRate;public long[] hardware;public bool researchBlueprints;public double trainingSpeed;public double[] bonuses;}
    [Serializable]public sealed class ItemReferences {public string sourceHash;public string[] itemIds;public ItemReference[] cases;}
    public sealed class ItemParityTests
    {
        public static ItemReferences Cases()=>JsonUtility.FromJson<ItemReferences>(File.ReadAllText(Path.Combine(Application.dataPath,"IdleIntelligence/Tests/EditMode/ItemReferenceCases.json")));
        public static GameState State(ItemReference c)
        {
            var s=Game.New(1000000);s.Workshop=c.before.ToWorkshop();s.Credits=ScientificNumber.FromData(c.credits);s.Data=ScientificNumber.FromData(c.data);s.SavedAt=c.savedAt;s.ActiveUntil=c.activeUntil;s.Hardware=c.hardware;s.Industry.discovered=c.discovered;s.Research=c.research;if(c.researchBlueprints)s.Research[Game.ResearchIndex("blueprints")]=1;return s;
        }
        [Test]public void AllItemTransactionsProfilesAndRaritiesMatchCurrentTypeScript()
        {
            var cases=Cases();Assert.That(cases.sourceHash,Is.EqualTo(ItemBalance.SourceHash));Assert.That(cases.itemIds.Length,Is.EqualTo(30));Assert.That(cases.cases.Length,Is.GreaterThan(250));
            foreach(var c in cases.cases)
            {
                var s=State(c);string original=JsonUtility.ToJson(StateData.From(s));GameState result=s;
                switch(c.action){case "module-complete":result=Workshop.StartModule(s,Array.FindIndex(ItemBalance.Modules,m=>m.Id==c.id));result=Game.Advance(result,c.at);break;case "hardware-buy":result=Game.Buy(s,c.id,c.amount);break;case "analysis-complete":result=MaterialAnalysis.Start(s,Array.FindIndex(ItemBalance.Analyses,a=>a.Id==c.id));while(result.SavedAt<c.at)result=Game.Advance(result,Math.Min(c.at,result.SavedAt+28800000));break;case "discover":result=Workshop.Discover(s);break;case "craft":result=Workshop.Craft(s,c.id);break;case "learn":result=Workshop.Learn(s,c.id);break;case "equip":result=Workshop.Equip(s,c.id,string.IsNullOrEmpty(c.slot)?null:c.slot);break;case "unequip":result=Workshop.Unequip(s,c.slot);break;case "fuse":result=Workshop.Fuse(s,c.selection);break;case "lock":result=Workshop.Lock(s,c.id);break;case "upgrade":result=Workshop.Upgrade(s,c.id);break;case "mastery":result=Workshop.Mastery(s,c.id,s.Workshop.mastery[Workshop.Index(c.id)]);break;}
                Assert.That(JsonUtility.ToJson(StateData.From(s)),Is.EqualTo(original),c.name+" purity");Compare(result.Workshop,c.expected,c.name);Near(result.Data,c.expectedData,c.name+" payment");
                Near(Game.Compute(result),c.compute,c.name+" compute");Near(Game.Income(result),c.income,c.name+" income");Near(Game.DataRate(result),c.dataRate,c.name+" data");Assert.That(Game.WorkSpeed(result),Is.EqualTo(c.trainingSpeed).Within(1e-9),c.name+" training");
                for(int k=0;k<c.deviceRoles.Length;k++)Assert.That(Workshop.Device(result,c.deviceRoles[k]),Is.EqualTo(c.deviceBonuses[k]).Within(1e-9),c.name+" device "+c.deviceRoles[k]);for(int k=0;k<c.comboIds.Length;k++)Assert.That(Workshop.Combination(result,c.comboIds[k]),Is.EqualTo(c.comboValues[k]).Within(1e-9),c.name+" combo "+c.comboIds[k]);
                var effects=new[]{"compute","credits","data","training","research","relay","tap","int-yield"};for(int n=0;n<effects.Length;n++)Assert.That(Workshop.Bonus(result,effects[n]),Is.EqualTo(c.bonuses[n]).Within(1e-9),c.name+" effect "+effects[n]);
                Assert.That(ItemBalance.Slots.Where((slot,i)=>Workshop.ActiveSlots(result)[i]).ToArray(),Is.EqualTo(c.slots),c.name+" slots");Game.Validate(result);
            }
        }
        static void Near(ScientificNumber a,NumberData b,string name){var expected=ScientificNumber.FromData(b);if(expected.IsZero)Assert.That(a.IsZero,Is.True,name);else Assert.That(a.Log10(),Is.EqualTo(expected.Log10()).Within(2e-11),name);}
        static void Compare(WorkshopState a,ItemWire b,string name)
        {
            Assert.That(a.hardwareRemainders,Is.EqualTo(b.hardwareRemainders).Within(1e-10),name+" hardware remainder");Assert.That(a.milestones,Is.EqualTo(b.milestones),name+" claimed milestones");Assert.That(a.components,Is.EqualTo(b.components),name+" components");Assert.That(a.modules,Is.EqualTo(b.modules),name+" modules");Assert.That(a.learned,Is.EqualTo(b.learned),name+" learned");Assert.That(a.mastery,Is.EqualTo(b.mastery),name+" mastery");Assert.That(a.crafted,Is.EqualTo(b.crafted),name+" crafted");Assert.That(a.equipped,Is.EqualTo(b.equipped),name+" equipped");Assert.That(a.fragments,Is.EqualTo(b.fragments),name+" fragments");Assert.That(a.nextId,Is.EqualTo(b.nextId),name+" IDs");Assert.That(a.starterGift,Is.EqualTo(b.starterGift),name+" gift");
            Assert.That(a.inventory.Length,Is.EqualTo(b.inventory.Length),name+" inventory count");for(int n=0;n<a.inventory.Length;n++){var i=a.inventory[n];var j=b.inventory[n];Assert.That(i.id,Is.EqualTo(j.id),name);Assert.That(i.type,Is.EqualTo(j.type),name);Assert.That(i.rarity,Is.EqualTo(j.rarity),name);Assert.That(i.level,Is.EqualTo(j.level),name);Assert.That(i.forge,Is.EqualTo(j.forge),name);Assert.That(i.locked,Is.EqualTo(j.locked),name);Assert.That(i.materialBasis,Is.EqualTo(j.materialBasis),name+" recovery basis");Assert.That(i.recoveryUsed,Is.EqualTo(j.recoveryUsed),name+" used recovery");}
        }
        [Test]public void ReplayedCraftTicketCannotPayOrGrantTwice()
        {var s=Workshop.Discover(Game.Buy(Game.New(1000),"calculator"));var q=Workshop.Quote(s,ItemBalance.Items.First(i=>i.Starter==0).Id);var next=Workshop.Craft(s,ItemBalance.Items.First(i=>i.Starter==0).Id,q.Revision);Assert.That(next,Is.Not.SameAs(s));Assert.That(Workshop.Craft(next,ItemBalance.Items.First(i=>i.Starter==0).Id,q.Revision),Is.SameAs(next));}
        [Test]public void ActiveAnalysisAndModuleResumeWithoutDoubleRewards()
        {
            var c=Cases().cases.First(x=>x.name=="complete-artifact-short");var s=State(c);s=MaterialAnalysis.Start(s,Array.FindIndex(ItemBalance.Analyses,a=>a.Id==c.id));s=Workshop.StartModule(s,0);s=Game.Advance(s,s.SavedAt+10000);
            var codec=new UnitySaveCodec();var restored=codec.Decode(codec.Encode(StateData.From(s))).ToState();var direct=Game.Advance(s,c.at);var resumed=Game.Advance(restored,c.at);Assert.That(JsonUtility.ToJson(StateData.From(resumed)),Is.EqualTo(JsonUtility.ToJson(StateData.From(direct))));Assert.That(Game.Advance(resumed,c.at),Is.SameAs(resumed));
        }
        [Test]public void CorruptAnalysisDrawOrderIsRejected()
        {
            var c=Cases().cases.First(x=>x.name=="complete-artifact-short");var s=MaterialAnalysis.Start(State(c),Array.FindIndex(ItemBalance.Analyses,a=>a.Id==c.id));s.Workshop.analysis.order=new[]{999};Assert.Throws<FormatException>(()=>Game.Validate(s));
        }
        [Test]public void ExistingVersionOneSaveMigratesWithOriginalFilePreserved()
        {
            string dir=Path.Combine(Path.GetTempPath(),"unity-v1-migration-"+Guid.NewGuid());Directory.CreateDirectory(dir);
            try{var codec=new UnitySaveCodec();string path=Path.Combine(dir,"save.json");var s=Game.Buy(Game.New(1000),"calculator");var dto=StateData.From(s);dto.research=dto.research.Take(5).ToArray();dto.workshop=null;string payload=codec.Encode(dto),hash;using(var sha=SHA256.Create())hash=BitConverter.ToString(sha.ComputeHash(Encoding.UTF8.GetBytes(payload))).Replace("-","").ToLowerInvariant();string original=codec.EncodeEnvelope(new SaveEnvelope{format=AtomicSaveStore.Format,version=1,payload=payload,sha256=hash});File.WriteAllText(path,original);
            var store=new AtomicSaveStore(path,codec);var loaded=store.Load(1000);Assert.That(loaded.Writable,Is.True,loaded.Message);Assert.That(loaded.State.Hardware[0],Is.EqualTo(1));Assert.That(loaded.State.Credits.CompareTo(s.Credits),Is.Zero);Assert.That(File.ReadAllText(Directory.GetFiles(dir,"*.v1-original-*").Single()),Is.EqualTo(original));store.Save(loaded.State);Assert.That(codec.DecodeEnvelope(File.ReadAllText(path)).version,Is.EqualTo(AtomicSaveStore.Version));Assert.That(File.ReadAllText(path+".backup"),Is.EqualTo(original));}
            finally{Directory.Delete(dir,true);}
        }
    }
}
