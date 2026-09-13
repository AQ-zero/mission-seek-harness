<div align="center">

<img src="./site/cover.png" alt="MissionSeek — seek your mission, compound your life" width="840">

### Seek your mission. Compound your life.

Most tools log what you *did*. MissionSeek compounds the two things that actually shape a life — **your judgment and your direction** — through one honest loop: **record → insight → action → verification.** Local-first, open-source, and entirely yours.

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-2E5A49.svg)](./LICENSE)
[![CI](https://github.com/AQ-zero/mission-seek-harness/actions/workflows/build.yml/badge.svg)](https://github.com/AQ-zero/mission-seek-harness/actions/workflows/build.yml)
[![Release](https://img.shields.io/github/v/release/AQ-zero/mission-seek-harness?color=2E5A49)](https://github.com/AQ-zero/mission-seek-harness/releases)
[![Platforms](https://img.shields.io/badge/desktop-Windows%20%7C%20macOS%20%7C%20Linux-444)](https://github.com/AQ-zero/mission-seek-harness/releases)

**English** · [中文](./README.zh.md)

[**Quick start**](#-quick-start) · [**Download**](https://github.com/AQ-zero/mission-seek-harness/releases) · [**Contribute**](./CONTRIBUTING.md)

<img src="./.github/assets/missionseek-demo.gif" alt="MissionSeek demo" width="840">

</div>

---

## Why MissionSeek

You reset goals every year, yet your judgment never compounds. You've saved a hundred frameworks, and your model of yourself is still blurry. Checklists make you *record*; they don't make you *grow*.

MissionSeek is not another to-do app. It's a **thinking instrument**: a machine that helps you think yourself clear, act, and then check whether you were right — so that direction and judgment accrue interest year over year.

- 🔒 **Local-first & private.** Your whole practice lives in one SQLite file on your machine. No cloud, no account, no telemetry. One-click JSON export — your data is a vault you can carry.
- 🔌 **Bring your own model.** Claude, GPT, DeepSeek, Kimi, GLM, or a fully offline Ollama. Your key, stored locally.
- 🪶 **A calm room to think.** A "quiet-study" design language — warm ivory, deep-pine accents, generous whitespace — light & dark.

---

## The loop

```
      ┌──────────────────────────────────────────────┐
      │                                              │
   record ──▶ insight ──▶ action ──▶ verification ──┘
   (signals)  (AI + you)  (anti-goals)  (was I right?)
```

A **eulogy-derived North Star** points the loop. Every mechanism below feeds one turn of it.

## What's inside

| Mechanism | What it does |
|---|---|
| ✦ **Eulogy North Star** | Cold-start from the life you'd want remembered → a single directional star, not 12 vague resolutions. |
| 🎯 **Decision calibration** | Log a decision + a prediction; MissionSeek scores your accuracy (Brier) and cross-examines it from your *past, present, and future* self. |
| 📡 **Mission-signal radar** | Turns raw envy / anger / flow into **testable mission hypotheses** — the emotions that actually point at what you're for. |
| 📚 **Capability ledger** | Skills are levels that require *evidence*; without it they depreciate back toward L1. No more imaginary résumés. |
| 🥊 **Adversarial weekly review** | The AI plays devil's advocate on your week, then converges it into next actions — 15 minutes to keep the system compounding. |
| 🧭 **Anti-goals & low-point protocol** | Name what you refuse to become, and pre-commit a plan for the bad weeks. |

---

## 🚀 Quick start

> Requirements: **Node 20+**. The database is pure-WASM `sql.js` — **no native modules, no compiler, no ABI pain.**

```bash
git clone https://github.com/AQ-zero/mission-seek-harness.git
cd mission-seek-harness
npm run setup      # install deps → generate .env.local → generate AUTH_SECRET
npm run dev        # → http://localhost:3000
```

Then configure AI in-app: **Settings · AI** (or edit `.env.local`). Verify from the home page → *Dev self-check* → *Test AI* → expect `provider:model → OK…`.

<details>
<summary>Manual setup / troubleshooting</summary>

```bash
npm install
cp .env.example .env.local      # then fill in a model key
npm run dev
```

- **"Test AI" fails:** `401` = bad key / no balance · timeout = set an `OPENAI_BASE_URL` proxy · `model not found` = model name doesn't match the endpoint.
- **`ENOENT: package.json`:** you're in the wrong directory — `cd` into the repo root first.
</details>

## 🖥️ Build the desktop app

Package the Next app into a Windows / macOS / Linux desktop app via Electron. Build on the target OS (Windows installer on Windows, `.dmg` on macOS).

```bash
npm install
npm run desktop      # next build + launch an Electron window (opens = it works)
npm run dist:win     # Windows → release/MissionSeek-Setup.exe
npm run dist         # current platform
```

Tagging a release (`git tag vX.Y.Z && git push --tags`) triggers CI to build Win + Mac installers and attach them to the GitHub Release automatically.

## 🤖 AI providers

Pluggable `LLMProvider` — switch by editing `.env.local` or the in-app panel, **no code changes.**

| Provider | Kind | Notes |
|---|---|---|
| **DeepSeek** | OpenAI-compatible | great value, strong Chinese |
| **OpenAI · GPT** | OpenAI | `gpt-4o-mini` default |
| **Claude · Anthropic** | Anthropic | `claude-3-5-sonnet-latest` |
| **Kimi · Moonshot** | OpenAI-compatible | long context |
| **GLM · Zhipu** | OpenAI-compatible | `glm-4-flash` free tier |
| **Ollama** | local | key-free, zero data leaves the machine |

---

## 🔐 Data & privacy

- Your data lives **only** on your machine: a single SQLite file at `./data/mission-seek.db` (desktop build stores it in your per-user data dir).
- **Bring-your-own-key.** Model keys live in your local DB or `.env.local` (git-ignored) — never committed, never sent anywhere but the provider you chose.
- **One-click export:** *Settings → Export all data (JSON)* — generated locally, no third party.
- Only the AI requests you trigger, and feedback text you explicitly submit, ever leave the machine.

## 🗂️ Project structure

```
src/db/schema.ts     # the personal-ontology data model
src/db/queries.ts    # all reads/writes
src/lib/llm/         # LLMProvider abstraction (anthropic / openai / ollama)
src/lib/prompts.ts   # prompts (eulogy / three-perspectives / signals / review)
src/app/**           # pages, Server Actions, API routes
electron/            # desktop shell (runs the standalone Next server locally)
site/                # marketing landing page (static)
```

## 🗺️ Status & roadmap

MissionSeek is **early but usable** — the full loop works today, and it's open now so it can grow in the open.

- ✅ **Shipped** — the six mechanisms above, local-first SQLite storage, one-click JSON export, multi-provider AI, bilingual UI (EN / 中文), and desktop builds for Windows / macOS / Linux.
- 🔜 **Next** — progressive onboarding, a compounding "self-model" visualization, and richer calibration feedback.
- 💡 **Ideas & bugs** — [open an issue](https://github.com/AQ-zero/mission-seek-harness/issues) or start a [discussion](https://github.com/AQ-zero/mission-seek-harness/discussions).

If the idea resonates, a ⭐ helps others find it.

## 🤝 Contributing

MissionSeek is open-sourced so more people can build a genuinely good growth instrument together. Issues, ideas, and PRs are all welcome — start with **[CONTRIBUTING.md](./CONTRIBUTING.md)** and our **[Code of Conduct](./CODE_OF_CONDUCT.md)**.

Good first steps: try the loop for a week, then open an issue about the one place it broke your trust.

## 📄 License

[GNU AGPL-3.0-or-later](./LICENSE). You're free to use, study, modify, and share it; if you distribute a modified version or run it as a network service, your changes must stay open under the same license. Copyright © the MissionSeek contributors.

<div align="center"><sub>Built to compound judgment, not to farm attention.</sub></div>
