using System;
using System.IO;
using System.Security.Cryptography;
using System.Text;
using IdleIntelligence.Core;
using IdleIntelligence.Runtime;
using NUnit.Framework;
namespace IdleIntelligence.Tests
{
  public sealed class GumballVoucherTests
  {
    [Test] public void OneTicketGivesExactlyOneAdditionalGumballDrawWithoutGemDebit()
    {
      var state=Game.New(1000);
      state.Prestige.resets=1;
      state.Rewards.vouchersEarned=1;
      var gems=state.Retention.gems;
      var next=Capsules.DrawVoucher(state,1,()=>.95);
      Assert.That(next,Is.Not.SameAs(state));
      Assert.That(next.Capsules.last.payment,Is.EqualTo("voucher"));
      Assert.That(next.Rewards.vouchersEarned,Is.EqualTo(1));
      Assert.That(next.Rewards.vouchersSpent,Is.EqualTo(1));
      Assert.That(VoucherRules.Available(next),Is.Zero);
      Assert.That(next.Retention.gems,Is.GreaterThanOrEqualTo(gems));
      Assert.That(Capsules.DrawVoucher(next,1),Is.SameAs(next));
      Game.Validate(next);
    }
    [Test] public void LockedGumballMachineCannotConsumeTicket()
    {
      var state=Game.New(1000);
      state.Rewards.vouchersEarned=1;
      Assert.That(Capsules.DrawVoucher(state,1),Is.SameAs(state));
      Assert.That(VoucherRules.Available(state),Is.EqualTo(1));
    }
    [Test] public void SeasonGrantsSparseTicketsOnlyOnEligibleLevels()
    {
      var state=Game.New(1000);
      Assert.That(VoucherRules.SeasonAward(30,0),Is.EqualTo(1));
      Assert.That(VoucherRules.SeasonAward(40,1),Is.EqualTo(1));
      Assert.That(VoucherRules.SeasonAward(15,0),Is.Zero);
      Assert.That(VoucherRules.ChestChance("common"),Is.EqualTo(.05).Within(1e-12));
      Assert.That(VoucherRules.ChestChance("legendary"),Is.EqualTo(.30).Within(1e-12));
      Assert.That(VoucherRules.CanEarn(state),Is.True);
      state.Rewards.vouchersEarned=VoucherBalance.MaxOwned;
      Assert.That(VoucherRules.CanEarn(state),Is.False);
      Game.Validate(state);
    }
    [Test] public void GumballTicketWalletAndReceiptSurviveSaveCodec()
    {
      var state=Game.New(1000);
      state.Prestige.resets=1;
      state.Rewards.vouchersEarned=2;
      var next=Capsules.DrawVoucher(state,1,()=>.95);
      var encoded=new UnitySaveCodec().Encode(StateData.From(next));
      var restored=new UnitySaveCodec().Decode(encoded).ToState();
      Assert.That(VoucherRules.Available(restored),Is.EqualTo(1));
      Assert.That(restored.Capsules.last.payment,Is.EqualTo("voucher"));
      Game.Validate(restored);
    }
    [Test] public void VoucherWalletRejectsForgedNegativeOrOverflowedAmounts()
    {
      var state=Game.New(1000);
      state.Rewards.vouchersEarned=0;
      state.Rewards.vouchersSpent=1;
      Assert.Throws<FormatException>(()=>Game.Validate(state));
      state.Rewards.vouchersEarned=VoucherBalance.MaxOwned+1;
      state.Rewards.vouchersSpent=0;
      Assert.Throws<FormatException>(()=>Game.Validate(state));
    }
  }
}
