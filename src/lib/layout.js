import { ROLES, IN_LAW_ROLES } from "../constants.js";

// ─── Phase 2: Strict generational Y-axis stratification ───────────────────────
export const GEN_Y = {
  "-3": 110,
  "-2": 340,
  "-1": 570,
   "0": 800,
   "1": 1030,
};

export const CANVAS_CX   = 640;
export const COL_W       = 210;
const TRUNK_OFFSET       = 115;

// ─── Left-to-right ordering (in-laws excluded from this ordering) ─────────────
const ORDER = {
  great_grandma: 0, great_grandpa: 1,
  grandma: 0,       grandpa: 1,
  aunt: 0, mom: 1,  dad: 2, uncle: 3,
  sister: 0, self: 1, brother: 2, spouse: 3, cousin: 4,
  daughter: 0, son: 1, pet: 2,
};

// ─── Phase 1: Build junctions ─────────────────────────────────────────────────
//
// STATIC main-line junctions (grandparents → parents → self → children)
//   always visible, always expanded.
//
// DYNAMIC per-member junctions for each aunt and uncle:
//   id = `junc_aunt_${aunt.id}` or `junc_uncle_${uncle.id}`
//   parentIds = [aunt.id, aunt_partner.id?]   (in-law partner is parentIds[1])
//   childIds  = cousins where cousin.parentId === aunt.id
//   isMain    = false → starts collapsed, only reveals on expansion
//
// This gives each aunt/uncle their own isolated marriage bridge + descendant sub-tree.
export function buildJunctions(members) {
  const byRole = {};
  members.forEach((m) => (byRole[m.role] = byRole[m.role] || []).push(m));

  const junctions = [];

  // ── Static main-line definitions ────────────────────────────────────────────
  const MAIN_DEFS = [
    {
      id:          "junc_ggp",
      parentRoles: ["great_grandma", "great_grandpa"],
      childRoles:  ["grandpa"], // Rule 1: Bypasses Grandma entirely
      isMain:      true,
    },
    {
      id:          "junc_gp",
      parentRoles: ["grandma", "grandpa"],
      // Rule 2: Exclude Mom from Grandparents' bloodline descent
      childRoles:  ["dad", "aunt", "uncle"],
      isMain:      true,
    },
    {
      id:          "junc_parents",
      parentRoles: ["mom", "dad"],
      // Rule 3: Vertical line down to our generation drops strictly from Mom-Dad bridge
      childRoles:  ["self", "sister", "brother"],
      isMain:      true,
    },
    {
      id:          "junc_family",
      parentRoles: ["self", "spouse"],
      childRoles:  ["daughter", "son", "pet"],
      isMain:      true,
    },
  ];

  MAIN_DEFS.forEach((def) => {
    const parents = def.parentRoles.flatMap((r) => byRole[r] || []);
    if (parents.length === 0) return;
    // Exclude cousins-with-parentId from any generic pool (they belong to dynamic junctions)
    const children = def.childRoles
      .flatMap((r) => byRole[r] || [])
      .filter((m) => !(m.role === "cousin" && m.parentId));
    const gen = ROLES[def.parentRoles[0]]?.gen ?? 0;
    junctions.push({ id: def.id, parentIds: parents.map((m) => m.id), childIds: children.map((m) => m.id), gen, isMain: true });
  });

  // ── Dynamic per-member aunt/uncle junctions ─────────────────────────────────
  const allAunts    = byRole["aunt"]          || [];
  const allUncles   = byRole["uncle"]         || [];
  const allInLaws   = [
    ...(byRole["aunt_partner"]  || []),
    ...(byRole["uncle_partner"] || []),
  ];
  const allCousins  = byRole["cousin"] || [];

  [...allAunts, ...allUncles].forEach((relative) => {
    const partnerRole = relative.role === "aunt" ? "aunt_partner" : "uncle_partner";

    // Partner: must have parentId pointing to this specific aunt/uncle
    const partner = allInLaws.find(
      (p) => p.role === partnerRole && p.parentId === relative.id
    );

    // Cousins: must have parentId pointing to this specific aunt/uncle
    const myCousins = allCousins.filter((c) => c.parentId === relative.id);

    const parentIds = [relative.id, ...(partner ? [partner.id] : [])];

    junctions.push({
      id:        `junc_${relative.role}_${relative.id}`,
      parentIds,
      childIds:  myCousins.map((c) => c.id),
      gen:       -1,
      isMain:    false,
      ownerId:   relative.id,
      ownerRole: relative.role,
    });
  });

  // ── Orphan cousins (no parentId — legacy/unassigned): first available junction ─
  const assignedCousingIds = new Set(junctions.flatMap((j) => j.childIds));
  const orphans = allCousins.filter((c) => !c.parentId && !assignedCousingIds.has(c.id));
  if (orphans.length > 0) {
    const target = junctions.find((j) => j.ownerRole === "aunt" || j.ownerRole === "uncle");
    if (target) target.childIds.push(...orphans.map((c) => c.id));
  }

  return junctions;
}

// ─── Phase 3: Initial expansion = main-line only ──────────────────────────────
export function getInitialExpanded(junctions) {
  return new Set(junctions.filter((j) => j.isMain).map((j) => j.id));
}

// ─── Phase 2: Compute positions — 3-pass algorithm ───────────────────────────
//
// Pass 1 — Main bloodline members: standard generation-row grid (ORDER-based)
// Pass 2 — In-law partners: derived from spouse position, placed on OUTER side
//           (aunt_partner goes LEFT of aunt; uncle_partner goes RIGHT of uncle)
// Pass 3 — Cousins with parentId: placed under their specific aunt/uncle junction X
//           (uses junction midpoints computed between pass 2 & 3)
export function buildLayout(members, junctions) {
  // ── Classify members ────────────────────────────────────────────────────────
  const inLawMembers     = members.filter((m) => IN_LAW_ROLES.has(m.role));
  const parentIdCousins  = members.filter((m) => m.role === "cousin" && m.parentId);
  const mainMembers      = members.filter(
    (m) => !IN_LAW_ROLES.has(m.role) && !(m.role === "cousin" && m.parentId)
  );

  // ── Pass 1: Position main members in their generation rows ─────────────────
  const byGen = {};
  mainMembers.forEach((m) => {
    const g = ROLES[m.role]?.gen ?? 0;
    (byGen[g] = byGen[g] || []).push(m);
  });
  Object.values(byGen).forEach((arr) =>
    arr.sort((a, b) => (ORDER[a.role] ?? 5) - (ORDER[b.role] ?? 5))
  );

  const pos = {};
  Object.entries(byGen).forEach(([gen, mems]) => {
    const y = GEN_Y[gen] ?? (140 + (Number(gen) + 3) * 230);
    const n = mems.length;
    mems.forEach((m, i) => {
      pos[m.id] = { x: CANVAS_CX + (i - (n - 1) / 2) * COL_W, y };
    });
  });

  // ── Pass 2: Position in-laws adjacent to their spouse (Phase 2 isolation) ──
  //
  // aunt_partner goes LEFT  of aunt  (outer edge — family name side)
  // uncle_partner goes RIGHT of uncle (outer edge — family name side)
  // This mirrors exactly how Mom/Dad were fixed: lateral attachment, independent
  // of the vertical grandparent trunk line.
  inLawMembers.forEach((inLaw) => {
    const spouse = members.find((m) => m.id === inLaw.parentId);
    if (!spouse || !pos[spouse.id]) return;
    const dir = inLaw.role === "aunt_partner" ? -1 : 1; // -1=left, +1=right
    pos[inLaw.id] = {
      x: pos[spouse.id].x + dir * COL_W,
      y: pos[spouse.id].y,
    };
  });

  // ── Compute junction midpoints ─────────────────────────────────────────────
  // Done AFTER Pass 2 so in-law positions are known and the dynamic junction
  // midpoints (aunt + aunt_partner average) are correct.
  const juncPos = {};
  junctions.forEach((j) => {
    const pps = j.parentIds.map((id) => pos[id]).filter(Boolean);
    if (pps.length === 0) return;
    juncPos[j.id] = {
      x: pps.reduce((s, p) => s + p.x, 0) / pps.length,
      y: pps.reduce((s, p) => s + p.y, 0) / pps.length,
    };
  });

  // ── Pass 3: Position parentId-cousins under their parent's junction X ──────
  //
  // Groups cousins by parentId, then spreads them horizontally around
  // the X midpoint of their aunt/uncle's junction (isolated X-window — Phase 2).
  const cousinsByParent = {};
  parentIdCousins.forEach((c) => {
    (cousinsByParent[c.parentId] = cousinsByParent[c.parentId] || []).push(c);
  });

  Object.entries(cousinsByParent).forEach(([parentId, cousins]) => {
    const parentMember = members.find((m) => m.id === parentId);
    if (!parentMember) return;
    const juncId = `junc_${parentMember.role}_${parentId}`;
    const juncX  = juncPos[juncId]?.x ?? pos[parentId]?.x ?? CANVAS_CX;
    const y      = GEN_Y["0"];
    const n      = cousins.length;
    cousins.forEach((c, i) => {
      pos[c.id] = { x: juncX + (i - (n - 1) / 2) * COL_W, y };
    });
  });

  return { pos, juncPos };
}

// ─── Build junction-routed SVG edge descriptors ────────────────────────────────
export function buildJunctionEdges(junctions, pos, juncPos, expandedJunctions) {
  const edges = [];

  junctions.forEach((j) => {
    const jp = juncPos[j.id];
    if (!jp) return;

    // Bridge: couple line between two parents (if couple exists)
    if (j.parentIds.length >= 2) {
      const p1 = pos[j.parentIds[0]];
      const p2 = pos[j.parentIds[1]];
      if (p1 && p2) {
        edges.push({ type: "bridge", juncId: j.id, isMain: j.isMain, x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y });
      }
    }

    if (j.childIds.length === 0) return;

    const isExpanded = expandedJunctions.has(j.id);
    const distY      = jp.y + TRUNK_OFFSET;

    // Trunk: vertical from junction midpoint downward
    edges.push({
      type:       "trunk",
      juncId:     j.id,
      isMain:     j.isMain,
      x:          jp.x,
      y1:         jp.y + 12,
      y2:         isExpanded ? distY : jp.y + 44,
      isExpanded,
    });

    if (!isExpanded) return;

    // Distributor bar
    const childPps = j.childIds.map((id) => pos[id]).filter(Boolean);
    if (childPps.length === 0) return;
    const xs   = childPps.map((p) => p.x);
    const minX = Math.min(jp.x, ...xs);
    const maxX = Math.max(jp.x, ...xs);
    if (minX < maxX) {
      edges.push({ type: "distributor", juncId: j.id, x1: minX, x2: maxX, y: distY });
    }

    // Drop lines: distributor → each child card
    j.childIds.forEach((cId) => {
      const cp = pos[cId];
      if (!cp) return;
      edges.push({ type: "drop", juncId: j.id, childId: cId, x: cp.x, y1: distY, y2: cp.y - 62 });
    });
  });

  return edges;
}

// ─── Phase 1: Recursive visibility filter ─────────────────────────────────────
//
// Main junctions:      all parents + all children always visible
// Dynamic junctions:   bloodline owner (parentIds[0]) always visible;
//                      in-law partner (parentIds[1]) + cousins (childIds) ONLY when expanded
// Orphan members:      always visible
export function getVisibleMemberIds(members, junctions, expandedJunctions) {
  const visible = new Set();

  junctions.forEach((j) => {
    if (j.isMain) {
      j.parentIds.forEach((id) => visible.add(id));
      j.childIds.forEach((id) => visible.add(id));
    } else {
      // The bloodline aunt/uncle (index 0) is always visible (also in junc_gp children)
      if (j.parentIds.length > 0) visible.add(j.parentIds[0]);

      if (expandedJunctions.has(j.id)) {
        // Inject in-law partner(s) + all cousins into the visible set
        j.parentIds.slice(1).forEach((id) => visible.add(id));
        j.childIds.forEach((id) => visible.add(id));
      }
    }
  });

  // Members not referenced in any junction (orphans) are always visible
  const allJuncIds = new Set(junctions.flatMap((j) => [...j.parentIds, ...j.childIds]));
  members.forEach((m) => { if (!allJuncIds.has(m.id)) visible.add(m.id); });

  return visible;
}
