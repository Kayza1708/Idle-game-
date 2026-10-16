/** Sparse signed base-10^7 expansion. Addition, subtraction and decimal products
 * retain small transaction deltas; powers remain ~15-digit approximations.
 * No dense allocation between distant exponents (1e350 - 1 has two terms).
 */
export type ScientificJSON = {
  m: number;
  e: number;
  terms?: [number, number][];
};
const BASE = 10000000n,
  WIDTH = 7;
type Terms = Map<number, bigint>;
function normalize(input: Terms) {
  const out = new Map(input);
  for (const key of [...out.keys()].sort((a, b) => a - b)) {
    let k = key;
    while (out.has(k)) {
      const v = out.get(k)!;
      const carry = v / BASE,
        rest = v % BASE;
      if (rest) out.set(k, rest);
      else out.delete(k);
      if (!carry) break;
      k++;
      out.set(k, (out.get(k) ?? 0n) + carry);
    }
  }
  return out;
}
function decimalTerms(m: number, e: number): Terms {
  if (
    !Number.isFinite(m) ||
    m < 0 ||
    !Number.isFinite(e) ||
    !Number.isSafeInteger(Math.floor(e))
  )
    throw new RangeError("Invalid scientific number");
  if (m === 0) return new Map();
  const whole = Math.floor(e),
    fraction = e - whole;
  let text = String(m),
    extra = 0;
  // Normalize before the fractional multiplication so MAX_VALUE cannot overflow.
  if (fraction) {
    const [coefficient, exponent] = m.toExponential().split("e");
    text = String(Number(coefficient) * 10 ** fraction);
    extra = Number(exponent);
  }
  const [coefficient, power] = text.toLowerCase().split("e"),
    [a, b = ""] = coefficient.split("."),
    digits = (a + b).replace(/^0+/, "") || "0";
  const scale =
      BigInt(whole) +
      BigInt(extra) +
      BigInt(Number(power ?? 0)) -
      BigInt(b.length),
    canonical = scale + BigInt(digits.length - 1);
  if (
    canonical > BigInt(Number.MAX_SAFE_INTEGER) ||
    canonical < BigInt(-Number.MAX_SAFE_INTEGER)
  )
    throw new RangeError("Scientific exponent out of range");
  const width = BigInt(WIDTH),
    q = scale >= 0n ? scale / width : (scale - width + 1n) / width,
    shift = scale - q * width;
  let n = BigInt(digits) * 10n ** shift,
    k = Number(q);
  const map: Terms = new Map();
  while (n) {
    map.set(k++, n % BASE);
    n /= BASE;
  }
  return normalize(map);
}
function difference(a: Terms, b: Terms) {
  const out = new Map(a);
  for (const [k, v] of b) out.set(k, (out.get(k) ?? 0n) - v);
  return normalize(out);
}
function sign(t: Terms) {
  const key = Math.max(...t.keys());
  return key === -Infinity ? 0 : t.get(key)! > 0n ? 1 : -1;
}
export class ScientificNumber {
  readonly mantissa: number;
  readonly exponent: number;
  private readonly terms: Terms;
  private constructor(m: number, e: number, terms?: Terms) {
    this.terms = terms ? normalize(terms) : decimalTerms(m, e);
    if (sign(this.terms) < 0)
      throw new RangeError("Negative scientific number");
    if (!this.terms.size) {
      this.mantissa = 0;
      this.exponent = 0;
      return;
    }
    const k = Math.max(...this.terms.keys()),
      bottom = k - 3;
    let leading = 0n;
    for (const [i, n] of this.terms)
      if (i >= bottom) leading += n * BASE ** BigInt(i - bottom);
    const digits = leading.toString(),
      kept = Math.min(17, digits.length);
    let mantissa = Number(digits.slice(0, kept)) / 10 ** (kept - 1),
      exponent = bottom * WIDTH + digits.length - 1;
    if (mantissa >= 10) {
      mantissa /= 10;
      exponent++;
    }
    if (!Number.isSafeInteger(exponent) || !(mantissa > 0))
      throw new RangeError("Scientific exponent out of range");
    this.mantissa = mantissa;
    this.exponent = exponent;
  }
  static zero() {
    return ScientificNumber.from(0);
  }
  static from(n: number) {
    if (Number.isInteger(n) && n >= 0 && n <= 1024) {
      const existing = SMALL.get(n);
      if (existing) return existing;
      const value = new ScientificNumber(n, 0);
      SMALL.set(n, value);
      return value;
    }
    return ScientificNumber.fromParts(n, 0);
  }
  static fromParts(m: number, e: number) {
    const key = `${m}@${e}`,
      cached = DECIMALS.get(key);
    if (cached) return cached;
    const value = new ScientificNumber(m, e);
    if (DECIMALS.size >= 2048) DECIMALS.clear();
    DECIMALS.set(key, value);
    return value;
  }
  static fromString(s: string) {
    const m = s
      .trim()
      .match(/^([+]?(?:\d+(?:\.\d*)?|\.\d+))(?:e([+-]?\d+))?$/i);
    if (!m) throw new TypeError("Invalid scientific string");
    return ScientificNumber.fromParts(Number(m[1]), Number(m[2] ?? 0));
  }
  static fromJSON(value: unknown) {
    if (!value || typeof value !== "object")
      throw new TypeError("Invalid scientific JSON");
    const x = value as ScientificJSON;
    if (typeof x.m !== "number" || typeof x.e !== "number")
      throw new TypeError("Invalid scientific JSON");
    const simple = ScientificNumber.fromParts(x.m, x.e);
    if (x.terms === undefined) return simple;
    if (
      !Array.isArray(x.terms) ||
      x.terms.length > 16384 ||
      x.terms.some(
        (row) =>
          !Array.isArray(row) ||
          row.length !== 2 ||
          !Number.isSafeInteger(row[0]) ||
          !Number.isSafeInteger(row[1]) ||
          Math.abs(row[1]) >= Number(BASE),
      ) ||
      new Set(x.terms.map((r) => r[0])).size !== x.terms.length
    )
      throw new TypeError("Invalid scientific residual");
    const exact = new ScientificNumber(
      0,
      0,
      new Map(x.terms.map(([k, n]) => [k, BigInt(n)])),
    );
    if (
      exact.isZero() !== simple.isZero() ||
      (Math.abs(exact.log10() - simple.log10()) >
        1e-12 * Math.max(1, Math.abs(simple.log10())) &&
        !(exact.isZero() && simple.isZero()))
    )
      throw new TypeError("Residual projection mismatch");
    return exact;
  }
  static isValidJSON(x: unknown) {
    try {
      ScientificNumber.fromJSON(x);
      return true;
    } catch {
      return false;
    }
  }
  static isValid(x: unknown): x is ScientificNumber {
    return (
      x instanceof ScientificNumber &&
      x.terms instanceof Map &&
      Number.isSafeInteger(x.exponent) &&
      sign(x.terms) >= 0
    );
  }
  isZero() {
    return this.terms.size === 0;
  }
  compare(b: ScientificNumber) {
    if (this === b) return 0;
    if (this.isZero() || b.isZero())
      return this.isZero() ? (b.isZero() ? 0 : -1) : 1;
    if (Math.abs(this.exponent - b.exponent) > 1)
      return this.exponent < b.exponent ? -1 : 1;
    const scaled = b.mantissa * 10 ** (b.exponent - this.exponent);
    if (
      Math.abs(this.mantissa - scaled) >
      1e-13 * Math.max(this.mantissa, scaled)
    )
      return this.mantissa < scaled ? -1 : 1;
    return sign(difference(this.terms, b.terms));
  }
  add(b: ScientificNumber) {
    if (b.isZero()) return this;
    if (this.isZero()) return b;
    const out = new Map(this.terms);
    for (const [k, v] of b.terms) out.set(k, (out.get(k) ?? 0n) + v);
    return new ScientificNumber(0, 0, out);
  }
  subtract(b: ScientificNumber) {
    if (b.isZero()) return this;
    const diff = difference(this.terms, b.terms);
    return sign(diff) <= 0
      ? ScientificNumber.zero()
      : new ScientificNumber(0, 0, diff);
  }
  multiply(b: ScientificNumber) {
    if (this.isZero() || b.isZero()) return ScientificNumber.zero();
    if (this === SMALL.get(1)) return b;
    if (b === SMALL.get(1)) return this;
    const out: Terms = new Map();
    for (const [i, a] of this.terms)
      for (const [j, n] of b.terms)
        out.set(i + j, (out.get(i + j) ?? 0n) + a * n);
    return new ScientificNumber(0, 0, out);
  }
  multiplyNumber(n: number) {
    return this.multiply(ScientificNumber.from(n));
  }
  divide(b: ScientificNumber) {
    if (b.isZero()) throw new RangeError("Division by zero");
    if (b === SMALL.get(1)) return this;
    return this.isZero()
      ? ScientificNumber.zero()
      : ScientificNumber.fromParts(
          this.mantissa / b.mantissa,
          this.exponent - b.exponent,
        );
  }
  divideNumber(n: number) {
    return this.divide(ScientificNumber.from(n));
  }
  log10() {
    return this.isZero()
      ? -Infinity
      : Math.log10(this.mantissa) + this.exponent;
  }
  sqrt() {
    return this.pow(0.5);
  }
  pow(p: number) {
    if (!Number.isFinite(p)) throw new RangeError("Invalid power");
    if (p === 0) return ScientificNumber.from(1);
    if (p === 1) return this;
    if (this.isZero()) {
      if (p < 0) throw new RangeError("Negative power of zero");
      return ScientificNumber.zero();
    }
    const x = this.exponent * p,
      whole = Math.floor(x),
      log = Math.log10(this.mantissa) * p + (x - whole),
      shift = Math.floor(log);
    return ScientificNumber.fromParts(10 ** (log - shift), whole + shift);
  }
  floor() {
    if (this.isZero()) return this;
    const integers = new Map([...this.terms].filter(([k]) => k >= 0)),
      fractions = new Map([...this.terms].filter(([k]) => k < 0));
    if (sign(fractions) < 0) integers.set(0, (integers.get(0) ?? 0n) - 1n);
    return new ScientificNumber(0, 0, integers);
  }
  toNumber(cap = 1e300) {
    if (!Number.isFinite(cap) || cap <= 0)
      throw new RangeError("Invalid projection cap");
    if (this.isZero()) return 0;
    if (this.compare(ScientificNumber.from(cap)) >= 0) return cap;
    return Number(`${this.mantissa}e${this.exponent}`);
  }
  toScientificString(digits = 6) {
    return this.isZero()
      ? "0"
      : `${this.mantissa.toPrecision(Math.max(1, digits))}e${this.exponent >= 0 ? "+" : ""}${this.exponent}`;
  }
  toDisplayString(digits = 2, engineering = false) {
    if (this.isZero()) return "0";
    const d = Math.max(0, Math.floor(digits)),
      e = engineering ? Math.floor(this.exponent / 3) * 3 : this.exponent;
    return `${(this.mantissa * 10 ** (this.exponent - e)).toFixed(d)}e${e >= 0 ? "+" : ""}${e}`;
  }
  toJSON(): ScientificJSON {
    const json: ScientificJSON = { m: this.mantissa, e: this.exponent };
    if (
      sign(difference(this.terms, decimalTerms(this.mantissa, this.exponent)))
    )
      json.terms = [...this.terms]
        .sort((a, b) => a[0] - b[0])
        .map(([k, v]) => [k, Number(v)]);
    return json;
  }
}

const SMALL = new Map<number, ScientificNumber>();

const DECIMALS = new Map<string, ScientificNumber>();
