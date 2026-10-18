import type {Language} from './i18n';
import {AI_NAME_MAX_LENGTH,NAME_MIN_LENGTH,validateName,type NameError,type NameValidation} from './namePolicy';
export {AI_NAME_MAX_LENGTH};
export const AI_NAME_MIN_LENGTH=NAME_MIN_LENGTH;
export type AiNameError=NameError;
export type {NameValidation};
export const validateAiName=(input:string):NameValidation=>validateName(input,AI_NAME_MAX_LENGTH);
export const aiNameCopy=(language:Language)=>{const de=language==='de';return{eyebrow:de?'LOKALES KI-PROFIL':'LOCAL AI PROFILE',title:de?'Wie soll deine KI heißen?':'What should your AI be called?',privacy:de?'Der Name bleibt nur in deinem Spielstand auf diesem Gerät.':'The name remains only in your save on this device.',label:de?'Name':'Name',hint:de?'2–20 Zeichen: Buchstaben, Zahlen, Leerzeichen, - und _':'2–20 characters: letters, numbers, spaces, - and _',submit:de?'Mit diesem Namen starten':'Start with this name',errors:{length:de?'Bitte wähle einen Namen mit 2 bis 20 Zeichen.':'Choose a name between 2 and 20 characters.',characters:de?'Bitte verwende nur Buchstaben, Zahlen, Leerzeichen, - oder _.':'Use only letters, numbers, spaces, - or _.',blocked:de?'Bitte wähle einen anderen Namen.':'Please choose a different name.'} satisfies Record<AiNameError,string>}};
