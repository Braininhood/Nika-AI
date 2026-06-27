"use client";

import { useEffect } from "react";

import { addStudyMinutes } from "@/lib/progress/study-time";

const HEARTBEAT_MS = 60_000;

/** Accumulates active study minutes while the learner is on study routes. */
export function StudyActivityTracker() {
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | undefined;

    const tick = () => {
      if (document.visibilityState === "visible") {
        addStudyMinutes(1);
      }
    };

    const start = () => {
      if (intervalId) return;
      intervalId = setInterval(tick, HEARTBEAT_MS);
    };

    const stop = () => {
      if (!intervalId) return;
      clearInterval(intervalId);
      intervalId = undefined;
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") start();
      else stop();
    };

    if (document.visibilityState === "visible") start();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return null;
}
