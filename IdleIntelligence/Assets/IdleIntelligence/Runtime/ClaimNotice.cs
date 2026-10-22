using System;
using System.Linq;
using IdleIntelligence.Core;
using UnityEngine;
using UnityEngine.UI;

namespace IdleIntelligence.Runtime
{
    /// <summary>Reusable red claim marker. Decorative only; all reward decisions stay in domain rules.</summary>
    public static class ClaimNotice
    {
        public static bool Achievements(GameState s)
        {
            if(s==null||ChallengeRules.Active(s))return false;
            return RetentionBalance.Achievements.Any(a=>
                RetentionRules.AchievementReady(s,a.Id,RetentionRules.CurrentTier(s,a))) ||
                RetentionBalance.Challenges.Any(c=>RetentionRules.StaticReady(s,c.Id)&&!s.Retention.challengeClaims.Contains(c.Id)) ||
                RetentionBalance.IntroIds.Any(id=>s.Retention.onboardingCompleted.Contains(id)&&!s.Retention.onboardingClaimed.Contains(id));
        }

        public static bool Missions(GameState s)
        {
            if(s==null||ChallengeRules.Active(s)||s.Missions.startPending)return false;
            for(int k=0;k<3;k++)
            {
                var period=s.Missions.Period(k);
                if(period.tasks.Any(t=>MissionRules.Complete(s,t)&&!t.claimed))return true;
                if(!period.bonusClaimed&&period.required>0&&
                    period.tasks.Count(t=>MissionRules.Complete(s,t))>=period.required)return true;
            }
            return false;
        }

        public static GameObject Attach(Transform parent,string name="ClaimReady")
        {
            var node=new GameObject(name,typeof(RectTransform),typeof(Image));
            node.transform.SetParent(parent,false);
            var rect=(RectTransform)node.transform;
            rect.anchorMin=rect.anchorMax=new Vector2(1,1);
            rect.pivot=new Vector2(.5f,.5f);
            rect.anchoredPosition=new Vector2(-8,-7);
            rect.sizeDelta=new Vector2(21,21);
            var background=node.GetComponent<Image>();
            background.color=new Color(.93f,.13f,.19f,1);
            background.raycastTarget=false;
            var label=new GameObject("Exclamation",typeof(RectTransform),typeof(Text));
            label.transform.SetParent(node.transform,false);
            var tr=(RectTransform)label.transform;
            tr.anchorMin=Vector2.zero;tr.anchorMax=Vector2.one;tr.offsetMin=tr.offsetMax=Vector2.zero;
            var glyph=label.GetComponent<Text>();
            glyph.text="!";glyph.font=GameTheme.Body;glyph.fontSize=18;glyph.fontStyle=FontStyle.Bold;
            glyph.color=Color.white;glyph.alignment=TextAnchor.MiddleCenter;glyph.raycastTarget=false;
            node.SetActive(false);return node;
        }
    }
}
