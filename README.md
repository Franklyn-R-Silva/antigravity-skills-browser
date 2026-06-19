<div align="center">

<img src="media/icon.png" width="120" alt="Antigravity Skills Browser" />

# Antigravity Skills Browser

**Navegue, busque e use 1600+ Antigravity Awesome Skills direto da barra lateral.**
*Browse, search and use 1600+ Antigravity Awesome Skills right from the sidebar.*

🔎 Busca · ⭐ Favoritos · ℹ️ Detalhes · 🌐 Explicação PT/EN por IA · 🔀 UI PT|EN

</div>

> 🇧🇷 Português abaixo · 🇺🇸 English below

Extensão para o **Antigravity** (e qualquer fork do VS Code) que lista as
**1600+ Antigravity Awesome Skills** numa barra lateral, com **busca fixa**,
**favoritos**, **detalhes por skill** e **interface PT/EN**. Ao clicar numa
skill, ela digita `use @nome-da-skill` no terminal ativo (sem executar) e copia
o texto pro clipboard.

Fonte dos dados / Data source: <https://sickn33.github.io/antigravity-awesome-skills>

Autor / Author: **Franklyn Roberto da Silva** — GitHub: [@Franklyn-R-Silva](https://github.com/Franklyn-R-Silva)

---

## 🇧🇷 Português

### Recursos
- 🔎 **Busca sempre visível** no topo (nome, categoria, descrição; várias palavras).
- 🗂️ Skills agrupadas por **categoria** (88 categorias), recolhíveis.
- ⭐ **Favoritos** fixados no topo, persistidos entre sessões.
- ℹ️ Botão de **detalhes** por skill → painel com descrição, categoria, risco e fonte.
- 🌐 Botões **Explicar (PT)** / **Explain (EN)** no painel de detalhes: enviam um
  prompt pro agente do Antigravity explicar a skill no idioma escolhido.
- 🔀 **Toggle PT | EN** da interface.
- ⚠️ Badge de **risco** (safe / medium / high / critical) por skill.
- 🖱️ Clique na skill → `use @skill` no terminal **sem Enter** + copia.

### Instalação no Antigravity
1. `Ctrl+Shift+P` → **Extensions: Install from VSIX...**
2. Selecione `antigravity-skills-browser-1.2.0.vsix`.
3. O ícone aparece na barra de atividades → **Antigravity Skills**.

### Configurações (Settings → "Antigravity Skills")
| Configuração | Padrão | O que faz |
|---|---|---|
| `antigravitySkills.template` | `use @{name}` | Texto inserido. `{name}` = nome da skill. |
| `antigravitySkills.sendNewline` | `false` | Se `true`, executa (aperta Enter). |
| `antigravitySkills.language` | `pt` | Idioma inicial da UI. |
| `antigravitySkills.explainTemplatePt` | _(prompt PT)_ | Prompt do botão **Explicar (PT)**. |
| `antigravitySkills.explainTemplateEn` | _(prompt EN)_ | Prompt do botão **Explain (EN)**. |
| `antigravitySkills.dataUrl` | URL oficial | De onde baixa a lista ao atualizar. |
| `antigravitySkills.sortCategoriesByCount` | `false` | Ordenar categorias por quantidade. |

---

## 🇺🇸 English

A sidebar extension for **Antigravity** (and any VS Code fork) that lists the
**1600+ Antigravity Awesome Skills** with an always-on **search box**,
**favorites**, per-skill **details**, and a **PT/EN UI toggle**. Clicking a
skill types `use @skill-name` into the active terminal (without running it) and
copies it to the clipboard. The **Explicar (PT)** / **Explain (EN)** buttons ask
the Antigravity agent to explain the skill in the chosen language.

### Install
1. `Ctrl+Shift+P` → **Extensions: Install from VSIX...**
2. Pick `antigravity-skills-browser-1.2.0.vsix`.

---

## 🚀 Publicar no marketplace / Publishing

A maioria dos forks do VS Code (incluindo o Antigravity) usa o **Open VSX**.

```bash
npm install
npm run package            # gera o .vsix

# Publicar no Open VSX (open-vsx.org):
npx ovsx create-namespace Franklyn-R-Silva -p <SEU_TOKEN>
npx ovsx publish antigravity-skills-browser-1.2.0.vsix -p <SEU_TOKEN>
```

> O `publisher` no `package.json` (`Franklyn-R-Silva`) precisa bater com o
> namespace criado. Gere o token em <https://open-vsx.org> (login com GitHub).

Para o **VS Marketplace** (Azure DevOps), use `vsce publish` com um Personal
Access Token de um publisher criado no <https://marketplace.visualstudio.com/manage>.

## Build local / packaging
```bash
npm install
npm run package
```

## Licença / License
MIT © 2026 Franklyn Roberto da Silva
