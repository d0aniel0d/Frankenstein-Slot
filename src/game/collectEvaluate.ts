import { awardMonsterFromBoard } from "./prizeBoard";
import type { GridPos, PrizeCell, SymbolId, VfxCommand } from "./types";

export interface MonsterHit {
  coordinates: GridPos;
}

function emptyCredits(grid: SymbolId[][]): (number | null)[][] {
  return grid.map((col) => col.map(() => null));
}

/** 第 1 列是否有 It's Alive（触发条件） */
export function countAliveOnReel1(grid: SymbolId[][]): number {
  return grid[0]?.filter((s) => s === "alive").length ?? 0;
}

/** 第 2–5 列（index 1–4）上的科学怪人头像 */
export function findMonstersOnReels2to5(grid: SymbolId[][]): MonsterHit[] {
  const hits: MonsterHit[] = [];
  for (let col = 1; col < grid.length; col++) {
    for (let row = 0; row < grid[col]!.length; row++) {
      if (grid[col]![row] === "monster") {
        hits.push({ coordinates: { col, row } });
      }
    }
  }
  return hits;
}

/**
 * 真机逻辑：第 1 列 It's Alive + 第 2–5 列怪物头像；
 * 五轴停完后，每个（It's Alive × 每个怪物）从头像射闪电到上方奖金板一格并领取该格金额。
 */
export function evaluateCollect(
  grid: SymbolId[][],
  prizeBoard: PrizeCell[],
  bet: number
): {
  collectWin: number;
  vfxQueue: VfxCommand[];
  triggered: boolean;
  creditValues: (number | null)[][];
} {
  const creditValues = emptyCredits(grid);
  const aliveCount = countAliveOnReel1(grid);
  const monsters = findMonstersOnReels2to5(grid);

  if (aliveCount === 0 || monsters.length === 0) {
    return { collectWin: 0, vfxQueue: [], triggered: false, creditValues };
  }

  let collectWin = 0;
  const vfxQueue: VfxCommand[] = [];

  for (const monster of monsters) {
    const { col, row } = monster.coordinates;
    for (let k = 0; k < aliveCount; k++) {
      const { payout, cellIndex } = awardMonsterFromBoard(prizeBoard, bet);
      collectWin += payout;
      creditValues[col]![row] = (creditValues[col]![row] ?? 0) + payout;

      vfxQueue.push({
        action: "SHOOT_LIGHTNING_TO_BOARD",
        reelPos: monster.coordinates,
        boardIndex: cellIndex,
        award: payout,
      });
    }
  }

  return { collectWin, vfxQueue, triggered: true, creditValues };
}
