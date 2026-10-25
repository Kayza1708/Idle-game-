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
   var stage=AssetDatabase.LoadAssetAtPath<GameObject>("Assets/IdleIntelligence/Resources/PixelUI/RewardStage.prefab").GetComponent<RewardStage>();Assert.That(stage.Lid.GetComponents<UnityEngine.UI.BaseMeshEffect>().Length,Is.Zero,"The distorted lid mesh is removed");Assert.That(stage.Chest.Assembly.Find("ChestInterior"),Is.Null);var art=Resources.Load<PresentationArt>("PixelUI/PresentationArt");Assert.That(art.ChestOpening.Length,Is.EqualTo(24));Assert.That(stage.Body.rectTransform.sizeDelta,Is.EqualTo(stage.Body.sprite.rect.size),"First common frame must retain its actual aspect even when already loaded");foreach(var frame in art.ChestOpening){Assert.That(frame,Is.Not.Null);Assert.That(frame.pivot.y,Is.EqualTo(1).Within(.01f),"Every silhouette uses the same base pixel as pivot");}for(int column=0;column<6;column++)for(int tier=0;tier<3;tier++)Assert.That(art.ChestOpening[tier*6+column].rect.yMin,Is.GreaterThan(art.ChestOpening[(tier+1)*6+column].rect.yMax),"Adjacent tiers must not leak into another frame");Assert.That(art.MachineEmpty,Is.Not.Null);Assert.That(art.CapsuleTop.rect.yMin,Is.EqualTo(art.CapsuleBottom.rect.yMax).Within(.01f),"Capsule halves have a shared cut without duplicated bands");
  }
 }
}
