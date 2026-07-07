const vscode = require('vscode');
const https = require('https');
const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://sickn33.github.io/antigravity-awesome-skills';

/** @type {Array<any>} */
let SKILLS = [];
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

function renderTemplate(name, variant) {
  const key = variant === 'plan' ? 'templatePlan' : 'template';
  const fallback = variant === 'plan' ? 'use /{name} to plan a feature' : 'use /{name}';
  const tpl = cfg().get(key) || fallback;
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

// Explica a skill no idioma pedido. Prioriza o modelo nativo do host
// (VS Code Language Model API) transmitindo a resposta pro painel; se não
// houver modelo/API disponível, envia o prompt ao agente pelo terminal.
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
    /* sem modelo nativo / sem permissão → cai pro fallback do terminal */
  }
  await sendToTerminal(prompt);
  vscode.window.setStatusBarMessage(`$(comment-discussion) Pergunta enviada ao agente: ${prompt}`, 4000);
  provider.postExplain({ id: skill.id, lang, mode: 'terminal' });
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
        case 'openSite':
          vscode.env.openExternal(vscode.Uri.parse(SITE_URL));
          break;
      }
    });

    this.postData();
  }

  postData() {
    if (!this.view) return;
    this.view.webview.postMessage({
      type: 'data',
      skills: SKILLS,
      favorites: this.getFavorites(),
      sortByCount: !!cfg().get('sortCategoriesByCount'),
      lang: this.getLang(),
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
  :root { color-scheme: light dark; }
  body { margin:0; padding:0; font-family: var(--vscode-font-family); font-size: var(--vscode-font-size); color: var(--vscode-foreground); }
  .topbar { position: sticky; top:0; z-index:5; background: var(--vscode-sideBar-background); padding:8px; border-bottom:1px solid var(--vscode-panel-border); display:flex; gap:6px; align-items:center; }
  #q { flex:1; box-sizing:border-box; padding:6px 8px; border-radius:4px; border:1px solid var(--vscode-input-border, transparent); background: var(--vscode-input-background); color: var(--vscode-input-foreground); outline:none; }
  #q:focus { border-color: var(--vscode-focusBorder); }
  .langtoggle { display:flex; border:1px solid var(--vscode-panel-border); border-radius:4px; overflow:hidden; }
  .langtoggle button { background:transparent; color:var(--vscode-foreground); border:none; padding:5px 8px; cursor:pointer; font-size:11px; }
  .langtoggle button.active { background: var(--vscode-button-background); color: var(--vscode-button-foreground); }
  .count { padding:4px 8px 2px; font-size:11px; opacity:.7; }
  .group > .ghead { display:flex; align-items:center; gap:6px; padding:5px 8px; cursor:pointer; user-select:none; font-weight:600; position:sticky; top:49px; background:var(--vscode-sideBar-background); }
  .group > .ghead:hover { background: var(--vscode-list-hoverBackground); }
  .group .gcount { opacity:.55; font-weight:400; font-size:11px; }
  .chev { transition: transform .12s; display:inline-block; }
  .group.collapsed .chev { transform: rotate(-90deg); }
  .group.collapsed .gbody { display:none; }
  .row { display:flex; align-items:flex-start; gap:4px; padding:5px 8px 5px 22px; cursor:pointer; border-radius:3px; }
  .row:hover { background: var(--vscode-list-hoverBackground); }
  .row .meta { flex:1; min-width:0; }
  .row .nm { display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .row .ds { display:block; font-size:11px; opacity:.65; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .badge { font-size:9px; padding:0 4px; border-radius:6px; margin-left:4px; vertical-align:middle; }
  .risk-critical { background: var(--vscode-charts-red); color:#fff; }
  .risk-high { background: var(--vscode-charts-orange); color:#000; }
  .risk-medium { background: var(--vscode-charts-yellow); color:#000; }
  .risk-safe { background: var(--vscode-charts-green); color:#000; }
  .actions { display:flex; gap:1px; opacity:0; }
  .row:hover .actions { opacity:1; }
  .iconbtn { background:transparent; border:none; color:var(--vscode-foreground); cursor:pointer; padding:2px 5px; border-radius:3px; font-size:13px; }
  .iconbtn:hover { background: var(--vscode-toolbar-hoverBackground); }
  .star.on { color: var(--vscode-charts-yellow); opacity:1 !important; }
  .star { opacity:.35; }
  .row:hover .star { opacity:.7; }
  .row:hover .star.on { opacity:1; }
  .favhead { padding:6px 8px 2px; font-weight:600; opacity:.9; }
  .empty { padding:16px; opacity:.6; text-align:center; font-size:12px; }
  /* detail overlay */
  #detail { position:fixed; inset:0; background: var(--vscode-sideBar-background); z-index:20; display:none; flex-direction:column; }
  #detail.open { display:flex; }
  .dtop { padding:8px; border-bottom:1px solid var(--vscode-panel-border); display:flex; align-items:center; gap:8px; }
  .dbody { padding:12px; overflow:auto; }
  .dname { font-size:15px; font-weight:700; margin:0 0 4px; }
  .dmeta { font-size:11px; opacity:.7; margin-bottom:10px; }
  .dsec { font-size:11px; text-transform:uppercase; opacity:.6; margin:12px 0 4px; letter-spacing:.04em; }
  .ddesc { line-height:1.5; }
  .btn { display:inline-block; background: var(--vscode-button-background); color: var(--vscode-button-foreground); border:none; padding:7px 12px; border-radius:4px; cursor:pointer; margin:4px 6px 0 0; font-size:12px; }
  .btn:hover { background: var(--vscode-button-hoverBackground); }
  .btn.secondary { background: var(--vscode-button-secondaryBackground); color: var(--vscode-button-secondaryForeground); }
  .btnrow { margin-top:6px; }
  .explainbox { margin-top:8px; padding:8px 10px; border:1px solid var(--vscode-panel-border); border-radius:4px; line-height:1.5; white-space:pre-wrap; font-size:12px; background: var(--vscode-textCodeBlock-background, transparent); }
  .explainbox.note { opacity:.8; font-style:italic; }
  .linklike { background:none; border:none; color: var(--vscode-textLink-foreground); cursor:pointer; padding:0; font-size:12px; }
</style>
</head>
<body>
  <div class="topbar">
    <input id="q" type="text" autocomplete="off" spellcheck="false" />
    <div class="langtoggle">
      <button id="langpt">PT</button><button id="langen">EN</button>
    </div>
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
    explainPt: 'Explicar (PT)', explainEn: 'Explain (EN)',
    thinking: 'Pensando…',
    sentToAgent: 'Pergunta enviada ao agente do Antigravity — veja a resposta no chat.',
    site: 'Ver no site de skills'
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
    explainPt: 'Explicar (PT)', explainEn: 'Explain (EN)',
    thinking: 'Thinking…',
    sentToAgent: 'Question sent to the Antigravity agent — see the reply in the chat.',
    site: 'View on skills site'
  }
};
function t(){ return T[LANG] || T.pt; }

const qEl = document.getElementById('q');
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
    applyLangChrome(); render();
  } else if (m.type === 'explain') {
    renderExplain(m);
  }
});

function applyLangChrome(){
  qEl.placeholder = t().search;
  document.getElementById('langpt').classList.toggle('active', LANG==='pt');
  document.getElementById('langen').classList.toggle('active', LANG==='en');
}

qEl.addEventListener('input', render);
document.getElementById('langpt').addEventListener('click', () => setLang('pt'));
document.getElementById('langen').addEventListener('click', () => setLang('en'));
document.getElementById('dback').addEventListener('click', () => detailEl.classList.remove('open'));

function setLang(l){ LANG = l; api.postMessage({type:'setLang', lang:l}); applyLangChrome(); render(); if(detailEl.classList.contains('open')) reopenDetail(); }

function esc(s){ return (s||'').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
function matches(s,q){ if(!q) return true; const hay=(s.name+' '+s.category+' '+s.description).toLowerCase(); return q.split(/\\s+/).every(t=>hay.includes(t)); }
function riskBadge(r){ return ['critical','high','medium','safe'].includes(r) ? '<span class="badge risk-'+r+'">'+r+'</span>' : ''; }

function rowHtml(s){
  const on = FAVS.has(s.id) ? ' on' : '';
  const star = FAVS.has(s.id) ? '★' : '☆';
  return '<div class="row" data-id="'+esc(s.id)+'">'
    + '<div class="meta">'
    + '<span class="nm">'+esc(s.name)+riskBadge(s.risk)+'</span>'
    + (s.description ? '<span class="ds">'+esc(s.description)+'</span>' : '')
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
  const filtered = ALL.filter(s => matches(s,q));
  countEl.textContent = t().count(filtered.length, ALL.length);
  if(!ALL.length){ rootEl.innerHTML = '<div class="empty">'+t().none+'</div>'; return; }
  if(!filtered.length){ rootEl.innerHTML = '<div class="empty">'+t().notfound(esc(q))+'</div>'; return; }

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
  const forceOpen = q.length > 0;
  for(const [cat, items] of cats){
    const isCol = !forceOpen && collapsed.has(cat);
    html += '<div class="group'+(isCol?' collapsed':'')+'" data-cat="'+esc(cat)+'">'
      + '<div class="ghead"><span class="chev">▾</span><span>'+esc(cat)+'</span><span class="gcount">'+items.length+'</span></div>'
      + '<div class="gbody">';
    items.sort((a,b)=>a.name.localeCompare(b.name)).forEach(s => html += rowHtml(s));
    html += '</div></div>';
  }
  rootEl.innerHTML = html;
}

let CURRENT = null;
function openDetail(s){
  CURRENT = s;
  dtitle.textContent = s.name;
  const tt = t();
  const targets = s.targets ? Object.keys(s.targets).filter(k => s.targets[k] === 'supported') : [];
  const setupTxt = s.setup && s.setup.summary
    ? esc(s.setup.summary)
    : (s.setup && s.setup.type && s.setup.type !== 'none' ? esc(s.setup.type) : tt.setupNone);
  dcontent.innerHTML =
      '<div class="dname">'+esc(s.name)+riskBadge(s.risk)+'</div>'
    + '<div class="dmeta">'+tt.category+': '+esc(s.category)+(s.source?('  •  '+tt.source+': '+esc(s.source)):'')+'</div>'
    + '<div class="dsec">'+tt.descr+'</div>'
    + '<div class="ddesc">'+(s.description?esc(s.description):tt.noDescr)+'</div>'
    + (targets.length ? '<div class="dsec">'+tt.compat+'</div><div class="ddesc">'+targets.map(esc).join(' · ')+'</div>' : '')
    + '<div class="dsec">'+tt.setup+'</div><div class="ddesc">'+setupTxt+'</div>'
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
    + '<div class="btnrow"><button class="linklike" id="d-site">'+tt.site+'</button></div>';
  detailEl.classList.add('open');
  const ask = (lang) => {
    const box = document.getElementById('d-explain');
    if(box){ box.style.display='block'; box.className='explainbox'; box.textContent = t().thinking; }
    api.postMessage({type:'explain', id:s.id, lang});
  };
  document.getElementById('d-use').onclick  = () => api.postMessage({type:'use', id:s.id});
  document.getElementById('d-plan').onclick = () => api.postMessage({type:'use', variant:'plan', id:s.id});
  document.getElementById('d-copy').onclick = () => api.postMessage({type:'copy', id:s.id});
  document.getElementById('d-pt').onclick   = () => ask('pt');
  document.getElementById('d-en').onclick   = () => ask('en');
  document.getElementById('d-site').onclick = () => api.postMessage({type:'openSite'});
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
    })
  );

  refreshFromRemote(context, { silent: true });
}

function deactivate() {}

module.exports = { activate, deactivate };
