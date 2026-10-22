import React from 'react';
import {createRoot} from 'react-dom/client';
import {App} from './App';
import {CrashBoundary} from './CrashBoundary';
import {CrashRecorder} from './crashDiagnostics';
import {installMobileIntegration} from './mobileIntegration';
import {browserStorage} from './storage';
import './style.css';
import './mobile-ui.css';
import './pixel-game.css';
import './cohesive-game.css';
import './immersive-game.css';
import './item-presentation.css';
import './shop-market.css';
import './gumball-voucher.css';

const uninstallMobile=installMobileIntegration();
window.addEventListener('pagehide',uninstallMobile,{once:true});
export const crashRecorder=new CrashRecorder(browserStorage(),null);
window.addEventListener('error',event=>crashRecorder.failure('unhandled-exception',event.error??event.message));
window.addEventListener('unhandledrejection',event=>crashRecorder.failure('unhandled-exception',event.reason));
createRoot(document.getElementById('root')!).render(<React.StrictMode><CrashBoundary recorder={crashRecorder}><App recorder={crashRecorder}/></CrashBoundary></React.StrictMode>);

import './menu-settings.css';

import './commerce.css';

import "./instant-mobile.css";

import './equipment.css';
