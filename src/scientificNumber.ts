export type ScientificJSON={m:number;e:number};
/** Positive decimal floating-point primitive for idle-game economy math.
 * A normalized mantissa/exponent pair keeps multiplication, powers and comparisons finite
 * beyond IEEE-754's exponent range. Resource migration can serialize the pair as {m,e}.
 */
export class ScientificNumber {
  readonly mantissa:number;
  readonly exponent:number;
  private constructor(mantissa:number,exponent:number){
    if(!Number.isFinite(mantissa)||!Number.isFinite(exponent)||mantissa<=0){this.mantissa=0;this.exponent=0;return;}
    const shift=Math.floor(Math.log10(mantissa));
    this.mantissa=mantissa/10**shift;this.exponent=exponent+shift;
  }
  static zero(){return new ScientificNumber(0,0)}
  static from(value:number){if(!Number.isFinite(value)||value<=0)return ScientificNumber.zero();const exponent=Math.floor(Math.log10(value));return new ScientificNumber(value/10**exponent,exponent)}
  static fromParts(mantissa:number,exponent:number){return new ScientificNumber(mantissa,exponent)}
  static fromJSON(value:unknown){if(!value||typeof value!=='object')return ScientificNumber.zero();const x=value as Partial<ScientificJSON>;return typeof x.m==='number'&&typeof x.e==='number'?ScientificNumber.fromParts(x.m,x.e):ScientificNumber.zero()}
  isZero(){return this.mantissa===0}
  compare(other:ScientificNumber){if(this.isZero()||other.isZero())return this.isZero()?(other.isZero()?0:-1):1;if(this.exponent!==other.exponent)return this.exponent<other.exponent?-1:1;return this.mantissa===other.mantissa?0:this.mantissa<other.mantissa?-1:1}
  add(other:ScientificNumber){if(this.isZero())return other;if(other.isZero())return this;const hi=this.compare(other)>=0?this:other,lo=hi===this?other:this,gap=hi.exponent-lo.exponent;if(gap>16)return hi;return new ScientificNumber(hi.mantissa+lo.mantissa*10**-gap,hi.exponent)}
  subtract(other:ScientificNumber){if(other.isZero())return this;if(this.compare(other)<=0)return ScientificNumber.zero();const gap=this.exponent-other.exponent;if(gap>16)return this;return new ScientificNumber(this.mantissa-other.mantissa*10**-gap,this.exponent)}
  multiply(other:ScientificNumber){if(this.isZero()||other.isZero())return ScientificNumber.zero();return new ScientificNumber(this.mantissa*other.mantissa,this.exponent+other.exponent)}
  multiplyNumber(value:number){return this.multiply(ScientificNumber.from(value))}
  divide(other:ScientificNumber){if(this.isZero()||other.isZero())return ScientificNumber.zero();return new ScientificNumber(this.mantissa/other.mantissa,this.exponent-other.exponent)}
  pow(exponent:number){if(this.isZero()||!Number.isFinite(exponent))return ScientificNumber.zero();const log=(Math.log10(this.mantissa)+this.exponent)*exponent,whole=Math.floor(log);return new ScientificNumber(10**(log-whole),whole)}
  /** Convert only for legacy/UI paths. The cap makes overflow explicit instead of Infinity. */
  toNumber(cap=1e300){if(this.isZero())return 0;const capLog=Math.log10(cap),log=Math.log10(this.mantissa)+this.exponent;if(log>=capLog)return cap;return this.mantissa*10**this.exponent}
  toScientificString(digits=6){if(this.isZero())return '0';return `${this.mantissa.toPrecision(Math.max(1,digits))}e${this.exponent>=0?'+':''}${this.exponent}`}
  toJSON():ScientificJSON{return {m:this.mantissa,e:this.exponent}}
}
