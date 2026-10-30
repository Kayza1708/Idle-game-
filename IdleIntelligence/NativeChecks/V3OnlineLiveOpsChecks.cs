using System;
using System.Linq;
using IdleIntelligence.Core;
internal static class V3OnlineLiveOpsChecks
{
    static void Check(bool yes,string name){if(!yes)throw new Exception("UNITY ONLINE CONTRACT: "+name);}
    public static void Run()
    {
        var queue=new NativeTelemetryQueue();
        Check(!queue.Record("session_start"),"default opt-out");
        queue.SetConsent(true);
        Check(queue.Record("session_start"),"opted-in session");
        Check(queue.Record("prestige",2),"allowlisted gameplay");
        Check(!queue.Record("arbitrary_client_event"),"unrecognized event rejected");
        Check(!queue.Record("app_crash",-1),"negative counters rejected");
        Check(!queue.Record("app_crash",1000000001),"huge counters rejected");
        var batch=queue.NextBatch();
        Check(batch.Length==2&&batch.All(e=>Guid.TryParse(e.id,out var _)),"stable one-use event ids");
        Check(batch.All(e=>e.type=="session_start"||e.type=="prestige"),"no arbitrary data");
        queue.Acknowledge(new[]{batch[0].id});
        Check(queue.Count==1&&queue.NextBatch()[0].id==batch[1].id,"ack idempotent");
        queue.SetConsent(false);
        Check(queue.Count==0&&!queue.Record("ad_reward"),"revocation purges pending events");

        var live=new NativeLiveOpsSnapshot{schema=1,minClientVersion=1,serverTime=200,
            season=new NativeLiveOpsSeason{id="season-1",label="First month",startsAt=100,endsAt=300}};
        Check(NativeLiveOpsRules.Valid(live)&&NativeLiveOpsRules.HasCurrentSeason(live),
            "server UTC season interpreted with verified bounds");
        live.serverTime=300;
        Check(!NativeLiveOpsRules.HasCurrentSeason(live),"season expires exactly at UTC end");
        live.minClientVersion=2;
        Check(NativeLiveOpsRules.UpdateRequired(live),"release gate reports version mismatch");
        live.season.endsAt=99;
        Check(!NativeLiveOpsRules.Valid(live),"invalid server configuration rejected");
        Console.WriteLine("UNITY V3 TELEMETRY CONSENT AND LIVEOPS UTC CONTRACTS OK");
    }
}
