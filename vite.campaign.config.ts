import {defineConfig} from 'vitest/config';
import react from '@vitejs/plugin-react';
export default defineConfig({plugins:[react()],test:{environment:'node',maxWorkers:1,testTimeout:120000,include:['src/longTermSimulation.test.ts','src/layerOneSimulation.test.ts','src/layerThreeSimulation.test.ts','src/balanceCampaigns.test.ts']}});
