using IdleIntelligence.Core;
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
        {public TradeLimit tradeLimit;public long verifiedBalance;public bool localVouchersTransferable;}
        [Serializable] sealed class InviteRow
        {public string id,company_id,company_name,company_tag;public long expires_at;}
        [Serializable] sealed class InviteRows
        {public InviteRow[] invitations;}
        [Serializable] sealed class TradeRow
        {public string id,seller_id,seller_name,give_kind,give_id,want_kind,want_id;public long quantity,give_qty,want_qty;public long expires_at;}
        [Serializable] sealed class TradeLimit { public int used,limit; public long resetAt; }
        [Serializable] sealed class TradeRows
        {public TradeLimit tradeLimit;public TradeRow[] offers;}

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
            WorkshopUIFactory.Button("CompanyGoods",transform,de?"Warenhandel":"Goods trading",LoadGoods);
            WorkshopUIFactory.Button("CompanyPrivacy",transform,de?"Datenschutz / Konto":"Privacy / account",ShowPrivacy);
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
            if(api!=null&&api.IsConfigured&&game.Online!=null)
            {
                if(!api.HasSession)
                {
                    WorkshopUIFactory.Label("CompanyGuestCaution",content,de?
                      "Gastkonto: nur serverseitig erzeugte Ranglisten-/Company-Bestände. Lokale Gems, Items und INT werden nicht verifiziert.":
                      "Guest account: only server-issued rankings and Company assets are trusted; local Gems, Items and INT are not verified.",13,88);
                    WorkshopUIFactory.Button("CompanyConnectGuest",content,
                      de?"Online-Gastkonto erstellen":"Create online guest account",()=>{
                        game.Online.CreateGuestAccount(ok=>{if(this!=null)ShowGate();});
                      });
#if UNITY_IOS && !UNITY_EDITOR
                    WorkshopUIFactory.Button("CompanyConnectApple",content,
                      de?"Mit Apple verbinden":"Connect with Apple",()=>{
                        game.Online.SignInWithApple(ok=>{if(this!=null)ShowGate();});
                      });
#endif
                }
                else
                {
                    WorkshopUIFactory.Label("CompanyAuthState",content,de?
                      "Sitzung verbunden. Company-Zugang und Handel erfordern trotzdem serverseitig geprüfte Berechtigungen.":
                      "Session connected. Company access and trading still require server-verified entitlements.",13,90);
                    WorkshopUIFactory.Button("CompanyDisconnect",content,
                      de?"Online-Konto trennen":"Disconnect online account",()=>{
                        game.Online.Disconnect();ShowGate();
                      });
#if UNITY_IOS && !UNITY_EDITOR
                    WorkshopUIFactory.Button("CompanyLinkApple",content,
                      de?"Apple-Konto sicher verknüpfen":"Securely link Apple account",()=>{
                        game.Online.SignInWithApple(ok=>{if(this!=null)ShowGate();});
                      });
#endif
                }
            }
            if(api==null||!api.IsConfigured)
                WorkshopUIFactory.Label("CompanyAccountPending",content,
                    game.State.Settings.language=="de"?"Online-Anbindung noch nicht eingerichtet. Company-Ranglisten und Handel benötigen den verifizierten Serverzugang.":"Online connection is not configured. Company rankings and trading require verified server access.",14,104);
            else LoadCompanies(false); // Public rankings do not require guest registration.
        }
        bool Ready(bool sessionRequired,bool accountAction=false)
        {
            if(game==null||!accountAction&&!CompanyAccess.LocallyEligible(game.State)){ShowGate();return false;}
            if(api==null||!api.IsConfigured||(sessionRequired&&!api.HasSession)){
                bool de=game.State.Settings.language=="de";
                status.text=api==null||!api.IsConfigured?(de?"Online-Anbindung noch nicht eingerichtet.":"Online connection is not configured."):(de?"Onlinekonto noch nicht sicher verbunden. Offline-Fortschritt bleibt lokal.":"Online account is not verified. Offline progress remains local.");
                return false;
            }
            return true;
        }
        void Run(Func<Action<long,string>,IEnumerator> request,Action<string> draw,bool sessionRequired=true,bool accountAction=false)
        {
            if(!Ready(sessionRequired,accountAction))return;
            int id=++pendingSequence;
            status.text="Lade Daten…";
            StartCoroutine(request((code,json)=>{
                if(this==null||id!=pendingSequence)return;
                if(code<200||code>=300){
                    if(json.Contains("daily_trade_limit")){status.text=game.State.Settings.language=="de"?"Tageslimit erreicht: fünf abgeschlossene Handel pro Person. Reset 00:00 UTC.":"Daily limit reached: five completed trades per player. Resets 00:00 UTC.";return;}
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
            Run(cb=>api.PlayerLeaderboard(cb),json=>{
                var data=Parse<PlayerRows>(json);
                WorkshopUIFactory.Clear(content);
                Paragraph("SPIELER-RANGLISTE · Nur freiwillig öffentlich gemachte, servergeprüfte Company-RP.");
                if(data?.players==null||data.players.Length==0){Paragraph("Noch keine öffentlichen Rangplätze.");return;}
                foreach(var p in data.players){
                    var playerId=p.id;WorkshopUIFactory.Button("ReportPlayer-"+playerId,content,"Melden / Blockieren",()=>Moderate("player",playerId));
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
                    var companyId=row.id;WorkshopUIFactory.Button("ReportCompany-"+companyId,content,"Company melden",()=>Moderate("company",companyId));
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
        [Serializable] sealed class OnlinePrivacy {public PrivacyValues privacy;}
        [Serializable] sealed class PrivacyValues {public bool badges,playtime,maxCompute,prestiges,rank;public bool @int;}
        [Serializable] sealed class BlockRow {public string blocked_id,display_name;}
        [Serializable] sealed class BlockRows {public BlockRow[] blocked;}
        void Moderate(string type,string id){WorkshopUIFactory.Clear(content);Paragraph("Meldung: feste Gründe, kein Chat. / Fixed report reasons, no chat.");foreach(var reason in new[]{"name","fraud","harassment","other"}){string code=reason;string label=reason=="name"?"Ungeeigneter Name":reason=="fraud"?"Betrug":reason=="harassment"?"Belästigung":"Sonstiger Missbrauch";WorkshopUIFactory.Button("SubmitReport-"+code,content,label,()=>Run(cb=>api.Report(type,id,code,cb),json=>{WorkshopUIFactory.Clear(content);Paragraph("Meldung übermittelt / Report received.");}));}if(type=="player")WorkshopUIFactory.Button("BlockPlayer",content,"Spieler blockieren",()=>Run(cb=>api.BlockPlayer(id,true,cb),json=>{WorkshopUIFactory.Clear(content);Paragraph("Blockiert: Einladungen und Handel sind gesperrt. / Blocked: invitations and trading disabled.");}));}
        void ShowPrivacy(){WorkshopUIFactory.Clear(content);bool de=game.State.Settings.language=="de";Paragraph(de?"Online-Statistiken bleiben ohne ausdrückliche Freigabe privat. Keine lokalen Bestände hochladen.":"Online statistics stay private unless explicitly shared. Local inventories are never uploaded.",90);WorkshopUIFactory.Button("MakeProfilePrivate",content,de?"Alle Statistiken privat setzen":"Make all statistics private",()=>Run(cb=>api.UpdateProfilePrivacy("{\"badges\":false,\"playtime\":false,\"maxCompute\":false,\"prestiges\":false,\"int\":false,\"rank\":false}",cb),json=>{status.text=de?"Privat gespeichert.":"Privacy saved.";},true,true));WorkshopUIFactory.Button("ManageBlockedPlayers",content,de?"Blockierte Spieler":"Blocked players",()=>Run(cb=>api.BlockedPlayers(cb),json=>{var rows=Parse<BlockRows>(json);WorkshopUIFactory.Clear(content);foreach(var row in rows.blocked??Array.Empty<BlockRow>()){string id=row.blocked_id;WorkshopUIFactory.Button("Unblock-"+id,content,(row.display_name??id)+" · "+(de?"Freigeben":"Unblock"),()=>Run(cb=>api.BlockPlayer(id,false,cb),value=>ShowPrivacy(),true,true));}if(rows.blocked==null||rows.blocked.Length==0)Paragraph(de?"Keine blockierten Spieler.":"No blocked players.");},true,true));WorkshopUIFactory.Button("DeleteOnlineAccount",content,de?"Onlinekonto löschen…":"Delete online account…",()=>{WorkshopUIFactory.Clear(content);Paragraph(de?"Löscht dein Onlinekonto, Sitzungen und serverseitige Bestände endgültig. Eine bestehende Company geht an ein Mitglied über; eine allein geführte Company entfällt. Der lokale Spielstand bleibt erhalten.":"Permanently deletes the online account, sessions and server inventory. A Company passes to another member; a sole-member Company is removed. Your local save remains.",200);WorkshopUIFactory.Button("CancelAccountDeletion",content,de?"Abbrechen":"Cancel",ShowPrivacy);WorkshopUIFactory.Button("ConfirmAccountDeletion",content,de?"Onlinekonto endgültig löschen":"Permanently delete online account",()=>Run(cb=>api.DeleteOnlineAccount(cb),json=>{api.ClearSession();WorkshopUIFactory.Clear(content);Paragraph(de?"Onlinekonto gelöscht. Lokaler Spielstand erhalten.":"Online account deleted. Local save preserved.");},true,true));});}
        void LoadVouchers()
        {
            Run(cb=>api.MyVerifiedVouchers(cb),json=>{
                var data=Parse<VoucherWallet>(json);
                WorkshopUIFactory.Clear(content);
                Paragraph("GEPRÜFTE GUMBALL-GUTSCHEINE · "+data.verifiedBalance,78);
                TradeAllowance(data.tradeLimit);
                Paragraph("Die lokalen Gutschein-Funde aus Kisten/Seasons sind nicht automatisch auf andere Accounts übertragbar.",85);
                WorkshopUIFactory.Button("CompanyVoucherOffers",content,"Angebote ansehen",LoadVoucherOffers);
            });
        }
        void LoadGoods(){Run(cb=>api.CompanyTradeOffers(cb),json=>{var data=Parse<TradeRows>(json);WorkshopUIFactory.Clear(content);bool de=game.State.Settings.language=="de";TradeAllowance(data.tradeLimit);WorkshopUIFactory.Button("VerifiedInventory",content,de?"Verifizierte Bestände":"Verified inventory",()=>Run(cb=>api.MyTradeInventory(cb),raw=>{var inventory=Parse<GoodsInventory>(raw);WorkshopUIFactory.Clear(content);TradeAllowance(inventory.tradeLimit);foreach(var item in inventory.assets??Array.Empty<GoodsAsset>())Paragraph(item.quantity+" × "+SettingsRules.Text(game.State.Settings.language,(item.kind=="component"?"component:":"item:")+item.asset_id));if(inventory.assets==null||inventory.assets.Length==0)Paragraph(de?"Keine serverseitig verifizierten Waren. Lokale Funde sind nicht übertragbar.":"No server-verified goods. Local finds cannot be transferred.",80);}));foreach(var row in data.offers??Array.Empty<TradeRow>()){string id=row.id;Paragraph(row.seller_name+": "+row.give_qty+" × "+row.give_id+" → "+row.want_qty+" × "+row.want_id,70);var accept=WorkshopUIFactory.Button("GoodsAccept-"+id,content,de?"Annehmen":"Accept",()=>Run(cb=>api.AcceptTrade(id,cb),value=>LoadGoods()));accept.interactable=data.tradeLimit!=null&&data.tradeLimit.used<data.tradeLimit.limit;}if(data.offers==null||data.offers.Length==0)Paragraph(de?"Keine offenen Warenangebote.":"No open goods offers.");});}
        [Serializable] sealed class GoodsAsset{public string kind,asset_id;public long quantity;}
        [Serializable] sealed class GoodsInventory{public TradeLimit tradeLimit;public GoodsAsset[] assets;}
        void TradeAllowance(TradeLimit data) { if(data==null){Paragraph("Handelslimit wird vom Server geprüft.");return;} bool de=game.State.Settings.language=="de";Paragraph(data.used+"/"+data.limit+(de?" Handel heute · Reset ":" trades today · reset ")+DateTimeOffset.FromUnixTimeSeconds(data.resetAt).UtcDateTime.ToString("HH:mm")+" UTC",48); }
        void LoadVoucherOffers()
        {
            Run(cb=>api.VoucherTradeOffers(cb),json=>{
                var data=Parse<TradeRows>(json);
                WorkshopUIFactory.Clear(content);
                Paragraph("GUTSCHEIN-HANDEL · Nur in deiner Company · kein Chat");
                TradeAllowance(data.tradeLimit);
                if(data?.offers==null||data.offers.Length==0){Paragraph("Keine offenen Angebote.");return;}
                foreach(var row in data.offers){
                    string tradeId=row.id;
                    Paragraph(row.quantity+" × Gumball-Gutschein gegen "+row.want_qty+" × "+row.want_id+" ("+row.want_kind+")",86);
                    var accept=WorkshopUIFactory.Button("CompanyVoucherBuy-"+tradeId,content,"Angebot annehmen",()=>
                        Run(cb=>api.AcceptVoucherTrade(tradeId,cb),
                            response=>{WorkshopUIFactory.Clear(content);Paragraph("Handel bestätigt. Server prüft Besitz und Escrow.");}));accept.interactable=data.tradeLimit!=null&&data.tradeLimit.used<data.tradeLimit.limit;
                }
            });
        }
        void LoadInvitations()
        {
            Run(cb=>api.MyCompanyInvitations(cb),json=>{
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
