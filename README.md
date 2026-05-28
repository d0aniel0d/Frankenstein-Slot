# Monster Lab — Web 虚拟币老虎机演示

原创哥特实验室主题的 5 轴老虎机，玩法灵感来自持久化奖金板类机台（It's Alive、Power Up、免费 5×5 转轮），**非** Universal / Light & Wonder 官方产品。

## 运行

```bash
npm install
npm run dev
```

浏览器打开终端显示的本地地址（通常为 `http://localhost:5173`）。

## 虚拟币

- 初始余额：**10,000** 币
- 赌注：5 / 20 / 50
- 点击 **重置钱包** 可恢复余额

## 核心玩法

| 功能 | 说明 |
|------|------|
| **Power Up** | 第 1 轴出现 → 奖金板随机格子 2×–10× |
| **It's Alive** | 第 1 轴 + 其他轴怪物 → 从奖金板领奖，领奖后倍数重置 |
| **线奖** | 30 条线，怪物 / 低付符号组合 |
| **免费游戏** | 3+ Scatter → 8 次 5×5；外轴 Scatter +3 |

Grand / Major / Minor / Mini 为**演示用**假累积奖，仅作 UI 展示。

## 回报率（演示）

数学已调低：**It's Alive + 怪物收集** 约每 15–25 转触发一次；单次收集多为 0.5×–8× 赌注，大奖仍可能但权重很低。整体体感接近实体机「多数小输偶尔中」。

## 转轮符号

- 默认：内置 **SVG**（绿/金/蓝怪物、It's Alive、Power Up、Scatter 等），风格贴近实体机类型，但为原创绘制。
- 可选：把 PNG 放到 `public/symbols/`（见该目录 README），刷新页面即可替换。

**不要**把赌场截图里的官方素材直接放进项目，除非你有明确授权。

## 分享给朋友（GitHub Pages）

游戏地址形如：`https://<你的GitHub用户名>.github.io/<仓库名>/`

### 1. 本地先能构建

```bash
npm install
npm run build
```

### 2. 在 GitHub 新建仓库

- [github.com/new](https://github.com/new) 创建仓库，例如仓库名 `monster-lab-slot`
- **不要**勾选 “Add a README”（本地已有代码）
- 记下仓库名，地址将是 `https://你的用户名.github.io/monster-lab-slot/`

### 3. 上传代码（首次）

```bash
cd "/Users/juantingzheng/Desktop/Cursor Project/Slot 1"
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/你的用户名/你的仓库名.git
git push -u origin main
```

### 4. 开启 GitHub Pages（用 Actions 部署）

1. 打开仓库 → **Settings** → 左侧 **Pages**
2. **Build and deployment** → **Source** 选 **GitHub Actions**
3. 回到 **Actions** 页，应看到 “Deploy to GitHub Pages” 在跑或已成功
4. 成功后 Pages 设置页会显示站点 URL，或访问：  
   `https://你的用户名.github.io/你的仓库名/`

### 5. 以后更新

```bash
git add .
git commit -m "更新说明"
git push
```

推送后 Actions 会自动重新部署，朋友刷新链接即可。

### 本地预览 Pages 版（可选）

把 `REPLACE_REPO_NAME` 换成你的仓库名：

```bash
GITHUB_PAGES_BASE=monster-lab-slot npm run build
npx vite preview --base /monster-lab-slot/
```

打开 `http://localhost:4173/monster-lab-slot/` 检查资源路径是否正常。
