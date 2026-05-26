import type { SymbolId } from "./types";

/** 未触发收集时，转轮上不显示金额 */
export function blankCreditValues(grid: SymbolId[][]): (number | null)[][] {
  return grid.map((col) => col.map(() => null));
}
