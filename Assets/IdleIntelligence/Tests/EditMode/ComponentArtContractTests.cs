using System.Linq;
using System.Collections.Generic;
using IdleIntelligence.Core;
using IdleIntelligence.Runtime;
using NUnit.Framework;
using UnityEditor;
using UnityEngine;
namespace IdleIntelligence.Tests {
 public sealed class ComponentArtContractTests {
  [Test]public void EveryComponentUsesTheReviewedNativeAtlasCell(){
   // Frozen reviewed atlas contract, preserved from the former GameArt mapping.
   // Independent of CreateWorkshop's implementation; no removed web-source dependency.
   var cells=new Dictionary<string,Vector4>{
    {"circuits",new Vector4(0,0,5,2)},
    {"copperCoils",new Vector4(1,0,5,2)},
    {"siliconWafers",new Vector4(2,0,5,2)},
    {"titaniumBolts",new Vector4(3,0,5,2)},
    {"photonicLenses",new Vector4(4,0,5,2)},
    {"graphene",new Vector4(0,1,5,2)},
    {"nanotubes",new Vector4(1,1,5,2)},
    {"superconductors",new Vector4(2,1,5,2)},
    {"quantumCores",new Vector4(4,1,5,2)},
    {"neuralCrystals",new Vector4(0,0,4,3)},
    {"ceramicCapacitors",new Vector4(1,0,4,3)},
    {"ferriteCores",new Vector4(2,0,4,3)},
    {"goldContacts",new Vector4(3,0,4,3)},
    {"ceramicSubstrates",new Vector4(0,1,4,3)},
    {"opticalFibers",new Vector4(1,1,4,3)},
    {"thermalInterface",new Vector4(2,1,4,3)},
    {"diamondSubstrates",new Vector4(3,1,4,3)},
    {"spintronicDevices",new Vector4(0,2,4,3)},
    {"photonicCircuits",new Vector4(1,2,4,3)},
    {"cryogenicResonators",new Vector4(2,2,4,3)},
   };
   var prefab=AssetDatabase.LoadAssetAtPath<GameObject>("Assets/IdleIntelligence/Prefabs/WorkshopScreen.prefab").GetComponent<WorkshopUI>();Assert.That(prefab.ComponentSprites.Length,Is.EqualTo(ItemBalance.ComponentIds.Length));
   for(int i=0;i<ItemBalance.ComponentIds.Length;i++){string id=ItemBalance.ComponentIds[i];Assert.That(cells.ContainsKey(id),Is.True,id);var cell=cells[id];var sprite=prefab.ComponentSprites[i];float w=sprite.texture.width/cell.z,h=sprite.texture.height/cell.w;Assert.That(sprite.name,Is.EqualTo(id));Assert.That(sprite.rect.width,Is.EqualTo(w).Within(.01f),id);Assert.That(sprite.rect.height,Is.EqualTo(h).Within(.01f),id);Assert.That(sprite.rect.x,Is.EqualTo(cell.x*w).Within(.01f),id);Assert.That(sprite.rect.y,Is.EqualTo(sprite.texture.height-(cell.y+1)*h).Within(.01f),id);}
   var stage=AssetDatabase.LoadAssetAtPath<GameObject>("Assets/IdleIntelligence/Resources/PixelUI/RewardStage.prefab").GetComponent<RewardStage>();Assert.That(stage.Lid.GetComponents<UnityEngine.UI.BaseMeshEffect>().Length,Is.Zero,"The distorted lid mesh is removed");Assert.That(stage.Chest.Assembly.Find("ChestInterior"),Is.Null);var art=Resources.Load<PresentationArt>("PixelUI/PresentationArt");Assert.That(art.ChestOpening.Length,Is.EqualTo(24));Assert.That(stage.Body.rectTransform.sizeDelta,Is.EqualTo(stage.Body.sprite.rect.size),"First common frame must retain its actual aspect even when already loaded");foreach(var frame in art.ChestOpening){Assert.That(frame,Is.Not.Null);Assert.That(frame.pivot.y,Is.EqualTo(1).Within(.01f),"Every silhouette uses the same base pixel as pivot");}for(int column=0;column<6;column++)for(int tier=0;tier<3;tier++)Assert.That(art.ChestOpening[tier*6+column].rect.yMin,Is.GreaterThan(art.ChestOpening[(tier+1)*6+column].rect.yMax),"Adjacent tiers must not leak into another frame");Assert.That(art.MachineEmpty,Is.Not.Null);Assert.That(art.CapsuleTop.rect.yMin,Is.EqualTo(art.CapsuleBottom.rect.yMax).Within(.01f),"Capsule halves have a shared cut without duplicated bands");
  }
 }
}
