# Changelog

Todas as mudanças relevantes desta extensão são documentadas aqui.
O formato segue o [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/)
e o projeto adota o [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [Não lançado]

- _Nada por enquanto._

## [1.2.0] - 2026-06-19

### Adicionado

- 🎨 **Ícone/logo** da extensão (128×128) com tema *antigravity* (núcleo
  brilhante + órbitas), exibido no marketplace e na lista de extensões.
- 🌐 Botões **Explicar (PT)** / **Explain (EN)** no painel de detalhes: enviam
  um prompt ao agente do Antigravity para explicar a skill no idioma escolhido.
- ℹ️ **Painel de detalhes** por skill (nome, categoria, risco, fonte e
  descrição completa) com ações de usar/copiar.
- 🔀 **Toggle PT | EN** da interface, com idioma inicial configurável
  (`antigravitySkills.language`).
- ⚙️ Configurações `explainTemplatePt` e `explainTemplateEn` para customizar os
  prompts de explicação.
- 📄 README bilíngue (PT/EN) com instruções de publicação e arquivo `LICENSE`
  (MIT).

### Alterado

- Metadados de publicação (`author`, `publisher`, `repository`, `homepage`,
  `galleryBanner`) preenchidos para o autor **Franklyn Roberto da Silva**.

## [1.1.0] - 2026-06-19

### Adicionado

- 🔎 **Campo de busca fixo** no topo do painel, com filtro ao vivo por nome,
  categoria e descrição (suporta múltiplas palavras).
- ⭐ **Favoritos**: fixe skills numa seção no topo; persistem entre sessões.
- 🗂️ Categorias **recolhíveis** com contador de skills.
- 🏷️ **Badge de risco** (safe / medium / high / critical) por skill.
- 🗑️ Comando **Limpar favoritos** no topo do painel.

### Alterado

- Painel reescrito de uma TreeView nativa para uma **webview HTML**, permitindo
  busca sempre visível e layout customizado.

## [1.0.0] - 2026-06-19

### Adicionado

- 🚀 Versão inicial: painel lateral com **1600+ Antigravity Awesome Skills**
  agrupadas por categoria.
- 🖱️ Clique numa skill → digita `use @nome-da-skill` no terminal ativo (sem
  executar) e copia para o clipboard.
- 📦 `skills.json` embutido (funciona offline) com atualização em segundo plano
  a partir do site oficial.
- ⚙️ Configurações: `template`, `sendNewline`, `dataUrl`,
  `sortCategoriesByCount`.

[Não lançado]: https://github.com/Franklyn-R-Silva/antigravity-skills-browser/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/Franklyn-R-Silva/antigravity-skills-browser/releases/tag/v1.2.0
[1.1.0]: https://github.com/Franklyn-R-Silva/antigravity-skills-browser/releases/tag/v1.1.0
[1.0.0]: https://github.com/Franklyn-R-Silva/antigravity-skills-browser/releases/tag/v1.0.0
