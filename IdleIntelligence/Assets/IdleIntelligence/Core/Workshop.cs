using System;
using System.Linq;
using System.Collections.Generic;
namespace IdleIntelligence.Core
{
    public static class Workshop
    {
        public const long MaxInteger=9007199254740991L;
        public static int Index(string type)=>Array.FindIndex(ItemBalance.Items,d=>d.Id==type);
        public static ItemDefinition Definition(ItemInstance i)=>ItemBalance.Items[Index(i.type)];
        static bool Stock(long n)=>n>=0&&n<=MaxInteger;
        public static void Validate(GameState s)
        {
            var w=s.Workshop;
            if(w==null||w.schema!=1||!Stock(w.nextId)||w.nextId<1||!Stock(w.revision)||!Stock(w.fragments)||w.components==null||w.components.Length!=ItemBalance.ComponentIds.Length||w.components.Any(n=>!Stock(n))||w.modules==null||w.modules.Length!=ItemBalance.Modules.Length||w.modules.Any(n=>!Stock(n)))throw new FormatException("Invalid workshop stock");
            if(w.learned==null||w.learned.Length!=ItemBalance.Items.Length||w.knownBlueprints==null||w.knownBlueprints.Length!=ItemBalance.Items.Length||w.mastery==null||w.mastery.Length!=ItemBalance.Items.Length||w.mastery.Any(n=>n<0||n>4)||w.crafted==null||w.crafted.Length!=ItemBalance.Items.Length||w.crafted.Any(n=>n<0)||w.equipped==null||w.equipped.Length!=8||w.nodes==null||w.permanentSlots==null||w.milestones==null||w.researchProgress==null||w.researchProgress.Length!=5)throw new FormatException("Invalid workshop contracts");
            if(w.inventory==null||w.inventory.Any(i=>i==null||string.IsNullOrEmpty(i.id)||Index(i.type)<0||i.rarity<0||i.rarity>=ItemBalance.Rarities.Length||i.level<1||i.level>ItemBalance.MaxLevel||i.forge<0||i.forge>20||!ScientificNumber.Finite(i.legacyLevelFactor)||i.legacyLevelFactor<=0||!Stock(i.relayTaps)||!ValidMap(i.materialBasis,false)||!ValidMap(i.recoveryUsed,false))||w.inventory.Select(i=>i.id).Distinct().Count()!=w.inventory.Length)throw new FormatException("Invalid inventory");
            if(w.equipped.Where(id=>!string.IsNullOrEmpty(id)).Any(id=>!w.inventory.Any(i=>i.id==id))||w.equipped.Where(id=>!string.IsNullOrEmpty(id)).Distinct().Count()!=w.equipped.Count(id=>!string.IsNullOrEmpty(id)))throw new FormatException("Invalid equipment");
            if(!ValidMap(w.hardwareRemainders,true)||!ValidMap(w.recyclingRemainders,true)||!ScientificNumber.Finite(w.passiveProgress)||w.passiveProgress<0||w.passiveProgress>=1.000001||!ScientificNumber.Finite(w.runStartedAt)||w.runStartedAt<0||w.integration<0||w.qualityCompletions<0||w.efficiencyCompletions<0)throw new FormatException("Invalid material progress");
            if(w.hasAnalysis&&(w.analysis==null||w.analysis.definition<0||w.analysis.definition>=ItemBalance.Analyses.Length||!ScientificNumber.Finite(w.analysis.required)||w.analysis.required<=0||!ScientificNumber.Finite(w.analysis.done)||w.analysis.done<0||w.analysis.done>w.analysis.required+1e-6||w.analysis.weights==null||w.analysis.weights.Length!=w.components.Length||w.analysis.weights.Any(n=>!ScientificNumber.Finite(n)||n<0)||w.analysis.weights.Sum()<=0||w.analysis.order==null||w.analysis.order.Length==0||w.analysis.order.Distinct().Count()!=w.analysis.order.Length||w.analysis.order.Any(c=>c<0||c>=w.components.Length||w.analysis.weights[c]<=0)||w.analysis.order.Length!=w.analysis.weights.Count(n=>n>0)||!ScientificNumber.Finite(w.analysis.blueprints)||w.analysis.blueprints<0||!ScientificNumber.Finite(w.analysis.combination)||w.analysis.combination<1||!ScientificNumber.Finite(w.analysis.photonicIntegral)||w.analysis.photonicIntegral<0||!ScientificNumber.Finite(w.analysis.quantumIntegral)||w.analysis.quantumIntegral<0||!ScientificNumber.Finite(w.analysis.units)||w.analysis.units<0))throw new FormatException("Invalid analysis contract");
            if(!ScientificNumber.Finite(w.researchRemainder)||w.researchRemainder<0||w.researchRemainder>=1||w.researchProgress.Any(n=>!ScientificNumber.Finite(n)||n<0||n>=ItemBalance.BlueprintResearchThreshold)||!ValidMap(w.analysisRemainders,true)||w.focus < -1||w.focus>4||!Stock(w.researchFragments)||!ScientificNumber.Finite(w.componentRemainder)||w.componentRemainder<0||w.componentRemainder>=1||!ScientificNumber.Finite(w.blueprintRemainder)||w.blueprintRemainder<0||w.blueprintRemainder>=1)throw new FormatException("Invalid analysis remainder");
            if(w.hasModuleJob&&(w.moduleJob==null||!ItemBalance.Modules.Any(m=>m.Id==w.moduleJob.id)||!ScientificNumber.Finite(w.moduleJob.required)||w.moduleJob.required<=0||!ScientificNumber.Finite(w.moduleJob.done)||w.moduleJob.done<0||w.moduleJob.done>w.moduleJob.required+1e-6))throw new FormatException("Invalid module work");
        }
        static bool ValidMap(double[] values,bool remainder)=>values!=null&&values.Length==ItemBalance.ComponentIds.Length&&values.All(n=>ScientificNumber.Finite(n)&&n>=0&&n<=(remainder?1:MaxInteger));
        static GameState Changed(GameState s){s.Workshop.revision=checked(s.Workshop.revision+1);return s;}
        public static bool[] ActiveSlots(GameState s)
        {
            var w=s.Workshop;return new[]{true,true,true,w.nodes.Contains("W01")||w.permanentSlots.Contains("processorAux"),w.nodes.Contains("W02")||w.permanentSlots.Contains("coreAux"),w.nodes.Contains("W06")||w.permanentSlots.Contains("researchAux"),w.activeModel=="K10",w.activeModel=="K10"&&w.activeModelLevel>=ItemBalance.ModelSlotLevel};
        }
        public static IEnumerable<ItemInstance> Equipped(GameState s)
        {
            var active=ActiveSlots(s);for(int n=0;n<8;n++)if(active[n]){var i=s.Workshop.inventory.FirstOrDefault(x=>x.id==s.Workshop.equipped[n]);if(i!=null&&(n>=6||Definition(i).Family==ItemBalance.Slots[n].Replace("Aux","")))yield return i;}
        }
        public static double Amplifier(GameState s)
        {
            var w=s.Workshop;double f=Math.Pow(PrestigeRules.Has(s,"T10")?PrestigeRules.V("integrationPerfect"):ItemBalance.IntegrationBase,w.integration)*(w.activeModel=="K10"?ItemBalance.ModelItemBase+ItemBalance.ModelItemLevel*w.activeModelLevel:1);
            for(int n=0;n<3;n++)if(w.nodes.Contains(new[]{"W05","W09","W10"}[n]))f*=ItemBalance.AmplifierNodes[n];return f;
        }
        public static double ModelCore(GameState s)=>string.IsNullOrEmpty(s.Workshop.activeModel)?1:ItemBalance.ModelCore*(1+ItemBalance.ModelCoreLevel*s.Workshop.activeModelLevel);
        public static double Effect(GameState s,ItemInstance i,string effect)
        {
            var d=Definition(i);int position=Array.IndexOf(d.Profiles[i.rarity],effect);if(position<0)return 0;
            return ItemBalance.BaseEffect*ItemBalance.RarityFactors[i.rarity]*(1+ItemBalance.LevelStep*Math.Max(0,i.level-1))*i.legacyLevelFactor*(1+ItemBalance.ForgeStep*i.forge)*Amplifier(s)*d.Weights[position]*(position==1&&PrestigeBalance.SecondaryNodes.Any(id=>PrestigeRules.Has(s,id))?PrestigeRules.V("legacySecondaryMultiplier"):position==2&&PrestigeBalance.TertiaryNodes.Any(id=>PrestigeRules.Has(s,id))?PrestigeRules.V("legacyTertiaryMultiplier"):1);
        }
        public static double Bonus(GameState s,string effect)=>Equipped(s).Sum(i=>Effect(s,i,effect))*(1+s.Workshop.nodes.Where(id=>PrestigeBalance.LegacyItemBonuses.ContainsKey(id)).Sum(id=>PrestigeBalance.LegacyItemBonuses[id]));
        public static double Device(GameState s,string role,double at=-1)
        {
            double sum=0;var w=s.Workshop;double now=at<0?s.SavedAt:at;
            foreach(var i in Equipped(s))
            {
                var d=Definition(i);if(d.Role!=role)continue;int owned=s.Hardware.Count(n=>n>0);
                bool condition=role=="sparse"?owned>0&&owned<=3:role=="photonicCompute"||role=="burst"?s.ActiveUntil>now:role=="legacy"?s.Hardware[0]>=10||s.Hardware[1]>=10:true;
                double progress=role=="pairs"?Math.Min(ItemBalance.PairCap,Math.Min(w.qualityCompletions,w.efficiencyCompletions))/ItemBalance.PairCap:role=="memory"?Math.Min(1,Math.Max(0,now-w.runStartedAt)/1000/ItemBalance.MemorySeconds):1;
                if(condition)sum+=Math.Min(d.Cap,Effect(s,i,role))*progress;
            }return sum;
        }
        public static double Combination(GameState s,string id)
        {
            var d=ItemBalance.Combinations.First(x=>x.Id==id);var equipped=Equipped(s).ToArray();bool active=d.Needs.All(required=>d.Items?equipped.Any(i=>i.type==required):equipped.Any(i=>Definition(i).Profiles[i.rarity].Contains(required)));
            return active?d.Value:d.Multiplicative?1:0;
        }
        public static double SpecialScale(GameState s,ItemInstance i)
        {
            var baseline=i.Copy();baseline.rarity=0;baseline.level=1;baseline.forge=0;baseline.legacyLevelFactor=1;string effect=i.type=="impulse-relay"?"relay":"int-yield";return Effect(s,i,effect)/Effect(s,baseline,effect);
        }
        public static GameState Discover(GameState state)
        {
            var w=state.Workshop;if(w.starterGift||!state.Hardware.Any(n=>n>0)&&w.inventory.Length==0&&!w.components.Any(n=>n>0))return state;
            var s=state.Copy();w=s.Workshop;var need=new double[w.components.Length];
            for(int n=0;n<ItemBalance.Items.Length;n++)if(ItemBalance.Items[n].Starter>=0&&ItemBalance.Items[n].Starter<3)
            {w.learned[n]=true;if(w.crafted[n]==0&&!w.inventory.Any(i=>i.type==ItemBalance.Items[n].Id))for(int c=0;c<need.Length;c++)need[c]+=ItemBalance.Items[n].Components[0][c];}
            for(int c=0;c<need.Length;c++)w.components[c]=Math.Max(w.components[c],(long)need[c]);w.starterGift=true;return Changed(s);
        }
        public static bool Prerequisite(GameState s,int n)=>ItemBalance.Items[n].Starter>=0||Game.Level(s,"blueprints")>0;
        public static string LearnBlock(GameState s,int n)
        {
            if(n<0||n>=ItemBalance.Items.Length)return "Unbekannter Bauplan";
            var d=ItemBalance.Items[n];return s.Workshop.learned[n]?"Bereits gelernt":!Prerequisite(s,n)?"Forschung: Baupläne":d.BlueprintPrice==0?(d.Starter>=0?"Starter-Aufgaben abschließen":"Vorhandener Bauplan benötigt · Erwerbsweg noch offen"):s.Workshop.fragments<d.BlueprintPrice?"Zu wenig Bauplanfragmente":null;
        }
        public static GameState Learn(GameState state,string id)
        {int n=Index(id);if(LearnBlock(state,n)!=null)return state;var s=state.Copy();s.Workshop.fragments-=ItemBalance.Items[n].BlueprintPrice;s.Workshop.learned[n]=true;return Changed(s);}
        public static CraftQuote Quote(GameState s,string type)
        {
            int n=Index(type);if(n<0)return new CraftQuote{Reason="Unbekannt"};var d=ItemBalance.Items[n];var w=s.Workshop;var q=new CraftQuote{Components=(double[])d.Components[w.mastery[n]].Clone(),Modules=(double[])d.ModuleCosts.Clone(),Data=d.Data,Revision=w.revision};
            q.Reason=!Prerequisite(s,n)?"Forschung: Baupläne":!w.learned[n]?"Bauplan lernen":!Stock(w.nextId+2)?"ID-Grenze":s.Data.CompareTo(ScientificNumber.From(q.Data))<0?"Zu wenig Daten":null;
            for(int c=0;c<q.Components.Length;c++)if(q.Reason==null&&w.components[c]<q.Components[c])q.Reason="Fehlt: "+ItemBalance.ComponentNames[c];
            for(int c=0;c<q.Modules.Length;c++)if(q.Reason==null&&w.modules[c]<q.Modules[c])q.Reason="Fehlt: "+ItemBalance.Modules[c].Name;
            q.Allowed=q.Reason==null;return q;
        }
        public static GameState Craft(GameState state,string type,long revision=-1)
        {
            if(revision>=0&&revision!=state.Workshop.revision)return state;var q=Quote(state,type);if(!q.Allowed)return state;
            var s=state.Copy();var w=s.Workshop;int n=Index(type);s.Data=s.Data.Subtract(ScientificNumber.From(q.Data));
            for(int c=0;c<w.components.Length;c++)w.components[c]-=(long)q.Components[c];for(int c=0;c<w.modules.Length;c++)w.modules[c]-=(long)q.Modules[c];
            w.nextId++;var item=new ItemInstance{id="item-"+w.nextId++,type=type,materialBasis=(double[])q.Components.Clone()};
            double fraction=Game.Level(s,"materialRecycling")>0?Math.Min(ItemBalance.RecoveryFraction,ItemBalance.ResearchRecycling*(1+Device(s,"recovery"))):0;
            for(int c=0;c<w.components.Length;c++) {item.recoveryUsed[c]=q.Components[c]*fraction;double v=w.recyclingRemainders[c]+item.recoveryUsed[c];double near=Math.Floor(v+.5);if(Math.Abs(v-near)<=2.220446049250313e-16*Math.Max(1,v)*16)v=near;long returned=(long)Math.Floor(v);w.components[c]+=returned;w.recyclingRemainders[c]=v-returned;}
            w.inventory=w.inventory.Concat(new[]{item}).ToArray();w.crafted[n]++;
            if(ItemBalance.Items.Select((d,i)=>new{d,i}).Where(x=>x.d.Starter>=0&&x.d.Starter<3).All(x=>w.crafted[x.i]>0))for(int k=0;k<w.learned.Length;k++)if(ItemBalance.Items[k].Starter>=0)w.learned[k]=true;
            return Changed(s);
        }
        public static string EquipmentSlot(GameState s,string id,string requested=null)
        {
            var w=s.Workshop;var item=w.inventory.FirstOrDefault(i=>i.id==id);if(item==null||w.equipped.Contains(id))return null;var active=ActiveSlots(s);var d=Definition(item);var candidates=Enumerable.Range(0,8).Where(n=>active[n]&&(n>=6||ItemBalance.Slots[n].Replace("Aux","")==d.Family)).ToArray();
            int slot=requested!=null?Array.IndexOf(ItemBalance.Slots,requested):candidates.Where(n=>w.inventory.Any(i=>i.id==w.equipped[n]&&i.type==item.type)).DefaultIfEmpty(-1).First();
            if(slot<0&&requested==null)slot=candidates.Where(n=>string.IsNullOrEmpty(w.equipped[n])).DefaultIfEmpty(-1).First();if(slot<0&&requested==null)slot=candidates.DefaultIfEmpty(-1).First();
            if(slot<0||!candidates.Contains(slot)||w.inventory.Any(i=>i.type==item.type&&i.id!=w.equipped[slot]&&w.equipped.Contains(i.id)))return null;return ItemBalance.Slots[slot];
        }
        public static GameState Equip(GameState state,string id,string slot=null)
        {slot=EquipmentSlot(state,id,slot);if(slot==null)return state;var s=state.Copy();s.Workshop.equipped[Array.IndexOf(ItemBalance.Slots,slot)]=id;return Changed(s);}
        public static GameState Unequip(GameState state,string slot)
        {int n=Array.IndexOf(ItemBalance.Slots,slot);if(n<0||string.IsNullOrEmpty(state.Workshop.equipped[n]))return state;var s=state.Copy();s.Workshop.equipped[n]="";return Changed(s);}
        public static GameState Lock(GameState state,string id)
        {var old=state.Workshop.inventory.FirstOrDefault(i=>i.id==id);if(old==null||old.challengeCopy)return state;var s=state.Copy();var item=s.Workshop.inventory.First(i=>i.id==id);item.locked=!item.locked;return Changed(s);}
        public static ItemInstance FusionResult(GameState state,string[] ids)
        {
            if(ids==null||ids.Length!=3||ids.Distinct().Count()!=3)return null;var w=state.Workshop;var items=ids.Select(id=>w.inventory.FirstOrDefault(i=>i.id==id)).ToArray();
            if(items.Any(i=>i==null||i.locked||i.challengeCopy||w.equipped.Contains(i.id)))return null;
            var best=items.Aggregate((a,b)=>b.level>a.level||b.level==a.level&&b.forge>a.forge?b:a);
            if(best.rarity==5||items.Any(i=>i.type!=best.type||i.rarity!=best.rarity))return null;
            var result=best.Copy();result.rarity++;for(int c=0;c<result.materialBasis.Length;c++){result.materialBasis[c]=items.Sum(i=>i.materialBasis[c]);result.recoveryUsed[c]=items.Sum(i=>i.recoveryUsed[c]);}return result;
        }
        public static GameState Fuse(GameState state,string[] ids)
        {var result=FusionResult(state,ids);if(result==null)return state;var s=state.Copy();s.Workshop.inventory=s.Workshop.inventory.Where(i=>!ids.Contains(i.id)||i.id==result.id).Select(i=>i.id==result.id?result:i).ToArray();return Changed(s);}
        public static GameState Mastery(GameState state,string id,int expected)
        {int n=Index(id);if(n<0||state.Workshop.mastery[n]!=expected||expected>=4||!Prerequisite(state,n)||!state.Workshop.learned[n]||state.Workshop.crafted[n]==0||state.Workshop.fragments<ItemBalance.MasteryCosts[expected])return state;var s=state.Copy();s.Workshop.fragments-=(long)ItemBalance.MasteryCosts[expected];s.Workshop.mastery[n]++;return Changed(s);}
        public static CraftQuote UpgradeQuote(GameState s,ItemInstance item)
        {
            var d=Definition(item);int target=item.level+1;double complexity=Math.Max(1,Math.Min(ItemBalance.LevelComplexityCap,Math.Sqrt(ItemBalance.Items[Index(item.type)].Data/ItemBalance.LevelComplexityBase)));
            // Upgrade complexity uses the original recipe, including starter overrides only for crafting.
            complexity=Math.Max(1,Math.Min(ItemBalance.LevelComplexityCap,Math.Sqrt(ItemBalance.OriginalRecipeData[Index(item.type)]/ItemBalance.LevelComplexityBase)));
            double discount=PrestigeRules.Has(s,"W04")?PrestigeRules.V("upgradeDiscount"):1;long amount=(long)Math.Ceiling(ItemBalance.LevelMaterialBase*Math.Pow(ItemBalance.LevelMaterialGrowth,target-2)*discount);var costs=new double[s.Workshop.components.Length];costs[0]=amount;costs[d.BaseMaterial]=(long)Math.Ceiling(amount/ItemBalance.LevelBaseDivisor);if(target>=ItemBalance.LevelRareStart)costs[d.RareMaterial]=1+Math.Floor((target-ItemBalance.LevelRareStart)/ItemBalance.LevelRareStep);
            double data=Math.Ceiling(ItemBalance.LevelDataBase*complexity*Math.Pow(ItemBalance.LevelDataGrowth,target-2)*discount);string reason=item.challengeCopy?"Geschützt":item.level>=ItemBalance.MaxLevel?"Maximallevel":s.Data.CompareTo(ScientificNumber.From(data))<0?"Zu wenig Daten":Enumerable.Range(0,costs.Length).Any(c=>s.Workshop.components[c]<costs[c])?"Komponenten fehlen":null;
            return new CraftQuote{Allowed=reason==null,Reason=reason,Components=costs,Data=data,Revision=s.Workshop.revision};
        }
        public static GameState Upgrade(GameState state,string id,long revision=-1)
        {var old=state.Workshop.inventory.FirstOrDefault(i=>i.id==id);if(old==null||revision>=0&&revision!=state.Workshop.revision)return state;var q=UpgradeQuote(state,old);if(!q.Allowed)return state;var s=state.Copy();s.Data=s.Data.Subtract(ScientificNumber.From(q.Data));for(int c=0;c<q.Components.Length;c++)s.Workshop.components[c]-=(long)q.Components[c];var item=s.Workshop.inventory.First(i=>i.id==id);item.level++;for(int c=0;c<q.Components.Length;c++)item.materialBasis[c]+=q.Components[c];return Changed(s);}
        public static void PaidHardware(GameState s,int index,long before)
        {
            var w=s.Workshop;for(int k=0;k<ItemBalance.PackageThresholds.Length;k++)
            {
                int threshold=ItemBalance.PackageThresholds[k];string key=Balance.Hardware[index].Id+":"+threshold;if(before>=threshold||s.Hardware[index]<threshold||w.milestones.Contains(key))continue;
                for(int pair=0;pair<ItemBalance.HardwarePairs[index].Length;pair++)
                {int c=ItemBalance.HardwarePairs[index][pair];int f=ItemBalance.HardwareFamilies[c];double raw=ItemBalance.PackageAmounts[k][pair]*(f>=3?ItemBalance.FrontierFactor:1)*(1+Device(s,"hardwarePackage"))*(1+(f==2?Device(s,"photonicYield"):f==4?Device(s,"quantumYield"):0))+w.hardwareRemainders[c];long amount=(long)Math.Floor(raw+2.220446049250313e-16*Math.Max(1,raw)*16);w.components[c]+=amount;w.hardwareRemainders[c]=Math.Max(0,raw-amount);}
                w.components[3]+=(long)ItemBalance.TitaniumMilestone;if(index==3)w.components[4]+=(long)ItemBalance.GpuLaser;w.milestones=w.milestones.Concat(new[]{key}).ToArray();
            }
        }
        public static void Passive(GameState s,double seconds)
        {
            var w=s.Workshop;int count=s.Hardware.Count(n=>n>0);w.passiveProgress+=count/ItemBalance.PassiveSeconds*seconds;long drops=(long)Math.Floor(w.passiveProgress);w.passiveProgress-=drops;
            if(drops>0)w.revision++;double total=ItemBalance.PassiveWeights.Take(Math.Min(count,10)).Sum();for(long n=0;n<drops;n++){w.materialRng=unchecked(w.materialRng*1664525u+1013904223u);double roll=w.materialRng/4294967296d;int picked=Math.Min(count,10)-1;for(int k=0;k<Math.Min(count,10);k++){roll-=ItemBalance.PassiveWeights[k]/total;if(roll<=0){picked=k;break;}}if(picked>=0)w.components[picked]++;}
        }
        public static int ResearchArea(string id)=>id=="dataGeneration"?0:id=="computeOptimization"||id=="userScaling"?1:id=="modelArchitecture"||id=="commercialization"?2:id=="labAutomation"?4:3;
        public static void ResearchComplete(GameState s,string id)
        {
            var w=s.Workshop;if(id=="blueprints"&&!w.blueprintReward){w.fragments+=(long)ItemBalance.FirstBlueprintFragments;w.blueprintReward=true;}
            int area=ResearchArea(id);double value=w.researchProgress[area]+1+Device(s,"blueprintProgress");
            if(value>=ItemBalance.BlueprintResearchThreshold){value-=(int)ItemBalance.BlueprintResearchThreshold;int known=Array.FindIndex(ItemBalance.Items,d=>!string.IsNullOrEmpty(d.Role)&&d.Area==new[]{"data","architecture","model","materials","automation"}[area]&&!w.knownBlueprints[Index(d.Id)]&&!w.learned[Index(d.Id)]&&Game.Level(s,"blueprints")>0&&d.Access!="prestige"&&MaterialAnalysis.Access(s,d.Access=="server"?2:d.Access=="campus"?3:4));if(known>=0)w.knownBlueprints[known]=true;else w.fragments++;}w.researchProgress[area]=value;w.revision++;
        }
        public static GameState CraftBatch(GameState state,string type,int quantity)
        {if(quantity<1||quantity>ItemBalance.MaxCraft||quantity>1&&!PrestigeRules.Has(state,"W07"))return state;var q=Quote(state,type);if(!q.Allowed||state.Data.CompareTo(ScientificNumber.From(q.Data*quantity))<0||q.Components.Where((n,c)=>n*quantity>state.Workshop.components[c]).Any()||q.Modules.Where((n,c)=>n*quantity>state.Workshop.modules[c]).Any())return state;var s=state;for(int i=0;i<quantity;i++){if(i>0){s=s.Copy();s.Workshop.nextId--;}var next=Craft(s,type);if(ReferenceEquals(next,s))return state;s=next;}return s;}
        public static GameState ModuleBatch(GameState state,int n,int quantity)
        {if(n<0||n>=ItemBalance.Modules.Length||quantity<1||quantity>100||state.Prestige.moduleQueue.Length+quantity>100)return state;var s=state;for(int i=0;i<quantity;i++){var saved=s.Prestige.moduleQueue;var unit=s.Copy();unit.Prestige.moduleQueue=Array.Empty<Job>();var next=StartModule(unit,n);if(ReferenceEquals(next,unit))return state;next.Prestige.moduleQueue=saved.Concat(next.Prestige.moduleQueue).ToArray();s=next;}return s;}
        public static GameState StartModule(GameState state,int n)
        {if(n<0||n>=ItemBalance.Modules.Length||Game.Level(state,"blueprints")==0||state.Prestige.moduleQueue.Length>=100)return state;var d=ItemBalance.Modules[n];if(state.Data.CompareTo(ScientificNumber.From(d.Data))<0||Enumerable.Range(0,d.Costs.Length).Any(c=>state.Workshop.components[c]<d.Costs[c]))return state;var s=state.Copy();s.Data=s.Data.Subtract(ScientificNumber.From(d.Data));for(int c=0;c<d.Costs.Length;c++)s.Workshop.components[c]-=(long)d.Costs[c];s.Workshop.nextId++;var job=new Job{id=d.Id,required=d.Work};if(!s.Workshop.hasModuleJob){s.Workshop.hasModuleJob=true;s.Workshop.moduleJob=job;}else s.Prestige.moduleQueue=s.Prestige.moduleQueue.Concat(new[]{job}).ToArray();return Changed(s);}
    }
}
