import {describe,it,expect,vi,beforeEach,afterEach} from 'vitest';
const bridge=vi.hoisted(()=>({native:false,available:true,write:vi.fn(),remove:vi.fn(),share:vi.fn()}));
vi.mock('@capacitor/core',()=>({Capacitor:{isNativePlatform:()=>bridge.native,isPluginAvailable:()=>bridge.available}}));
vi.mock('@capacitor/filesystem',()=>({Directory:{Cache:'CACHE'},Filesystem:{writeFile:bridge.write,deleteFile:bridge.remove}}));
vi.mock('@capacitor/share',()=>({Share:{share:bridge.share}}));
import {bytesToBase64,deliverFile} from './fileDelivery';
const file={bytes:new Uint8Array([80,75,0,255]),name:'report.zip',mime:'application/zip'};
beforeEach(()=>{vi.clearAllMocks();bridge.native=false;bridge.available=true;bridge.write.mockResolvedValue({uri:'file:///cache/exports/report.zip'});bridge.remove.mockResolvedValue(undefined);bridge.share.mockResolvedValue({})});afterEach(()=>{vi.unstubAllGlobals();vi.useRealTimers()});
describe('file export delivery',()=>{
 it('preserves all binary bytes across bridge encoding',()=>{const bytes=Uint8Array.from({length:30000},(_,i)=>i%256);expect(Uint8Array.from(atob(bytesToBase64(bytes)),c=>c.charCodeAt(0))).toEqual(bytes)});
 it('shares a real cache file on native then cleans it',async()=>{bridge.native=true;expect(await deliverFile(file)).toBe('share');expect(bridge.write).toHaveBeenCalledWith({path:'exports/report.zip',directory:'CACHE',data:'UEsA/w==',recursive:true});expect(bridge.share).toHaveBeenCalledWith(expect.objectContaining({files:['file:///cache/exports/report.zip']}));expect(bridge.remove).toHaveBeenCalledOnce()});
 it('surfaces share failures and still cleans cache for retry',async()=>{bridge.native=true;bridge.share.mockRejectedValueOnce(Error('cancelled'));await expect(deliverFile(file)).rejects.toThrow('cancelled');expect(bridge.remove).toHaveBeenCalledOnce();expect(await deliverFile(file)).toBe('share')});
 it('does not silently claim a browser download when native plugins are missing',async()=>{bridge.native=true;bridge.available=false;await expect(deliverFile(file)).rejects.toThrow('NATIVE_EXPORT_UNAVAILABLE');expect(bridge.write).not.toHaveBeenCalled()});
 it('attaches a browser link and keeps its blob alive until the download can start',async()=>{vi.useFakeTimers();const link={click:vi.fn(),remove:vi.fn(),href:'',download:''},append=vi.fn(),revoke=vi.fn();vi.stubGlobal('document',{body:{append},createElement:()=>link});vi.stubGlobal('URL',{createObjectURL:()=> 'blob:report',revokeObjectURL:revoke});expect(await deliverFile(file)).toBe('download');expect(append).toHaveBeenCalledWith(link);expect(link.download).toBe('report.zip');expect(link.click).toHaveBeenCalledOnce();expect(revoke).not.toHaveBeenCalled();vi.advanceTimersByTime(30000);expect(revoke).toHaveBeenCalledWith('blob:report')});
});
