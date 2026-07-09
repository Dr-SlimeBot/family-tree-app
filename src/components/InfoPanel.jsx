import { ROLES, RELATION_EXPLAINER, BLOODLINE_ROLES, IN_LAW_ROLES } from "../constants.js";
import { sfx } from "../lib/audio.js";

/**
 * explainerOverride — Phase 3: dynamic cousin relation string from cousins.js
 * relationLabel    — Phase 3: short badge label override (e.g. "Bob's Kid")
 */
export function InfoPanel({ member, onEdit, onClose, explainerOverride, relationLabel }) {
  const role         = ROLES[member.role] || {};
  const isInLaw      = IN_LAW_ROLES.has(member.role);

  const getPersonalizedExplainer = () => {
    const base = explainerOverride || RELATION_EXPLAINER[member.role] || "";
    if (member.role === "self") return `✨ This is YOU, ${member.name}! ${base}`;
    if (explainerOverride) return `✨ ${base}`; // Cousin dynamically generated text already has names
    
    let lower = base;
    if (base.startsWith("Your ")) lower = "y" + base.slice(1);
    else if (base.startsWith("Someone ")) lower = "s" + base.slice(1);
    
    return `✨ ${member.name} is ${lower}`;
  };

  return (
    <div className="info-panel" onClick={(e) => e.stopPropagation()}>
      <div className="info-panel__drag-handle" />

      <div className="info-panel__body">
        <div className="info-panel__avatar" style={{ background: role.color }}>
          {member.avatar}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="info-panel__name">{member.name}</div>
          <div className="info-panel__role" style={{ color: role.color }}>
            {role.label}
          </div>
        </div>
      </div>

      {/* Phase 2: In-law indicator */}
      {isInLaw && (
        <div style={{
          textAlign: "center", fontSize: 11, fontWeight: 800,
          color: "#7C3AED", background: "#EDE9FE", borderRadius: 8,
          padding: "4px 10px", marginBottom: 8,
        }}>
          💍 Married into the family
        </div>
      )}

      {/* Phase 3: Dynamic cousin label OR static explainer */}
      <div className="info-panel__explainer">
        {member.info && (
          <div style={{ marginBottom: 16, fontSize: 15, fontWeight: 800, color: "var(--woodDk)" }}>
            💡 Fun Fact: <span style={{ fontWeight: 700 }}>{member.info}</span>
          </div>
        )}
        <div>{getPersonalizedExplainer()}</div>
      </div>

      {/* Phase 3: Short relation label if overridden */}
      {relationLabel && (
        <div style={{
          textAlign: "center", fontSize: 12, fontWeight: 900,
          color: "var(--bark)", background: "var(--cream-dk, #F5EDE0)",
          borderRadius: 10, padding: "6px 14px", marginBottom: 6,
        }}>
          🌳 {relationLabel}
        </div>
      )}

      {/* U2 fix: Edit button is now BIG, green, and the first thing you see — unmissable */}
      <div className="info-panel__actions">
        <button
          className="btn btn--green info-panel__edit-btn"
          onClick={() => { sfx("pop"); onEdit(); }}
        >
          ✏️ Edit this Person!
        </button>
        <button
          className="btn btn--ghost btn--sm"
          onClick={() => { sfx("pop"); onClose(); }}
          aria-label="Close info panel"
          style={{ flex: "0 0 auto", padding: "12px 16px" }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
