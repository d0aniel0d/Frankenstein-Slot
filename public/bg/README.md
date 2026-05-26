# 机台背景图

| 文件 | 用途 | 来源 |
|------|------|------|
| `topper-portrait.png` | 顶屏火焰弗兰肯斯坦大头 | 用户提供高清图 |
| `graveyard-scenery.png` | 奖金板 + 转轮区墓园背景 | 用户提供高清图 |
| `jackpot-frames.png` | **6 个橙色大奖框**模板（GRAND→MINI，无字） | 用户提供 |
| `prize-frames-blue.png` | **9 个蓝色钱框**模板（3×3，无字） | 用户提供 |
| `cabinet-ref.png` | 实机整屏参考（可选裁剪源） | 参考 |
| `graveyard-prizes-band.png` | 旧裁剪条带（可选） | 脚本生成 |

从实机参考重新裁剪（可选）：

```bash
PYTHONPATH=.pip_packages python3 scripts/crop-cabinet-bg.py
```

更换顶屏/墓地时直接覆盖上述两个 PNG 并硬刷新浏览器（`?v=4` 会随代码更新）。
