/**
 * Channel and event naming shared between the server (lib/pusher-server.ts,
 * used inside API routes) and the client (app/alert-box/page.tsx). Keeping
 * these here avoids the client ever importing the server Pusher SDK, which
 * instantiates itself with server-only secrets and Node built-ins.
 */

/** Channel naming convention: one public channel per creator username. */
export function alertChannelName(username: string) {
  return `alerts-${username.toLowerCase()}`;
}

export const NEW_TIP_EVENT = "new-tip";
