using System;
using System.Linq;
using IdleIntelligence.Core;
class Smoke
{
    static void Check(bool value,string detail){if(!value)throw new Exception("Unity V3 native: "+detail);}
    static ItemInstance Item(string id,int rarity=0)=>new ItemInstance {id="test-"+id,type=id,rarity=rarity,level=1,forge=0};
    static GameState Prepared(string item)
    {
        var s=UnityV3Migration.Upgrade(Game.New(1000,"unity-v3-smoke"));
        var i=Item(item);s.Workshop.inventory=new[]{i};
        s.Workshop.equipped[Array.IndexOf(ItemBalance.Slots,ItemBalance.Items[Workshop.Index(item)].Family)]=i.id;
        Game.Validate(s);
        return s;
    }
    public static void Main()
    {
        Check(ItemBalance.Items.Length==42,"42 fixed native item entries");
        Check(ItemBalance.OriginalRecipeData.Length==42,"42 native recipe data costs");
        Check(UnityV3Catalog.AddedIds.All(id=>Workshop.Index(id)>=36),"stable 36 original ordinals");
        var old=Game.New(1000,"36-array-migration");
        var w=old.Workshop;
        Array.Resize(ref w.learned,36);Array.Resize(ref w.knownBlueprints,36);
        Array.Resize(ref w.mastery,36);Array.Resize(ref w.crafted,36);
        w.learned[1]=true;w.knownBlueprints[12]=true;w.mastery[3]=4;w.crafted[10]=11;
        UnityV3Migration.ExpandWorkshopArrays(w);
        Check(w.learned.Length==42&&w.learned[1]&&w.knownBlueprints[12]&&w.mastery[3]==4&&w.crafted[10]==11,"lossless old owner arrays");
        Game.Validate(old);

        var gradient=Prepared("gradient-buffer");
        gradient.Training=new Job{id="quality",key="v3-training-1",required=200,done=100};
        ItemSystemV3.RecordGradientWork(gradient,100);
        ItemSystemV3.FinishGradientTraining(gradient,gradient.Training);
        Check(Math.Abs(gradient.ItemSystemV3.gradientStoredWork-10)<1e-7,"gradient work accrual");
        gradient.Training=new Job{id="efficiency",key="v3-training-2",required=100};
        ItemSystemV3.ApplyGradientStart(gradient);
        Check(Math.Abs(gradient.Training.done-10)<1e-7&&gradient.ItemSystemV3.gradientStoredWork==0,"gradient consumed exactly once");

        var capacitor=Prepared("overdrive-capacitor");
        var research=new Job{id="blueprints",key="paid-research-1",identityRecorded=true,paidDataRecorded=true,
            researchStartVersion=3,required=100,done=100};
        ItemSystemV3.CompleteCapacitorResearch(capacitor,research);
        Check(capacitor.Charge==2,"paid research grants charge");
        ItemSystemV3.CompleteCapacitorResearch(capacitor,research);
        Check(capacitor.Charge==2,"same research receipt cannot double charge");

        var before=Prepared("axiom-anchor");var after=before.Copy();after.Meta.resets=1;
        ItemSystemV3.CaptureAxiomAnchor(before,after);
        Check(ItemSystemV3.AxiomAnchorFactor(after)>1&&
            Math.Abs(ItemSystemV3.AxiomAnchorBoundary(after)-1800)<1e-7,"axiom anchor captured");
        ItemSystemV3.RecordProduction(after,120,ScientificNumber.Zero,ScientificNumber.Zero);
        Check(Math.Abs(ItemSystemV3.AxiomAnchorBoundary(after)-1680)<1e-7,"anchor time consumed only by credited production");

        var fleet=Prepared("fleet-coordinator");fleet.Hardware[0]=100;fleet.Hardware[1]=101;
        var factor=ItemSystemV3.FleetFactor(fleet,fleet.Workshop.inventory[0]).ToDouble();
        Check(Math.Abs(factor-2.6)<1e-7,"fleet counts only current 100-unit classes");
        var save=UnityV3SaveData.From(after.ItemSystemV3).ToState();
        Check(Math.Abs(save.axiomAnchorSeconds-after.ItemSystemV3.axiomAnchorSeconds)<1e-7,"V3 save receipts roundtrip");
        var gameData=StateData.From(after);
        var actual=gameData.ToState();
        Check(actual.ItemSystemV3!=null&&
            Math.Abs(actual.ItemSystemV3.axiomAnchorSeconds-after.ItemSystemV3.axiomAnchorSeconds)<1e-7,
            "Unity native MainStateData V3 encoding roundtrip");
        Check(actual.Workshop.inventory.Length==after.Workshop.inventory.Length,
            "inventory retained across native DTO boundary");

        var oldChallenge=Game.New(2000,"v3-challenge-old-main");
        var oldMain=Game.New(1000,"v3-challenge-old-main");
        Array.Resize(ref oldChallenge.Workshop.learned,36);
        Array.Resize(ref oldChallenge.Workshop.knownBlueprints,36);
        Array.Resize(ref oldChallenge.Workshop.mastery,36);
        Array.Resize(ref oldChallenge.Workshop.crafted,36);
        Array.Resize(ref oldMain.Workshop.learned,36);
        Array.Resize(ref oldMain.Workshop.knownBlueprints,36);
        Array.Resize(ref oldMain.Workshop.mastery,36);
        Array.Resize(ref oldMain.Workshop.crafted,36);
        oldMain.Workshop.learned[1]=true;
        oldChallenge.Challenges.Main=oldMain;
        var converted=UnityV3Migration.Upgrade(oldChallenge);
        Check(converted.ItemSystemV3!=null&&converted.Challenges.Main.ItemSystemV3!=null,
            "challenge state and archived main both carry V3 ledgers");
        Check(converted.Challenges.Main.Workshop.learned[1]&&converted.Challenges.Main.Workshop.learned.Length==42,
            "legacy main blueprint rights preserved");
        Check(oldMain.ItemSystemV3==null&&oldMain.Workshop.learned.Length==36,
            "original challenge main unchanged");
        Console.WriteLine("UNITY NATIVE V3 CORE SMOKE OK");
    }
}
