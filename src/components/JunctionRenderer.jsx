import { C } from "../constants.js";
import { sfx } from "../lib/audio.js";

// ─── Visual tokens ────────────────────────────────────────────────────────────
const BRIDGE_COLOR = "#C8A8FF";  // soft lavender — couple bond
const TRUNK_COLOR  = "#4DB8E8";  // sky blue — descent line
const DIST_COLOR   = "#4DB8E8";  // same — distributor bar
const DROP_COLOR   = "#78D4FF";  // lighter blue — individual drops

// ─── SVG: Couple bridge line ──────────────────────────────────────────────────
// Draws the horizontal line connecting Partner1 ← 💕 → Partner2
function BridgeLine({ edge }) {
  const mx = (edge.x1 + edge.x2) / 2;
  const my = (edge.y1 + edge.y2) / 2;
  return (
    <g>
      {/* shadow */}
      <line x1={edge.x1} y1={edge.y1} x2={edge.x2} y2={edge.y2}
        stroke="#C4B4A4" strokeWidth={7} opacity={0.18} />
      {/* main couple line */}
      <line x1={edge.x1} y1={edge.y1} x2={edge.x2} y2={edge.y2}
        stroke={BRIDGE_COLOR} strokeWidth={4} opacity={0.9} />
      {/* heart decoration at midpoint */}
      <text x={mx} y={my + 5} textAnchor="middle" fontSize={14}
        style={{ userSelect: "none", pointerEvents: "none" }}>
        💕
      </text>
    </g>
  );
}

// ─── SVG: Trunk (vertical line from junction down to distributor) ─────────────
function TrunkLine({ edge }) {
  return (
    <line
      x1={edge.x} y1={edge.y1}
      x2={edge.x} y2={edge.y2}
      stroke={TRUNK_COLOR} strokeWidth={4.5} opacity={0.85}
      strokeLinecap="round"
    />
  );
}

// ─── SVG: Distributor bar (horizontal bar spanning all children) ──────────────
function DistributorBar({ edge }) {
  return (
    <>
      {/* shadow */}
      <line x1={edge.x1} y1={edge.y + 3} x2={edge.x2} y2={edge.y + 3}
        stroke="#C4B4A4" strokeWidth={5} opacity={0.2} />
      {/* bar */}
      <line x1={edge.x1} y1={edge.y} x2={edge.x2} y2={edge.y}
        stroke={DIST_COLOR} strokeWidth={4} opacity={0.85}
        strokeLinecap="round" />
    </>
  );
}

// ─── SVG: Drop line (vertical from distributor bar down to child card) ─────────
function DropLine({ edge }) {
  return (
    <>
      <line x1={edge.x} y1={edge.y1} x2={edge.x} y2={edge.y2}
        stroke={DROP_COLOR} strokeWidth={3.5} opacity={0.8}
        strokeLinecap="round" />
      {/* connector dot at distributor junction */}
      <circle cx={edge.x} cy={edge.y1} r={5.5}
        fill={DIST_COLOR} stroke={C.white} strokeWidth={1.5} opacity={0.95} />
    </>
  );
}

// ─── SVG: Junction node ───────────────────────────────────────────────────────
// The junction dot IS the expand/collapse toggle button.
// No children → plain gold dot
// Has children + expanded → orange dot with − symbol (click to collapse)
// Has children + collapsed → green dot with + symbol (click to expand)
function JunctionDot({ junc, pos, isExpanded, onToggle }) {
  const hasChildren  = junc.childIds.length > 0;
  const isToggleable = hasChildren && !junc.isMain; // only secondary junctions toggle
  const color        = !hasChildren   ? C.sun
                     : isExpanded     ? "#FF9A5C"   // peach = expanded
                                      : C.grass;    // green = collapsed (invite to click)

  return (
    <g
      transform={`translate(${pos.x},${pos.y})`}
      onClick={() => { if (isToggleable) { sfx("pop"); onToggle(junc.id); } }}
      style={{ cursor: isToggleable ? "pointer" : "default" }}
    >
      {/* Pulse ring for toggleable nodes that are collapsed */}
      {isToggleable && !isExpanded && (
        <circle r={20} fill={C.grass} opacity={0.2}
          style={{ animation: "pulse-ring 2s ease-out infinite" }} />
      )}

      {/* Icon/Dot */}
      {isToggleable ? (
        <>
          <circle r={13} fill={color} stroke={C.bark} strokeWidth={2.5} />
          <text textAnchor="middle" y={5}
            fontSize={16} fontWeight="900" fill={C.white}
            fontFamily="Nunito,sans-serif"
            style={{ userSelect: "none", pointerEvents: "none" }}>
            {isExpanded ? "−" : "+"}
          </text>
        </>
      ) : (
        // Distinctive child-friendly icon for marriage union
        <>
          <circle r={14} fill={C.cream} stroke={C.rose} strokeWidth={2.5} />
          <text textAnchor="middle" y={5}
            fontSize={14}
            style={{ userSelect: "none", pointerEvents: "none" }}>
            💍
          </text>
        </>
      )}
    </g>
  );
}

// ─── Master JunctionRenderer ──────────────────────────────────────────────────
// Renders ALL junction visual elements:
//   edges (bridge / trunk / distributor / drops) in correct Z-order
//   then junction dots on top
export function JunctionRenderer({ junctions, juncPos, edges, expandedJunctions, onToggle }) {
  return (
    <g>
      {/* ── Layer 1: all edge lines ── */}
      {edges.map((e, i) => {
        switch (e.type) {
          case "bridge":      return <BridgeLine    key={i} edge={e} />;
          case "trunk":       return <TrunkLine      key={i} edge={e} />;
          case "distributor": return <DistributorBar key={i} edge={e} />;
          case "drop":        return <DropLine       key={i} edge={e} />;
          default:            return null;
        }
      })}

      {/* ── Layer 2: junction dots on top so they're always clickable ── */}
      {junctions.map((j) => {
        const jp = juncPos[j.id];
        if (!jp) return null;
        // Only render junction dot if it has 2+ parents (couple) or has children
        const shouldShow = j.parentIds.length >= 2 || j.childIds.length > 0;
        if (!shouldShow) return null;
        return (
          <JunctionDot
            key={j.id}
            junc={j}
            pos={jp}
            isExpanded={expandedJunctions.has(j.id)}
            onToggle={onToggle}
          />
        );
      })}
    </g>
  );
}
