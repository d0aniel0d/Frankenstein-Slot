import "./styles.css";
import "./cosmic-cabinet.css";
import { publicUrl } from "./publicUrl";

document.documentElement.style.setProperty(
  "--cabinet-graveyard-bg",
  `url(${publicUrl("bg/graveyard-scenery.png?v=4")})`
);
import { BET_OPTIONS, FREE_GAME_ROWS, REEL_STRIPS } from "./game/config";
import { blankCreditValues } from "./game/creditValues";
import { ensureSymbolImagesReady } from "./ui/symbolRender";
import { createGameState, spin } from "./game/slotEngine";
import { tickJackpots } from "./game/prizeBoard";
import type { SpinResult, SymbolId } from "./game/types";
import { formatDollars, formatDollarsExact } from "./ui/format";
import { shouldPlayAliveAnticipation } from "./ui/collectPhase";
import {
  endAliveAnticipationIfAny,
  playAliveAnticipation,
  playVfxQueue,
  refreshMonsterElectrified,
} from "./ui/lightningVfx";
import { initCabinetAmbient, startCabinetHum } from "./ui/cabinetAmbient";
import {
  renderCabinetFooter,
  renderDisplayStackClose,
  renderDisplayStackOpen,
  renderPrizeZoneShell,
  renderSceneryZoneClose,
  renderSceneryZoneOpen,
  renderTopper,
} from "./ui/cabinetChrome";
import { renderPrizePyramid } from "./ui/prizeBoardLayout";
import { mountReels, playSpinAnimation } from "./ui/reelAnimator";
import {
  initAudio,
  playBigWin,
  playSpinStart,
  setMuted,
} from "./ui/sounds";

const state = createGameState();
let spinning = false;
let jackpots = tickJackpots();
let lastGrid: SymbolId[][] | null = null;
let lastCreditValues: (number | null)[][] | null = null;

function renderApp(): void {
  const app = document.getElementById("app");
  if (!app) return;

  app.innerHTML = `
    <div class="cabinet cosmic-cabinet">
      <div class="cosmic-fiber cosmic-fiber--left" aria-hidden="true"></div>
      <div class="cosmic-fiber cosmic-fiber--right" aria-hidden="true"></div>
      <div class="cabinet-bezel">
        ${renderTopper()}
        ${renderSceneryZoneOpen()}
        ${renderDisplayStackOpen()}
        ${renderPrizeZoneShell()}
        ${renderDisplayStackClose()}
        <section class="game-stage">
          <div class="reels-wrap ${state.inFreeGames ? "free-mode" : ""}">
            <div class="reel-electric-frame"></div>
            <div class="reels" id="reels"></div>
            ${state.inFreeGames ? `<div class="free-badge">FREE GAMES · ${state.freeGamesRemaining}</div>` : ""}
          </div>
          <div class="demo-badge">DEMO</div>
        </section>
        ${renderSceneryZoneClose()}

        <div class="button-deck">
          <div class="deck-fiber" aria-hidden="true"></div>
          <div class="hud-bar">
            <div class="hud-panel cash">
              <span class="hud-label">CASH</span>
              <span class="hud-value" id="balance">${formatDollarsExact(state.balance)}</span>
            </div>
            <div class="hud-panel bonus-win featured ${state.lastWin > 0 ? "active" : ""}">
              <span class="hud-label">BONUS WIN</span>
              <span class="hud-value" id="bonus-win">${formatDollarsExact(state.lastWin)}</span>
            </div>
            <div class="hud-panel bet">
              <span class="hud-label">TOTAL BET</span>
              <span class="hud-value" id="bet">${formatDollarsExact(state.bet)}</span>
            </div>
          </div>

          <footer class="controls">
            <div class="bet-picker" id="bet-picker"></div>
            <button class="spin-btn" id="spin-btn" ${spinning ? "disabled" : ""}>
              <span class="spin-btn-glow"></span>
              <span class="spin-btn-text">${spinning ? "SPINNING" : "SPIN"}</span>
            </button>
            <div class="ctrl-row">
              <button type="button" class="mute-btn" id="mute-btn" title="音效">🔊</button>
              <button class="reset-btn" id="reset-btn">重置</button>
            </div>
          </footer>
        </div>

        <section class="messages" id="messages"></section>
        ${renderCabinetFooter()}
      </div>
    </div>
  `;

  renderLadder();
  initCabinetAmbient();
  renderReelsPlaceholder();
  renderBetPicker();
  bindEvents();
}

function renderLadder(): void {
  const el = document.getElementById("ladder-section");
  if (!el) return;
  el.innerHTML = renderPrizePyramid(state.prizeBoard, state.bet, jackpots);
}

function renderReelsPlaceholder(): void {
  const reels = document.getElementById("reels");
  if (!reels) return;
  const rows = state.inFreeGames ? FREE_GAME_ROWS : 3;
  void mountReels(reels, rows, lastGrid, new Set(), lastCreditValues);
}

function renderBetPicker(): void {
  const picker = document.getElementById("bet-picker");
  if (!picker) return;
  picker.innerHTML = BET_OPTIONS.map(
    (b) =>
      `<button type="button" class="bet-opt ${b === state.bet ? "active" : ""}" data-bet="${b}">${formatDollars(b)}</button>`
  ).join("");
}

function setMessages(msgs: string[]): void {
  const el = document.getElementById("messages");
  if (!el) return;
  el.innerHTML = msgs.length
    ? msgs.map((m) => `<p>${m}</p>`).join("")
    : `<p class="muted">按 SPIN — 虚拟币演示</p>`;
}

function updateHud(): void {
  const bal = document.getElementById("balance");
  const bet = document.getElementById("bet");
  const win = document.getElementById("bonus-win");
  if (bal) bal.textContent = formatDollarsExact(state.balance);
  if (bet) bet.textContent = formatDollarsExact(state.bet);
  if (win) win.textContent = formatDollarsExact(state.lastWin);
  document.querySelector(".bonus-win")?.classList.toggle("active", state.lastWin > 0);
}

function bindEvents(): void {
  document.getElementById("spin-btn")?.addEventListener("click", () => void doSpin());
  document.getElementById("reset-btn")?.addEventListener("click", () => {
    const fresh = createGameState();
    Object.assign(state, fresh);
    state.bet = BET_OPTIONS[1] ?? 25;
    renderApp();
    setMessages(["钱包已重置。"]);
  });
  document.getElementById("mute-btn")?.addEventListener("click", (e) => {
    const btn = e.currentTarget as HTMLButtonElement;
    const soundOn = btn.textContent === "🔊";
    setMuted(soundOn);
    btn.textContent = soundOn ? "🔇" : "🔊";
  });
  document.getElementById("bet-picker")?.addEventListener("click", (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>(".bet-opt");
    if (!btn || spinning) return;
    state.bet = Number(btn.dataset.bet);
    renderLadder();
    document.querySelectorAll(".bet-opt").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    updateHud();
  });
}

function buildHighlightSet(result: SpinResult): Set<string> {
  const highlight = new Set<string>();
  for (const cmd of result.vfxQueue) {
    if (cmd.action === "SHOOT_LIGHTNING_TO_BOARD") {
      highlight.add(`${cmd.reelPos.col}-${cmd.reelPos.row}`);
    }
    if (cmd.action === "HIGHLIGHT_CELL") {
      highlight.add(`${cmd.pos.col}-${cmd.pos.row}`);
    }
  }
  return highlight;
}

async function doSpin(): Promise<void> {
  if (spinning) return;
  initAudio();
  startCabinetHum();
  spinning = true;
  document.getElementById("spin-btn")?.setAttribute("disabled", "true");
  playSpinStart();

  const reelsEl = document.getElementById("reels");
  const wrap = reelsEl?.closest(".reels-wrap");

  const result = spin(state);
  if ("error" in result) {
    setMessages([result.error]);
    spinning = false;
    document.getElementById("spin-btn")?.removeAttribute("disabled");
    return;
  }

  lastGrid = result.grid;
  lastCreditValues = result.creditValues;
  const highlight = buildHighlightSet(result);

  wrap?.classList.add("spinning");
  reelsEl?.classList.add("spinning");

  const cabinet = document.querySelector<HTMLElement>(".cabinet");
  let aliveAnticipationStarted = false;

  const aliveTease = shouldPlayAliveAnticipation(result.grid);
  const spinCredits = blankCreditValues(result.grid);

  await playSpinAnimation(
    reelsEl!,
    result.grid,
    highlight,
    spinCredits,
    {
      onReelLanded(col) {
        if (!cabinet) return;
        if (col === 0 && aliveTease) {
          aliveAnticipationStarted = true;
          playAliveAnticipation(cabinet, result.grid);
        }
        if (aliveAnticipationStarted) {
          const reels = document.getElementById("reels");
          if (reels) refreshMonsterElectrified(reels);
        }
      },
    },
    { aliveCollectTease: aliveTease }
  );

  wrap?.classList.remove("spinning");
  reelsEl?.classList.remove("spinning");

  if (result.vfxQueue.length > 0 && cabinet) {
    await playVfxQueue(cabinet, result.vfxQueue);
  } else if (aliveAnticipationStarted && cabinet) {
    endAliveAnticipationIfAny(cabinet);
  }

  renderLadder();
  updateHud();
  setMessages(result.messages);

  if (result.totalWin > 0) {
    document.querySelector(".cabinet")?.classList.add("win-flash");
    setTimeout(() => document.querySelector(".cabinet")?.classList.remove("win-flash"), 700);
    if (result.totalWin >= state.bet * 8) playBigWin();
  }

  if (result.freeGamesAwarded > 0) {
    setTimeout(() => renderApp(), 900);
  }

  spinning = false;
  document.getElementById("spin-btn")?.removeAttribute("disabled");
}

setInterval(() => {
  jackpots = tickJackpots();
  const set = (id: string, v: number) => {
    const el = document.getElementById(id);
    if (el) el.textContent = formatDollars(v);
  };
  set("jp-grand", jackpots.grand);
  set("jp-super", jackpots.major * 0.8);
  set("jp-major", jackpots.major);
  set("jp-maxi", jackpots.minor * 1.5);
  set("jp-minor", jackpots.minor);
  set("jp-mini", jackpots.mini);
}, 2200);

renderApp();
void ensureSymbolImagesReady(REEL_STRIPS.flat());
setMessages([]);
