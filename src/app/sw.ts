import { defaultCache } from '@serwist/next/worker';
import { installSerwist, type InstallSerwistOptions } from '@serwist/sw';

declare const self: typeof globalThis & {
  __SW_MANIFEST: InstallSerwistOptions['precacheEntries'];
};

installSerwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});
