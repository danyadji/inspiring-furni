"use client";

import { useEffect } from "react";

export default function MobileZoomPreventer() {
  useEffect(() => {
    // Prevent pinch zoom via multi-touch
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    // Prevent Safari gesture zoom
    const handleGestureStart = (e: Event) => {
      e.preventDefault();
    };

    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("gesturestart", handleGestureStart);

    return () => {
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("gesturestart", handleGestureStart);
    };
  }, []);

  return null;
}
