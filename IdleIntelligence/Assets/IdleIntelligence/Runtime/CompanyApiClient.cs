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

        [Serializable] private sealed class CompanyCreate { public string name; public string tag; }
        [Serializable] private sealed class ResearchUpgrade { public string nodeId; }
    }
}
