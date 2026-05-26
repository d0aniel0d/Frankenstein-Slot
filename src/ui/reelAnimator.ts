import { REEL_STRIPS } from "../game/config";
import type { SymbolId } from "../game/types";
import {
  playAnticipationReelLand,
  playFreeGamesLand,
  playReelSpinTick,
  playReelStop,
  playReelTeaseTick,
  startReelTeasePulse,
  stopReelTeasePulse,
} from "./sounds";
import {
  bindSymbolImageFallbacks,
  clearMonsterCreditBadges,
  ensureSymbolImagesReady,
  landedColumnHtml,
  spinSymbolCellHtml,
} from "./symbolRender";

const REEL_COUNT = 5;

/** It's Alive 时：后面几列转更久，第 5 轴额外拖尾 */
const ALIVE_EXTRA_SPIN_MS = [0, 280, 480, 720, 2100];
const ALIVE_FINAL_TEASE_MS = 1600;

export function symbolHeightForRows(rows: number): number {
  return rows <= 3 ? 62 : 48;
}

function buildStrip(reelIndex: number, finalColumn: SymbolId[]): SymbolId[] {
  const base = REEL_STRIPS[reelIndex]!;
  const prefixLen = 24 + reelIndex * 4;
  const prefix: SymbolId[] = [];
  let ptr = Math.floor(Math.random() * base.length);
  for (let i = 0; i < prefixLen; i++) {
    prefix.push(base[ptr % base.length]!);
    ptr++;
  }
  return [...prefix, ...finalColumn];
}

function stripHtml(symbols: SymbolId[]): string {
  return symbols.map((id) => spinSymbolCellHtml(id)).join("");
}

function snapLandedStrip(
  stripEl: HTMLElement,
  finalCol: SymbolId[],
  col: number,
  hlRows: Set<number>,
  creditValues: (number | null)[][]
): void {
  const highlight = new Set<string>();
  hlRows.forEach((r) => highlight.add(`${col}-${r}`));
  stripEl.style.transition = "none";
  stripEl.style.transform = "translate3d(0, 0, 0)";
  stripEl.innerHTML = landedColumnHtml(col, finalCol, highlight, creditValues);
  stripEl.classList.add("landed", "landed-snap");
}

function wait(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function spinTiming(col: number, aliveCollectTease: boolean): { spinMs: number; delay: number; teaseMs: number } {
  const baseSpin = 500 + col * 85;
  const baseDelay = 70 + col * 200;
  if (!aliveCollectTease) {
    return { spinMs: baseSpin, delay: baseDelay, teaseMs: 0 };
  }
  return {
    spinMs: baseSpin + (ALIVE_EXTRA_SPIN_MS[col] ?? 0),
    delay: baseDelay,
    teaseMs: col === 4 ? ALIVE_FINAL_TEASE_MS : 0,
  };
}

async function runTeaseCreep(
  colEl: HTMLElement,
  stripEl: HTMLElement,
  symH: number,
  targetY: number,
  teaseMs: number,
  col: number
): Promise<void> {
  colEl.classList.add("reel-tease");
  if (col === 4) {
    colEl.classList.add("reel-tease--final");
    startReelTeasePulse();
  }

  const t0 = performance.now();
  let lastSfx = 0;
  let creepY = Math.max(0, targetY - symH * 2);

  await new Promise<void>((resolve) => {
    const tick = (now: number) => {
      const elapsed = now - t0;
      if (elapsed >= teaseMs) {
        resolve();
        return;
      }
      const pulse = 0.5 + 0.5 * Math.sin(elapsed * 0.012);
      creepY += symH * (0.22 + pulse * 0.18);
      if (creepY > targetY + symH * 5) creepY = targetY - symH * 2;
      stripEl.style.transition = "none";
      stripEl.style.transform = `translate3d(0, ${-Math.round(creepY / symH) * symH}px, 0)`;
      if (now - lastSfx > 95) {
        lastSfx = now;
        playReelTeaseTick(col);
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  colEl.classList.remove("reel-tease", "reel-tease--final");
  if (col === 4) stopReelTeasePulse();
}

export async function mountReels(
  container: HTMLElement,
  rows: number,
  grid: SymbolId[][] | null,
  highlight: Set<string>,
  creditValues: (number | null)[][] | null = null
): Promise<void> {
  const ids = new Set<SymbolId>();
  if (grid) grid.flat().forEach((id) => ids.add(id));
  else REEL_STRIPS.forEach((strip) => strip.forEach((id) => ids.add(id)));
  await ensureSymbolImagesReady(ids);
  const symH = symbolHeightForRows(rows);
  container.style.setProperty("--rows", String(rows));
  container.style.setProperty("--symbol-h", `${symH}px`);

  container.innerHTML = Array.from({ length: REEL_COUNT }, (_, c) => {
    const finalCol =
      grid?.[c] ??
      Array.from({ length: rows }, (_, r) => REEL_STRIPS[c]![r % REEL_STRIPS[c]!.length]!);
    return `
      <div class="reel-column" data-reel="${c}">
        <div class="reel-window">
          <div class="reel-strip landed landed-snap">
            ${landedColumnHtml(c, finalCol, highlight, creditValues)}
          </div>
        </div>
      </div>
    `;
  }).join("");

  bindSymbolImageFallbacks(container);
}

export type SpinAnimationHooks = {
  /** 某一列停轮并完成落点渲染后调用（第 1 列 = 0） */
  onReelLanded?: (col: number, column: SymbolId[]) => void | Promise<void>;
};

export type SpinAnimationOptions = {
  /** 第 1 列含 It's Alive：后面列转更久 + 第 5 轴拖尾 */
  aliveCollectTease?: boolean;
};

export async function playSpinAnimation(
  container: HTMLElement,
  grid: SymbolId[][],
  highlight: Set<string>,
  creditValues: (number | null)[][],
  hooks?: SpinAnimationHooks,
  options?: SpinAnimationOptions
): Promise<void> {
  const aliveCollectTease = options?.aliveCollectTease ?? false;
  clearMonsterCreditBadges(container);
  const rows = grid[0]!.length;
  const symH = symbolHeightForRows(rows);
  container.style.setProperty("--rows", String(rows));
  container.style.setProperty("--symbol-h", `${symH}px`);

  if (aliveCollectTease) {
    container.classList.add("spin-alive-tease");
  }

  type ReelRuntime = {
    colEl: HTMLElement;
    stripEl: HTMLElement;
    finalCol: SymbolId[];
    stopIndex: number;
    targetY: number;
    hlRows: Set<number>;
    spinMs: number;
    delay: number;
    teaseMs: number;
    col: number;
  };

  const runtimes: ReelRuntime[] = [];
  container.innerHTML = "";

  const preloadIds = new Set<SymbolId>(grid.flat());
  for (let c = 0; c < REEL_COUNT; c++) {
    buildStrip(c, grid[c]!).forEach((id) => preloadIds.add(id));
    REEL_STRIPS[c]!.forEach((id) => preloadIds.add(id));
  }
  await ensureSymbolImagesReady(preloadIds);

  for (let c = 0; c < REEL_COUNT; c++) {
    const finalCol = grid[c]!;
    const strip = buildStrip(c, finalCol);
    const stopIndex = strip.length - rows;
    const targetY = stopIndex * symH;
    const { spinMs, delay, teaseMs } = spinTiming(c, aliveCollectTease);

    const hlRows = new Set<number>();
    for (let r = 0; r < rows; r++) {
      if (highlight.has(`${c}-${r}`)) hlRows.add(r);
    }

    const colEl = document.createElement("div");
    colEl.className = "reel-column";
    colEl.dataset.reel = String(c);
    if (aliveCollectTease && c >= 2) {
      colEl.classList.add("reel-pending-tease");
    }

    const windowEl = document.createElement("div");
    windowEl.className = "reel-window";

    const stripEl = document.createElement("div");
    stripEl.className = "reel-strip";
    stripEl.innerHTML = stripHtml(strip);

    windowEl.appendChild(stripEl);
    colEl.appendChild(windowEl);
    container.appendChild(colEl);

    runtimes.push({
      colEl,
      stripEl,
      finalCol,
      stopIndex,
      targetY,
      hlRows,
      spinMs,
      delay,
      teaseMs,
      col: c,
    });
  }

  bindSymbolImageFallbacks(container);

  await Promise.all(
    runtimes.map(
      ({ colEl, stripEl, finalCol, targetY, hlRows, spinMs, delay, teaseMs, col }) =>
        (async () => {
          await wait(delay);
          colEl.classList.add("is-spinning");
          if (aliveCollectTease && col >= 2) {
            colEl.classList.add("reel-anticipation-spin");
          }

          const extraRows = 4 + col + Math.floor(Math.random() * 2);
          const cruiseEnd = Math.max(0, targetY - extraRows * symH);
          const t0 = performance.now();
          let lastSpinSfx = 0;

          await new Promise<void>((resolve) => {
            const tick = (now: number) => {
              const t = Math.min(1, (now - t0) / spinMs);
              const eased = 1 - (1 - t) ** 2;
              const y = Math.round((cruiseEnd * eased) / symH) * symH;
              stripEl.style.transition = "none";
              stripEl.style.transform = `translate3d(0, ${-y}px, 0)`;
              if (now - lastSpinSfx > 72) {
                lastSpinSfx = now;
                playReelSpinTick(col);
              }
              if (t < 1) requestAnimationFrame(tick);
              else resolve();
            };
            requestAnimationFrame(tick);
          });

          if (teaseMs > 0) {
            await runTeaseCreep(colEl, stripEl, symH, targetY, teaseMs, col);
          }

          colEl.classList.remove("is-spinning", "reel-anticipation-spin", "reel-pending-tease");
          snapLandedStrip(stripEl, finalCol, col, hlRows, creditValues);
          colEl.classList.add("landed");

          const freeGamesCount = finalCol.filter((id) => id === "free_games").length;
          if (freeGamesCount > 0) {
            for (let i = 0; i < freeGamesCount; i++) {
              if (i > 0) await wait(130);
              playFreeGamesLand();
            }
          } else if (aliveCollectTease && col >= 1) {
            playAnticipationReelLand(col);
          } else {
            playReelStop(col);
          }

          void hooks?.onReelLanded?.(col, finalCol);

          colEl.classList.add("reel-bounce");
          setTimeout(() => colEl.classList.remove("reel-bounce"), 280);
        })()
    )
  );

  container.classList.remove("spin-alive-tease");
  bindSymbolImageFallbacks(container);
}
