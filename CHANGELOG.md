# Changelog

🇧🇷 Todas as mudanças relevantes desta extensão são documentadas aqui.
🇺🇸 All notable changes to this extension are documented here.

O formato segue o / The format is based on
[Keep a Changelog](https://keepachangelog.com/) · [Semantic Versioning](https://semver.org/).

## [1.4.0] - 2026-07-07

### 🇧🇷 Português

**Adicionado**
- 🛠️ **Presets por ferramenta** (`antigravitySkills.tool`): o texto inserido se
  adapta à ferramenta — Claude Code (`/skill`), Cursor (`@skill`), Antigravity
  IDE (`Use @skill`), Gemini/Codex/Kiro/AdaL (`Use skill`), Copilot, OpenCode e
  `custom`. Seletor no painel de detalhes com **preview** do texto exato inserido.

**Alterado**
- ✳️ A invocação padrão passa a depender da ferramenta escolhida (padrão
  **Claude Code = `/skill`**). `template` / `templatePlan` agora valem quando
  `tool` = `custom`.
- 📄 README **focado no app** (o que aparece na loja); build/empacotamento/
  publicação movidos para o novo **`DEVELOPMENT.md`**.

### 🇺🇸 English

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

### 🇧🇷 Português

**Adicionado**
- 🧩 Botão **Planejar feature** na lista e no painel de detalhes: insere
  `use /skill to plan a feature` no terminal. Novo template configurável
  `antigravitySkills.templatePlan`.
- 🔌 **Compatibilidade** (codex/claude) e **Instalação** da skill exibidas no
  painel de detalhes (dados já presentes no `skills.json`).

**Alterado**
- ✳️ Template padrão passou de `use @{name}` para **`use /{name}`** (invocação
  por slash command).

### 🇺🇸 English

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

### 🇧🇷 Português

**Adicionado**
- 🎨 **Ícone/logo** da extensão (128×128) com tema *antigravity* (núcleo
  brilhante + órbitas).
- 🌐 Botões **Explicar (PT)** / **Explain (EN)** no painel de detalhes.
- ℹ️ **Painel de detalhes** por skill (nome, categoria, risco, fonte e descrição).
- 🔀 **Toggle PT | EN** da interface, com idioma inicial configurável.
- ⚙️ Configurações `explainTemplatePt` e `explainTemplateEn`.
- 📄 README bilíngue (PT/EN) e arquivo `LICENSE` (MIT).

**Alterado**
- Metadados de publicação preenchidos para **Franklyn Roberto da Silva**.

### 🇺🇸 English

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

### 🇧🇷 Português

**Adicionado**
- 🔎 **Campo de busca fixo** com filtro ao vivo (nome, categoria, descrição).
- ⭐ **Favoritos** persistidos entre sessões.
- 🗂️ Categorias **recolhíveis** com contador.
- 🏷️ **Badge de risco** (safe / medium / high / critical).
- 🗑️ Comando **Limpar favoritos**.

**Alterado**
- Painel reescrito de TreeView nativa para **webview HTML**.

### 🇺🇸 English

**Added**
- 🔎 Always-on **search box** with live filtering (name, category, description).
- ⭐ **Favorites** persisted across sessions.
- 🗂️ **Collapsible** categories with counters.
- 🏷️ **Risk badge** (safe / medium / high / critical).
- 🗑️ **Clear favorites** command.

**Changed**
- Panel rewritten from a native TreeView to an **HTML webview**.

## [1.0.0] - 2026-06-19

### 🇧🇷 Português

**Adicionado**
- 🚀 Versão inicial: painel lateral com **1600+ Antigravity Awesome Skills**
  agrupadas por categoria.
- 🖱️ Clique numa skill → digita `use @nome-da-skill` no terminal e copia.
- 📦 `skills.json` embutido (offline) com atualização em segundo plano.
- ⚙️ Configurações: `template`, `sendNewline`, `dataUrl`, `sortCategoriesByCount`.

### 🇺🇸 English

**Added**
- 🚀 Initial release: sidebar panel with **1600+ Antigravity Awesome Skills**
  grouped by category.
- 🖱️ Click a skill → types `use @skill-name` into the terminal and copies it.
- 📦 Bundled `skills.json` (offline) with background refresh.
- ⚙️ Settings: `template`, `sendNewline`, `dataUrl`, `sortCategoriesByCount`.

[1.3.0]: https://github.com/Franklyn-R-Silva/antigravity-skills-browser/releases/tag/v1.3.0
[1.2.0]: https://github.com/Franklyn-R-Silva/antigravity-skills-browser/releases/tag/v1.2.0
[1.1.0]: https://github.com/Franklyn-R-Silva/antigravity-skills-browser/releases/tag/v1.1.0
[1.0.0]: https://github.com/Franklyn-R-Silva/antigravity-skills-browser/releases/tag/v1.0.0
