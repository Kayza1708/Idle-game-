using System;
using UnityEngine;
namespace IdleIntelligence.Runtime
{
    [CreateAssetMenu(menuName="Idle Intelligence/Online Services",fileName="OnlineServicesConfiguration")]
    public sealed class OnlineServicesConfiguration : ScriptableObject
    {
        [Tooltip("Your deployed Cloudflare Worker HTTPS URL, without trailing slash. Leave empty for offline mode.")]
        public string cloudflareApiUrl="";
        [Tooltip("Google public Web OAuth client ID, must also be authorized on the backend.")]
        public string googleClientId="";
        [Tooltip("Sign in with Apple client/service ID must also be authorized on the backend.")]
        public string appleClientId="";
        public bool Valid
        {
            get {
                Uri url;
                return Uri.TryCreate(cloudflareApiUrl,UriKind.Absolute,out url)&&
                    url.Scheme==Uri.UriSchemeHttps&&url.UserInfo.Length==0&&
                    string.IsNullOrEmpty(url.Query)&&string.IsNullOrEmpty(url.Fragment);
            }
        }
    }
}
