import { useState, useEffect, useRef, useCallback, useMemo } from "react";

import "./index.css";

import { C, ROLES, GEN_NAMES, getQuest, BLOODLINE_ROLES, IN_LAW_ROLES } from "./constants.js";
import { sfx, confetti } from "./lib/audio.js";
import { saveTree, loadTree, uid } from "./lib/storage.js";
import {
  buildJunctions,
  buildLayout,
  buildJunctionEdges,
  getInitialExpanded,
  getVisibleMemberIds,
  CANVAS_CX,
} from "./lib/layout.js";
import { getCousinShortLabel, getCousinExplainer } from "./lib/cousins.js";
import { usePinchZoom }      from "./hooks/usePinchZoom.js";
import { JunctionRenderer }  from "./components/JunctionRenderer.jsx";

import { Welcome }     from "./components/Welcome.jsx";
import { InfoPanel }   from "./components/InfoPanel.jsx";
import { MemberModal } from "./components/MemberModal.jsx";
import { AdultPanel }  from "./components/AdultPanel.jsx";
import { TourOverlay } from "./components/TourOverlay.jsx";

// ─── SVG: Generation row labels ───────────────────────────────────────────────
function GenLabels({ members, pos }) {
  const seen   = new Set();
  const labels = [];
  members.forEach((m) => {
    const g = ROLES[m.role]?.gen ?? 0;
    if (!seen.has(g) && pos[m.id] && GEN_NAMES[g]) {
      labels.push({ g, y: pos[m.id].y, label: GEN_NAMES[g] });
      seen.add(g);
    }
  });
  return (
    <g>
      {labels.map(({ g, y, label }) => (
        <g key={g}>
          <rect x={10} y={y - 80} width={228} height={26} rx={8}
            fill={C.cream} stroke={C.bark} strokeWidth={1} opacity={0.55} />
          <text x={20} y={y - 63}
            fontSize={11} fill={C.bark} opacity={0.7} fontWeight="800" fontFamily="Nunito,sans-serif">
            {label}
          </text>
        </g>
      ))}
    </g>
  );
}

// ─── SVG: Member card node ────────────────────────────────────────────────────
// Phase 2: Non-bloodline members (in-laws) get a dashed border + 💍 badge
// Phase 3: Cousins with parentId show "Bob's Kid" on the role badge instead of "Cousin"
function MemberCard({ member, pos, isSelected, onCardClick, labelOverride, isJunctionOpen }) {
  const role       = ROLES[member.role] || ROLES.self;
  const { x, y }  = pos;
  const isSelf     = member.role === "self";
  const isBloodline = BLOODLINE_ROLES.has(member.role);
  const isInLaw    = IN_LAW_ROLES.has(member.role);
  const isAuntUncle = member.role === "aunt" || member.role === "uncle";

  const short = member.name.length > 12
    ? member.name.slice(0, 11) + "…"
    : member.name;

  // Phase 3: badge text — dynamic cousin label OR standard role label
  const badgeText = labelOverride || role.label;

  return (
    <g
      transform={`translate(${x},${y})`}
      onClick={() => onCardClick(member)}
      style={{ cursor: "pointer" }}
      aria-label={`${member.name}, ${role.label}`}
    >
      {/* Selection glow ring */}
      {isSelected && (
        <>
          <circle r={68} fill={role.color} opacity={0.18} />
          <circle r={68} fill="none" stroke={role.color} strokeWidth={3}
            opacity={0.6} style={{ animation: "pulse-ring 1.6s ease-out infinite" }} />
        </>
      )}

      {/* Phase 1: Aunt/Uncle expansion active → soft green outline to signal "family is visible" */}
      {isAuntUncle && isJunctionOpen && !isSelected && (
        <circle r={66} fill="none" stroke={C.grass} strokeWidth={2.5}
          strokeDasharray="5 4" opacity={0.55}
          style={{ animation: "pulse-ring 3s ease-out infinite" }} />
      )}

      {/* Self sunburst dashed ring */}
      {isSelf && !isSelected && (
        <circle r={64} fill="none" stroke={C.sunGlow} strokeWidth={2.5}
          strokeDasharray="6 4" opacity={0.6}
          style={{ animation: "spin-slow 12s linear infinite" }} />
      )}

      {/* Card shadow */}
      <rect x={-56} y={-62} width={112} height={120} rx={30}
        fill={C.bark} opacity={0.13} transform="translate(3,6)" />

      {/* Phase 2: Card body — in-laws get dashed border for visual hierarchy distinction */}
      <rect x={-56} y={-62} width={112} height={120} rx={30}
        fill={role.color}
        stroke={isSelf ? C.sunGlow : (isSelected ? C.bark : (isInLaw ? C.inLaw : C.white))}
        strokeWidth={isSelf ? 4 : (isSelected ? 5 : (isInLaw ? 3 : 3.5))}
        strokeDasharray={isInLaw ? "8 4" : undefined} />

      {/* Inner cream panel — slightly tinted for in-laws */}
      <rect x={-46} y={-52} width={92} height={100} rx={24}
        fill={isInLaw ? "#F0EBFF" : C.cream} opacity={0.88}
        stroke={role.color} strokeWidth={1.5} />

      {/* Avatar */}
      <text textAnchor="middle" y={6} fontSize={42} style={{ userSelect: "none" }}>
        {member.avatar}
      </text>

      {/* Name */}
      <text textAnchor="middle" y={30}
        fontSize={11.5} fontWeight="900" fill={C.bark} fontFamily="Nunito,sans-serif">
        {short}
      </text>

      {/* Role badge (Phase 3: uses labelOverride for cousins) */}
      <rect x={-42} y={36} width={84} height={17} rx={8.5} fill={role.color} opacity={0.92} />
      <text textAnchor="middle" y={47.5}
        fontSize={8.5} fontWeight="900" fill={C.woodDk} fontFamily="Nunito,sans-serif">
        {badgeText}
      </text>

      {/* Phase 2: In-law 💍 indicator at top-right corner */}
      {isInLaw && (
        <>
          <circle cx={46} cy={-48} r={13} fill={C.inLaw} stroke={C.white} strokeWidth={2} opacity={0.95} />
          <text textAnchor="middle" x={46} y={-43} fontSize={12} style={{ userSelect: "none" }}>💍</text>
        </>
      )}

      {/* Phase 1: Aunt/Uncle — small "family" hint icon when junction is collapsed */}
      {isAuntUncle && !isJunctionOpen && (
        <text textAnchor="middle" x={-46} y={-48} fontSize={11} opacity={0.7}
          style={{ userSelect: "none" }}>👪</text>
      )}

      {/* Selected star badge */}
      {isSelected && (
        <>
          <circle cx={50} cy={-46} r={14} fill={C.sun} stroke={C.bark} strokeWidth={2.5} />
          <text textAnchor="middle" x={50} y={-41} fontSize={13}>⭐</text>
        </>
      )}
    </g>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [members,           setMembers]           = useState(null);
  const [modal,             setModal]             = useState(null);
  const [selected,          setSelected]          = useState(null);
  const [screen,            setScreen]            = useState("loading");
  const [hasSaved,          setHasSaved]          = useState(false);
  const [toast,             setToast]             = useState("");
  const [offset,            setOffset]            = useState({ x: 0, y: 0 });
  const [zoom,              setZoom]              = useState(1);
  const [showHint,          setShowHint]          = useState(false);
  const [confirmHome,       setConfirmHome]       = useState(false);
  const [tourStep,          setTourStep]          = useState(0);
  // Phase 1 + 3: expandedJunctions — Set of junction IDs that have been opened
  const [expandedJunctions, setExpandedJunctions] = useState(() => new Set());

  const dragging     = useRef(false);
  const dragStart    = useRef(null);
  const dragMoved    = useRef(false);
  const canvasRef    = useRef(null);
  const toastTimer   = useRef(null);
  const memberCntRef = useRef(0);
  const prevQuestPct = useRef(0);

  usePinchZoom(canvasRef, zoom, setZoom);

  // ── Load ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    loadTree().then((data) => {
      if (data?.length) { setMembers(data); setHasSaved(true); memberCntRef.current = data.length; }
      else setMembers([]);
      setScreen("welcome");
    });
  }, []);

  // ── Auto-save ─────────────────────────────────────────────────────────────
  useEffect(() => { if (members !== null) saveTree(members); }, [members]);

  // ── Hint auto-hide ────────────────────────────────────────────────────────
  useEffect(() => {
    if (screen === "tree") {
      setShowHint(true);
      const t = setTimeout(() => setShowHint(false), 7000);
      return () => clearTimeout(t);
    }
  }, [screen]);

  // ── Tour auto-start ────────────────────────────────────────────────────────
  useEffect(() => {
    if (members?.length > 0 && !localStorage.getItem("magic_tour_done")) {
      const t = setTimeout(() => setTourStep(1), 600);
      return () => clearTimeout(t);
    }
  }, [members]);

  const completeTour = useCallback(() => {
    localStorage.setItem("magic_tour_done", "true");
    setTourStep(0);
  }, []);

  // ── Phase 1: Seed expansion state on member change ─────────────────────────
  // Merges newly required main-line junctions into the expansion Set.
  // User-opened dynamic junctions (aunt/uncle families) are preserved.
  useEffect(() => {
    if (!members) return;
    const junctions = buildJunctions(members);
    const initial   = getInitialExpanded(junctions);
    setExpandedJunctions((prev) => {
      const next = new Set(prev);
      initial.forEach((id) => next.add(id));
      return next;
    });
  }, [members]);

  // ── Quest 100% celebration ────────────────────────────────────────────────
  useEffect(() => {
    if (!members) return;
    const quest = getQuest(members);
    if (quest.pct === 100 && prevQuestPct.current < 100) { confetti(); sfx("chime"); flash("🌈 Amazing! Quest complete! 🎉"); }
    prevQuestPct.current = quest.pct;
  }, [members]); // eslint-disable-line

  // ── Toast ─────────────────────────────────────────────────────────────────
  const flash = useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2600);
  }, []);

  // ── CRUD ──────────────────────────────────────────────────────────────────
  const addMember = useCallback((data) => {
    const isFirst = memberCntRef.current === 0;
    // parentId from MemberModal is included in data if present
    setMembers((p) => [...p, { id: uid(), ...data }]);
    memberCntRef.current += 1;
    setModal(null);
    flash("🌿 Added to your forest!");
    if (isFirst) setTimeout(() => { setOffset({ x: 0, y: 0 }); setZoom(1); }, 80);
  }, [flash]);

  const editMember = useCallback((data) => {
    setMembers((p) => p.map((m) => (m.id === modal?.id ? { ...m, ...data } : m)));
    setModal(null);
    setSelected(null);
    flash("✅ Saved!");
  }, [modal, flash]);

  const deleteMember = useCallback(() => {
    memberCntRef.current = Math.max(0, memberCntRef.current - 1);
    setMembers((p) => p.filter((m) => m.id !== modal?.id));
    setModal(null);
    setSelected(null);
    flash("🗑️ Removed!");
  }, [modal, flash]);

  // ── Phase 1: Toggle junction expansion ────────────────────────────────────
  const handleToggleJunction = useCallback((juncId) => {
    setExpandedJunctions((prev) => {
      const next = new Set(prev);
      if (next.has(juncId)) next.delete(juncId);
      else next.add(juncId);
      return next;
    });
  }, []);

  // ── Drag — mouse ──────────────────────────────────────────────────────────
  const startDrag = useCallback((cx, cy) => {
    dragging.current = true; dragMoved.current = false;
    dragStart.current = { cx, cy, ox: offset.x, oy: offset.y };
  }, [offset]);

  const moveDrag = useCallback((cx, cy) => {
    if (!dragging.current || !dragStart.current) return;
    const { cx: sx, cy: sy, ox, oy } = dragStart.current;
    const dx = cx - sx, dy = cy - sy;
    if (Math.hypot(dx, dy) > 8) { dragMoved.current = true; setOffset({ x: ox + dx, y: oy + dy }); }
  }, []);

  const endDrag = useCallback(() => { dragging.current = false; }, []);

  // ── Drag — touch ──────────────────────────────────────────────────────────
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    let touchId = null, sx = 0, sy = 0, ox = 0, oy = 0;
    function onTouchStart(e) {
      if (e.touches.length !== 1) return;
      const t = e.touches[0]; touchId = t.identifier; sx = t.clientX; sy = t.clientY;
      dragMoved.current = false;
      setOffset((prev) => { ox = prev.x; oy = prev.y; return prev; });
    }
    function onTouchMove(e) {
      if (e.touches.length !== 1) return;
      const t = Array.from(e.touches).find((tt) => tt.identifier === touchId);
      if (!t) return;
      const dx = t.clientX - sx, dy = t.clientY - sy;
      if (Math.hypot(dx, dy) > 8) { dragMoved.current = true; e.preventDefault(); setOffset({ x: ox + dx, y: oy + dy }); }
    }
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove",  onTouchMove,  { passive: false });
    return () => { el.removeEventListener("touchstart", onTouchStart); el.removeEventListener("touchmove", onTouchMove); };
  }, [canvasRef]);

  // ── Zoom ──────────────────────────────────────────────────────────────────
  const zoomIn   = () => { sfx("pop"); setZoom((z) => Math.min(z + 0.15, 2.5)); };
  const zoomOut  = () => { sfx("pop"); setZoom((z) => Math.max(z - 0.15, 0.4)); };
  const recenter = () => { sfx("pop"); setOffset({ x: 0, y: 0 }); setZoom(1); };
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const onWheel = (e) => { e.preventDefault(); setZoom((z) => Math.min(2.5, Math.max(0.4, z - e.deltaY * 0.003))); };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [canvasRef]);

  // ── Phase 1: Card click — triggers expansion on Aunt/Uncle first selection ──
  const handleCardClick = useCallback((mem) => {
    if (dragMoved.current) return;
    sfx("pop");

    // Toggle the aunt/uncle's sub-tree on FIRST click (not on second "open modal" click)
    if ((mem.role === "aunt" || mem.role === "uncle") && selected?.id !== mem.id) {
      const juncId = `junc_${mem.role}_${mem.id}`;
      setExpandedJunctions((prev) => {
        const next = new Set(prev);
        if (next.has(juncId)) next.delete(juncId);
        else next.add(juncId);
        return next;
      });
    }

    // Normal selection flow
    if (selected?.id === mem.id) { setModal(mem); setSelected(null); }
    else setSelected(mem);
  }, [selected]);

  // ── Phase 1 + 2 + 3: Layout computation ───────────────────────────────────
  const junctions = useMemo(() => members ? buildJunctions(members) : [], [members]);

  const { pos, juncPos } = useMemo(
    () => members ? buildLayout(members, junctions) : { pos: {}, juncPos: {} },
    [members, junctions]
  );

  const visibleIds     = useMemo(
    () => members ? getVisibleMemberIds(members, junctions, expandedJunctions) : new Set(),
    [members, junctions, expandedJunctions]
  );

  const visibleMembers = useMemo(
    () => members ? members.filter((m) => visibleIds.has(m.id)) : [],
    [members, visibleIds]
  );

  const junctionEdges = useMemo(
    () => buildJunctionEdges(junctions, pos, juncPos, expandedJunctions),
    [junctions, pos, juncPos, expandedJunctions]
  );

  // ── Phase 3: Cousin label overrides ───────────────────────────────────────
  const { labelOverrides, explainerOverrides } = useMemo(() => {
    const labelOvr     = {};
    const explainerOvr = {};
    members?.forEach((m) => {
      if (m.role === "cousin" && m.parentId) {
        const short = getCousinShortLabel(m, members);
        if (short) labelOvr[m.id] = short;
        explainerOvr[m.id] = getCousinExplainer(m, members);
      }
    });
    return { labelOverrides: labelOvr, explainerOverrides: explainerOvr };
  }, [members]);

  // ── Helper: is a given aunt/uncle junction currently open? ─────────────────
  const isJunctionOpen = useCallback((member) => {
    if (member.role !== "aunt" && member.role !== "uncle") return false;
    return expandedJunctions.has(`junc_${member.role}_${member.id}`);
  }, [expandedJunctions]);

  const quest = members ? getQuest(members) : { text: "", pct: 0 };

  // SVG canvas size (based on visible nodes only)
  const visiblePos = Object.entries(pos).filter(([id]) => visibleIds.has(id)).map(([, p]) => p);
  const allX = visiblePos.map((p) => p.x);
  const allY = visiblePos.map((p) => p.y);
  const svgW = allX.length ? Math.max(...allX) + 340 : 1200;
  const svgH = allY.length ? Math.max(...allY) + 280 : 1100;

  const hasNoSelf = !members?.some((m) => m.role === "self");

  if (screen === "loading") return null;
  if (screen === "welcome") {
    return (
      <Welcome hasSaved={hasSaved} savedCount={members?.length || 0}
        onStart={() => { 
          localStorage.removeItem("magic_tour_done");
          setMembers([]); 
          memberCntRef.current = 0; 
          setScreen("tree"); 
        }}
        onLoad={() => setScreen("tree")} />
    );
  }

  // ── Tree view ─────────────────────────────────────────────────────────────
  return (
    <div className="app-shell">
      {/* ── Header ── */}
      <header className="app-header">
        <button className="home-btn" aria-label="Go to home screen"
          onClick={() => { if (members?.length > 0) setConfirmHome(true); else { sfx("pop"); setScreen("welcome"); } }}>
          🏠
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 className="app-header__title">My Magic Tree!</h1>
          <p className="app-header__subtitle">
            🏡 {members?.length || 0} relative{members?.length !== 1 ? "s" : ""} in your forest
          </p>
        </div>
        <div className="app-header__actions">
          <button className="btn btn--sun btn--sm" aria-label="Add a family member"
            onClick={() => { sfx("pop"); setModal("add"); }}>➕ Add</button>
          <button className="adult-btn" aria-label="Adult settings"
            onClick={() => { sfx("pop"); setModal("adult"); }}>🔒</button>
        </div>
      </header>

      {/* ── Quest Banner ── */}
      <div className="quest-banner">
        <span className="quest-banner__text">{quest.text}</span>
        <div className="quest-banner__bar-track">
          <div className="quest-banner__bar-fill" style={{ width: `${quest.pct}%` }} />
        </div>
      </div>

      {/* ── Canvas ── */}
      <div ref={canvasRef} className="canvas-area"
        style={{ cursor: dragging.current ? "grabbing" : "grab" }}
        onMouseDown={(e) => startDrag(e.clientX, e.clientY)}
        onMouseMove={(e) => moveDrag(e.clientX, e.clientY)}
        onMouseUp={endDrag} onMouseLeave={endDrag}>

        {/* Decorative background */}
        <div style={{ position:"absolute", bottom:12, right:28, fontSize:48, opacity:.08, pointerEvents:"none" }}>🌾🍄🌼</div>
        <div style={{ position:"absolute", top:14,   left:24,  fontSize:40, opacity:.08, pointerEvents:"none" }}>☁️</div>
        <div style={{ position:"absolute", top:10, right:"30%", fontSize:36, opacity:.06, pointerEvents:"none" }}>🦋</div>

        {!members?.length ? (
          <div className="empty-state">
            <div className="empty-state__icon">🌱</div>
            <h2 className="empty-state__title">Your Magic Forest is Empty!</h2>
            <p className="empty-state__text">Every great tree starts from one tiny seed. Add yourself first! 🌟</p>
            <button className="btn btn--green btn--lg" aria-label="Add yourself to start the tree"
              onClick={() => { sfx("chime"); setModal("add"); }}>🌱 Plant Myself Here!</button>
          </div>
        ) : (
          <svg className="canvas-svg" width={svgW} height={svgH}
            style={{ minWidth: "100%", minHeight: "100%" }}>
            <rect width="100%" height="100%" fill="transparent" />
            <g transform={`translate(${offset.x},${offset.y}) scale(${zoom})`}>

              {/* Generation row labels */}
              <GenLabels members={visibleMembers} pos={pos} />

              {/* Phase 1: Junction-routed edges (rendered under cards) */}
              <JunctionRenderer
                junctions={junctions}
                juncPos={juncPos}
                edges={junctionEdges}
                expandedJunctions={expandedJunctions}
                onToggle={handleToggleJunction}
              />

              {/* Phase 2 + 3: Member cards — filtered to visible only */}
              {visibleMembers.map((m) => (
                <MemberCard
                  key={m.id}
                  member={m}
                  pos={pos[m.id] || { x: CANVAS_CX, y: 800 }}
                  isSelected={selected?.id === m.id}
                  onCardClick={handleCardClick}
                  labelOverride={labelOverrides[m.id]}      // Phase 3: "Bob's Kid"
                  isJunctionOpen={isJunctionOpen(m)}         // Phase 1: glow when expanded
                />
              ))}
            </g>
          </svg>
        )}

        {/* Zoom controls */}
        {members?.length > 0 && (
          <div className="zoom-controls">
            <button className="zoom-btn" aria-label="Zoom in"       onClick={zoomIn}>+</button>
            <button className="zoom-btn" aria-label="Zoom out"      onClick={zoomOut}>−</button>
            <button className="zoom-btn zoom-btn--center" aria-label="Re-centre" onClick={recenter}>🎯</button>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && <div className="toast" role="status" aria-live="polite">{toast}</div>}

      {/* Info panel — Phase 3: passes dynamic cousin explainer */}
      {selected && !modal && (
        <InfoPanel
          member={selected}
          onEdit={() => { setModal(selected); setSelected(null); }}
          onClose={() => setSelected(null)}
          explainerOverride={explainerOverrides[selected.id]}   // Phase 3
          relationLabel={labelOverrides[selected.id]}           // Phase 3
        />
      )}

      {/* Hint — updated to mention the tap-to-reveal affordance */}
      {members?.length > 0 && !selected && !modal && showHint && (
        <div className="hint">
          ✨ Tap any card · Tap 👪 Aunt or Uncle to reveal their family · Drag to explore
        </div>
      )}

      {/* Confirm home */}
      {confirmHome && (
        <div className="overlay" onClick={() => setConfirmHome(false)}>
          <div className="modal" style={{ maxWidth: 340 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal__drag-handle" />
            <h2 className="modal__title">🏠 Go to Home?</h2>
            <p style={{ textAlign:"center", color:"#8C7A6B", fontWeight:700, fontSize:14, marginBottom:20, lineHeight:1.5 }}>
              Don't worry — your tree is saved! 🌳 You can come back anytime.
            </p>
            <div className="modal__btn-row">
              <button className="btn btn--sun"
                onClick={() => { sfx("chime"); setConfirmHome(false); setScreen("welcome"); }}>
                🏠 Yes, Go Home!
              </button>
              <button className="btn btn--ghost"
                onClick={() => { sfx("pop"); setConfirmHome(false); }}
                style={{ flex:"0 0 auto", padding:"12px 16px" }}>✕</button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {modal === "add" && (
        <MemberModal member={null} allMembers={members} hasNoSelf={hasNoSelf}
          onSave={addMember} onDelete={() => {}} onClose={() => setModal(null)} />
      )}
      {modal && modal !== "add" && modal !== "adult" && (
        <MemberModal member={modal} allMembers={members} hasNoSelf={false}
          onSave={editMember} onDelete={deleteMember} onClose={() => setModal(null)} />
      )}
      {modal === "adult" && (
        <AdultPanel members={members || []}
          onImport={(data) => { setMembers(data); memberCntRef.current = data.length; flash("📂 Tree restored!"); }}
          onClose={() => setModal(null)} />
      )}

      {/* Onboarding Tour Overlay */}
      <TourOverlay
        step={tourStep}
        onNext={() => setTourStep((s) => s + 1)}
        onFinish={completeTour}
      />
    </div>
  );
}
