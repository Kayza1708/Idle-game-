import React from 'react';import{createRoot}from'react-dom/client';import{App}from'./App';import{CrashBoundary}from'./CrashBoundary';import{CrashRecorder}from'./crashDiagnostics';import{browserStorage}from'./storage';import'./style.css';
export const crashRecorder=new CrashRecorder(browserStorage(),null);
window.addEventListener('error',event=>crashRecorder.failure('unhandled-exception',event.error??event.message));
window.addEventListener('unhandledrejection',event=>crashRecorder.failure('unhandled-exception',event.reason));
createRoot(document.getElementById('root')!).render(<React.StrictMode><CrashBoundary recorder={crashRecorder}><App recorder={crashRecorder}/></CrashBoundary></React.StrictMode>);
