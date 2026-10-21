/** Transport decoding only; never trim or normalize an original file. */
export function decodeOriginalWebBytes(bytes:Uint8Array){if(bytes.byteLength>4*1024*1024)throw Error('Web save exceeds 4 MiB.');return new TextDecoder('utf-8',{fatal:true,ignoreBOM:true}).decode(bytes);}
