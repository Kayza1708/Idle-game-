export type PixelIconName='tap'|'credits'|'data'|'compute'|'hardware'|'research'|'training'|'analysis'|'components'|'craft'|'item'|'prestige'|'time'|'season'|'challenge'|'profile'|'gem'|'box'|'lock'|'plus';
/** Original orthogonal, filled sprites on a 16-pixel grid; no rounded strokes. */
const pixels:Record<PixelIconName,string>={
 tap:'M3 1h2v2h2v2h2v2h2v2h2v2H9v2h2v2H9v-2H7v-2H5v2H3z',
 credits:'M5 1h6v2h2v2h2v6h-2v2h-2v2H5v-2H3v-2H1V5h2V3h2zm0 4v6h6V9H7V7h4V5z',
 data:'M3 1h10v14H3zm2 2v2h6V3zm0 4v2h6V7zm0 4v2h4v-2z',
 compute:'M3 3h10v10H3zm3 3v4h4V6zM5 0h2v3H5zm4 0h2v3H9zM5 13h2v3H5zm4 0h2v3H9zM0 5h3v2H0zm0 4h3v2H0zM13 5h3v2h-3zm0 4h3v2h-3z',
 hardware:'M1 2h14v9H1zm2 2v5h10V4zM6 11h4v2h3v2H3v-2h3z',
 research:'M5 1h6v2H9v4h2v2h2v2h2v4H1v-4h2V9h2V7h2V3H5zm0 10v2h6v-2z',
 training:'M1 12h3V9h3V6h3V3h3V1h2v6h-2V5h-1v3H9v3H6v3H3v2H1z',
 analysis:'M3 1h6v2h2v2h2v4h-2v2H9v2H3v-2H1V3h2zm0 4v4h2v2h4V9h2V5H9V3H5v2zM11 11h2v2h2v2h-2v-2h-2z',
 components:'M1 4h14v9H1zm3 2v5h8V6zM3 1h2v3H3zm4 0h2v3H7zm4 0h2v3h-2zM3 13h2v3H3zm4 0h2v3H7zm4 0h2v3h-2z',
 craft:'M9 1h4v2h2v4h-2V5h-2v2H9v2H7v2H5v2H3v2H1v-4h2V9h2V7h2V5h2z',
 item:'M3 2h10v2h2v10H1V4h2zm0 4v6h4V6zm6 0v6h4V6zM3 4v2h10V4z',
 prestige:'M5 1h6v2h2v2h2v4H9V7h2V5H9V3H5v2H3v6h2v2h6v2H5v-2H3v-2H1V5h2V3h2z',
 time:'M5 1h6v2h2v2h2v6h-2v2h-2v2H5v-2H3v-2H1V5h2V3h2zm0 2v2H3v6h2v2h6v-2h2V5h-2V3zM7 4h2v4h3v2H7z',
 season:'M7 1h2v4h2v2h4v2h-4v2h2v4h-2v-2H9v-2H7v2H5v2H3v-4h2V9H1V7h4V5h2z',
 challenge:'M2 1h2v14H2zM4 2h10v4h-2v2h2v3H4z',
 profile:'M5 1h6v2h2v4h-2v2H5V7H3V3h2zM3 11h10v2h2v2H1v-2h2z',
 gem:'M5 1h6v2h2v2h2v4h-2v2h-2v2H9v2H7v-2H5v-2H3V9H1V5h2V3h2zm0 4v2h6V5zM7 8v3h2V8z',
 box:'M1 3h14v4H9v8H7V7H1zm0 6h4v6H1zm10 0h4v6h-4zM3 1h4v2H3zm6 0h4v2H9z',
 lock:'M5 1h6v2h2v4h2v8H1V7h2V3h2zm0 2v4h6V3zm2 7v3h2v-3z',
 plus:'M6 1h4v5h5v4h-5v5H6v-5H1V6h5z'
};
export function PixelIcon({name,label}:{name:PixelIconName;label?:string}){return <span className={`pixel-icon pixel-icon-${name}`} role={label?'img':undefined} aria-label={label} aria-hidden={label?undefined:true}><svg className="vector-icon" viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true"><path d={pixels[name]} fill="currentColor" fillRule="evenodd"/></svg></span>}
