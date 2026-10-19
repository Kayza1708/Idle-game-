using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Numerics;

namespace IdleIntelligence.Core
{
    // Sparse signed base-10^7 expansion, ported from src/scientificNumber.ts.
    // A small payment remains present even when the displayed mantissa cannot change.
    public sealed class ScientificNumber : IComparable<ScientificNumber>
    {
        const long Radix = 10000000;
        readonly SortedDictionary<long, BigInteger> terms;
        public readonly double Mantissa;
        public readonly long Exponent;
        public bool IsZero => terms.Count == 0;
        public static ScientificNumber Zero => From(0);
        public static ScientificNumber One => From(1);
        static readonly CultureInfo Invariant = CultureInfo.InvariantCulture;
        static void Put(IDictionary<long, BigInteger> t, long k, BigInteger v) { if (v.IsZero) t.Remove(k); else t[k] = v; }
        static SortedDictionary<long, BigInteger> Normalize(IDictionary<long, BigInteger> input)
        {
            var t = new SortedDictionary<long, BigInteger>(input);
            foreach (var key in t.Keys.ToArray())
            {
                long k = key;
                while (t.TryGetValue(k, out var v))
                {
                    var carry = v / Radix;
                    Put(t, k, v % Radix);
                    if (carry.IsZero) break;
                    k = checked(k + 1);
                    t.TryGetValue(k, out var prior);
                    t[k] = prior + carry;
                }
            }
            return t;
        }
        static int Sign(SortedDictionary<long, BigInteger> t) => t.Count == 0 ? 0 : t.Last().Value.Sign;
        ScientificNumber(IDictionary<long, BigInteger> input)
        {
            terms = Normalize(input);
            if (Sign(terms) < 0) throw new ArgumentOutOfRangeException(nameof(input));
            if (IsZero) return;
            long bottom = terms.Last().Key - 3;
            BigInteger leading = 0;
            foreach (var p in terms) if (p.Key >= bottom) leading += p.Value * BigInteger.Pow(Radix, (int)(p.Key - bottom));
            string digits = leading.ToString(Invariant);
            int kept = Math.Min(17, digits.Length);
            Mantissa = double.Parse(digits.Substring(0, kept), Invariant) / Math.Pow(10, kept - 1);
            Exponent = checked(bottom * 7 + digits.Length - 1);
            if (Mantissa >= 10) { Mantissa /= 10; Exponent++; }
            if (Math.Abs((double)Exponent) > 9007199254740991d || !(Mantissa > 0)) throw new ArgumentOutOfRangeException(nameof(input));
        }
        public static ScientificNumber From(double n) => Parts(n, 0);
        public static ScientificNumber Parts(double m, long exponent)
        {
            if (double.IsNaN(m) || double.IsInfinity(m) || m < 0) throw new ArgumentOutOfRangeException(nameof(m));
            return Parse(m.ToString("R", Invariant), exponent);
        }
        public static ScientificNumber Parse(string value) => Parse(value, 0);
        static ScientificNumber Parse(string value, long extra)
        {
            if (string.IsNullOrWhiteSpace(value)) throw new FormatException("Empty number");
            var split = value.Trim().ToLowerInvariant().TrimStart('+').Split('e');
            if (split.Length > 2) throw new FormatException("Number");
            long exponent = split.Length == 2 ? long.Parse(split[1], Invariant) : 0;
            var decimalParts = split[0].Split('.');
            if (decimalParts.Length > 2) throw new FormatException("Number");
            string digits = string.Concat(decimalParts);
            if (digits.Length == 0 || digits.Any(c => c < '0' || c > '9')) throw new FormatException("Number");
            long scale = checked(exponent + extra - (decimalParts.Length == 2 ? decimalParts[1].Length : 0));
            long k = scale >= 0 ? scale / 7 : (scale - 6) / 7;
            int shift = (int)(scale - k * 7);
            var n = BigInteger.Parse(digits, Invariant) * BigInteger.Pow(10, shift);
            var map = new SortedDictionary<long, BigInteger>();
            while (n > 0) { map[k++] = n % Radix; n /= Radix; }
            return new ScientificNumber(map);
        }
        public int CompareTo(ScientificNumber other)
        {
            if (other == null) return 1;
            var diff = new SortedDictionary<long, BigInteger>(terms);
            foreach (var p in other.terms) { diff.TryGetValue(p.Key, out var a); diff[p.Key] = a - p.Value; }
            return Sign(Normalize(diff));
        }
        public ScientificNumber Add(ScientificNumber b)
        {
            var t = new SortedDictionary<long, BigInteger>(terms);
            foreach (var p in b.terms) { t.TryGetValue(p.Key, out var a); t[p.Key] = a + p.Value; }
            return new ScientificNumber(t);
        }
        public ScientificNumber Subtract(ScientificNumber b)
        {
            var t = new SortedDictionary<long, BigInteger>(terms);
            foreach (var p in b.terms) { t.TryGetValue(p.Key, out var a); t[p.Key] = a - p.Value; }
            t = Normalize(t);
            return Sign(t) <= 0 ? Zero : new ScientificNumber(t);
        }
        public ScientificNumber Multiply(ScientificNumber b)
        {
            var t = new SortedDictionary<long, BigInteger>();
            foreach (var a in terms) foreach (var v in b.terms) { long k = checked(a.Key + v.Key); t.TryGetValue(k, out var n); t[k] = n + a.Value * v.Value; }
            return new ScientificNumber(t);
        }
        public ScientificNumber Times(double n) => Multiply(From(n));
        public ScientificNumber Divide(ScientificNumber b)
        {
            if (b.IsZero) throw new DivideByZeroException();
            return IsZero ? Zero : Parts(Mantissa / b.Mantissa, Exponent - b.Exponent);
        }
        public ScientificNumber Floor()
        {
            var integers=new SortedDictionary<long,BigInteger>(terms.Where(p=>p.Key>=0).ToDictionary(p=>p.Key,p=>p.Value));var fractions=new SortedDictionary<long,BigInteger>(terms.Where(p=>p.Key<0).ToDictionary(p=>p.Key,p=>p.Value));if(Sign(fractions)<0){integers.TryGetValue(0,out var n);integers[0]=n-1;}return new ScientificNumber(integers);
        }
        public double Log10() => IsZero ? double.NegativeInfinity : Math.Log10(Mantissa) + Exponent;
        public ScientificNumber Pow(double p)
        {
            if (double.IsNaN(p) || double.IsInfinity(p)) throw new ArgumentOutOfRangeException(nameof(p));
            if (p == 0) return One;
            if (p == 1) return this;
            if (IsZero) { if (p < 0) throw new ArgumentOutOfRangeException(nameof(p)); return Zero; }
            double x = Exponent * p, whole = Math.Floor(x), log = Math.Log10(Mantissa) * p + (x - whole), shift = Math.Floor(log);
            return Parts(Math.Pow(10, log - shift), checked((long)(whole + shift)));
        }
        public double ToDouble(double cap = 1e300)
        {
            if (IsZero) return 0;
            if (CompareTo(From(cap)) >= 0) return cap;
            return Exponent < -324 ? 0 : double.Parse(Mantissa.ToString("R", Invariant) + "e" + Exponent.ToString(Invariant), Invariant);
        }
        public override string ToString() => IsZero ? "0" : Exponent < 6 && Exponent >= -2 ? ToDouble().ToString("N1", Invariant) : Mantissa.ToString("F2", Invariant) + "e" + Exponent;
        public NumberData ToData() => new NumberData { m = Mantissa, e = Exponent, terms = terms.Select(p => new NumberTerm { index = p.Key, value = (int)p.Value }).ToArray() };
        public static ScientificNumber FromData(NumberData data)
        {
            if (data == null || !Finite(data.m) || data.m < 0 || Math.Abs((double)data.e) > 9007199254740991d) throw new FormatException("Invalid number projection");
            var simple = Parts(data.m, data.e);
            if (data.terms == null || data.terms.Length == 0) return simple;
            if (data.terms.Length > 16384) throw new FormatException("Too many residuals");
            var t = new SortedDictionary<long, BigInteger>();
            foreach (var p in data.terms)
            {
                if (p == null || Math.Abs((long)p.value) >= Radix || Math.Abs((double)p.index) > 1280000000000000d || t.ContainsKey(p.index)) throw new FormatException("Invalid residual");
                t.Add(p.index, p.value);
            }
            var exact = new ScientificNumber(t);
            if (exact.IsZero != simple.IsZero || !exact.IsZero && Math.Abs(exact.Log10() - simple.Log10()) > 1e-12 * Math.Max(1, Math.Abs(simple.Log10()))) throw new FormatException("Projection mismatch");
            return exact;
        }
        public static bool Finite(double x) => !double.IsNaN(x) && !double.IsInfinity(x);
    }
    [Serializable] public sealed class NumberData { public double m; public long e; public NumberTerm[] terms; }
    [Serializable] public sealed class NumberTerm { public long index; public int value; }
}
