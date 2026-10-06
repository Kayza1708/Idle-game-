export type ScientificJSON={m:number;e:number};
/** Nonnegative decimal floating point, not exact decimal arithmetic.
 * The mantissa uses binary64 (~15-16 significant decimal digits); the exponent is
 * a safe integer. Arithmetic rounds, and terms more than 16 decades smaller are
 * discarded. Logarithmic powers can lose additional precision at large exponents.
 * Invalid inputs throw instead of becoming a zero balance or a free cost.
 */
export class ScientificNumber {
  readonly mantissa:number;
  readonly exponent:number;
  private constructor(mantissa:number,exponent:number){
    if(!Number.isFinite(mantissa)||mantissa<0||!Number.isFinite(exponent)||!Number.isSafeInteger(Math.floor(exponent)))throw new RangeError('Invalid scientific number');
    if(mantissa===0){this.mantissa=0;this.exponent=0;return;}
    const whole=Math.floor(exponent),fraction=exponent-whole;
    let m=mantissa,e=whole;
    if(m<1||m>=10){
      // Decimal scaling avoids division by an inexact power of ten (e.g. .15/.1)
      // and underflow of 10**-324. Seventeen digits retain binary64 precision.
      const [coefficient,power]=m.toExponential(16).split('e');
      m=Number(coefficient);e+=Number(power);
    }
    // Historical fractional exponents represent value, not an integer to truncate.
    m*=10**fraction;
    if(m>=10){m/=10;e++;}
    if(m<1){m*=10;e--;}
    if(!Number.isSafeInteger(e)||!Number.isFinite(m)||m<1||m>=10)throw new RangeError('Scientific exponent out of range');
    this.mantissa=m;this.exponent=e;
  }
  static zero(){return new ScientificNumber(0,0)}
  static from(value:number){return new ScientificNumber(value,0)}
  static fromString(value:string){const match=value.trim().match(/^([+]?(?:\d+(?:\.\d*)?|\.\d+))(?:e([+-]?\d+))?$/i);if(!match)throw new TypeError('Invalid scientific string');return ScientificNumber.fromParts(Number(match[1]),Number(match[2]??0))}
  static fromParts(mantissa:number,exponent:number){return new ScientificNumber(mantissa,exponent)}
  static fromJSON(value:unknown){if(!value||typeof value!=='object')throw new TypeError('Invalid scientific JSON');const x=value as Partial<ScientificJSON>;if(typeof x.m!=='number'||typeof x.e!=='number')throw new TypeError('Invalid scientific JSON');return ScientificNumber.fromParts(x.m,x.e)}
  static isValidJSON(value:unknown){try{ScientificNumber.fromJSON(value);return true;}catch{return false;}}
  static isValid(value:unknown):value is ScientificNumber{return value instanceof ScientificNumber&&Number.isSafeInteger(value.exponent)&&(value.mantissa===0?value.exponent===0:Number.isFinite(value.mantissa)&&value.mantissa>=1&&value.mantissa<10)}
  isZero(){return this.mantissa===0}
  compare(other:ScientificNumber){if(this.isZero()||other.isZero())return this.isZero()?(other.isZero()?0:-1):1;if(this.exponent!==other.exponent)return this.exponent<other.exponent?-1:1;return this.mantissa===other.mantissa?0:this.mantissa<other.mantissa?-1:1}
  add(other:ScientificNumber){if(this.isZero())return other;if(other.isZero())return this;const hi=this.compare(other)>=0?this:other,lo=hi===this?other:this,gap=hi.exponent-lo.exponent;if(gap>16)return hi;return new ScientificNumber(hi.mantissa+lo.mantissa*10**-gap,hi.exponent)}
  subtract(other:ScientificNumber){if(other.isZero())return this;if(this.compare(other)<=0)return ScientificNumber.zero();const gap=this.exponent-other.exponent;if(gap>16)return this;return new ScientificNumber(this.mantissa-other.mantissa*10**-gap,this.exponent)}
  multiply(other:ScientificNumber){if(this.isZero()||other.isZero())return ScientificNumber.zero();return new ScientificNumber(this.mantissa*other.mantissa,this.exponent+other.exponent)}
  multiplyNumber(value:number){return this.multiply(ScientificNumber.from(value))}
  divide(other:ScientificNumber){if(other.isZero())throw new RangeError('Division by zero');if(this.isZero())return ScientificNumber.zero();return new ScientificNumber(this.mantissa/other.mantissa,this.exponent-other.exponent)}
  divideNumber(value:number){return this.divide(ScientificNumber.from(value))}
  log10(){return this.isZero()?-Infinity:Math.log10(this.mantissa)+this.exponent}
  sqrt(){return this.pow(.5)}
  pow(exponent:number){
    if(!Number.isFinite(exponent))throw new RangeError('Invalid power');
    if(exponent===0)return ScientificNumber.from(1);
    if(this.isZero()){if(exponent<0)throw new RangeError('Negative power of zero');return ScientificNumber.zero();}
    if(exponent===1)return this;
    const scaled=this.exponent*exponent,whole=Math.floor(scaled),log=Math.log10(this.mantissa)*exponent+(scaled-whole),shift=Math.floor(log);
    return new ScientificNumber(10**(log-shift),whole+shift);
  }
  /** Convert only for legacy/UI paths. The cap makes overflow explicit instead of Infinity. */
  toNumber(cap=1e300){if(!Number.isFinite(cap)||cap<=0)throw new RangeError('Invalid projection cap');if(this.isZero())return 0;if(this.compare(ScientificNumber.from(cap))>=0)return cap;return this.exponent<-308?Number(`${this.mantissa}e${this.exponent}`):this.mantissa*10**this.exponent}
  toScientificString(digits=6){if(this.isZero())return '0';return `${this.mantissa.toPrecision(Math.max(1,digits))}e${this.exponent>=0?'+':''}${this.exponent}`}
  toDisplayString(digits=2,engineering=false){if(this.isZero())return '0';const d=Math.max(0,Math.floor(digits));if(engineering){const e=Math.floor(this.exponent/3)*3,m=this.mantissa*10**(this.exponent-e);return `${m.toFixed(d)}e${e>=0?'+':''}${e}`;}return `${this.mantissa.toFixed(d)}e${this.exponent>=0?'+':''}${this.exponent}`}
  toJSON():ScientificJSON{return {m:this.mantissa,e:this.exponent}}
}
