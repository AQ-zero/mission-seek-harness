<div align="center">

<img src="./site/cover.png" alt="MissionSeek — 寻见使命，复利一生" width="840">

### 寻见使命，复利一生。

大多数工具只记录你"做了什么"。MissionSeek 想复利的，是真正决定一生的两件事——**你的判断力与方向感**——靠一个诚实的闭环：**记录 → 洞察 → 行动 → 验证。** 本地优先、开源、永远属于你。

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-2E5A49.svg)](./LICENSE)
[![CI](https://github.com/AQ-zero/mission-seek-harness/actions/workflows/build.yml/badge.svg)](https://github.com/AQ-zero/mission-seek-harness/actions/workflows/build.yml)
[![Release](https://img.shields.io/github/v/release/AQ-zero/mission-seek-harness?color=2E5A49)](https://github.com/AQ-zero/mission-seek-harness/releases)
[![Platforms](https://img.shields.io/badge/desktop-Windows%20%7C%20macOS%20%7C%20Linux-444)](https://github.com/AQ-zero/mission-seek-harness/releases)

[English](./README.md) · **中文**

[**快速开始**](#-快速开始) · [**下载**](https://github.com/AQ-zero/mission-seek-harness/releases) · [**参与共建**](./CONTRIBUTING.md)

<img src="./.github/assets/missionseek-demo.gif" alt="MissionSeek 演示" width="840">

</div>

---

## 为什么是 MissionSeek

你每年重设目标，判断力却从不复利；你收藏了上百套方法论，对自己的模型依旧模糊。打卡让你**记录**，却不让你**成长**。

MissionSeek 不是又一个待办清单，而是一台**思考仪器**：帮你把自己想清楚、去行动、再验证有没有想对——让方向感与判断力逐年生息。

- 🔒 **本地优先、隐私至上。** 全部实践只存在你机器上的一个 SQLite 文件里。无云端、无账号、无遥测。一键导出 JSON——你的数据是可随身携带的仓库。
- 🔌 **自带模型。** Claude、GPT、DeepSeek、Kimi、GLM，或完全离线的 Ollama。你的 key，本地存储。
- 🪶 **一间安静的思考室。** "静室"设计语言——暖象牙底、深松绿点缀、大留白——明暗双主题。

---

## 核心闭环

```
      ┌────────────────────────────────────────┐
      │                                        │
   记录 ──▶ 洞察 ──▶ 行动 ──▶ 验证 ───────────┘
  (信号)  (AI+你)  (反目标)  (我想对了吗?)
```

由**"讣告北极星"**为闭环定向，下面每个机制都推动它转动一圈。

## 内含机制

| 机制 | 作用 |
|---|---|
| ✦ **讣告北极星** | 从"你希望被如何记住"冷启动 → 收敛成一颗方向之星，而非 12 条模糊的年度决心。 |
| 🎯 **决策校准** | 记录决策 + 预测；用 Brier 分给你的判断力打分，并用你的**过去/现在/未来**三个自我交叉审问。 |
| 📡 **使命信号雷达** | 把原始的嫉妒 / 愤怒 / 心流，转成**可验证的使命假设**——这些情绪才真正指向你为何而在。 |
| 📚 **能力账本（含折旧）** | 技能等级需要**证据**背书；没有证据就折旧回 L1。告别想象中的简历。 |
| 🥊 **对抗式每周复盘** | AI 先给你的一周唱反调，再收敛成下一步行动——15 分钟，让系统持续复利。 |
| 🧭 **反目标 & 低潮期协议** | 写下你拒绝成为的样子，并为糟糕的那几周预先承诺一套方案。 |

---

## 🚀 快速开始

> 要求：**Node 20+**。数据库是纯 WASM 的 `sql.js`——**无原生模块、无需编译器、无 ABI 之痛。**

```bash
git clone https://github.com/AQ-zero/mission-seek-harness.git
cd mission-seek-harness
npm run setup      # 装依赖 → 生成 .env.local → 生成 AUTH_SECRET
npm run dev        # → http://localhost:3000
```

随后在应用内配置 AI：**设置 · AI**（或改 `.env.local`）。验证：首页 →「开发自检」→「检测 AI」→ 显示 `provider:model → OK…`。

<details>
<summary>手动初始化 / 排错</summary>

```bash
npm install
cp .env.example .env.local      # 然后填入一个模型 key
npm run dev
```

- **「检测 AI」报错：** `401` = key 不对 / 无余额 · 超时 = 需设置中转 `OPENAI_BASE_URL` · `model not found` = 模型名与端点不匹配。
- **`ENOENT: package.json`：** 跑错目录了——先 `cd` 进仓库根目录。
</details>

## 🖥️ 打包桌面应用

用 Electron 把 Next 应用封装成 Windows / macOS / Linux 桌面程序。请在目标系统上构建（Windows 安装包在 Windows 上打，`.dmg` 在 mac 上打）。

```bash
npm install
npm run desktop      # next build + 开一个 Electron 窗口（能开 = 跑通）
npm run dist:win     # Windows → release/MissionSeek-Setup.exe
npm run dist         # 当前平台
```

打 tag（`git tag vX.Y.Z && git push --tags`）会触发 CI 自动构建 Win + Mac 安装包并挂到 GitHub Release。

## 🤖 AI 服务商

可插拔的 `LLMProvider`——改 `.env.local` 或应用内面板即可切换，**不改代码。**

| 服务商 | 类型 | 说明 |
|---|---|---|
| **DeepSeek** | OpenAI 兼容 | 性价比高，中文强 |
| **OpenAI · GPT** | OpenAI | 默认 `gpt-4o-mini` |
| **Claude · Anthropic** | Anthropic | `claude-3-5-sonnet-latest` |
| **Kimi · Moonshot** | OpenAI 兼容 | 长上下文 |
| **GLM · 智谱** | OpenAI 兼容 | `glm-4-flash` 有免费额度 |
| **Ollama** | 本地 | 免 key、零外泄 |

---

## 🔐 数据与隐私

- 数据**只**在你机器上：SQLite 文件 `./data/mission-seek.db`（桌面版存于每用户数据目录）。
- **自带 key。** 模型 key 存本地库或 `.env.local`（已 gitignore）——不进 git，只发往你选定的服务商。
- **一键导出：** *设置 → 导出全部数据（JSON）*——本地生成，不经第三方。
- 只有你主动触发的 AI 请求、以及你显式提交的反馈文字，才会离开本机。

## 🗂️ 项目结构

```
src/db/schema.ts     # 个人本体数据模型
src/db/queries.ts    # 全部数据读写
src/lib/llm/         # LLMProvider 抽象（anthropic / openai / ollama）
src/lib/prompts.ts   # 提示词（讣告 / 三视角 / 信号 / 复盘）
src/app/**           # 页面、Server Actions、API
electron/            # 桌面外壳（本地运行 Next standalone 服务端）
site/                # 营销落地页（静态）
```

## 🗺️ 现状与路线

MissionSeek **尚早、但已可用**——完整闭环今天就能跑，现在开源，是为了在开放中长大。

- ✅ **已交付**——上面六个机制、本地优先 SQLite 存储、一键 JSON 导出、多模型可插拔、中英双语界面，以及 Windows / macOS / Linux 桌面构建。
- 🔜 **下一步**——渐进式冷启动、"自我模型"复利可视化、更丰富的校准反馈。
- 💡 **想法与 bug**——[开一个 issue](https://github.com/AQ-zero/mission-seek-harness/issues) 或发起 [discussion](https://github.com/AQ-zero/mission-seek-harness/discussions)。

如果这个理念打动了你，点个 ⭐ 能帮更多人发现它。

## 🤝 参与共建

MissionSeek 开源，是为了让更多人一起打磨一件真正好用的成长仪器。欢迎 Issue、想法与 PR——请从 **[CONTRIBUTING.md](./CONTRIBUTING.md)** 与 **[行为准则](./CODE_OF_CONDUCT.md)** 开始。

上手建议：先真用一周，再开一个 issue，讲讲它在哪一处辜负了你的信任。

## 📄 许可证

[GNU AGPL-3.0-or-later](./LICENSE)。你可自由使用、研究、修改与分享；若分发修改版或将其作为网络服务运行，你的改动须以相同许可证保持开源。版权 © MissionSeek 贡献者。

<div align="center"><sub>为复利判断力而造，不为收割注意力。</sub></div>
