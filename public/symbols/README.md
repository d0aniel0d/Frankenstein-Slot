# 自定义转轮符号

你已提供的参考图已保存在 `reference/sheet-premium.png` 与 `reference/sheet-standard.png`。

## 可以这样用吗？

**可以。** 参考图非常适合用来对齐符号种类和风格。

若要**直接显示**参考图里的高清美术，请把每个符号**单独裁剪**成透明 PNG，按下表命名后放入本目录（不要整张拼图直接当转轮图）：

| 文件名 | 对应参考图上的符号 |
|--------|-------------------|
| `neon_a.png` | 霓虹紫色 A |
| `neon_j.png` | 霓虹蓝色 J |
| `neon_q.png` | 霓虹橙色 Q |
| `neon_k.png` | 霓虹红色 K |
| `daisy.png` | 蓝色雏菊 |
| `castle.png` | 城堡 + 满月 |
| `brain.png` | ABNORMAL BRAIN 大脑瓶 |
| `assistant.png` | 驼背助手 + 钥匙（高清，黑底） |
| `monster.png` | 火焰橙弗兰肯斯坦头像（高清 866×1002，It's Alive 时 UI 滤成蓝色电击） |
| `dr_frank.png` | 科学家惊恐肖像（橙粉光） |
| `alive.png` | IT'S ALIVE! |
| `power.png` | POWER UP! |
| `free_games.png` | FREE GAMES（燃烧风车，停到时有专属音效） |
| `wild.png` | （可选）WILD |

建议尺寸：**128×128** 或 **256×256**，透明底 PNG。

缺文件时游戏使用内置 SVG（按参考图造型绘制的原创图标）。

## 重新裁剪

若更换了 `reference/` 里的拼图，在项目根目录执行：

```bash
PYTHONPATH=.pip_packages python3 scripts/crop-symbols.py
```

（首次需：`python3 -m pip install pillow -t .pip_packages`）

## 版权

参考图来自实体机台美术，通常受 **Universal / Light & Wonder** 保护。  
仅供个人学习演示；**公开发布或商用**前请确认你有权使用这些素材。
