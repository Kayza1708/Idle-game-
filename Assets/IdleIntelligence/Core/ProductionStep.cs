using System.Collections.Generic;
namespace IdleIntelligence.Core {
 public sealed class ProductionStep {public string Id;public ScientificNumber Before,Factor,After;}
 public static class ProductionObservation {
  public static ScientificNumber MultiplyObserved(this ScientificNumber before,ScientificNumber factor,List<ProductionStep> trace,string id){var after=before.Multiply(factor);if(trace!=null)trace.Add(new ProductionStep{Id=id,Before=before,Factor=factor,After=after});return after;}
  public static ScientificNumber TimesObserved(this ScientificNumber before,double factor,List<ProductionStep> trace,string id){var after=before.Times(factor);if(trace!=null)trace.Add(new ProductionStep{Id=id,Before=before,Factor=ScientificNumber.From(factor),After=after});return after;}
 }
}
