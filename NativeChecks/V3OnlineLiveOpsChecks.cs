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
        // A restart cannot silently lose consented offline events or duplicate
        // acknowledged receipts. No arbitrary JSON or player identifiers enter it.
        var persisted=queue.Export();
        Check(persisted.events.Length==1&&persisted.version==1,"bounded native retry snapshot");
        var restored=new NativeTelemetryQueue();
        Check(!restored.Restore(persisted),"no import without explicit consent");
        restored.SetConsent(true);
        int persistedChanges=0;
        restored.Changed+=()=>persistedChanges++;
        Check(restored.Restore(persisted),"valid consented offline receipt restored");
        Check(restored.NextBatch().Single().id==batch[1].id,"stable receipt survives restart");
        restored.Acknowledge(new[]{batch[1].id});
        Check(restored.Count==0&&persistedChanges>=2,"server acknowledgement removes local receipt");
        var malicious=new NativeTelemetrySnapshot{events=new[]{
            new NativeTelemetryEvent{id=batch[1].id,type="untrusted_save_json",metric=1}}};
        Check(!restored.Restore(malicious),"unknown telemetry kind rejected");
        var duplicates=new NativeTelemetrySnapshot{events=new[]{persisted.events[0],persisted.events[0]}};
        Check(!restored.Restore(duplicates),"duplicate telemetry receipts rejected");
        var oversized=new NativeTelemetrySnapshot{events=Enumerable.Range(0,49)
            .Select(i=>new NativeTelemetryEvent{
                id=Guid.NewGuid().ToString("D"),type="screen_view",metric=i}).ToArray()};
        Check(!restored.Restore(oversized),"oversized offline journal is rejected");
        restored.SetConsent(false);
        Check(restored.Export().events.Length==0,"revoked consent exports no event data");
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
