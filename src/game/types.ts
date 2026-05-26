export type SymbolId =
  | "neon_a"
  | "neon_j"
  | "neon_q"
  | "neon_k"
  | "daisy"
  | "brain"
  | "castle"
  | "assistant"
  | "monster"
  | "dr_frank"
  | "cash_orb"
  | "alive"
  | "power"
  | "free_games"
  | "wild";

export interface SymbolDef {
  id: SymbolId;
  label: string;
  emoji: string;
  isFrankenstein: boolean;
}

export interface GridPos {
  col: number;
  row: number;
}

export type VfxCommand =
  | {
      /** 转轮上的怪物头像 → 上方奖金板某一格 */
      action: "SHOOT_LIGHTNING_TO_BOARD";
      reelPos: GridPos;
      boardIndex: number;
      award: number;
    }
  | { action: "SHOW_MULTIPLIER"; value: number }
  | { action: "DIM_REELS" }
  | { action: "HIGHLIGHT_CELL"; pos: GridPos; kind: "frankenstein" | "alive" };

export interface PrizeCell {
  baseCredits: number;
  multiplier: number;
  label: "credit" | "mini" | "minor" | "major";
}

export interface SpinResult {
  grid: SymbolId[][];
  /** 怪物格上显示的收集金额（与奖金板领奖一致） */
  creditValues: (number | null)[][];
  lineWin: number;
  collectWin: number;
  boardWin: number;
  totalWin: number;
  messages: string[];
  vfxQueue: VfxCommand[];
  powerUpApplied: boolean;
  collectTriggered: boolean;
  powerMultiplier: number | null;
  freeGamesAwarded: number;
}

export interface GameState {
  balance: number;
  bet: number;
  lastWin: number;
  prizeBoard: PrizeCell[];
  boardPowered: boolean;
  freeGamesRemaining: number;
  inFreeGames: boolean;
}
