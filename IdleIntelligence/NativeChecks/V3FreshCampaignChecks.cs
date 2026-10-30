using System;
using System.Linq;
using IdleIntelligence.Core;
internal static class V3FreshCampaignChecks
{
    static void Check(bool yes,string message){if(!yes)throw new Exception("V3 FRESH NATIVE TEST: "+message);}
    public static void Run()
    {
        var s=Game.NewV3(1000,"fresh-all-catalog",true);
        Check(ItemSystemV3.Enabled(s)&&s.Workshop.inventory.Length==0,"new game starts native V3 without gifts");
        // Isolate recipe affordability from the natural economy. The player does
        // NOT receive any of these inputs; these are test-only paid-stock fixtures.
        s.Research[Game.ResearchIndex("blueprints")]=1;
        s.Industry.discovered[7]=true;
        s.Industry.families=Enumerable.Repeat(true,s.Industry.families.Length).ToArray();
        s.Workshop.nodes=new[]{"T06","F03"};
        s.Meta.resets=3;
        s.Data=ScientificNumber.From(1000000000d);
        for(int c=0;c<s.Workshop.components.Length;c++)s.Workshop.components[c]=1000000;
        for(int c=0;c<s.Workshop.modules.Length;c++)s.Workshop.modules[c]=100;
        foreach(string type in UnityV3Catalog.AddedIds)
        {
            int index=Workshop.Index(type);
            Check(index>=36,"six recipes are appended, never shift old IDs");
            Check(Workshop.Prerequisite(s,index),"V3 recipe has reachable prerequisite: "+type);
            s.Workshop.learned[index]=true;
            var before=s.Workshop.inventory.Length;
            var quote=Workshop.Quote(s,type);
            Check(quote.Allowed&&quote.Data>0&&quote.Components.Sum()>0,"recipe is paid: "+type);
            var next=Workshop.Craft(s,type,quote.Revision);
            Check(next.Workshop.inventory.Length==before+1,"actual Unity forge creates item: "+type);
            Check(next.Workshop.crafted[index]==1,"craft counter updated for "+type);
            s=next;
            Game.Validate(s);
        }
        Check(s.Workshop.inventory.Length==6,"all six native V3 items have been crafted");
        var unityRoundtrip=StateData.From(s).ToState();
        Check(unityRoundtrip.Workshop.inventory.Select(i=>i.type).SequenceEqual(UnityV3Catalog.AddedIds),
            "paid V3 recipes persist in original sequence without loss");
        Check(ItemSystemV3.Enabled(unityRoundtrip),"all native V3 features stay enabled on state reload");

        // Research job must be born with a native paid event identity.
        var research=Game.NewV3(1000,"native-paid-research",true);
        research.ResearchUsed=true;
        research.Data=ScientificNumber.From(100000000d);
        var paid=Game.Research(research,"dataGeneration");
        Check(paid.ResearchJob!=null&&paid.ResearchJob.researchStartVersion==3&&
            paid.ResearchJob.paidDataRecorded&&paid.ResearchJob.identityRecorded,
            "real Unity research begins with V3 paid receipt");
        var progressed=Game.Advance(paid,paid.SavedAt+60000,true);
        Check(progressed.SavedAt>paid.SavedAt&&
            (progressed.ResearchJob==null||progressed.ResearchJob.done>paid.ResearchJob.done),
            "native research advances through V3 simulation");
        Game.Validate(progressed);
        Console.WriteLine("UNITY V3 6-RECIPE CRAFT AND PAID RESEARCH SMOKE OK");
    }
}
