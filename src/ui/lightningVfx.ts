import type { GridPos, SymbolId, VfxCommand } from "../game/types";
import { aliveRowsOnReel1 } from "./collectPhase";
import { formatDollars } from "./format";
import { revealMonsterCreditBadge } from "./symbolRender";
import {
  playAliveReelLand,
  playCollectCoin,
  playLightning,
  playPowerUp,
  startCollectAnticipation,
  startCollectClimax,
  stopCollectAnticipation,
} from "./sounds";

function wait(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function pointInContainer(el: Element, container: HTMLElement): { x: number; y: number } {
  const c = container.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  return {
    x: r.left + r.width / 2 - c.left,
    y: r.top + r.height / 2 - c.top,
  };
}

function reelCell(reels: HTMLElement, col: number, row: number): Element | null {
  return reels.querySelector(
    `.reel-column[data-reel="${col}"] .symbol[data-row="${row}"]`
  );
}

function buildBoltPath(x1: number, y1: number, x2: number, y2: number, jitter = 22): string {
  const segments = 14;
  let d = `M ${x1} ${y1}`;
  for (let i = 1; i < segments; i++) {
    const t = i / segments;
    const x = x1 + (x2 - x1) * t + (Math.random() - 0.5) * jitter;
    const y = y1 + (y2 - y1) * t + (Math.random() - 0.5) * (jitter * 0.5);
    d += ` L ${x} ${y}`;
  }
  d += ` L ${x2} ${y2}`;
  return d;
}

function ensureSvgDefs(svg: SVGSVGElement): void {
  if (svg.querySelector("#bolt-glow")) return;
  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  defs.innerHTML = `
    <filter id="bolt-glow" x="-80%" y="-80%" width="260%" height="260%">
      <feGaussianBlur stdDeviation="4" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <filter id="bolt-glow-intense" x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur stdDeviation="7" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  `;
  svg.appendChild(defs);
}

function getOrCreateOverlay(cabinet: HTMLElement): HTMLElement {
  let overlay = cabinet.querySelector<HTMLElement>(".cabinet-vfx-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "cabinet-vfx-overlay";
    cabinet.appendChild(overlay);
  }
  return overlay;
}

function spawnSparks(overlay: HTMLElement, x: number, y: number, count = 6): void {
  for (let i = 0; i < count; i++) {
    const s = document.createElement("div");
    s.className = "spark";
    s.style.left = `${x}px`;
    s.style.top = `${y}px`;
    const angle = Math.random() * Math.PI * 2;
    const dist = 24 + Math.random() * 50;
    s.style.setProperty("--tx", `${Math.cos(angle) * dist}px`);
    s.style.setProperty("--ty", `${Math.sin(angle) * dist}px`);
    overlay.appendChild(s);
    setTimeout(() => s.remove(), 500);
  }
}

function flashScreen(overlay: HTMLElement, strong = false): void {
  const f = document.createElement("div");
  f.className = strong ? "screen-flash screen-flash--strong" : "screen-flash";
  overlay.appendChild(f);
  requestAnimationFrame(() => f.classList.add("on"));
  setTimeout(() => f.remove(), strong ? 180 : 120);
}

function sortShots(a: GridPos, b: GridPos): number {
  if (a.col !== b.col) return a.col - b.col;
  return a.row - b.row;
}

/**
 * 阶段 1：第 1 列停到 It's Alive，其余列仍在转。
 * 外框闪电 + It's Alive 震动 + 激烈环境音。
 */
export function playAliveAnticipation(cabinet: HTMLElement, grid: SymbolId[][]): void {
  const reelsWrap = cabinet.querySelector<HTMLElement>(".reels-wrap");
  const reels = cabinet.querySelector<HTMLElement>("#reels");
  if (!reelsWrap || !reels) return;

  startCollectAnticipation();
  playAliveReelLand();

  const overlay = getOrCreateOverlay(cabinet);
  overlay.classList.add("active", "anticipation-phase");
  cabinet.classList.add("collect-active", "anticipation-active");

  reelsWrap.classList.add("collect-anticipation", "electric-frame", "collect-dim");

  const col0 = reels.querySelector<HTMLElement>('.reel-column[data-reel="0"]');
  col0?.classList.add("alive-column");

  for (const row of aliveRowsOnReel1(grid)) {
    const cell = reelCell(reels, 0, row);
    cell?.classList.add("alive-shake", "alive-pulse");
  }

  refreshMonsterElectrified(reels);
}

/** 第 1 列 It's Alive 时：转轮上所有怪物头像变蓝（被电击） */
export function refreshMonsterElectrified(reels: HTMLElement): void {
  reels.querySelectorAll(".symbol.monster").forEach((cell) => {
    cell.classList.add("monster-electrified");
  });
}

function clearAnticipationClasses(cabinet: HTMLElement): void {
  const reelsWrap = cabinet.querySelector<HTMLElement>(".reels-wrap");
  const reels = cabinet.querySelector<HTMLElement>("#reels");
  reelsWrap?.classList.remove("collect-anticipation", "electric-frame", "collect-dim");
  cabinet.classList.remove("anticipation-active");

  reels?.querySelectorAll(".alive-column").forEach((el) => el.classList.remove("alive-column"));
  reels?.querySelectorAll(".alive-shake, .alive-pulse").forEach((el) => {
    el.classList.remove("alive-shake", "alive-pulse");
  });
  reels?.querySelectorAll(".monster-electrified").forEach((el) => {
    el.classList.remove("monster-electrified");
  });
}

async function shootOneBolt(
  cabinet: HTMLElement,
  overlay: HTMLElement,
  svg: SVGSVGElement,
  reels: HTMLElement,
  reelsWrap: HTMLElement,
  cmd: Extract<VfxCommand, { action: "SHOOT_LIGHTNING_TO_BOARD" }>,
  intense: boolean
): Promise<void> {
  const board = cabinet.querySelector<HTMLElement>("#prize-board");
  const startEl = reelCell(reels, cmd.reelPos.col, cmd.reelPos.row);
  const endEl = board?.querySelector(`[data-idx="${cmd.boardIndex}"]`);
  if (!startEl || !endEl) return;

  revealMonsterCreditBadge(startEl as HTMLElement, cmd.award);
  await wait(intense ? 220 : 160);

  startEl.classList.add("monster-ignite");
  await wait(intense ? 380 : 280);
  startEl.classList.add("monster-collecting");
  endEl.classList.add("board-hit");
  reelsWrap.classList.add("electric-frame", "collect-climax");

  const start = pointInContainer(startEl, cabinet);
  const end = pointInContainer(endEl, cabinet);

  playLightning();
  flashScreen(overlay, true);

  const filter = intense ? "url(#bolt-glow-intense)" : "url(#bolt-glow)";
  const paths: SVGPathElement[] = [];
  for (let i = 0; i < (intense ? 3 : 2); i++) {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute(
      "d",
      buildBoltPath(
        start.x + (i - 1) * 6,
        start.y,
        end.x + (i - 1) * 4,
        end.y,
        intense ? 32 : 22
      )
    );
    path.setAttribute("class", `lightning-bolt${i > 0 ? " branch" : ""}${intense ? " intense" : ""}`);
    path.setAttribute("filter", filter);
    svg.appendChild(path);
    paths.push(path);
    requestAnimationFrame(() => path.classList.add("show"));
  }

  spawnSparks(overlay, end.x, end.y, intense ? 14 : 8);
  spawnSparks(overlay, start.x, start.y, intense ? 8 : 4);
  spawnSparks(overlay, (start.x + end.x) / 2, (start.y + end.y) / 2, 6);

  const popup = document.createElement("div");
  popup.className = "board-win-popup";
  popup.textContent = `+${formatDollars(cmd.award)}`;
  popup.style.left = `${end.x}px`;
  popup.style.top = `${end.y}px`;
  overlay.appendChild(popup);

  await wait(intense ? 620 : 480);
  playCollectCoin();

  paths.forEach((p) => p.remove());
  popup.remove();
  endEl.classList.remove("board-hit");
  startEl.classList.remove("monster-collecting", "monster-ignite", "highlight");
}

/**
 * 阶段 2：五轴停齐后，怪物依次变蓝放大并射闪电（最激烈）。
 */
export async function playCollectClimax(
  cabinet: HTMLElement,
  queue: VfxCommand[]
): Promise<void> {
  const reelsWrap = cabinet.querySelector<HTMLElement>(".reels-wrap");
  const reels = cabinet.querySelector<HTMLElement>("#reels");
  const board = cabinet.querySelector<HTMLElement>("#prize-board");
  if (!reelsWrap || !reels || !board) return;

  const shots = queue.filter(
    (c): c is Extract<VfxCommand, { action: "SHOOT_LIGHTNING_TO_BOARD" }> =>
      c.action === "SHOOT_LIGHTNING_TO_BOARD"
  );
  if (shots.length === 0) return;

  startCollectClimax();
  clearAnticipationClasses(cabinet);

  const overlay = getOrCreateOverlay(cabinet);
  overlay.innerHTML = "";
  overlay.classList.add("active", "climax-phase");

  const multBanner = document.createElement("div");
  multBanner.className = "multiplier-banner";
  overlay.appendChild(multBanner);

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", "lightning-svg");
  overlay.appendChild(svg);
  ensureSvgDefs(svg);

  const resize = () => {
    const w = cabinet.clientWidth;
    const h = cabinet.clientHeight;
    svg.setAttribute("width", String(w));
    svg.setAttribute("height", String(h));
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
  };
  resize();

  cabinet.classList.add("collect-active", "collect-climax-active");
  reelsWrap.classList.add("collect-dim", "electric-frame", "collect-climax");
  flashScreen(overlay, true);
  await wait(280);

  const uniqueMonsters = [...shots]
    .map((s) => s.reelPos)
    .filter(
      (pos, i, arr) => arr.findIndex((p) => p.col === pos.col && p.row === pos.row) === i
    )
    .sort(sortShots);

  for (const pos of uniqueMonsters) {
    reelCell(reels, pos.col, pos.row)?.classList.add("highlight");
  }
  await wait(200);

  for (const cmd of shots) {
    await shootOneBolt(cabinet, overlay, svg, reels, reelsWrap, cmd, true);
  }

  for (const cmd of queue) {
    if (cmd.action === "SHOW_MULTIPLIER") {
      playPowerUp();
      multBanner.textContent = `POWER UP ×${cmd.value}`;
      multBanner.classList.add("show");
      flashScreen(overlay, true);
      await wait(900);
      multBanner.classList.remove("show");
    }
  }

  stopCollectAnticipation();
  reelsWrap.classList.remove("collect-dim", "electric-frame", "collect-climax", "collect-anticipation");
  cabinet.classList.remove(
    "collect-active",
    "anticipation-active",
    "collect-climax-active"
  );
  overlay.classList.remove("active", "anticipation-phase", "climax-phase");
  overlay.innerHTML = "";
}

/** 入口：有收集则分阶段，否则只播 Power Up 等 */
export async function playVfxQueue(
  cabinet: HTMLElement,
  queue: VfxCommand[]
): Promise<void> {
  if (queue.length === 0) return;

  const hasCollect = queue.some((c) => c.action === "SHOOT_LIGHTNING_TO_BOARD");
  if (hasCollect) {
    await playCollectClimax(cabinet, queue);
    return;
  }

  for (const cmd of queue) {
    if (cmd.action === "SHOW_MULTIPLIER") {
      const overlay = getOrCreateOverlay(cabinet);
      overlay.classList.add("active");
      const multBanner = document.createElement("div");
      multBanner.className = "multiplier-banner";
      overlay.appendChild(multBanner);
      playPowerUp();
      multBanner.textContent = `POWER UP ×${cmd.value}`;
      multBanner.classList.add("show");
      flashScreen(overlay);
      await wait(900);
      multBanner.classList.remove("show");
      overlay.classList.remove("active");
      overlay.innerHTML = "";
    }
  }
}

export function endAliveAnticipationIfAny(cabinet: HTMLElement): void {
  clearAnticipationClasses(cabinet);
  stopCollectAnticipation();
  cabinet.classList.remove("collect-active", "anticipation-active");
  const overlay = cabinet.querySelector(".cabinet-vfx-overlay");
  overlay?.classList.remove("anticipation-phase", "active");
}
