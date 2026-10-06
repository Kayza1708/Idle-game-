import {describe, expect, it} from 'vitest';
import {ScientificNumber} from './scientificNumber';

function canonical(value:ScientificNumber) {
  expect(Number.isSafeInteger(value.exponent)).toBe(true);
  if(value.isZero())expect(value.toJSON()).toEqual({m:0,e:0});
  else {expect(value.mantissa).toBeGreaterThanOrEqual(1);expect(value.mantissa).toBeLessThan(10);}
}

describe('canonical scientific floating point', () => {
  it.each([[0,0],[0,1000],[0,-1.5],[-0,3]])('gives zero a unique representation (%s, %s)', (m,e) => {
    expect(ScientificNumber.fromParts(m,e).toJSON()).toEqual({m:0,e:0});
  });

  it.each([[1,1.1],[1,-.9],[125.89,-1],[.15,2],[150,-1],[1e308,-308]])('normalizes (%s, %s) without truncating its value', (m,e) => {
    const value=ScientificNumber.fromParts(m,e);
    canonical(value);
    expect(value.toNumber(Number.MAX_VALUE)).toBeCloseTo(m*10**e,12);
  });

  it('retains the smallest native subnormal and the largest native number', () => {
    for(const native of [Number.MIN_VALUE,Number.MAX_VALUE]){
      const value=ScientificNumber.from(native);
      canonical(value);
      expect(value.toNumber(Number.MAX_VALUE)).toBe(native);
    }
  });

  it.each([{m:15,e:0},{m:150,e:-1},{m:.15,e:2},{m:1.5,e:1}])('compares equivalent decimal scalings equally: %j', raw => {
    expect(ScientificNumber.fromJSON(raw).compare(ScientificNumber.from(15))).toBe(0);
  });

  it('orders adjacent native balances below, at and above the price strictly', () => {
    const cost=ScientificNumber.from(15);
    expect(ScientificNumber.from(14.999999999999998).compare(cost)).toBe(-1);
    expect(ScientificNumber.from(15).compare(cost)).toBe(0);
    expect(ScientificNumber.from(15.000000000000002).compare(cost)).toBe(1);
  });

  it('normalizes every operation on fractional-exponent inputs', () => {
    const a=ScientificNumber.fromParts(1,1.1),b=ScientificNumber.fromParts(15,0),native=10**1.1;
    const results=[a.add(b),b.subtract(a),a.multiply(b),a.divide(b),a.pow(.5),a.pow(-1)];
    const expected=[native+15,15-native,native*15,native/15,Math.sqrt(native),1/native];
    results.forEach((result,index)=>{canonical(result);expect(result.toNumber()).toBeCloseTo(expected[index],12);});
    expect(a.compare(b)).toBe(-1);
    expect(a.subtract(b).toJSON()).toEqual({m:0,e:0}); // Nonnegative primitive.
  });

  it('adds, subtracts, multiplies, divides and powers beyond native range', () => {
    const a=ScientificNumber.fromParts(2.5,1000),b=ScientificNumber.fromParts(5,999);
    expect(a.add(b).toJSON()).toEqual({m:3,e:1000});
    expect(a.subtract(b).toJSON()).toEqual({m:2,e:1000});
    expect(a.multiply(b).toJSON()).toEqual({m:1.25,e:2000});
    expect(a.divide(b).toNumber()).toBe(5);
    expect(a.pow(2).exponent).toBe(2000);
    expect(a.pow(2).mantissa).toBeCloseTo(6.25,14);
    expect(a.sqrt().exponent).toBe(500);
    expect(a.sqrt().mantissa).toBeCloseTo(Math.sqrt(2.5),14);
    expect(a.pow(-1).exponent).toBe(-1001);
    expect(a.pow(-1).mantissa).toBeCloseTo(4,14);
    expect(ScientificNumber.fromString('1e1000').toJSON()).toEqual({m:1,e:1000});
    expect(a.toNumber()).toBe(1e300); // Explicit legacy/UI cap, never a purchase comparison.
  });

  it('documents finite mantissa precision instead of promising exact decimals', () => {
    const huge=ScientificNumber.fromString('1e1000');
    expect(huge.add(ScientificNumber.from(1))).toBe(huge);
    expect(huge.subtract(ScientificNumber.from(1))).toBe(huge);
  });

  it.each([NaN,Infinity,-Infinity,-1])('rejects invalid/nonpositive-domain native input %s', value => {
    expect(()=>ScientificNumber.from(value)).toThrow(RangeError);
    expect(()=>ScientificNumber.fromParts(value,0)).toThrow(RangeError);
  });

  it.each([NaN,Infinity,-Infinity,Number.MAX_VALUE])('rejects an unrepresentable exponent %s', e => {
    expect(()=>ScientificNumber.fromParts(1,e)).toThrow(RangeError);
    expect(ScientificNumber.isValidJSON({m:1,e})).toBe(false);
  });

  it.each([null,{}, {m:'15',e:0}, {m:NaN,e:0}, {m:1,e:Infinity}, {m:-1,e:0}])('rejects invalid JSON %j rather than inventing zero', raw => {
    expect(()=>ScientificNumber.fromJSON(raw)).toThrow();
    expect(ScientificNumber.isValidJSON(raw)).toBe(false);
  });

  it('rejects invalid arithmetic and projections before returning a value', () => {
    const one=ScientificNumber.from(1),zero=ScientificNumber.zero();
    expect(()=>one.divide(zero)).toThrow(RangeError);
    expect(()=>one.divideNumber(0)).toThrow(RangeError);
    expect(()=>one.multiplyNumber(Infinity)).toThrow(RangeError);
    expect(()=>one.pow(NaN)).toThrow(RangeError);
    expect(()=>zero.pow(-1)).toThrow(RangeError);
    expect(zero.pow(0).toNumber()).toBe(1);
    for(const cap of [NaN,Infinity,0,-1])expect(()=>one.toNumber(cap)).toThrow(RangeError);
    for(const input of ['bad','Infinity','-1','1e10000000000000000'])expect(()=>ScientificNumber.fromString(input)).toThrow();
    expect(()=>ScientificNumber.fromParts(10,Number.MAX_SAFE_INTEGER)).toThrow(RangeError);
  });
});
