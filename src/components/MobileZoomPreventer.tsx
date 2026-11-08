"use client";

import { useEffect } from "react";

export default function MobileZoomPreventer() {
  useEffect(() => {
    // Prevent pinch zoom via multi-touch, unless on zoomable lightbox
    const handleTouchMove = (e: TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.closest("[data-allow-zoom]")) {
        return;
      }
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    // Prevent Safari gesture zoom, unless on zoomable lightbox
    const handleGestureStart = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (target && target.closest("[data-allow-zoom]")) {
        return;
      }
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

