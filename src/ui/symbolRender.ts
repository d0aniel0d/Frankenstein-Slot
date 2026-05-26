import { getSymbolMediaUrl, getSymbolSvg } from "../assets/symbolArt";
import type { SymbolId } from "../game/types";

const failedImages = new Set<SymbolId>();
const pngCache = new Map<SymbolId, HTMLImageElement>();

function svgFallbackHtml(id: SymbolId): string {
  return `<span class="symbol-svg" aria-hidden="true">${getSymbolSvg(id)}</span>`;
}

export function isSymbolPngReady(id: SymbolId): boolean {
  if (failedImages.has(id)) return false;
  const img = pngCache.get(id);
  return !!img && img.naturalWidth > 0;
}

function loadSymbolPng(id: SymbolId): Promise<void> {
  if (failedImages.has(id)) return Promise.resolve();
  const url = getSymbolMediaUrl(id);
  if (!url) return Promise.resolve();

  const cached = pngCache.get(id);
  if (cached?.naturalWidth) return Promise.resolve();

  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = "sync";
    img.onload = () => {
      pngCache.set(id, img);
      resolve();
    };
    img.onerror = () => {
      failedImages.add(id);
      pngCache.delete(id);
      resolve();
    };
    img.src = url;
  });
}

/** 等待 PNG 全部进入缓存后再渲染转轮（避免只显示 SVG） */
export async function ensureSymbolImagesReady(ids: Iterable<SymbolId>): Promise<void> {
  const seen = new Set<SymbolId>();
  const pending: Promise<void>[] = [];
  for (const id of ids) {
    if (seen.has(id)) continue;
    seen.add(id);
    pending.push(loadSymbolPng(id));
  }
  await Promise.all(pending);
}

export function preloadSymbolImages(ids: Iterable<SymbolId>): void {
  void ensureSymbolImagesReady(ids);
}

/** 有 PNG 时只输出 <img>，绝不叠 SVG */
export function symbolInnerHtml(id: SymbolId): string {
  if (failedImages.has(id)) return svgFallbackHtml(id);

  const url = getSymbolMediaUrl(id);
  if (!url) return svgFallbackHtml(id);

  return `<img class="symbol-img" src="${url}" alt="" data-fallback="${id}" decoding="sync" fetchpriority="high" />`;
}

export function spinSymbolCellHtml(id: SymbolId): string {
  return `<div class="symbol symbol-spin-cell ${id}" data-symbol="${id}" aria-hidden="true">
    <div class="symbol-art">${symbolInnerHtml(id)}</div>
  </div>`;
}

export function symbolCellHtml(
  id: SymbolId,
  highlight = false,
  credit: number | null = null,
  row = 0
): string {
  const creditBadge =
    id === "monster" && credit != null && credit > 0
      ? `<span class="credit-badge">${credit.toLocaleString()}</span>`
      : "";
  return `<div class="symbol ${id}${highlight ? " highlight" : ""}" data-symbol="${id}" data-row="${row}">
    <div class="symbol-art">${symbolInnerHtml(id)}</div>
    ${creditBadge}
  </div>`;
}

export function landedColumnHtml(
  col: number,
  symbols: SymbolId[],
  highlight: Set<string>,
  creditValues: (number | null)[][] | null
): string {
  return symbols
    .map((id, row) => {
      const hl = highlight.has(`${col}-${row}`);
      const credit = creditValues?.[col]?.[row] ?? null;
      return symbolCellHtml(id, hl, credit, row);
    })
    .join("");
}

/** 收集闪电射出前才显示怪物头像下的金额（制造悬疑） */
export function revealMonsterCreditBadge(cell: HTMLElement, award: number): void {
  if (!cell.classList.contains("monster")) return;
  let badge = cell.querySelector<HTMLElement>(".credit-badge");
  if (!badge) {
    badge = document.createElement("span");
    badge.className = "credit-badge";
    cell.appendChild(badge);
  }
  const prev = Number(badge.dataset.total ?? "0") || 0;
  const total = prev + award;
  badge.dataset.total = String(total);
  badge.textContent = total.toLocaleString();
  badge.classList.add("credit-badge--revealed");
}

export function clearMonsterCreditBadges(root: ParentNode): void {
  root.querySelectorAll(".symbol.monster .credit-badge").forEach((el) => el.remove());
}

export function bindSymbolImageFallbacks(root: ParentNode): void {
  root.querySelectorAll<HTMLImageElement>(".symbol-img[data-fallback]").forEach((img) => {
    if (img.dataset.bound) return;
    img.dataset.bound = "1";

    const id = img.dataset.fallback as SymbolId;
    if (isSymbolPngReady(id)) {
      img.classList.add("ready");
    }

    img.addEventListener("error", () => {
      failedImages.add(id);
      pngCache.delete(id);
      const art = img.closest(".symbol-art");
      img.remove();
      if (art && !art.querySelector(".symbol-svg")) {
        art.insertAdjacentHTML("afterbegin", svgFallbackHtml(id));
      }
    });
  });
}
