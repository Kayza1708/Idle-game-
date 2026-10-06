// Keep Vitest's control/RPC event loop responsive during CPU-bound domain runs.
// ViteNode loads the actual TypeScript domain, without a second simulation model.
import { parentPort, workerData } from 'node:worker_threads';
import { resolve } from 'node:path';
import { createServer } from 'vite';
import { ViteNodeServer } from 'vite-node/server';
import { ViteNodeRunner } from 'vite-node/client';

let server;
try {
  server = await createServer({
    root: workerData.root, configFile: false,
    server: { middlewareMode: true, watch: null },
    optimizeDeps: { noDiscovery: true, include: [] },
  });
  const modules = new ViteNodeServer(server);
  const runner = new ViteNodeRunner({
    root: server.config.root, base: server.config.base,
    fetchModule: id => modules.fetchModule(id),
    resolveId: (id, importer) => modules.resolveId(id, importer),
  });
  const { simulateBalance } = await runner.executeFile(resolve(workerData.root, 'src/simulation.ts'));
  parentPort.postMessage({ phase: 'simulation-start' });
  const result = simulateBalance(...workerData.args);
  await server.close();
  server = undefined;
  parentPort.postMessage({ result });
} catch (error) {
  parentPort.postMessage({ error: { message: String(error?.message ?? error), stack: error?.stack } });
} finally {
  await server?.close();
}
