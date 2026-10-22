/** Cosmetic sprite only. Economy transactions live exclusively in the pure domain. */
export function GumballVoucherArt({size=54}:{size?:number}) {
 return <img src="/assets/game/gumball-voucher.svg" width={size} height={size}
   alt="" aria-hidden="true" className="gumball-voucher-art" draggable={false}/>;
}
