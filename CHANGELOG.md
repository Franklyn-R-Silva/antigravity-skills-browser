# Changelog

All notable changes to this extension are documented here.

The format is based on
[Keep a Changelog](https://keepachangelog.com/) · [Semantic Versioning](https://semver.org/).

## [1.8.0] - 2026-07-13

**Changed**
- ⬆️ **Updated skill catalog to 1948 skills** (302 new) from the upstream dataset,
  which was renamed from `antigravity-awesome-skills` to
  **`agentic-awesome-skills`**. Refreshed the bundled `skills.json`, the default
  `antigravitySkills.dataUrl`, and the site/repo links (`SITE_URL`, `REPO_URL`)
  to the new location.
- 🇧🇷 Extended the offline Portuguese bundle (`skills-pt.json`) with pre-translated
  descriptions for all 302 new skills.
- 🗂️ Added Portuguese labels for 10 new categories (`agent-evaluation`, `ai`,
  `consulting`, `databases`, `knowledge-management`, `ml-ops`, `operations`,
  `product`, `skill-authoring`, `video`).

## [1.7.0] - 2026-07-08

**Changed**
- 🎨 **UI/UX redesign** of the sidebar webview: search box with a leading icon
  and focus ring, refined language toggle, category filter and collapse/expand
  control; category headers with a count chip and hover accent; roomier skill
  rows with cleaner typography; pill-style risk badges; a restyled detail panel
  (metadata chips, clearer section headers, full-width action buttons, subtle
  slide-in). Uses design tokens (`--sp`, `--r`, accent, muted) and `color-mix`.

**Verified**
- ✅ Reviewed all 1646 Portuguese descriptions for completeness (no
  English-prose entries remain; residual English is proper nouns / product
  names / SDK identifiers only).

## [1.6.0] - 2026-07-08

**Added**
- 🇧🇷 **Offline Portuguese descriptions**: all ~1646 skill descriptions are
  pre-translated to Brazilian Portuguese and bundled in `skills-pt.json`. In PT
  mode they show automatically (in the list and detail panel) with no dependency
  on a host AI model. A toggle switches between the PT translation and the
  original (EN/ES). The `vscode.lm` on-demand path remains a fallback for skills
  missing from the bundle.
- 🗂️ **Translated category names** in PT mode (group headers and the category
  filter), via a static label map; the internal category key stays English.
- ↔️ **Inline expand/collapse** button on each skill row to reveal the full
  description without opening the detail panel.
- 🔗 The detail-panel **site link now opens the specific skill page**
  (`…/skill/<id>`) instead of the site home.

**Changed**
- 🔎 Search now also matches the Portuguese description and translated category
  label.

## [1.5.0] - 2026-07-08

**Added**
- 🗂️ **Category filter** dropdown in the toolbar (with per-category counts) to
  narrow the list to a single category.
- ↕️ **Collapse all / Expand all** button that folds or unfolds every visible
  category group at once; label reflects the current state.
- 🌐 **Translate description (PT)** button in the detail panel. Descriptions stay
  in English by default; on demand the description is translated to Brazilian
  Portuguese via the editor's Language Model API (`vscode.lm`) and cached in
  `globalState`. A toggle switches between the original and the translation.
- 🔗 **Shortcuts** to the upstream skills **site** and **GitHub repository** — as
  view title-bar buttons and as links in the detail panel.
- ⌨️ **Esc** closes the detail panel.

**Changed**
- ♻️ Internal cleanups in the webview (category options built once, global
  collapse/expand state tracked in `LAST_CATS`); code comments are now English-only.

## [1.4.0] - 2026-07-07

**Added**
- 🛠️ **Per-tool presets** (`antigravitySkills.tool`): the inserted text adapts to
  the tool — Claude Code (`/skill`), Cursor (`@skill`), Antigravity IDE
  (`Use @skill`), Gemini/Codex/Kiro/AdaL (`Use skill`), Copilot, OpenCode and
  `custom`. Detail-panel selector with a **preview** of the exact inserted text.

**Changed**
- ✳️ Default invocation now depends on the chosen tool (default **Claude Code =
  `/skill`**). `template` / `templatePlan` apply when `tool` = `custom`.
- 📄 README **focused on the app** (store page); build/packaging/publishing moved
  to the new **`DEVELOPMENT.md`**.

## [1.3.0] - 2026-07-07

**Added**
- 🧩 **Plan a feature** button in the list and detail panel: inserts
  `use /skill to plan a feature` into the terminal. New configurable template
  `antigravitySkills.templatePlan`.
- 🔌 Skill **Compatibility** (codex/claude) and **Setup** shown in the detail
  panel (data already present in `skills.json`).

**Changed**
- ✳️ Default template changed from `use @{name}` to **`use /{name}`** (slash
  command invocation).

## [1.2.0] - 2026-06-19

**Added**
- 🎨 Extension **icon/logo** (128×128) with an *antigravity* theme.
- 🌐 **Explicar (PT)** / **Explain (EN)** buttons in the detail panel.
- ℹ️ Per-skill **detail panel** (name, category, risk, source and description).
- 🔀 UI **PT | EN toggle**, with a configurable initial language.
- ⚙️ `explainTemplatePt` and `explainTemplateEn` settings.
- 📄 Bilingual README (PT/EN) and `LICENSE` file (MIT).

**Changed**
- Publishing metadata filled in for **Franklyn Roberto da Silva**.

## [1.1.0] - 2026-06-19

**Added**
- 🔎 Always-on **search box** with live filtering (name, category, description).
- ⭐ **Favorites** persisted across sessions.
- 🗂️ **Collapsible** categories with counters.
- 🏷️ **Risk badge** (safe / medium / high / critical).
- 🗑️ **Clear favorites** command.

**Changed**
- Panel rewritten from a native TreeView to an **HTML webview**.

## [1.0.0] - 2026-06-19

**Added**
- 🚀 Initial release: sidebar panel with **1600+ Antigravity Awesome Skills**
  grouped by category.
- 🖱️ Click a skill → types `use @skill-name` into the terminal and copies it.
- 📦 Bundled `skills.json` (offline) with background refresh.
- ⚙️ Settings: `template`, `sendNewline`, `dataUrl`, `sortCategoriesByCount`.

[1.7.0]: https://github.com/Franklyn-R-Silva/antigravity-skills-browser/releases/tag/v1.7.0
[1.6.0]: https://github.com/Franklyn-R-Silva/antigravity-skills-browser/releases/tag/v1.6.0
[1.5.0]: https://github.com/Franklyn-R-Silva/antigravity-skills-browser/releases/tag/v1.5.0
[1.4.0]: https://github.com/Franklyn-R-Silva/antigravity-skills-browser/releases/tag/v1.4.0
[1.3.0]: https://github.com/Franklyn-R-Silva/antigravity-skills-browser/releases/tag/v1.3.0
[1.2.0]: https://github.com/Franklyn-R-Silva/antigravity-skills-browser/releases/tag/v1.2.0
[1.1.0]: https://github.com/Franklyn-R-Silva/antigravity-skills-browser/releases/tag/v1.1.0
[1.0.0]: https://github.com/Franklyn-R-Silva/antigravity-skills-browser/releases/tag/v1.0.0
