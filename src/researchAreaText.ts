import {isRepeatableResearch,type ResearchId} from './economy';
import {researchText,projectText} from './gameplayI18n';
import { researchAreas, researchAreaOrder, researchNodeAccess } from "./researchAreas";
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
    "Systemarchitektur",
    "System architecture",
    "Vorhandene Compute-, Kapazitäts-, Umsatz- und Modellforschung.",
    "Existing compute, capacity, revenue and model research.",
  ],
  model: ["Modellwissenschaft","Model science","Umsatz, Modelle und Training.","Revenue, models and training."],
  materials: [
    "Materialwissenschaft",
    "Material science",
    "Vorhandene Material-, Bauplan- und Signalprotokollforschung.",
    "Existing material, blueprint and drop-protocol research.",
  ],
  automation: [
    "Labororganisation",
    "Lab organization",
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
  const ids=Object.entries(researchNodeAccess).filter(([,n])=>n===node).map(([id])=>isRepeatableResearch(id as ResearchId)?researchText(id as never,language as never).name:projectText(id as ResearchId as never,language as never).name);
  return ids.length?`${language==='de'?'Dauerhafter Projektzugang':'Permanent project access'}: ${ids.join(', ')}.`:'';
}
