#!/usr/bin/env python3
"""从 reference 拼图裁剪透明 PNG 到 public/symbols/"""
from __future__ import annotations

import os
import sys

try:
    from PIL import Image
except ImportError:
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".pip_packages"))
    from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), "..")
SYMBOLS_DIR = os.path.join(ROOT, "public", "symbols")
REF_DIR = os.path.join(SYMBOLS_DIR, "reference")
OUTPUT_SIZE = 256


def rgba_transparent_black(img: Image.Image, threshold: int = 32) -> Image.Image:
    img = img.convert("RGBA")
    px = img.load()
    w, h = img.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if r <= threshold and g <= threshold and b <= threshold:
                px[x, y] = (0, 0, 0, 0)
    return img


def save_symbol(crop: Image.Image, path: str) -> None:
    crop = rgba_transparent_black(crop, threshold=35)
    bbox = crop.getbbox()
    if bbox:
        crop = crop.crop(bbox)
    w, h = crop.size
    side = max(w, h, 64)
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    canvas.paste(crop, ((side - w) // 2, (side - h) // 2))
    canvas = canvas.resize((OUTPUT_SIZE, OUTPUT_SIZE), Image.Resampling.LANCZOS)
    canvas.save(path, "PNG")
    print(f"  {os.path.basename(path)} ({w}×{h})")


def crop_premium() -> None:
    path = os.path.join(REF_DIR, "sheet-premium.png")
    img = Image.open(path).convert("RGBA")
    w, h = img.size
    names = ["neon_a", "alive", "power", "dr_frank", "monster"]
    cell_w = w // len(names)
    for i, name in enumerate(names):
        x0 = i * cell_w + int(cell_w * 0.07)
        x1 = (i + 1) * cell_w - int(cell_w * 0.07)
        y0 = int(h * 0.05)
        y1 = int(h * 0.72)
        save_symbol(img.crop((x0, y0, x1, y1)), os.path.join(SYMBOLS_DIR, f"{name}.png"))


def crop_standard() -> None:
    path = os.path.join(REF_DIR, "sheet-standard.png")
    img = Image.open(path).convert("RGBA")
    w, h = img.size
    grid = [
        ["neon_j", "neon_q", "neon_k", "assistant"],
        ["daisy", "castle", "brain", "free_games"],
    ]
    cols, rows = 4, 2
    cell_w, cell_h = w // cols, h // rows
    for row in range(rows):
        for col in range(cols):
            name = grid[row][col]
            x0 = col * cell_w + int(cell_w * 0.06)
            x1 = (col + 1) * cell_w - int(cell_w * 0.06)
            y0 = row * cell_h + int(cell_h * 0.05)
            y1 = (row + 1) * cell_h - int(cell_h * 0.26)
            save_symbol(img.crop((x0, y0, x1, y1)), os.path.join(SYMBOLS_DIR, f"{name}.png"))


def main() -> None:
    print("Cropping premium sheet…")
    crop_premium()
    print("Cropping standard sheet…")
    crop_standard()
    print("Done → public/symbols/*.png")


if __name__ == "__main__":
    main()
