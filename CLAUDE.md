# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A VS Code extension (targeting **Antigravity** and any VS Code fork) that shows the
1600+ "Antigravity Awesome Skills" in a sidebar webview. Clicking a skill types a
tool-specific invocation into the active terminal (without pressing Enter) and copies
it to the clipboard; a "Plan a feature" action inserts the variant. The exact text is
chosen by the `tool` preset (Claude Code `/skill`, Cursor `@skill`, Antigravity
`Use @skill`, …). UI is bilingual (PT/EN) and most user-facing strings/comments are in
Portuguese — match that convention when editing.

`README.md` is the **store page** (app-focused); build/packaging/publishing live in
`DEVELOPMENT.md`. Both `CLAUDE.md` and `DEVELOPMENT.md` are excluded from the `.vsix`
via `.vscodeignore`.

## Commands

```bash
npm install
npm run package          # -> vsce package, produces antigravity-skills-browser-<version>.vsix

# Publish to Open VSX (what Antigravity/most forks use):
npx ovsx publish antigravity-skills-browser-<version>.vsix -p <TOKEN>
```

There is no build step, linter, or test suite. `extension.js` is plain CommonJS run
directly by VS Code. To try changes: open the folder in VS Code and press F5 (Extension
Development Host), or install the packaged `.vsix` via `Extensions: Install from VSIX...`.

Regenerate the icon (pure Python, no deps): `python scripts/make_icon.py` -> `media/icon.png`.

## Architecture

Everything lives in **`extension.js`** (~500 lines), split into commented sections:

- **Data loading** — On activate, skills load from a 3-tier fallback: cached copy in
  `globalStorageUri` -> bundled `skills.json` -> empty. Then `refreshFromRemote` fetches
  fresh data from `antigravitySkills.dataUrl` in the background and rewrites the cache.
  `fetchJson` is a hand-rolled `https.get` with manual redirect following (no deps).
  `normalize()` coerces each record to `{id, name, description, category, risk, source,
  path, targets, setup}` (the last three come from the upstream `plugin` object).

- **Terminal actions** — `sendToTerminal` always copies to clipboard, then sends text to
  the active terminal (creating one named "Antigravity" if none). `sendNewline` config
  decides whether Enter is pressed. `renderTemplate(name, variant)` resolves the invocation
  from `TOOL_PRESETS[tool]` (each preset has `use`/`plan` strings); when `tool === 'custom'`
  it falls back to the `template`/`templatePlan` settings. The active tool persists in
  `globalState` (like `lang`) and is picked in the detail panel; `postData` ships the full
  presets map so the webview can render a live preview. All strings use `{name}` replacement.

- **Explanations** — `explainInline` prefers the host's **VS Code Language Model API**
  (`vscode.lm`, feature-detected) and streams the answer back into the detail panel via
  `postExplain`; if no model/API is available it falls back to sending the explain prompt
  to the terminal agent and shows a "sent to agent" note.

- **`SkillsViewProvider`** — A `WebviewViewProvider`. The entire UI (search, collapsible
  category groups, favorites, risk badges, detail overlay, PT/EN toggle) is a single HTML
  string built in `_html()` with an inline `<script nonce>` under a strict CSP. The
  extension host and webview communicate only via `postMessage`:
  - webview -> host message types: `ready`, `use` (optional `variant:'plan'`), `copy`,
    `explain`, `toggleFav`, `setLang`, `setTool`, `openSite`
  - host -> webview: `data` (skills + favorites + sortByCount + lang) and `explain`
    (streamed explanation chunks / terminal-fallback note)
  - Favorites and language persist in `context.globalState`; skill filtering/rendering
    happens entirely client-side in the webview script.

The `skills.json` data model, the config keys in `package.json`'s `contributes.configuration`,
and the message-type strings must stay in sync across `extension.js`. When adding a
user-facing string, add it to **both** the `pt` and `en` entries of the `T` translation
table in the webview script.

## Data source

Skills come from <https://sickn33.github.io/antigravity-awesome-skills> (`skills.json`).
The bundled `skills.json` is the offline fallback and is shipped in the `.vsix`.
