import {useEffect,useRef,useState} from 'react';
import {nameErrorCopy,PLAYER_NAME_MAX_LENGTH,validatePlayerName} from './namePolicy';
import {t,type Language} from './i18n';

export function PlayerNameField({name,language,onChange}:{name:string;language:Language;onChange:(name:string)=>void}){
 const [draft,setDraft]=useState(name),[error,setError]=useState(''),input=useRef<HTMLInputElement>(null);
 useEffect(()=>{if(document.activeElement!==input.current){setDraft(name);setError('')}},[name]);
 const change=(value:string,normalize=false)=>{setDraft(value);const result=validatePlayerName(value);setError(result.ok?'':nameErrorCopy(language,result.error));if(result.ok&&normalize){setDraft(result.name);onChange(result.name)}};
 return <label className="player-name-field"><span>{t(language,'playerName')}</span><input ref={input} aria-label={t(language,'playerName')} value={draft} maxLength={PLAYER_NAME_MAX_LENGTH} aria-invalid={!!error} aria-describedby={error?'player-name-error':undefined} autoComplete="off" onChange={e=>change(e.currentTarget.value)} onBlur={()=>change(draft,true)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();change(draft,true)}if(e.key==='Escape'){setDraft(name);setError('')}}}/>{error&&<small id="player-name-error" className="field-error" role="alert">{error}</small>}</label>;
}
