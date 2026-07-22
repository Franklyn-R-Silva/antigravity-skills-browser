<div align="center">

<img src="https://github.com/Franklyn-R-Silva/antigravity-skills-browser/raw/HEAD/media/icon.png" width="120" alt="Antigravity Skills Browser" />

# Antigravity Skills Browser

**Navegue, busque e insira 1900+ Agentic Awesome Skills direto da barra lateral.**
*Browse, search and insert 1900+ Agentic Awesome Skills right from the sidebar.*

🔎 Busca · ⭐ Favoritos · ℹ️ Detalhes · 🧩 Planejar feature · 🛠️ Presets por ferramenta · 🌐 Explicação PT/EN por IA · 🔀 UI PT|EN

</div>

> 🇧🇷 Português abaixo · 🇺🇸 English below

> [!IMPORTANT]
> Esta é uma extensão comunitária não oficial, mantida independentemente por
> Franklyn Roberto da Silva. Ela não é afiliada, patrocinada ou endossada pelo
> projeto Agentic Awesome Skills. A extensão consome os metadados públicos do
> catálogo; ela não instala skills nem exibe os arquivos `SKILL.md`.
>
> This is an unofficial community extension maintained independently by
> Franklyn Roberto da Silva. It is not affiliated with, sponsored by, or endorsed
> by the Agentic Awesome Skills project. The extension consumes public catalog
> metadata; it does not install skills or display the underlying `SKILL.md` files.

Clique numa skill para copiar um texto de invocação configurável e escrevê-lo no
terminal ativo (ou em um novo terminal "Antigravity"). O texto **não é enviado**
por padrão; a extensão só pressiona Enter se `antigravitySkills.sendNewline`
estiver ativado. A skill precisa já estar instalada e disponível na ferramenta
selecionada.

---

## 🇧🇷 Português

### Recursos
- 🔎 **Busca sempre visível** (nome, categoria, descrição; várias palavras).
- 🗂️ Skills agrupadas por **categoria**, recolhíveis.
- ⭐ **Favoritos** fixados no topo, persistidos entre sessões.
- ℹ️ **Painel de metadados** por skill: descrição, categoria, risco, fonte,
  compatibilidade declarada (codex/claude) e resumo de configuração.
- 🛠️ **Preset por ferramenta**: escolha sua ferramenta e veja um **preview** do
  texto exato que será inserido. Clique → insere no terminal + copia.
- 🧩 Botão **Planejar feature** → insere a variante "to plan a feature".
- 🌐 Botões **Explicar (PT)** / **Explain (EN)**: a explicação aparece **dentro do
  painel** via modelo do host; sem modelo, o prompt é escrito no terminal.
- ⚠️ Badge para níveis de risco reconhecidos (safe / medium / high / critical) e
  🔀 **toggle PT | EN**.

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

Click a skill to copy a configurable invocation string and write it to the active
terminal (or a new "Antigravity" terminal). It is **not submitted** by default;
the extension only presses Enter when `antigravitySkills.sendNewline` is enabled.
The selected skill must already be installed and available to the target tool.

### Features
- 🔎 Always-on **search** (name, category, description).
- 🗂️ **Collapsible** categories · ⭐ **favorites** persisted across sessions.
- ℹ️ Per-skill **metadata panel**: description, category, risk, source, declared
  compatibility (codex/claude), and setup summary.
- 🛠️ **Per-tool preset** with a live **preview** of the exact inserted text.
- 🧩 **Plan a feature** button inserts the "to plan a feature" variant.
- 🌐 **Explicar (PT)** / **Explain (EN)**: the explanation appears **inside the
  panel** through the host model; without one, the prompt is written to the terminal.
- ⚠️ Badges for recognized risk levels (safe / medium / high / critical) and a
  🔀 **PT | EN** UI toggle.

Pick your tool in the detail panel (or `antigravitySkills.tool`) — see the table
above for how each one invokes a skill.

### Install
1. `Ctrl+Shift+P` → **Extensions: Install from VSIX...**
2. Pick the extension `.vsix`.

---

Fonte dos dados / Data source: <https://sickn33.github.io/agentic-awesome-skills>

O código desta extensão usa a licença MIT. Metadados de catálogo e descrições
traduzidas incluídos no pacote permanecem sujeitos às
[licenças de conteúdo](https://github.com/sickn33/agentic-awesome-skills/blob/main/LICENSE-CONTENT)
e ao [registro de atribuições](https://github.com/sickn33/agentic-awesome-skills/blob/main/docs/sources/sources.md)
do projeto upstream.

The extension code is MIT-licensed. Bundled catalog metadata and translated
descriptions remain subject to the upstream
[content licenses](https://github.com/sickn33/agentic-awesome-skills/blob/main/LICENSE-CONTENT)
and [attribution ledger](https://github.com/sickn33/agentic-awesome-skills/blob/main/docs/sources/sources.md).

Autor / Author: **Franklyn Roberto da Silva** — [@Franklyn-R-Silva](https://github.com/Franklyn-R-Silva)

Contribuições são bem-vindas! Veja [`CONTRIBUTING.md`](https://github.com/Franklyn-R-Silva/antigravity-skills-browser/blob/HEAD/CONTRIBUTING.md) ·
[`CODE_OF_CONDUCT.md`](https://github.com/Franklyn-R-Silva/antigravity-skills-browser/blob/HEAD/CODE_OF_CONDUCT.md) · [`SECURITY.md`](https://github.com/Franklyn-R-Silva/antigravity-skills-browser/blob/HEAD/SECURITY.md).
Contributions welcome — see the same files.

Build, empacotamento e publicação: veja [`DEVELOPMENT.md`](https://github.com/Franklyn-R-Silva/antigravity-skills-browser/blob/HEAD/DEVELOPMENT.md).
Build, packaging and publishing: see [`DEVELOPMENT.md`](https://github.com/Franklyn-R-Silva/antigravity-skills-browser/blob/HEAD/DEVELOPMENT.md).

## Licença / License
MIT © 2026 Franklyn Roberto da Silva
