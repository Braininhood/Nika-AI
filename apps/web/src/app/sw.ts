/// <reference lib="webworker" />

import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { NetworkOnly, Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

/** RSC flight data must not be cached — stale payloads break App Router client navigations. */
const runtimeCaching = [
  {
    matcher: ({ request, sameOrigin }: { request: Request; sameOrigin: boolean }) =>
      sameOrigin &&
      (request.headers.get("RSC") === "1" ||
        request.headers.get("Next-Router-Prefetch") === "1" ||
        request.headers.get("Next-Router-State-Tree") !== null),
    handler: new NetworkOnly(),
  },
  ...defaultCache,
];

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching,
});

serwist.addEventListeners();

self.addEventListener("sync", (event) => {
  if (event.tag === "oet-coach-sync") {
    event.waitUntil(
      self.clients.matchAll({ type: "window" }).then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: "PROCESS_OUTBOX" });
        });
      }),
    );
  }
});
