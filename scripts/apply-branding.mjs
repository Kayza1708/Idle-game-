import {readFileSync,writeFileSync,copyFileSync,mkdirSync,existsSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

/** Apply only the visible brand and icon resources; retain application IDs and other native settings. */
export function applyBranding(root=resolve(dirname(fileURLToPath(import.meta.url)),'..')){
 const name=JSON.parse(readFileSync(resolve(root,'capacitor.config.json'),'utf8')).appName;
 const xml=name.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&apos;');
 const plans=[],platforms=[];
 const text=(path,content)=>plans.push(()=>{mkdirSync(dirname(path),{recursive:true});writeFileSync(path,content)});
 const copy=(source,target)=>{if(!existsSync(source))throw Error(`Missing branding asset: ${source}`);plans.push(()=>{mkdirSync(dirname(target),{recursive:true});copyFileSync(source,target)})};
 const ios=resolve(root,'ios/App/App'),android=resolve(root,'android/app/src/main');
 if(existsSync(ios)){
  const plist=resolve(ios,'Info.plist');let contents=readFileSync(plist,'utf8');
  if(!contents.includes('<plist')||!contents.includes('</dict>'))throw Error('Unsupported iOS Info.plist; expected XML. No files changed.');
  const key=/<key>CFBundleDisplayName<\/key>\s*<string>[\s\S]*?<\/string>/;
  if(contents.includes('<key>CFBundleDisplayName</key>')&&!key.test(contents))throw Error('Unsupported CFBundleDisplayName value. No files changed.');
  contents=key.test(contents)?contents.replace(key,()=>`<key>CFBundleDisplayName</key>\n\t<string>${xml}</string>`):contents.slice(0,contents.lastIndexOf('</dict>'))+`\t<key>CFBundleDisplayName</key>\n\t<string>${xml}</string>\n`+contents.slice(contents.lastIndexOf('</dict>'));
  const icons=resolve(ios,'Assets.xcassets/AppIcon.appiconset');
  copy(resolve(root,'resources/branding/app-icon-1024.png'),resolve(icons,'AppIcon-1024.png'));
  text(resolve(icons,'Contents.json'),JSON.stringify({images:[{filename:'AppIcon-1024.png',idiom:'universal',platform:'ios',size:'1024x1024'}],info:{author:'xcode',version:1}},null,2)+'\n');
  text(plist,contents);platforms.push('iOS');
 }
 if(existsSync(android)){
  const strings=resolve(android,'res/values/strings.xml');let contents=readFileSync(strings,'utf8');
  const appName=/<string\s+name="app_name"[^>]*>[\s\S]*?<\/string>/;
  if(!appName.test(contents))throw Error('Unsupported Android strings.xml: app_name missing. No files changed.');
  for(const key of ['app_name','title_activity_main'])contents=contents.replace(new RegExp(`(<string\\s+name="${key}"[^>]*>)[\\s\\S]*?(<\\/string>)`),(_,start,end)=>`${start}${xml}${end}`);
  text(strings,contents);
  for(const dpi of ['mdpi','hdpi','xhdpi','xxhdpi','xxxhdpi'])for(const name of ['ic_launcher','ic_launcher_round'])copy(resolve(root,`resources/branding/android/mipmap-${dpi}/ic_launcher.png`),resolve(android,`res/mipmap-${dpi}/${name}.png`));
  copy(resolve(root,'resources/branding/android/ic_launcher_foreground.png'),resolve(android,'res/drawable/idle_intelligence_foreground.png'));
  text(resolve(android,'res/values/idle_intelligence_colors.xml'),'<?xml version="1.0" encoding="utf-8"?>\n<resources><color name="idle_intelligence_background">#050817</color></resources>\n');
  const adaptive='<?xml version="1.0" encoding="utf-8"?>\n<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android"><background android:drawable="@color/idle_intelligence_background"/><foreground android:drawable="@drawable/idle_intelligence_foreground"/></adaptive-icon>\n';
  for(const name of ['ic_launcher','ic_launcher_round'])text(resolve(android,`res/mipmap-anydpi-v26/${name}.xml`),adaptive);
  platforms.push('Android');
 }
 // Validate all platform inputs before writing any planned files.
 for(const apply of plans)apply();
 return platforms;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const platforms=applyBranding();
 console.log(platforms.length?`Idle Intelligence: ${platforms.join(' + ')} icon and display name updated. Rebuild the app in Xcode/Android Studio.`:'No native project found. Web icons are already included. After adding your Capacitor platform, run npm run branding:apply again.');
}
