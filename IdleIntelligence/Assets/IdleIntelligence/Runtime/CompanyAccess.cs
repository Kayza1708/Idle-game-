using IdleIntelligence.Core;
namespace IdleIntelligence.Runtime
{
    /// <summary>
    /// Separate social gate that does not alter the 60-node Prestige tree or its exported economy.
    /// Reaching 1,000 total INT is a local UI milestone; server membership needs a trusted proof.
    /// </summary>
    public static class CompanyAccess
    {
        public const int RequiredTotalINT=1000;
        public const int FounderGems=500;
        public static bool LocallyEligible(GameState state)=>
            state!=null &&
            !ChallengeRules.Active(state) &&
            state.Prestige.resets>=1 &&
            state.Prestige.Total.CompareTo(ScientificNumber.From(RequiredTotalINT))>=0;

        public static string Explanation(bool german,bool eligible)
        {
            if(german)return eligible
                ? "COMPANIES FREIGESCHALTET · 1.000 Gesamt-INT erreicht.\nDu kannst kostenlos einer Company beitreten, wenn sie offen ist, dich einlädt oder deine Bewerbung bestätigt. Eine eigene Company zu gründen kostet 500 servergeprüfte Gems.\nGemeinsame Forschung, Ranglisten und geprüfte Gutscheine sind online. Kein Chat.\nFür die Onlinefreigabe muss dein INT-Fortschritt erst sicher mit dem Konto verifiziert werden."
                : "COMPANIES · ab 1.000 Gesamt-INT\nEin späterer INT-Meilenstein öffnet das gemeinsame Forschungsnetzwerk. Der Beitritt ist kostenlos; für eine Gründung sind 500 Gems erforderlich. Handel und Ranglisten funktionieren nur mit geprüften Online-Guthaben. Kein Chat.";
            return eligible
                ? "COMPANIES UNLOCKED · 1,000 lifetime INT reached.\nJoin open Companies for free or accept an invitation / approved application. Founding costs 500 server-verified Gems. Shared research, verified vouchers and leaderboards require online account verification. No chat."
                : "COMPANIES · unlock at 1,000 lifetime INT.\nJoin for free; founding costs 500 Gems. Online research, leaderboards and voucher trading come later. No chat.";
        }
    }
}
