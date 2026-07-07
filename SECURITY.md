# Security Policy / Política de Segurança

## 🇧🇷 Português

### Versões com suporte
A versão mais recente publicada recebe correções de segurança.

| Versão | Suporte |
|---|---|
| 1.4.x | ✅ |
| < 1.4 | ❌ |

### Como reportar uma vulnerabilidade
**Não** abra uma issue pública para falhas de segurança. Prefira o canal privado:

1. Acesse a aba **Security** do repositório →
   **Report a vulnerability** (GitHub Private Vulnerability Reporting); ou
2. Contate o mantenedor **[@Franklyn-R-Silva](https://github.com/Franklyn-R-Silva)**
   diretamente no GitHub.

Inclua, se possível: descrição da falha, passos para reproduzir, versão da
extensão e do host (Antigravity/VS Code) e impacto potencial. Você receberá uma
confirmação em até **7 dias** e manteremos você informado sobre a correção.

### Escopo
Esta extensão apenas **lê** uma lista pública de skills e **digita texto** no
terminal ativo — ela não executa comandos por conta própria (a menos que
`antigravitySkills.sendNewline` esteja ativado). Relatos relevantes incluem:
injeção via conteúdo do `skills.json`, quebra da CSP da webview ou vazamento de
dados. Falhas nas *skills* em si pertencem ao
[projeto de origem](https://github.com/sickn33/antigravity-awesome-skills).

---

## 🇺🇸 English

### Supported versions
The latest published version receives security fixes.

| Version | Supported |
|---|---|
| 1.4.x | ✅ |
| < 1.4 | ❌ |

### Reporting a vulnerability
Please do **not** open a public issue for security problems. Use a private channel:

1. Go to the repo's **Security** tab → **Report a vulnerability** (GitHub Private
   Vulnerability Reporting); or
2. Contact the maintainer **[@Franklyn-R-Silva](https://github.com/Franklyn-R-Silva)**
   directly on GitHub.

Include, if possible: a description, steps to reproduce, the extension and host
(Antigravity/VS Code) versions, and potential impact. You'll get an
acknowledgement within **7 days** and updates through to the fix.

### Scope
This extension only **reads** a public skills list and **types text** into the
active terminal — it does not run commands on its own (unless
`antigravitySkills.sendNewline` is enabled). In-scope reports include: injection
via `skills.json` content, webview CSP bypass, or data leakage. Issues in the
*skills* themselves belong to the
[upstream project](https://github.com/sickn33/antigravity-awesome-skills).
