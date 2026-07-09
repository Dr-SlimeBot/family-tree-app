import { sfx, confetti } from "../lib/audio.js";

export function TourOverlay({ step, onNext, onFinish }) {
  if (step === 0) return null;

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(30, 20, 10, 0.65)", zIndex: 9999,
      pointerEvents: "auto",
      animation: "fade-in 0.3s ease-out"
    }}>
      {step === 1 && (
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
          background: "var(--cream)", padding: "32px", borderRadius: "24px",
          width: "90%", maxWidth: "400px", textAlign: "center",
          boxShadow: "0 12px 32px rgba(0,0,0,0.3)", border: "4px solid var(--bark)",
          animation: "pop-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✨</div>
          <h2 style={{ color: "var(--bark)", marginBottom: 16, fontSize: 24, fontWeight: 900 }}>
            Welcome to your Magical Family Tree!
          </h2>
          <p style={{ color: "var(--woodDk)", marginBottom: 24, fontSize: 16, fontWeight: 700 }}>
            Let's do a quick 3-step tour to unlock your forest! 🌳
          </p>
          <button className="btn btn--green btn--lg" onClick={() => { sfx("pop"); onNext(); }}>
            Next ➡️
          </button>
        </div>
      )}

      {step === 2 && (
        <div style={{
          position: "absolute", top: "140px", left: "50%", transform: "translateX(-50%)",
          background: "var(--cream)", padding: "24px", borderRadius: "20px",
          width: "90%", maxWidth: "380px", textAlign: "center",
          boxShadow: "0 12px 32px rgba(0,0,0,0.3)", border: "3px solid var(--bark)",
          animation: "pop-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
        }}>
          {/* Arrow pointing up */}
          <div style={{
            position: "absolute", top: "-20px", left: "50%", transform: "translateX(-50%)",
            width: 0, height: 0, borderLeft: "16px solid transparent",
            borderRight: "16px solid transparent", borderBottom: "20px solid var(--bark)"
          }} />
          <div style={{
            position: "absolute", top: "-16px", left: "50%", transform: "translateX(-50%)",
            width: 0, height: 0, borderLeft: "12px solid transparent",
            borderRight: "12px solid transparent", borderBottom: "16px solid var(--cream)"
          }} />

          <div style={{ fontSize: 40, marginBottom: 12 }}>🎯</div>
          <p style={{ color: "var(--bark)", marginBottom: 20, fontSize: 18, fontWeight: 800 }}>
            This is your Quest Bar! Add relatives and furry pets to fill up the bar! 🐾
          </p>
          <button className="btn btn--sun" onClick={() => { sfx("pop"); onNext(); }}>
            Next ➡️
          </button>
        </div>
      )}

      {step === 3 && (
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
          background: "var(--cream)", padding: "24px", borderRadius: "20px",
          width: "90%", maxWidth: "380px", textAlign: "center",
          boxShadow: "0 12px 32px rgba(0,0,0,0.3)", border: "3px solid var(--bark)",
          animation: "pop-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
        }}>
          {/* Mock Aunt node for illustration */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 24, position: "relative" }}>
            <div style={{
              width: 80, height: 90, background: "var(--rose)", borderRadius: 20,
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "3px solid var(--white)", boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
            }}>
              <span style={{ fontSize: 32 }}>👩</span>
            </div>
            {/* The toggle */}
            <div style={{
              position: "absolute", bottom: -12, left: "50%", transform: "translateX(-50%)",
              width: 28, height: 28, background: "var(--grass)", borderRadius: "50%",
              border: "3px solid var(--bark)", display: "flex", alignItems: "center",
              justifyContent: "center", color: "var(--white)", fontWeight: 900, fontSize: 20
            }}>
              +
            </div>
            {/* Arrow pointing to toggle */}
            <div style={{
              position: "absolute", right: "20%", bottom: -20, fontSize: 32,
              transform: "rotate(-20deg)", animation: "pulse-ring 1.5s infinite"
            }}>
              👈
            </div>
          </div>
          
          <p style={{ color: "var(--bark)", marginBottom: 20, fontSize: 18, fontWeight: 800 }}>
            Tap aunts and uncles with a green plus to discover your cousins across the world! 🌟
          </p>
          <button className="btn btn--green btn--lg" onClick={() => { sfx("pop"); onNext(); }}>
            Next ➡️
          </button>
        </div>
      )}

      {step === 4 && (
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
          background: "var(--cream)", padding: "24px", borderRadius: "20px",
          width: "90%", maxWidth: "380px", textAlign: "center",
          boxShadow: "0 12px 32px rgba(0,0,0,0.3)", border: "3px solid var(--bark)",
          animation: "pop-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
        }}>
          {/* Mock Card for illustration */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 24, position: "relative" }}>
            <div style={{
              width: 80, height: 90, background: "var(--sun)", borderRadius: 20,
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "3px solid var(--white)", boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
            }}>
              <span style={{ fontSize: 32 }}>🧒</span>
            </div>
            {/* Arrow pointing to card */}
            <div style={{
              position: "absolute", right: "20%", bottom: -20, fontSize: 32,
              transform: "rotate(-20deg)", animation: "pulse-ring 1.5s infinite"
            }}>
              👆
            </div>
          </div>
          
          <p style={{ color: "var(--bark)", marginBottom: 20, fontSize: 18, fontWeight: 800 }}>
            Tap on anyone's card to read about them, or add a cool Fun Fact! 💡
          </p>
          <button className="btn btn--green btn--lg" onClick={() => { sfx("chime"); confetti(); onFinish(); }}>
            Finish! 🎉
          </button>
        </div>
      )}
    </div>
  );
}
