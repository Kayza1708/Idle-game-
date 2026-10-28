// Statement block for the connected Editor's `script eval_file` command.
// No AssetPostprocessor, menu callback or hand-written importer metadata.
var folder = "Assets/IdleIntelligence/Art/ItemV3";
var ids = new[] { "fleet-coordinator", "gradient-storage", "overdrive-capacitor", "synthesis-coordinator", "singularity-lens", "axiom-anchor" };
if (!UnityEditor.AssetDatabase.IsValidFolder(folder))
    UnityEditor.AssetDatabase.CreateFolder("Assets/IdleIntelligence/Art", "ItemV3");
var factory = new UnityEditor.U2D.Sprites.SpriteDataProviderFactories();
factory.Init();
var results = new System.Collections.Generic.List<object>();
foreach (var id in ids)
{
    var source = System.IO.Path.GetFullPath(System.IO.Path.Combine(UnityEngine.Application.dataPath, "../../docs/item-system-v3/art", id + ".png"));
    var path = folder + "/" + id + ".png";
    if (!System.IO.File.Exists(source)) throw new System.IO.FileNotFoundException(source);
    if (System.IO.File.Exists(path))
    {
        if (!System.IO.File.ReadAllBytes(path).SequenceEqual(System.IO.File.ReadAllBytes(source)))
            throw new System.InvalidOperationException("Existing art differs; preserve it and review: " + path);
    }
    else System.IO.File.Copy(source, path, false);
    UnityEditor.AssetDatabase.ImportAsset(path, UnityEditor.ImportAssetOptions.ForceSynchronousImport);
    var importer = UnityEditor.AssetImporter.GetAtPath(path) as UnityEditor.TextureImporter;
    if (importer == null) throw new System.InvalidOperationException("Texture importer unavailable: " + path);
    importer.textureType = UnityEditor.TextureImporterType.Sprite;
    importer.spriteImportMode = UnityEditor.SpriteImportMode.Single;
    importer.filterMode = UnityEngine.FilterMode.Point;
    importer.textureCompression = UnityEditor.TextureImporterCompression.Uncompressed;
    importer.mipmapEnabled = false;
    importer.alphaIsTransparency = true;
    importer.maxTextureSize = 512;
    importer.SaveAndReimport();

    var provider = factory.GetSpriteEditorDataProviderFromObject(importer);
    if (provider == null) throw new System.InvalidOperationException("Sprite data provider unavailable; abort: " + path);
    provider.InitSpriteEditorDataProvider();
    var capabilityProvider = provider.GetDataProvider<UnityEditor.U2D.Sprites.ISpriteFrameEditCapability>();
    if (capabilityProvider == null) throw new System.InvalidOperationException("No sprite edit capability; abort: " + path);
    var capability = capabilityProvider.GetEditCapability();
    if (!capability.HasCapability(UnityEditor.U2D.Sprites.EEditCapability.EditPivot))
        throw new System.InvalidOperationException("Pivot editing unsupported; abort: " + path);
    var rects = provider.GetSpriteRects();
    if (rects.Length != 1) throw new System.InvalidOperationException("Expected one independent sprite; abort: " + path);
    rects[0].pivot = UnityEngine.Vector2.one * .5f;
    rects[0].alignment = UnityEngine.SpriteAlignment.Center;
    provider.SetSpriteRects(rects);
    provider.Apply();
    importer.SaveAndReimport();
    var sprite = UnityEditor.AssetDatabase.LoadAssetAtPath<UnityEngine.Sprite>(path);
    if (sprite == null) throw new System.InvalidOperationException("Imported sprite missing: " + path);
    results.Add(new { id, path, guid = UnityEditor.AssetDatabase.AssetPathToGUID(path),
        spriteRect = sprite.rect.ToString(), pivot = sprite.pivot.ToString(),
        pointFilter = sprite.texture.filterMode == UnityEngine.FilterMode.Point,
        pivotCapabilityVerified = true, sourceBytesPreserved = true, normalCatalogEnabled = false });
}
UnityEditor.AssetDatabase.SaveAssets();
return results.ToArray();
