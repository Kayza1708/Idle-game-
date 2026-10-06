import { researchAreas, researchAreaOrder } from "./researchAreas";
const copy = {
  initial: [
    "Anfangsbereich",
    "Starting research",
    "Data, Modellarchitektur und frühe Herstellung.",
    "Data, model architecture and early crafting.",
  ],
  data: [
    "Datenwissenschaft",
    "Data science",
    "Vorhandene Forschung für synthetische Daten und den Data Flywheel.",
    "Existing synthetic Data and Data Flywheel research.",
  ],
  architecture: [
    "Modell-/Systemarchitektur",
    "Model / system architecture",
    "Vorhandene Compute-, Kapazitäts-, Umsatz- und Modellforschung.",
    "Existing compute, capacity, revenue and model research.",
  ],
  materials: [
    "Material-/Bauplanforschung",
    "Material / blueprint research",
    "Vorhandene Material-, Bauplan- und Signalprotokollforschung.",
    "Existing material, blueprint and drop-protocol research.",
  ],
  automation: [
    "Laborautomation",
    "Lab automation",
    "Vorhandene Laborautomation und autonome Wissenschaft.",
    "Existing lab automation and autonomous science.",
  ],
} as const;
export const researchAreaText = (
  area: keyof typeof researchAreas,
  language: string,
) => {
  const de = language === "de";
  return { name: copy[area][de ? 0 : 1], benefit: copy[area][de ? 2 : 3] };
};
export function researchUnlockText(node: string, language: string) {
  const area = researchAreaOrder.find(
    (area) => researchAreas[area].node === node,
  );
  return area
    ? `${language === "de" ? "Dauerhafter Forschungszugang" : "Permanent research access"}: ${researchAreaText(area, language).name}.`
    : "";
}
