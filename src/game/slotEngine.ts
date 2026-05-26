import {
  FREE_GAME_ROWS,
  LINE_PAY,
  PAYLINES,
  REEL_STRIPS,
  REELS,
  ROWS,
  SPIN_HOLD_PERCENT,
} from "./config";
import { createInitialBoard } from "./prizeBoard";
import type { SymbolId } from "./types";
import { evaluateCollect } from "./collectEvaluate";
import { blankCreditValues } from "./creditValues";
import {
  applyPowerUp,
  resetBoardMultipliers,
  seedRandomMultipliers,
} from "./prizeBoard";
import { randomInt } from "./rng";
import type { GameState, SpinResult } from "./types";

const LINE_PAY_TABLE = LINE_PAY as Partial<Record<SymbolId, number[]>>;

function spinReels(stripRows: number): SymbolId[][] {
  const grid: SymbolId[][] = [];
  for (let c = 0; c < REELS; c++) {
    const strip = REEL_STRIPS[c]!;
    const stop = randomInt(strip.length);
    const col: SymbolId[] = [];
    for (let r = 0; r < stripRows; r++) {
      col.push(strip[(stop + r) % strip.length]!);
    }
    grid.push(col);
  }
  return grid;
}

function symbolAt(grid: SymbolId[][], reel: number, row: number): SymbolId {
  return grid[reel]![row]!;
}

function matchLine(grid: SymbolId[][], line: number[]): { sym: SymbolId; count: number } | null {
  let base: SymbolId | null = null;
  let count = 0;
  for (let i = 0; i < REELS; i++) {
    const s = symbolAt(grid, i, line[i]!);
    if (s === "free_games" || s === "alive" || s === "power" || s === "cash_orb") break;
    if (s === "wild") {
      count++;
      continue;
    }
    if (base === null) base = s;
    if (s === base) {
      count++;
      continue;
    }
    break;
  }
  if (!base || count < 3) return null;
  if (!LINE_PAY_TABLE[base]) return null;
  return { sym: base, count };
}

function evaluateLineWins(grid: SymbolId[][], bet: number): number {
  let total = 0;
  for (const line of PAYLINES) {
    const m = matchLine(grid, line);
    if (!m) continue;
    const pays = LINE_PAY_TABLE[m.sym];
    if (!pays) continue;
    total += pays[Math.min(m.count, 5) - 1]! * bet;
  }
  return total;
}

function countScatters(grid: SymbolId[][]): number {
  let n = 0;
  for (let c = 0; c < REELS; c++) {
    for (let r = 0; r < grid[c]!.length; r++) {
      if (grid[c]![r] === "free_games") n++;
    }
  }
  return n;
}

function reelHas(grid: SymbolId[][], reel: number, id: SymbolId): boolean {
  return grid[reel]!.includes(id);
}

export function createGameState(): GameState {
  const board = createInitialBoard();
  seedRandomMultipliers(board);
  return {
    balance: 10_000,
    bet: 25,
    lastWin: 0,
    prizeBoard: board,
    boardPowered: false,
    freeGamesRemaining: 0,
    inFreeGames: false,
  };
}

export function spin(state: GameState): SpinResult | { error: string } {
  const isFreeSpin = state.inFreeGames && state.freeGamesRemaining > 0;
  if (!isFreeSpin && state.balance < state.bet) {
    return { error: "余额不足，请降低赌注或重置钱包。" };
  }

  const rows = isFreeSpin ? FREE_GAME_ROWS : ROWS;
  if (!isFreeSpin) state.balance -= state.bet;

  const grid = spinReels(rows);
  const messages: string[] = [];
  const boardWin = 0;
  let powerUpApplied = false;

  const isPowerUpTriggered = reelHas(grid, 0, "power");
  if (isPowerUpTriggered) {
    powerUpApplied = applyPowerUp(state.prizeBoard);
    state.boardPowered = true;
    messages.push("Power Up! 上方奖金板部分格子获得 2×–10× 加成。");
  }

  const { collectWin, vfxQueue, triggered: collectTriggered, creditValues } =
    evaluateCollect(grid, state.prizeBoard, state.bet);

  let powerMultiplier: number | null = null;

  if (collectTriggered) {
    const aliveCount = grid[0]!.filter((s) => s === "alive").length;
    let monstersOnBoard = 0;
    for (let c = 1; c < grid.length; c++) {
      for (let r = 0; r < grid[c]!.length; r++) {
        if (grid[c]![r] === "monster") monstersOnBoard++;
      }
    }
    const shots = aliveCount * monstersOnBoard;
    messages.push(
      `It's Alive!（${aliveCount}）× ${monstersOnBoard} 个怪物头像 → ${shots} 道闪电射向奖金板`
    );
    messages.push(`收集奖金 ${collectWin.toLocaleString()} 币`);
    if (state.boardPowered || state.prizeBoard.some((c) => c.multiplier > 1)) {
      resetBoardMultipliers(state.prizeBoard);
      seedRandomMultipliers(state.prizeBoard);
      state.boardPowered = false;
      messages.push("奖金板倍数已重置。");
    }
  }

  const displayCredits = collectTriggered ? creditValues : blankCreditValues(grid);

  const lineWin = evaluateLineWins(grid, state.bet);
  let freeGamesAwarded = 0;
  const scatters = countScatters(grid);
  if (!state.inFreeGames && scatters >= 3) {
    freeGamesAwarded = 8;
    state.freeGamesRemaining = 8;
    state.inFreeGames = true;
    messages.push("免费游戏！获得 8 次 5×5 转轮（不扣赌注）。");
  }

  if (state.inFreeGames) {
    if (isFreeSpin && (reelHas(grid, 0, "free_games") || reelHas(grid, 4, "free_games"))) {
      freeGamesAwarded += 3;
      state.freeGamesRemaining += 3;
      messages.push("免费游戏中 Free Games 再触发 +3 次！");
    }
    if (isFreeSpin) {
      state.freeGamesRemaining--;
      if (state.freeGamesRemaining <= 0) {
        state.inFreeGames = false;
        state.freeGamesRemaining = 0;
        messages.push("免费游戏结束。");
      }
    }
  }

  const grossWin = lineWin + collectWin + boardWin;
  const holdFee = isFreeSpin ? 0 : Math.floor(state.bet * SPIN_HOLD_PERCENT);
  const totalWin = Math.max(0, grossWin - holdFee);
  state.balance += totalWin;
  state.lastWin = totalWin;

  if (holdFee > 0 && grossWin > 0) {
    messages.push(`机台扣留 ${holdFee} 币（模拟赌场 hold）`);
  }

  if (lineWin > 0) {
    messages.push(`线奖合计 ${lineWin.toLocaleString()} 币`);
  }

  return {
    grid,
    creditValues: displayCredits,
    lineWin,
    collectWin,
    boardWin,
    totalWin,
    messages,
    vfxQueue,
    powerUpApplied,
    collectTriggered,
    powerMultiplier,
    freeGamesAwarded,
  };
}
