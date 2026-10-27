using System.Collections;
using IdleIntelligence.Core;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

namespace IdleIntelligence.Runtime
{
    // A real entry scene: the first rendered frame precedes scene IO and save initialization.
    // No timers, fabricated percentages, save writes or reward logic live here.
    public sealed class GameBoot : MonoBehaviour
    {
        public static bool HoldForCapture;
        public bool Ready { get; private set; }
        public Text Status { get; private set; }
        string language;
        Canvas canvas;
        IEnumerator Start()
        {
            DontDestroyOnLoad(gameObject);
            language = Language(Application.systemLanguage);
            canvas = new GameObject("StartupCanvas", typeof(RectTransform), typeof(Canvas), typeof(CanvasScaler), typeof(GraphicRaycaster)).GetComponent<Canvas>();
            canvas.transform.SetParent(transform, false);
            canvas.renderMode = RenderMode.ScreenSpaceOverlay;
            canvas.sortingOrder = 30000;
            var scale = canvas.GetComponent<CanvasScaler>();
            scale.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
            scale.referenceResolution = new Vector2(390, 846);
            scale.matchWidthOrHeight = 0;
            var backdrop = WorkshopUIFactory.Node("StartupBackground", canvas.transform, typeof(Image));
            WorkshopUIFactory.Fill((RectTransform)backdrop.transform);
            backdrop.GetComponent<Image>().color = GameTheme.Background;
            var safe = WorkshopUIFactory.Node("StartupSafeArea", canvas.transform);
            WorkshopUIFactory.Fill((RectTransform)safe.transform);
            safe.AddComponent<SafeArea>();
            var layout = WorkshopUIFactory.Vertical("StartupContent", safe.transform);
            var rect = (RectTransform)layout.transform;
            rect.anchorMin = new Vector2(0, .23f); rect.anchorMax = new Vector2(1, .77f);
            rect.offsetMin = new Vector2(20, 0); rect.offsetMax = new Vector2(-20, 0);
            var fit = layout.GetComponent<ContentSizeFitter>(); if (fit != null) Destroy(fit);
            var group = layout.GetComponent<VerticalLayoutGroup>(); group.childAlignment = TextAnchor.MiddleCenter; group.spacing = 16;
            var title = WorkshopUIFactory.Label("StartupTitle", layout.transform, "IDLE INTELLIGENCE", 26, 48);
            title.font = GameTheme.Display; title.alignment = TextAnchor.MiddleCenter;
            var art = WorkshopUIFactory.Node("StartupLaboratory", layout.transform, typeof(Image), typeof(LayoutElement));
            art.GetComponent<LayoutElement>().preferredHeight = 200;
            var image = art.GetComponent<Image>(); image.sprite = Resources.Load<Sprite>("Laboratory"); image.preserveAspect = true; image.raycastTarget = false;
            Status = WorkshopUIFactory.Label("StartupStatus", layout.transform, Copy("Labor wird geladen"), 16, 72);
            Status.alignment = TextAnchor.MiddleCenter; Status.color = GameTheme.Accent;
            yield return null; // Show our actual startup state before starting asynchronous scene IO.
            var load = SceneManager.LoadSceneAsync("IdleIntelligence");
            if (load == null) { Status.text = Copy("Labor konnte nicht geladen werden"); yield break; }
            while (!load.isDone) yield return null;
            var game = FindFirstObjectByType<GameRuntime>();
            while (game != null && game.State == null) yield return null;
            if (game == null) { Status.text = Copy("Labor konnte nicht geladen werden"); yield break; }
            language = game.State.Settings.language;
            Ready = true;
            Status.text = Copy(game.Writable ? "Spielstand geprüft" : "Spielstand geschützt · Wiederherstellung öffnen");
            if (!game.Writable) game.Show("storage");
            yield return null;
            while (Application.isEditor && HoldForCapture) yield return null;
            Destroy(gameObject);
        }
        string Copy(string text) => UiLocalizedText.Translate(text, language);
        static string Language(SystemLanguage value)
        {
            switch (value) {
                case SystemLanguage.German: return "de";
                case SystemLanguage.Spanish: return "es";
                case SystemLanguage.French: return "fr";
                case SystemLanguage.Portuguese: return "pt";
                case SystemLanguage.Italian: return "it";
                case SystemLanguage.Polish: return "pl";
                default: return "en";
            }
        }
    }
}
