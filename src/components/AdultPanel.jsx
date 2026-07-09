import { useState, useRef } from "react";
import { sfx } from "../lib/audio.js";
import { clearTree } from "../lib/storage.js";
import { C } from "../constants.js";

// Simple math gate for adult access
function makeProblem() {
  const a = Math.floor(Math.random() * 12) + 3;
  const b = Math.floor(Math.random() * 12) + 3;
  return { q: `${a} + ${b}`, ans: a + b };
}

export function AdultPanel({ members, onImport, onClose }) {
  const [problem]          = useState(makeProblem);
  const [guess, setGuess]  = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [gateError, setGateError] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const importRef = useRef(null);

  const tryUnlock = () => {
    if (parseInt(guess, 10) === problem.ans) {
      sfx("success");
      setUnlocked(true);
    } else {
      sfx("trash");
      setGateError(true);
      setGuess("");
      setTimeout(() => setGateError(false), 800);
    }
  };

  // Export tree as JSON download
  const handleExport = () => {
    sfx("chime");
    const json = JSON.stringify(members, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `family-tree-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import tree from JSON file
  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (Array.isArray(data)) {
          sfx("chime");
          onImport(data);
          onClose();
        }
      } catch (_) {
        alert("Oops! That file doesn't look right. Please use a Family Tree backup file.");
      }
    };
    reader.readAsText(file);
  };

  // Reset all data
  const handleReset = () => {
    sfx("trash");
    clearTree();
    onImport([]);
    onClose();
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="adult-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal__drag-handle" />

        {!unlocked ? (
          /* ─── Math Gate ─────────────────────────────────────────────────── */
          <div className="adult-panel__gate">
            <div className="adult-panel__gate-icon">🔒</div>
            <h2 className="adult-panel__gate-title">Adult Settings</h2>
            <p style={{ color: "#8C7A6B", fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
              This area is for grown-ups! Solve this to get in:
            </p>
            <div className="adult-panel__gate-q">What is {problem.q}?</div>

            <input
              className="modal__input"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={guess}
              onChange={(e) => setGuess(e.target.value.replace(/\D/g, ""))}
              placeholder="Type the answer…"
              onKeyDown={(e) => { if (e.key === "Enter") tryUnlock(); }}
              style={{
                marginTop: 12,
                textAlign: "center",
                fontSize: 20,
                border: gateError ? "3px solid #FF6B6B" : undefined,
                transition: "border-color 0.2s",
              }}
              autoFocus
            />

            {gateError && (
              <p style={{ color: "#FF6B6B", fontWeight: 800, fontSize: 13, marginBottom: 8 }}>
                🙈 Try again!
              </p>
            )}

            <div className="modal__btn-row" style={{ marginTop: 4 }}>
              <button className="btn btn--green" onClick={tryUnlock} type="button">
                🔓 Unlock
              </button>
              <button className="btn btn--ghost" onClick={onClose} type="button" style={{ flex: "0 0 auto", padding: "12px 16px" }}>
                ✕
              </button>
            </div>
          </div>
        ) : (
          /* ─── Settings ──────────────────────────────────────────────────── */
          <>
            <h2 className="modal__title">⚙️ Family Tree Settings</h2>
            <div className="adult-panel__settings">

              {/* Export */}
              <div className="adult-panel__setting-row">
                <div className="adult-panel__setting-icon">📤</div>
                <div className="adult-panel__setting-text">
                  <h4>Export Backup</h4>
                  <p>Save a copy of your family tree as a file.</p>
                </div>
                <button
                  className="btn btn--sun btn--sm adult-panel__setting-btn"
                  onClick={handleExport}
                  type="button"
                >
                  Export
                </button>
              </div>

              {/* Import */}
              <div className="adult-panel__setting-row">
                <div className="adult-panel__setting-icon">📥</div>
                <div className="adult-panel__setting-text">
                  <h4>Import Backup</h4>
                  <p>Restore your tree from a backup file.</p>
                </div>
                <button
                  className="btn btn--sun btn--sm adult-panel__setting-btn"
                  onClick={() => importRef.current?.click()}
                  type="button"
                >
                  Import
                </button>
                <input
                  ref={importRef}
                  type="file"
                  accept=".json"
                  style={{ display: "none" }}
                  onChange={handleImport}
                />
              </div>

              {/* Reset */}
              <div className="adult-panel__setting-row" style={{ border: "2px solid #FFCDD2" }}>
                <div className="adult-panel__setting-icon">🗑️</div>
                <div className="adult-panel__setting-text">
                  <h4>Clear All Data</h4>
                  <p>Permanently delete the entire family tree.</p>
                </div>
                {!confirmReset ? (
                  <button
                    className="btn btn--red btn--sm adult-panel__setting-btn"
                    onClick={() => setConfirmReset(true)}
                    type="button"
                  >
                    Reset
                  </button>
                ) : (
                  <button
                    className="btn btn--red btn--sm adult-panel__setting-btn"
                    onClick={handleReset}
                    type="button"
                    style={{ fontSize: 11 }}
                  >
                    ⚠️ Sure?
                  </button>
                )}
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <button className="btn btn--ghost" onClick={onClose} type="button" style={{ width: "100%" }}>
                ✕ Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
