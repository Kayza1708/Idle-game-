using UnityEngine;
namespace IdleIntelligence.Runtime
{
    public sealed class ShopHub:MonoBehaviour
    {
        public void Initialize(GameRuntime game)
        {
            string language=game.State.Settings.language;
            WorkshopUIFactory.Label("ShopHeading",transform,NavigationWords.Label("shop",language),22,38);
            var art=Resources.Load<PresentationArt>("PixelUI/PresentationArt");
            string[] routes={"market","gems","store","ads","seasons"};
            string[] names={"offers","gems","bundles","rewards","seasons"};
            string[] descriptions={"Materialien · Truhen · Tagesangebote","Gumball · dauerhafte Upgrades","Pakete · Berechtigungen","Bonusse · Verfügbarkeit und Limits","Free · Premium · Sammlung"};
            var shell=game.GetComponent<MobileShell>();
            Sprite[] icons={art.ChestBody[0],art.Machine,shell.ResourceIcons[3],art.Capsule,art.Blueprint};
            for(int i=0;i<routes.Length;i++)
            {
                string route=routes[i];var card=Instantiate(game.CardPrefab,transform);card.name="Shop-"+route;
                card.Title.text=NavigationWords.Copy(names[i],language);
                card.Detail.text=UiLocalizedText.Translate(descriptions[i],language);
                card.Icon.sprite=icons[i];card.Icon.preserveAspect=true;card.Icon.raycastTarget=false;
                card.Button.onClick.AddListener(()=>game.GetComponent<GameMenu>().Navigate(route));
                card.gameObject.AddComponent<CompactActionCard>();
            }
        }
    }
}
