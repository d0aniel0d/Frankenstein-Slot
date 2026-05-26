import { cellPayout } from "../game/prizeBoard";
import type { PrizeCell } from "../game/types";
import { formatDollars } from "./format";

/** 蓝色奖金格：3×3（与实机一致，共 9 格） */
const PRIZE_GRID_ROWS: number[][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
];

function jackpotCell(
  className: string,
  label: string,
  amountHtml: string,
  id?: string
): string {
  const idAttr = id ? ` id="${id}"` : "";
  return `
    <div class="jp-cell ${className}">
      <div class="jp-cell-fire" aria-hidden="true"></div>
      <div class="jp-cell-gold" aria-hidden="true"></div>
      <div class="jp-cell-content">
        <span class="jp-label">${label}</span>
        <span class="jp-amount led-digits"${idAttr}>${amountHtml}</span>
      </div>
    </div>
  `;
}

function creditCell(board: PrizeCell[], bet: number, idx: number, skew: "left" | "mid" | "right"): string {
  const cell = board[idx]!;
  const payout = cellPayout(cell, bet);
  const mult =
    cell.multiplier > 1 ? `<span class="mult">×${cell.multiplier}</span>` : "";

  return `
    <div class="board-cell credit skew-${skew}${cell.multiplier > 1 ? " powered" : ""}" data-idx="${idx}">
      <div class="cell-electric-glow" aria-hidden="true"></div>
      <div class="cell-electric-fill" aria-hidden="true"></div>
      <div class="cell-electric-rim" aria-hidden="true"></div>
      ${mult}
      <span class="cell-val">${formatDollars(payout)}</span>
    </div>
  `;
}

export function renderPrizePyramid(
  board: PrizeCell[],
  bet: number,
  jackpots: { grand: number; major: number; minor: number; mini: number }
): string {
  const skews: Array<"left" | "mid" | "right"> = ["left", "mid", "right"];
  const gridRows = PRIZE_GRID_ROWS.map(
    (indices) =>
      `<div class="prize-grid-row">${indices
        .map((i, col) => creditCell(board, bet, i, skews[col]!))
        .join("")}</div>`
  ).join("");

  return `
    <div class="prize-ladder cosmic-ladder">
      <section class="jackpot-panel" aria-label="Jackpots">
        <div class="jackpot-panel-neon" aria-hidden="true"></div>
        <div class="jackpot-stack">
          ${jackpotCell("jp-cell--grand", "GRAND", formatDollars(jackpots.grand), "jp-grand")}
          <div class="jackpot-row jp-row-2">
            ${jackpotCell("jp-cell--super", "SUPER", formatDollars(jackpots.major * 0.8), "jp-super")}
            ${jackpotCell("jp-cell--major", "MAJOR", formatDollars(jackpots.major), "jp-major")}
          </div>
          <div class="jackpot-row jp-row-3">
            ${jackpotCell("jp-cell--maxi", "MAXI", formatDollars(jackpots.minor * 1.5), "jp-maxi")}
            ${jackpotCell("jp-cell--minor", "MINOR", formatDollars(jackpots.minor), "jp-minor")}
            ${jackpotCell("jp-cell--mini", "MINI", formatDollars(jackpots.mini), "jp-mini")}
          </div>
        </div>
      </section>

      <section class="prize-grid-panel" aria-label="Prize board">
        <div class="prize-grid-plate" aria-hidden="true"></div>
        <div class="prize-grid" id="prize-board">
          ${gridRows}
        </div>
      </section>
    </div>
  `;
}
