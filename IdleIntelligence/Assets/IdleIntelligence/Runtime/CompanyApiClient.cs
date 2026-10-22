using System;
using System.Collections;
using System.Text;
using UnityEngine;
using UnityEngine.Networking;

namespace IdleIntelligence.Runtime
{
    // Transport-only bridge. Never trusts Unity saves as a source of online items, RP or Gems.
    // The bearer token must be supplied by an authenticated session provider.
    public sealed class CompanyApiClient : MonoBehaviour
    {
        [SerializeField] private string apiBaseUrl = "";
        private string accessToken = "";

        public void Configure(string baseUrl, string bearerToken)
        {
            apiBaseUrl = (baseUrl ?? "").Trim().TrimEnd('/');
            accessToken = bearerToken ?? "";
        }

        public IEnumerator MyPublicProfile(string playerId, Action<long, string> completed)
        {
            return Send("GET", "/v1/players/" + Uri.EscapeDataString(playerId ?? "") + "/profile", null, completed);
        }
        public IEnumerator MyPrivateProfile(Action<long, string> completed)
        {
            return Send("GET", "/v1/profile", null, completed);
        }
        public IEnumerator UpdateProfilePrivacy(string json, Action<long, string> completed)
        {
            return Send("PATCH", "/v1/profile/privacy", json, completed);
        }
        public IEnumerator EquipFrame(string frameId, Action<long, string> completed)
        {
            return Send("POST", "/v1/profile/frame", JsonUtility.ToJson(new FrameSelection { frameId = frameId }), completed);
        }
        public IEnumerator SetMemberRole(string playerId, string role, Action<long, string> completed)
        {
            return Send("POST", "/v1/company/members/" + Uri.EscapeDataString(playerId ?? "") + "/role",
                JsonUtility.ToJson(new RoleUpdate { role = role }), completed);
        }
        public IEnumerator RemoveMember(string playerId, Action<long, string> completed)
        {
            return Send("POST", "/v1/company/members/" + Uri.EscapeDataString(playerId ?? "") + "/kick", "{}", completed);
        }
        public IEnumerator TransferLeadership(string playerId, Action<long, string> completed)
        {
            return Send("POST", "/v1/company/leadership/transfer", JsonUtility.ToJson(new PlayerSelection { playerId = playerId }), completed);
        }
        public IEnumerator MyCompanyInvitations(Action<long, string> completed)
        {
            return Send("GET", "/v1/me/invitations", null, completed);
        }
        public IEnumerator InvitePlayer(string playerId, Action<long, string> completed)
        {
            return Send("POST", "/v1/company/invitations",
                JsonUtility.ToJson(new PlayerSelection { playerId = playerId }), completed);
        }
        public IEnumerator AcceptInvitation(string invitationId, Action<long, string> completed)
        {
            return Send("POST", "/v1/me/invitations/" + Uri.EscapeDataString(invitationId ?? "") + "/accept", "{}", completed);
        }
        public IEnumerator DeclineInvitation(string invitationId, Action<long, string> completed)
        {
            return Send("POST", "/v1/me/invitations/" + Uri.EscapeDataString(invitationId ?? "") + "/decline", "{}", completed);
        }
        public IEnumerator RevokeInvitation(string invitationId, Action<long, string> completed)
        {
            return Send("POST", "/v1/company/invitations/" + Uri.EscapeDataString(invitationId ?? "") + "/revoke", "{}", completed);
        }
        public IEnumerator CompanyTradeOffers(Action<long, string> completed)
        {
            return Send("GET", "/v1/trades/offers", null, completed);
        }
        public IEnumerator MyTradeInventory(Action<long, string> completed)
        {
            return Send("GET", "/v1/trades/inventory", null, completed);
        }
        public IEnumerator CreateTradeOffer(string json, Action<long, string> completed)
        {
            return Send("POST", "/v1/trades/offers", json, completed);
        }
        public IEnumerator AcceptTrade(string offerId, Action<long, string> completed)
        {
            return Send("POST", "/v1/trades/" + Uri.EscapeDataString(offerId ?? "") + "/accept", "{}", completed);
        }
        public IEnumerator CancelTrade(string offerId, Action<long, string> completed)
        {
            return Send("POST", "/v1/trades/" + Uri.EscapeDataString(offerId ?? "") + "/cancel", "{}", completed);
        }

        public IEnumerator CreateGuest(Action<long, string> completed)
        {
            return Send("POST", "/v1/session/guest", "{}", completed, false);
        }
        public IEnumerator MyProfile(Action<long, string> completed)
        {
            return Send("GET", "/v1/me", null, completed);
        }
        public IEnumerator MyCompany(Action<long, string> completed)
        {
            return Send("GET", "/v1/company", null, completed);
        }
        public IEnumerator FindCompanies(string query, Action<long, string> completed)
        {
            return Send("GET", "/v1/companies?q=" + Uri.EscapeDataString(query ?? ""), null, completed);
        }
        public IEnumerator CompanyLeaderboard(Action<long, string> completed)
        {
            return Send("GET", "/v1/leaderboards/companies", null, completed);
        }
        public IEnumerator CreateCompany(string name, string tag, Action<long, string> completed)
        {
            return Send("POST", "/v1/companies", JsonUtility.ToJson(new CompanyCreate { name = name, tag = tag }), completed);
        }
        public IEnumerator JoinCompany(string companyId, Action<long, string> completed)
        {
            return Send("POST", "/v1/companies/" + Uri.EscapeDataString(companyId ?? "") + "/join", "{}", completed);
        }
        public IEnumerator LeaveCompany(Action<long, string> completed)
        {
            return Send("POST", "/v1/company/leave", "{}", completed);
        }
        public IEnumerator ClaimResearch(Action<long, string> completed)
        {
            return Send("POST", "/v1/company/claim", "{}", completed);
        }
        public IEnumerator UpgradeResearch(string nodeId, Action<long, string> completed)
        {
            return Send("POST", "/v1/company/research", JsonUtility.ToJson(new ResearchUpgrade { nodeId = nodeId }), completed);
        }

        public IEnumerator Send(string method, string path, string json, Action<long, string> completed, bool requiresSession = true)
        {
            Uri endpoint;
            if (!Uri.TryCreate(apiBaseUrl, UriKind.Absolute, out endpoint) ||
                (endpoint.Scheme != Uri.UriSchemeHttps && !AllowLocalEditorHttp(endpoint)))
            {
                completed?.Invoke(0, "Cloudflare API URL is missing or not HTTPS");
                yield break;
            }
            if (requiresSession && string.IsNullOrEmpty(accessToken))
            {
                completed?.Invoke(401, "Missing authenticated session");
                yield break;
            }
            Uri address;
            try { address = new Uri(endpoint.AbsoluteUri.TrimEnd('/') + path); }
            catch (UriFormatException)
            {
                completed?.Invoke(0, "Invalid Company API endpoint");
                yield break;
            }
            using (var request = new UnityWebRequest(address, method))
            {
                request.downloadHandler = new DownloadHandlerBuffer();
                request.timeout = 20;
                if (json != null)
                {
                    request.uploadHandler = new UploadHandlerRaw(Encoding.UTF8.GetBytes(json));
                    request.SetRequestHeader("Content-Type", "application/json");
                }
                if (requiresSession) request.SetRequestHeader("Authorization", "Bearer " + accessToken);
                yield return request.SendWebRequest();
                string body = request.downloadHandler != null ? request.downloadHandler.text : "";
                completed?.Invoke(request.responseCode, body);
            }
        }

        private static bool AllowLocalEditorHttp(Uri url)
        {
#if UNITY_EDITOR
            return url.Scheme == Uri.UriSchemeHttp &&
                   (url.Host == "localhost" || url.Host == "127.0.0.1");
#else
            return false;
#endif
        }

        [Serializable] private sealed class FrameSelection { public string frameId; }
        [Serializable] private sealed class RoleUpdate { public string role; }
        [Serializable] private sealed class PlayerSelection { public string playerId; }
        [Serializable] private sealed class CompanyCreate { public string name; public string tag; }
        [Serializable] private sealed class ResearchUpgrade { public string nodeId; }
    }
}
