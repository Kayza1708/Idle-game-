using System;
using System.IO;
using IdleIntelligence.Core;
using IdleIntelligence.Runtime;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.UI;
using UnityEngine.EventSystems;
using UnityEngine.InputSystem.UI;

namespace IdleIntelligence.Editor
{
    public static class CreateSliceScene
    {
        const string Root="Assets/IdleIntelligence/";
        static Font font;
        static readonly Color Background=new Color(.035f,.065f,.09f),Panel=new Color(.075f,.13f,.17f),Accent=new Color(.16f,.5f,.45f);
        static GameObject Node(string name,Transform parent,params Type[] components)
        {
            var g=new GameObject(name,typeof(RectTransform));g.transform.SetParent(parent,false);foreach(var c in components)g.AddComponent(c);return g;
        }
        static void Fill(RectTransform r){r.anchorMin=Vector2.zero;r.anchorMax=Vector2.one;r.offsetMin=r.offsetMax=Vector2.zero;}
        static void Height(GameObject g,float height){var le=g.AddComponent<LayoutElement>();le.minHeight=height;le.preferredHeight=height;le.flexibleHeight=0;}
        static Text Label(string name,Transform parent,string text,int size=14,TextAnchor align=TextAnchor.MiddleLeft)
        {
            var g=Node(name,parent,typeof(Text));var t=g.GetComponent<Text>();t.font=font;t.fontSize=size;t.color=new Color(.88f,.95f,.96f);t.text=text;t.alignment=align;t.raycastTarget=false;t.horizontalOverflow=HorizontalWrapMode.Wrap;Fill((RectTransform)g.transform);return t;
        }
        static Button Button(string name,Transform parent,string title)
        {
            var g=Node(name,parent,typeof(Image),typeof(Button));g.GetComponent<Image>().color=Accent;Label("Label",g.transform,title,14,TextAnchor.MiddleCenter);return g.GetComponent<Button>();
        }
        static void Horizontal(GameObject g,float spacing=6){var l=g.AddComponent<HorizontalLayoutGroup>();l.spacing=spacing;l.childControlWidth=l.childControlHeight=true;l.childForceExpandWidth=true;l.childForceExpandHeight=true;}
        [MenuItem("Idle Intelligence/Rebuild playable slice scene")]
        public static void Build()
        {
            font=Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
            Directory.CreateDirectory(Root+"Prefabs");Directory.CreateDirectory(Root+"Art");
            var atlasPath=Root+"Resources/HardwareAtlas.png";var importer=(TextureImporter)AssetImporter.GetAtPath(atlasPath);importer.textureType=TextureImporterType.Sprite;importer.spriteImportMode=SpriteImportMode.Single;importer.textureCompression=TextureImporterCompression.Uncompressed;importer.alphaIsTransparency=true;importer.SaveAndReimport();
            var atlas=AssetDatabase.LoadAssetAtPath<Texture2D>(atlasPath);
            // Source bounds copied from GameArt.tsx by the reproducible export script.
            var sprites=new Sprite[Balance.Hardware.Length];
            var source=File.ReadAllText(Path.GetFullPath("../src/GameArt.tsx"));
            for(int i=0;i<sprites.Length;i++)
            {
                string id=Balance.Hardware[i].Id;var match=System.Text.RegularExpressions.Regex.Match(source,@"\b"+id+@":\{bounds:\[(\d+),(\d+),(\d+),(\d+)\]");
                if(!match.Success)throw new Exception("Missing art bounds for "+id);
                int x=int.Parse(match.Groups[1].Value),y=int.Parse(match.Groups[2].Value),w=int.Parse(match.Groups[3].Value),h=int.Parse(match.Groups[4].Value);
                var sprite=Sprite.Create(atlas,new Rect(x,atlas.height-y-h,w,h),new Vector2(.5f,.5f),100);sprite.name=id;
                string path=Root+"Art/"+id+".asset";var old=AssetDatabase.LoadAssetAtPath<Sprite>(path);if(old==null)AssetDatabase.CreateAsset(sprite,path);else {EditorUtility.CopySerialized(sprite,old);UnityEngine.Object.DestroyImmediate(sprite);sprite=old;}sprites[i]=sprite;
            }
            var labImporter=(TextureImporter)AssetImporter.GetAtPath(Root+"Resources/Laboratory.png");labImporter.textureType=TextureImporterType.Sprite;labImporter.spriteImportMode=SpriteImportMode.Single;labImporter.textureCompression=TextureImporterCompression.CompressedHQ;labImporter.SaveAndReimport();
            var lab=AssetDatabase.LoadAssetAtPath<Sprite>(Root+"Resources/Laboratory.png");
            var scene=EditorSceneManager.NewScene(NewSceneSetup.EmptyScene,NewSceneMode.Single);
            var camera=new GameObject("Camera",typeof(Camera));camera.GetComponent<Camera>().clearFlags=CameraClearFlags.SolidColor;camera.GetComponent<Camera>().backgroundColor=Background;
            var eventSystem=new GameObject("EventSystem",typeof(EventSystem),typeof(InputSystemUIInputModule));
            var canvas=Node("PortraitCanvas",null,typeof(Canvas),typeof(CanvasScaler),typeof(GraphicRaycaster));canvas.GetComponent<Canvas>().renderMode=RenderMode.ScreenSpaceOverlay;
            var scaler=canvas.GetComponent<CanvasScaler>();scaler.uiScaleMode=CanvasScaler.ScaleMode.ScaleWithScreenSize;scaler.referenceResolution=new Vector2(390,844);scaler.matchWidthOrHeight=0;
            var back=Node("Background",canvas.transform,typeof(Image));Fill((RectTransform)back.transform);back.GetComponent<Image>().color=Background;
            var safe=Node("SafeArea",canvas.transform,typeof(SafeArea));Fill((RectTransform)safe.transform);
            var layout=safe.AddComponent<VerticalLayoutGroup>();layout.padding=new RectOffset(12,12,8,8);layout.spacing=7;layout.childControlWidth=layout.childControlHeight=true;layout.childForceExpandWidth=true;layout.childForceExpandHeight=false;
            var runtime=new GameObject("Game",typeof(GameRuntime)).GetComponent<GameRuntime>();
            var header=Node("Header",safe.transform);Height(header,54);Horizontal(header);var heading=Label("Title",header.transform,"IDLE INTELLIGENCE",20);heading.gameObject.AddComponent<LayoutElement>().flexibleWidth=1;
            runtime.SaveButton=Button("Save",header.transform,"Sichern");runtime.SaveButton.gameObject.AddComponent<LayoutElement>().preferredWidth=76;
            var resources=Node("Resources",safe.transform,typeof(Image));resources.GetComponent<Image>().color=Panel;Height(resources,72);
            var grid=resources.AddComponent<GridLayoutGroup>();grid.cellSize=new Vector2(175,32);grid.spacing=new Vector2(4,2);grid.padding=new RectOffset(6,6,3,3);grid.constraint=GridLayoutGroup.Constraint.FixedColumnCount;grid.constraintCount=2;
            runtime.Credits=Label("Credits",resources.transform,"CREDITS",12);runtime.Data=Label("Data",resources.transform,"DATEN",12);runtime.Compute=Label("Compute",resources.transform,"COMPUTE",12);runtime.Users=Label("Users",resources.transform,"NUTZER",12);
            // Responsive grid sizing is handled by the tiny view-only component.
            resources.AddComponent<ResourceGrid>();
            var labPanel=Node("Laboratory",safe.transform,typeof(Image));labPanel.GetComponent<Image>().color=Panel;Height(labPanel,188);labPanel.GetComponent<LayoutElement>().minHeight=100;
            var art=Node("LabArt",labPanel.transform,typeof(Image));Fill((RectTransform)art.transform);var image=art.GetComponent<Image>();image.sprite=lab;image.preserveAspect=true;image.raycastTarget=false;
            runtime.TapButton=Button("TapLab",labPanel.transform,"TIPPEN  ·  CREDIT-IMPULS");var tapRect=(RectTransform)runtime.TapButton.transform;tapRect.anchorMin=Vector2.zero;tapRect.anchorMax=new Vector2(1,0);tapRect.pivot=new Vector2(.5f,0);tapRect.sizeDelta=new Vector2(0,54);tapRect.anchoredPosition=Vector2.zero;
            var drive=Node("Overdrive",safe.transform);Height(drive,23);runtime.Overdrive=Label("Charge",drive.transform,"OVERDRIVE",13,TextAnchor.MiddleCenter);
            var hint=Node("Guidance",safe.transform);Height(hint,34);runtime.Hint=Label("Hint",hint.transform,"",13,TextAnchor.MiddleCenter);
            var tabs=Node("Tabs",safe.transform);Height(tabs,54);Horizontal(tabs);runtime.HardwareTab=Button("HardwareTab",tabs.transform,"Hardware");runtime.TrainingTab=Button("TrainingTab",tabs.transform,"Training");runtime.ResearchTab=Button("ResearchTab",tabs.transform,"Forschung");runtime.ItemsTab=Button("ItemsTab",tabs.transform,"Items");runtime.PrestigeTab=Button("PrestigeTab",tabs.transform,"INT");
            var scroll=Node("ActionList",safe.transform,typeof(Image),typeof(ScrollRect));scroll.GetComponent<Image>().color=Background;var scrollLayout=scroll.AddComponent<LayoutElement>();scrollLayout.minHeight=90;scrollLayout.flexibleHeight=1;
            var viewport=Node("Viewport",scroll.transform,typeof(Image),typeof(RectMask2D));Fill((RectTransform)viewport.transform);viewport.GetComponent<Image>().color=Background;
            var content=Node("Content",viewport.transform);var cr=(RectTransform)content.transform;cr.anchorMin=new Vector2(0,1);cr.anchorMax=Vector2.one;cr.pivot=new Vector2(.5f,1);cr.offsetMin=cr.offsetMax=Vector2.zero;
            var contentLayout=content.AddComponent<VerticalLayoutGroup>();contentLayout.spacing=7;contentLayout.childControlWidth=contentLayout.childControlHeight=true;contentLayout.childForceExpandHeight=false;contentLayout.childForceExpandWidth=true;content.AddComponent<ContentSizeFitter>().verticalFit=ContentSizeFitter.FitMode.PreferredSize;
            var sr=scroll.GetComponent<ScrollRect>();sr.viewport=(RectTransform)viewport.transform;sr.content=cr;sr.horizontal=false;sr.movementType=ScrollRect.MovementType.Clamped;sr.scrollSensitivity=30;runtime.Content=content.transform;
            var status=Node("SaveStatus",safe.transform);Height(status,40);runtime.Status=Label("Status",status.transform,"",12);
            var card=Node("ActionCard",null,typeof(Image),typeof(Button),typeof(ActionCard));card.GetComponent<Image>().color=Panel;Height(card,82);var cardLayout=card.AddComponent<HorizontalLayoutGroup>();cardLayout.padding=new RectOffset(8,8,6,6);cardLayout.spacing=8;cardLayout.childControlWidth=cardLayout.childControlHeight=true;cardLayout.childForceExpandWidth=false;cardLayout.childForceExpandHeight=true;
            var icon=Node("Icon",card.transform,typeof(Image));icon.GetComponent<Image>().preserveAspect=true;icon.GetComponent<Image>().raycastTarget=false;icon.AddComponent<LayoutElement>().preferredWidth=58;
            var text=Node("Text",card.transform);text.AddComponent<LayoutElement>().flexibleWidth=1;var textLayout=text.AddComponent<VerticalLayoutGroup>();textLayout.childControlWidth=textLayout.childControlHeight=true;textLayout.childForceExpandWidth=textLayout.childForceExpandHeight=true;
            var action=card.GetComponent<ActionCard>();action.Title=Label("Title",text.transform,"Hardware",15);action.Detail=Label("Detail",text.transform,"Kosten / Leistung",12);action.Icon=icon.GetComponent<Image>();action.Button=card.GetComponent<Button>();
            var colors=action.Button.colors;colors.disabledColor=new Color(.5f,.55f,.6f);colors.highlightedColor=new Color(.7f,1,.9f);action.Button.colors=colors;
            string prefab=Root+"Prefabs/ActionCard.prefab";PrefabUtility.SaveAsPrefabAsset(card,prefab);UnityEngine.Object.DestroyImmediate(card);runtime.CardPrefab=AssetDatabase.LoadAssetAtPath<ActionCard>(prefab);runtime.HardwareSprites=sprites;runtime.WorkshopPrefab=CreateWorkshop.Build(runtime.CardPrefab);runtime.ModelPrefab=CreateMetaLab.Build();runtime.PrestigePrefab=CreatePrestige.Build(sprites,runtime.WorkshopPrefab);
            PlayerSettings.defaultScreenWidth=390;PlayerSettings.defaultScreenHeight=844;PlayerSettings.defaultInterfaceOrientation=UIOrientation.Portrait;PlayerSettings.allowedAutorotateToLandscapeLeft=false;PlayerSettings.allowedAutorotateToLandscapeRight=false;PlayerSettings.allowedAutorotateToPortraitUpsideDown=false;
            const string scenePath="Assets/Scenes/IdleIntelligence.unity";EditorSceneManager.SaveScene(scene,scenePath);EditorBuildSettings.scenes=new[]{new EditorBuildSettingsScene(scenePath,true)};AssetDatabase.SaveAssets();
            ApplyMobileDesign.Build();Debug.Log("PLAYABLE_SLICE_SCENE_CREATED: "+scenePath);
        }
    }
}
