using System;
using System.Linq;
namespace IdleIntelligence.Core
{
    /// <summary>
    /// Explicit native V3 wire shape. ScientificNumber is not serialized directly:
    /// its verified NumberData representation is used on the Unity JSON boundary.
    /// The source GameState remains unchanged while the envelope is built.
    /// </summary>
    [Serializable] public sealed class UnityV3SaveData
    {
        public int version=3;
        public NumberData dataProduced,knowledgeProduced,componentsProduced;
        public double runMinutes,recyclingFragmentProgress;
        public long nextTrainingSequence,lastCompletedTrainingSequence,scannerAnalyses,automaticResearchStarts;
        public int learningStreak;
        public string lastLearningTrack,lastTrainingCompletionCause;
        public bool archiveBlueprintRight,axiomDiscovered;public double axiomDiscoveryAt;
        public double[] synthesisRemainders;public ItemV3Synthesis synthesisContract;public ItemV3Overdrive overdrive;
        // Unity JsonUtility may materialize null nested custom classes as empty
        // instances. Explicit presence flags distinguish a real paid receipt
        // from a serializer placeholder; older version-25 saves are supported.
        public bool receiptPresenceRecorded,hasSynthesisContract,hasOverdrive;
        static bool EmptySynthesis(ItemV3Synthesis value)
            =>value==null||(string.IsNullOrEmpty(value.id)&&
                string.IsNullOrEmpty(value.component)&&value.multiplier==0);
        static bool EmptyOverdrive(ItemV3Overdrive value)
            =>value==null||(value.startedAt==0&&value.burstUntil==0&&
                (value.creditFactor==0||value.creditFactor==1)&&
                (value.dataFactor==0||value.dataFactor==1));
        public double gradientStoredWork,gradientAccruedWork,gradientLastRequirement,capacitorFraction,axiomAnchorFactor,axiomAnchorSeconds;
        public string gradientAccruedJob;public string[] capacitorCompletedJobs;
        public double axiomAnchorFirstSeconds,axiomAnchorFirstFactor;public int libraryAnalyses;public string libraryLastReceipt;
        public static UnityV3SaveData From(ItemV3State v)
        {
            if(v==null)return null;
            return new UnityV3SaveData{
                version=v.version,dataProduced=v.dataProduced.ToData(),knowledgeProduced=v.knowledgeProduced.ToData(),
                componentsProduced=v.componentsProduced.ToData(),runMinutes=v.runMinutes,recyclingFragmentProgress=v.recyclingFragmentProgress,
                nextTrainingSequence=v.nextTrainingSequence,lastCompletedTrainingSequence=v.lastCompletedTrainingSequence,
                scannerAnalyses=v.scannerAnalyses,automaticResearchStarts=v.automaticResearchStarts,
                learningStreak=v.learningStreak,lastLearningTrack=v.lastLearningTrack,
                lastTrainingCompletionCause=v.lastTrainingCompletionCause,archiveBlueprintRight=v.archiveBlueprintRight,
                axiomDiscovered=v.axiomDiscovered,axiomDiscoveryAt=v.axiomDiscoveryAt,
                synthesisRemainders=(double[])v.synthesisRemainders.Clone(),
                synthesisContract=v.synthesisContract?.Copy(),overdrive=v.overdrive?.Copy(),
                receiptPresenceRecorded=true,hasSynthesisContract=v.synthesisContract!=null,
                hasOverdrive=v.overdrive!=null,
                gradientStoredWork=v.gradientStoredWork,gradientAccruedWork=v.gradientAccruedWork,
                gradientLastRequirement=v.gradientLastRequirement,gradientAccruedJob=v.gradientAccruedJob,
                capacitorFraction=v.capacitorFraction,capacitorCompletedJobs=(string[])v.capacitorCompletedJobs.Clone(),
                axiomAnchorFactor=v.axiomAnchorFactor,axiomAnchorSeconds=v.axiomAnchorSeconds,
                axiomAnchorFirstSeconds=v.axiomAnchorFirstSeconds,axiomAnchorFirstFactor=v.axiomAnchorFirstFactor,
                libraryAnalyses=v.libraryAnalyses,libraryLastReceipt=v.libraryLastReceipt
            };
        }
        public ItemV3State ToState()
        {
            if(version!=3||dataProduced==null||knowledgeProduced==null||componentsProduced==null||
               synthesisRemainders==null||synthesisRemainders.Length!=ItemBalance.ComponentIds.Length||
               capacitorCompletedJobs==null)throw new FormatException("Missing native V3 save receipt");
            if(receiptPresenceRecorded&&
                (hasSynthesisContract==EmptySynthesis(synthesisContract)||
                 hasOverdrive==EmptyOverdrive(overdrive)))
                throw new FormatException("Inconsistent V3 paid receipt presence flags");
            // For historical v25 payloads with no flags, only the exact inert
            // Unity-JSON placeholder can become null. Never discard a nonempty
            // receipt, even when its fields are malformed.
            var activeSynthesis=EmptySynthesis(synthesisContract)?null:synthesisContract;
            var activeOverdrive=EmptyOverdrive(overdrive)?null:overdrive;
            return new ItemV3State{
                version=version,dataProduced=ScientificNumber.FromData(dataProduced),
                knowledgeProduced=ScientificNumber.FromData(knowledgeProduced),
                componentsProduced=ScientificNumber.FromData(componentsProduced),
                runMinutes=runMinutes,recyclingFragmentProgress=recyclingFragmentProgress,
                nextTrainingSequence=nextTrainingSequence,lastCompletedTrainingSequence=lastCompletedTrainingSequence,
                scannerAnalyses=scannerAnalyses,automaticResearchStarts=automaticResearchStarts,
                learningStreak=learningStreak,lastLearningTrack=lastLearningTrack,
                lastTrainingCompletionCause=lastTrainingCompletionCause,archiveBlueprintRight=archiveBlueprintRight,
                axiomDiscovered=axiomDiscovered,axiomDiscoveryAt=axiomDiscoveryAt,
                synthesisRemainders=(double[])synthesisRemainders.Clone(),
                synthesisContract=activeSynthesis?.Copy(),overdrive=activeOverdrive?.Copy(),
                gradientStoredWork=gradientStoredWork,gradientAccruedWork=gradientAccruedWork,
                gradientLastRequirement=gradientLastRequirement,gradientAccruedJob=gradientAccruedJob,
                capacitorFraction=capacitorFraction,capacitorCompletedJobs=(string[])capacitorCompletedJobs.Clone(),
                axiomAnchorFactor=axiomAnchorFactor,axiomAnchorSeconds=axiomAnchorSeconds,
                axiomAnchorFirstSeconds=axiomAnchorFirstSeconds,axiomAnchorFirstFactor=axiomAnchorFirstFactor,
                libraryAnalyses=libraryAnalyses,libraryLastReceipt=libraryLastReceipt
            };
        }
    }
    public static class UnityV3Migration
    {
        /// <summary>Expand old 36-entry save arrays preserving all historical ordinals
        /// and every paid blueprint, mastery level and craft counter exactly.</summary>
        public static void ExpandWorkshopArrays(WorkshopState w)
        {
            if(w==null)throw new FormatException("Missing workshop for V3 migration");
            int previous=UnityV3Catalog.OldItemCount,now=ItemBalance.Items.Length;
            if(now!=42)throw new FormatException("Unexpected Unity V3 item catalog size");
            if(w.learned==null||w.knownBlueprints==null||w.mastery==null||w.crafted==null)
                throw new FormatException("Missing item ownership arrays");
            if(new[]{w.learned.Length,w.knownBlueprints.Length,w.mastery.Length,w.crafted.Length}
                  .Any(n=>n!=previous&&n!=now))
                throw new FormatException("Unrecognized item ownership layout");
            if(w.learned.Length!=w.knownBlueprints.Length||
               w.learned.Length!=w.mastery.Length||w.learned.Length!=w.crafted.Length)
                throw new FormatException("Mismatched ownership layout");
            if(w.learned.Length==now)return;
            Array.Resize(ref w.learned,now);
            Array.Resize(ref w.knownBlueprints,now);
            Array.Resize(ref w.mastery,now);
            Array.Resize(ref w.crafted,now);
        }
        /// <summary>Explicit player migration entry point, never invoked from JSON
        /// decoding or from normal old-save loading. Caller commits atomically.</summary>
        public static GameState Upgrade(GameState original)
        {
            if(original==null)throw new ArgumentNullException(nameof(original));
            if(ItemSystemV3.Enabled(original))return original;
            var next=original.Copy();
            ExpandWorkshopArrays(next.Workshop);
            // Upgrade the independently preserved main snapshot first. Validating an
            // active challenge before expanding its legacy 36-entry arrays would reject
            // an otherwise valid old save and leave a half-upgraded preview.
            if(next.Challenges?.Main!=null)next.Challenges.Main=Upgrade(next.Challenges.Main);
            Game.Validate(next);
            next.ItemSystemV3=new ItemV3State();
            next.ItemSystemV3.archiveBlueprintRight=
                PrestigeRules.Has(next,"I04")||next.Prestige.known.Contains("I04")||
                next.Workshop.learned[Workshop.Index("insight-archive")];
            // No invented historical production, past training receipts or free axiom buffs.
            // Current jobs remain paid/retained as they were, without retroactive V3 grant.
            Game.Validate(next);
            return next;
        }
    }
}
