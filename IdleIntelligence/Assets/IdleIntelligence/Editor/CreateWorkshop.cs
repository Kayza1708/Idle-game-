using System;
using System.IO;
using System.Linq;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using IdleIntelligence.Core;
using IdleIntelligence.Runtime;
using UnityEngine;
using UnityEngine.UI;
using UnityEditor;
namespace IdleIntelligence.Editor
{
    public static class CreateWorkshop
    {
        const string Root="Assets/IdleIntelligence/";
        static Sprite SaveSprite(Sprite sprite,string path){var old=AssetDatabase.LoadAssetAtPath<Sprite>(path);if(old==null)AssetDatabase.CreateAsset(sprite,path);else{EditorUtility.CopySerialized(sprite,old);UnityEngine.Object.DestroyImmediate(sprite);sprite=old;}return sprite;}
        static Texture2D Texture(string name){string path=Root+"Resources/"+name+".png";var t=(TextureImporter)AssetImporter.GetAtPath(path);t.textureType=TextureImporterType.Sprite;t.spriteImportMode=SpriteImportMode.Single;t.textureCompression=TextureImporterCompression.Uncompressed;t.alphaIsTransparency=true;t.SaveAndReimport();return AssetDatabase.LoadAssetAtPath<Texture2D>(path);}
        static GameObject Node(string name,Transform parent,params Type[] types)=>WorkshopUIFactory.Node(name,parent,types);
        static void At(RectTransform r,float x,float y,float w,float h){r.anchorMin=r.anchorMax=new Vector2(x,y);r.pivot=new Vector2(.5f,.5f);r.anchoredPosition=Vector2.zero;r.sizeDelta=new Vector2(w,h);}
        static ItemPortrait Portrait(Transform parent,ItemPortrait prefab,string name,float x,float y,float size){var p=(ItemPortrait)PrefabUtility.InstantiatePrefab(prefab,parent);p.name=name;At((RectTransform)p.transform,x,y,size,size);return p;}
        public static WorkshopUI Build(ActionCard row)
        {
            var atlas=Texture("ItemAtlas");var source=File.ReadAllText(Path.GetFullPath("../src/GameArt.tsx"));var sprites=new Sprite[ItemBalance.Items.Length];
            for(int n=0;n<sprites.Length;n++)
            {
                string id=ItemBalance.Items[n].Id;var match=Regex.Match(source,"['\"]?"+id+"['\"]?:\\[(\\d+),(\\d+),(\\d+),(\\d+)\\]");if(!match.Success)throw new Exception("Missing item art "+id);
                int x=int.Parse(match.Groups[1].Value),y=int.Parse(match.Groups[2].Value),w=int.Parse(match.Groups[3].Value),h=int.Parse(match.Groups[4].Value);var sprite=Sprite.Create(atlas,new Rect(x,atlas.height-y-h,w,h),new Vector2(.5f,.5f),100);sprite.name=id;
                var clip=Regex.Match(source,"['\"]"+id+"['\"]:'(M[^']+)'" );if(clip.Success){var nums=Regex.Matches(clip.Groups[1].Value,@"-?\d+(?:\.\d+)?").Cast<Match>().Select(m=>float.Parse(m.Value,System.Globalization.CultureInfo.InvariantCulture)).ToArray();var points=Enumerable.Range(0,nums.Length/2).Select(i=>new Vector2((nums[i*2]-x-w*.5f)/100,(h*.5f-nums[i*2+1]+y)/100)).ToArray();var triangles=Triangulate(points);if(triangles.Length>0)sprite.OverrideGeometry(points,triangles);}
                sprites[n]=SaveSprite(sprite,Root+"Art/item-"+id+".asset");
            }
            var components=new Sprite[ItemBalance.ComponentIds.Length];var baseAtlas=Texture("ComponentAtlas");var extraAtlas=Texture("ComponentExtension");for(int i=0;i<components.Length;i++){var a=i<10?baseAtlas:extraAtlas;int cell=i%10;float w=a.width/5f,h=a.height/2f;var sprite=Sprite.Create(a,new Rect(cell%5*w,a.height-(cell/5+1)*h,w,h),new Vector2(.5f,.5f),100);sprite.name=ItemBalance.ComponentIds[i];components[i]=SaveSprite(sprite,Root+"Art/component-"+sprite.name+".asset");}
            Texture("Forge");var forgeArt=AssetDatabase.LoadAssetAtPath<Sprite>(Root+"Resources/Forge.png");
            var portrait=Node("ItemPortrait",null,typeof(Image),typeof(Button),typeof(ItemPortrait));At((RectTransform)portrait.transform,.5f,.5f,94,94);portrait.GetComponent<Image>().color=new Color(.025f,.06f,.09f,.95f);var view=portrait.GetComponent<ItemPortrait>();view.Button=portrait.GetComponent<Button>();
            var frame=Node("RarityFrame",portrait.transform,typeof(CanvasRenderer),typeof(ShapeFrame));WorkshopUIFactory.Fill((RectTransform)frame.transform);view.Frame=frame.GetComponent<ShapeFrame>();view.Frame.raycastTarget=false;
            var art=Node("CenteredArt",portrait.transform,typeof(Image));view.Art=art.GetComponent<Image>();view.Art.raycastTarget=false;view.Art.preserveAspect=true;At(view.Art.rectTransform,.5f,.52f,62,62);
            view.Caption=WorkshopUIFactory.Label("Caption",portrait.transform,"",11);UnityEngine.Object.DestroyImmediate(view.Caption.GetComponent<LayoutElement>());var caption=view.Caption.rectTransform;caption.anchorMin=new Vector2(0,0);caption.anchorMax=new Vector2(1,0);caption.pivot=new Vector2(.5f,0);caption.sizeDelta=new Vector2(0,20);view.Caption.alignment=TextAnchor.MiddleCenter;
            string portraitPath=Root+"Prefabs/ItemPortrait.prefab";PrefabUtility.SaveAsPrefabAsset(portrait,portraitPath);UnityEngine.Object.DestroyImmediate(portrait);var prefab=AssetDatabase.LoadAssetAtPath<ItemPortrait>(portraitPath);
            var stage=Node("ForgeStage",null,typeof(Image),typeof(ForgeAnimator));stage.GetComponent<Image>().sprite=forgeArt;stage.GetComponent<Image>().preserveAspect=false;WorkshopUIFactory.Size(stage,232);var animator=stage.GetComponent<ForgeAnimator>();animator.PortraitPrefab=prefab;
            var flash=Node("ImpactLight",stage.transform,typeof(Image));WorkshopUIFactory.Fill((RectTransform)flash.transform);animator.Flash=flash.GetComponent<Image>();animator.Flash.color=Color.clear;animator.Flash.raycastTarget=false;
            animator.Inputs=new ItemPortrait[3];for(int i=0;i<3;i++)animator.Inputs[i]=Portrait(stage.transform,prefab,"FusionSocket"+i,.19f+i*.31f,.84f,60);
            animator.Result=Portrait(stage.transform,prefab,"ActualResult",.5f,.43f,76);animator.Result.gameObject.SetActive(false);
            var layer=Node("AnimationLayer",stage.transform);WorkshopUIFactory.Fill((RectTransform)layer.transform);animator.Layer=(RectTransform)layer.transform;animator.Components=components;
            animator.Message=WorkshopUIFactory.Label("ResultMessage",stage.transform,"",12);UnityEngine.Object.DestroyImmediate(animator.Message.GetComponent<LayoutElement>());At(animator.Message.rectTransform,.5f,.08f,340,32);animator.Message.alignment=TextAnchor.MiddleCenter;
            string stagePath=Root+"Prefabs/ForgeStage.prefab";PrefabUtility.SaveAsPrefabAsset(stage,stagePath);UnityEngine.Object.DestroyImmediate(stage);
            var root=WorkshopUIFactory.Vertical("WorkshopScreen",null);root.AddComponent<LayoutElement>().flexibleWidth=1;var ui=root.AddComponent<WorkshopUI>();ui.PortraitPrefab=prefab;ui.RowPrefab=row;ui.ItemSprites=sprites;ui.ComponentSprites=components;
            var navigation=WorkshopUIFactory.Horizontal("WorkshopTabs",root.transform);WorkshopUIFactory.Button("Blueprints",navigation.transform,"Baupläne",()=>{});WorkshopUIFactory.Button("Inventory",navigation.transform,"Inventar",()=>{});WorkshopUIFactory.Button("Materials",navigation.transform,"Material",()=>{});
            ui.Stock=WorkshopUIFactory.Label("WorkshopStock",root.transform,"",12,30);
            var forgeContainer=WorkshopUIFactory.Vertical("ForgePanel",root.transform);ui.ForgePanel=forgeContainer;ui.RecipeTitle=WorkshopUIFactory.Label("SelectedRecipe",forgeContainer.transform,"",16,30);ui.Forge=((GameObject)PrefabUtility.InstantiatePrefab(AssetDatabase.LoadAssetAtPath<GameObject>(stagePath),forgeContainer.transform)).GetComponent<ForgeAnimator>();
            ui.Cost=WorkshopUIFactory.Label("ActualCosts",forgeContainer.transform,"",12,64);var commands=WorkshopUIFactory.Horizontal("ForgeActions",forgeContainer.transform);ui.Primary=WorkshopUIFactory.Button("CommitForge",commands.transform,"Herstellen",null);ui.Info=WorkshopUIFactory.Button("RecipeDetails",commands.transform,"Details",null);ui.Info.gameObject.AddComponent<LayoutElement>().preferredWidth=75;
            var options=WorkshopUIFactory.Horizontal("WorkshopOptions",root.transform);WorkshopUIFactory.Button("FusionMode",options.transform,"Fusion",null);ui.Motion=WorkshopUIFactory.Button("ReducedMotion",options.transform,"Bewegung an",null);
            var equipment=Node("Equipment",root.transform,typeof(GridLayoutGroup),typeof(ContentSizeFitter),typeof(ItemGrid));ui.Equipment=equipment.transform;var grid=equipment.GetComponent<GridLayoutGroup>();grid.constraint=GridLayoutGroup.Constraint.FixedColumnCount;grid.constraintCount=4;grid.spacing=new Vector2(4,5);equipment.GetComponent<ContentSizeFitter>().verticalFit=ContentSizeFitter.FitMode.PreferredSize;
            ui.Rows=WorkshopUIFactory.Vertical("WorkshopRows",root.transform).transform;
            var detail=Node("ItemDetails",root.transform,typeof(Image));WorkshopUIFactory.Fill((RectTransform)detail.transform);detail.GetComponent<Image>().color=new Color(0,0,0,.88f);ui.DetailRoot=detail;
            var panel=WorkshopUIFactory.Vertical("DetailPanel",detail.transform);var pr=(RectTransform)panel.transform;pr.anchorMin=new Vector2(.06f,.07f);pr.anchorMax=new Vector2(.94f,.93f);pr.offsetMin=pr.offsetMax=Vector2.zero;var v=panel.GetComponent<VerticalLayoutGroup>();v.padding=new RectOffset(12,12,8,8);panel.AddComponent<Image>().color=new Color(.035f,.08f,.12f);
            WorkshopUIFactory.Button("CloseItemDetail",panel.transform,"Schließen",null);var scroll=Node("DetailScroll",panel.transform,typeof(ScrollRect));scroll.AddComponent<LayoutElement>().flexibleHeight=1;var viewport=Node("Viewport",scroll.transform,typeof(Image),typeof(RectMask2D));WorkshopUIFactory.Fill((RectTransform)viewport.transform);viewport.GetComponent<Image>().color=new Color(.035f,.08f,.12f);var content=WorkshopUIFactory.Vertical("Content",viewport.transform);var cr=(RectTransform)content.transform;cr.anchorMin=new Vector2(0,1);cr.anchorMax=Vector2.one;cr.pivot=new Vector2(.5f,1);cr.offsetMin=cr.offsetMax=Vector2.zero;content.AddComponent<ContentSizeFitter>().verticalFit=ContentSizeFitter.FitMode.PreferredSize;
            var heroHolder=Node("Hero",content.transform);WorkshopUIFactory.Size(heroHolder,126);ui.DetailPortrait=Portrait(heroHolder.transform,prefab,"DetailPortrait",.5f,.5f,120);ui.DetailText=WorkshopUIFactory.Label("ItemFacts",content.transform,"",14,190);ui.DetailActions=WorkshopUIFactory.Vertical("DetailActions",content.transform).transform;
            var sr=scroll.GetComponent<ScrollRect>();sr.viewport=(RectTransform)viewport.transform;sr.content=cr;sr.horizontal=false;sr.movementType=ScrollRect.MovementType.Clamped;
            detail.SetActive(false);string screenPath=Root+"Prefabs/WorkshopScreen.prefab";PrefabUtility.SaveAsPrefabAsset(root,screenPath);UnityEngine.Object.DestroyImmediate(root);return AssetDatabase.LoadAssetAtPath<WorkshopUI>(screenPath);
        }
        static ushort[] Triangulate(Vector2[] points)
        {
            var order=Enumerable.Range(0,points.Length).ToList();float area=0;for(int i=0;i<points.Length;i++){var a=points[i];var b=points[(i+1)%points.Length];area+=a.x*b.y-b.x*a.y;}if(area<0)order.Reverse();var output=new List<ushort>();int guard=points.Length*points.Length;
            while(order.Count>2&&guard-->0)
            {bool found=false;for(int i=0;i<order.Count;i++){int a=order[(i+order.Count-1)%order.Count],b=order[i],c=order[(i+1)%order.Count];if(Cross(points[b]-points[a],points[c]-points[b])<=0)continue;bool inside=order.Any(p=>p!=a&&p!=b&&p!=c&&Cross(points[b]-points[a],points[p]-points[a])>=0&&Cross(points[c]-points[b],points[p]-points[b])>=0&&Cross(points[a]-points[c],points[p]-points[c])>=0);if(inside)continue;output.Add((ushort)a);output.Add((ushort)b);output.Add((ushort)c);order.RemoveAt(i);found=true;break;}if(!found)return Array.Empty<ushort>();}return output.ToArray();
        }
        static float Cross(Vector2 a,Vector2 b)=>a.x*b.y-a.y*b.x;
    }
}
