using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using IdleIntelligence.Core;
using IdleIntelligence.Runtime;
using NUnit.Framework;
using UnityEditor;
using UnityEngine;
namespace IdleIntelligence.Tests {
 public sealed class ComponentArtContractTests {
  [Test]public void EveryComponentUsesTheReviewedTypeScriptAtlasCell(){
   string source=File.ReadAllText(Path.Combine(Directory.GetParent(Application.dataPath).Parent.FullName,"src/GameArt.tsx"));
   var prefab=AssetDatabase.LoadAssetAtPath<GameObject>("Assets/IdleIntelligence/Prefabs/WorkshopScreen.prefab").GetComponent<WorkshopUI>();Assert.That(prefab.ComponentSprites.Length,Is.EqualTo(ItemBalance.ComponentIds.Length));
   for(int i=0;i<ItemBalance.ComponentIds.Length;i++){string id=ItemBalance.ComponentIds[i];var extension=Regex.Match(source,@"const materialExtensionCells[^=]*=\{([^}]+)\}").Groups[1].Value;var basic=Regex.Match(source,@"const componentCells[^=]*=\{([^}]+)\}").Groups[1].Value;var cell=Regex.Match(extension,@"\b"+id+@":\[(\d+),(\d+)\]");bool extra=cell.Success;if(!extra)cell=Regex.Match(basic,@"\b"+id+@":\[(\d+),(\d+)\]");Assert.That(cell.Success,Is.True,id);var sprite=prefab.ComponentSprites[i];float w=sprite.texture.width/(extra?4f:5f),h=sprite.texture.height/(extra?3f:2f);Assert.That(sprite.name,Is.EqualTo(id));Assert.That(sprite.rect.width,Is.EqualTo(w).Within(.01f),id);Assert.That(sprite.rect.height,Is.EqualTo(h).Within(.01f),id);Assert.That(sprite.rect.x,Is.EqualTo(int.Parse(cell.Groups[1].Value)*w).Within(.01f),id);Assert.That(sprite.rect.y,Is.EqualTo(sprite.texture.height-(int.Parse(cell.Groups[2].Value)+1)*h).Within(.01f),id);}
   var stage=AssetDatabase.LoadAssetAtPath<GameObject>("Assets/IdleIntelligence/Resources/PixelUI/RewardStage.prefab").GetComponent<RewardStage>();Assert.That(stage.GetComponentsInChildren<HingedLidMesh>(true).Length,Is.EqualTo(1));Assert.That(stage.GetComponentsInChildren<ChestWellGraphic>(true).Length,Is.EqualTo(1));Assert.That(stage.Chest.Hinge,Is.SameAs(stage.Lid.GetComponent<HingedLidMesh>()));
  }
 }
}
