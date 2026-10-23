using System;
using System.Collections;
using UnityEngine;
using UnityEngine.UI;

namespace IdleIntelligence.Runtime
{
    /// <summary>
    /// Compact opt-in Company overview, leaderboard, verified voucher wallet and invitations.
    /// No chat, local save uploads, guest-token persistence, or forged stats.
    /// </summary>
    public sealed class CompanyHubView : MonoBehaviour
    {
        [Serializable] sealed class CompanyRow
        {public string id,name,tag,join_policy;public int member_count,rank;public long rp_lifetime,score;}
        [Serializable] sealed class CompanyRows
        {public CompanyRow[] companies;public string ranking,season;}
        [Serializable] sealed class PlayerRow
        {public string id,name,company_tag;public int rank;public long rp;}
        [Serializable] sealed class PlayerRows
        {public PlayerRow[] players;public string ranking;}
        [Serializable] sealed class VoucherWallet
        {public long verifiedBalance;public bool localVouchersTransferable;}
        [Serializable] sealed class InviteRow
        {public string id,company_id,company_name,company_tag;public long expires_at;}
        [Serializable] sealed class InviteRows
        {public InviteRow[] invitations;}
        [Serializable] sealed class TradeRow
        {public string id,seller_id,want_kind,want_id;public long quantity,want_qty;public long expires_at;}
        [Serializable] sealed class TradeRows
        {public TradeRow[] offers;}

        GameRuntime game;
        CompanyApiClient api;
        Transform content;
        Text status;
        int pendingSequence;
        public void Initialize(GameRuntime runtime)
        {
            game=runtime;
            api=FindObjectOfType<CompanyApiClient>();
            bool de=game.State.Settings.language=="de";
            WorkshopUIFactory.Label("CompanyHeading",transform,"COMPANIES",20,44);
            status=WorkshopUIFactory.Label("CompanyState",transform,"",15,44);
            status.gameObject.AddComponent<ContentTextHeight>();
            var tabs=WorkshopUIFactory.Horizontal("CompanyTabs",transform).transform;
            WorkshopUIFactory.Button("CompanyLeaderboard",tabs,de?"Rang":"Rank",()=>LoadCompanies(false));
            WorkshopUIFactory.Button("CompanyMonth",tabs,"Season",()=>LoadCompanies(true));
            WorkshopUIFactory.Button("PlayerRankings",tabs,de?"Spieler":"Players",LoadPlayers);
            var nav=WorkshopUIFactory.Horizontal("CompanySecondary",transform).transform;
            WorkshopUIFactory.Button("CompanySearch",nav,de?"Suchen":"Find",Search);
            WorkshopUIFactory.Button("CompanyVouchers",nav,de?"Tickets":"Vouchers",LoadVouchers);
            WorkshopUIFactory.Button("CompanyInvites",nav,de?"Einladungen":"Invites",LoadInvitations);
            content=WorkshopUIFactory.Vertical("CompanyResults",transform).transform;
            ShowGate();
            foreach(var text in GetComponentsInChildren<Text>())
                if(text.name=="CompanySafeAuth"||text.name=="CompanyAccountPending")text.gameObject.AddComponent<ContentTextHeight>();
        }
        void ShowGate()
        {
            WorkshopUIFactory.Clear(content);
            bool unlocked=CompanyAccess.LocallyEligible(game.State);
            bool de=game.State.Settings.language=="de";
            status.text=de?(unlocked?"1.000 Gesamt-INT erreicht · Online-Prüfung erforderlich.\nBeitritt kostenlos · Gründung: 500 geprüfte Gems.":"Ab 1.000 Gesamt-INT · gemeinsames Forschungsnetz.\nBeitritt kostenlos · verifiziertes Onlinekonto erforderlich."):(unlocked?"1,000 lifetime INT reached · online verification required.\nFree to join · founding: 500 verified Gems.":"Unlocks at 1,000 lifetime INT · shared research network.\nFree to join · verified online account required.");
            var explanation=WorkshopUIFactory.Label("CompanyAccessExplanation",content,CompanyAccess.Explanation(de,unlocked),15,44);
            explanation.gameObject.AddComponent<ContentTextHeight>();
            explanation.gameObject.SetActive(false);
            var details=WorkshopUIFactory.Button("CompanyAccessDetails",content,de?"Zugang und Regeln":"Access and rules",()=>explanation.gameObject.SetActive(!explanation.gameObject.activeSelf));
            details.transform.SetAsFirstSibling();
            if(!unlocked) {WorkshopUIFactory.Button("CompanyPrestige",content,
                game.State.Settings.language=="de"?"Zum INT-Netz":"INT network",()=>game.UserShow("prestige"));return;}
            WorkshopUIFactory.Button("CompanyMira",content,game.State.Settings.language=="de"?"Miras Erklärung":"Mira explains",()=>game.UserShow("story"));
            WorkshopUIFactory.Label("CompanySafeAuth",content,
                game.State.Settings.language!="de"?"Online profiles and trading balances require a verified player identity. No email is required. Unverified local Gems and vouchers cannot be used online.":"Online-Profil und Handelsbestand müssen sicher mit deiner Spieler-ID verknüpft sein. "+
                "Es werden keine E-Mails benötigt. Ungeprüfte lokale Gems und Tickets sind online nicht verwendbar.",14,120);
            if(api==null||!api.IsConfigured)
                WorkshopUIFactory.Label("CompanyAccountPending",content,
                    game.State.Settings.language=="de"?"Online-Anbindung noch nicht eingerichtet. Company-Ranglisten und Handel benötigen den verifizierten Serverzugang.":"Online connection is not configured. Company rankings and trading require verified server access.",14,104);
            else LoadCompanies(false); // Public rankings do not require guest registration.
        }
        bool Ready(bool sessionRequired)
        {
            if(game==null||!CompanyAccess.LocallyEligible(game.State)){ShowGate();return false;}
            if(api==null||!api.IsConfigured||(sessionRequired&&!api.HasSession)){
                bool de=game.State.Settings.language=="de";
                status.text=api==null||!api.IsConfigured?(de?"Online-Anbindung noch nicht eingerichtet.":"Online connection is not configured."):(de?"Onlinekonto noch nicht sicher verbunden. Offline-Fortschritt bleibt lokal.":"Online account is not verified. Offline progress remains local.");
                return false;
            }
            return true;
        }
        void Run(Func<Action<long,string>,IEnumerator> request,Action<string> draw,bool sessionRequired=true)
        {
            if(!Ready(sessionRequired))return;
            int id=++pendingSequence;
            status.text="Lade Daten…";
            StartCoroutine(request((code,json)=>{
                if(this==null||id!=pendingSequence)return;
                if(code<200||code>=300){
                    status.text=code==403?"Zugang noch nicht serverseitig bestätigt.":code==401?
                        "Gastsitzung nicht verbunden oder abgelaufen.":"Online-Anfrage fehlgeschlagen · "+code;
                    return;
                }
                status.text="Online · verifizierte Daten";
                try{draw(json);}catch(Exception){status.text="Antwort konnte nicht angezeigt werden.";}
            }));
        }
        static T Parse<T>(string json) where T:class=>JsonUtility.FromJson<T>(json);
        void Paragraph(string text,int height=64)
        {
            var row=WorkshopUIFactory.Label("CompanyRow",content,text,15,44);
            row.gameObject.AddComponent<ContentTextHeight>();
        }
        void LoadCompanies(bool monthly)
        {
            Run(cb=>monthly?api.CompanySeasonLeaderboard(cb):api.CompanyLeaderboard(cb),
            json=>{
                var data=Parse<CompanyRows>(json);
                WorkshopUIFactory.Clear(content);
                Paragraph(monthly?"MONATLICHE COMPANY-RANGLISTE · geprüfte RP":"COMPANY-RANGLISTE · Gesamt-RP");
                if(data?.companies==null||data.companies.Length==0){Paragraph("Noch keine gewerteten Companies.");return;}
                int place=0;
                foreach(var row in data.companies){
                    int rank=row.rank>0?row.rank:++place;
                    Paragraph("#"+rank+" · "+row.name+" ["+row.tag+"]\n"+
                        (monthly?row.score:row.rp_lifetime)+" RP · "+row.member_count+"/50 Mitglieder",76);
                }
            },false);
        }
        void LoadPlayers()
        {
            Run(api.PlayerLeaderboard,json=>{
                var data=Parse<PlayerRows>(json);
                WorkshopUIFactory.Clear(content);
                Paragraph("SPIELER-RANGLISTE · Nur freiwillig öffentlich gemachte, servergeprüfte Company-RP.");
                if(data?.players==null||data.players.Length==0){Paragraph("Noch keine öffentlichen Rangplätze.");return;}
                foreach(var p in data.players){
                    Paragraph("#"+p.rank+" · "+p.name+" ["+p.company_tag+"] · "+p.rp+" RP",58);
                }
            },false);
        }
        void Search()
        {
            Run(cb=>api.FindCompanies("",cb),json=>{
                // The existing search endpoint returns {companies:[...]}.
                var data=Parse<CompanyRows>(json);
                WorkshopUIFactory.Clear(content);
                Paragraph("COMPANIES FINDEN · Offene Beitritte gratis, geschlossene nur mit Einladung.");
                if(data?.companies==null||data.companies.Length==0){Paragraph("Keine Company gefunden.");return;}
                foreach(var row in data.companies){
                    var companyId=row.id;
                    Paragraph(row.name+" ["+row.tag+"] · "+row.member_count+"/50 · "+
                        (row.join_policy=="apply"?"Bewerbung":row.join_policy=="invite"?"Einladung":"Offen"),65);
                    if(row.member_count>=50||row.join_policy=="invite")continue;
                    bool apply=row.join_policy=="apply";
                    WorkshopUIFactory.Button("CompanyJoin-"+companyId,content,apply?"Bewerben":"Beitreten",()=>
                        Run(cb=>apply?api.ApplyToCompany(companyId,cb):api.JoinCompany(companyId,cb),
                          response=>{WorkshopUIFactory.Clear(content);Paragraph(apply?
                          "Bewerbung übermittelt. Entscheidung abwarten.":"Beitritt serverseitig bestätigt.");}));
                }
            },false);
        }
        void LoadVouchers()
        {
            Run(api.MyVerifiedVouchers,json=>{
                var data=Parse<VoucherWallet>(json);
                WorkshopUIFactory.Clear(content);
                Paragraph("GEPRÜFTE GUMBALL-GUTSCHEINE · "+data.verifiedBalance,78);
                Paragraph("Die lokalen Gutschein-Funde aus Kisten/Seasons sind nicht automatisch auf andere Accounts übertragbar.",85);
                WorkshopUIFactory.Button("CompanyVoucherOffers",content,"Angebote ansehen",LoadVoucherOffers);
            });
        }
        void LoadVoucherOffers()
        {
            Run(api.VoucherTradeOffers,json=>{
                var data=Parse<TradeRows>(json);
                WorkshopUIFactory.Clear(content);
                Paragraph("GUTSCHEIN-HANDEL · Nur in deiner Company · kein Chat");
                if(data?.offers==null||data.offers.Length==0){Paragraph("Keine offenen Angebote.");return;}
                foreach(var row in data.offers){
                    string tradeId=row.id;
                    Paragraph(row.quantity+" × Gumball-Gutschein gegen "+row.want_qty+" × "+row.want_id+" ("+row.want_kind+")",86);
                    WorkshopUIFactory.Button("CompanyVoucherBuy-"+tradeId,content,"Angebot annehmen",()=>
                        Run(cb=>api.AcceptVoucherTrade(tradeId,cb),
                            response=>{WorkshopUIFactory.Clear(content);Paragraph("Handel bestätigt. Server prüft Besitz und Escrow.");}));
                }
            });
        }
        void LoadInvitations()
        {
            Run(api.MyCompanyInvitations,json=>{
                var data=Parse<InviteRows>(json);
                WorkshopUIFactory.Clear(content);
                Paragraph("EINLADUNGEN · keine Direktnachrichten");
                if(data?.invitations==null||data.invitations.Length==0){Paragraph("Keine offenen Einladungen.");return;}
                foreach(var invite in data.invitations){
                    string id=invite.id;
                    Paragraph(invite.company_name+" ["+invite.company_tag+"]",60);
                    WorkshopUIFactory.Button("CompanyAccept-"+id,content,"Annehmen",()=>
                        Run(cb=>api.AcceptInvitation(id,cb),response=>LoadInvitations()));
                    WorkshopUIFactory.Button("CompanyDecline-"+id,content,"Ablehnen",()=>
                        Run(cb=>api.DeclineInvitation(id,cb),response=>LoadInvitations()));
                }
            });
        }
        void OnDisable(){pendingSequence++;StopAllCoroutines();}
    }
}
