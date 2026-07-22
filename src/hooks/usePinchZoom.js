import { useEffect, useRef } from "react";

/**
 * usePinchZoom — GPU-composited pinch-to-zoom.
 * Zooms toward the midpoint of the two fingers (natural mobile feel).
 *
 * @param {React.RefObject} ref            — the canvas container element
 * @param {React.RefObject} liveZoom       — ref tracking current zoom value
 * @param {React.RefObject} liveOffset     — ref tracking current {x,y} pan offset
 * @param {function}        applyTransform — (ox, oy, z) => void: mutates CSS directly
 * @param {function}        setZoom        — React setState to sync after gesture ends
 */
export function usePinchZoom(ref, liveZoom, liveOffset, applyTransform, setZoom) {
  const lastDist   = useRef(null);
  const lastMid    = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function getDistance(touches) {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.hypot(dx, dy);
    }

    function getMidpoint(touches) {
      return {
        x: (touches[0].clientX + touches[1].clientX) / 2,
        y: (touches[0].clientY + touches[1].clientY) / 2,
      };
    }

    function onTouchStart(e) {
      if (e.touches.length === 2) {
        lastDist.current = getDistance(e.touches);
        lastMid.current  = getMidpoint(e.touches);
      }
    }

    function onTouchMove(e) {
      if (e.touches.length !== 2) return;
      e.preventDefault();

      const dist = getDistance(e.touches);
      const mid  = getMidpoint(e.touches);

      if (lastDist.current !== null) {
        const oldZ  = liveZoom.current;
        const ratio = dist / lastDist.current;
        const newZ  = Math.min(2.5, Math.max(0.4, oldZ * ratio));

        // Zoom toward the midpoint of the two fingers
        const ox = liveOffset.current.x;
        const oy = liveOffset.current.y;

        // Adjust offset so the point under the midpoint stays fixed
        const newOx = mid.x - (mid.x - ox) * (newZ / oldZ);
        const newOy = mid.y - (mid.y - oy) * (newZ / oldZ);

        liveZoom.current   = newZ;
        liveOffset.current = { x: newOx, y: newOy };
        applyTransform(newOx, newOy, newZ);
      }

      lastDist.current = dist;
      lastMid.current  = mid;
    }

    function onTouchEnd(e) {
      if ((e.touches?.length ?? 0) < 2) {
        // Sync React state once the pinch ends (triggers card re-render at new positions)
        setZoom(liveZoom.current);
        lastDist.current = null;
        lastMid.current  = null;
      }
    }

    el.addEventListener("touchstart", onTouchStart, { passive: true  });
    el.addEventListener("touchmove",  onTouchMove,  { passive: false });
    el.addEventListener("touchend",   onTouchEnd,   { passive: true  });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove",  onTouchMove);
      el.removeEventListener("touchend",   onTouchEnd);
    };
  }, [ref, liveZoom, liveOffset, applyTransform, setZoom]);
}
