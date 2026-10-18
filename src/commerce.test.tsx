import { craftingRecipe } from "./craftingRecipes";
import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import {
  BALANCE,
  newGame,
  creditRateScientific,
  tapCreditsScientific,
  exactEconomyValue,
  addCreditsScientific,
  itemTypes,
  type GameState,
} from "./economy";
import {
  beginCommerceReward,
  completeCommerceReward,
  cancelCommerceReward,
  rewardQuote,
  commerceState,
  fulfillVerifiedPurchase,
  researchSkipQuote,
  buyResearchSkip,
  adFree,
  type ProductId,
  type VerifiedPurchase,
} from "./commerce";
import { prepareProgressionWork } from "./progressionWork";
import { ScientificNumber as S } from "./scientificNumber";
import { serialize, restore, SAVE_VERSION } from "./storage";
import { buyGemOffer, gemOfferQuote } from "./gemShop";
import { advance, settleResearchCompletions } from "./simulation";
import { prestige, axiomReset } from "./prestige";
import { NativeOffers, RewardOffers, LabSkipControls } from "./CommerceOffers";
import {
  verifyStoreResults,
  persistAndFinishPurchases,
  unavailableShopNativeAdapter,
  unavailablePurchaseVerifier,
  type NativePurchaseResult,
} from "./shopNative";
const active = (id: ProductId, tx: string = id): VerifiedPurchase => ({
  productId: id,
  transactionId: tx,
  originalTransactionId: tx,
  status: "active",
});
const reload = (s: GameState) => {
  const r = restore(serialize(s), s.savedAt);
  expect(r.error).toBeUndefined();
  return r.state;
};
const producing = () => {
  const s = newGame(100000, "commerce-test");
  return {
    ...s,
    hardware: 10,
    hardwareCounts: { ...s.hardwareCounts, calculator: 10 },
  };
};
function laboratory(seconds = 1800) {
  const s = newGame(100000, "commerce-test");
  return prepareProgressionWork({
    ...s,
    gems: 10000,
    researchLabs: [
      {
        id: "dataGeneration",
        level: 1,
        jobId: "lab-job",
        durationSeconds: seconds,
        dataCost: 0,
        startedAt: s.savedAt,
        endsAt: s.savedAt + seconds * 1000,
      },
      null,
      null,
      null,
    ],
  });
}
const reward = (
  s: GameState,
  kind: "gems" | "creditDrop" | "research",
  id = "video",
) => completeCommerceReward(beginCommerceReward(s, kind, id), id, "success");
describe("store grants and permanent rights", () => {
  it("grants starter contents once, with usable item families and no automatic equip", () => {
    const s = newGame(0),
      n = fulfillVerifiedPurchase(s, active("ai_singularity.bundle.starter"));
    expect(n.gems - s.gems).toBe(300);
    expect(n.componentInventory.circuits - s.componentInventory.circuits).toBe(
      120,
    );
    expect(n.inventory).toHaveLength(3);
    expect(new Set(n.inventory.map((i) => itemTypes[i.type].slot)).size).toBe(
      3,
    );
    expect(n.inventory.every((i) => i.rarity === "rare" && i.level === 1)).toBe(
      true,
    );
    expect(n.equipped).toEqual(s.equipped);
    expect(
      fulfillVerifiedPurchase(
        reload(n),
        active("ai_singularity.bundle.starter", "different-transaction"),
      ),
    ).toEqual(reload(n));
  });
  it("deduplicates consumables across reloads but allows a distinct confirmed purchase", () => {
    const s = newGame(0),
      p = active("ai_singularity.gems.100"),
      n = reload(fulfillVerifiedPurchase(s, p));
    expect(fulfillVerifiedPurchase(n, p)).toBe(n);
    expect(
      fulfillVerifiedPurchase(n, { ...p, transactionId: "tx2" }).gems,
    ).toBe(s.gems + 200);
    expect(fulfillVerifiedPurchase(s, p, true)).toBe(s);
  });
  it("restores and revokes permanent rights without paying gems or items", () => {
    const s = newGame(0),
      p = active("ai_singularity.pass.adfree"),
      n = fulfillVerifiedPurchase(s, p, true);
    expect(adFree(n)).toBe(true);
    expect(n.gems).toBe(s.gems);
    const revoked = fulfillVerifiedPurchase(n, { ...p, status: "revoked" });
    expect(adFree(revoked)).toBe(false);
    expect(adFree(fulfillVerifiedPurchase(revoked, p, true))).toBe(true);
    expect(fulfillVerifiedPurchase(n, p, true)).toBe(n);
  });
  it("doubles passive, tap, and offline production exactly once, including the minimum tap", () => {
    const s = producing(),
      n = fulfillVerifiedPurchase(s, active("ai_singularity.pass.income"));
    expect(
      creditRateScientific(n.hardware, n.level, n)
        .divide(creditRateScientific(s.hardware, s.level, s))
        .toNumber(),
    ).toBeCloseTo(2);
    expect(
      tapCreditsScientific(n).divide(tapCreditsScientific(s)).toNumber(),
    ).toBeCloseTo(2);
    const zero = newGame(0),
      z = fulfillVerifiedPurchase(zero, active("ai_singularity.pass.income"));
    expect(
      tapCreditsScientific(z).divide(tapCreditsScientific(zero)).toNumber(),
    ).toBe(2);
    const a = advance(s, 60).state,
      b = advance(n, 60).state;
    expect(
      exactEconomyValue(b, "credits")
        .subtract(exactEconomyValue(n, "credits"))
        .divide(
          exactEconomyValue(a, "credits").subtract(
            exactEconomyValue(s, "credits"),
          ),
        )
        .toNumber(),
    ).toBeCloseTo(2);
    expect(
      creditRateScientific(
        n.hardware,
        n.level,
        fulfillVerifiedPurchase(
          n,
          active("ai_singularity.pass.income", "another"),
        ),
      ).toJSON(),
    ).toEqual(creditRateScientific(n.hardware, n.level, n).toJSON());
  });
  it("retains entitlements and consumed reward limits through both reset layers", () => {
    let s = fulfillVerifiedPurchase(
      producing(),
      active("ai_singularity.pass.income"),
    );
    s = reward(s, "gems");
    s = addCreditsScientific(s, S.fromString("1e30"));
    const reset = prestige(s);
    expect(reset.prestigeCount).toBe(s.prestigeCount + 1);
    expect(reset.commerce).toEqual(s.commerce);
    const eligible = {
      ...reset,
      axiomResetCount: 1,
      cycleINTEarned: 1e9,
      exactEconomy: {
        ...reset.exactEconomy,
        cycleINTEarned: S.from(1e9).toJSON(),
      },
    };
    const meta = axiomReset(eligible);
    expect(meta.axiomResetCount).toBe(eligible.axiomResetCount + 1);
    expect(meta.commerce).toEqual(eligible.commerce);
    expect(reload(meta).commerce).toEqual(meta.commerce);
  });
  it("does not partially fulfill overflowing packs", () => {
    const base = newGame(0),
      s = {
        ...base,
        componentInventory: {
          ...base.componentInventory,
          circuits: Number.MAX_SAFE_INTEGER,
        },
        components: Number.MAX_SAFE_INTEGER,
      };
    expect(
      fulfillVerifiedPurchase(s, active("ai_singularity.bundle.starter")),
    ).toBe(s);
    expect(
      fulfillVerifiedPurchase(
        { ...base, gems: Number.MAX_SAFE_INTEGER },
        active("ai_singularity.gems.100"),
      ).commerce?.transactions,
    ).toEqual([]);
  });
  it("blocks store and reward grants in challenges", () => {
    const s = {
      ...producing(),
      retention: {
        ...producing().retention,
        activeRun: { id: "no-items" } as never,
      },
    };
    expect(
      fulfillVerifiedPurchase(s, active("ai_singularity.pass.income")),
    ).toBe(s);
    expect(beginCommerceReward(s, "gems", "x")).toBe(s);
    expect(researchSkipQuote(s, 0).allowed).toBe(false);
  });
  it("verifies matching store results only and never fulfills raw or mismatched receipts", async () => {
    const r: NativePurchaseResult = {
      status: "receipt",
      productId: "ai_singularity.gems.100",
      transactionId: "tx",
      signedReceipt: "opaque",
    };
    expect(await verifyStoreResults([r], unavailablePurchaseVerifier)).toEqual(
      [],
    );
    expect(
      await verifyStoreResults([r], {
        available: true,
        verify: async () => active("ai_singularity.gems.550", "tx"),
      }),
    ).toEqual([]);
    expect(
      await verifyStoreResults([r], {
        available: true,
        verify: async () => active("ai_singularity.gems.100", "wrong"),
      }),
    ).toEqual([]);
    expect(
      await verifyStoreResults([{ status: "cancelled" }, r], {
        available: true,
        verify: async () => active("ai_singularity.gems.100", "tx"),
      }),
    ).toHaveLength(1);
    expect(
      await unavailableShopNativeAdapter.purchase("ai_singularity.pass.income"),
    ).toEqual({ status: "unavailable" });
  });
});
describe("durable storefront delivery", () => {
  it("finishes only after persistence succeeds and leaves failed saves retryable", async () => {
    const calls: string[] = [],
      adapter = {
        ...unavailableShopNativeAdapter,
        available: true,
        finish: async (id: string) => {
          calls.push(`finish:${id}`);
        },
      };
    const grants = [active("ai_singularity.gems.100", "store-tx")];
    expect(
      await persistAndFinishPurchases(adapter, grants, async () => {
        calls.push("failed-save");
        return false;
      }),
    ).toBe(false);
    expect(calls).toEqual(["failed-save"]);
    calls.length = 0;
    expect(
      await persistAndFinishPurchases(adapter, grants, async () => {
        calls.push("durable-save");
        return true;
      }),
    ).toBe(true);
    expect(calls).toEqual(["durable-save", "finish:store-tx"]);
  });
  it("permits a safe finish retry after storefront failure without paying twice", async () => {
    const grant = active("ai_singularity.gems.100", "retry");
    let state = newGame(0),
      calls = 0;
    const persist = async () => {
        state = reload(fulfillVerifiedPurchase(state, grant));
        return true;
      },
      adapter = {
        ...unavailableShopNativeAdapter,
        available: true,
        finish: async () => {
          if (calls++ === 0) throw Error("network");
        },
      };
    await expect(
      persistAndFinishPurchases(adapter, [grant], persist),
    ).rejects.toThrow("network");
    await persistAndFinishPurchases(adapter, [grant], persist);
    expect(state.gems).toBe(newGame(0).gems + 100);
    expect(calls).toBe(2);
  });
});
describe("optional rewarded offers", () => {
  it("books gems and a gem-ledger entry only after a successful matching saved ticket", () => {
    const s = newGame(0),
      pending = reload(beginCommerceReward(s, "gems", "reward"));
    expect(completeCommerceReward(pending, "other", "success")).toBe(pending);
    const n = completeCommerceReward(pending, "reward", "success");
    expect(n.gems).toBe(s.gems + BALANCE.commerce.rewardGems);
    expect(n.gemLedger.at(-1)).toMatchObject({
      id: "reward",
      source: "rewarded-gems",
      amount: 10,
    });
    expect(completeCommerceReward(reload(n), "reward", "success")).toEqual(
      reload(n),
    );
  });
  it.each(["cancel", "error"] as const)(
    "%s clears the ticket without consuming a daily reward",
    (result) => {
      const s = newGame(0),
        n = completeCommerceReward(
          beginCommerceReward(s, "gems", "x"),
          "x",
          result,
        );
      expect(n.gems).toBe(s.gems);
      expect(n.commerce?.pending).toBeNull();
      expect(rewardQuote(n, "gems").remaining).toBe(5);
    },
  );
  it("rejects overlapping, replayed, expired, and reset-context tickets", () => {
    const s = newGame(0),
      p = beginCommerceReward(s, "gems", "x");
    expect(beginCommerceReward(p, "gems", "y")).toBe(p);
    expect(cancelCommerceReward(p, "different")).toBe(p);
    for (const changed of [
      { ...p, savedAt: p.commerce!.pending!.expiresAt + 1 },
      { ...p, prestigeCount: 1 },
      { ...p, axiomResetCount: 1 },
      { ...p, telemetry: { ...p.telemetry, campaignId: "other" } },
    ]) {
      const n = completeCommerceReward(changed, "x", "success");
      expect(n.gems).toBe(s.gems);
      expect(n.commerce?.pending).toBeNull();
    }
    const n = reward(s, "gems", "replay");
    expect(beginCommerceReward(n, "gems", "replay")).toBe(n);
  });
  it("enforces daily limits, prevents clock rollback replenishment, and retains limits with ad-free", () => {
    let s = fulfillVerifiedPurchase(
      newGame(0),
      active("ai_singularity.pass.adfree"),
    );
    for (let i = 0; i < BALANCE.adLimits.gems; i++) {
      s = reward({...s,savedAt:i*BALANCE.commerce.gemVideoCooldownMs}, "gems", `tx${i}`);
      expect(s.commerce!.counts.gems).toBe(i+1);
    }
    expect(s.gems).toBe(newGame(0).gems+50);
    expect(rewardQuote(s, "gems").allowed).toBe(false);
    const tomorrow = { ...s, savedAt: BALANCE.shop.cycleMs };
    expect(rewardQuote(tomorrow, "gems").remaining).toBe(5);
    const next = reward(tomorrow, "gems", "next");
    expect(rewardQuote({ ...next, savedAt: 0 }, "gems").remaining).toBe(4);
    expect(adFree(next)).toBe(true);
  });
  it("snapshots five minutes of baseline production and never increases eligible INT income", () => {
    const s = producing(),
      q = rewardQuote(s, "creditDrop"),
      p = beginCommerceReward(s, "creditDrop", "drone"),
      changed = {
        ...p,
        hardware: 100,
        hardwareCounts: { ...p.hardwareCounts, calculator: 100 },
      },
      n = completeCommerceReward(changed, "drone", "success");
    expect(
      exactEconomyValue(n, "credits")
        .subtract(exactEconomyValue(s, "credits"))
        .toJSON(),
    ).toEqual(q.amount.toJSON());
    expect(exactEconomyValue(n, "lifetimeEligibleCredits")).toEqual(
      exactEconomyValue(s, "lifetimeEligibleCredits"),
    );
    expect(n.progression.entitlement).toEqual(s.progression.entitlement);
    expect(rewardQuote(n, "creditDrop").cooldown).toBe(
      BALANCE.commerce.droneCooldownMs,
    );
    expect(
      rewardQuote(
        { ...n, savedAt: n.savedAt + BALANCE.commerce.droneCooldownMs },
        "creditDrop",
      ).allowed,
    ).toBe(true);
  });
  it("supports drone rewards above native floating point range", () => {
    const base = producing(),
      s = {
        ...base,
        researchLevels: { ...base.researchLevels, commercialization: 10000 },
      },
      q = rewardQuote(s, "creditDrop");
    expect(q.amount.exponent).toBeGreaterThan(308);
    const n = reload(reward(s, "creditDrop"));
    expect(
      exactEconomyValue(n, "credits").compare(exactEconomyValue(s, "credits")),
    ).toBe(1);
    expect(
      exactEconomyValue(n, "credits")
        .subtract(exactEconomyValue(s, "credits"))
        .toJSON(),
    ).toEqual(q.amount.toJSON());
  });
});
describe("lab skips use actual work, paid and rewarded", () => {
  it("buys a quote atomically, completes once, and leaves the other lab untouched", () => {
    let s = laboratory();
    s = prepareProgressionWork({
      ...s,
      researchLabs: [
        s.researchLabs[0],
        { ...s.researchLabs[0]!, id: "modelArchitecture", jobId: "other" },
        null,
        null,
      ],
    });
    const q = researchSkipQuote(s, 0),
      n = buyResearchSkip(s, 0, q.job!, q.cost);
    expect(q.cost).toBe(60);
    expect(n.gems).toBe(s.gems - q.cost);
    expect(n.researchLevels.dataGeneration).toBe(1);
    expect(n.researchLabs[0]).toBeNull();
    expect(n.researchLabs[1]).toEqual(s.researchLabs[1]);
    expect(buyResearchSkip(n, 0, q.job!, q.cost)).toBe(n);
    expect(settleResearchCompletions(n).lifetime.researchCompleted).toBe(
      n.lifetime.researchCompleted,
    );
    expect(reload(n).researchLevels.dataGeneration).toBe(1);
  });
  it("preserves ad work after preparation, save/reload, and normal elapsed time", () => {
    const s = laboratory(),
      n = reward(s, "research");
    expect(n.progression.work["lab-job"].done).toBe(600);
    expect(
      researchSkipQuote(prepareProgressionWork(reload(n)), 0).seconds,
    ).toBe(1200);
    const elapsed = advance(n, 30).state;
    expect(researchSkipQuote(elapsed, 0).seconds).toBeCloseTo(1170);
    expect(n.gems).toBe(s.gems);
  });
  it("caps rewarded work to the selected short job without overflowing to a successor", () => {
    const s = laboratory(90),
      n = reward(s, "research");
    expect(n.researchLabs[0]).toBeNull();
    expect(n.researchLevels.dataGeneration).toBe(1);
    expect(n.lifetime.researchCompleted).toBe(s.lifetime.researchCompleted + 1);
    expect(rewardQuote(n, "research").allowed).toBe(false);
  });
  it("rejects stale/insufficient gem quotes and callbacks for an already completed target", () => {
    const s = laboratory(),
      q = researchSkipQuote(s, 0);
    expect(buyResearchSkip(s, 0, "wrong", q.cost)).toBe(s);
    expect(buyResearchSkip(s, 0, q.job!, q.cost + 1)).toBe(s);
    const poor = { ...s, gems: 0 };
    expect(buyResearchSkip(poor, 0, q.job!, q.cost)).toBe(poor);
    const p = beginCommerceReward(s, "research", "video"),
      finished = buyResearchSkip(p, 0, q.job!, q.cost),
      n = completeCommerceReward(finished, "video", "success");
    expect(n.commerce?.counts.research ?? 0).toBe(0);
    expect(n.researchLevels.dataGeneration).toBe(1);
  });
  it("uses boosted speed once and charges based on actual time left", () => {
    const s = prepareProgressionWork({ ...laboratory(), labBoostUntil: 1e9 }),
      q = researchSkipQuote(s, 0);
    expect(q.seconds).toBe(900);
    expect(q.cost).toBe(30);
    const n = reward(s, "research");
    expect(n.progression.work["lab-job"].done).toBe(1200);
    expect(researchSkipQuote(n, 0).seconds).toBe(300);
  });
});
describe("existing time offers on current progression", () => {
  const factory = () => {
    const s = newGame(0),
      recipe = craftingRecipe(
        "item",
        "insight-archive",
        2,
        false,
        0,
        false,
        true,
      )!;
    return prepareProgressionWork({
      ...s,
      gems: 1000,
      crafting: {
        active: {
          ...recipe,
          progressionVersion: 2,
          id: "paid-craft",
          kind: "item",
          recipeId: "insight-archive",
          completed: 0,
          startedAt: 0,
          endsAt: recipe.durationPerUnit * 1000,
        },
        queue: [],
      },
    } as GameState);
  };
  it("keeps a partial crafting skip after reload and preparation", () => {
    const s = factory(),
      n = buyGemOffer(s, "craft-30m");
    expect(n.gems).toBe(s.gems - 20);
    expect(n.progression.work["paid-craft"].done).toBe(1800);
    expect(prepareProgressionWork(reload(n)).crafting.active!.endsAt).toBe(
      1800000,
    );
  });
  it("never carries a completed unit into the next paid crafting unit", () => {
    const s = factory(),
      n = buyGemOffer(s, "craft-4h"),
      prepared = prepareProgressionWork(n);
    expect(n.inventory).toHaveLength(s.inventory.length + 1);
    expect(n.crafting.active?.completed).toBe(1);
    expect(prepared.progression.work["paid-craft"].done).toBe(0);
    expect(advance(prepared, 1).state.inventory).toHaveLength(
      n.inventory.length,
    );
  });
  it("applies a purchased training skip to integration and completes only once", () => {
    const s = {
        ...producing(),
        gems: 1000,
        activeTraining: {
          track: "integration" as const,
          workRequired: 10,
          creditCost: 0,
          dataCost: 0,
          startedAt: 100000,
        },
      },
      n = buyGemOffer(s, "training-15m");
    expect(n.integrationLevel).toBe(s.integrationLevel + 1);
    expect(n.activeTraining).toBeNull();
    expect(buyGemOffer(n, "training-15m")).toBe(n);
  });
  it("recognizes the current prestige lab node and rejects unknown offers", () => {
    const s = newGame(0),
      ready = {
        ...s,
        gems: 1000,
        progression: { ...s.progression, licenses: ["F01"] },
      };
    expect(gemOfferQuote(ready, "lab-slot-1").enabled).toBe(true);
    expect(buyGemOffer(ready, "lab-slot-1").purchasedResearchLabs).toBe(1);
    expect(buyGemOffer(ready, "fake" as never)).toBe(ready);
  });
  it("accepts fractional simulation timestamps for saved ad tickets", () => {
    const s = { ...newGame(0), savedAt: 1000.123 };
    const p = reload(beginCommerceReward(s, "gems", "fraction"));
    expect(p.commerce?.pending?.expiresAt).toBe(
      s.savedAt + BALANCE.commerce.ticketMs,
    );
  });
});
describe("expanded paid labs", () => {
  it("saves and skips a retained sixth lab without applying the obsolete four-lab limit", () => {
    const base = laboratory(),
      s = {
        ...base,
        purchasedResearchLabs: 2,
        researchLabs: [null, null, null, null, null, base.researchLabs[0]],
      },
      loaded = reload(s),
      q = researchSkipQuote(loaded, 5),
      done = buyResearchSkip(loaded, 5, q.job!, q.cost);
    expect(done.researchLevels.dataGeneration).toBe(1);
    expect(reload(done).researchLabs).toHaveLength(6);
  });
  it("does not reserve a video for a successor when the displayed research job changed", () => {
    const s = laboratory();
    expect(beginCommerceReward(s, "research", "stale", 0, "old-job")).toBe(s);
  });
});
describe("save and UI release boundaries", () => {
  it("migrates v60 without resetting prestige, inventories, or currency", () => {
    const s = laboratory(),
      raw = JSON.parse(serialize(s));
    raw.version = 60;
    delete raw.state.commerce;
    const r = restore(JSON.stringify(raw), 0);
    expect(r.error).toBeUndefined();
    expect(r.migrated).toBe(true);
    expect(r.state.progression).toEqual(s.progression);
    expect(r.state.researchLabs).toEqual(s.researchLabs);
    expect(r.state.gems).toBe(s.gems);
    expect(r.state.commerce).toEqual(newGame(0).commerce);
    expect(JSON.parse(serialize(r.state)).version).toBe(SAVE_VERSION);
  });
  it.each([
    undefined,
    null,
    { owned: [] },
    { ...commerceState(newGame(0)), owned: ["unknown"] },
    { ...commerceState(newGame(0)), counts: { gems: 999 } },
  ])(
    "rejects damaged current commerce without resetting purchase rights",
    (commerce) => {
      const s = { ...newGame(0), commerce },
        r = restore(JSON.stringify({ version: SAVE_VERSION, state: s }), 0);
      expect(r.error).toBeTruthy();
    },
  );
  it("renders explicit content and unavailable purchases, ads, and restore with no fake prices", () => {
    const s = newGame(0),
      html = renderToStaticMarkup(
        <NativeOffers
          s={s}
          act={() => {
            throw Error("render mutation");
          }}
        />,
      );
    expect(html).toContain("Werbefrei-Pass");
    expect(html).toContain("Dauerhaft 2× Einkommen");
    expect(html).toContain("3 garantierte Rare-Items");
    expect(html).toContain("wiederherstellen");
    expect(html).not.toContain("€");
    expect(html).not.toContain("undefined");
    expect(html.match(/disabled=""/g)?.length).toBe(
      BALANCE.commerce.products.filter(p=>p.kind!=="season"||p.id.endsWith(s.season.id.split("-")[1])).length + 1,
    );
    const ad = renderToStaticMarkup(<RewardOffers s={s} act={() => {}} />);
    expect(ad).toContain("Videos derzeit nicht verfügbar");
    expect(ad).toContain("Versorgungsdrohne");
    const lab = renderToStaticMarkup(
      <LabSkipControls s={laboratory()} index={0} act={() => {}} />,
    );
    expect(lab).toContain("Sofort abschließen");
    expect(lab).toContain("Laborvideos heute");
  });
});
