// ─── Color Palette ────────────────────────────────────────────────────────────
export const C = {
  sky:        "#A0E0FF",
  skyDeep:    "#4DB8E8",
  sun:        "#FFD166",
  sunGlow:    "#FFBE0B",
  grass:      "#06D6A0",
  grassDk:    "#05B88A",
  rose:       "#FF6B9D",
  roseDk:     "#E0527F",
  lavender:   "#C77DFF",
  lavDk:      "#A855F7",
  peach:      "#FF9A5C",
  peachDk:    "#E07838",
  mint:       "#52D9B5",
  mintDk:     "#3DBD99",
  cream:      "#FFF9F2",
  creamDk:    "#F5EDE0",
  bark:       "#5C3D2E",
  woodDk:     "#3E251C",
  white:      "#FFFFFF",
  coral:      "#FF6B6B",
  teal:       "#A8DADC",
  lemon:      "#F4D35E",
  // U7: distinct sibling colours
  sisterPink: "#FFB3D1",
  brotherBlue:"#78C4F5",
  // Phase 2: in-law accent colour (soft periwinkle — visually distinct, non-jarring)
  inLaw:      "#C4B5FD",
};

// ─── Phase 2: Bloodline vs In-Law classification ──────────────────────────────
// Used in MemberCard for visual hierarchy (solid border vs dashed + 💍 badge)
export const BLOODLINE_ROLES = new Set([
  "self", "mom", "dad",
  "grandma", "grandpa",
  "great_grandma", "great_grandpa",
  "sister", "brother",
  "aunt", "uncle",
  "daughter", "son",
  "cousin", "pet",
]);
// Roles that married into the family (not blood relatives)
export const IN_LAW_ROLES = new Set(["spouse", "aunt_partner", "uncle_partner"]);

// ─── Avatar options ───────────────────────────────────────────────────────────
export const AVATARS = {
  Kids:           ["👦", "👧", "👶", "🧒", "🧒🏽", "👦🏾", "👧🏽"],
  Parents:        ["👨", "👩", "👨🏽", "👩🏽", "👨🏾", "👩🏾"],
  Grandparents:   ["👴", "👵", "👴🏽", "👵🏽", "👴🏾", "👵🏾"],
  "Aunts/Uncles": ["🧔", "👩", "👱", "🧑", "🧓", "🤵"],
  // Phase 1: Partners who married into the family
  "Partners":     ["👩", "👨", "👰", "🤵", "👱‍♀️", "👱", "🧑🏽", "🧑🏾"],
  Pets:           ["🐶", "🐱", "🐰", "🐹", "🦜", "🐠", "🦄", "🐻", "🐼"],
  Fun:            ["🦸", "🦹", "🧙", "🧝", "👸", "🤴", "🧑"],
};

// ─── Default avatar suggestion per role ───────────────────────────────────────
export const ROLE_DEFAULT_AVATAR = {
  self:          "🧒",
  mom:           "👩",
  dad:           "👨",
  grandma:       "👵",
  grandpa:       "👴",
  great_grandma: "👵",
  great_grandpa: "👴",
  sister:        "👧",
  brother:       "👦",
  aunt:          "👩",
  uncle:         "🧔",
  aunt_partner:  "👨",  // aunt's partner (typically male, but any is fine)
  uncle_partner: "👩",  // uncle's partner (typically female, but any is fine)
  cousin:        "🧒",
  spouse:        "👫",
  daughter:      "👧",
  son:           "👦",
  pet:           "🐶",
};

// ─── Roles ────────────────────────────────────────────────────────────────────
export const ROLES = {
  // Generation -3
  great_grandma:  { label: "Great-Grandma",      gen: -3, color: "#C48B96",    emoji: "👵" },
  great_grandpa:  { label: "Great-Grandpa",      gen: -3, color: "#A86A78",    emoji: "👴" },
  // Generation -2
  grandma:        { label: "Grandma",            gen: -2, color: C.lavender,   emoji: "👵" },
  grandpa:        { label: "Grandpa",            gen: -2, color: C.lavDk,      emoji: "👴" },
  // Generation -1 (bloodline)
  aunt:           { label: "Aunt",               gen: -1, color: C.peach,      emoji: "👩"  },
  mom:            { label: "Mom",                gen: -1, color: C.rose,       emoji: "👩"  },
  dad:            { label: "Dad",                gen: -1, color: C.sky,        emoji: "👨"  },
  uncle:          { label: "Uncle",              gen: -1, color: C.peachDk,    emoji: "🧔"  },
  // Generation -1 (in-law — Phase 1 & 2)
  aunt_partner:   { label: "Aunt's Partner",     gen: -1, color: C.inLaw,      emoji: "👨"  },
  uncle_partner:  { label: "Uncle's Partner",    gen: -1, color: C.inLaw,      emoji: "👩"  },
  // Generation 0
  sister:         { label: "Sister",             gen: 0,  color: C.sisterPink, emoji: "👧"  },
  self:           { label: "Me! ⭐",             gen: 0,  color: C.sun,        emoji: "⭐"  },
  brother:        { label: "Brother",            gen: 0,  color: C.brotherBlue,emoji: "👦"  },
  spouse:         { label: "Partner",            gen: 0,  color: C.rose,       emoji: "👫"  },
  cousin:         { label: "Cousin",             gen: 0,  color: C.teal,       emoji: "🧑"  },
  // Generation +1
  daughter:       { label: "Daughter",           gen: 1,  color: C.mint,       emoji: "👧"  },
  son:            { label: "Son",                gen: 1,  color: C.mintDk,     emoji: "👦"  },
  pet:            { label: "Pet 🐾",             gen: 1,  color: C.lemon,      emoji: "🐶"  },
};

// ─── C3: Role groups for picker ───────────────────────────────────────────────
export const ROLE_GROUPS = [
  {
    label: "👆 Family Above You",
    roles: ["great_grandma", "great_grandpa", "grandma", "grandpa", "mom", "dad", "aunt", "uncle"],
  },
  {
    label: "👫 Your Generation",
    roles: ["sister", "brother", "spouse", "cousin"],
  },
  {
    label: "👶 Family Below You",
    roles: ["daughter", "son", "pet"],
  },
  // Phase 1: In-law group — only shown in MemberModal when aunts/uncles exist
  {
    label: "💍 Partners (Married In)",
    roles: ["aunt_partner", "uncle_partner"],
    requiresParentRole: ["aunt", "uncle"],  // conditional display hint for MemberModal
  },
];

// ─── Short descriptions for the picker ───────────────────────────────────────
export const ROLE_PICKER_DESC = {
  self:           "That's YOU — the star of the tree! ⭐",
  mom:            "She loves you and takes care of you! 💗",
  dad:            "He's always there for you! 💙",
  grandma:        "Your parent's own mom! 👵",
  grandpa:        "Your parent's own dad! 👴",
  great_grandma:  "Your grandma's mom — way back! 🌳",
  great_grandpa:  "Your grandpa's dad — way back! 🌳",
  sister:         "Same mom & dad, grew up together! 👧",
  brother:        "Same mom & dad, grew up together! 👦",
  aunt:           "Your parent's sister! 🌟",
  uncle:          "Your parent's brother! 🌟",
  aunt_partner:   "Your aunt's husband or partner! 💍",
  uncle_partner:  "Your uncle's wife or partner! 💍",
  cousin:         "Your aunt or uncle's child! 🧑",
  spouse:         "A family member's partner! 💑",
  daughter:       "Your own daughter! 👧",
  son:            "Your own son! 👦",
  pet:            "Furry, feathery or scaly family! 🐾",
};

// ─── Full relation explainers (shown in InfoPanel) ────────────────────────────
// For cousins, App.jsx passes a dynamic override via getCousinExplainer().
export const RELATION_EXPLAINER = {
  self:           "You are the star of your own family tree! 🌟 Every family tree starts with YOU.",
  mom:            "Your Mom — she loves you so much and takes care of you every day! 💗",
  dad:            "Your Dad — he is always there for you and loves you tons! 💙",
  grandma:        "Your Mom or Dad's Mom. She is your very own Grandma — extra hugs! 👵💜",
  grandpa:        "Your Mom or Dad's Dad. He is your very own Grandpa — extra stories! 👴",
  great_grandma:  "Your Grandma's Mom — she goes way, way back! So extra special! 🌳",
  great_grandpa:  "Your Grandpa's Dad — he goes way, way back! Full of wisdom! 🌳",
  sister:         "Your sister! You share the same Mom and Dad and grew up together! 👧💚",
  brother:        "Your brother! You share the same Mom and Dad and grew up together! 👦💚",
  aunt:           "Your Mom or Dad's sister — like an extra cool bonus Mom! 🌟 Tap to see their family! 👇",
  uncle:          "Your Mom or Dad's brother — like an extra cool bonus Dad! 🌟 Tap to see their family! 👇",
  aunt_partner:   "Your aunt's partner — they married into the family and are part of it now! 💍",
  uncle_partner:  "Your uncle's partner — they married into the family and are part of it now! 💍",
  cousin:         "Your cousin! You share the same grandparents. You're connected by blood! 🧑🌳",
  spouse:         "Someone married to or partnered with a family member. Two families become one! 💑",
  daughter:       "Your daughter — someone you love and look after! 👧",
  son:            "Your son — someone you love and look after! 👦",
  pet:            "Your furry, feathery, or scaly family member — they love you unconditionally! 🐾",
};

// ─── Edge visual styles (kept for reference, replaced by JunctionRenderer) ────
export const EDGE_STYLE = {
  ancestor:       { color: C.lavender, width: 4,   dash: "none", arrow: true  },
  "parent-child": { color: C.skyDeep,  width: 4,   dash: "none", arrow: true  },
  sibling:        { color: "#C5A0E0",  width: 3,   dash: "10 5", arrow: false },
  "aunt-uncle":   { color: C.peach,    width: 3,   dash: "8 4",  arrow: true  },
  cousin:         { color: C.teal,     width: 3,   dash: "6 4",  arrow: false },
  spouse:         { color: C.rose,     width: 2.5, dash: "4 3",  arrow: false },
};

// ─── Generation display names ─────────────────────────────────────────────────
export const GEN_NAMES = {
  "-3": "👴👵  Great-Grandparents",
  "-2": "👴👵  Grandparents",
  "-1": "👨👩  Parents & Aunts/Uncles",
   "0": "⭐     Your Generation",
   "1": "👶     Children & Pets",
};

// ─── Quest system ─────────────────────────────────────────────────────────────
export function getQuest(members) {
  const hasAny = (...roles) => members.some((m) => roles.includes(m.role));
  if (!hasAny("self"))               return { text: "🌟 Add yourself first!", pct: 0 };
  if (!hasAny("mom", "dad"))         return { text: "👨👩 Add your Mom or Dad!", pct: 15 };
  if (!hasAny("grandma", "grandpa")) return { text: "👵 Add a Grandma or Grandpa!", pct: 30 };
  if (!hasAny("sister", "brother"))  return { text: "👧 Add a brother or sister!", pct: 50 };
  if (!hasAny("aunt", "uncle"))      return { text: "🌟 Add an Aunt or Uncle!", pct: 65 };
  if (!hasAny("cousin"))             return { text: "🧑 Add a cousin!", pct: 80 };
  if (!hasAny("pet"))                return { text: "🐶 Add a pet!", pct: 90 };
  return { text: "You are a Master Forest Builder! 🌳🏆", pct: 100 };
}

// ─── Context-aware: which roles make sense to add next to a given member ───────
export function getRelativesOf(role) {
  switch (role) {
    case "self":
      return {
        label: "Add someone related to You",
        groups: [
          { label: "💆 Parents & Grandparents", roles: ["mom", "dad", "grandma", "grandpa", "great_grandma", "great_grandpa"] },
          { label: "👪 Siblings & Partner",     roles: ["sister", "brother", "spouse"] },
          { label: "👶 Your Children & Pets",  roles: ["daughter", "son", "pet"] },
        ],
      };
    case "mom":
    case "dad":
      return {
        label: `Add someone related to your ${role === "mom" ? "Mom" : "Dad"}`,
        groups: [
          { label: "👨‍👩 Their Parents",     roles: ["grandma", "grandpa"] },
          { label: "👨‍👧 Their Siblings",   roles: ["aunt", "uncle"] },
          { label: "👑 Their Partner",     roles: ["spouse"] },
          { label: "👶 Your Siblings",    roles: ["sister", "brother"] },
        ],
      };
    case "grandma":
    case "grandpa":
      return {
        label: "Add someone related to your Grandparent",
        groups: [
          { label: "👴 Their Parents",   roles: ["great_grandma", "great_grandpa"] },
          { label: "👨‍👧 Their Children", roles: ["mom", "dad", "aunt", "uncle"] },
        ],
      };
    case "great_grandma":
    case "great_grandpa":
      return {
        label: "Add someone related to your Great-Grandparent",
        groups: [
          { label: "👨‍👧 Their Children", roles: ["grandma", "grandpa"] },
        ],
      };
    case "aunt":
    case "uncle":
      return {
        label: `Add someone related to your ${role === "aunt" ? "Aunt" : "Uncle"}`,
        groups: [
          { label: "👠 Their Partner",  roles: [role === "aunt" ? "aunt_partner" : "uncle_partner"] },
          { label: "👶 Their Children", roles: ["cousin"] },
        ],
      };
    case "aunt_partner":
    case "uncle_partner":
      return {
        label: "Add someone related to this Partner",
        groups: [
          { label: "👶 Their Children", roles: ["cousin"] },
        ],
      };
    case "sister":
    case "brother":
      return {
        label: `Add someone related to your ${role === "sister" ? "Sister" : "Brother"}`,
        groups: [
          { label: "👠 Their Partner",  roles: ["spouse"] },
          { label: "👶 Their Children", roles: ["daughter", "son"] },
        ],
      };
    case "spouse":
      return {
        label: "Add someone related to your Partner",
        groups: [
          { label: "👶 Your Children", roles: ["daughter", "son", "pet"] },
        ],
      };
    case "cousin":
      return {
        label: "Add someone related to your Cousin",
        groups: [
          { label: "👶 Their Children", roles: ["daughter", "son"] },
        ],
      };
    default:
      return null;
  }
}
