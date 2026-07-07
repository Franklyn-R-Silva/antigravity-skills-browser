<div align="center">

<img src="media/icon.png" width="120" alt="Antigravity Skills Browser" />

# Antigravity Skills Browser

**Navegue, busque e insira 1600+ Antigravity Awesome Skills direto da barra lateral.**
*Browse, search and insert 1600+ Antigravity Awesome Skills right from the sidebar.*

🔎 Busca · ⭐ Favoritos · ℹ️ Detalhes · 🧩 Planejar feature · 🛠️ Presets por ferramenta · 🌐 Explicação PT/EN por IA · 🔀 UI PT|EN

</div>

> 🇧🇷 Português abaixo · 🇺🇸 English below

Clique numa skill e a extensão digita a invocação certa no seu terminal/chat
**sem executar** e copia pro clipboard. O formato se adapta à ferramenta que você
usa — Claude Code (`/skill`), Cursor (`@skill`), Antigravity (`Use @skill`), e mais.

---

## 🇧🇷 Português

### Recursos
- 🔎 **Busca sempre visível** (nome, categoria, descrição; várias palavras).
- 🗂️ Skills agrupadas por **categoria**, recolhíveis.
- ⭐ **Favoritos** fixados no topo, persistidos entre sessões.
- ℹ️ **Painel de detalhes** por skill: descrição, categoria, risco, fonte,
  **compatibilidade** (codex/claude) e **instalação**.
- 🛠️ **Preset por ferramenta**: escolha sua ferramenta e veja um **preview** do
  texto exato que será inserido. Clique → insere no terminal + copia.
- 🧩 Botão **Planejar feature** → insere a variante "to plan a feature".
- 🌐 Botões **Explicar (PT)** / **Explain (EN)**: a explicação aparece **dentro do
  painel** (via modelo do host) ou é enviada ao agente pelo terminal.
- ⚠️ Badge de **risco** (safe / medium / high / critical) e 🔀 **toggle PT | EN**.

### Como cada ferramenta invoca uma skill
Selecione a ferramenta no painel de detalhes (ou em `antigravitySkills.tool`).
Exemplo com a skill `brainstorming`:

| Ferramenta | Inserção (clique) | Planejar feature |
|---|---|---|
| Claude Code | `/brainstorming` | `/brainstorming help me plan a feature` |
| Cursor | `@brainstorming` | `@brainstorming help me plan a feature` |
| Gemini CLI | `Use brainstorming` | `Use brainstorming to plan a feature` |
| Codex CLI | `Use brainstorming` | `Use brainstorming to plan a feature` |
| Antigravity IDE | `Use @brainstorming` | `Use @brainstorming to plan a feature` |
| Antigravity CLI (agy) | `/brainstorming` | `/brainstorming help me plan a feature` |
| Kiro CLI | `Use brainstorming` | `Use brainstorming to plan a feature` |
| Kiro IDE | `Use @brainstorming` | `Use @brainstorming to plan a feature` |
| GitHub Copilot | `Ask Copilot to use brainstorming` | `Ask Copilot to use brainstorming to plan a feature` |
| OpenCode | `opencode run @brainstorming` | `opencode run @brainstorming help me plan a feature` |
| AdaL CLI | `Use brainstorming` | `Use brainstorming to plan a feature` |
| Custom | usa `template` | usa `templatePlan` |

### Instalação
1. `Ctrl+Shift+P` → **Extensions: Install from VSIX...**
2. Selecione o `.vsix` da extensão.
3. O ícone aparece na barra de atividades → **Antigravity Skills**.

### Configurações (Settings → "Antigravity Skills")
| Configuração | Padrão | O que faz |
|---|---|---|
| `antigravitySkills.tool` | `claude-code` | Ferramenta de destino (define `/`, `@`, `Use …`, etc.). |
| `antigravitySkills.template` | `use /{name}` | Texto inserido quando `tool` = `custom`. |
| `antigravitySkills.templatePlan` | `use /{name} to plan a feature` | Texto do **Planejar feature** quando `tool` = `custom`. |
| `antigravitySkills.sendNewline` | `false` | Se `true`, executa (aperta Enter). |
| `antigravitySkills.language` | `pt` | Idioma inicial da UI. |
| `antigravitySkills.explainTemplatePt` | _(prompt PT)_ | Prompt do botão **Explicar (PT)**. |
| `antigravitySkills.explainTemplateEn` | _(prompt EN)_ | Prompt do botão **Explain (EN)**. |
| `antigravitySkills.dataUrl` | URL oficial | De onde baixa a lista ao atualizar. |
| `antigravitySkills.sortCategoriesByCount` | `false` | Ordenar categorias por quantidade. |

---

## 🇺🇸 English

Click a skill and the extension types the right invocation into your terminal/chat
**without running it** and copies it to the clipboard. The format adapts to the
tool you use — Claude Code (`/skill`), Cursor (`@skill`), Antigravity
(`Use @skill`), and more.

### Features
- 🔎 Always-on **search** (name, category, description).
- 🗂️ **Collapsible** categories · ⭐ **favorites** persisted across sessions.
- ℹ️ Per-skill **detail panel**: description, category, risk, source,
  **compatibility** (codex/claude) and **setup**.
- 🛠️ **Per-tool preset** with a live **preview** of the exact inserted text.
- 🧩 **Plan a feature** button inserts the "to plan a feature" variant.
- 🌐 **Explicar (PT)** / **Explain (EN)**: the explanation shows up **inside the
  panel** (via the host model) or is sent to the terminal agent.
- ⚠️ **Risk** badge and 🔀 **PT | EN** UI toggle.

Pick your tool in the detail panel (or `antigravitySkills.tool`) — see the table
above for how each one invokes a skill.

### Install
1. `Ctrl+Shift+P` → **Extensions: Install from VSIX...**
2. Pick the extension `.vsix`.

---

Fonte dos dados / Data source: <https://sickn33.github.io/antigravity-awesome-skills>

Autor / Author: **Franklyn Roberto da Silva** — [@Franklyn-R-Silva](https://github.com/Franklyn-R-Silva)

Build, empacotamento e publicação: veja [`DEVELOPMENT.md`](DEVELOPMENT.md).
Build, packaging and publishing: see [`DEVELOPMENT.md`](DEVELOPMENT.md).

## Licença / License
MIT © 2026 Franklyn Roberto da Silva
