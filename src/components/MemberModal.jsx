import { useState, useEffect, useMemo } from "react";
import { ROLES, AVATARS, ROLE_GROUPS, ROLE_PICKER_DESC, ROLE_DEFAULT_AVATAR } from "../constants.js";
import { sfx, confetti } from "../lib/audio.js";

/**
 * Returns the list of members who can serve as "parent" for a given role.
 */
function getEligibleParents(role, allMembers) {
  if (!allMembers) return [];
  if (role === "cousin")        return allMembers.filter((m) => m.role === "aunt" || m.role === "uncle");
  if (role === "uncle_partner") return allMembers.filter((m) => m.role === "uncle");
  if (role === "aunt_partner")  return allMembers.filter((m) => m.role === "aunt");
  return [];
}

const PARENT_REQUIRED_ROLES = new Set(["cousin", "aunt_partner", "uncle_partner"]);

function getAvatarCategoryForRole(r) {
  if (r === "pet") return ["Pets", "Fun"];
  if (["grandma", "grandpa", "great_grandma", "great_grandpa"].includes(r)) return ["Grandparents", "Fun"];
  if (["mom", "dad", "spouse"].includes(r)) return ["Parents", "Fun"];
  if (["aunt", "uncle", "aunt_partner", "uncle_partner"].includes(r)) return ["Aunts/Uncles", "Partners", "Fun"];
  return ["Kids", "Fun"];
}

export function MemberModal({ member, allMembers, onSave, onClose, onDelete, hasNoSelf, contextMember, contextGroups, contextLabel }) {
  const isNew = !member?.id;
  const defaultRole = member?.role || (hasNoSelf ? "self" : (contextGroups ? contextGroups[0]?.roles[0] : "mom") || "mom");

  const [step,          setStep]          = useState(hasNoSelf ? 2 : 1);
  const [name,          setName]          = useState(member?.name    || "");
  const [avatar,        setAvatar]        = useState(member?.avatar  || ROLE_DEFAULT_AVATAR[defaultRole] || "🧒");
  const [role,          setRole]          = useState(defaultRole);
  const [parentId,      setParentId]      = useState(
    member?.parentId ||
    // Pre-seed parentId from context: if adding cousin/in-law relative to an aunt/uncle
    (contextMember && PARENT_REQUIRED_ROLES.has(defaultRole) ? contextMember.id : "")
  );
  const [info,          setInfo]          = useState(member?.info     || "");
  const [avatarChosen,  setAvatarChosen]  = useState(!!member?.avatar);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Auto-suggest avatar when role changes
  useEffect(() => {
    if (!avatarChosen && ROLE_DEFAULT_AVATAR[role]) {
      setAvatar(ROLE_DEFAULT_AVATAR[role]);
    }
  }, [role, avatarChosen]);

  const eligibleParents = useMemo(() => getEligibleParents(role, allMembers), [role, allMembers]);

  useEffect(() => {
    if (!PARENT_REQUIRED_ROLES.has(role)) {
      setParentId("");
      return;
    }
    if (eligibleParents.length === 1) {
      setParentId(eligibleParents[0].id);
    } else if (!eligibleParents.find((m) => m.id === parentId)) {
      setParentId("");
    }
  }, [role, eligibleParents]); // eslint-disable-line

  const filteredGroups = useMemo(() => {
    // If coming from "Add Relative" button, use narrowed context groups
    if (contextGroups) return contextGroups;
    return ROLE_GROUPS.filter((group) => {
      if (group.requiresParentRole) {
        return group.requiresParentRole.some((r) =>
          allMembers?.some((m) => m.role === r)
        );
      }
      return true;
    });
  }, [allMembers, contextGroups]);

  const needsParent   = PARENT_REQUIRED_ROLES.has(role) && eligibleParents.length > 0;
  const parentMissing = needsParent && !parentId;

  const handleRoleChange = (r) => { 
    sfx("pop"); 
    setRole(r); 
    // Auto advance if no parent picker is needed
    if (!PARENT_REQUIRED_ROLES.has(r) || (PARENT_REQUIRED_ROLES.has(r) && getEligibleParents(r, allMembers).length === 1)) {
      setTimeout(() => setStep(2), 250);
    }
  };

  const handleParentChange = (id) => {
    sfx("pop");
    setParentId(id);
    setTimeout(() => setStep(2), 250);
  };

  const handleAvatarChange = (a) => { 
    sfx("pop"); 
    setAvatar(a); 
    setAvatarChosen(true); 
  };

  const handleSave = () => {
    if (!name.trim() || parentMissing) return;
    onSave({
      name: name.trim(),
      avatar,
      role,
      info: info.trim(),
      ...(parentId ? { parentId } : {}),
    });
    sfx("chime");
    confetti();
  };

  const handleNext = () => { sfx("pop"); setStep(s => s + 1); };
  const handleBack = () => { sfx("pop"); setStep(s => s - 1); };

  const isNextDisabled = () => {
    if (step === 1) return !role || parentMissing;
    if (step === 2) return !name.trim();
    if (step === 3) return !avatar;
    return false;
  };

  const allowedAvatars = getAvatarCategoryForRole(role);
  const progressPct = ((step - 1) / 4) * 100;

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ minHeight: 520, display: "flex", flexDirection: "column", padding: "24px 24px 28px" }}>
        
        {/* Header line */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          {!isNew && (
            confirmDelete ? (
              <button className="btn btn--red" type="button" onClick={() => { sfx("trash"); onDelete(); }} style={{ padding: "8px 12px", fontSize: 12 }}>
                ⚠️ Sure?
              </button>
            ) : (
              <button className="btn btn--ghost" type="button" onClick={() => { sfx("pop"); setConfirmDelete(true); setTimeout(() => setConfirmDelete(false), 3000); }} style={{ padding: "8px 12px" }}>
                🗑️
              </button>
            )
          )}
          <div style={{ flex: 1 }} />
          <button className="btn btn--ghost" onClick={() => { sfx("pop"); onClose(); }} type="button" aria-label="Close" style={{ padding: "8px 12px", fontSize: 14 }}>
            ✕ Close
          </button>
        </div>

        {/* Progress Tracker Bar */}
        <div style={{ marginBottom: 24, padding: "0 4px" }}>
           <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 900, color: "var(--grass-dk)", marginBottom: 6 }}>
             <span>🌱 Start</span>
             <span>🌳 Done!</span>
           </div>
           <div style={{ height: 16, background: "var(--cream-dk)", borderRadius: 12, overflow: "hidden", border: "2px solid var(--bark)" }}>
             <div style={{ 
               width: `${progressPct}%`, 
               height: "100%", 
               background: "var(--grass)",
               transition: "width 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
             }} />
           </div>
        </div>

        {/* Step Content Wrapper (remounts on step change to trigger animations & autofocus) */}
        <div key={step} style={{ flex: 1, position: "relative", overflowX: "hidden", overflowY: "auto", paddingBottom: 10, animation: "pop-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)" }}>
           
           {/* STEP 1: Who are they? */}
           {step === 1 && !hasNoSelf && (
             <div>
               <h2 className="modal__title" style={{ textAlign: "center", marginBottom: 8 }}>
                 {contextLabel || "Who are they? 🤗"}
               </h2>
               {contextMember && (
                 <p style={{ textAlign: "center", fontSize: 13, fontWeight: 800, color: "var(--bark)", opacity: 0.7, marginBottom: 18 }}>
                   relative to <strong>{contextMember.name}</strong> {ROLES[contextMember.role]?.emoji}
                 </p>
               )}
               {filteredGroups.map(({ label, roles }) => (
                 <div key={label} className="role-group">
                   <div className="role-group__label">{label}</div>
                   {roles.map((r) => {
                     const infoObj = ROLES[r];
                     const sel  = role === r;
                     return (
                       <button key={r} type="button"
                         className={`role-btn ${sel ? "selected" : ""}`}
                         style={{ background: sel ? infoObj.color : "var(--white)" }}
                         onClick={() => handleRoleChange(r)}>
                         <span className="role-btn__emoji">{infoObj.emoji}</span>
                         <div>
                           <div className="role-btn__name">{infoObj.label}</div>
                           <div className="role-btn__desc">{ROLE_PICKER_DESC[r] || ""}</div>
                         </div>
                       </button>
                     );
                   })}
                 </div>
               ))}

               {/* Parent Selection for Cousin/In-Laws */}
               {needsParent && (
                 <div style={{ marginTop: 24, padding: 16, background: "var(--cream-dk)", borderRadius: 16, border: "2px solid var(--bark)" }}>
                   <label className="modal__label" style={{ textAlign: "center", marginBottom: 12 }}>
                     {role === "cousin" ? "Which Aunt or Uncle is their parent? 👪" : "Who are they partnered with? 💍"}
                   </label>
                   {eligibleParents.length === 1 ? (
                     <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: "var(--r-md)", background: ROLES[eligibleParents[0].role]?.color || "var(--cream)", border: "2px solid var(--bark)", opacity: 0.9 }}>
                       <span style={{ fontSize: 22 }}>{ROLES[eligibleParents[0].role]?.emoji}</span>
                       <div>
                         <div style={{ fontWeight: 900, fontSize: 13, color: "var(--bark)" }}>{eligibleParents[0].name}</div>
                         <div style={{ fontSize: 10, opacity: 0.7, color: "var(--bark)" }}>Auto-selected ✓</div>
                       </div>
                     </div>
                   ) : (
                     <div className="role-list">
                       {eligibleParents.map((p) => (
                         <button key={p.id} type="button"
                           className={`role-btn ${parentId === p.id ? "selected" : ""}`}
                           style={{ background: parentId === p.id ? ROLES[p.role]?.color : "var(--white)" }}
                           onClick={() => handleParentChange(p.id)}>
                           <span className="role-btn__emoji">{ROLES[p.role]?.emoji}</span>
                           <div>
                             <div className="role-btn__name">{p.name}</div>
                             <div className="role-btn__desc">{ROLES[p.role]?.label}</div>
                           </div>
                         </button>
                       ))}
                     </div>
                   )}
                 </div>
               )}
             </div>
           )}

           {/* STEP 2: What is their name? */}
           {step === 2 && (
             <div style={{ textAlign: "center", padding: "20px 0" }}>
               <h2 className="modal__title" style={{ marginBottom: 32 }}>
                 {role === "self" ? "What is your name? ✨" : "What is their name? ✨"}
               </h2>
               <input
                 autoFocus
                 className="modal__input"
                 value={name}
                 onChange={(e) => setName(e.target.value)}
                 placeholder={role === "self" ? "Type your name here…" : "Type their name here…"}
                 maxLength={18}
                 onKeyDown={(e) => { if (e.key === "Enter" && name.trim()) handleNext(); }}
                 style={{ fontSize: 24, padding: "24px", textAlign: "center", borderRadius: 20 }}
               />
             </div>
           )}

           {/* STEP 3: Pick their look! */}
           {step === 3 && (
             <div>
               <h2 className="modal__title" style={{ textAlign: "center", marginBottom: 20 }}>
                 {role === "self" ? "Pick your look! 🌟" : "Pick their look! 🌟"}
               </h2>
               <div style={{ border: "4px dashed var(--peach)", padding: "20px", borderRadius: 24, background: "var(--white)" }}>
                 <div className="avatar-grid-wrap" style={{ margin: 0, paddingRight: 8 }}>
                   {Object.entries(AVATARS).filter(([cat]) => allowedAvatars.includes(cat)).map(([cat, emojis]) => (
                     <div key={cat}>
                       <span className="avatar-cat-label">{cat}</span>
                       <div className="avatar-row">
                         {emojis.map((a) => (
                           <button key={a} className={`avatar-btn ${avatar === a ? "selected" : ""}`}
                             onClick={() => handleAvatarChange(a)} type="button" style={{ fontSize: 36, width: 68, height: 68 }}>
                             {a}
                           </button>
                         ))}
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             </div>
           )}

           {/* STEP 4: Fun Fact or Info */}
           {step === 4 && (
             <div style={{ textAlign: "center", padding: "20px 0" }}>
               <h2 className="modal__title" style={{ marginBottom: 32 }}>Fun Fact or Info (optional) 💡</h2>
               <input
                 autoFocus
                 className="modal__input"
                 value={info}
                 onChange={(e) => setInfo(e.target.value)}
                 placeholder="e.g. Loves baking, Lives in London..."
                 maxLength={60}
                 onKeyDown={(e) => { if (e.key === "Enter") handleNext(); }}
                 style={{ fontSize: 18, padding: "24px", textAlign: "center", borderRadius: 20, border: "4px solid var(--sky-deep)" }}
               />
             </div>
           )}

           {/* STEP 5: Save & Celebrate! */}
           {step === 5 && (
             <div style={{ textAlign: "center", padding: "30px 0", animation: "bounce-in 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)" }}>
               <div style={{ fontSize: 80, animation: "bob 2s infinite alternate", marginBottom: 16 }}>🎉</div>
               <h2 className="modal__title" style={{ fontSize: 36, marginBottom: 16 }}>All set! 🌟</h2>
               <p style={{ color: "var(--woodDk)", fontSize: 18, fontWeight: 800, marginBottom: 40 }}>
                 {role === "self" ? (
                   "Ready to add yourself to your Magic Forest?"
                 ) : (
                   <>Ready to add <strong style={{ color: "var(--bark)" }}>{name || "them"}</strong> to your Magic Forest?</>
                 )}
               </p>
               <button className="btn btn--green btn--lg" onClick={handleSave} type="button" style={{ fontSize: 28, padding: "24px 48px", width: "100%", borderRadius: 24, boxShadow: "0 8px 0 #05B88A" }}>
                 ✅ Save & Plant!
               </button>
             </div>
           )}
        </div>

        {/* Footer Navigation Buttons */}
        {step < 5 && (
          <div className="modal__btn-row" style={{ marginTop: 24 }}>
            {step > (hasNoSelf ? 2 : 1) ? (
              <button className="btn btn--ghost" onClick={handleBack} type="button" style={{ padding: "16px", flex: 1, borderRadius: 20, fontSize: 18 }}>
                ⬅️ Back
              </button>
            ) : (
              <div style={{ flex: 1 }} />
            )}
            
            <button 
              className="btn btn--sun" 
              onClick={handleNext} 
              disabled={isNextDisabled()}
              type="button"
              style={{ padding: "16px", flex: 1, borderRadius: 20, fontSize: 18, background: isNextDisabled() ? "var(--cream-dk)" : "var(--sun)" }}
            >
              Next ➡️
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
