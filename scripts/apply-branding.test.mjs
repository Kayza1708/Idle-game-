import {test} from 'vitest';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,rmSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,dirname} from 'node:path';
import {applyBranding} from './apply-branding.mjs';

test('native branding preserves bundle/package identifiers and is repeatable',()=>{
 const root=mkdtempSync(join(tmpdir(),'idle-brand-'));
 const put=(p,s)=>{mkdirSync(dirname(join(root,p)),{recursive:true});writeFileSync(join(root,p),s)};
 try{
  put('capacitor.config.json',JSON.stringify({appName:'Idle Intelligence'}));
  put('resources/branding/app-icon-1024.png','fixture-png');
  put('resources/branding/android/ic_launcher_foreground.png','fixture-png');
  for(const dpi of ['mdpi','hdpi','xhdpi','xxhdpi','xxxhdpi'])put(`resources/branding/android/mipmap-${dpi}/ic_launcher.png`,'fixture-png');
  put('ios/App/App/Info.plist','<plist><dict><key>CFBundleDisplayName</key><string>Old name</string><key>CFBundleIdentifier</key><string>com.existing.id</string><key>NSCameraUsageDescription</key><string>Preserve this</string></dict></plist>');
  put('android/app/src/main/res/values/strings.xml','<resources><string name="app_name">Old name</string><string name="title_activity_main">Old name</string><string name="package_name">com.existing.id</string><string name="custom_url_scheme">original</string></resources>');
  assert.deepEqual(applyBranding(root),['iOS','Android']);
  const plist=readFileSync(join(root,'ios/App/App/Info.plist'),'utf8'),strings=readFileSync(join(root,'android/app/src/main/res/values/strings.xml'),'utf8');
  assert.match(plist,/<string>Idle Intelligence<\/string>/);assert.match(plist,/com.existing.id/);assert.match(plist,/Preserve this/);
  assert.match(strings,/com.existing.id/);assert.match(strings,/original/);assert.doesNotMatch(strings,/Old name/);
  assert.equal(JSON.parse(readFileSync(join(root,'ios/App/App/Assets.xcassets/AppIcon.appiconset/Contents.json'))).images[0].size,'1024x1024');
  assert.ok(existsSync(join(root,'android/app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml')));
  applyBranding(root);assert.equal(readFileSync(join(root,'ios/App/App/Info.plist'),'utf8'),plist);
  assert.equal(readFileSync(join(root,'android/app/src/main/res/values/strings.xml'),'utf8'),strings);
  put('android/app/src/main/res/values/strings.xml','<resources/>');
  assert.throws(()=>applyBranding(root),/app_name missing/);assert.equal(readFileSync(join(root,'ios/App/App/Info.plist'),'utf8'),plist);
 }finally{rmSync(root,{recursive:true,force:true})}
});
