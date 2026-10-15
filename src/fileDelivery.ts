import {Capacitor} from '@capacitor/core';
import {Filesystem,Directory} from '@capacitor/filesystem';
import {Share} from '@capacitor/share';

export type ExportFile={bytes:Uint8Array;name:string;mime:string};
export function bytesToBase64(bytes:Uint8Array){let binary='';for(let offset=0;offset<bytes.length;offset+=8192)binary+=String.fromCharCode(...bytes.subarray(offset,offset+8192));return btoa(binary);}
/** Called by the explicit Save / Share button, after archive preparation. */
export async function deliverFile(file:ExportFile):Promise<'download'|'share'>{
 if(Capacitor.isNativePlatform()){
  if(!Capacitor.isPluginAvailable('Filesystem')||!Capacitor.isPluginAvailable('Share'))throw new Error('NATIVE_EXPORT_UNAVAILABLE');
  const path=`exports/${file.name}`;
  const {uri}=await Filesystem.writeFile({path,directory:Directory.Cache,data:bytesToBase64(file.bytes),recursive:true});
  try{await Share.share({title:file.name,files:[uri],dialogTitle:'AI Singularity'});}finally{await Filesystem.deleteFile({path,directory:Directory.Cache}).catch(()=>{});}
  return 'share';
 }
 const url=URL.createObjectURL(new Blob([file.bytes as BlobPart],{type:file.mime})),link=document.createElement('a');
 link.href=url;link.download=file.name;document.body.append(link);
 try{link.click();}finally{link.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);}
 return 'download';
}
