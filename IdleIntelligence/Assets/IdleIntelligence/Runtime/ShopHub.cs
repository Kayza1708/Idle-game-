using UnityEngine;using UnityEngine.UI;
namespace IdleIntelligence.Runtime {
 // One bottom-navigation entry for the existing shop systems.
 public sealed class ShopHub:MonoBehaviour {
  public void Initialize(GameRuntime game){WorkshopUIFactory.Label("ShopHeading",transform,NavigationWords.Label("shop",game.State.Settings.language),22,38);string[] routes={"market","gems","store","ads","seasons"};string[] names={"offers","gems","bundles","rewards","seasons"};for(int i=0;i<routes.Length;i++){string route=routes[i];var b=WorkshopUIFactory.Button("Shop-"+route,transform,NavigationWords.Copy(names[i],game.State.Settings.language),()=>game.GetComponent<GameMenu>().Navigate(route));GameTheme.CompactAction(b,false);}}
 }
}
