/** Minimal positive scientific-number primitive for idle-game economy math.
 * Keeps a normalized mantissa/exponent pair so multiplication and powers do not overflow.
 * Economy state remains JSON-compatible; this type is used at arithmetic boundaries while
 * the remaining persisted resource fields are migrated incrementally.
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
  isZero(){return this.mantissa===0}
  compare(other:ScientificNumber){if(this.exponent!==other.exponent)return this.exponent<other.exponent?-1:1;return this.mantissa===other.mantissa?0:this.mantissa<other.mantissa?-1:1}
  multiply(other:ScientificNumber){if(this.isZero()||other.isZero())return ScientificNumber.zero();return new ScientificNumber(this.mantissa*other.mantissa,this.exponent+other.exponent)}
  multiplyNumber(value:number){return this.multiply(ScientificNumber.from(value))}
  pow(exponent:number){if(this.isZero())return ScientificNumber.zero();const log=(Math.log10(this.mantissa)+this.exponent)*exponent,whole=Math.floor(log);return new ScientificNumber(10**(log-whole),whole)}
  /** Convert for legacy/UI paths without ever producing Infinity. */
  toNumber(cap=1e300){if(this.isZero())return 0;const capLog=Math.log10(cap),log=Math.log10(this.mantissa)+this.exponent;if(log>=capLog)return cap;return this.mantissa*10**this.exponent}
  toJSON(){return {m:this.mantissa,e:this.exponent}}
}
