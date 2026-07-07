# Contributing / Contribuindo

🇧🇷 Obrigado pelo interesse em contribuir! · 🇺🇸 Thanks for your interest in contributing!

Ao participar deste projeto você concorda com o nosso
[Código de Conduta](CODE_OF_CONDUCT.md). ·
By participating you agree to our [Code of Conduct](CODE_OF_CONDUCT.md).

---

## 🇧🇷 Português

### Como contribuir
1. **Abra uma issue** antes de mudanças grandes, descrevendo o problema/ideia.
2. Faça um **fork** e crie uma branch: `git checkout -b minha-melhoria`.
3. Rode e teste localmente (veja abaixo).
4. Abra um **Pull Request** para a branch `main`, referenciando a issue.

### Ambiente
Não há passo de build, lint ou testes — o `extension.js` é CommonJS puro
executado pelo host. Detalhes de setup, empacotamento e publicação estão em
[`DEVELOPMENT.md`](DEVELOPMENT.md).

```bash
npm install
node --check extension.js   # checagem rápida de sintaxe
```
Para testar de verdade: abra a pasta no VS Code / Antigravity e pressione **F5**
(Extension Development Host).

### Convenções
- **Textos primeiro em português**; a UI é bilíngue. Ao adicionar uma string
  visível, adicione nas **duas** tabelas `T.pt` e `T.en` do webview (mesmas chaves).
- Mantenha o `skills.json`, as configs em `package.json` (`contributes.configuration`)
  e os tipos de mensagem do webview **em sincronia**.
- Siga o estilo do código existente (2 espaços, sem dependências novas sem necessidade).
- Commits no estilo [Conventional Commits](https://www.conventionalcommits.org/)
  (`feat:`, `fix:`, `docs:`…). Atualize o `CHANGELOG.md` (PT/EN) quando fizer sentido.

### Checklist do PR
- [ ] `node --check extension.js` passa.
- [ ] Strings novas estão em PT **e** EN.
- [ ] `CHANGELOG.md` atualizado (se aplicável).
- [ ] Testado no Extension Development Host (F5).

---

## 🇺🇸 English

### How to contribute
1. **Open an issue** before large changes, describing the problem/idea.
2. **Fork** and create a branch: `git checkout -b my-improvement`.
3. Run and test locally (see below).
4. Open a **Pull Request** against `main`, referencing the issue.

### Environment
There is no build, lint or test step — `extension.js` is plain CommonJS run by
the host. Setup, packaging and publishing details are in
[`DEVELOPMENT.md`](DEVELOPMENT.md).

```bash
npm install
node --check extension.js   # quick syntax check
```
To really test it: open the folder in VS Code / Antigravity and press **F5**.

### Conventions
- **Portuguese-first** strings; the UI is bilingual. When adding a user-facing
  string, add it to **both** `T.pt` and `T.en` in the webview (same keys).
- Keep `skills.json`, the `package.json` settings and the webview message types
  **in sync**.
- Match the existing code style; avoid new dependencies unless necessary.
- Use [Conventional Commits](https://www.conventionalcommits.org/) and update
  `CHANGELOG.md` (PT/EN) when relevant.

### PR checklist
- [ ] `node --check extension.js` passes.
- [ ] New strings exist in both PT **and** EN.
- [ ] `CHANGELOG.md` updated (if applicable).
- [ ] Tested in the Extension Development Host (F5).
