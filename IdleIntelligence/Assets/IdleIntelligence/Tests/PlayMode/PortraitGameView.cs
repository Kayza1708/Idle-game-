#if UNITY_EDITOR
using System;using System.Reflection;using UnityEditor;
namespace IdleIntelligence.PlayTests {
 public static class PortraitGameView {
  // Pinned Editor only: raycasts need a genuine portrait display, not a temporary screenshot camera.
  public static void Set(int width=390,int height=846){var assembly=typeof(Editor).Assembly;var sizesType=assembly.GetType("UnityEditor.GameViewSizes",true);var singleton=sizesType.BaseType.GetProperty("instance",BindingFlags.Public|BindingFlags.Static).GetValue(null);var groupKey=sizesType.GetProperty("currentGroupType",BindingFlags.Public|BindingFlags.NonPublic|BindingFlags.Instance|BindingFlags.Static).GetValue(singleton);var group=sizesType.GetMethod("GetGroup").Invoke(singleton,new[]{groupKey});var sizeType=assembly.GetType("UnityEditor.GameViewSize",true);var kind=assembly.GetType("UnityEditor.GameViewSizeType",true);var size=Activator.CreateInstance(sizeType,BindingFlags.Public|BindingFlags.NonPublic|BindingFlags.Instance,null,new[]{Enum.Parse(kind,"FixedResolution"),(object)width,height,"Idle portrait regression"},null);group.GetType().GetMethod("AddCustomSize").Invoke(group,new[]{size});int count=(int)group.GetType().GetMethod("GetTotalCount").Invoke(group,null);var window=EditorWindow.GetWindow(assembly.GetType("UnityEditor.GameView",true));window.GetType().GetProperty("selectedSizeIndex",BindingFlags.Public|BindingFlags.NonPublic|BindingFlags.Instance).SetValue(window,count-1);window.Focus();window.Repaint();}
 }
}
#endif
