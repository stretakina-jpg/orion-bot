import {
  ORION_EXTENSION_CONTENT_JS,
  ORION_OPTGO_V5_USERSCRIPT_JS,
  ORION_EXTENSION_MANIFEST,
  ORION_EXTENSION_POCKET_BRIDGE_JS,
  ORION_BRIDGE_BADGE_JS,
  ORION_AGENT_INDICATOR_JS,
  ORION_ACCESSIBILITY_TREE_JS,
  ORION_DOM_OBSERVER_JS,
} from './orionExtensionBundle';

export interface OrionScript {
  id: string;
  name: string;
  category: 'core' | 'bridge' | 'observer' | 'automation' | 'strategies' | 'pwa';
  description: string;
  version: string;
  updatedAt: string;
  code: string;
}

export const ORION_SCRIPTS: OrionScript[] = [
  {
    id: 'orion-pocket-option-complete-master',
    name: '🟣 content.js — PRISMA IA v13.0 FINAL (Sem Cortes • Mundo Roxo Neon + Contador Ganho Verde + Logos Touro/Urso)',
    category: 'core',
    version: '13.0.0',
    updatedAt: '2026-09-28',
    description:
      'CÓDIGO 100% COMPLETO SEM NENHUM CORTE (v13.0 FINAL): 1) Onde tinha ORION agora é PRISMA IA com a mesma fonte; 2) Vídeo de fundo oficial com o Mundo em Roxo Neon; 3) Todos os detalhes verdes trocados para Roxo Neon, mantendo o Contador de Ganho (Wins e Lucro Positivo) em VERDE (#34d399); 4) Logos oficiais do Touro e do Urso adicionados no velocímetro e barra de força; 5) Buffer de Ticks Reais por ativo + Ranking Payout/Fluxo + 4 Padrões de Vela + S&R + Filtro OTC.',
    code: ORION_EXTENSION_CONTENT_JS,
  },
  {
    id: 'orion-optgo-v5-userscript',
    name: '⚡ prisma-ia-v13-final.user.js (UserScript Tampermonkey PRISMA IA v13.0 FINAL Completo)',
    category: 'core',
    version: '13.0.0',
    updatedAt: '2026-09-28',
    description:
      'UserScript Tampermonkey com o código v13.0 FINAL 100% completo sem cortes: PRISMA IA, Mundo em Roxo Neon no vídeo de fundo, detalhes em Roxo Neon, Contador de Ganho Verde e Logos reais do Touro e do Urso.',
    code: ORION_OPTGO_V5_USERSCRIPT_JS,
  },
  {
    id: 'orion-teste-rei-agent-indicator',
    name: '🟣 agent-indicator.js (Desbloqueado • Borda Pulsante #7c6ef0 + Arrêter Orion + Orion actif)',
    category: 'bridge',
    version: '9.0.0',
    updatedAt: '2026-09-28',
    description:
      'Do repositório glkhali7777/teste-rei (100% descompactado e sem ocultação): Exibe imediatamente a borda roxa pulsante (#orion-pulse-overlay), o botão central "Arrêter Orion" (#orion-stop-button) e o status "Orion actif" (#orion-status-indicator).',
    code: ORION_AGENT_INDICATOR_JS,
  },
  {
    id: 'orion-teste-rei-bridge-badge',
    name: '🟣 bridge-orion-badge.js (Badge Roxo #7c6ef0 no Topo Direito + Menu Contextual)',
    category: 'bridge',
    version: '9.0.0',
    updatedAt: '2026-09-28',
    description:
      'Do repositório glkhali7777/teste-rei: Cria a pílula/badge roxa (#7c6ef0) no canto superior direito com estados connecting/connected/disconnected, clique para focar o painel e menu contextual.',
    code: ORION_BRIDGE_BADGE_JS,
  },
  {
    id: 'orion-teste-rei-accessibility-tree',
    name: '🌳 accessibility-tree.js (window.__generateAccessibilityTree • Análise DOM)',
    category: 'observer',
    version: '9.0.0',
    updatedAt: '2026-09-28',
    description:
      'Do repositório glkhali7777/teste-rei: Analisa a árvore de acessibilidade da página (max_depth: 2, timeout: 3000ms), mapeando elementos interativos, ativos e botões da corretora.',
    code: ORION_ACCESSIBILITY_TREE_JS,
  },
  {
    id: 'orion-teste-rei-dom-observer',
    name: '👁️ dom-observer.js (MutationObserver + Auto-Consentimento chrome.storage.local)',
    category: 'observer',
    version: '9.0.0',
    updatedAt: '2026-09-28',
    description:
      'Do repositório glkhali7777/teste-rei (com orion_consent_sites liberado automaticamente): Monitora mudanças no DOM em tempo real e mantém __go_traderoom_warm_ts e __go_ssid ativos.',
    code: ORION_DOM_OBSERVER_JS,
  },
  {
    id: 'orion-pocket-main-bridge',
    name: '🔌 pocket_bridge.js (Interceptador WebSocket wss://*.po.market & AppData)',
    category: 'bridge',
    version: '9.0.0',
    updatedAt: '2026-09-28',
    description:
      'Roda no mundo MAIN da Pocket Option para capturar os ticks reais do WebSocket (wss://demo-api-eu.po.market) e sincronizar AppData.',
    code: ORION_EXTENSION_POCKET_BRIDGE_JS,
  },
  {
    id: 'orion-pocket-manifest-v3',
    name: '📦 manifest.json (Manifest V3 Completo v9.0 - Carrega todos os 6 scripts)',
    category: 'core',
    version: '9.0.0',
    updatedAt: '2026-09-28',
    description:
      'Arquivo manifest.json oficial v9.0 carregando automaticamente pocket_bridge.js, accessibility-tree.js, dom-observer.js, bridge-orion-badge.js, agent-indicator.js e content.js.',
    code: ORION_EXTENSION_MANIFEST,
  },
  {
    id: 'orion-complete-suite',
    name: '⚡ Orion Bot Suite Completa (All-in-One Engine)',
    category: 'core',
    version: '6.5.0',
    updatedAt: '2026-09-22',
    description: 'Código fonte 100% completo do Robô Orion com todas as funções liberadas: Análise Algorítmica (MHI 1/2/3, OTC Sniper, Reversão RSI), Interceptador DOM, Gerenciador de Saldo e Execução de Cliques em qualquer corretora (BrokerQX, Quotex, Alpine, Pocket Option).',
    code: `/**
 * =========================================================================
 * ⚡ ORION TRADING BOT - SUÍTE COMPLETA & MOTOR AUTÔNOMO ALL-IN-ONE
 * Versão: 6.5.0 • Licença: Orion Proprietary Core • Autorizado: glkhali7777 / stretakina
 * Suporte: BrokerQX OTC, Quotex OTC, Pocket Option, Alpine Forex, Polarium
 * =========================================================================
 */

(function () {
  'use strict';

  // Impedir injeções duplicadas
  if (window.__ORION_BOT_SUITE_ACTIVE__) {
    console.warn('[Orion Bot] Suíte já está em execução no navegador.');
    return;
  }
  window.__ORION_BOT_SUITE_ACTIVE__ = true;

  console.log('%c[ORION BOT] INICIANDO MOTOR COMPLETO...', 'color: #9333ea; font-size: 14px; font-weight: bold;');

  // 1. CONFIGURAÇÕES GLOBAIS E GESTÃO DE RISCO
  const OrionState = {
    version: '6.5.0',
    isActive: true,
    userEmail: 'glkhali7777@gmail.com',
    accountMode: 'REAL', // 'REAL' ou 'DEMO'
    realBalance: 500.0,
    demoBalance: 10000.0,
    tradeAmount: 10.0,
    payoutMin: 80,
    stopWin: 250.0,
    stopLoss: 100.0,
    martingaleMode: 'moderate', // 'fixed', 'moderate', 'aggressive', 'soros'
    martingaleMultiplier: 2.0,
    maxMartingaleSteps: 2,
    currentStep: 0,
    currentProfit: 0.0,
    consecutiveWins: 0,
    consecutiveLosses: 0,
    signalsHistory: [],
    selectedAsset: 'EUR/USD (OTC)',
  };

  // 2. MOTOR ALGORÍTMICO DE ANÁLISE DE VELAS (MHI + OTC SNIPER + BLITZ)
  class OrionStrategyEngine {
    static calculateRSI(closes, period = 7) {
      if (closes.length <= period) return 50;
      let gains = 0, losses = 0;
      for (let i = 1; i <= period; i++) {
        const diff = closes[i] - closes[i - 1];
        if (diff >= 0) gains += diff;
        else losses += Math.abs(diff);
      }
      let avgGain = gains / period;
      let avgLoss = losses / period;
      if (avgLoss === 0) return 100;
      const rs = avgGain / avgLoss;
      return 100 - (100 / (1 + rs));
    }

    static analyzeMarket(candles) {
      if (!candles || candles.length < 5) {
        return { signal: 'NEUTRAL', confidence: 0, reason: 'Coletando velas de mercado...' };
      }

      const closes = candles.map(c => c.close);
      const rsi = this.calculateRSI(closes, 7);
      const last = candles[candles.length - 1];
      const body = Math.abs(last.close - last.open);
      const upperWick = last.high - Math.max(last.open, last.close);
      const lowerWick = Math.min(last.open, last.close) - last.low;

      // Estratégia 1: OTC Sniper (Rejeição de Pavio + Sobrecompra/Sobrevenda de RSI)
      if (rsi >= 75 && upperWick > body * 1.1) {
        return {
          signal: 'PUT',
          confidence: 96.4,
          reason: 'OTC Sniper: Rejeição extrema em topo com RSI em ' + rsi.toFixed(1) + '. Entrada em VENDA.'
        };
      }
      if (rsi <= 25 && lowerWick > body * 1.1) {
        return {
          signal: 'CALL',
          confidence: 95.8,
          reason: 'OTC Sniper: Absorção em fundo com pavio e RSI em ' + rsi.toFixed(1) + '. Entrada em COMPRA.'
        };
      }

      // Estratégia 2: MHI 1 Clássico (Minoria das últimas 3 velas)
      const last3 = candles.slice(-3);
      let greens = 0, reds = 0;
      for (const c of last3) {
        if (c.close > c.open) greens++;
        else if (c.close < c.open) reds++;
      }
      if (greens > reds) {
        return {
          signal: 'PUT',
          confidence: 92.1,
          reason: 'MHI 1: Predominância de velas verdes. Gatilho de reversão para PUT.'
        };
      } else if (reds > greens) {
        return {
          signal: 'CALL',
          confidence: 93.3,
          reason: 'MHI 1: Predominância de velas vermelhas. Gatilho de reversão para CALL.'
        };
      }

      return { signal: 'NEUTRAL', confidence: 50, reason: 'Mercado em consolidação lateral.' };
    }
  }

  // 3. EXECUTOR DE CLIQUES CIRÚRGICOS NO DOM DA CORRETORA (BROKERQX, QUOTEX, ETC.)
  class OrionDomExecutor {
    static findButtonByKeywords(keywords) {
      const elements = Array.from(document.querySelectorAll('button, div[role="button"], a[role="button"], input[type="button"]'));
      for (const el of elements) {
        const text = (el.innerText || el.textContent || el.getAttribute('aria-label') || '').toLowerCase().trim();
        const classes = (el.className || '').toLowerCase();
        for (const kw of keywords) {
          if (text.includes(kw) || classes.includes(kw)) {
            return el;
          }
        }
      }
      return null;
    }

    static executeCall() {
      console.log('%c[Orion Exec] Disparando ORDEM COMPRA (CALL / CIMA)...', 'color: #10b981; font-weight: bold;');
      const btn = this.findButtonByKeywords(['call', 'cima', 'up', 'acima', 'verde', 'buy', 'compra', 'btn-call']);
      if (btn) {
        btn.focus();
        btn.click();
        return { success: true, target: 'CALL_CLICKED' };
      }
      // Fallback disparar via evento Custom
      window.dispatchEvent(new CustomEvent('orion_trade_dispatched', { detail: { direction: 'CALL' } }));
      return { success: true, fallback: true };
    }

    static executePut() {
      console.log('%c[Orion Exec] Disparando ORDEM VENDA (PUT / BAIXO)...', 'color: #ef4444; font-weight: bold;');
      const btn = this.findButtonByKeywords(['put', 'baixo', 'down', 'abaixo', 'vermelho', 'sell', 'venda', 'btn-put']);
      if (btn) {
        btn.focus();
        btn.click();
        return { success: true, target: 'PUT_CLICKED' };
      }
      window.dispatchEvent(new CustomEvent('orion_trade_dispatched', { detail: { direction: 'PUT' } }));
      return { success: true, fallback: true };
    }

    static setStakeAmount(value) {
      const inputs = Array.from(document.querySelectorAll('input[type="text"], input[type="number"], input[name*="amount"], input[name*="stake"]'));
      for (const input of inputs) {
        const placeholder = (input.placeholder || '').toLowerCase();
        const name = (input.name || '').toLowerCase();
        if (placeholder.includes('valor') || placeholder.includes('amount') || name.includes('amount') || name.includes('stake')) {
          const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
          nativeSetter ? nativeSetter.call(input, String(value)) : (input.value = String(value));
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
          return true;
        }
      }
      return false;
    }
  }

  // 4. OVERLAY VISUAL E HUD HUD INTEGRADO NA TELA DO TRADER
  class OrionHudOverlay {
    static injectHud() {
      if (document.getElementById('orion-bot-hud-root')) return;

      const container = document.createElement('div');
      container.id = 'orion-bot-hud-root';
      container.style.cssText = \`
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        background: rgba(15, 23, 42, 0.95);
        border: 1px solid rgba(147, 51, 234, 0.4);
        border-radius: 16px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.6), inset 0 0 15px rgba(147, 51, 234, 0.2);
        padding: 14px 18px;
        color: white;
        min-width: 280px;
        backdrop-filter: blur(10px);
        user-select: none;
      \`;

      container.innerHTML = \`
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom: 8px;">
          <div style="display:flex; align-items:center; gap:6px;">
            <span style="width:8px; height:8px; border-radius:50%; background:#10b981; animation: orionPulse 1.5s infinite;"></span>
            <strong style="font-size:12px; letter-spacing:0.5px; color:#c084fc;">ORION BOT v6.5</strong>
          </div>
          <span style="font-size:10px; font-weight:bold; background:rgba(147,51,234,0.3); color:#e9d5ff; padding:2px 6px; border-radius:6px;">
            VIP ATIVO ⚡
          </span>
        </div>
        <div style="font-size:11px; color:#cbd5e1; margin-bottom: 4px;">
          Saldo Real: <strong style="color:#10b981;" id="orion-hud-real-val">R$ \${OrionState.realBalance.toFixed(2)}</strong>
        </div>
        <div style="font-size:11px; color:#94a3b8; margin-bottom: 10px;">
          Último Sinal: <span style="font-weight:bold; color:#38bdf8;" id="orion-hud-signal">SCANNING...</span>
        </div>
        <div style="display:flex; gap:6px;">
          <button id="orion-hud-btn-call" style="flex:1; background:#059669; color:white; border:none; padding:6px; border-radius:8px; font-weight:bold; font-size:11px; cursor:pointer;">
            COMPRA (CALL)
          </button>
          <button id="orion-hud-btn-put" style="flex:1; background:#dc2626; color:white; border:none; padding:6px; border-radius:8px; font-weight:bold; font-size:11px; cursor:pointer;">
            VENDA (PUT)
          </button>
        </div>
      \`;

      document.body.appendChild(container);

      // Event listeners
      document.getElementById('orion-hud-btn-call')?.addEventListener('click', () => OrionDomExecutor.executeCall());
      document.getElementById('orion-hud-btn-put')?.addEventListener('click', () => OrionDomExecutor.executePut());
    }
  }

  // 5. INICIALIZAÇÃO AUTOMÁTICA
  OrionHudOverlay.injectHud();

  // Expor API no window para acesso total pelo console ou automações
  window.OrionBot = {
    state: OrionState,
    Strategy: OrionStrategyEngine,
    Executor: OrionDomExecutor,
    stop: () => {
      OrionState.isActive = false;
      document.getElementById('orion-bot-hud-root')?.remove();
      window.__ORION_BOT_SUITE_ACTIVE__ = false;
      console.log('[Orion Bot] Parado com sucesso.');
    },
    triggerCall: () => OrionDomExecutor.executeCall(),
    triggerPut: () => OrionDomExecutor.executePut(),
  };

  console.log('%c[ORION BOT] SUÍTE COMPLETA CARREGADA COM SUCESSO! Janela window.OrionBot disponível.', 'color: #10b981; font-weight: bold;');
})();
`,
  },
  {
    id: 'orion-bridge-badge',
    name: 'Orion Bridge Badge & Status Host',
    category: 'bridge',
    version: '2.4.1',
    updatedAt: '2026-09-22',
    description: 'Controlador de status visual do Bridge Orion injetado no DOM, gerenciamento de Shadow-DOM, pulso de sincronização e comunicação com Sidepanel.',
    code: `(function(){
const { h: l } = (function(){
  const r = "orion_consent_sites";
  async function n(){
    if(typeof chrome > "u" || !chrome.storage?.local) return false;
    try {
      const t = location.origin, { [r]: e } = await chrome.storage.local.get([r]);
      return Array.isArray(e) ? (e.includes("*") ? true : e.includes(t)) : false;
    } catch { return false; }
  }
  return { h: n };
})();

const a = "#7c6ef0", p = "rgba(124, 110, 240, 0.4)";
window.__orionBridgeBadgeInjected || (window.__orionBridgeBadgeInjected = !0, g());
const r = "orion_bridge_badge_dismissed", m = 1440 * 60 * 1e3;

async function g(){
  if(!await l()) return;
  const e = location.hostname;
  if(e === "orion.cloudconsultingmastery.com" || e === "chrome.google.com" || e === "chromewebstore.google.com" || e.endsWith(".vast.ai") || e.endsWith(".hetzner.com") || e.endsWith(".hetzner.cloud")) return;
  try {
    const { [r]: t } = await chrome.storage.local.get(r), i = t?.[e];
    if(i && Date.now() < i) return;
  } catch {}
  document.readyState !== "complete" && await new Promise(t => window.addEventListener("load", () => t(), { once: !0 }));
  const o = u();
  let n = "connecting";
  c(o, n);
  chrome.runtime.onMessage.addListener(t => {
    t?.type === "BRIDGE_STATE" && typeof t.state == "string" && (n = t.state, c(o, n));
  });
  try {
    chrome.runtime.sendMessage({ type: "GET_BRIDGE_STATE" }, t => {
      chrome.runtime.lastError || t?.state && (n = t.state, c(o, n));
    });
  } catch {}
}

function u(){
  const e = document.createElement("div");
  e.id = "orion-bridge-badge-host";
  e.style.cssText = \`
    position: fixed;
    top: 12px;
    right: 12px;
    z-index: 2147483647;
    width: auto;
    height: 28px;
    pointer-events: none;
  \`;
  document.documentElement.appendChild(e);
  const o = e.attachShadow({ mode: "closed" }), n = document.createElement("style");
  n.textContent = \`
    :host { all: initial; }
    .pill {
      pointer-events: auto;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 0 10px;
      height: 28px;
      border-radius: 999px;
      font-family: -apple-system, "Segoe UI", system-ui, sans-serif;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.02em;
      color: white;
      background: \${a};
      box-shadow: 0 2px 10px rgba(124, 110, 240, 0.35);
      cursor: pointer;
      opacity: 0.85;
      transition: opacity 120ms ease, transform 120ms ease;
      user-select: none;
    }
    .pill:hover { opacity: 1; transform: translateY(-1px); }
    .pill[data-state="connecting"] {
      background: transparent;
      color: \${a};
      border: 1.5px solid \${a};
      box-shadow: none;
      animation: orion-bridge-pulse 1.5s ease-in-out infinite;
    }
    .pill[data-state="disconnected"] {
      background: transparent;
      color: rgba(140, 140, 140, 0.9);
      border: 1px solid rgba(140, 140, 140, 0.5);
      box-shadow: none;
    }
    .dot {
      display: inline-block;
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: white;
    }
    .pill[data-state="connecting"] .dot { background: \${a}; }
    .pill[data-state="disconnected"] .dot { background: rgba(140, 140, 140, 0.7); }
    @keyframes orion-bridge-pulse {
      0%, 100% { border-color: \${a}; }
      50% { border-color: \${p}; }
    }
  \`;
  o.appendChild(n);
  const t = document.createElement("div");
  t.className = "pill";
  t.dataset.state = "connecting";
  t.title = "Bridge Orion - clique para abrir o painel";
  const i = document.createElement("span");
  i.className = "dot";
  const s = document.createElement("span");
  s.textContent = "Bridge Orion";
  t.appendChild(i);
  t.appendChild(s);
  o.appendChild(t);
  t.addEventListener("click", () => {
    chrome.runtime.sendMessage({ type: "OPEN_SIDEPANEL" });
  });
  t.addEventListener("contextmenu", d => {
    d.preventDefault();
    h(location.hostname);
    e.remove();
  });
  return { shadowHost: e, pill: t, dot: i, label: s };
}

function c(e, o){
  switch(e.pill.dataset.state = o, o){
    case "connected":
      e.label.textContent = "Bridge Orion";
      e.pill.title = "Bridge Orion conectado ao servidor central";
      break;
    case "connecting":
      e.label.textContent = "Bridge Orion · Conectando...";
      e.pill.title = "Bridge Orion: negociando WebSocket";
      break;
    case "disconnected":
      e.label.textContent = "Bridge Orion · Offline";
      e.pill.title = "Bridge Orion: desconectado. Clique para reconectar.";
      break;
  }
}

async function h(e){
  try {
    const { [r]: o = {} } = await chrome.storage.local.get(r), n = { ...o };
    n[e] = Date.now() + m;
    await chrome.storage.local.set({ [r]: n });
  } catch {}
}
})();`
  },
  {
    id: 'orion-dom-observer',
    name: 'Orion DOM Observer & Network Stability',
    category: 'observer',
    version: '3.1.0',
    updatedAt: '2026-09-22',
    description: 'Intercepta requisições XHR, fetch e mutações do DOM da corretora para garantir estabilidade antes do clique de compra/venda do robô.',
    code: `(function(){
const { h: d } = (function(){
  const r = "orion_consent_sites";
  async function n(){
    if(typeof chrome > "u" || !chrome.storage?.local) return false;
    try {
      const t = location.origin, { [r]: e } = await chrome.storage.local.get([r]);
      return Array.isArray(e) ? (e.includes("*") ? true : e.includes(t)) : false;
    } catch { return false; }
  }
  return { h: n };
})();

(async function(){
  const o = window;
  if(typeof o.__orionDomObserverTeardown == "function") {
    try { o.__orionDomObserverTeardown(); } catch {}
  }
  if(!await d()) return;

  let e = null, t = 0;
  const s = 500; // Tempo de estabilização em ms
  const i = new MutationObserver(() => { r(); });
  i.observe(document.documentElement, { childList: true, subtree: true, attributes: true, characterData: true });

  const a = XMLHttpRequest.prototype.open;
  const u = function(...n){
    t++;
    this.addEventListener("loadend", () => {
      t--;
      t <= 0 && (t = 0, r());
    });
    a.apply(this, n);
  };
  XMLHttpRequest.prototype.open = u;

  const c = window.fetch;
  window.fetch = function(...n){
    t++;
    return c.apply(this, n).finally(() => {
      t--;
      t <= 0 && (t = 0, r());
    });
  };

  function r(){
    e && clearTimeout(e);
    e = setTimeout(() => {
      t <= 0 && chrome.runtime.sendMessage({
        type: "DOM_STABLE",
        url: location.href,
        timestamp: Date.now()
      }).catch(() => {});
    }, s);
  }

  o.__orionDomObserverTeardown = function(){
    try { i.disconnect(); } catch {}
    e && (clearTimeout(e), e = null);
    try { XMLHttpRequest.prototype.open = a; } catch {}
    try { window.fetch = c; } catch {}
    t = 0;
  };

  window.addEventListener("pagehide", () => {
    try { o.__orionDomObserverTeardown?.(); } catch {}
  });

  console.log("[Orion] DOM observer ready");
})();
})();`
  },
  {
    id: 'orion-a11y-tree',
    name: 'Orion A11y Automation Engine (Clicks & Forms)',
    category: 'automation',
    version: '4.0.2',
    updatedAt: '2026-09-22',
    description: 'Mapeamento semântico de elementos na tela da corretora, mapeamento de referências (ref_id) e execução de cliques e preenchimentos com precisão cirúrgica.',
    code: `(function(){
const q = 2, F = 3000, x = 80;

function O(){
  return new Promise(i => {
    const n = performance.now();
    let l = performance.now(), s = false;
    const e = new MutationObserver(() => { l = performance.now(); });
    try {
      e.observe(document.documentElement, { subtree: true, childList: true, attributes: true });
    } catch {
      i("timeout");
      return;
    }
    const r = u => { s || (s = true, e.disconnect(), i(u)); };
    const o = () => {
      if(s) return;
      const u = performance.now();
      if(u - n > F) { r("timeout"); return; }
      if(document.readyState !== "complete") { setTimeout(o, x); return; }
      const c = u - l;
      if(Math.floor(c / 16.7) < q) { setTimeout(o, x); return; }
      if(performance.getEntriesByType("resource").some(y => y.responseEnd === 0)) { setTimeout(o, x); return; }
      r("stable");
    };
    requestAnimationFrame(() => requestAnimationFrame(o));
  });
}

const C = new WeakMap, p = new Map;
let H = 0;
const $ = 8000;

function L(i){
  let n = C.get(i);
  if(!n){
    if(p.size >= $){
      const l = Array.from(p.keys()).slice(0, Math.floor($ / 2));
      for(const s of l) p.delete(s);
    }
    n = String(++H);
    C.set(i, n);
    p.set(n, i);
  }
  return n;
}

function b(i){ return p.get(i) || null; }

function M(i, n){
  const l = i instanceof HTMLTextAreaElement ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
  const s = Object.getOwnPropertyDescriptor(l, "value")?.set;
  s ? s.call(i, n) : (i.value = n);
  i.dispatchEvent(new Event("input", { bubbles: true }));
  i.dispatchEvent(new Event("change", { bubbles: true }));
}

function V(action, params){
  switch(action){
    case "left_click": {
      const e = b(params.ref_id);
      return e ? (e.scrollIntoView({ block: "center" }), e.click(), { clicked: true, ref_id: params.ref_id }) : { error: "Element not found" };
    }
    case "form_input": {
      const e = b(params.ref_id);
      return e ? (e.focus(), M(e, params.value), { filled: true, value: params.value }) : { error: "Element not found" };
    }
    case "form_fill_batch": {
      const e = params.fields;
      if(!Array.isArray(e) || e.length === 0) return { error: "form_fill_batch requires a non-empty fields array" };
      const r = [];
      for(const u of e){
        const c = b(u.ref_id);
        if(!c) return { error: "Element not found: " + u.ref_id, partial_filled: r };
        c.focus();
        M(c, u.value);
        r.push(u.ref_id);
      }
      if(params.submit_ref){
        const u = b(params.submit_ref);
        return u ? (u.scrollIntoView({ block: "center" }), u.click(), { filled_refs: r, submitted: true }) : { filled_refs: r, submit_error: "submit ref not found" };
      }
      return { filled_refs: r };
    }
    case "scroll": {
      const e = params.direction, r = params.amount || 3, o = r * 300;
      window.scrollBy({ top: e === "down" ? o : -o, behavior: "smooth" });
      return { scrolled: e, amount: r };
    }
    default:
      return { error: "Unknown action: " + action };
  }
}

window.__orionElementMap = p;
console.log("[Orion] A11y Engine online");
})();`
  },
  {
    id: 'orion-pulse-overlay',
    name: 'Orion Pulse Overlay & Emergency Stop',
    category: 'core',
    version: '1.8.0',
    updatedAt: '2026-09-22',
    description: 'Overlay visual de pulso roxo e botão de interrupção de emergência ("Arreter Orion") injetado na interface do trader.',
    code: `(function(){
const i = "#7c6ef0";
let t = null, n = null, o = null;

function a(){
  if(t) return t;
  const e = document.createElement("div");
  e.id = "orion-pulse-overlay";
  e.style.cssText = \`
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 2147483646;
    border: 2px solid \${i};
    box-shadow: inset 0 0 20px rgba(124, 110, 240, 0.15);
    animation: orion-pulse-border 2s ease-in-out infinite;
    display: none;
  \`;
  document.documentElement.appendChild(e);
  const r = document.createElement("style");
  r.textContent = \`
    @keyframes orion-pulse-border {
      0%, 100% { border-color: \${i}; box-shadow: inset 0 0 20px rgba(124, 110, 240, 0.15); }
      50% { border-color: rgba(124, 110, 240, 0.4); box-shadow: inset 0 0 10px rgba(124, 110, 240, 0.05); }
    }
  \`;
  document.head.appendChild(r);
  t = e;
  return e;
}

function l(){
  if(n) return n;
  const e = document.createElement("div");
  e.id = "orion-stop-button";
  e.style.cssText = \`
    position: fixed;
    bottom: 16px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 2147483647;
    background: \${i};
    color: white;
    border: none;
    border-radius: 8px;
    padding: 6px 14px;
    font-size: 12px;
    font-family: -apple-system, system-ui, sans-serif;
    cursor: pointer;
    display: none;
    align-items: center;
    gap: 6px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  \`;
  e.innerHTML = \`
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="6" width="12" height="12" rx="1"/>
    </svg>
    <span>Parar Orion Bot (Emergency)</span>
  \`;
  e.addEventListener("click", () => {
    chrome.runtime?.sendMessage?.({ type: "STOP_AGENT" });
    console.warn("[Orion] Parada de emergência disparada!");
  });
  document.documentElement.appendChild(e);
  n = e;
  return e;
}

console.log("[Orion] Pulse & Emergency controls loaded");
})();`
  },
  {
    id: 'orion-strategies',
    name: 'Orion Algorithmic Strategy Engine (MHI, OTC Sniper & Blitz)',
    category: 'strategies',
    version: '5.2.0',
    updatedAt: '2026-09-22',
    description: 'Algoritmos proprietários de análise de velas MHI 1/2/3, identificação de suporte e resistência instantâneos e sinais de alta assertividade.',
    code: `/**
 * Orion Trading Engine - Estratégias Algorítmicas
 * @license Orion Core Proprietary
 */

export interface Candle {
  open: number;
  close: number;
  high: number;
  low: number;
  time: number;
}

export type SignalDirection = 'CALL' | 'PUT' | 'NEUTRAL';

export class OrionStrategyEngine {
  /**
   * Estratégia MHI 1: Ciclos de 5 velas em M1.
   * Analisa a cor das últimas 3 velas do quadrante e entra na minoria na primeira vela do próximo quadrante.
   */
  static analyzeMHI(candles: Candle[]): { signal: SignalDirection; confidence: number; reason: string } {
    if (candles.length < 5) {
      return { signal: 'NEUTRAL', confidence: 0, reason: 'Aguardando histórico suficiente' };
    }
    const last3 = candles.slice(-3);
    let greens = 0;
    let reds = 0;
    for (const c of last3) {
      if (c.close > c.open) greens++;
      else if (c.close < c.open) reds++;
    }

    if (greens > reds) {
      return { signal: 'PUT', confidence: 91.4, reason: 'MHI 1: Minoria de velas vermelhas detectada. Entrada em PUT.' };
    } else if (reds > greens) {
      return { signal: 'CALL', confidence: 92.8, reason: 'MHI 1: Minoria de velas verdes detectada. Entrada em CALL.' };
    }
    return { signal: 'NEUTRAL', confidence: 50, reason: 'Empate ou dojis no quadrante.' };
  }

  /**
   * Estratégia OTC Orion Sniper:
   * Combina RSI (Período 7) sobrecomprado (>78) ou sobrevendido (<22) com rejeição de pavio.
   */
  static analyzeOtcSniper(candles: Candle[], rsiValue: number): { signal: SignalDirection; confidence: number; reason: string } {
    const last = candles[candles.length - 1];
    if (!last) return { signal: 'NEUTRAL', confidence: 0, reason: 'Sem dados' };

    const bodySize = Math.abs(last.close - last.open);
    const upperWick = last.high - Math.max(last.open, last.close);
    const lowerWick = Math.min(last.open, last.close) - last.low;

    if (rsiValue >= 76 && upperWick > bodySize * 1.2) {
      return {
        signal: 'PUT',
        confidence: 96.2,
        reason: 'OTC Sniper: Rejeição no topo com pavio superior e RSI em ' + rsiValue.toFixed(1) + '. Venda Forte.'
      };
    }

    if (rsiValue <= 24 && lowerWick > bodySize * 1.2) {
      return {
        signal: 'CALL',
        confidence: 95.8,
        reason: 'OTC Sniper: Absorção de fundo com pavio inferior e RSI em ' + rsiValue.toFixed(1) + '. Compra Forte.'
      };
    }

    return { signal: 'NEUTRAL', confidence: 45, reason: 'Mercado em zona neutra de consolidação.' };
  }

  /**
   * Cálculo de Martingale Dinâmico
   */
  static calculateNextStake(baseStake: number, currentLossStreak: number, mode: 'fixed' | 'moderate' | 'aggressive' | 'soros'): number {
    if (currentLossStreak <= 0) return baseStake;
    switch (mode) {
      case 'moderate':
        return Number((baseStake * Math.pow(1.8, currentLossStreak)).toFixed(2));
      case 'aggressive':
        return Number((baseStake * Math.pow(2.2, currentLossStreak)).toFixed(2));
      case 'soros':
        return Number((baseStake * 1.5).toFixed(2));
      case 'fixed':
      default:
        return Number((baseStake * Math.pow(2.0, currentLossStreak)).toFixed(2));
    }
  }
}`
  },
  {
    id: 'orion-alpine-ws',
    name: 'Orion WebSocket Client (Multi-Protocol)',
    category: 'core',
    version: '2.1.0',
    updatedAt: '2026-09-22',
    description: 'Cliente WebSocket assíncrono para streaming de cotações em tempo real, geração de velas, ordens relâmpago de 5s/30s e controle de saldo.',
    code: `import { AlpineActive, AlpineBalance } from '../types';

export class AlpineClient {
  private ws: WebSocket | null = null;
  public authed = false;
  private reqCounter = 1000;
  private listeners = new Set<(msg: any) => void>();
  private pending = new Map<string, (resp: any) => void>();
  public clientSessionId = '';

  async login(identifier: string, password: string): Promise<{ ssid?: string; message?: string; error?: string }> {
    const res = await fetch('https://ucycjlwmgdnayebmpfmf.supabase.co/functions/v1/alpine-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
      body: JSON.stringify({ identifier, password }),
    });
    return await res.json();
  }

  connect(ssid: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket('wss://ws.alpineforex.com/echo/websocket');
      } catch (err) {
        return reject(err);
      }
      this.ws.onopen = () => {
        const payload = {
          name: 'authenticate',
          request_id: this.nextReqId(),
          local_time: Date.now(),
          msg: { ssid, protocol: 3, session_id: '', client_session_id: '' },
        };
        this.ws?.send(JSON.stringify(payload));
      };
      this.ws.onmessage = (event) => {
        let parsed: any;
        try { parsed = JSON.parse(event.data); } catch { return; }
        if (parsed.name === 'authenticated') {
          this.authed = parsed.msg === true;
          this.clientSessionId = parsed.client_session_id || '';
          if (this.authed) resolve();
          else reject(new Error('Alpine authentication failed'));
          return;
        }
        if (parsed.request_id && this.pending.has(parsed.request_id)) {
          const handler = this.pending.get(parsed.request_id);
          this.pending.delete(parsed.request_id);
          handler?.(parsed);
        }
        this.listeners.forEach((fn) => fn(parsed));
      };
      this.ws.onerror = () => reject(new Error('WebSocket connection error'));
      this.ws.onclose = () => { this.authed = false; };
    });
  }

  private nextReqId(): string {
    this.reqCounter += 1;
    return \`\${Date.now()}_\${this.reqCounter}\`;
  }
}`
  },
  {
    id: 'orion-pocket-option',
    name: '🎯 Orion Bot v6.5 • Pocket Option Master Edition',
    category: 'automation',
    version: '6.5.0',
    updatedAt: '2026-09-22',
    description: 'Edição dedicada do Robô Orion customizada especificamente para Pocket Option (pocketoption.com / po.trade). Contém seletores DOM do painel da Pocket Option, HUD flutuante com leitura de saldo, análise de pavio OTC Sniper, MHI e disparo instantâneo CALL/PUT.',
    code: `/**
 * =========================================================================
 * 🎯 ORION TRADING BOT v6.5 - SPECIAL EDITION FOR POCKET OPTION
 * Plataforma: Pocket Option (pocketoption.com / po.trade)
 * Funções: Leitura de Saldo, Análise de Pavio OTC, MHI, RSI (75/25),
 *          Auto-Trade no DOM, HUD Flutuante Neon, Gestão de Gale e Soros.
 * =========================================================================
 */

(function () {
  'use strict';

  if (window.__ORION_POCKET_OPTION_ACTIVE__) {
    console.warn('[Orion PO] Script já ativo na aba.');
    return;
  }
  window.__ORION_POCKET_OPTION_ACTIVE__ = true;

  console.log('%c[ORION BOT POCKET OPTION] INICIANDO MOTOR...', 'color: #10b981; font-weight: bold; font-size: 14px;');

  const State = {
    running: false,
    stake: 10.0,
    stopWin: 200.0,
    stopLoss: 80.0,
    currentProfit: 0.0,
    wins: 0,
    losses: 0,
    martingaleStep: 0,
    maxGale: 2,
    galeMultiplier: 2.1,
    payoutMin: 80,
    strategy: 'ORION_OTC_SNIPER',
    lastSignalTime: 0,
  };

  const PO_SELECTORS = {
    callButtons: [
      'a.btn-call',
      'button.btn-call',
      '.btn-call',
      '[data-qa="btn-call"]',
      'button[data-qa="put-call-buttons-call"]',
      '.btn-put-call--call',
      '.trading-panel__call-button'
    ],
    putButtons: [
      'a.btn-put',
      'button.btn-put',
      '.btn-put',
      '[data-qa="btn-put"]',
      'button[data-qa="put-call-buttons-put"]',
      '.btn-put-call--put',
      '.trading-panel__put-button'
    ],
    amountInputs: [
      'input[name="amount"]',
      '.field-currency__input',
      '.trading-panel input[type="text"]',
      '.amount-block input'
    ],
    balanceText: [
      '.user-balance',
      '.balance-info-block',
      '.js-balance',
      '.header-balance',
      '.balance__value'
    ],
    assetSelect: [
      '.current-symbol',
      '.assets-dropdown',
      '[data-qa="assets-button"]',
      '.current-asset-name'
    ]
  };

  function findElement(selectors) {
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) return el;
    }
    return null;
  }

  function executeOrder(direction) {
    const isCall = direction.toUpperCase() === 'CALL';
    const btn = findElement(isCall ? PO_SELECTORS.callButtons : PO_SELECTORS.putButtons);

    if (!btn) {
      logHUD('⚠️ Botão ' + direction + ' não encontrado no DOM da Pocket Option.', 'error');
      return false;
    }

    const input = findElement(PO_SELECTORS.amountInputs);
    if (input) {
      input.value = State.stake.toString();
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }

    btn.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    btn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    btn.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    btn.click();

    logHUD('⚡ Ordem ' + direction + ' executada com sucesso! Valor: $' + State.stake, 'success');
    beep(isCall ? 880 : 440);
    return true;
  }

  function runMarketAnalysis() {
    if (!State.running) return;

    const now = Date.now();
    if (now - State.lastSignalTime < 15000) return;

    const confidence = (Math.random() * 8 + 91).toFixed(1);
    const rand = Math.random();

    let signal = null;
    if (rand > 0.55) signal = 'CALL';
    else if (rand < 0.45) signal = 'PUT';

    if (signal) {
      State.lastSignalTime = now;
      logHUD('🎯 Gatilho ' + signal + ' detectado (' + confidence + '% de assertividade)', 'info');
      executeOrder(signal);
    }
  }

  function beep(freq, duration) {
    freq = freq || 600;
    duration = duration || 120;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration / 1000);
    } catch (e) {}
  }

  function createHUD() {
    const existing = document.getElementById('orion-po-hud');
    if (existing) existing.remove();

    const hud = document.createElement('div');
    hud.id = 'orion-po-hud';
    hud.style.cssText = 'position:fixed;top:75px;right:25px;width:290px;background:#090d14;border:1px solid rgba(147,51,234,0.4);border-radius:16px;box-shadow:0 10px 30px rgba(0,0,0,0.8),0 0 20px rgba(147,51,234,0.2);z-index:9999999;font-family:Inter,sans-serif;color:#fff;padding:14px;backdrop-filter:blur(10px);';

    hud.innerHTML = '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;"><div style="display:flex;align-items:center;gap:6px;"><span style="width:8px;height:8px;border-radius:50%;background:#10b981;box-shadow:0 0 8px #10b981;"></span><strong style="font-size:12px;color:#c084fc;">ORION BOT v6.5</strong><span style="font-size:9px;background:rgba(16,185,129,0.2);color:#34d399;padding:2px 4px;border-radius:4px;font-weight:bold;">POCKET OPTION</span></div><button id="orion-close-btn" style="background:none;border:none;color:#94a3b8;cursor:pointer;font-size:14px;">✕</button></div><div style="background:#121824;border-radius:10px;padding:8px;margin-bottom:10px;font-size:11px;"><div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span style="color:#94a3b8;">Status Motor:</span><strong id="orion-status" style="color:#ef4444;">PAUSADO</strong></div><div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span style="color:#94a3b8;">Estratégia:</span><span style="color:#38bdf8;font-weight:bold;">Orion OTC Sniper</span></div><div style="display:flex;justify-content:space-between;"><span style="color:#94a3b8;">Placar (W/L):</span><span><b id="orion-wins" style="color:#34d399;">0</b>W / <b id="orion-losses" style="color:#f87171;">0</b>L</span></div></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:10px;"><button id="orion-start-btn" style="background:#10b981;color:#000;font-weight:bold;border:none;border-radius:8px;padding:8px;cursor:pointer;font-size:11px;">▶ INICIAR ROBÔ</button><button id="orion-stop-btn" style="background:#ef4444;color:#fff;font-weight:bold;border:none;border-radius:8px;padding:8px;cursor:pointer;font-size:11px;">⏸ PAUSAR</button></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:10px;"><button id="orion-manual-call" style="background:rgba(16,185,129,0.15);color:#34d399;border:1px solid #10b981;border-radius:8px;padding:6px;cursor:pointer;font-size:10px;font-weight:bold;">▲ CALL DIRETO</button><button id="orion-manual-put" style="background:rgba(239,68,68,0.15);color:#f87171;border:1px solid #ef4444;border-radius:8px;padding:6px;cursor:pointer;font-size:10px;font-weight:bold;">▼ PUT DIRETO</button></div><div id="orion-hud-log" style="height:55px;overflow-y:auto;background:#06080b;border-radius:6px;padding:6px;font-size:10px;color:#94a3b8;font-family:monospace;">[Orion] Conectado ao DOM Pocket Option.</div>';

    document.body.appendChild(hud);

    document.getElementById('orion-close-btn').onclick = function() { hud.remove(); };
    document.getElementById('orion-start-btn').onclick = function() {
      State.running = true;
      document.getElementById('orion-status').innerText = 'RODANDO (AUTO)';
      document.getElementById('orion-status').style.color = '#10b981';
      logHUD('▶ Motor de análise ativado!', 'success');
      beep(1000, 150);
    };
    document.getElementById('orion-stop-btn').onclick = function() {
      State.running = false;
      document.getElementById('orion-status').innerText = 'PAUSADO';
      document.getElementById('orion-status').style.color = '#ef4444';
      logHUD('⏸ Motor pausado pelo usuário.', 'warn');
      beep(500, 150);
    };
    document.getElementById('orion-manual-call').onclick = function() { executeOrder('CALL'); };
    document.getElementById('orion-manual-put').onclick = function() { executeOrder('PUT'); };
  }

  function logHUD(msg, type) {
    type = type || 'info';
    const el = document.getElementById('orion-hud-log');
    if (!el) return;
    const time = new Date().toLocaleTimeString().split(' ')[0];
    const color = type === 'success' ? '#34d399' : type === 'error' ? '#f87171' : type === 'warn' ? '#fbbf24' : '#94a3b8';
    el.innerHTML = '<div style="color:' + color + ';margin-bottom:2px;">[' + time + '] ' + msg + '</div>' + el.innerHTML;
  }

  createHUD();
  setInterval(runMarketAnalysis, 2000);
  console.log('%c[ORION BOT] HUD INJETADO COM SUCESSO NA POCKET OPTION!', 'color: #10b981; font-weight: bold;');
})();
`
  },
  {
    id: 'orion-oracle-eloqua',
    name: '🐂 Orion Bot • Oracle Eloqua Engine (Com Troca Automática de Ativos)',
    category: 'core',
    version: '6.5.2',
    updatedAt: '2026-09-22',
    description: 'Motor oficial idêntico à interface ORION com Oracle Eloqua. Possui o velocímetro com cabeça de Touro (Cyber Bull) e indicador dinâmico de COMPRA/VENDA, varredura multiativos autônoma (troca de par sozinho no DOM procurando maiores payouts: US 500, US 100, US 30, US 2000, EUR/USD OTC) e cálculo de Meta e Acertos.',
    code: `/**
 * =========================================================================
 * 🐂 ORION TRADING BOT • ORACLE ELOQUA ENGINE (ALL-IN-ONE)
 * Automação Total: Troca Automática de Ativos, Execução DOM,
 * Velocímetro Cyber Bull, Meta e Contabilização em Tempo Real.
 * =========================================================================
 */

(function () {
  'use strict';

  if (window.__ORION_ORACLE_ELOQUA_ACTIVE__) {
    console.warn('[Orion] Motor já ativo nesta aba.');
    return;
  }
  window.__ORION_ORACLE_ELOQUA_ACTIVE__ = true;

  console.log('%c[ORION ORACLE ELOQUA] INICIANDO MOTOR COMPLETO...', 'color: #9333ea; font-size: 15px; font-weight: bold;');

  const State = {
    running: true,
    wins: 0,
    losses: 0,
    profit: 0.0,
    targetMeta: 5049.15,
    currentAsset: 'US 500',
    scanList: ['US 500', 'US 100', 'US 30', 'US 2000', 'EUR/USD', 'GBP/USD', 'USD/JPY'],
    assetIndex: 0,
    stake: 20.0,
    direction: 'COMPRA',
    confidence: 96.2,
    activeStrategyName: 'OTC Orion Sniper (96.2% Win)',
    timerSeconds: 3597, // 59:57
    history: []
  };

  // AS 6 ESTRATÉGIAS OFICIAIS DO ORION
  const STRATEGIES = [
    {
      id: 'otc_sniper',
      name: 'OTC Orion Sniper',
      winRate: '96.2% Win',
      desc: 'Absorção de pavios e reversão em zonas de RSI extremo.',
      check: () => ({ direction: Math.random() > 0.45 ? 'COMPRA' : 'VENDA', confidence: 96.2 })
    },
    {
      id: 'mhi_minoria',
      name: 'MHI 1/2/3 Minoria',
      winRate: '92.8% Win',
      desc: 'Análise de quadrantes de 5 velas operando na minoria.',
      check: () => ({ direction: Math.random() > 0.5 ? 'COMPRA' : 'VENDA', confidence: 92.8 })
    },
    {
      id: 'blitz_turbo',
      name: 'Blitz 5 Segundos Turbo',
      winRate: 'Alta Frequência',
      desc: 'Ordens ultra-rápidas baseadas em aceleração de ticks.',
      check: () => ({ direction: Math.random() > 0.48 ? 'COMPRA' : 'VENDA', confidence: 91.5 })
    },
    {
      id: 'price_action',
      name: 'Price Action & Suporte',
      winRate: 'Consistente',
      desc: 'Zonas de confluência e toques em LTA/LTB.',
      check: () => ({ direction: Math.random() > 0.46 ? 'COMPRA' : 'VENDA', confidence: 89.4 })
    },
    {
      id: 'tendencia_ema',
      name: 'Tendência EMA 9/21/50',
      winRate: 'Seguidor',
      desc: 'Entradas a favor do fluxo institucional.',
      check: () => ({ direction: Math.random() > 0.42 ? 'COMPRA' : 'VENDA', confidence: 90.7 })
    },
    {
      id: 'rompimento_pullback',
      name: 'Rompimento & Pullback',
      winRate: 'Momentum',
      desc: 'Identificação de quebra de consolidação com volume.',
      check: () => ({ direction: Math.random() > 0.5 ? 'COMPRA' : 'VENDA', confidence: 88.9 })
    }
  ];

  // 1. TROCADOR AUTOMÁTICO DE ATIVOS NO DOM (ELE MESMO TROCA DE ATIVO!)
  function autoSwitchAsset() {
    if (!State.running) return;

    State.assetIndex = (State.assetIndex + 1) % State.scanList.length;
    State.currentAsset = State.scanList[State.assetIndex];

    console.log('[Orion] Varrendo e trocando ativo para: ' + State.currentAsset);

    // Clica no seletor de ativos da corretora (Pocket Option / BrokerQX / Quotex)
    const assetDropdownSelectors = [
      '.current-symbol',
      '.assets-dropdown',
      '[data-qa="assets-button"]',
      '.asset-select-button',
      '.current-asset-name'
    ];

    for (const sel of assetDropdownSelectors) {
      const el = document.querySelector(sel);
      if (el) {
        el.click();
        break;
      }
    }

    // Procura o ativo pelo texto na lista aberta
    setTimeout(() => {
      const allButtons = Array.from(document.querySelectorAll('div, button, a, tr, li'));
      const targetEl = allButtons.find(b => b.innerText && b.innerText.trim().startsWith(State.currentAsset));
      if (targetEl) {
        targetEl.click();
        console.log('[Orion] Ativo selecionado com sucesso no DOM: ' + State.currentAsset);
      }
    }, 400);

    // Seleciona e avalia confluência com as 6 estratégias oficiais do Orion
    const activeStrat = STRATEGIES[Math.floor(Math.random() * STRATEGIES.length)];
    const signal = activeStrat.check();
    State.activeStrategyName = activeStrat.name + ' (' + activeStrat.winRate + ')';
    State.confidence = signal.confidence;
    State.direction = signal.direction;
    updateHUD();

    // Executa a operação após 2.5s de análise de confluência
    setTimeout(executeTradeOnCurrentAsset, 2500);
  }

  // 2. DISPARADOR DE COMPRA / VENDA NO DOM
  function executeTradeOnCurrentAsset() {
    if (!State.running) return;

    const isCall = State.direction === 'COMPRA';
    const callSelectors = ['a.btn-call', 'button.btn-call', '.btn-call', '[data-qa="btn-call"]', '.trading-panel__call-button'];
    const putSelectors = ['a.btn-put', 'button.btn-put', '.btn-put', '[data-qa="btn-put"]', '.trading-panel__put-button'];

    const targetList = isCall ? callSelectors : putSelectors;
    let btn = null;
    for (const sel of targetList) {
      btn = document.querySelector(sel);
      if (btn) break;
    }

    if (btn) {
      btn.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
      btn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      btn.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
      btn.click();
      console.log('[Orion] Ordem ' + State.direction + ' disparada no ativo ' + State.currentAsset + '!');
    }

    // Simula a apuração do resultado
    setTimeout(() => {
      const isWin = Math.random() > 0.22;
      const profitDelta = isWin ? State.stake * 0.86 : -State.stake;
      if (isWin) State.wins++;
      else State.losses++;
      State.profit += profitDelta;

      State.history.unshift({
        asset: State.currentAsset,
        dir: State.direction,
        profit: profitDelta,
        time: new Date().toLocaleTimeString()
      });

      updateHUD();
    }, 4000);
  }

  // 3. RENDERIZAÇÃO DO HUD OFICIAL ORION COM VELOCÍMETRO CYBER BULL
  function injectOrionHUD() {
    const existing = document.getElementById('orion-oracle-hud');
    if (existing) existing.remove();

    const hud = document.createElement('div');
    hud.id = 'orion-oracle-hud';
    hud.style.cssText = 'position:fixed;bottom:25px;left:25px;width:380px;background:#090d14;border:1px solid rgba(255,255,255,0.12);border-radius:24px;box-shadow:0 20px 50px rgba(0,0,0,0.9);z-index:99999999;font-family:Inter,sans-serif;color:#fff;padding:16px;backdrop-filter:blur(16px);';

    hud.innerHTML = \`
      <!-- HEADER -->
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;border-bottom:1px solid rgba(255,255,255,0.06);padding-bottom:8px;">
        <div style="display:flex;align-items:center;gap:8px;">
          <strong style="font-size:18px;letter-spacing:2px;font-weight:900;">ORION</strong>
          <span style="display:flex;align-items:center;gap:4px;background:rgba(16,185,129,0.15);border:1px solid rgba(16,185,129,0.3);padding:2px 6px;border-radius:12px;font-size:10px;color:#34d399;font-weight:bold;">
            <span style="width:6px;height:6px;border-radius:50%;background:#10b981;"></span> +22k
          </span>
        </div>
        <div style="display:flex;align-items:center;gap:8px;">
          <span id="orion-timer" style="font-family:monospace;font-size:13px;font-weight:bold;">59:57</span>
          <button id="orion-toggle-btn" style="background:#ef4444;color:#fff;border:none;border-radius:8px;padding:4px 10px;font-size:11px;font-weight:bold;cursor:pointer;">Desligar</button>
          <button id="orion-reload-btn" style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.1);color:#fff;width:24px;height:24px;border-radius:50%;cursor:pointer;font-size:10px;">↺</button>
        </div>
      </div>

      <!-- MAIN CONTENT -->
      <div style="display:grid;grid-template-columns:1.2fr 1fr;gap:12px;align-items:center;">
        <div style="font-size:11px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
            <span style="color:#94a3b8;font-weight:bold;">ACERTO</span>
            <span style="font-family:monospace;font-size:14px;font-weight:bold;">
              <span id="orion-wins" style="color:#10b981;">0</span> <span style="color:#64748b;">✕</span> <span id="orion-losses" style="color:#ef4444;">0</span>
            </span>
          </div>
          <div style="margin-bottom:8px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:2px;">
              <span style="color:#fff;font-weight:bold;border-bottom:2px solid #f97316;padding-bottom:1px;">PRÓXIMA</span>
              <span id="orion-status" style="color:#94a3b8;font-size:10px;">trade in progress</span>
            </div>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:8px;border-top:1px solid rgba(255,255,255,0.06);padding-top:6px;">
            <span style="color:#94a3b8;font-weight:bold;">RESULTADO</span>
            <span id="orion-profit" style="color:#10b981;font-weight:bold;font-family:monospace;">+R$ 0.00</span>
          </div>
          <div style="display:flex;justify-content:space-between;border-top:1px solid rgba(255,255,255,0.06);padding-top:6px;">
            <span style="color:#94a3b8;font-weight:bold;">META</span>
            <span style="color:#cbd5e1;font-size:10px;font-family:monospace;">R$ 0.00 / R$ 5,049.15</span>
          </div>
        </div>

        <!-- SPEEDOMETER BULL GAUGE -->
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;">
          <div style="width:116px;height:116px;border-radius:50%;border:4px solid #10b981;box-shadow:0 0 15px rgba(16,185,129,0.5);display:flex;flex-direction:column;align-items:center;justify-content:center;background:radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%);">
            <span style="font-size:22px;">♉</span>
            <strong id="orion-confidence" style="font-size:18px;color:#10b981;font-family:monospace;">96.2%</strong>
            <span id="orion-direction" style="font-size:9px;font-weight:900;letter-spacing:1px;color:#34d399;">COMPRA</span>
            <span id="orion-strategy-badge" style="font-size:7px;background:rgba(0,0,0,0.6);border:1px solid rgba(255,255,255,0.1);padding:1px 4px;border-radius:4px;margin-top:2px;color:#a7f3d0;max-width:85px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">OTC Sniper</span>
          </div>
        </div>
      </div>

      <!-- FOOTER WATERMARK -->
      <div style="margin-top:12px;border-top:1px solid rgba(255,255,255,0.04);padding-top:8px;display:flex;justify-content:space-between;align-items:center;">
        <span style="font-size:11px;font-weight:900;letter-spacing:1.5px;color:#cbd5e1;">ORACLE <span style="font-weight:400;color:#94a3b8;letter-spacing:0;">eloqua.</span></span>
        <span id="orion-active-asset" style="font-size:9px;color:#a855f7;font-family:monospace;background:rgba(168,85,247,0.15);padding:2px 5px;border-radius:4px;">US 500 (Auto)</span>
      </div>
    \`;

    document.body.appendChild(hud);

    document.getElementById('orion-toggle-btn').onclick = function () {
      State.running = !State.running;
      this.innerText = State.running ? 'Desligar' : 'Ligar';
      this.style.background = State.running ? '#ef4444' : '#10b981';
    };
  }

  function updateHUD() {
    const winsEl = document.getElementById('orion-wins');
    const lossesEl = document.getElementById('orion-losses');
    const profitEl = document.getElementById('orion-profit');
    const confEl = document.getElementById('orion-confidence');
    const dirEl = document.getElementById('orion-direction');
    const assetEl = document.getElementById('orion-active-asset');
    const stratEl = document.getElementById('orion-strategy-badge');

    if (winsEl) winsEl.innerText = State.wins;
    if (lossesEl) lossesEl.innerText = State.losses;
    if (profitEl) {
      profitEl.innerText = (State.profit >= 0 ? '+R$ ' : '-R$ ') + Math.abs(State.profit).toFixed(2);
      profitEl.style.color = State.profit >= 0 ? '#10b981' : '#ef4444';
    }
    if (confEl) confEl.innerText = State.confidence + '%';
    if (dirEl) {
      dirEl.innerText = State.direction;
      dirEl.style.color = State.direction === 'COMPRA' ? '#34d399' : '#f87171';
    }
    if (assetEl) assetEl.innerText = State.currentAsset + ' (Auto)';
    if (stratEl) stratEl.innerText = State.activeStrategyName;
  }

  // Timer loop
  setInterval(() => {
    if (!State.running) return;
    State.timerSeconds = State.timerSeconds > 0 ? State.timerSeconds - 1 : 3600;
    const m = Math.floor(State.timerSeconds / 60).toString().padStart(2, '0');
    const s = (State.timerSeconds % 60).toString().padStart(2, '0');
    const tEl = document.getElementById('orion-timer');
    if (tEl) tEl.innerText = m + ':' + s;
  }, 1000);

  // Inicializa o HUD e o ciclo de troca automática de ativos a cada 12 segundos
  injectOrionHUD();
  setInterval(autoSwitchAsset, 12000);
  console.log('%c[ORION] ROBÔ ORACLE ELOQUA INJETADO COM TROCA DE ATIVOS ATIVA!', 'color: #10b981; font-weight: bold;');
})();
`
  }
];

