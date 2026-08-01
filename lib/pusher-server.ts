import Pusher from "pusher";

// Server-only Pusher instance. Used inside API routes to broadcast
// a "new-tip" event to the correct creator's alert-box channel.
export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID as string,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY as string,
  secret: process.env.PUSHER_SECRET as string,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER as string,
  useTLS: true,
});

// Re-exported so existing server-side imports of `alertChannelName` /
// `NEW_TIP_EVENT` from this file keep working.
export { alertChannelName, NEW_TIP_EVENT } from "./pusher-shared";
