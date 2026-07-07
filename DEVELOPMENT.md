# Development

🇧🇷 Guia de build, empacotamento e publicação. Este arquivo **não** vai no `.vsix`
(está no `.vscodeignore`) e serve só pra quem desenvolve/publica a extensão.
🇺🇸 Build, packaging and publishing guide. This file is **not** shipped in the
`.vsix` — it's for maintainers only.

## Rodar localmente / Run locally

```bash
npm install
```

Abra a pasta no VS Code / Antigravity e pressione **F5** (Extension Development
Host). Não há passo de build, lint ou testes — o `extension.js` é CommonJS puro
executado direto pelo host.

## Empacotar / Package

```bash
npm run package            # vsce package -> antigravity-skills-browser-<version>.vsix
```

O `.vsix` é gerado com a versão do `package.json`. Para instalar manualmente:
`Ctrl+Shift+P` → **Extensions: Install from VSIX...**

## Publicar / Publish

A maioria dos forks do VS Code (incluindo o Antigravity) usa o **Open VSX**:

```bash
# Open VSX (open-vsx.org) — token via login com GitHub:
npx ovsx create-namespace Franklyn-R-Silva -p <SEU_TOKEN>
npx ovsx publish antigravity-skills-browser-<version>.vsix -p <SEU_TOKEN>
```

> O `publisher` no `package.json` (`Franklyn-R-Silva`) precisa bater com o
> namespace criado no Open VSX.

Para o **VS Marketplace** (Azure DevOps), use `vsce publish` com um Personal
Access Token de um publisher criado em <https://marketplace.visualstudio.com/manage>.

## CI (GitHub Actions)

`.github/workflows/build.yml` roda a cada push na `main` (ou manualmente):
instala deps, empacota o `.vsix`, sobe como **artifact** e cria uma **Release**
`v<version>` com o `.vsix` anexado (só quando a tag ainda não existe).

## Regenerar o ícone / Regenerate the icon

```bash
python scripts/make_icon.py   # -> media/icon.png (128x128, sem dependências)
```

## Estrutura / Layout

- `extension.js` — toda a extensão (data loading, ações de terminal, webview).
- `skills.json` — fallback offline embutido; atualizado do site em segundo plano.
- `media/` — ícone e SVG da sidebar.
- Arquitetura detalhada: veja [`CLAUDE.md`](CLAUDE.md).
