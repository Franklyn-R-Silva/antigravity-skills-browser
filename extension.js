const vscode = require('vscode');
const https = require('https');
const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://sickn33.github.io/antigravity-awesome-skills/';
const REPO_URL = 'https://github.com/sickn33/antigravity-awesome-skills';

/** @type {Array<any>} */
let SKILLS = [];
/** @type {Object<string,string>} bundled pt-BR descriptions keyed by skill id */
let PT_DESC = {};
/** @type {SkillsViewProvider} */
let provider;

// ---------------------------------------------------------------------------
// Data loading
// ---------------------------------------------------------------------------

function loadBundled(context) {
  try {
    return JSON.parse(fs.readFileSync(path.join(context.extensionPath, 'skills.json'), 'utf8'));
  } catch (e) {
    return [];
  }
}

function cachePath(context) {
  return path.join(context.globalStorageUri.fsPath, 'skills.json');
}

// Bundled offline pt-BR descriptions ({ id: text }); empty object if absent.
function loadPtDescriptions(context) {
  try {
    return JSON.parse(fs.readFileSync(path.join(context.extensionPath, 'skills-pt.json'), 'utf8'));
  } catch (e) {
    return {};
  }
}

function loadCached(context) {
  try {
    return JSON.parse(fs.readFileSync(cachePath(context), 'utf8'));
  } catch (e) {
    return null;
  }
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { 'User-Agent': 'antigravity-skills-browser' } }, (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          fetchJson(res.headers.location).then(resolve, reject);
          return;
        }
        if (res.statusCode !== 200) {
          res.resume();
          reject(new Error('HTTP ' + res.statusCode));
          return;
        }
        let data = '';
        res.setEncoding('utf8');
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      })
      .on('error', reject);
  });
}

function normalize(list) {
  return (list || [])
    .filter((s) => s && s.name)
    .map((s) => ({
      id: s.id || s.name,
      name: s.name,
      description: s.description || '',
      category: s.category || 'uncategorized',
      risk: s.risk || 'unknown',
      source: s.source || '',
      path: s.path || '',
      targets: s.plugin && s.plugin.targets ? s.plugin.targets : null,
      setup: s.plugin && s.plugin.setup ? s.plugin.setup : null,
    }));
}

async function refreshFromRemote(context, { silent } = {}) {
  const url = vscode.workspace.getConfiguration('antigravitySkills').get('dataUrl');
  try {
    const list = normalize(await fetchJson(url));
    if (!list.length) throw new Error('lista vazia');
    SKILLS = list;
    provider.postData();
    try {
      fs.mkdirSync(path.dirname(cachePath(context)), { recursive: true });
      fs.writeFileSync(cachePath(context), JSON.stringify(list), 'utf8');
    } catch (e) {
      /* cache best-effort */
    }
    if (!silent) {
      vscode.window.showInformationMessage(`Antigravity Skills: ${list.length} skills.`);
    }
  } catch (e) {
    if (!silent) {
      vscode.window.showErrorMessage('Falha ao atualizar skills: ' + (e && e.message ? e.message : e));
    }
  }
}

// ---------------------------------------------------------------------------
// Actions (terminal)
// ---------------------------------------------------------------------------

function cfg() {
  return vscode.workspace.getConfiguration('antigravitySkills');
}

// How each tool invokes a skill (the text typed into the terminal/chat).
// `use` = normal click; `plan` = "Plan a feature" button.
const TOOL_PRESETS = {
  'claude-code':     { use: '/{name}',                   plan: '/{name} help me plan a feature' },
  'cursor':          { use: '@{name}',                   plan: '@{name} help me plan a feature' },
  'gemini':          { use: 'Use {name}',                plan: 'Use {name} to plan a feature' },
  'codex':           { use: 'Use {name}',                plan: 'Use {name} to plan a feature' },
  'antigravity-ide': { use: 'Use @{name}',               plan: 'Use @{name} to plan a feature' },
  'antigravity-cli': { use: '/{name}',                   plan: '/{name} help me plan a feature' },
  'kiro-cli':        { use: 'Use {name}',                plan: 'Use {name} to plan a feature' },
  'kiro-ide':        { use: 'Use @{name}',               plan: 'Use @{name} to plan a feature' },
  'copilot':         { use: 'Ask Copilot to use {name}', plan: 'Ask Copilot to use {name} to plan a feature' },
  'opencode':        { use: 'opencode run @{name}',      plan: 'opencode run @{name} help me plan a feature' },
  'adal':            { use: 'Use {name}',                plan: 'Use {name} to plan a feature' },
};

function renderTemplate(name, variant) {
  const tool = provider ? provider.getTool() : cfg().get('tool') || 'claude-code';
  const preset = TOOL_PRESETS[tool];
  let tpl;
  if (tool === 'custom' || !preset) {
    const key = variant === 'plan' ? 'templatePlan' : 'template';
    const fallback = variant === 'plan' ? 'use /{name} to plan a feature' : 'use /{name}';
    tpl = cfg().get(key) || fallback;
  } else {
    tpl = variant === 'plan' ? preset.plan : preset.use;
  }
  return tpl.replace(/\{name\}/g, name);
}

async function sendToTerminal(text) {
  const sendNewline = cfg().get('sendNewline');
  await vscode.env.clipboard.writeText(text);
  const term = vscode.window.activeTerminal || vscode.window.createTerminal('Antigravity');
  term.show(true);
  term.sendText(text, !!sendNewline);
}

async function useSkill(skill, variant) {
  if (!skill || !skill.name) return;
  const text = renderTemplate(skill.name, variant);
  await sendToTerminal(text);
  vscode.window.setStatusBarMessage(`$(check) Inserido no terminal e copiado: ${text}`, 4000);
}

async function copySkill(skill, variant) {
  if (!skill || !skill.name) return;
  const text = renderTemplate(skill.name, variant);
  await vscode.env.clipboard.writeText(text);
  vscode.window.setStatusBarMessage(`$(copy) Copiado: ${text}`, 3000);
}

function explainPromptText(skill, lang) {
  const key = lang === 'en' ? 'explainTemplateEn' : 'explainTemplatePt';
  const tpl =
    cfg().get(key) ||
    (lang === 'en'
      ? 'Explain in English what the @{name} skill does.'
      : 'Explique em português o que faz a skill @{name}.');
  return tpl.replace(/\{name\}/g, skill.name);
}

// Explains the skill in the requested language. Prefers the host's native model
// (VS Code Language Model API), streaming the answer into the panel; if no
// model/API is available, it sends the prompt to the agent via the terminal.
async function explainInline(provider, skill, lang) {
  if (!skill || !skill.name) return;
  const prompt = explainPromptText(skill, lang);
  try {
    if (vscode.lm && typeof vscode.lm.selectChatModels === 'function') {
      const models = await vscode.lm.selectChatModels();
      if (models && models.length) {
        const cts = new vscode.CancellationTokenSource();
        const messages = [vscode.LanguageModelChatMessage.User(prompt)];
        const resp = await models[0].sendRequest(messages, {}, cts.token);
        let acc = '';
        for await (const chunk of resp.text) {
          acc += chunk;
          provider.postExplain({ id: skill.id, lang, text: acc, done: false });
        }
        provider.postExplain({ id: skill.id, lang, text: acc, done: true });
        return;
      }
    }
  } catch (e) {
    /* no native model / no permission → fall back to the terminal */
  }
  await sendToTerminal(prompt);
  vscode.window.setStatusBarMessage(`$(comment-discussion) Pergunta enviada ao agente: ${prompt}`, 4000);
  provider.postExplain({ id: skill.id, lang, mode: 'terminal' });
}

// Translates the skill description to PT using the editor's native model
// (VS Code Language Model API), streaming it and caching the result.
// Unlike explainInline, there is no terminal fallback: if no model is
// available, it tells the webview that AI translation is unavailable.
async function translateInline(provider, skill) {
  if (!skill || !skill.name || !skill.description) return;
  const cached = provider.getTranslations()[skill.id];
  if (cached) {
    provider.postTranslated({ id: skill.id, text: cached, done: true });
    return;
  }
  const prompt =
    'Traduza para português do Brasil, de forma natural e concisa, APENAS o texto a ' +
    'seguir. Não adicione aspas, comentários nem o texto original:\n\n' +
    skill.description;
  try {
    if (vscode.lm && typeof vscode.lm.selectChatModels === 'function') {
      const models = await vscode.lm.selectChatModels();
      if (models && models.length) {
        const cts = new vscode.CancellationTokenSource();
        const messages = [vscode.LanguageModelChatMessage.User(prompt)];
        const resp = await models[0].sendRequest(messages, {}, cts.token);
        let acc = '';
        for await (const chunk of resp.text) {
          acc += chunk;
          provider.postTranslated({ id: skill.id, text: acc, done: false });
        }
        acc = acc.trim();
        if (acc) await provider.setTranslation(skill.id, acc);
        provider.postTranslated({ id: skill.id, text: acc, done: true });
        return;
      }
    }
  } catch (e) {
    /* no native model / no permission → report unavailability */
  }
  provider.postTranslated({ id: skill.id, mode: 'unavailable' });
}

// ---------------------------------------------------------------------------
// Webview view provider
// ---------------------------------------------------------------------------

function nonce() {
  let t = '';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 24; i++) t += chars.charAt(Math.floor(Math.random() * chars.length));
  return t;
}

class SkillsViewProvider {
  constructor(context) {
    this.context = context;
    this.view = null;
  }

  getFavorites() {
    return this.context.globalState.get('antigravitySkills.favorites', []);
  }
  async setFavorites(ids) {
    await this.context.globalState.update('antigravitySkills.favorites', ids);
  }
  getLang() {
    return this.context.globalState.get('antigravitySkills.lang', cfg().get('language') || 'pt');
  }
  async setLang(lang) {
    await this.context.globalState.update('antigravitySkills.lang', lang);
  }
  getTool() {
    return this.context.globalState.get('antigravitySkills.tool', cfg().get('tool') || 'claude-code');
  }
  async setTool(tool) {
    await this.context.globalState.update('antigravitySkills.tool', tool);
  }
  getTranslations() {
    return this.context.globalState.get('antigravitySkills.translations', {});
  }
  async setTranslation(id, text) {
    const all = this.getTranslations();
    all[id] = text;
    await this.context.globalState.update('antigravitySkills.translations', all);
  }
  postTranslated(payload) {
    if (this.view) this.view.webview.postMessage(Object.assign({ type: 'translated' }, payload));
  }

  resolveWebviewView(webviewView) {
    this.view = webviewView;
    webviewView.webview.options = { enableScripts: true };
    webviewView.webview.html = this._html(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (msg) => {
      if (!msg) return;
      const find = (id) => SKILLS.find((x) => x.id === id);
      switch (msg.type) {
        case 'ready':
          this.postData();
          break;
        case 'use': {
          const s = find(msg.id);
          if (s) await useSkill(s, msg.variant);
          break;
        }
        case 'copy': {
          const s = find(msg.id);
          if (s) await copySkill(s, msg.variant);
          break;
        }
        case 'explain': {
          const s = find(msg.id);
          if (s) await explainInline(this, s, msg.lang);
          break;
        }
        case 'translate': {
          const s = find(msg.id);
          if (s) await translateInline(this, s);
          break;
        }
        case 'toggleFav': {
          const favs = new Set(this.getFavorites());
          if (favs.has(msg.id)) favs.delete(msg.id);
          else favs.add(msg.id);
          await this.setFavorites([...favs]);
          this.postData();
          break;
        }
        case 'setLang':
          await this.setLang(msg.lang === 'en' ? 'en' : 'pt');
          break;
        case 'setTool':
          await this.setTool(msg.tool);
          this.postData();
          break;
        case 'openSite':
          vscode.env.openExternal(
            vscode.Uri.parse(msg.id ? SITE_URL + 'skill/' + encodeURIComponent(msg.id) : SITE_URL)
          );
          break;
        case 'openRepo':
          vscode.env.openExternal(vscode.Uri.parse(REPO_URL));
          break;
      }
    });

    this.postData();
  }

  postData() {
    if (!this.view) return;
    const presets = Object.assign({}, TOOL_PRESETS, {
      custom: {
        use: cfg().get('template') || 'use /{name}',
        plan: cfg().get('templatePlan') || 'use /{name} to plan a feature',
      },
    });
    this.view.webview.postMessage({
      type: 'data',
      skills: SKILLS,
      favorites: this.getFavorites(),
      sortByCount: !!cfg().get('sortCategoriesByCount'),
      lang: this.getLang(),
      tool: this.getTool(),
      presets,
      translations: this.getTranslations(),
      ptDescriptions: PT_DESC,
    });
  }

  postExplain(payload) {
    if (this.view) this.view.webview.postMessage(Object.assign({ type: 'explain' }, payload));
  }

  _html(webview) {
    const n = nonce();
    const csp = `default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${n}';`;
    return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta http-equiv="Content-Security-Policy" content="${csp}">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  :root {
    color-scheme: light dark;
    --sp: 8px; --r: 6px; --r-sm: 4px;
    --muted: color-mix(in srgb, var(--vscode-foreground) 62%, transparent);
    --faint: color-mix(in srgb, var(--vscode-foreground) 42%, transparent);
    --hair: var(--vscode-panel-border);
    --accent: var(--vscode-focusBorder);
    --chip: color-mix(in srgb, var(--vscode-foreground) 10%, transparent);
  }
  * { box-sizing: border-box; }
  body { margin:0; padding:0; font-family: var(--vscode-font-family); font-size: var(--vscode-font-size); color: var(--vscode-foreground); }
  .iconbtn { background:transparent; border:none; color:var(--vscode-foreground); cursor:pointer; padding:3px 6px; border-radius:var(--r-sm); font-size:13px; line-height:1; transition: background .1s; }
  .iconbtn:hover { background: var(--vscode-toolbar-hoverBackground); }

  /* ---- sticky header ---- */
  .topbar { position: sticky; top:0; z-index:5; background: var(--vscode-sideBar-background); padding:10px var(--sp) 8px; display:flex; gap:6px; align-items:center; }
  .searchwrap { position:relative; flex:1; min-width:0; }
  .sicon { position:absolute; left:9px; top:50%; transform:translateY(-50%); font-size:11px; opacity:.45; pointer-events:none; }
  #q { width:100%; padding:7px 9px 7px 27px; border-radius:var(--r); border:1px solid var(--vscode-input-border, transparent); background: var(--vscode-input-background); color: var(--vscode-input-foreground); outline:none; transition: border-color .12s, box-shadow .12s; }
  #q:focus { border-color: var(--accent); box-shadow: 0 0 0 1px var(--accent); }
  #q::placeholder { color: var(--faint); }
  .langtoggle { display:flex; border:1px solid var(--hair); border-radius:var(--r); overflow:hidden; }
  .langtoggle button { background:transparent; color:var(--muted); border:none; padding:6px 9px; cursor:pointer; font-size:11px; font-weight:600; transition: background .1s, color .1s; }
  .langtoggle button:hover { background: var(--vscode-list-hoverBackground); }
  .langtoggle button.active { background: var(--vscode-button-background); color: var(--vscode-button-foreground); }
  .toolbar2 { position: sticky; top:50px; z-index:4; background: var(--vscode-sideBar-background); padding:0 var(--sp) 8px; border-bottom:1px solid var(--hair); display:flex; gap:6px; align-items:center; }
  #cat { flex:1; min-width:0; padding:6px 8px; border-radius:var(--r); border:1px solid var(--vscode-dropdown-border, var(--hair)); background: var(--vscode-dropdown-background); color: var(--vscode-dropdown-foreground); cursor:pointer; }
  #cat:hover { border-color: var(--accent); }
  .tbtn { flex:none; white-space:nowrap; background: transparent; color: var(--muted); border:1px solid var(--hair); padding:6px 9px; border-radius:var(--r); cursor:pointer; font-size:11px; font-weight:600; transition: background .1s, color .1s, border-color .1s; }
  .tbtn:hover:not(:disabled) { background: var(--vscode-list-hoverBackground); color: var(--vscode-foreground); border-color: var(--accent); }
  .tbtn:disabled { opacity:.4; cursor:default; }
  .count { padding:8px var(--sp) 4px; font-size:10.5px; letter-spacing:.03em; text-transform:uppercase; color: var(--faint); }

  /* ---- category groups ---- */
  .group > .ghead { display:flex; align-items:center; gap:7px; padding:6px var(--sp); cursor:pointer; user-select:none; font-weight:600; font-size:12px; position:sticky; top:88px; z-index:2; background:var(--vscode-sideBar-background); border-left:2px solid transparent; transition: background .1s; }
  .group > .ghead:hover { background: var(--vscode-list-hoverBackground); border-left-color: var(--accent); }
  .group .gcount { margin-left:auto; opacity:.9; font-weight:600; font-size:10px; color: var(--muted); background: var(--chip); border-radius:20px; padding:1px 7px; }
  .chev { transition: transform .15s; display:inline-block; opacity:.7; font-size:10px; }
  .group.collapsed .chev { transform: rotate(-90deg); }
  .group.collapsed .gbody { display:none; }

  /* ---- skill rows ---- */
  .row { display:flex; align-items:flex-start; gap:5px; padding:6px var(--sp) 6px 10px; cursor:pointer; border-radius:var(--r); margin:1px 4px; transition: background .1s; }
  .row:hover { background: var(--vscode-list-hoverBackground); }
  .row .meta { flex:1; min-width:0; }
  .row .nm { display:block; font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .row .ds { display:block; font-size:11px; color: var(--muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-top:1px; }
  .row.expanded { background: var(--vscode-list-hoverBackground); }
  .row.expanded .ds { white-space:normal; overflow:visible; color: color-mix(in srgb, var(--vscode-foreground) 78%, transparent); line-height:1.5; margin-top:3px; }
  .row .exp { flex:none; align-self:flex-start; margin-top:1px; opacity:.4; font-size:10px; padding:2px 4px; }
  .row:hover .exp { opacity:.85; }

  .badge { display:inline-block; font-size:8.5px; font-weight:700; letter-spacing:.03em; text-transform:uppercase; padding:1px 5px; border-radius:20px; margin-left:6px; vertical-align:middle; }
  .risk-critical { background: var(--vscode-charts-red); color:#fff; }
  .risk-high { background: var(--vscode-charts-orange); color:#1a1a1a; }
  .risk-medium { background: var(--vscode-charts-yellow); color:#1a1a1a; }
  .risk-safe { background: var(--vscode-charts-green); color:#1a1a1a; }
  .actions { display:flex; gap:1px; opacity:0; transition: opacity .1s; }
  .row:hover .actions { opacity:1; }
  .star.on { color: var(--vscode-charts-yellow); opacity:1 !important; }
  .star { opacity:.3; }
  .row:hover .star { opacity:.65; }
  .row:hover .star.on { opacity:1; }
  .favhead { display:flex; align-items:center; gap:6px; padding:8px var(--sp) 4px; font-weight:700; font-size:11px; letter-spacing:.03em; text-transform:uppercase; color: var(--vscode-charts-yellow); }
  .empty { padding:28px 16px; color: var(--muted); text-align:center; font-size:12px; line-height:1.6; }

  /* ---- detail overlay ---- */
  #detail { position:fixed; inset:0; background: var(--vscode-sideBar-background); z-index:20; display:none; flex-direction:column; }
  #detail.open { display:flex; animation: slidein .16s ease; }
  @keyframes slidein { from { opacity:0; transform: translateX(8px); } to { opacity:1; transform:none; } }
  .dtop { padding:10px var(--sp); border-bottom:1px solid var(--hair); display:flex; align-items:center; gap:8px; background: var(--vscode-sideBar-background); }
  .dtop strong { font-size:13px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .dbody { padding:14px var(--sp); overflow:auto; }
  .dname { font-size:16px; font-weight:700; margin:0 0 8px; line-height:1.25; }
  .dmeta { display:flex; flex-wrap:wrap; gap:5px; margin-bottom:6px; }
  .dmeta .tag { font-size:10.5px; color: var(--muted); background: var(--chip); border-radius:20px; padding:2px 9px; }
  .dsec { font-size:10px; font-weight:700; text-transform:uppercase; color: var(--faint); margin:16px 0 5px; letter-spacing:.06em; }
  .ddesc { line-height:1.55; font-size:12.5px; }
  .btn { display:inline-block; background: var(--vscode-button-background); color: var(--vscode-button-foreground); border:none; padding:8px 12px; border-radius:var(--r); cursor:pointer; margin:0 6px 0 0; font-size:12px; font-weight:600; transition: background .1s, transform .05s; }
  .btn:hover { background: var(--vscode-button-hoverBackground); }
  .btn:active { transform: translateY(1px); }
  .btn.secondary { background: var(--vscode-button-secondaryBackground); color: var(--vscode-button-secondaryForeground); }
  .btn.secondary:hover { background: var(--vscode-button-secondaryHoverBackground, var(--vscode-list-hoverBackground)); }
  .btnrow { margin-top:8px; display:flex; flex-wrap:wrap; gap:6px; }
  .btnrow .btn { margin:0; }
  .dselect { width:100%; margin-top:4px; padding:7px 8px; border-radius:var(--r); border:1px solid var(--vscode-dropdown-border, var(--hair)); background: var(--vscode-dropdown-background); color: var(--vscode-dropdown-foreground); cursor:pointer; }
  .preview { margin-top:8px; font-family: var(--vscode-editor-font-family, monospace); font-size:12px; padding:9px 10px; border-radius:var(--r); background: var(--vscode-textCodeBlock-background, rgba(127,127,127,.1)); border:1px solid var(--hair); white-space:pre-wrap; word-break:break-word; line-height:1.5; }
  .preview .lbl { opacity:.55; font-family: var(--vscode-font-family); font-size:9.5px; font-weight:700; text-transform:uppercase; letter-spacing:.05em; display:block; margin-bottom:4px; }
  .explainbox { margin-top:8px; padding:10px 12px; border:1px solid var(--hair); border-radius:var(--r); line-height:1.55; white-space:pre-wrap; font-size:12px; background: var(--vscode-textCodeBlock-background, transparent); }
  .explainbox.note { opacity:.8; font-style:italic; }
  .linklike { background:none; border:none; color: var(--vscode-textLink-foreground); cursor:pointer; padding:0; font-size:12px; }
  .linklike:hover { text-decoration: underline; }
</style>
</head>
<body>
  <div class="topbar">
    <div class="searchwrap">
      <span class="sicon">🔍</span>
      <input id="q" type="text" autocomplete="off" spellcheck="false" />
    </div>
    <div class="langtoggle">
      <button id="langpt">PT</button><button id="langen">EN</button>
    </div>
  </div>
  <div class="toolbar2">
    <select id="cat" title="Categoria"></select>
    <button id="toggleAll" class="tbtn"></button>
  </div>
  <div class="count" id="count"></div>
  <div id="root"><div class="empty">…</div></div>

  <div id="detail">
    <div class="dtop">
      <button class="iconbtn" id="dback" title="Voltar">←</button>
      <strong id="dtitle"></strong>
    </div>
    <div class="dbody" id="dcontent"></div>
  </div>

<script nonce="${n}">
const api = acquireVsCodeApi();
let ALL = [], FAVS = new Set(), SORTBYCOUNT = false, LANG = 'pt';
let TOOL = 'claude-code', PRESETS = {};
let TRANS = {};        // { id: on-demand cached translated description (vscode.lm) }
let PTD = {};          // { id: bundled pt-BR description } (offline, shipped in the vsix)
let CATFILTER = '';    // category selected in the filter ('' = all)
let LAST_CATS = [];    // categories rendered last (for collapse/expand all)
const EXPANDED = new Set(); // ids whose description is expanded inline in the list

// Static pt-BR labels for the (finite) set of categories. Keys stay English
// (used for filtering/data-cat); only the displayed label is translated.
const CATPT = {
  'agent-behavior':'Comportamento de agente','agent-orchestration':'Orquestração de agentes',
  'agent-squad':'Esquadrão de agentes','ai-agents':'Agentes de IA','ai-ml':'IA / ML',
  'ai-research':'Pesquisa em IA','ai-testing':'Testes de IA','andruia':'Andru.ia',
  'api-integration':'Integração de API','app-builder':'Criador de apps','architecture':'Arquitetura',
  'automation':'Automação','backend':'Backend','blockchain':'Blockchain',
  'browser-automation':'Automação de navegador','business':'Negócios','business-strategy':'Estratégia de negócios',
  'cloud':'Nuvem','code':'Código','code-quality':'Qualidade de código','coding':'Programação',
  'collaboration':'Colaboração','content':'Conteúdo','context-optimization':'Otimização de contexto',
  'core-dev':'Desenvolvimento central','creative':'Criativo','data':'Dados','data-ai':'Dados e IA',
  'data-engineering':'Engenharia de dados','data-science':'Ciência de dados','database':'Banco de dados',
  'database-processing':'Processamento de banco de dados','design':'Design','design-it':'Design',
  'developer-tools':'Ferramentas de desenvolvedor','development':'Desenvolvimento',
  'development-and-testing':'Desenvolvimento e testes','devops':'DevOps',
  'document-processing':'Processamento de documentos','ecommerce':'E-commerce','education':'Educação',
  'finance':'Finanças','framework':'Framework','front-end':'Front-end','frontend':'Front-end',
  'fullstack':'Full-stack','game-development':'Desenvolvimento de jogos','general':'Geral',
  'granular-workflow-bundle':'Pacote de fluxos granulares','graphics-processing':'Processamento gráfico',
  'growth':'Crescimento','health':'Saúde','legal':'Jurídico','leiloeiro':'Leiloeiro','marketing':'Marketing',
  'mcp':'MCP','media':'Mídia','media-processing':'Processamento de mídia','memory':'Memória','meta':'Meta',
  'mobile':'Mobile','monopoly':'Monopoly','orchestration':'Orquestração',
  'personal-development':'Desenvolvimento pessoal','planning':'Planejamento',
  'presentation-processing':'Processamento de apresentações','product-management':'Gestão de produto',
  'productivity':'Produtividade','project-management':'Gestão de projetos',
  'prompt-engineering':'Engenharia de prompt','quality':'Qualidade','reliability':'Confiabilidade',
  'research':'Pesquisa','science':'Ciência','security':'Segurança','seo':'SEO',
  'spreadsheet-processing':'Processamento de planilhas','super-code':'Super código',
  'test-automation':'Automação de testes','testing':'Testes','tool-quality':'Qualidade de ferramentas',
  'tools':'Ferramentas','uncategorized':'Sem categoria','voice-agents':'Agentes de voz',
  'web-development':'Desenvolvimento web','workflow':'Fluxo de trabalho','workflow-bundle':'Pacote de fluxos',
  'writing':'Escrita'
};
function catLabel(c){ return (LANG === 'pt' && CATPT[c]) ? CATPT[c] : c; }
// Description to show given the current language: bundled/on-demand PT when in
// PT mode and available, otherwise the original (EN/ES) text.
function ptOf(s){ return TRANS[s.id] || PTD[s.id] || ''; }
function shownDesc(s){ return (LANG === 'pt' && ptOf(s)) ? ptOf(s) : s.description; }
const TOOLS = [
  ['claude-code','Claude Code'], ['cursor','Cursor'], ['gemini','Gemini CLI'],
  ['codex','Codex CLI'], ['antigravity-ide','Antigravity IDE'], ['antigravity-cli','Antigravity CLI (agy)'],
  ['kiro-cli','Kiro CLI'], ['kiro-ide','Kiro IDE'], ['copilot','GitHub Copilot'],
  ['opencode','OpenCode'], ['adal','AdaL CLI'], ['custom','Custom']
];
const collapsed = new Set();

const T = {
  pt: {
    search: 'Buscar skill por nome, categoria ou descrição…',
    count: (n,t) => n + ' de ' + t + ' skills',
    favorites: '★ Favoritos',
    loading: 'Carregando skills…',
    none: 'Nenhuma skill carregada.',
    notfound: (q) => 'Nada encontrado para "' + q + '".',
    info: 'Detalhes', copy: 'Copiar', fav: 'Favoritar',
    back: 'Voltar', category: 'Categoria', risk: 'Risco', source: 'Fonte',
    descr: 'Descrição', noDescr: '(sem descrição)',
    use: 'Usar no terminal', copyBtn: 'Copiar "use /"',
    planBtn: 'Planejar feature', planHint: 'Insere "use /skill to plan a feature"',
    compat: 'Compatibilidade', setup: 'Instalação', setupNone: 'Sem instalação necessária',
    tool: 'Ferramenta', toolHint: 'Como a skill é inserida no terminal', preview: 'Será inserido',
    explainPt: 'Explicar (PT)', explainEn: 'Explain (EN)',
    thinking: 'Pensando…',
    sentToAgent: 'Pergunta enviada ao agente do Antigravity — veja a resposta no chat.',
    site: 'Ver no site de skills',
    allCats: 'Todas as categorias', collapseAll: 'Recolher tudo', expandAll: 'Expandir tudo',
    translate: '🌐 Traduzir descrição (PT)', translating: 'Traduzindo…',
    showOriginal: '↩ Ver original (EN)', showTranslation: '🌐 Ver tradução (PT)',
    translateUnavailable: 'Tradução por IA indisponível neste host.',
    repo: 'Ver repositório no GitHub',
    showDesc: 'Mostrar/ocultar descrição'
  },
  en: {
    search: 'Search skill by name, category or description…',
    count: (n,t) => n + ' of ' + t + ' skills',
    favorites: '★ Favorites',
    loading: 'Loading skills…',
    none: 'No skills loaded.',
    notfound: (q) => 'Nothing found for "' + q + '".',
    info: 'Details', copy: 'Copy', fav: 'Favorite',
    back: 'Back', category: 'Category', risk: 'Risk', source: 'Source',
    descr: 'Description', noDescr: '(no description)',
    use: 'Use in terminal', copyBtn: 'Copy "use /"',
    planBtn: 'Plan a feature', planHint: 'Inserts "use /skill to plan a feature"',
    compat: 'Compatibility', setup: 'Setup', setupNone: 'No setup required',
    tool: 'Tool', toolHint: 'How the skill is inserted in the terminal', preview: 'Will insert',
    explainPt: 'Explicar (PT)', explainEn: 'Explain (EN)',
    thinking: 'Thinking…',
    sentToAgent: 'Question sent to the Antigravity agent — see the reply in the chat.',
    site: 'View on skills site',
    allCats: 'All categories', collapseAll: 'Collapse all', expandAll: 'Expand all',
    translate: '🌐 Translate to PT', translating: 'Translating…',
    showOriginal: '↩ Show original (EN)', showTranslation: '🌐 Show translation (PT)',
    translateUnavailable: 'AI translation unavailable in this host.',
    repo: 'View repository on GitHub',
    showDesc: 'Show/hide description'
  }
};
function t(){ return T[LANG] || T.pt; }

const qEl = document.getElementById('q');
const catEl = document.getElementById('cat');
const toggleAllEl = document.getElementById('toggleAll');
const rootEl = document.getElementById('root');
const countEl = document.getElementById('count');
const detailEl = document.getElementById('detail');
const dcontent = document.getElementById('dcontent');
const dtitle = document.getElementById('dtitle');

window.addEventListener('message', (ev) => {
  const m = ev.data;
  if (m.type === 'data') {
    ALL = m.skills || []; FAVS = new Set(m.favorites || []);
    SORTBYCOUNT = !!m.sortByCount; LANG = m.lang === 'en' ? 'en' : 'pt';
    TOOL = m.tool || 'claude-code'; PRESETS = m.presets || {};
    TRANS = m.translations || {}; PTD = m.ptDescriptions || {};
    if(CATFILTER && !ALL.some(s => s.category === CATFILTER)) CATFILTER = '';
    applyLangChrome(); buildCatOptions(); render();
    if(detailEl.classList.contains('open')) reopenDetail();
  } else if (m.type === 'explain') {
    renderExplain(m);
  } else if (m.type === 'translated') {
    renderTranslated(m);
  }
});

function applyLangChrome(){
  qEl.placeholder = t().search;
  catEl.title = t().category;
  document.getElementById('langpt').classList.toggle('active', LANG==='pt');
  document.getElementById('langen').classList.toggle('active', LANG==='en');
}

// Fills the category filter with counts, preserving the current selection.
function buildCatOptions(){
  const counts = new Map();
  for(const s of ALL) counts.set(s.category, (counts.get(s.category)||0)+1);
  const cats = [...counts.keys()].sort((a,b)=>catLabel(a).localeCompare(catLabel(b)));
  catEl.innerHTML = '<option value="">'+esc(t().allCats)+' ('+ALL.length+')</option>'
    + cats.map(c => '<option value="'+esc(c)+'"'+(c===CATFILTER?' selected':'')+'>'+esc(catLabel(c))+' ('+counts.get(c)+')</option>').join('');
}

qEl.addEventListener('input', render);
catEl.addEventListener('change', () => { CATFILTER = catEl.value; render(); });
toggleAllEl.addEventListener('click', () => {
  const anyOpen = LAST_CATS.some(c => !collapsed.has(c));
  if(anyOpen) LAST_CATS.forEach(c => collapsed.add(c));
  else LAST_CATS.forEach(c => collapsed.delete(c));
  render();
});
document.getElementById('langpt').addEventListener('click', () => setLang('pt'));
document.getElementById('langen').addEventListener('click', () => setLang('en'));
document.getElementById('dback').addEventListener('click', () => detailEl.classList.remove('open'));
document.addEventListener('keydown', (e) => { if(e.key === 'Escape' && detailEl.classList.contains('open')) detailEl.classList.remove('open'); });

function setLang(l){ LANG = l; api.postMessage({type:'setLang', lang:l}); applyLangChrome(); buildCatOptions(); render(); if(detailEl.classList.contains('open')) reopenDetail(); }

function esc(s){ return (s||'').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
function matches(s,q){ if(!q) return true; const hay=(s.name+' '+s.category+' '+catLabel(s.category)+' '+s.description+' '+ptOf(s)).toLowerCase(); return q.split(/\\s+/).every(t=>hay.includes(t)); }
function riskBadge(r){ return ['critical','high','medium','safe'].includes(r) ? '<span class="badge risk-'+r+'">'+r+'</span>' : ''; }

function rowHtml(s){
  const on = FAVS.has(s.id) ? ' on' : '';
  const star = FAVS.has(s.id) ? '★' : '☆';
  const d = shownDesc(s);
  const exp = EXPANDED.has(s.id);
  return '<div class="row'+(exp?' expanded':'')+'" data-id="'+esc(s.id)+'">'
    + (d ? '<button class="iconbtn exp" title="'+t().showDesc+'" data-exp="'+esc(s.id)+'">'+(exp?'▾':'▸')+'</button>'
         : '<span class="exp">&nbsp;</span>')
    + '<div class="meta">'
    + '<span class="nm">'+esc(s.name)+riskBadge(s.risk)+'</span>'
    + (d ? '<span class="ds">'+esc(d)+'</span>' : '')
    + '</div>'
    + '<div class="actions">'
    + '<button class="iconbtn info" title="'+t().info+'">ℹ️</button>'
    + '<button class="iconbtn plan" title="'+t().planHint+'">🧩</button>'
    + '<button class="iconbtn copy" title="'+t().copy+'">⧉</button>'
    + '</div>'
    + '<button class="iconbtn star'+on+'" title="'+t().fav+'" data-fav="'+esc(s.id)+'">'+star+'</button>'
    + '</div>';
}

function render(){
  const q = qEl.value.trim().toLowerCase();
  const filtered = ALL.filter(s => matches(s,q) && (!CATFILTER || s.category === CATFILTER));
  countEl.textContent = t().count(filtered.length, ALL.length);
  if(!ALL.length){ LAST_CATS = []; updateToggleAll(); rootEl.innerHTML = '<div class="empty">'+t().none+'</div>'; return; }
  if(!filtered.length){ LAST_CATS = []; updateToggleAll(); rootEl.innerHTML = '<div class="empty">'+t().notfound(esc(q))+'</div>'; return; }

  let html = '';
  const favItems = filtered.filter(s => FAVS.has(s.id));
  if(favItems.length){
    html += '<div class="favhead">'+t().favorites+'</div>';
    favItems.sort((a,b)=>a.name.localeCompare(b.name)).forEach(s => html += rowHtml(s));
  }
  const byCat = new Map();
  for(const s of filtered){ if(!byCat.has(s.category)) byCat.set(s.category,[]); byCat.get(s.category).push(s); }
  let cats = [...byCat.entries()];
  cats.sort((a,b)=> SORTBYCOUNT ? b[1].length-a[1].length : a[0].localeCompare(b[0]));
  LAST_CATS = cats.map(c => c[0]);
  const forceOpen = q.length > 0;
  for(const [cat, items] of cats){
    const isCol = !forceOpen && collapsed.has(cat);
    html += '<div class="group'+(isCol?' collapsed':'')+'" data-cat="'+esc(cat)+'">'
      + '<div class="ghead"><span class="chev">▾</span><span>'+esc(catLabel(cat))+'</span><span class="gcount">'+items.length+'</span></div>'
      + '<div class="gbody">';
    items.sort((a,b)=>a.name.localeCompare(b.name)).forEach(s => html += rowHtml(s));
    html += '</div></div>';
  }
  rootEl.innerHTML = html;
  updateToggleAll();
}

// Global button label: shows "Collapse all" when any group is open,
// "Expand all" when they are all collapsed.
function updateToggleAll(){
  const anyOpen = LAST_CATS.some(c => !collapsed.has(c));
  toggleAllEl.textContent = anyOpen ? t().collapseAll : t().expandAll;
  toggleAllEl.disabled = LAST_CATS.length === 0;
}

let CURRENT = null;
let SHOWPT = false;   // is the detail panel showing the PT translation?
function openDetail(s){
  CURRENT = s;
  const hasPT = !!ptOf(s);
  SHOWPT = (LANG === 'pt' && hasPT);   // default to PT when in PT mode and available
  dtitle.textContent = s.name;
  const tt = t();
  const targets = s.targets ? Object.keys(s.targets).filter(k => s.targets[k] === 'supported') : [];
  const setupTxt = s.setup && s.setup.summary
    ? esc(s.setup.summary)
    : (s.setup && s.setup.type && s.setup.type !== 'none' ? esc(s.setup.type) : tt.setupNone);
  const descNow = s.description ? (SHOWPT ? ptOf(s) : s.description) : '';
  const trLabel = hasPT ? (SHOWPT ? tt.showOriginal : tt.showTranslation) : tt.translate;
  dcontent.innerHTML =
      '<div class="dname">'+esc(s.name)+riskBadge(s.risk)+'</div>'
    + '<div class="dmeta"><span class="tag">'+esc(catLabel(s.category))+'</span>'+(s.source?('<span class="tag">'+tt.source+': '+esc(s.source)+'</span>'):'')+'</div>'
    + '<div class="dsec">'+tt.descr+'</div>'
    + '<div class="ddesc" id="d-desc">'+(descNow?esc(descNow):tt.noDescr)+'</div>'
    + (s.description ? '<div class="btnrow"><button class="linklike" id="d-translate">'+trLabel+'</button></div>' : '')
    + (targets.length ? '<div class="dsec">'+tt.compat+'</div><div class="ddesc">'+targets.map(esc).join(' · ')+'</div>' : '')
    + '<div class="dsec">'+tt.setup+'</div><div class="ddesc">'+setupTxt+'</div>'
    + '<div class="dsec">'+tt.tool+'</div>'
    + '<select class="dselect" id="d-tool" title="'+tt.toolHint+'">'
    +   TOOLS.map(function(o){ return '<option value="'+o[0]+'"'+(o[0]===TOOL?' selected':'')+'>'+esc(o[1])+'</option>'; }).join('')
    + '</select>'
    + '<div class="preview" id="d-preview"></div>'
    + '<div class="btnrow">'
    +   '<button class="btn" id="d-use">'+tt.use+'</button>'
    +   '<button class="btn" id="d-plan">'+tt.planBtn+'</button>'
    +   '<button class="btn secondary" id="d-copy">'+tt.copyBtn+'</button>'
    + '</div>'
    + '<div class="dsec">'+ (LANG==='en'?'AI explanation':'Explicação por IA') +'</div>'
    + '<div class="btnrow">'
    +   '<button class="btn" id="d-pt">'+tt.explainPt+'</button>'
    +   '<button class="btn" id="d-en">'+tt.explainEn+'</button>'
    + '</div>'
    + '<div class="explainbox" id="d-explain" style="display:none"></div>'
    + '<div class="btnrow"><button class="linklike" id="d-site">'+tt.site+'</button>'
    +   '<button class="linklike" id="d-repo" style="margin-left:12px">'+tt.repo+'</button></div>';
  detailEl.classList.add('open');
  updatePreview(s);
  const ask = (lang) => {
    const box = document.getElementById('d-explain');
    if(box){ box.style.display='block'; box.className='explainbox'; box.textContent = t().thinking; }
    api.postMessage({type:'explain', id:s.id, lang});
  };
  const trBtn = document.getElementById('d-translate');
  if(trBtn) trBtn.onclick = () => toggleTranslate(s);
  document.getElementById('d-tool').onchange = (e) => { TOOL = e.target.value; updatePreview(s); api.postMessage({type:'setTool', tool:TOOL}); };
  document.getElementById('d-use').onclick  = () => api.postMessage({type:'use', id:s.id});
  document.getElementById('d-plan').onclick = () => api.postMessage({type:'use', variant:'plan', id:s.id});
  document.getElementById('d-copy').onclick = () => api.postMessage({type:'copy', id:s.id});
  document.getElementById('d-pt').onclick   = () => ask('pt');
  document.getElementById('d-en').onclick   = () => ask('en');
  document.getElementById('d-site').onclick = () => api.postMessage({type:'openSite', id:s.id});
  document.getElementById('d-repo').onclick = () => api.postMessage({type:'openRepo'});
}

function fillTpl(tpl, name){ return (tpl||'').replace(/\\{name\\}/g, name); }
function updatePreview(s){
  const box = document.getElementById('d-preview');
  if(!box) return;
  const p = PRESETS[TOOL] || PRESETS['custom'] || { use:'use /{name}', plan:'use /{name} to plan a feature' };
  const tt = t();
  box.innerHTML = '<span class="lbl">'+tt.preview+'</span>'
    + esc(fillTpl(p.use, s.name)) + '\\n' + esc(fillTpl(p.plan, s.name));
}

// Toggles the description between original (EN/ES) and PT. Uses the bundled or
// on-demand PT text when present; otherwise asks the host, which translates via
// the editor model and streams it back (only reachable when no bundled PT).
function toggleTranslate(s){
  const desc = document.getElementById('d-desc');
  const btn = document.getElementById('d-translate');
  if(!desc || !btn) return;
  if(SHOWPT){
    SHOWPT = false;
    desc.textContent = s.description || t().noDescr;
    btn.textContent = ptOf(s) ? t().showTranslation : t().translate;
    return;
  }
  if(ptOf(s)){
    SHOWPT = true;
    desc.textContent = ptOf(s);
    btn.textContent = t().showOriginal;
    return;
  }
  btn.textContent = t().translating;
  btn.disabled = true;
  api.postMessage({type:'translate', id:s.id});
}

function renderTranslated(m){
  if(!CURRENT || CURRENT.id !== m.id) return;
  const desc = document.getElementById('d-desc');
  const btn = document.getElementById('d-translate');
  if(m.mode === 'unavailable'){ if(btn){ btn.disabled=false; btn.textContent=t().translateUnavailable; } return; }
  if(m.text){ TRANS[m.id] = m.text; SHOWPT = true; if(desc) desc.textContent = m.text; }
  if(btn && m.done){ btn.disabled=false; btn.textContent=t().showOriginal; }
}

function renderExplain(m){
  if(!CURRENT || CURRENT.id !== m.id) return;
  const box = document.getElementById('d-explain');
  if(!box) return;
  box.style.display='block';
  if(m.mode === 'terminal'){ box.className='explainbox note'; box.textContent = t().sentToAgent; return; }
  box.className='explainbox';
  box.textContent = m.text || (m.done ? '' : t().thinking);
}
function reopenDetail(){ if(CURRENT){ const fresh = ALL.find(x=>x.id===CURRENT.id) || CURRENT; openDetail(fresh); } }

rootEl.addEventListener('click', (e) => {
  const head = e.target.closest('.ghead');
  if(head){ const g=head.parentElement, cat=g.getAttribute('data-cat'); if(g.classList.toggle('collapsed')) collapsed.add(cat); else collapsed.delete(cat); return; }
  const expBtn = e.target.closest('[data-exp]');
  if(expBtn){ e.stopPropagation(); const id=expBtn.getAttribute('data-exp'); const row=expBtn.closest('.row');
    if(EXPANDED.has(id)){ EXPANDED.delete(id); row.classList.remove('expanded'); expBtn.textContent='▸'; }
    else { EXPANDED.add(id); row.classList.add('expanded'); expBtn.textContent='▾'; } return; }
  const favBtn = e.target.closest('[data-fav]');
  if(favBtn){ e.stopPropagation(); const id=favBtn.getAttribute('data-fav'); if(FAVS.has(id))FAVS.delete(id);else FAVS.add(id); api.postMessage({type:'toggleFav', id}); render(); return; }
  const infoBtn = e.target.closest('.info');
  if(infoBtn){ e.stopPropagation(); const id=infoBtn.closest('.row').getAttribute('data-id'); const s=ALL.find(x=>x.id===id); if(s) openDetail(s); return; }
  const planBtn = e.target.closest('.plan');
  if(planBtn){ e.stopPropagation(); api.postMessage({type:'use', variant:'plan', id: planBtn.closest('.row').getAttribute('data-id')}); return; }
  const copyBtn = e.target.closest('.copy');
  if(copyBtn){ e.stopPropagation(); api.postMessage({type:'copy', id: copyBtn.closest('.row').getAttribute('data-id')}); return; }
  const row = e.target.closest('.row');
  if(row){ api.postMessage({type:'use', id: row.getAttribute('data-id')}); }
});

api.postMessage({ type:'ready' });
</script>
</body>
</html>`;
  }
}

// ---------------------------------------------------------------------------
// Activation
// ---------------------------------------------------------------------------

function activate(context) {
  SKILLS = normalize(loadCached(context) || loadBundled(context));
  PT_DESC = loadPtDescriptions(context);

  provider = new SkillsViewProvider(context);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('antigravitySkillsView', provider),
    vscode.commands.registerCommand('antigravitySkills.useSkill', useSkill),
    vscode.commands.registerCommand('antigravitySkills.refresh', () =>
      refreshFromRemote(context, { silent: false })
    ),
    vscode.commands.registerCommand('antigravitySkills.clearFavorites', async () => {
      await provider.setFavorites([]);
      provider.postData();
      vscode.window.setStatusBarMessage('$(clear-all) Favoritos limpos', 3000);
    }),
    vscode.commands.registerCommand('antigravitySkills.openSite', () =>
      vscode.env.openExternal(vscode.Uri.parse(SITE_URL))
    ),
    vscode.commands.registerCommand('antigravitySkills.openRepo', () =>
      vscode.env.openExternal(vscode.Uri.parse(REPO_URL))
    )
  );

  refreshFromRemote(context, { silent: true });
}

function deactivate() {}

module.exports = { activate, deactivate };
