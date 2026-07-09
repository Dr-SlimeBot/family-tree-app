/**
 * Phase 3: Kid-Centric Cousin Relationship Utilities
 *
 * Instead of a generic "Cousin" label, these functions calculate and display
 * an explicit, easy-to-read relation string based on the cousin's parent path.
 *
 * Example outputs:
 *   getCousinShortLabel → "Bob's Kid"        (fits in the 84px SVG badge)
 *   getCousinExplainer  → "Your cousin! Uncle Bob's child — you share the same grandparents! 🌳"
 */

/**
 * Returns a SHORT badge label for a cousin card (≤ 12 chars).
 * Falls back to null if no parentId is set (generic "Cousin" label used instead).
 *
 * @param {object} cousin   – member object with role === "cousin"
 * @param {object[]} members – full member list
 * @returns {string|null}
 */
export function getCousinShortLabel(cousin, members) {
  if (!cousin?.parentId) return null;

  const parent = members.find((m) => m.id === cousin.parentId);
  if (!parent) return null;

  // Truncate long names so the badge always fits
  const maxLen = 7;
  const name   = parent.name.length > maxLen
    ? parent.name.slice(0, maxLen - 1) + "…"
    : parent.name;

  return `${name}'s Kid`;   // e.g. "Bob's Kid", "Susan's Kid"
}

/**
 * Returns the FULL explainer string shown in the InfoPanel for a cousin.
 * Includes the parent's role (Aunt / Uncle) and name.
 *
 * @param {object} cousin   – member object with role === "cousin"
 * @param {object[]} members – full member list
 * @returns {string}
 */
export function getCousinExplainer(cousin, members) {
  if (!cousin?.parentId) {
    return "Your cousin! You share the same grandparents as this person. You're connected by blood! 🧑🌳";
  }

  const parent = members.find((m) => m.id === cousin.parentId);
  if (!parent) {
    return "Your cousin! You share the same grandparents. You're connected by blood! 🧑🌳";
  }

  const parentTitle = parent.role === "uncle" ? "Uncle" : "Aunt";
  return `Your cousin — ${parentTitle} ${parent.name}'s child! 🧑 You both share the same grandparents, which makes you family forever! 🌳`;
}

/**
 * Returns a tooltip / aria-label string for a cousin card.
 * Useful for screen readers and hover labels.
 *
 * @param {object} cousin   – member object with role === "cousin"
 * @param {object[]} members – full member list
 * @returns {string}
 */
export function getCousinAriaLabel(cousin, members) {
  if (!cousin?.parentId) return `${cousin.name}, your Cousin`;
  const parent = members.find((m) => m.id === cousin.parentId);
  if (!parent) return `${cousin.name}, your Cousin`;
  const parentTitle = parent.role === "uncle" ? "Uncle" : "Aunt";
  return `${cousin.name}, your Cousin — ${parentTitle} ${parent.name}'s child`;
}
