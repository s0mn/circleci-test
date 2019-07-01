import server from 'atom-serverless';
import { reactor, activePublish, cache, simulate } from './src/controllers';

export function reactorLauncher(...args) { return server(reactor, ...args); }
export function getActivePublish(...args) { return server(activePublish, ...args); }
export function deleteCache(...args) { return server(cache, ...args); }
export function simulateLauncher(...args) { return server(simulate, ...args); }
