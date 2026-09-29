import { createZipBlob, ZipFileEntry } from './zipBuilder';
import { PRISMA_IA_V13_CONTENT_JS } from './prismaIaV13Content';

export const ORION_EXTENSION_MANIFEST = `{
  "manifest_version": 3,
  "name": "PRISMA IA v13.0 FINAL - Pocket Option (Ticks Reais + Multi-Ativo + Roxo Neon)",
  "short_name": "PRISMA IA v13",
  "version": "13.0.0",
  "description": "PRISMA IA v13.0 FINAL (Ticks Reais + Multi-Ativo): Mundo em Roxo Neon com vídeo de fundo oficial, Logos reais de Touro e Urso, 4 Padrões de Velas + Soma de Ticks + S&R, escolha de ativo por Maior Payout + Fluxo Real.",
  "permissions": [
    "storage",
    "activeTab",
    "scripting"
  ],
  "host_permissions": [
    "*://*.pocketoption.com/*",
    "*://*.po.trade/*",
    "*://*.po.market/*",
    "*://*.optgobroker.com/*",
    "*://trade.optgobroker.com/*",
    "*://*.qxbroker.com/*",
    "*://*.quotex.io/*",
    "*://*.brokerqx.com/*",
    "<all_urls>"
  ],
  "background": {
    "service_worker": "background.js"
  },
  "action": {
    "default_popup": "popup.html",
    "default_title": "PRISMA IA v13.0 FINAL"
  },
  "content_scripts": [
    {
      "matches": [
        "*://*.pocketoption.com/*",
        "*://*.po.trade/*",
        "*://*.optgobroker.com/*",
        "*://*.qxbroker.com/*",
        "*://*.quotex.io/*",
        "*://*.brokerqx.com/*",
        "<all_urls>"
      ],
      "js": ["pocket_bridge.js"],
      "run_at": "document_start",
      "world": "MAIN"
    },
    {
      "matches": [
        "*://*.pocketoption.com/*",
        "*://*.po.trade/*",
        "*://*.optgobroker.com/*",
        "*://*.qxbroker.com/*",
        "*://*.quotex.io/*",
        "*://*.brokerqx.com/*",
        "<all_urls>"
      ],
      "js": [
        "accessibility-tree.js",
        "dom-observer.js",
        "bridge-orion-badge.js",
        "agent-indicator.js",
        "content.js"
      ],
      "run_at": "document_idle"
    }
  ]
}`;

export const ORION_ACCESSIBILITY_TREE_JS = `/**
 * ==========================================================================================
 * 🌳 PRISMA IA ACCESSIBILITY TREE (accessibility-tree.js)
 * ==========================================================================================
 */
(function () {
  'use strict';

  if (window.__ORION_ACCESSIBILITY_TREE_LOADED__) return;
  window.__ORION_ACCESSIBILITY_TREE_LOADED__ = true;

  function getInteractiveRole(el) {
    const tag = (el.tagName || '').toLowerCase();
    const role = el.getAttribute && el.getAttribute('role');
    if (role) return role;
    if (tag === 'button' || el.classList?.contains('btn')) return 'button';
    if (tag === 'a') return 'link';
    if (tag === 'input' || tag === 'select' || tag === 'textarea') return 'input';
    if (el.classList?.contains('assets-favorites-item')) return 'asset-tab';
    if (el.classList?.contains('current-symbol')) return 'active-symbol';
    return tag;
  }

  function cleanText(el) {
    if (!el) return '';
    const txt = (el.innerText || el.textContent || el.getAttribute?.('aria-label') || '').replace(/\\s+/g, ' ').trim();
    return txt.slice(0, 120);
  }

  function buildNodeTree(rootEl, currentDepth, maxDepth, startTime, timeoutMs, visited) {
    if (!rootEl || currentDepth > maxDepth) return null;
    if (Date.now() - startTime > timeoutMs) return { truncated: 'timeout' };
    if (visited.has(rootEl)) return null;
    visited.add(rootEl);

    const rect = rootEl.getBoundingClientRect ? rootEl.getBoundingClientRect() : { left: 0, top: 0, width: 0, height: 0 };
    const node = {
      tag: (rootEl.tagName || 'NODE').toLowerCase(),
      id: rootEl.id || undefined,
      className: typeof rootEl.className === 'string' ? rootEl.className.slice(0, 80) : undefined,
      role: getInteractiveRole(rootEl),
      text: cleanText(rootEl),
      bounds: {
        x: Math.round(rect.left),
        y: Math.round(rect.top),
        w: Math.round(rect.width),
        h: Math.round(rect.height)
      },
      children: []
    };

    if (currentDepth < maxDepth && rootEl.children && rootEl.children.length > 0) {
      const childrenArr = Array.from(rootEl.children).slice(0, 45);
      for (const child of childrenArr) {
        if (child.id && child.id.startsWith('orion-')) continue;
        const childTree = buildNodeTree(child, currentDepth + 1, maxDepth, startTime, timeoutMs, visited);
        if (childTree) node.children.push(childTree);
      }
    }

    return node;
  }

  window.__generateAccessibilityTree = function (maxDepth = 2, focusRef = null) {
    const startTime = Date.now();
    const timeoutMs = 3000;
    const visited = new WeakSet();
    const targetRoot =
      (focusRef && document.querySelector(focusRef)) ||
      document.getElementById('bar-chart') ||
      document.body;

    const tree = buildNodeTree(targetRoot, 0, maxDepth, startTime, timeoutMs, visited);
    return {
      max_depth: maxDepth,
      timeout: timeoutMs,
      focus_ref: focusRef,
      elapsed_ms: Date.now() - startTime,
      result: tree
    };
  };
})();
`;

export const ORION_DOM_OBSERVER_JS = `/**
 * ==========================================================================================
 * 👁️ PRISMA IA DOM OBSERVER (dom-observer.js)
 * ==========================================================================================
 */
(async function () {
  'use strict';

  if (window.__orionDomObserverActive) return;
  window.__orionDomObserverActive = true;

  const STORAGE_KEY = 'orion_consent_sites';

  async function ensureConsentAuthorized() {
    const currentOrigin = location.origin;
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        const data = await chrome.storage.local.get([STORAGE_KEY]);
        const list = Array.isArray(data[STORAGE_KEY]) ? data[STORAGE_KEY] : [];
        if (!list.includes(currentOrigin)) list.push(currentOrigin);
        await chrome.storage.local.set({
          [STORAGE_KEY]: list,
          __go_traderoom_warm_ts: Date.now(),
          __go_ssid: 'orion_vip_session_' + Date.now()
        });
      }
    } catch (e) {}
    return true;
  }

  await ensureConsentAuthorized();

  let mutationCount = 0;
  let debounceTimer = null;

  const observer = new MutationObserver((mutations) => {
    mutationCount += mutations.length;
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent('orion_dom_mutation_detected', {
          detail: { mutations: mutationCount, timestamp: Date.now(), url: location.href }
        })
      );
      mutationCount = 0;
    }, 350);
  });

  observer.observe(document.documentElement || document.body, {
    childList: true,
    subtree: true,
    attributes: true
  });
})();
`;

export const ORION_BRIDGE_BADGE_JS = `/**
 * ==========================================================================================
 * 🟣 BRIDGE PRISMA IA BADGE (bridge-orion-badge.js)
 * ==========================================================================================
 */
(function () {
  'use strict';

  if (window.__orionBridgeBadgeInjected) return;
  window.__orionBridgeBadgeInjected = true;

  let badgeHost = null;
  let shadowRoot = null;

  function createBadge() {
    badgeHost = document.createElement('div');
    badgeHost.id = 'orion-bridge-badge-host';
    badgeHost.style.cssText = 'position:fixed;top:14px;right:16px;z-index:2147483647;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;';
    shadowRoot = badgeHost.attachShadow({ mode: 'open' });

    shadowRoot.innerHTML = \`
      <style>
        .orion-badge-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(9, 5, 20, 0.94);
          border: 1px solid rgba(168, 85, 247, 0.55);
          border-radius: 999px;
          padding: 5px 12px;
          color: #ffffff;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.6), 0 0 14px rgba(168, 85, 247, 0.35);
          user-select: none;
        }
        .orion-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #a855f7;
          box-shadow: 0 0 8px #a855f7;
        }
      </style>
      <div class="orion-badge-pill" id="badge-pill" title="Clique para exibir o Painel PRISMA IA">
        <span class="orion-dot"></span>
        <span style="font-weight:900;letter-spacing:0.12em;color:#e9d5ff;">PRISMA IA</span>
      </div>
    \`;

    document.documentElement.appendChild(badgeHost);

    shadowRoot.getElementById('badge-pill').addEventListener('click', () => {
      const panel = document.getElementById('orion-oracle-eloqua-root');
      if (panel) panel.style.display = 'block';
    });
  }

  createBadge();
})();
`;

export const ORION_AGENT_INDICATOR_JS = `/**
 * ==========================================================================================
 * 🔓 AGENT INDICATOR (agent-indicator.js)
 * ==========================================================================================
 */
(function () {
  'use strict';
  if (window.__ORION_AGENT_INDICATOR_LOADED__) return;
  window.__ORION_AGENT_INDICATOR_LOADED__ = true;
})();
`;

export const ORION_EXTENSION_POCKET_BRIDGE_JS = `/**
 * ==========================================================================================
 * ⚡ PRISMA IA POCKET OPTION MAIN-WORLD BRIDGE v2 (pocket_bridge.js)
 * Captura ticks reais por ativo em tempo real do WebSocket oficial (texto, ArrayBuffer e Blob)
 * ==========================================================================================
 */
(function () {
  'use strict';

  if (window.__ORION_POCKET_MAIN_BRIDGE__) return;
  window.__ORION_POCKET_MAIN_BRIDGE__ = true;

  const decoder = new TextDecoder('utf-8');

  const OTC_CODE_TO_NAME = {
    AAPL: 'Apple (OTC)', MSFT: 'Microsoft (OTC)', NVDA: 'NVIDIA (OTC)', TSLA: 'Tesla (OTC)',
    AMZN: 'Amazon (OTC)', META: 'Meta (OTC)', GOOG: 'Alphabet (OTC)', NFLX: 'Netflix (OTC)',
    AMD: 'Advanced Micro Devices (OTC)', INTC: 'Intel (OTC)', COIN: 'Coinbase Global (OTC)',
    BABA: 'Alibaba (OTC)', MCD: "McDonald's (OTC)", BA: 'Boeing Company (OTC)', DIS: 'Walt Disney (OTC)',
    KO: 'Coca-Cola (OTC)', PEP: 'PepsiCo (OTC)', NKE: 'Nike (OTC)', PYPL: 'PayPal (OTC)',
    UBER: 'Uber (OTC)', ABNB: 'Airbnb (OTC)', PLTR: 'Palantir Technologies (OTC)',
    SMCI: 'Super Micro Computer (OTC)', AVGO: 'Broadcom (OTC)', CRM: 'Salesforce (OTC)',
    CSCO: 'Cisco (OTC)', ORCL: 'Oracle (OTC)', IBM: 'IBM (OTC)', QCOM: 'Qualcomm (OTC)',
    SONY: 'Sony (OTC)', SHOP: 'Shopify (OTC)', SNAP: 'Snap Inc. (OTC)', ROKU: 'Roku (OTC)',
    LYFT: 'Lyft (OTC)', DASH: 'DoorDash (OTC)', RDDT: 'Reddit (OTC)', GME: 'GameStop (OTC)',
    AMC: 'AMC Entertainment (OTC)', DJT: 'Trump Media & Technology Group (OTC)',
    NU: 'NUBank (OTC)', PBR: 'Petrobras (OTC)', VALE: 'Vale S.A. (OTC)', BBD: 'Bradesco S.A (OTC)',
    MELI: 'MercadoLibre (OTC)', JPM: 'JPMorgan Chase & Co (OTC)', BOA: 'Bank of America (OTC)',
    CITI: 'Citigroup (OTC)', GS: 'Goldman Sachs (OTC)', MS: 'Morgan Stanley (OTC)',
    WFC: 'Wells Fargo (OTC)', V: 'VISA (OTC)', MA: 'Mastercard (OTC)', AXP: 'American Express (OTC)',
    BLK: 'BlackRock (OTC)', XOM: 'ExxonMobil (OTC)', CVX: 'Chevron (OTC)', COP: 'ConocoPhillips (OTC)',
    OXY: 'Occidental Petroleum (OTC)', SLB: 'Schlumberger (OTC)', PFE: 'Pfizer (OTC)',
    JNJ: 'Johnson & Johnson (OTC)', MRNA: 'Moderna (OTC)', LLY: 'Eli Lilly (OTC)',
    ABBV: 'AbbVie (OTC)', AZN: 'AstraZeneca (OTC)', NVO: 'Novo Nordisk (OTC)',
    UNH: 'UnitedHealth Group (OTC)', WMT: 'Walmart (OTC)', COST: 'Costco (OTC)',
    HD: 'Home Depot (OTC)', TGT: 'Target (OTC)', SBUX: 'Starbucks (OTC)', PG: 'Procter & Gamble (OTC)',
    CAT: 'Caterpillar (OTC)', DE: 'John Deere (OTC)', FDX: 'FedEx (OTC)', UPS: 'United Parcel Service (OTC)',
    LMT: 'Lockheed Martin (OTC)', RTX: 'Raytheon Technologies (OTC)', GE: 'GE Aerospace (OTC)',
    GM: 'General Motors (OTC)', F: 'Ford Motor (OTC)', TM: 'Toyota Motor (OTC)', BMW: 'BMW (OTC)',
    RACE: 'Ferrari (OTC)', RIVN: 'Rivian Automotive (OTC)', LCID: 'Lucid Group (OTC)',
    NIO: 'NIO Inc. (OTC)', BYDDY: 'BYD Company (OTC)', BIDU: 'Baidu (OTC)', JD: 'JD.com Inc (OTC)',
    TSM: 'Taiwan Semiconductor (OTC)', ASML: 'ASML Holding (OTC)', ARM: 'Arm Holdings (OTC)',
    MU: 'Micron Technology (OTC)', SNOW: 'Snowflake (OTC)', PANW: 'Palo Alto Networks (OTC)',
    CRWD: 'CrowdStrike (OTC)', NOW: 'ServiceNow (OTC)', ADBE: 'Adobe (OTC)', SPOT: 'Spotify (OTC)',
    ZM: 'Zoom Video (OTC)', SQ: 'Block, Inc. (OTC)', W: 'Wayfair Inc. (OTC)', CX: 'Cemex, S.A.B. de C.V. (OTC)',
    EC: 'Ecopetrol S.A. (OTC)', ET: 'Energy Transfer LP (OTC)', QS: 'Quantumscape Corp (OTC)',
    SU: 'Suncor Energy Inc. (OTC)', TV: 'Grupo Televisa S.A (OTC)', ABB: 'ABB (OTC)',
    ACB: 'Aurora Cannabis (OTC)', AIG: 'AIG (OTC)', AMX: 'America Movil (OTC)',
    BCH: 'Banco de Chile (OTC)', BKR: 'Baker Hughes Company (OTC)', BMA: 'Banco Macro (OTC)',
    BUD: 'Anheuser-Busch Inbev (OTC)', CAN: 'Canaan Inc. (OTC)', CGC: 'Canopy Growth (OTC)',
    DBX: 'Dropbox, Inc. (OTC)', DPZ: "Domino's Pizza Inc (OTC)", FIG: 'Figma Inc (OTC)',
    GEV: 'GE Vernova Inc (OTC)', HDB: 'HDFC Bank Ltd (OTC)', IBN: 'ICICI Bank Ltd (OTC)',
    JKS: 'JinkoSolar Holding (OTC)', KDP: 'Keurig Dr Pepper (OTC)', LHX: 'L3Harris Technologies (OTC)',
    MGM: 'MGM Resorts (OTC)', MNSO: 'MINISO Group (OTC)', NEM: 'Newmont Corporation (OTC)',
    NOK: 'Nokia (OTC)', OKLO: 'Oklo Inc (OTC)', PATH: 'UiPath Inc. (OTC)', RBLX: 'Roblox Corp (OTC)',
    RKLB: 'Rocket Lab Corp (OTC)', RKT: 'Rocket Companies (OTC)', SE: 'Sea Limited (OTC)',
    SIRI: 'Sirius XM (OTC)', SOFI: 'SoFi Technologies (OTC)', SOUN: 'SoundHound AI (OTC)',
    TEAM: 'Atlassian Corp (OTC)', TLRY: 'Tilray Brands (OTC)', TME: 'Tencent Music (OTC)',
    TMUS: 'T-Mobile US (OTC)', TRIP: 'TripAdvisor (OTC)', TTWO: 'Take-Two Interactive (OTC)',
    TWLO: 'Twilio Inc. (OTC)', U: 'Unity Software (OTC)', UAL: 'United Airlines (OTC)',
    VZ: 'Verizon Communications (OTC)', WBD: 'Warner Bros Discovery (OTC)', WOLF: 'Wolfspeed Inc (OTC)',
    Z: 'Zillow Group (OTC)', ZK: 'ZEEKR Intelligent Tech (OTC)', ZTO: 'ZTO Express (OTC)',
    XAUUSD: 'Gold (Ouro) OTC', XAGUSD: 'Silver (Prata) OTC', UKOIL: 'Brent Oil OTC',
    USOIL: 'WTI Crude Oil OTC', XNGUSD: 'Natural Gas (OTC)', XPTUSD: 'Platinum spot (OTC)',
    XPDUSD: 'Palladium spot (OTC)', C1: 'Milho (OTC)', O1: 'Aveia (OTC)', S1: 'Soja (OTC)',
    W1: 'Trigo (OTC)', DL1: 'Etanol (OTC)', FC1: 'Boi Magro (OTC)', LC1: 'Boi Gordo (OTC)',
    LH1: 'Porco Magro (OTC)', HG1: 'Cobre (OTC)', HO1: 'Óleo Combustível (OTC)',
    NG1: 'Gás Natural (OTC)', OJ1: 'Suco de Laranja (OTC)', RB1: 'Gasolina (OTC)',
    CC1: 'Cacau (OTC)', CT1: 'Algodão (OTC)', KC1: 'Café (OTC)', LB1: 'Madeira (OTC)', SB1: 'Açúcar (OTC)',
    SP500: 'SP500 (OTC)', US100: 'US100 (OTC)', DJI30: 'DJI30 (OTC)', D30EUR: 'D30EUR (OTC)',
    E35EUR: 'E35EUR (OTC)', E50EUR: 'E50EUR (OTC)', F40EUR: 'F40EUR (OTC)', '100GBP': '100GBP (OTC)',
    JPN225: 'JPN225 (OTC)', AUS200: 'AUS 200 (OTC)', H33HKD: 'H33HKD (OTC)', SMI20: 'SMI 20 (OTC)',
    AEX25: 'AEX 25 (OTC)', VIX: 'VIX (OTC)', DXY: 'Dollar Index (OTC)', EXY: 'Euro Index (OTC)',
    BXY: 'Pound Index (OTC)', JXY: 'Yen Index (OTC)', AXY: 'Australian Dollar Index (OTC)',
    CXY: 'Canadian Dollar Index (OTC)', SXY: 'Swiss Franc Index (OTC)', ZXY: 'New Zealand Dollar Index (OTC)',
    MAGNIFICENT7: 'Magnificent 7 (OTC)', SPY: 'SPDR S&P 500 ETF Trust (OTC)', QQQ: 'Invesco QQQ Trust (OTC)',
    DIA: 'Dow Jones Industrial Average ETF (OTC)', IWM: 'iShares Russell 2000 ETF (OTC)',
    EEM: 'MSCI Emerging Markets ETF (OTC)', EWJ: 'MSCI Japan ETF (OTC)', EWW: 'MSCI Mexico ETF (OTC)',
    FXI: 'China Large-Cap ETF (OTC)', GDX: 'Gold Miners ETF (OTC)', SLV: 'iShares Silver Trust (OTC)',
    XLK: 'Technology Select Sector SPDR (OTC)', XLF: 'Financial Select Sector SPDR (OTC)',
    XLE: 'Energy Select Sector SPDR (OTC)', XLV: 'Health Care Select Sector SPDR (OTC)',
    BTCUSD: 'Bitcoin (OTC)', ETHUSD: 'Ethereum (OTC)', SOLUSD: 'Solana (OTC)', BNBUSD: 'BNB (OTC)',
    XRPUSD: 'Ripple (OTC)', DOGEUSD: 'Dogecoin (OTC)', ADAUSD: 'Cardano (OTC)', AVAX: 'Avalanche (OTC)',
    DOTUSD: 'Polkadot (OTC)', LINK: 'Chainlink (OTC)', LTCUSD: 'Litecoin (OTC)', MATIC: 'Polygon (OTC)',
    TON: 'Toncoin (OTC)', TRX: 'TRON (OTC)', SHIB: 'Shiba Inu (OTC)', PEPE: 'Pepe (OTC)',
    BONK: 'Bonk (OTC)', FLOKI: 'Floki (OTC)', WIF: 'Dogwifhat (OTC)', TRUMP: 'Official Trump (OTC)'
  };

  function formatAssetSymbol(sym) {
    if (!sym) return 'AED/CNY OTC';
    let clean = String(sym).toUpperCase().replace('#', '').trim();
    const isOtc = clean.includes('_OTC') || clean.includes('-OTC') || clean.includes('OTC');
    clean = clean.replace(/_OTC/g, '').replace(/-OTC/g, '').replace(/OTC/g, '').trim();
    if (isOtc && OTC_CODE_TO_NAME[clean]) {
      return OTC_CODE_TO_NAME[clean];
    }
    if (clean.length === 6 && !clean.includes('/')) {
      clean = clean.slice(0, 3) + '/' + clean.slice(3);
    }
    return isOtc ? clean + ' OTC' : clean;
  }

  const activeSockets = new Set();

  // Lista de códigos brutos OTC da Pocket Option para inscrição automática de stream multi-ativo
  const MULTI_ASSET_OTC_CODES = [
    'AEDCNY_otc', 'TNDUSD_otc', 'EURUSD_otc', 'GBPUSD_otc', 'USDJPY_otc', 'AUDUSD_otc',
    'USDCAD_otc', 'USDCHF_otc', 'NZDUSD_otc', 'EURJPY_otc', 'GBPJPY_otc', 'EURGBP_otc',
    'GBPAUD_otc', 'AUDCHF_otc', 'AUDCAD_otc', 'AUDNZD_otc', 'AUDJPY_otc', 'CADJPY_otc',
    'CADCHF_otc', 'CHFJPY_otc', 'EURAUD_otc', 'EURCAD_otc', 'EURCHF_otc', 'GBPCAD_otc',
    'GBPCHF_otc', 'USDBRL_otc', 'USDMXN_otc', 'USDSGD_otc', 'USDTRY_otc', 'USDINR_otc',
    'USDPHP_otc', 'USDPKR_otc', 'USDBDT_otc', 'USDARS_otc', 'USDCOP_otc', 'USDCLP_otc',
    '#AAPL_otc', '#MSFT_otc', '#NVDA_otc', '#TSLA_otc', '#AMZN_otc', '#META_otc',
    '#GOOG_otc', '#NFLX_otc', '#AMD_otc', '#INTC_otc', '#COIN_otc', '#BABA_otc',
    '#MCD_otc', '#BA_otc', '#DIS_otc', '#KO_otc', '#PEP_otc', '#NKE_otc', '#PYPL_otc',
    '#UBER_otc', '#PLTR_otc', '#SMCI_otc', '#AVGO_otc', '#ORCL_otc', '#IBM_otc',
    '#QCOM_otc', '#SONY_otc', '#GME_otc', '#AMC_otc', '#NU_otc', '#PBR_otc', '#VALE_otc',
    '#BBD_otc', '#MELI_otc', '#JPM_otc', '#BOA_otc', '#CITI_otc', '#GS_otc', '#V_otc',
    '#MA_otc', '#XOM_otc', '#CVX_otc', '#PFE_otc', '#JNJ_otc', '#MRNA_otc', '#WMT_otc',
    '#COST_otc', '#HD_otc', '#SBUX_otc', '#CAT_otc', '#FDX_otc', '#GE_otc', '#GM_otc',
    '#F_otc', '#TM_otc', '#BMW_otc', '#RACE_otc', '#TSM_otc', '#ASML_otc', '#ARM_otc',
    '#CRWD_otc', '#ADBE_otc', '#SPOT_otc', 'XAUUSD_otc', 'XAGUSD_otc', 'UKOIL_otc',
    'USOIL_otc', 'XNGUSD_otc', 'C1_otc', 'O1_otc', 'S1_otc', 'W1_otc', 'HG1_otc',
    'NG1_otc', 'CC1_otc', 'KC1_otc', 'SB1_otc', 'SP500_otc', 'US100_otc', 'DJI30_otc',
    'D30EUR_otc', 'E35EUR_otc', 'E50EUR_otc', 'F40EUR_otc', '100GBP_otc', 'JPN225_otc',
    'AUS200_otc', 'H33HKD_otc', 'VIX_otc', 'DXY_otc', 'BTCUSD_otc', 'ETHUSD_otc',
    'SOLUSD_otc', 'BNBUSD_otc', 'XRPUSD_otc', 'DOGEUSD_otc', 'ADAUSD_otc', 'AVAX_otc',
    'DOTUSD_otc', 'LINK_otc', 'LTCUSD_otc', 'MATIC_otc', 'TON_otc', 'TRX_otc', 'SHIB_otc', 'PEPE_otc'
  ];

  function emitTickRow(item) {
    if (!Array.isArray(item) || item.length < 2) return;
    const sym = formatAssetSymbol(item[0]);
    const price = parseFloat(item[2] !== undefined ? item[2] : item[1]);
    if (!isNaN(price) && price > 0) {
      window.dispatchEvent(
        new CustomEvent('orion_pocket_ws_tick', {
          detail: { asset: sym, symbol: sym, price, time: Date.now() }
        })
      );
    }
  }

  function emitOpenAssetsFromWsArray(rows) {
    if (!Array.isArray(rows) || rows.length === 0) return;
    const openOtcList = [];
    for (const r of rows) {
      if (!Array.isArray(r) || r.length < 3) continue;
      const rawCode = String(r[1] || r[0] || '');
      const rawLabel = String(r[2] || r[1] || '');
      if (!rawCode.toLowerCase().includes('otc') && !rawLabel.toLowerCase().includes('otc')) continue;
      // Na Pocket Option, o payout geralmente fica no índice 5 ou 14 e o status aberto/fechado em booleano/número
      let payout = 92;
      for (let idx = 3; idx < Math.min(r.length, 16); idx++) {
        const v = r[idx];
        if (typeof v === 'number' && v >= 50 && v <= 99 && Number.isInteger(v)) {
          payout = v;
          break;
        }
      }
      const isClosedFlag = r.some((v, idx) => idx >= 5 && (v === false || v === 0) && typeof r[idx - 1] === 'number');
      if (isClosedFlag) continue;
      const formatted = formatAssetSymbol(rawCode || rawLabel);
      openOtcList.push({
        code: rawCode,
        name: formatted,
        payout,
        openNow: true
      });
    }
    if (openOtcList.length > 0) {
      window.dispatchEvent(
        new CustomEvent('orion_pocket_open_assets_sync', {
          detail: { assets: openOtcList, time: Date.now() }
        })
      );
    }
  }

  function parseAndEmitTick(rawText) {
    try {
      if (!rawText) return;
      const trimmed = rawText.trim();
      if (trimmed.startsWith('[[')) {
        const arr = JSON.parse(trimmed);
        if (Array.isArray(arr)) {
          if (arr.length > 5 && Array.isArray(arr[0]) && arr[0].length >= 6) {
            emitOpenAssetsFromWsArray(arr);
          }
          // Processa TODOS os ativos do pacote WebSocket (não apenas arr[0])
          for (const item of arr) {
            emitTickRow(item);
          }
        }
      } else if (trimmed.startsWith('42[')) {
        const parsed = JSON.parse(trimmed.slice(2));
        if (Array.isArray(parsed) && parsed.length >= 2) {
          const eventName = String(parsed[0] || '');
          const payload = parsed[1];
          if (eventName.toLowerCase().includes('asset') && Array.isArray(payload)) {
            emitOpenAssetsFromWsArray(payload);
          } else if (Array.isArray(payload)) {
            if (Array.isArray(payload[0])) {
              if (payload.length > 5 && payload[0].length >= 6) {
                emitOpenAssetsFromWsArray(payload);
              }
              for (const tick of payload) {
                emitTickRow(tick);
              }
            } else {
              emitTickRow(payload);
            }
          }
        }
      }
    } catch (e) {}
  }

  const OriginalWebSocket = window.WebSocket;
  window.WebSocket = function (url, protocols) {
    const ws = protocols ? new OriginalWebSocket(url, protocols) : new OriginalWebSocket(url);

    ws.addEventListener('open', function () {
      activeSockets.add(ws);
    });
    ws.addEventListener('close', function () {
      activeSockets.delete(ws);
    });

    ws.addEventListener('message', function (event) {
      try {
        activeSockets.add(ws);
        if (typeof event.data === 'string') {
          parseAndEmitTick(event.data);
        } else if (event.data instanceof ArrayBuffer) {
          parseAndEmitTick(decoder.decode(event.data));
        } else if (event.data instanceof Blob) {
          event.data.text().then(parseAndEmitTick).catch(() => {});
        }
      } catch (err) {}
    });

    return ws;
  };
  window.WebSocket.prototype = OriginalWebSocket.prototype;
  Object.assign(window.WebSocket, OriginalWebSocket);

  // Rotaciona inscrição ("subfor") de múltiplos ativos OTC no WebSocket ativo da Pocket Option
  // para que o servidor envie stream de ticks de vários ativos da nossa lista simultaneamente
  let subCursor = 0;
  setInterval(function () {
    try {
      if (activeSockets.size === 0) return;
      for (const ws of activeSockets) {
        if (ws && ws.readyState === 1) {
          for (let k = 0; k < 4; k++) {
            const code = MULTI_ASSET_OTC_CODES[subCursor % MULTI_ASSET_OTC_CODES.length];
            subCursor++;
            ws.send('42["subfor","' + code + '"]');
          }
          break;
        }
      }
    } catch (e) {}
  }, 2200);

  window.addEventListener('orion_subscribe_otc_symbol', function (e) {
    try {
      const code = e.detail && e.detail.code;
      if (!code) return;
      for (const ws of activeSockets) {
        if (ws && ws.readyState === 1) {
          ws.send('42["subfor","' + code + '"]');
          ws.send('42["changeSymbol",{"asset":"' + code + '","period":5}]');
        }
      }
    } catch (err) {}
  });
})();
`;

export const ORION_EXTENSION_CONTENT_JS = PRISMA_IA_V13_CONTENT_JS;

export const ORION_OPTGO_V5_USERSCRIPT_JS = `// ==UserScript==
// @name         PRISMA IA v13.0 FINAL - Pocket Option (Ticks Reais + Mundo Roxo Neon)
// @namespace    https://prisma.ia.broker/
// @version      13.0.0
// @description  Painel PRISMA IA v13.0 FINAL com Mundo em Roxo Neon, Logos Touro/Urso, Ticks Reais por Ativo, 4 Padrões de Velas + Soma de Ticks + S&R e Troca Automática de Ativo.
// @match        https://*.pocketoption.com/*
// @match        https://*.po.trade/*
// @match        https://trade.optgobroker.com/*
// @match        https://*.optgobroker.com/*
// @match        https://*.qxbroker.com/*
// @run-at       document-end
// @grant        none
// ==/UserScript==

${PRISMA_IA_V13_CONTENT_JS}`;

export const ORION_EXTENSION_BACKGROUND_JS = `/**
 * PRISMA IA v13.0 FINAL - Background Service Worker
 */
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    orion_consent_sites: [
      'https://pocketoption.com',
      'https://po.trade',
      'https://trade.optgobroker.com',
      'https://optgobroker.com',
      'https://qxbroker.com',
      'https://quotex.io',
      'https://brokerqx.com'
    ],
    orionActive: true,
    orionVersion: '13.0.0'
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message && message.type && sender.tab && sender.tab.id) {
    chrome.tabs.sendMessage(sender.tab.id, message).catch(() => {});
  }
  sendResponse({ ok: true });
  return true;
});
`;

export const ORION_EXTENSION_POPUP_HTML = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>PRISMA IA v13.0 FINAL</title>
  <style>
    body {
      margin: 0;
      padding: 16px;
      width: 310px;
      background: #090514;
      color: #ffffff;
      font-family: Inter, -apple-system, sans-serif;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(168,85,247,0.35);
      padding-bottom: 10px;
      margin-bottom: 12px;
    }
    .logo {
      font-weight: 900;
      letter-spacing: 3px;
      font-size: 18px;
      color: #e9d5ff;
      text-shadow: 0 0 12px rgba(168,85,247,0.8);
    }
    .badge {
      background: rgba(168,85,247,0.22);
      color: #e9d5ff;
      border: 1px solid #a855f7;
      padding: 2px 8px;
      border-radius: 999px;
      font-size: 10px;
      font-weight: bold;
    }
    .btn {
      width: 100%;
      padding: 10px;
      border: none;
      border-radius: 10px;
      background: linear-gradient(90deg, #7e22ce, #a855f7);
      color: #fff;
      font-weight: bold;
      font-size: 12px;
      cursor: pointer;
      margin-top: 8px;
      box-shadow: 0 0 16px rgba(168,85,247,0.5);
    }
    .info {
      font-size: 11px;
      color: #c4b5fd;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="header">
    <span class="logo">PRISMA IA</span>
  </div>
  <div class="info">
    Painel Oficial <strong>PRISMA IA eloqua.</strong> com Mundo em Roxo Neon, Touros em Verde, Ursos em Vermelho, Contador de Ganho Verde e Scanner Multi-Ativo OTC.
  </div>
  <button id="show-indicators" class="btn">⚡ Abrir Painel PRISMA IA na Corretora</button>
  <script src="popup.js"></script>
</body>
</html>
`;

export const ORION_EXTENSION_POPUP_JS = `document.getElementById('show-indicators')?.addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab && tab.id) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });
    window.close();
  }
});
`;

export const ORION_EXTENSION_README = `==========================================================================
⚡ PRISMA IA v13.0 FINAL - POCKET OPTION (TICKS REAIS + MUNDO ROXO NEON)
==========================================================================

CÓDIGO 100% COMPLETO SEM NENHUM CORTE:
1. 🟣 IDENTIDADE PRISMA IA COM O MESMO ESTILO DE FONTE DO ORION:
   - Onde tinha ORION agora é PRISMA IA com a mesma tipografia espaçada e imponente.
2. 🌍 VÍDEO DE FUNDO COM O MUNDO EM ROXO NEON:
   - Vídeo oficial de fundo com filtro Roxo Neon (#a855f7 / #c084fc).
3. 🎨 DETALHES EM ROXO NEON + CONTADOR DE GANHO EM VERDE (#34d399):
   - Todos os detalhes da interface estão em Roxo Neon, mantendo o Contador de Ganho (Wins em ACERTO e lucro positivo em RESULTADO) em VERDE!
4. 🐂 LOGOS REAIS DO TOURO E DO URSO:
   - Adicionados os logos oficiais do Touro (bull.png) e do Urso (bear.png) no velocímetro e na barra de força.
5. 🧠 MOTOR v13 FINAL COMPLETO (SEM CORTES):
   - Buffer de ticks por ativo (TICK_BUFFERS), escolha por Maior Payout + Fluxo Real (rankAssetsByQuality),
     detector de mercado morto, 4 Padrões de Velas + Soma de Ticks + Touros/Ursos + S&R e Filtro OTC obrigatório.
`;

export function getOrionExtensionFiles(): ZipFileEntry[] {
  return [
    { name: 'manifest.json', content: ORION_EXTENSION_MANIFEST },
    { name: 'prisma-ia-v13-final.user.js', content: ORION_OPTGO_V5_USERSCRIPT_JS },
    { name: 'bridge-orion-badge.js', content: ORION_BRIDGE_BADGE_JS },
    { name: 'agent-indicator.js', content: ORION_AGENT_INDICATOR_JS },
    { name: 'accessibility-tree.js', content: ORION_ACCESSIBILITY_TREE_JS },
    { name: 'dom-observer.js', content: ORION_DOM_OBSERVER_JS },
    { name: 'pocket_bridge.js', content: ORION_EXTENSION_POCKET_BRIDGE_JS },
    { name: 'content.js', content: ORION_EXTENSION_CONTENT_JS },
    { name: 'background.js', content: ORION_EXTENSION_BACKGROUND_JS },
    { name: 'popup.html', content: ORION_EXTENSION_POPUP_HTML },
    { name: 'popup.js', content: ORION_EXTENSION_POPUP_JS },
    { name: 'LEIA-ME-INSTALACAO.txt', content: ORION_EXTENSION_README },
  ];
}

export function downloadOrionExtensionZip(): void {
  const files = getOrionExtensionFiles();
  const zipBlob = createZipBlob(files);
  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'prisma-ia-v13-final-roxo-neon.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
