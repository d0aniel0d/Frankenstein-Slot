#!/usr/bin/env python3
"""从 public/bg/cabinet-ref.png 裁出顶屏大头照与墓地背景（高清）。"""
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    raise SystemExit("Run: python3 -m pip install pillow -t .pip_packages") from None

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "public" / "bg" / "cabinet-ref.png"
OUT = ROOT / "public" / "bg"


def main() -> None:
    img = Image.open(SRC).convert("RGB")
    w, h = img.size

    # 顶屏：弗兰肯斯坦大头 + 火焰（实机上部约 30%）
    top_h = int(h * 0.305)
    topper = img.crop((0, 0, w, top_h))
    topper.save(OUT / "topper-portrait.png", optimize=True)

    # 墓地全景：金字塔后方到转轮区的蓝色墓园
    grave = img.crop((0, int(h * 0.24), w, int(h * 0.88)))
    grave.save(OUT / "graveyard-scenery.png", optimize=True)

    # 奖金板专用条带（墓地在金字塔正后方更清晰）
    prize_bg = img.crop((0, int(h * 0.24), w, int(h * 0.52)))
    prize_bg.save(OUT / "graveyard-prizes-band.png", optimize=True)

    print(f"topper-portrait.png  {topper.size[0]}x{topper.size[1]}")
    print(f"graveyard-scenery.png {grave.size[0]}x{grave.size[1]}")
    print(f"graveyard-prizes-band.png {prize_bg.size[0]}x{prize_bg.size[1]}")


if __name__ == "__main__":
    main()
