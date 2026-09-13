# Security Policy

## Reporting a vulnerability

Please **do not** open a public issue for security problems.

Report privately via GitHub: the repository's **Security → Report a vulnerability** ("Private vulnerability reporting"), or contact the maintainer [@AQ-zero](https://github.com/AQ-zero). We'll acknowledge within a few days and keep you posted on a fix.

## Scope & threat model

MissionSeek is **local-first**:

- All personal/growth data lives in a local SQLite file on the user's own machine. It is never uploaded.
- **Model API keys are supplied by the user** and stored locally (in the local DB or `.env.local`). They are never committed to the repo and never sent anywhere except the model provider the user chose.
- The only outbound traffic is (a) the AI requests a user triggers, to their chosen provider, and (b) feedback text a user explicitly submits.

Because keys and data are user-supplied and local, the most valuable reports concern: local data exposure, key leakage paths, injection into prompts/exports, and the Electron shell (IPC, remote content, auto-update surfaces).

## Supported versions

The latest release on the default branch is supported. Please reproduce on the latest `main` before reporting.
