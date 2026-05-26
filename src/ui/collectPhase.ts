import type { SymbolId } from "../game/types";
import { countAliveOnReel1, findMonstersOnReels2to5 } from "../game/collectEvaluate";

/** 第 1 列停到 It's Alive → 立刻进入激烈期待演出（与后面是否有怪物无关） */
export function shouldPlayAliveAnticipation(grid: SymbolId[][]): boolean {
  return countAliveOnReel1(grid) > 0;
}

/** 五轴停齐后是否有收集闪电（需要 It's Alive + 第 2–5 列怪物） */
export function shouldRunCollectClimax(grid: SymbolId[][]): boolean {
  return countAliveOnReel1(grid) > 0 && findMonstersOnReels2to5(grid).length > 0;
}

export function aliveRowsOnReel1(grid: SymbolId[][]): number[] {
  const rows: number[] = [];
  grid[0]?.forEach((sym, row) => {
    if (sym === "alive") rows.push(row);
  });
  return rows;
}
