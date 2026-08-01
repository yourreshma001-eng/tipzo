"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import AlertPopup from "@/components/overlay/AlertPopup";
import { getPusherClient } from "@/lib/pusher-client";
import { alertChannelName, NEW_TIP_EVENT } from "@/lib/pusher-shared";
import type { TipAlertPayload } from "@/lib/types";

const DISPLAY_DURATION_MS = 6000;

function AlertBoxInner() {
  const searchParams = useSearchParams();
  // Set this as the OBS Browser Source URL, e.g.
  // https://yourapp.com/alert-box?username=creatorname
  const username = searchParams.get("username") ?? "demo";

  const [queue, setQueue] = useState<TipAlertPayload[]>([]);
  const [current, setCurrent] = useState<TipAlertPayload | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // The root layout sets a dark body background for the tip page.
  // OBS Browser Sources need a fully transparent page, so override it here.
  useEffect(() => {
    const originalBody = document.body.style.background;
    const originalHtml = document.documentElement.style.background;
    document.body.style.background = "transparent";
    document.documentElement.style.background = "transparent";
    return () => {
      document.body.style.background = originalBody;
      document.documentElement.style.background = originalHtml;
    };
  }, []);

  // Subscribe to this creator's alert channel
  useEffect(() => {
    const pusher = getPusherClient();
    const channel = pusher.subscribe(alertChannelName(username));

    channel.bind(NEW_TIP_EVENT, (payload: TipAlertPayload) => {
      setQueue((prev) => [...prev, payload]);
    });

    return () => {
      channel.unbind(NEW_TIP_EVENT);
      pusher.unsubscribe(alertChannelName(username));
    };
  }, [username]);

  // Drain the queue one alert at a time so overlapping tips don't collide
  useEffect(() => {
    if (!current && queue.length > 0) {
      const [next, ...rest] = queue;
      setCurrent(next);
      setQueue(rest);

      audioRef.current?.play().catch(() => {
        // Autoplay can be blocked until the browser source has interacted;
        // OBS browser sources generally allow audio autoplay by default.
      });

      const hideTimer = setTimeout(() => {
        setCurrent(null);
      }, DISPLAY_DURATION_MS);

      return () => clearTimeout(hideTimer);
    }
  }, [queue, current]);

  return (
    <main className="flex min-h-screen w-full items-start justify-center bg-transparent pt-16">
      {/* Place your own alert sound at public/alert-sound.mp3 */}
      <audio ref={audioRef} src="/alert-sound.mp3" preload="auto" />
      <AlertPopup alert={current} />
    </main>
  );
}

export default function AlertBoxPage() {
  return (
    <Suspense fallback={null}>
      <AlertBoxInner />
    </Suspense>
  );
}
