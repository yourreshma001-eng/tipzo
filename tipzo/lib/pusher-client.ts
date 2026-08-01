"use client";

import PusherClient from "pusher-js";

let pusherClientInstance: PusherClient | null = null;

/**
 * Lazily creates a single shared Pusher client instance for the browser.
 * Reused across the alert-box page so we don't open duplicate sockets
 * on re-renders.
 */
export function getPusherClient() {
  if (!pusherClientInstance) {
    pusherClientInstance = new PusherClient(
      process.env.NEXT_PUBLIC_PUSHER_KEY as string,
      {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER as string,
      }
    );
  }
  return pusherClientInstance;
}
