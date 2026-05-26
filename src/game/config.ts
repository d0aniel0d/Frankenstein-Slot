import type { SymbolDef, SymbolId } from "./types";

export const STARTING_BALANCE = 10_000;
export const BET_OPTIONS = [10, 25, 50, 100, 250];
export const REELS = 5;
export const ROWS = 3;
export const FREE_GAME_ROWS = 5;

export const SYMBOLS: Record<SymbolId, SymbolDef> = {
  neon_a: { id: "neon_a", label: "A", emoji: "🅰️", isFrankenstein: false },
  neon_j: { id: "neon_j", label: "J", emoji: "🅹", isFrankenstein: false },
  neon_q: { id: "neon_q", label: "Q", emoji: "🅀", isFrankenstein: false },
  neon_k: { id: "neon_k", label: "K", emoji: "🅺", isFrankenstein: false },
  daisy: { id: "daisy", label: "雏菊", emoji: "🌼", isFrankenstein: false },
  brain: { id: "brain", label: "大脑瓶", emoji: "🧠", isFrankenstein: false },
  castle: { id: "castle", label: "城堡", emoji: "🏰", isFrankenstein: false },
  assistant: { id: "assistant", label: "助手", emoji: "🔦", isFrankenstein: false },
  monster: { id: "monster", label: "科学怪人", emoji: "🧟", isFrankenstein: true },
  dr_frank: { id: "dr_frank", label: "科学家", emoji: "👨‍🔬", isFrankenstein: false },
  cash_orb: { id: "cash_orb", label: "现金球", emoji: "💰", isFrankenstein: false },
  alive: { id: "alive", label: "It's Alive!", emoji: "⚡", isFrankenstein: false },
  power: { id: "power", label: "Power Up!", emoji: "🔋", isFrankenstein: false },
  free_games: { id: "free_games", label: "Free Games", emoji: "🎰", isFrankenstein: false },
  wild: { id: "wild", label: "WILD", emoji: "✨", isFrankenstein: false },
};

export { BOARD_BASE_VALUES, JACKPOT_SEEDS, LINE_PAY, PAYLINES, SPIN_HOLD_PERCENT } from "./mathConfig";

/** 转轮条：alive / monster 极少，多数为低付符号 */
export const REEL_STRIPS: SymbolId[][] = [
  ["neon_j", "neon_q", "castle", "neon_k", "neon_a", "brain", "neon_j", "daisy", "free_games", "castle", "neon_q", "neon_k", "neon_a", "brain", "neon_j", "castle", "daisy", "neon_q", "neon_k", "neon_a", "brain", "neon_j", "castle", "neon_q", "daisy", "neon_k", "neon_a", "brain", "neon_j", "alive", "castle", "neon_q", "neon_k", "daisy", "neon_a", "brain", "neon_j", "castle", "power", "neon_q", "free_games", "neon_k", "neon_a", "brain", "neon_j", "castle", "daisy", "neon_q", "neon_k", "neon_a"],
  ["neon_a", "assistant", "daisy", "brain", "neon_q", "castle", "neon_k", "dr_frank", "neon_j", "brain", "neon_q", "daisy", "neon_k", "neon_a", "castle", "neon_j", "brain", "assistant", "daisy", "neon_k", "neon_a", "neon_j", "brain", "castle", "neon_q", "daisy", "neon_k", "neon_a", "neon_j", "brain", "monster", "neon_q", "daisy", "neon_k", "dr_frank", "castle", "neon_j", "brain", "neon_q", "daisy", "neon_k", "neon_a", "assistant", "brain", "castle", "daisy", "neon_q", "neon_k", "neon_a"],
  ["neon_j", "neon_q", "brain", "daisy", "neon_k", "castle", "neon_a", "assistant", "brain", "neon_q", "daisy", "neon_k", "neon_a", "castle", "neon_j", "brain", "dr_frank", "daisy", "neon_k", "neon_a", "neon_j", "brain", "castle", "neon_q", "daisy", "neon_k", "neon_a", "neon_j", "brain", "neon_q", "daisy", "monster", "neon_k", "neon_a", "castle", "assistant", "brain", "neon_q", "daisy", "neon_k", "neon_a", "neon_j", "brain", "castle", "daisy", "dr_frank", "neon_q", "neon_k", "neon_a"],
  ["neon_k", "neon_a", "brain", "neon_j", "daisy", "castle", "neon_q", "neon_k", "neon_a", "brain", "neon_j", "daisy", "assistant", "neon_k", "neon_a", "castle", "neon_j", "brain", "neon_q", "daisy", "neon_k", "dr_frank", "neon_a", "neon_j", "brain", "castle", "neon_q", "daisy", "neon_k", "neon_a", "neon_j", "brain", "daisy", "monster", "neon_k", "neon_a", "castle", "neon_j", "brain", "neon_q", "daisy", "neon_k", "neon_a", "assistant", "brain", "castle", "daisy", "neon_q", "neon_k", "neon_a"],
  ["neon_q", "daisy", "neon_k", "neon_a", "brain", "neon_j", "castle", "neon_q", "daisy", "free_games", "neon_k", "neon_a", "assistant", "brain", "neon_q", "daisy", "neon_k", "neon_a", "castle", "neon_j", "brain", "dr_frank", "daisy", "neon_k", "neon_a", "neon_j", "brain", "castle", "neon_q", "daisy", "neon_k", "neon_a", "neon_j", "brain", "monster", "neon_q", "daisy", "neon_k", "free_games", "neon_a", "castle", "neon_j", "brain", "neon_q", "daisy", "neon_k", "neon_a", "neon_j", "brain", "castle", "daisy", "neon_q"],
];
