import type { SymbolId } from "../game/types";

const ART: Record<SymbolId, string> = {
  neon_a: neonLetter("A", "#c850ff", "#6a28a8", "#9adbff"),
  neon_j: neonLetter("J", "#5ec8ff", "#1a5a9a", "#b8f0ff"),
  neon_q: neonLetter("Q", "#ff8c2e", "#9a4a08", "#ffe566"),
  neon_k: neonLetter("K", "#ff3d6a", "#8b1030", "#ff9eb8"),
  daisy: `
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="14" fill="#3d8fd4" opacity="0.25"/>
      ${[0, 45, 90, 135, 180, 225, 270, 315]
        .map(
          (deg) =>
            `<ellipse cx="32" cy="18" rx="7" ry="14" fill="#4aa8e8" transform="rotate(${deg} 32 32)"/>`
        )
        .join("")}
      <circle cx="32" cy="32" r="9" fill="#ffd54a"/>
      <circle cx="28" cy="30" r="1.5" fill="#fff" opacity="0.7"/>
      <circle cx="36" cy="34" r="1" fill="#fff" opacity="0.5"/>
    </svg>`,
  brain: `
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <rect x="14" y="12" width="36" height="44" rx="4" fill="rgba(180,200,220,0.35)" stroke="#8ab0c8"/>
      <ellipse cx="32" cy="30" rx="12" ry="10" fill="#5dff7a" opacity="0.9"/>
      <path d="M26 28 Q32 22 38 28 Q36 36 32 38 Q28 36 26 28" fill="#3dcc5a"/>
      <rect x="18" y="46" width="28" height="8" fill="#e8ece8" stroke="#888"/>
      <text x="32" y="52" text-anchor="middle" fill="#333" font-size="4" font-weight="700" font-family="serif">ABNORMAL</text>
      <text x="32" y="56" text-anchor="middle" fill="#333" font-size="4" font-weight="700" font-family="serif">BRAIN</text>
    </svg>`,
  castle: `
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" fill="#1a1038"/>
      <circle cx="46" cy="14" r="11" fill="#e8f0ff"/>
      <path d="M0 50 L16 38 L28 42 L40 34 L64 44 V64 H0Z" fill="#2a1848"/>
      <path d="M22 36 L26 22 L30 36 M34 32 L38 18 L42 32 L46 36 H18Z" fill="#3a2858" stroke="#5a4078"/>
      <path d="M8 52 L12 40 L14 52 M48 52 L52 38 L54 52" fill="#1a2840"/>
    </svg>`,
  assistant: `
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" fill="#1a3020"/>
      <circle cx="32" cy="22" r="10" fill="#d4a860"/>
      <rect x="22" y="30" width="20" height="22" fill="#3d6b40"/>
      <circle cx="40" cy="38" r="5" fill="#fff8c0" opacity="0.9"/>
      <circle cx="40" cy="38" r="8" fill="#fff8c0" opacity="0.2"/>
      <ellipse cx="24" cy="48" rx="6" ry="3" fill="#8a7a50"/>
    </svg>`,
  monster: monsterPortrait("#ffb74d", "#8d6e3a", "#3e2723"),
  dr_frank: `
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" fill="#e91e8c"/>
      <circle cx="32" cy="24" r="12" fill="#f0d090"/>
      <path d="M22 20 Q32 14 42 20" fill="#e8c070"/>
      <ellipse cx="26" cy="26" rx="3" ry="4" fill="#fff"/>
      <ellipse cx="38" cy="26" rx="3" ry="4" fill="#fff"/>
      <circle cx="26" cy="26" r="1.5" fill="#1a1020"/>
      <circle cx="38" cy="26" r="1.5" fill="#1a1020"/>
      <ellipse cx="32" cy="34" rx="6" ry="4" fill="#1a1020" opacity="0.5"/>
      <rect x="20" y="38" width="24" height="18" fill="#f5f5f0"/>
      <path d="M18 42 L14 36 M46 42 L50 36" stroke="#fff" stroke-width="2" opacity="0.6"/>
    </svg>`,
  alive: `
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" fill="#0a1830"/>
      <text x="32" y="30" text-anchor="middle" fill="#b8e8ff" font-size="11" font-style="italic" font-weight="700" font-family="Georgia,serif">it's</text>
      <text x="32" y="46" text-anchor="middle" fill="#dff8ff" font-size="14" font-style="italic" font-weight="900" font-family="Georgia,serif">Alive!</text>
      <path d="M8 20 L14 28 M56 20 L50 28" stroke="#5ec8ff" stroke-width="2" opacity="0.7"/>
    </svg>`,
  power: `
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" fill="#061828"/>
      <text x="32" y="32" text-anchor="middle" fill="#4aa8ff" font-size="11" font-weight="900" font-family="Rajdhani,sans-serif" transform="skewX(-8)">POWER</text>
      <text x="32" y="46" text-anchor="middle" fill="#7dd3ff" font-size="11" font-weight="900" font-family="Rajdhani,sans-serif" transform="skewX(-8)">UP!</text>
      <path d="M10 18 L18 30 M54 18 L46 30 M32 8 L36 18 M28 8 L24 18" stroke="#5ec8ff" stroke-width="2"/>
    </svg>`,
  free_games: `
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="8" width="56" height="48" rx="4" fill="#1a0808" stroke="#c41e3a" stroke-width="2"/>
      <path d="M32 42 L20 28 H28 L32 18 L36 28 H44Z" fill="#ff6b2e" opacity="0.8"/>
      <circle cx="32" cy="20" r="8" fill="#ff3d1a" opacity="0.5"/>
      <text x="32" y="38" text-anchor="middle" fill="#fff" font-size="7" font-weight="900" font-family="Rajdhani,sans-serif">FREE</text>
      <text x="32" y="48" text-anchor="middle" fill="#ffd54a" font-size="7" font-weight="900" font-family="Rajdhani,sans-serif">GAMES</text>
    </svg>`,
  cash_orb: `
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="orbShine" cx="35%" cy="30%">
          <stop offset="0%" stop-color="#fff8b0"/>
          <stop offset="45%" stop-color="#ffd54a"/>
          <stop offset="100%" stop-color="#b8860b"/>
        </radialGradient>
      </defs>
      <circle cx="32" cy="34" r="22" fill="url(#orbShine)" stroke="#fff" stroke-width="2"/>
      <ellipse cx="24" cy="26" rx="6" ry="4" fill="#fff" opacity="0.45"/>
    </svg>`,
  wild: `
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="16" width="48" height="32" rx="4" fill="#c41e3a" stroke="#ffd54a" stroke-width="2"/>
      <text x="32" y="38" text-anchor="middle" fill="#fff" font-size="13" font-weight="900" font-family="Cinzel,serif">WILD</text>
    </svg>`,
};

function neonLetter(char: string, fill: string, stroke: string, glow: string): string {
  return `
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="glow-${char}">
          <feGaussianBlur stdDeviation="2" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <text x="32" y="44" text-anchor="middle" fill="${fill}" stroke="${stroke}" stroke-width="2"
        font-size="36" font-weight="900" font-family="Rajdhani,sans-serif" filter="url(#glow-${char})">${char}</text>
      <text x="32" y="44" text-anchor="middle" fill="none" stroke="${glow}" stroke-width="0.8" opacity="0.6"
        font-size="36" font-weight="900" font-family="Rajdhani,sans-serif">${char}</text>
    </svg>`;
}

function monsterPortrait(glow: string, skin: string, bg: string): string {
  return `
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" fill="${bg}"/>
      <ellipse cx="32" cy="36" rx="20" ry="22" fill="${skin}"/>
      <rect x="18" y="14" width="28" height="16" rx="2" fill="#3a4a48"/>
      <rect x="20" y="18" width="9" height="7" rx="1" fill="#1a2030"/>
      <rect x="35" y="18" width="9" height="7" rx="1" fill="#1a2030"/>
      <path d="M22 26 H42" stroke="#2a3038" stroke-width="2"/>
      <ellipse cx="25" cy="34" rx="4" ry="5" fill="#1a2030"/>
      <ellipse cx="39" cy="34" rx="4" ry="5" fill="#1a2030"/>
      <path d="M28 46 H36" stroke="#5a4048" stroke-width="2"/>
      <circle cx="14" cy="38" r="3" fill="#8a9098"/>
      <circle cx="50" cy="38" r="3" fill="#8a9098"/>
      <path d="M12 36 L10 44 M52 36 L54 44" stroke="#7a8088" stroke-width="2"/>
      <ellipse cx="32" cy="12" rx="16" ry="4" fill="${glow}" opacity="0.15"/>
    </svg>`;
}

export function getSymbolSvg(id: SymbolId): string {
  return ART[id];
}

const SYMBOL_ASSET_VERSION = "7";

export function getSymbolMediaUrl(id: SymbolId): string | null {
  return `/symbols/${id}.png?v=${SYMBOL_ASSET_VERSION}`;
}
