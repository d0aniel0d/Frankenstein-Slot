import { BOARD_BASE_VALUES, BOARD_JACKPOT_AS_BET_MULT, BOARD_SEED_MULTS, BOARD_SEED_MULT_CHANCE, JACKPOT_SEEDS, POWER_UP_CELL_COUNT, POWER_UP_MULTS } from "./mathConfig";
import type { PrizeCell } from "./types";
import { pick, pickWeighted, randomInt } from "./rng";

export function createInitialBoard(): PrizeCell[] {
  return BOARD_BASE_VALUES.map((v) => ({
    baseCredits: v.credits,
    multiplier: 1,
    label: v.label,
  }));
}

export function applyPowerUp(board: PrizeCell[]): boolean {
  const eligible = board.map((cell, i) => ({ cell, i }));

  if (eligible.length === 0) return false;

  const count = POWER_UP_CELL_COUNT[randomInt(POWER_UP_CELL_COUNT.length)]!;
  const shuffled = [...eligible].sort(() => Math.random() - 0.5);
  for (let i = 0; i < Math.min(count, shuffled.length); i++) {
    const idx = shuffled[i]!.i;
    const boost = POWER_UP_MULTS[randomInt(POWER_UP_MULTS.length)]!;
    board[idx]!.multiplier = Math.max(board[idx]!.multiplier, boost);
  }
  return true;
}

export function resetBoardMultipliers(board: PrizeCell[]): void {
  for (const cell of board) {
    cell.multiplier = 1;
  }
}

export function cellPayout(cell: PrizeCell, bet: number): number {
  const mult = cell.baseCredits * cell.multiplier;
  if (cell.label === "credit") return mult * bet;
  if (BOARD_JACKPOT_AS_BET_MULT) {
    return mult * bet;
  }
  if (cell.label === "mini") return JACKPOT_SEEDS.mini * cell.multiplier;
  if (cell.label === "minor") return JACKPOT_SEEDS.minor * cell.multiplier;
  return JACKPOT_SEEDS.major * cell.multiplier;
}

/** 按权重抽奖金板格子（偏低付） */
export function awardMonsterFromBoard(
  board: PrizeCell[],
  bet: number
): { payout: number; cellIndex: number } {
  const items = BOARD_BASE_VALUES.map((def, i) => ({
    value: i,
    weight: def.weight,
  }));
  const idx = pickWeighted(items);
  const cell = board[idx]!;
  return { payout: cellPayout(cell, bet), cellIndex: idx };
}

export function tickJackpots(): typeof JACKPOT_SEEDS {
  return {
    grand: JACKPOT_SEEDS.grand + Math.random() * 50,
    major: JACKPOT_SEEDS.major + Math.random() * 5,
    minor: JACKPOT_SEEDS.minor + Math.random() * 2,
    mini: JACKPOT_SEEDS.mini + Math.random() * 0.5,
  };
}

export function seedRandomMultipliers(board: PrizeCell[]): void {
  for (const cell of board) {
    if (Math.random() < BOARD_SEED_MULT_CHANCE) {
      cell.multiplier = pick([...BOARD_SEED_MULTS]);
    }
  }
}
