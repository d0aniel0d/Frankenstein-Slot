import { publicUrl } from "../publicUrl";

/** Cosmic 竖屏：顶屏（上） + 墓地全景（中下） */
const BG_ASSET_V = "5";

export function renderTopper(): string {
  return `
    <header class="topper" aria-label="Frankenstein topper">
      <div class="topper-fire-back" aria-hidden="true"></div>
      <img
        class="topper-hero-img"
        src="${publicUrl(`bg/topper-portrait.png?v=${BG_ASSET_V}`)}"
        alt="Frankenstein portrait"
        width="1024"
        height="1001"
        decoding="async"
      />
      <div class="topper-fire-front" aria-hidden="true"></div>
      <div class="topper-ember-particles" aria-hidden="true"></div>
    </header>
  `;
}

/** 奖金板 + 转轮共用的墓地背景层 */
export function renderSceneryZoneOpen(): string {
  return `
    <div class="scenery-zone">
      <div class="scenery-graveyard" aria-hidden="true"></div>
      <div class="scenery-mist" aria-hidden="true"></div>
      <div class="scenery-moon" aria-hidden="true"></div>
      <div class="scenery-lightning" aria-hidden="true"></div>
      <div class="scenery-content">
  `;
}

export function renderSceneryZoneClose(): string {
  return `
      </div>
    </div>
  `;
}

export function renderDisplayStackOpen(): string {
  return `
    <div class="display-stack">
      <div class="atmo-lightning atmo-lightning--left" aria-hidden="true"></div>
      <div class="atmo-lightning atmo-lightning--right" aria-hidden="true"></div>
  `;
}

export function renderDisplayStackClose(): string {
  return `</div>`;
}

export function renderPrizeZoneShell(): string {
  return `
    <section class="prize-zone" aria-label="Prize board">
      <div class="prize-zone-bezel">
        <div class="prize-zone-chrome" aria-hidden="true"></div>
        <div class="ladder-section" id="ladder-section"></div>
      </div>
    </section>
  `;
}

export function renderCabinetFooter(): string {
  return `
    <footer class="cabinet-footer" aria-hidden="true">
      <span class="footer-universal">UNIVERSAL STUDIOS MONSTERS</span>
      <span class="footer-demo">SLOT DEMO · NOT FOR COMMERCIAL USE</span>
    </footer>
  `;
}
