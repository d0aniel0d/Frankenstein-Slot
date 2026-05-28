import {
  BET_OPTIONS,
  BOARD_CELL_WEIGHTS,
  GRAND_TICK_PER_SECOND_MAX,
  GRAND_TICK_PER_SECOND_MIN,
  SUPER_MAJOR_TICK_AMOUNT,
  getBetTier,
  normalizeBet,
} from "./betDisplay";
import type { JackpotDisplay } from "./betDisplay";
import { BOARD_SEED_MULTS, BOARD_SEED_MULT_CHANCE, POWER_UP_CELL_COUNT, POWER_UP_MULTS } from "./mathConfig";
import type { PrizeCell } from "./types";
import { pick, pickWeighted, randomInt } from "./rng";

export type { JackpotDisplay };

export function createInitialBoard(bet: number): PrizeCell[] {
  const tier = getBetTier(bet);
  return tier.boardDollars.map((dollars) => ({
    baseDollars: dollars,
    multiplier: 1,
    label: "credit" as const,
  }));
}

export function syncPrizeBoardToBet(board: PrizeCell[], bet: number): void {
  const dollars = getBetTier(bet).boardDollars;
  for (let i = 0; i < board.length; i++) {
    board[i]!.baseDollars = dollars[i]!;
    board[i]!.multiplier = 1;
  }
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

export function cellPayout(cell: PrizeCell): number {
  return Math.round(cell.baseDollars * cell.multiplier * 100) / 100;
}

/** 按权重抽奖金板格子（偏低付） */
export function awardMonsterFromBoard(
  board: PrizeCell[],
  _bet: number
): { payout: number; cellIndex: number } {
  const items = BOARD_CELL_WEIGHTS.map((weight, i) => ({
    value: i,
    weight,
  }));
  const idx = pickWeighted(items);
  const cell = board[idx]!;
  return { payout: cellPayout(cell), cellIndex: idx };
}

const grandByBet = new Map<number, number>();
const superByBet = new Map<number, number>();
const majorByBet = new Map<number, number>();

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

/** 切换赌注或重置时，恢复该档位的 GRAND / SUPER / MAJOR 起点 */
export function resetJackpotsForBet(bet: number): void {
  const tier = getBetTier(bet);
  const key = normalizeBet(bet);
  grandByBet.set(key, tier.jackpots.grandStart);
  superByBet.set(key, tier.jackpots.super);
  majorByBet.set(key, tier.jackpots.major);
}

/** @deprecated 使用 resetJackpotsForBet */
export function resetGrandForBet(bet: number): void {
  resetJackpotsForBet(bet);
}

/** GRAND：每秒 +$0.45–$0.98 */
export function tickGrandJackpot(bet: number): number {
  const tier = getBetTier(bet);
  const key = normalizeBet(bet);
  let value = grandByBet.get(key) ?? tier.jackpots.grandStart;
  value +=
    GRAND_TICK_PER_SECOND_MIN +
    Math.random() * (GRAND_TICK_PER_SECOND_MAX - GRAND_TICK_PER_SECOND_MIN);
  if (value >= tier.grandRollCap) {
    value = tier.jackpots.grandStart + Math.random() * 2;
  }
  value = roundMoney(value);
  grandByBet.set(key, value);
  return value;
}

/** SUPER / MAJOR：每 2 秒各 +$0.09 */
export function tickSuperMajorJackpots(bet: number): { super: number; major: number } {
  const tier = getBetTier(bet);
  const key = normalizeBet(bet);
  let superVal = superByBet.get(key) ?? tier.jackpots.super;
  let majorVal = majorByBet.get(key) ?? tier.jackpots.major;
  superVal = roundMoney(superVal + SUPER_MAJOR_TICK_AMOUNT);
  majorVal = roundMoney(majorVal + SUPER_MAJOR_TICK_AMOUNT);
  superByBet.set(key, superVal);
  majorByBet.set(key, majorVal);
  return { super: superVal, major: majorVal };
}

export function getGrandJackpot(bet: number): number {
  const key = normalizeBet(bet);
  return grandByBet.get(key) ?? getBetTier(bet).jackpots.grandStart;
}

function getProgressiveSuperMajor(bet: number): { super: number; major: number } {
  const tier = getBetTier(bet);
  const key = normalizeBet(bet);
  return {
    super: superByBet.get(key) ?? tier.jackpots.super,
    major: majorByBet.get(key) ?? tier.jackpots.major,
  };
}

export function getJackpotDisplay(bet: number): JackpotDisplay {
  const tier = getBetTier(bet);
  const prog = getProgressiveSuperMajor(bet);
  return {
    grand: getGrandJackpot(bet),
    super: prog.super,
    major: prog.major,
    maxi: tier.jackpots.maxi,
    minor: tier.jackpots.minor,
    mini: tier.jackpots.mini,
  };
}

export function seedRandomMultipliers(board: PrizeCell[]): void {
  for (const cell of board) {
    if (Math.random() < BOARD_SEED_MULT_CHANCE) {
      cell.multiplier = pick([...BOARD_SEED_MULTS]);
    }
  }
}

for (const b of BET_OPTIONS) {
  resetJackpotsForBet(b);
}
