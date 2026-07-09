import { useState } from "react";
import { sfx, confetti } from "../lib/audio.js";

export function Welcome({ hasSaved, savedCount, onStart, onLoad }) {
  // C1 fix: show confirmation before clearing saved data
  const [confirmNew, setConfirmNew] = useState(false);

  const handleStartNew = () => {
    if (hasSaved) {
      sfx("pop");
      setConfirmNew(true);
    } else {
      sfx("chime");
      confetti();
      onStart();
    }
  };

  return (
    <div className="welcome">
      {/* Background decorations */}
      <div className="welcome__sun">☀️</div>
      <div className="welcome__cloud" style={{ top: "14%", left: "6%",  animationDirection: "alternate" }}>☁️</div>
      <div className="welcome__cloud" style={{ top: "22%", right: "4%", animationDelay: "-5s", animationDirection: "alternate-reverse", fontSize: 52 }}>☁️</div>
      <div className="welcome__cloud" style={{ bottom: "20%", left: "2%",  animationDelay: "-9s", fontSize: 44 }}>🌿</div>
      <div className="welcome__cloud" style={{ bottom: "10%", right: "8%", animationDelay: "-3s", fontSize: 40 }}>🌸</div>

      <div className="welcome__card">
        <div className="welcome__tree">🌳</div>

        <h1 className="welcome__title">
          My Magical<br />
          <span>Family Tree!</span>
        </h1>

        <p className="welcome__subtitle">
          Who is in your family? 🌟 Add them, pick fun avatars,
          and build your own magic forest — all saved just for you!
        </p>

        {hasSaved && (
          <div className="welcome__saved-badge">
            🌿 Your tree has {savedCount} family member{savedCount !== 1 ? "s" : ""}!
          </div>
        )}

        <div className="welcome__btn-stack">
          {/* U4 fix: When returning user, "Continue" is the PRIMARY green button shown first */}
          {hasSaved ? (
            <>
              <button
                className="btn btn--green btn--lg"
                onClick={() => { sfx("chime"); onLoad(); }}
              >
                🌳 Continue My Tree!
              </button>
              <button
                className="btn btn--ghost"
                onClick={handleStartNew}
                style={{ fontSize: 14 }}
              >
                🌱 Start a Fresh Tree
              </button>
            </>
          ) : (
            <button
              className="btn btn--green btn--lg"
              onClick={handleStartNew}
            >
              🌱 Start My Tree!
            </button>
          )}
        </div>
      </div>

      {/* C1: Confirmation dialog when trying to start fresh with saved data */}
      {confirmNew && (
        <div className="welcome__confirm-overlay" onClick={() => setConfirmNew(false)}>
          <div className="welcome__confirm-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 52, marginBottom: 8 }}>⚠️</div>
            <h3 style={{ fontFamily: "'Fredoka One', sans-serif", fontSize: 22, color: "#5C3D2E", marginBottom: 10 }}>
              Start Fresh?
            </h3>
            <p style={{ color: "#8C7A6B", fontSize: 14, fontWeight: 700, lineHeight: 1.5, marginBottom: 20 }}>
              This will create a brand new empty tree. Your saved tree will be replaced! 
              Make sure a grown-up helps you back up your tree first.
            </p>
            <div style={{ display: "flex", gap: 10, flexDirection: "column" }}>
              <button
                className="btn btn--red"
                onClick={() => { sfx("chime"); confetti(); setConfirmNew(false); onStart(); }}
              >
                🌱 Yes, Start Fresh!
              </button>
              <button
                className="btn btn--green"
                onClick={() => { sfx("pop"); setConfirmNew(false); }}
              >
                🌳 No, Keep My Tree!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating leaf particles */}
      {["🍃", "🌸", "🍂", "🌼", "✨", "🍀"].map((icon, i) => (
        <div
          key={i}
          className="leaf-particle"
          style={{
            left: `${10 + i * 15}%`,
            top:  `${20 + (i % 3) * 20}%`,
            "--tx":    `${(i % 2 === 0 ? 1 : -1) * (40 + i * 8)}px`,
            "--ty":    `${80 + i * 20}px`,
            "--tr":    `${(i % 2 === 0 ? 1 : -1) * (90 + i * 30)}deg`,
            "--dur":   `${5 + i * 1.5}s`,
            "--delay": `${-i * 0.8}s`,
          }}
        >
          {icon}
        </div>
      ))}
    </div>
  );
}
