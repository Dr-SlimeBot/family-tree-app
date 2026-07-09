import { useState, useEffect, useMemo } from "react";
import { ROLES, AVATARS, ROLE_GROUPS, ROLE_PICKER_DESC, ROLE_DEFAULT_AVATAR } from "../constants.js";
import { sfx, confetti } from "../lib/audio.js";

/**
 * Returns the list of members who can serve as "parent" for a given role.
 *  - cousin       → all aunts and uncles
 *  - aunt_partner → all aunts
 *  - uncle_partner → all uncles
 */
function getEligibleParents(role, allMembers) {
  if (!allMembers) return [];
  if (role === "cousin")        return allMembers.filter((m) => m.role === "aunt" || m.role === "uncle");
  if (role === "uncle_partner") return allMembers.filter((m) => m.role === "uncle");
  if (role === "aunt_partner")  return allMembers.filter((m) => m.role === "aunt");
  return [];
}

const PARENT_REQUIRED_ROLES = new Set(["cousin", "aunt_partner", "uncle_partner"]);

export function MemberModal({ member, allMembers, onSave, onClose, onDelete, hasNoSelf }) {
  const isNew = !member?.id;
  const defaultRole = member?.role || (hasNoSelf ? "self" : "mom");

  const [name,          setName]          = useState(member?.name    || "");
  const [avatar,        setAvatar]        = useState(member?.avatar  || ROLE_DEFAULT_AVATAR[defaultRole] || "🧒");
  const [role,          setRole]          = useState(defaultRole);
  const [parentId,      setParentId]      = useState(member?.parentId || "");
  const [info,          setInfo]          = useState(member?.info     || "");
  const [avatarChosen,  setAvatarChosen]  = useState(!!member?.avatar);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // M1: auto-suggest avatar when role changes
  useEffect(() => {
    if (!avatarChosen && ROLE_DEFAULT_AVATAR[role]) {
      setAvatar(ROLE_DEFAULT_AVATAR[role]);
    }
  }, [role, avatarChosen]);

  // Phase 1: Auto-select parentId when there's only one eligible parent
  const eligibleParents = useMemo(() => getEligibleParents(role, allMembers), [role, allMembers]);

  useEffect(() => {
    if (!PARENT_REQUIRED_ROLES.has(role)) {
      setParentId("");
      return;
    }
    if (eligibleParents.length === 1) {
      // Auto-select the only option
      setParentId(eligibleParents[0].id);
    } else if (!eligibleParents.find((m) => m.id === parentId)) {
      // Reset if current selection is no longer valid for the new role
      setParentId("");
    }
  }, [role, eligibleParents]); // eslint-disable-line

  // Filter role groups: "Partners (Married In)" only shown when aunts/uncles exist
  const filteredGroups = useMemo(() => {
    return ROLE_GROUPS.filter((group) => {
      if (group.requiresParentRole) {
        return group.requiresParentRole.some((r) =>
          allMembers?.some((m) => m.role === r)
        );
      }
      return true;
    });
  }, [allMembers]);

  const handleRoleChange = (r) => { sfx("pop"); setRole(r); };
  const handleAvatarChange = (a) => { sfx("pop"); setAvatar(a); setAvatarChosen(true); };

  const handleSave = () => {
    if (!name.trim()) return;
    // Validate: roles that require a parent must have one selected
    if (PARENT_REQUIRED_ROLES.has(role) && eligibleParents.length > 0 && !parentId) return;
    onSave({
      name: name.trim(),
      avatar,
      role,
      info: info.trim(),
      // Include parentId for cousin/in-law roles so layout can compute sub-tree position
      ...(parentId ? { parentId } : {}),
    });
    sfx("chime");
    confetti();
  };

  const needsParent     = PARENT_REQUIRED_ROLES.has(role) && eligibleParents.length > 0;
  const parentMissing   = needsParent && !parentId;

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__drag-handle" />

        <h2 className="modal__title">
          {isNew ? (hasNoSelf ? "🌟 Let's add YOU first!" : "🌱 Add a Family Member!") : "✏️ Update Member!"}
        </h2>

        {/* Name */}
        <label className="modal__label">What is their name? ✨</label>
        <input
          className="modal__input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Type their name here…"
          maxLength={18}
          autoFocus
          onKeyDown={(e) => { if (e.key === "Enter" && !parentMissing) handleSave(); }}
        />

        {/* Fun Fact / Info */}
        <label className="modal__label" style={{ marginTop: 16 }}>Fun Fact or Info (optional) 💡</label>
        <input
          className="modal__input"
          value={info}
          onChange={(e) => setInfo(e.target.value)}
          placeholder="e.g. Loves baking, Lives in London..."
          maxLength={60}
          onKeyDown={(e) => { if (e.key === "Enter" && !parentMissing) handleSave(); }}
        />

        {/* Avatar picker */}
        <label className="modal__label" style={{ marginTop: 16 }}>Pick their look! 🌟</label>
        <div className="avatar-grid-wrap">
          {Object.entries(AVATARS).map(([cat, emojis]) => (
            <div key={cat}>
              <span className="avatar-cat-label">{cat}</span>
              <div className="avatar-row">
                {emojis.map((a) => (
                  <button key={a} className={`avatar-btn ${avatar === a ? "selected" : ""}`}
                    onClick={() => handleAvatarChange(a)} type="button">
                    {a}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Role picker */}
        {!hasNoSelf && (
          <>
            <label className="modal__label">Who are they? 🤗</label>
            {filteredGroups.map(({ label, roles }) => (
              <div key={label} className="role-group">
                <div className="role-group__label">{label}</div>
                {roles.map((r) => {
                  const info = ROLES[r];
                  const sel  = role === r;
                  return (
                    <button key={r} type="button"
                      className={`role-btn ${sel ? "selected" : ""}`}
                      style={{ background: sel ? info.color : "var(--white)" }}
                      onClick={() => handleRoleChange(r)}>
                      <span className="role-btn__emoji">{info.emoji}</span>
                      <div>
                        <div className="role-btn__name">{info.label}</div>
                        <div className="role-btn__desc">{ROLE_PICKER_DESC[r] || ""}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
          </>
        )}

        {/* Phase 1: Parent selector for cousin / in-law roles ─────────────── */}
        {needsParent && (
          <div style={{ marginBottom: 16 }}>
            <label className="modal__label">
              {role === "cousin"
                ? "Which Aunt or Uncle is their parent? 👪"
                : "Who are they partnered with? 💍"}
            </label>

            {eligibleParents.length === 1 ? (
              /* Auto-selected — just confirm visually */
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 14px", borderRadius: "var(--r-md)",
                background: ROLES[eligibleParents[0].role]?.color || "var(--cream)",
                border: "2px solid var(--bark)", opacity: 0.9,
              }}>
                <span style={{ fontSize: 22 }}>{ROLES[eligibleParents[0].role]?.emoji}</span>
                <div>
                  <div style={{ fontWeight: 900, fontSize: 13, color: "var(--bark)" }}>
                    {eligibleParents[0].name}
                  </div>
                  <div style={{ fontSize: 10, opacity: 0.7, color: "var(--bark)" }}>
                    Auto-selected ✓
                  </div>
                </div>
              </div>
            ) : (
              /* Multi-parent selector */
              <div className="role-list">
                {eligibleParents.map((p) => (
                  <button key={p.id} type="button"
                    className={`role-btn ${parentId === p.id ? "selected" : ""}`}
                    style={{ background: parentId === p.id ? ROLES[p.role]?.color : "var(--white)" }}
                    onClick={() => { sfx("pop"); setParentId(p.id); }}>
                    <span className="role-btn__emoji">{ROLES[p.role]?.emoji}</span>
                    <div>
                      <div className="role-btn__name">{p.name}</div>
                      <div className="role-btn__desc">{ROLES[p.role]?.label}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {parentMissing && (
              <p style={{ fontSize: 11, color: "var(--bark)", opacity: 0.7, marginTop: 6, fontWeight: 700 }}>
                ☝️ Please pick a parent first!
              </p>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="modal__btn-row">
          <button className="btn btn--green" onClick={handleSave}
            disabled={!name.trim() || parentMissing} type="button">
            ✅ Save!
          </button>

          {!isNew && (
            confirmDelete ? (
              <button className="btn btn--red" type="button"
                onClick={() => { sfx("trash"); onDelete(); }}
                style={{ flex: "0 0 auto", padding: "12px 14px", fontSize: 12, whiteSpace: "nowrap" }}>
                ⚠️ Sure?
              </button>
            ) : (
              <button className="btn btn--ghost" type="button"
                onClick={() => { sfx("pop"); setConfirmDelete(true); setTimeout(() => setConfirmDelete(false), 3000); }}
                style={{ flex: "0 0 auto", padding: "12px 16px" }}>
                🗑️
              </button>
            )
          )}

          <button className="btn btn--ghost" onClick={() => { sfx("pop"); onClose(); }} type="button"
            aria-label="Close" style={{ flex: "0 0 auto", padding: "12px 16px" }}>
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
