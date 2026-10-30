using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;

namespace IdleIntelligence.Core
{
    // Platform-independent, opt-in event model. No local balances, identity
    // tokens, player names, raw logs, device IDs or arbitrary strings.
    [Serializable] public sealed class NativeTelemetryEvent
    {
        public string id,type;
        public int metric;
    }
    [Serializable] public sealed class NativeTelemetryBatch
    {
        public NativeTelemetryEvent[] events=Array.Empty<NativeTelemetryEvent>();
    }
    [Serializable] public sealed class NativeTelemetrySnapshot
    {
        public int version=1;
        public NativeTelemetryEvent[] events=Array.Empty<NativeTelemetryEvent>();
    }
    public sealed class NativeTelemetryQueue
    {
        public static readonly string[] Allowed={
            "session_start","session_end","screen_view","first_purchase",
            "training_complete","research_complete","prestige","axiom_reset",
            "item_craft","quest_claim","ad_request","ad_reward","ad_failed",
            "iap_attempt","iap_verified","season_open","company_open","app_crash"
        };
        readonly List<NativeTelemetryEvent> pending=new List<NativeTelemetryEvent>();
        static readonly Regex ValidId=new Regex("^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$",RegexOptions.IgnoreCase|RegexOptions.CultureInvariant);
        public event Action Changed;
        public bool Consent{get;private set;}
        public int Count=>pending.Count;
        public void SetConsent(bool allowed)
        {
            Consent=allowed;
            if(!allowed){pending.Clear();Changed?.Invoke();} // Purge persisted receipts on revocation.
        }
        public bool Record(string type,int metric=0)
        {
            if(!Consent||!Allowed.Contains(type,StringComparer.Ordinal)||
               metric<0||metric>1000000000)return false;
            if(pending.Count>=48)pending.RemoveAt(0);
            pending.Add(new NativeTelemetryEvent{id=Guid.NewGuid().ToString("D"),
                type=type,metric=metric});
            Changed?.Invoke();
            return true;
        }

        // A versioned, bounded, anonymous receipt journal. No account IDs,
        // device identifiers, free text, raw crashes, currency or IPs.
        public NativeTelemetrySnapshot Export()
            =>new NativeTelemetrySnapshot{version=1,
              events=Consent?pending.Select(e=>new NativeTelemetryEvent{
                 id=e.id,type=e.type,metric=e.metric}).ToArray():
                 Array.Empty<NativeTelemetryEvent>()};
        public bool Restore(NativeTelemetrySnapshot snapshot)
        {
            // Fail closed for malformed on-disk data; never load after opt-out.
            if(!Consent||snapshot==null||snapshot.version!=1||
               snapshot.events==null||snapshot.events.Length>48)return false;
            var seen=new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            foreach(var e in snapshot.events){
                if(e==null||e.id==null||!ValidId.IsMatch(e.id)||
                   !seen.Add(e.id)||!Allowed.Contains(e.type,StringComparer.Ordinal)||
                   e.metric<0||e.metric>1000000000)return false;
            }
            pending.Clear();
            pending.AddRange(snapshot.events.Select(e=>new NativeTelemetryEvent{
                id=e.id,type=e.type,metric=e.metric}));
            Changed?.Invoke();
            return true;
        }
        public NativeTelemetryEvent[] NextBatch()
            =>!Consent?Array.Empty<NativeTelemetryEvent>():
                pending.Take(12).Select(e=>new NativeTelemetryEvent{
                  id=e.id,type=e.type,metric=e.metric}).ToArray();
        public void Acknowledge(IEnumerable<string> ids)
        {
            if(!Consent||ids==null)return;
            var accepted=new HashSet<string>(ids,StringComparer.Ordinal);
            if(pending.RemoveAll(e=>accepted.Contains(e.id))>0)Changed?.Invoke();
        }
    }

    [Serializable] public sealed class NativeLiveOpsSeason
    {
        public string id,label;
        public long startsAt,endsAt;
    }
    [Serializable] public sealed class NativeLiveOpsSnapshot
    {
        public int schema=1,minClientVersion=1;
        public long serverTime;
        public bool maintenance;
        public string bulletin,rewardsAuthority;
        public NativeLiveOpsSeason season;
    }
    public static class NativeLiveOpsRules
    {
        public const int ClientVersion=1;
        public static bool Valid(NativeLiveOpsSnapshot source)
            =>source!=null&&source.schema==1&&source.minClientVersion>=1&&
              source.serverTime>0&&
              (source.season==null||source.season.startsAt<source.season.endsAt&&
               !string.IsNullOrEmpty(source.season.id)&&source.season.id.Length<=48)&&
              (source.bulletin==null||source.bulletin.Length<=160);
        public static bool UpdateRequired(NativeLiveOpsSnapshot source)
            =>Valid(source)&&source.minClientVersion>ClientVersion;
        public static bool HasCurrentSeason(NativeLiveOpsSnapshot source)
            =>Valid(source)&&source.season!=null&&
              source.season.startsAt<=source.serverTime&&
              source.season.endsAt>source.serverTime;
        // Remote metadata cannot create items, Gems, Seasons rewards or INT.
        // Rewards remain exclusively in the validated local Unity economy.
    }
}
