using System;
using System.Linq;
namespace IdleIntelligence.Core
{
    // Existing unpaid plans; payments and refunds remain in the start logic.
    public static class QueueControls
    {
        public static string Signature(GameState s,bool training)=>training?string.Join("|",s.Prestige.trainingQueue.Select(j=>j.track+":"+j.level)):string.Join("|",s.Prestige.researchQueue);
        public static bool CanMove(GameState s,bool training,int index,int direction)
        {
            int count=training?s.Prestige.trainingQueue.Length:s.Prestige.researchQueue.Length,target=index+direction;
            return (direction==-1||direction==1)&&index>=0&&index<count&&target>=0&&target<count&&(!training||s.Prestige.trainingQueue[index].track!=s.Prestige.trainingQueue[target].track);
        }
        public static GameState Change(GameState state,bool training,string signature,int index,string action)
        {
            if(signature!=Signature(state,training)||!new[]{"remove","earlier","later"}.Contains(action))return state;
            int count=training?state.Prestige.trainingQueue.Length:state.Prestige.researchQueue.Length;if(index<0||index>=count)return state;
            if(action=="remove"){
                var next=state.Copy();if(training){string track=state.Prestige.trainingQueue[index].track;next.Prestige.trainingQueue=state.Prestige.trainingQueue.Where((j,i)=>i<index||j.track!=track).ToArray();}else next.Prestige.researchQueue=state.Prestige.researchQueue.Where((_,i)=>i!=index).ToArray();return next;
            }
            int direction=action=="earlier"?-1:1;if(!CanMove(state,training,index,direction))return state;
            var result=state.Copy();int target=index+direction;
            if(training){var item=result.Prestige.trainingQueue[index];result.Prestige.trainingQueue[index]=result.Prestige.trainingQueue[target];result.Prestige.trainingQueue[target]=item;}
            else{string item=result.Prestige.researchQueue[index];result.Prestige.researchQueue[index]=result.Prestige.researchQueue[target];result.Prestige.researchQueue[target]=item;}
            return result;
        }
    }
}
