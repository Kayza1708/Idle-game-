using System;
using System.Globalization;
using IdleIntelligence.Core;
using UnityEngine;
namespace IdleIntelligence.Runtime
{
    public static class LearningPresentation
    {
        public static string Remaining(double seconds,string language,bool compact=false)
        {
            if(!ScientificNumber.Finite(seconds))return "—";var culture=CultureInfo.GetCultureInfo(language);seconds=Math.Max(0,seconds);
            if(seconds<60)return Math.Ceiling(seconds).ToString("0",culture)+" s";
            double minutes=Math.Ceiling(seconds/60);if(minutes<60)return minutes.ToString("0",culture)+(compact?"m":" min");
            return Math.Floor(minutes/60).ToString("0",culture)+(compact?"h":" h ")+(minutes%60).ToString("0",culture)+(compact?"m":" min");
        }
        public static Sprite Icon(GameRuntime game,bool training,string id)
        {
            int area=training?id=="quality"?2:id=="efficiency"?1:3:Workshop.ResearchArea(id);
            return area==1?game.HardwareSprites[1]:area==2?game.ModelPrefab.ModelArt:area==3?game.WorkshopPrefab.ComponentSprites[0]:game.ResearchTab.transform.Find("NavigationIcon").GetComponent<UnityEngine.UI.Image>().sprite;
        }
    }
}
