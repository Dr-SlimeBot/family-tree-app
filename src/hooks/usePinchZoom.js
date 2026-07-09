import { useEffect, useRef } from "react";

/**
 * usePinchZoom — attaches touch listeners to a ref element and
 * calls onZoom(newZoom) on pinch gesture.
 *
 * @param {React.RefObject} ref — the element to attach listeners to
 * @param {number} zoom — current zoom level
 * @param {function} setZoom — setter (min 0.4, max 2.5)
 */
export function usePinchZoom(ref, zoom, setZoom) {
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
        const dist = getDistance(e.touches);
        if (lastDist.current !== null) {
          const delta = dist - lastDist.current;
          setZoom((z) => Math.min(2.5, Math.max(0.4, z + delta * 0.004)));
        }
        lastDist.current = dist;
      }
    }

    function onTouchEnd() {
      if ((arguments[0]?.touches?.length ?? 0) < 2) {
        lastDist.current = null;
      }
    }

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [ref, setZoom]);
}
