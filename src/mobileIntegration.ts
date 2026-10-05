type PluginListener={remove:()=>Promise<void>|void};
type CapacitorPlugin={addListener?:(name:string,callback:(event:any)=>void)=>Promise<PluginListener>|PluginListener;vibrate?:(options:{duration:number})=>Promise<void>;setStyle?:(options:unknown)=>Promise<void>;exitApp?:()=>Promise<void>};
type CapacitorGlobal={isNativePlatform?:()=>boolean;getPlatform?:()=>string;Plugins?:Record<string,CapacitorPlugin>};
export const MOBILE_BACKGROUND_EVENT='ai-singularity:native-background';
export const MOBILE_FOREGROUND_EVENT='ai-singularity:native-foreground';
export const MOBILE_BACK_EVENT='ai-singularity:native-back';
export const MOBILE_EXIT_EVENT='ai-singularity:native-exit';
export function createLifecycleGate(initiallyBackgrounded:boolean,onBackground:()=>void,onForeground:()=>void){let backgrounded=initiallyBackgrounded;return{background(){if(backgrounded)return false;backgrounded=true;onBackground();return true},foreground(){if(!backgrounded)return false;backgrounded=false;onForeground();return true}}}
export function installMobileIntegration(target:Window=window){const capacitor=(target as any).Capacitor as CapacitorGlobal|undefined;if(!capacitor?.isNativePlatform?.())return()=>{};const plugins=capacitor.Plugins??{},app=plugins.App,haptics=plugins.Haptics,handles:PluginListener[]=[];let disposed=false;
 const add=async(name:string,callback:(event:any)=>void)=>{try{const handle=await app?.addListener?.(name,callback);if(handle&&!disposed)handles.push(handle);else await handle?.remove()}catch{/* Native lifecycle must never crash gameplay. */}};
 void add('appStateChange',({isActive}:{isActive:boolean})=>target.dispatchEvent(new Event(isActive?MOBILE_FOREGROUND_EVENT:MOBILE_BACKGROUND_EVENT)));
 void add('backButton',()=>target.dispatchEvent(new Event(MOBILE_BACK_EVENT)));
 target.addEventListener(MOBILE_EXIT_EVENT,()=>void app?.exitApp?.().catch(()=>undefined),{signal:(()=>{const controller=new AbortController();handles.push({remove:()=>controller.abort()});return controller.signal})()});
 if(haptics?.vibrate)(target as any).NativeHaptics={vibrate:(pattern:number[])=>{let delay=0;for(const duration of pattern){if(duration>0)setTimeout(()=>void haptics.vibrate?.({duration}).catch(()=>undefined),delay);delay+=Math.max(0,duration)}}};
 document.documentElement.dataset.nativePlatform=capacitor.getPlatform?.()??'native';
 return()=>{disposed=true;for(const handle of handles)void handle.remove();delete (target as any).NativeHaptics;delete document.documentElement.dataset.nativePlatform};}
