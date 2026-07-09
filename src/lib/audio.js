// ─── Sound Effects ────────────────────────────────────────────────────────────
export const sfx = (type) => {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();

    if (type === "pop") {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = "sine";
      o.frequency.setValueAtTime(220, ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
      g.gain.setValueAtTime(0.1, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      o.start(); o.stop(ctx.currentTime + 0.1);
    }

    if (type === "chime") {
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type = "triangle";
        o.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.09);
        g.gain.setValueAtTime(0.0, ctx.currentTime + i * 0.09);
        g.gain.linearRampToValueAtTime(0.08, ctx.currentTime + i * 0.09 + 0.01);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.09 + 0.35);
        o.start(ctx.currentTime + i * 0.09);
        o.stop(ctx.currentTime + i * 0.09 + 0.4);
      });
    }

    if (type === "trash") {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = "sawtooth";
      o.frequency.setValueAtTime(300, ctx.currentTime);
      o.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.25);
      g.gain.setValueAtTime(0.08, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      o.start(); o.stop(ctx.currentTime + 0.25);
    }

    if (type === "success") {
      [523.25, 783.99, 1046.5, 1318.51].forEach((freq, i) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type = "sine";
        o.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.07);
        g.gain.setValueAtTime(0.07, ctx.currentTime + i * 0.07);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.07 + 0.3);
        o.start(ctx.currentTime + i * 0.07);
        o.stop(ctx.currentTime + i * 0.07 + 0.35);
      });
    }
  } catch (_) {}
};

// ─── Confetti burst ───────────────────────────────────────────────────────────
export function confetti() {
  const wrap = document.createElement("div");
  wrap.style.cssText =
    "position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden";
  document.body.appendChild(wrap);

  const palette = ["#FFD166", "#FF6B9D", "#06D6A0", "#C77DFF", "#A0E0FF", "#FF6B6B", "#4DB8E8"];

  for (let i = 0; i < 60; i++) {
    const el = document.createElement("div");
    const sz = Math.random() * 13 + 6;
    const isCircle = Math.random() > 0.4;
    el.style.cssText = `
      position:absolute;
      width:${sz}px;
      height:${sz * (isCircle ? 1 : Math.random() * 0.6 + 0.4)}px;
      border-radius:${isCircle ? "50%" : "3px"};
      background:${palette[Math.floor(Math.random() * palette.length)]};
      left:${Math.random() * 100}vw;
      top:-20px;
      transform:rotate(${Math.random() * 360}deg);
      opacity:1;
    `;
    wrap.appendChild(el);

    const vx = (Math.random() - 0.5) * 260;
    const vy = Math.random() * 400 + 400;
    const rot = Math.random() * 720 * (Math.random() > 0.5 ? 1 : -1);
    const dur = Math.random() * 1200 + 1400;

    const anim = el.animate(
      [
        { transform: `translate(0,0) rotate(0deg)`, opacity: 1 },
        { transform: `translate(${vx}px,${vy}px) rotate(${rot}deg)`, opacity: 0 },
      ],
      { duration: dur, easing: "cubic-bezier(.1,.7,.3,1)", fill: "forwards" }
    );
    anim.onfinish = () => el.remove();
  }

  setTimeout(() => { try { wrap.remove(); } catch (_) {} }, 4000);
}
