# Contributing to MissionSeek · 参与共建

Thanks for being here. MissionSeek is open so we can build a genuinely good growth instrument together. — *中文见下。*

## Ways to help

- **Use it for a week, then tell us where it broke your trust.** That single honest issue is worth more than ten feature ideas.
- File bugs and feature requests via [Issues](https://github.com/AQ-zero/mission-seek-harness/issues).
- Improve docs, translations, or the design.
- Send code via Pull Requests.

## Dev setup

See the [Quick start](./README.md#-quick-start). In short:

```bash
npm run setup
npm run dev        # http://localhost:3000
```

**Before you push, the local gate is:**

```bash
npm run typecheck  # tsc --noEmit — must pass
```

> A full `npm run build` is the real gate and runs in CI on every PR. Locally, `typecheck` is the fast check (a build needs `node_modules` installed for your own platform).

## Pull request checklist

1. Branch from `main`; keep PRs focused (one concern each).
2. `npm run typecheck` passes; UI strings are bilingual (add both `/*@en*/` and `/*@zh*/` in `src/lib/i18n/dict.ts`).
3. No secrets, keys, or personal data in the diff. Never commit `.env.local` or anything under `data/`.
4. Describe the *why* and the user impact, not just the *what*.
5. **Sign off your commits (DCO):** add `Signed-off-by: Your Name <you@example.com>` — `git commit -s` does this. It certifies you wrote the code (or have the right to submit it) and agree to release it under the project's license.

## Design & tech notes

- Stack: Next.js 14 (App Router) + TypeScript + Tailwind + `sql.js` (pure-WASM SQLite) + Drizzle; Electron for desktop.
- Design language "quiet study": warm ivory-greige, deep-pine accent (`#2E5A49`), generous whitespace, light + dark.
- Keep it **local-first**: no feature should require a cloud account or send growth data off the machine.

---

## 中文

MissionSeek 开源，是为了一起打磨一件真正好用的成长仪器。

### 怎么帮忙
- **先真用一周，再告诉我们它在哪一处辜负了你的信任**——这一条诚实的 issue，胜过十个功能点子。
- 通过 [Issues](https://github.com/AQ-zero/mission-seek-harness/issues) 提 bug 与需求。
- 改进文档、翻译或设计。
- 通过 Pull Request 提交代码。

### 开发环境
见 [快速开始](./README.zh.md#-快速开始)。**推送前本地关卡：** `npm run typecheck`（必须通过；完整 `build` 由 CI 在每个 PR 上跑）。

### PR 清单
1. 从 `main` 拉分支，一个 PR 只做一件事。
2. `typecheck` 通过；UI 文案中英双语（`dict.ts` 里同时加 `/*@en*/` 与 `/*@zh*/`）。
3. diff 里**绝不含密钥/隐私**；永不提交 `.env.local` 或 `data/` 下任何文件。
4. 说清"为什么"和"对用户的影响"，而不只是"改了什么"。
5. **给提交签名（DCO）：** `git commit -s` 会加上 `Signed-off-by`，表示你拥有该代码的提交权并同意以本项目许可证发布。
