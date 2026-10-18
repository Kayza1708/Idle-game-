import { useEffect, useRef, useState } from "react";
import { BALANCE, type GameState } from "./economy";
import {
  adFree,
  commerceState,
  rewardQuote,
  researchSkipQuote,
  type RewardKind,
  type ProductId,
} from "./commerce";
import {
  unavailableShopNativeAdapter,
  unavailablePurchaseVerifier,
  verifyStoreResults,
  persistAndFinishPurchases,
  type ShopNativeAdapter,
  type PurchaseVerifier,
  type StoreProduct,
} from "./shopNative";
import { GemBundleArt, ShopIcon } from "./ShopIcon";
import { ComponentArt, GemAmount } from "./GameArt";
import { ItemPortrait } from "./ItemPresentation";
import { MobileDetailSheet } from "./MobileDetailSheet";
type Action = (name: string, ...args: any[]) => void;
export type StoreServices = {
  nativeShop?: ShopNativeAdapter;
  purchaseVerifier?: PurchaseVerifier;
};
export function NativeOffers({
  s,
  act,
  nativeShop = unavailableShopNativeAdapter,
  purchaseVerifier = unavailablePurchaseVerifier,
  permanentOnly = false,
  productIds,
}: StoreServices & { s: GameState; act: Action; permanentOnly?: boolean;productIds?:ProductId[] }) {
  const de = s.settings.language === "de",
    [products, setProducts] = useState<StoreProduct[]>([]),
    [busy, setBusy] = useState(false),
    [status, setStatus] = useState(""),
    lock = useRef(false),
    context = useRef(s.telemetry.campaignId);
  context.current = s.telemetry.campaignId;
  const ready =
    nativeShop.available &&
    purchaseVerifier.available &&
    typeof nativeShop.finish === "function";
  useEffect(() => {
    let live = true;
    setProducts([]);
    if (ready)
      void nativeShop
        .products()
        .then((p) => {
          if (live) setProducts(p);
        })
        .catch(() => {
          if (live)
            setStatus(
              de
                ? "Store derzeit nicht erreichbar."
                : "Store currently unavailable.",
            );
        });
    return () => {
      live = false;
    };
  }, [nativeShop, purchaseVerifier, ready]);
  const purchase = async (id?: ProductId) => {
    if (!ready || lock.current) return;
    lock.current = true;
    setBusy(true);
    const campaign = context.current;
    try {
      const results = id
        ? [await nativeShop.purchase(id)]
        : await nativeShop.restore();
      const verified = (
        await verifyStoreResults(results, purchaseVerifier)
      ).filter(
        (p) =>
          id ||
          p.productId === "ai_singularity.pass.adfree" ||
          p.productId === "ai_singularity.pass.income" || p.productId.startsWith("ai_singularity.season."),
      );
      if (campaign !== context.current) return;
      if (verified.length) {
        const saved = await persistAndFinishPurchases(
          nativeShop,
          verified,
          (grants) =>
            new Promise<boolean>((resolve) =>
              act("store-verified", grants, !id, campaign, resolve),
            ),
        );
        if (!saved) {
          setStatus(
            de
              ? "Kauf bestätigt, aber noch nicht gespeichert. Bitte erneut versuchen."
              : "Purchase verified but not saved. Please retry.",
          );
          return;
        }
        setStatus(
          de ? "Kaufprüfung abgeschlossen." : "Purchase verification complete.",
        );
      } else
        setStatus(
          results.some((r) => r.status === "pending")
            ? de
              ? "Kauf wartet auf Bestätigung."
              : "Purchase pending approval."
            : results.some((r) => r.status === "cancelled")
              ? de
                ? "Kauf abgebrochen."
                : "Purchase cancelled."
              : de
                ? "Keine bestätigten Käufe. Es wurde nichts gutgeschrieben."
                : "No verified purchases. Nothing was credited.",
        );
    } catch {
      setStatus(
        de
          ? "Store oder Kaufprüfung nicht erreichbar. Bitte erneut versuchen."
          : "Store or verification unavailable. Please try again.",
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  const title = (kind: string, gems: number) => kind==="season"?"Premium Season Pass":
    kind === "adfree"
      ? de
        ? "Werbefrei-Pass"
        : "Ad-free pass"
      : kind === "income"
        ? de
          ? "Dauerhaft 2× Einkommen"
          : "Permanent 2× income"
        : kind === "starter"
          ? de
            ? "Starterpaket"
            : "Starter pack"
          : kind === "builder"
            ? de
              ? "Baumeisterpaket"
              : "Builder pack"
            : kind === "lab"
              ? de
                ? "Laborvorrat"
                : "Lab supply"
              : `${gems} Gems`;
  return (
    <section className="commerce-store">
      <header className="market-section-title">
        <h2>{de ? "Pakete & Vorteile" : "Packs & benefits"}</h2>
      </header>
      <p>
        {de
          ? "Einmalkäufe bleiben nach Prestige und Axiom-Reset erhalten."
          : "One-time purchases survive prestige and axiom resets."}
      </p>
      <div className="market-bundles">
        {BALANCE.commerce.products
          .filter(
            (p) => (!productIds||productIds.includes(p.id))&&(!permanentOnly || p.kind === "adfree" || p.kind === "income")&& (p.kind!=="season"||p.id.endsWith(s.season.id.split("-")[1])),
          )
          .map((p) => {
            const store = products.find((x) => x.id === p.id),
              owned = commerceState(s).owned.includes(p.id);
            return (
              <article key={p.id} data-native-product={p.id}>
                {p.kind === "adfree" || p.kind === "income" || p.kind==="season" ? (
                  <ShopIcon
                    name={p.kind==="season"?"season":p.kind === "adfree" ? "offline" : "researchBoost"}
                  />
                ) : (
                  <GemBundleArt gems={p.gems} />
                )}
                <h3>{title(p.kind, p.gems)}</h3>
                <span className="commerce-label">
                  {p.once
                    ? de
                      ? "EINMALIG"
                      : "ONE-TIME"
                    : de
                      ? "WIEDERHOLBAR"
                      : "REPEATABLE"}
                </span>
                {p.kind === "adfree" && (
                  <p>
                    {de
                      ? "Video-Belohnungen ohne Video abholen. Die normalen Limits bleiben bestehen."
                      : "Claim video rewards without watching. Normal limits still apply."}
                  </p>
                )}
                {p.kind==="season"&&<p>{de?`Gilt nur für Season ${p.id.split(".").at(-1)}. Kein automatisches Abo. Erreichte Premium-Belohnungen nachträglich abholen.`:`Only for season ${p.id.split(".").at(-1)}. No automatic subscription. Claim reached premium rewards retroactively.`}</p>}
                {p.kind === "income" && (
                  <p>
                    {de
                      ? "Passive Credits, Taps und Offline-Credits dauerhaft ×2. Kein zusätzlicher Zeitbonus."
                      : "Passive credits, taps and offline credits permanently ×2. No extra time boost."}
                  </p>
                )}
                {p.gems > 0 && <GemAmount value={p.gems} />}
                <div className="bundle-materials">
                  {Object.entries(p.components).map(([id, n]) => (
                    <span key={id}>
                      <ComponentArt
                        id={id as keyof GameState["componentInventory"]}
                      />
                      <b>×{n}</b>
                    </span>
                  ))}
                </div>
                {p.kind === "starter" && (
                  <>
                    <p>
                      {de
                        ? "3 garantierte Rare-Items · je eine Form"
                        : "3 guaranteed Rare items · one per family"}
                    </p>
                    <div className="commerce-starter-items">
                      {BALANCE.commerce.starterItems.map((item, i) => (
                        <ItemPortrait
                          key={item.type}
                          item={{
                            ...item,
                            id: `preview-${i}`,
                            level: 1,
                            locked: false,
                          }}
                        />
                      ))}
                    </div>
                  </>
                )}
                <button
                  disabled={
                    owned ||
                    busy ||
                    !ready ||
                    !store?.available ||
                    !store.localizedPrice
                  }
                  onClick={() => void purchase(p.id)}
                >
                  {owned
                    ? de
                      ? "✓ Aktiv"
                      : "✓ Owned"
                    : busy
                      ? de
                        ? "Bitte warten…"
                        : "Please wait…"
                      : ready && store?.available
                        ? store.localizedPrice
                        : de
                          ? "Noch nicht verfügbar"
                          : "Not available yet"}
                </button>
              </article>
            );
          })}
      </div>
      <button disabled={!ready || busy} onClick={() => void purchase()}>
        {de
          ? "Käufe wiederherstellen"
          : "Restore purchases"}
      </button>
      {status && <p role="status">{status}</p>}
    </section>
  );
}
export function RewardOffers({
  s,
  act,
  videoAvailable = false,
  videoBusy = false,
  kinds = ["gems", "creditDrop"],
}: {
  s: GameState;
  act: Action;
  videoAvailable?: boolean;
  videoBusy?: boolean;
  kinds?: RewardKind[];
}) {
  const de = s.settings.language === "de",
    available = videoAvailable || adFree(s);
  return (
    <section
      className="commerce-rewards"
      aria-label={de ? "Freiwillige Belohnungen" : "Optional rewards"}
    >
      {kinds.map((kind) => {
        const q = rewardQuote(s, kind);
        return (
          <article
            className={`market-card commerce-reward reward-${kind}`}
            key={kind}
          >
            {kind === "gems" ? <ShopIcon name="gem" /> : <DroneArt />}
            <div>
              <h3>
                {kind === "gems"
                  ? de
                    ? "Gems verdienen"
                    : "Earn gems"
                  : de
                    ? "Versorgungsdrohne"
                    : "Supply drone"}
              </h3>
              <p>
                {kind === "gems"
                  ? `+${BALANCE.commerce.rewardGems} Gems`
                  : `${de ? "5 Minuten Credit-Produktion" : "5 minutes of credit production"} · ${q.amount.toScientificString(2)}`}
              </p>
              <small>
                {q.remaining}/{BALANCE.adLimits[kind]}{" "}
                {de ? "heute übrig" : "remaining today"}
                {q.cooldown > 0
                  ? ` · ${Math.ceil(q.cooldown / 60000)} min`
                  : ""}
              </small>
              <button
                disabled={!available || videoBusy || !q.allowed}
                onClick={() => act("commerce-video", kind)}
              >
                {videoBusy
                  ? de
                    ? "Bitte warten…"
                    : "Please wait…"
                  : adFree(s)
                    ? de
                      ? "Belohnung abholen"
                      : "Claim reward"
                    : de
                      ? "▶ Video ansehen"
                      : "▶ Watch video"}
              </button>
              {!available && (
                <small>
                  {de
                    ? "Videos derzeit nicht verfügbar"
                    : "Videos currently unavailable"}
                </small>
              )}
            </div>
          </article>
        );
      })}
    </section>
  );
}
export function LabSkipControls({
  s,
  act,
  index,
  videoAvailable = false,
  videoBusy = false,
}: {
  s: GameState;
  act: Action;
  index: number;
  videoAvailable?: boolean;
  videoBusy?: boolean;
}) {
  const [confirm, setConfirm] = useState<ReturnType<
      typeof researchSkipQuote
    > | null>(null),
    de = s.settings.language === "de",
    q = researchSkipQuote(s, index),
    ad = rewardQuote(s, "research", index),
    stale = !!confirm && (confirm.job !== q.job || confirm.cost !== q.cost),
    available = videoAvailable || adFree(s);
  return (
    <div className="commerce-lab-actions">
      <button
        disabled={!q.allowed || s.gems < q.cost || videoBusy}
        onClick={() => setConfirm(q)}
      >
        {de ? "Sofort abschließen" : "Finish now"} ·{" "}
        <GemAmount value={q.cost} />
      </button>
      <button
        disabled={!available || !ad.allowed || videoBusy}
        onClick={() => act("commerce-video", "research", index, q.job)}
      >
        {adFree(s)
          ? de
            ? "Zeitbonus abholen"
            : "Claim time bonus"
          : de
            ? "▶ Video"
            : "▶ Video"}{" "}
        · −{Math.ceil(ad.amount.toNumber() / 60)} min
      </button>
      <small>
        {ad.remaining}/{BALANCE.adLimits.research}{" "}
        {de ? "Laborvideos heute" : "lab videos today"}
        {!available
          ? ` · ${de ? "Videos nicht verfügbar" : "Videos unavailable"}`
          : ""}
      </small>
      {confirm && (
        <MobileDetailSheet
          title={de ? "Forschung abschließen" : "Finish research"}
          art={<ShopIcon name="lab" />}
          closeLabel={de ? "Schließen" : "Close"}
          onClose={() => setConfirm(null)}
          action={
            <button
              disabled={stale || !q.allowed || s.gems < q.cost || videoBusy}
              onClick={() => {
                act("research-gem-skip", index, confirm.job, confirm.cost);
                setConfirm(null);
              }}
            >
              {de ? "Bestätigen" : "Confirm"} ·{" "}
              <GemAmount value={confirm.cost} />
            </button>
          }
        >
          <p>
            {de
              ? "Nur dieser laufende Auftrag wird abgeschlossen."
              : "Only this active project will be completed."}
          </p>
          <p>
            {Math.ceil(confirm.seconds / 60)} min ·{" "}
            {de ? "Gems danach" : "Gems after"}: {s.gems - confirm.cost}
          </p>
          {stale && (
            <p role="status">
              {de
                ? "Auftrag oder Preis geändert. Bitte neu auswählen."
                : "Project or price changed. Please select again."}
            </p>
          )}
        </MobileDetailSheet>
      )}
    </div>
  );
}
export function CommerceNotice({ s }: { s: GameState }) {
  const c = commerceState(s),
    seen = useRef(c.last?.id),
    [notice, setNotice] =
      useState<ReturnType<typeof commerceState>["last"]>(null),
    de = s.settings.language === "de";
  useEffect(() => {
    if (c.last?.id === seen.current) return;
    seen.current = c.last?.id;
    if (c.last) setNotice(c.last);
  }, [c.last?.id]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(timer);
  }, [notice?.id]);
  return notice ? (
    <aside className="market-purchase-toast commerce-notice" role="status">
      <ShopIcon name={notice.kind === "research" ? "lab" : "gem"} />
      <div>
        <b>{de ? "Erhalten" : "Received"}</b>
        <p>
          {notice.kind === "gems"
            ? `+${notice.amount} Gems`
            : notice.kind === "creditDrop"
              ? `+${notice.amount} Credits`
              : notice.kind === "research"
                ? de
                  ? "Forschung beschleunigt"
                  : "Research accelerated"
                : notice.kind === "income"
                  ? "2× Income"
                  : notice.kind === "adfree"
                    ? de
                      ? "Werbefrei aktiviert"
                      : "Ad-free activated"
                    : notice.kind === "starter"
                      ? de
                        ? "Starterpaket erhalten"
                        : "Starter pack received"
                      : de
                        ? "Paket erhalten"
                        : "Pack received"}
        </p>
      </div>
      <button
        onClick={() => setNotice(null)}
        aria-label={de ? "Schließen" : "Close"}
      >
        ×
      </button>
    </aside>
  ) : null;
}

export function DroneArt() {
  return (
    <svg className="commerce-drone-art" viewBox="0 0 80 64" aria-hidden="true">
      <path d="M10 12h16v5H10zM54 12h16v5H54z" fill="#5cdbff" />
      <path
        d="M17 16v14l17 8m29-22v14l-17 8"
        fill="none"
        stroke="#678caa"
        strokeWidth="5"
      />
      <path
        d="m26 27 8-8h12l8 8v20l-8 8H34l-8-8Z"
        fill="#203e5c"
        stroke="#83d8f5"
        strokeWidth="2"
      />
      <path d="M31 30h18v12H31z" fill="#101c33" />
      <path d="M35 34h4v4h-4m7-4h4v4h-4" fill="#78f5bc" />
      <path d="M32 48h16v4H32z" fill="#fbc269" />
      <path
        d="m8 21 8 6 8-6m32 0 8 6 8-6"
        fill="none"
        stroke="#5cdbff"
        strokeWidth="2"
      />
    </svg>
  );
}
