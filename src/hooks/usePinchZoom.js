import { useEffect, useRef } from "react";

/**
 * usePinchZoom — attaches touch listeners to a ref element and
 * directly applies a CSS transform on pinch gesture (no React re-render).
 *
 * @param {React.RefObject} ref         — the canvas element to attach to
 * @param {React.RefObject} liveZoom    — ref tracking the current zoom
 * @param {React.RefObject} liveOffset  — ref tracking the current offset
 * @param {function}        applyTransform — (ox,oy,z) => void  applies CSS transform
 * @param {function}        setZoom     — React setter to sync state after gesture ends
 */
export function usePinchZoom(ref, liveZoom, liveOffset, applyTransform, setZoom) {
  const lastDist = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function getDistance(touches) {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.hypot(dx, dy);
    }

    function onTouchStart(e) {
      if (e.touches.length === 2) {
        lastDist.current = getDistance(e.touches);
      }
    }

    function onTouchMove(e) {
      if (e.touches.length === 2) {
        e.preventDefault();
        const dist  = getDistance(e.touches);
        if (lastDist.current !== null) {
          const delta = dist - lastDist.current;
          const z = Math.min(2.5, Math.max(0.4, liveZoom.current + delta * 0.004));
          liveZoom.current = z;
          applyTransform(liveOffset.current.x, liveOffset.current.y, z);
        }
        lastDist.current = dist;
      }
    }

    function onTouchEnd(e) {
      if ((e.touches?.length ?? 0) < 2) {
        // Sync React state once the pinch ends
        setZoom(liveZoom.current);
        lastDist.current = null;
      }
    }

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove",  onTouchMove,  { passive: false });
    el.addEventListener("touchend",   onTouchEnd,   { passive: true });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove",  onTouchMove);
      el.removeEventListener("touchend",   onTouchEnd);
    };
  }, [ref, liveZoom, liveOffset, applyTransform, setZoom]);
}
