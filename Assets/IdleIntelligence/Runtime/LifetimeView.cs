using System;
using System.Linq;
using IdleIntelligence.Core;
using UnityEngine;
using UnityEngine.UI;
namespace IdleIntelligence.Runtime
{
    public sealed class LifetimeView:MonoBehaviour
    {
        GameRuntime game;Text summary,overview;Text[] hardware;Button detailsButton,masteryButton;bool detailsOpen,masteryOpen;
        public void Initialize(GameRuntime runtime)
        {
            game=runtime;
            WorkshopUIFactory.Label("LifetimeTitle",transform,"Dauerhafter Fortschritt",18,44);overview=WorkshopUIFactory.Label("LifetimeOverview",transform,"",14,72);overview.GetComponent<LayoutElement>().preferredHeight=-1;detailsButton=WorkshopUIFactory.Button("ShowLifetimeDetails",transform,"",()=>{detailsOpen=!detailsOpen;Refresh();});
            summary=WorkshopUIFactory.Label("LifetimeSummary",transform,"",14,650);summary.alignment=TextAnchor.UpperLeft;
            masteryButton=WorkshopUIFactory.Button("ShowHardwareMastery",transform,"",()=>{masteryOpen=!masteryOpen;Refresh();});
            hardware=Balance.Hardware.Select(h=>WorkshopUIFactory.Label("Mastery-"+h.Id,transform,"",14,54)).ToArray();
            Refresh();
        }
        void Update(){if(game!=null)Refresh();}
        void Refresh()
        {
            var s=game.State;var l=s.Lifetime;bool de=s.Settings.language=="de";overview.text=(de?"Hardware gekauft: ":"Hardware bought: ")+l.hardwareBought+"\nPrestiges: "+l.prestiges+"\n"+(de?"Forschung beendet: ":"Research completed: ")+l.researchCompleted+"\n"+(de?"Items hergestellt: ":"Items crafted: ")+l.itemsCrafted;detailsButton.GetComponentInChildren<Text>().text=(de?"Alle Statistiken":"All statistics")+(detailsOpen?"  −":"  +");masteryButton.GetComponentInChildren<Text>().text="Hardware-Mastery"+(masteryOpen?"  −":"  +");summary.gameObject.SetActive(detailsOpen);
            summary.text=(l.historicalUnavailable?"Historie vor dieser Migration ist nicht verfügbar. Alte Bestände wurden nicht als neue Ereignisse gezählt.\n\n":"Seit Beginn dieses Spielstands erfasst.\n\n")+
                (ChallengeRules.Active(s)?"Challenge-Labor: lokale Zähler. Hauptspielstatistik pausiert.\n\n":"Hauptspielstatistik\n\n")+
                "Hardware gekauft: "+l.hardwareBought+"\nTaschenrechner: "+l.calculatorsBought+"\nHardwareklassen: "+l.hardwareClasses.Length+"\nMeilensteine: "+l.milestones+
                "\nPrestiges: "+l.prestiges+"\nINT verdient: "+ScientificNumber.From(l.intEarned)+"\nLaborarbeit: "+Math.Floor(l.labSeconds)+" s\nAktive Zeit: "+Math.Floor(l.activeSeconds)+" s\nTraining gestartet / beendet: "+l.trainingStarted+" / "+l.trainingCompleted+
                "\nForschung gestartet / beendet: "+l.researchStarted+" / "+l.researchCompleted+"\nItems hergestellt: "+l.itemsCrafted+"\nItemtypen entdeckt: "+l.itemTypes.Length+"\nFusionen: "+l.itemsFused+"\nVeredelungen: "+l.forgeUpgrades+
                "\nKomponenten erhalten: "+l.componentsEarned+"\nMaterialtypen entdeckt: "+l.discoveredComponents.Length+"\nAnalysen beendet: "+l.analysesCompleted+"\nVergütete Taps: "+l.taps+"\nOverdrives: "+l.overclocks+"\nReguläre Credits: "+ScientificNumber.From(l.regularCredits)+"\nReguläre Daten: "+ScientificNumber.From(l.regularData);
            var width=Math.Max(220,summary.rectTransform.rect.width);var settings=summary.GetGenerationSettings(new Vector2(width,0));summary.GetComponent<LayoutElement>().preferredHeight=summary.cachedTextGenerator.GetPreferredHeight(summary.text,settings)/summary.pixelsPerUnit+24;
            for(int i=0;i<hardware.Length;i++){hardware[i].gameObject.SetActive(masteryOpen);hardware[i].text=Balance.Hardware[i].Name+" · Mastery "+Lifetime.Mastery(s,i)+"\n"+l.hardwareMasteryXp[i]+" XP";}
        }
    }
}
