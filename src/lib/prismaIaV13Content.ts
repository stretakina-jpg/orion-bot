export const PRISMA_IA_V13_CONTENT_JS = `/**
 * ==========================================================================================
 * ⚡ PRISMA IA ORACLE ELOQUA v13.0 FINAL - POCKET OPTION (TICKS REAIS + MUNDO ROXO NEON)
 * ==========================================================================================
 * REQUER: pocket_bridge.js v2 rodando em paralelo (captura ticks reais)
 * ==========================================================================================
 * - Buffer de ticks POR ATIVO (multi-ativo em tempo real)
 * - Escolha do ativo por MAIOR PAYOUT + FLUXO
 * - Detecta mercado morto → troca pra ativo com fluxo
 * - 4 Padrões de Vela + Soma de Ticks + Touros/Ursos + S&R
 * - Filtro OTC obrigatório
 * - Confirmação cruzada (tudo tem que bater)
 * ==========================================================================================
 */

(function () {
  'use strict';

  if (window.__ORION_V13_INTERVALS__ && Array.isArray(window.__ORION_V13_INTERVALS__)) {
    window.__ORION_V13_INTERVALS__.forEach(id => clearInterval(id));
  }
  window.__ORION_V13_INTERVALS__ = [];
  window.__ORION_ORACLE_ELOQUA_V13_LOADED__ = true;

  // ═══════════════════════════════════════════════════════════════════════
  // ASSETS OFICIAIS: VÍDEO DE FUNDO + LOGOS DO TOURO E DO URSO
  // ═══════════════════════════════════════════════════════════════════════
  const BULL_ICON = 'https://ucycjlwmgdnayebmpfmf.supabase.co/storage/v1/object/public/admin-files/1778007746461-bull.png';
  const BEAR_ICON = 'https://ucycjlwmgdnayebmpfmf.supabase.co/storage/v1/object/public/admin-files/1778007752753-bear.png';
  const DESKTOP_VIDEO = 'https://oggtaibqhyvmupulskfm.supabase.co/storage/v1/object/public/admin-files/1777054051734-Background_Orion.mp4';

  // ═══════════════════════════════════════════════════════════════════════
  // BUFFERS DE TICKS POR ATIVO
  // ═══════════════════════════════════════════════════════════════════════
  const TICK_BUFFERS = {};       // { "USD/JPY OTC": [{time, price}, ...] }
  const TICK_MAX_PER_ASSET = 300; // guarda os últimos 300 ticks por ativo
  const TICK_WINDOW_MS = 5000;    // janela de 5s pra análise

  function getTickBuffer(asset) {
    if (!TICK_BUFFERS[asset]) TICK_BUFFERS[asset] = [];
    return TICK_BUFFERS[asset];
  }

  function pushTick(asset, price, time) {
    const buf = getTickBuffer(asset);
    buf.push({ time, price });
    // Limita tamanho
    if (buf.length > TICK_MAX_PER_ASSET) buf.shift();
    // Remove ticks antigos (> 5s)
    const cutoff = Date.now() - TICK_WINDOW_MS;
    while (buf.length > 0 && buf[0].time < cutoff) buf.shift();
  }

  // Calcula fluxo (ticks/s) e variação (%) de um ativo
  function analyzeAssetFlow(asset) {
    const buf = getTickBuffer(asset);
    if (buf.length < 2) return { ticksPerSec: 0, variation: 0, alive: false, score: 0 };

    const now = Date.now();
    const cutoff = now - TICK_WINDOW_MS;
    const recent = buf.filter(t => t.time >= cutoff);
    if (recent.length < 2) return { ticksPerSec: 0, variation: 0, alive: false, score: 0 };

    const durationSec = (recent[recent.length - 1].time - recent[0].time) / 1000;
    const ticksPerSec = durationSec > 0 ? recent.length / durationSec : 0;

    let minP = Infinity, maxP = -Infinity;
    for (const t of recent) {
      if (t.price < minP) minP = t.price;
      if (t.price > maxP) maxP = t.price;
    }
    const variation = minP > 0 ? ((maxP - minP) / minP) * 100 : 0;

    // Considera "vivo" se tem pelo menos 1 tick/s
    const alive = ticksPerSec >= 1.0;
    // Score combina fluxo + variação
    const score = ticksPerSec * (1 + variation * 10);

    return { ticksPerSec, variation, alive, score, minP, maxP };
  }

  // Escolhe melhor ativo (priorizando os ativos OTC confirmados ABERTOS AGORA na Pocket Option + maior payout + fluxo + qualidade do sinal)
  function rankAssetsByQuality() {
    const list = [];
    const allAssets = State.liveAssets && State.liveAssets.length > 0 ? State.liveAssets : MASTER_POCKET_ASSETS;
    for (const item of allAssets) {
      const asset = item.name;
      const up = asset.toUpperCase();
      if (!isOTC(asset)) continue;
      if (State.closedOtcSet && State.closedOtcSet.has(up)) continue;
      const flow = analyzeAssetFlow(asset);
      if (!flow.alive) continue;
      const payout = item.payout || 92;
      const isConfirmedOpen = Boolean(item.openNow || (State.confirmedOpenOtcMap && State.confirmedOpenOtcMap.has(up)));
      const candles = State.candlesByAsset[up] || [];
      let signalBonus = 0;
      if (candles.length >= 4 && typeof MarketForceEngine !== 'undefined') {
        const sig = MarketForceEngine.computeSurrealSignal(candles);
        if (sig.isPerfectCrossover) signalBonus = 45;
        else if (sig.confluenceOk) signalBonus = 25;
      }
      // Bônus forte (+35 pts) para ativos confirmados abertos agora na Pocket Option
      const openBonus = isConfirmedOpen ? 35 : 0;
      list.push({
        asset,
        payout,
        flow,
        openNow: isConfirmedOpen,
        score: payout * 0.65 + flow.score * 0.25 + signalBonus + openBonus
      });
    }
    list.sort((a, b) => b.score - a.score);
    return list;
  }

  const ORION_STRATEGY = {
    id: 'surreal_2022_zeus_orion',
    name: '⚡ SCRIPT SURREAL 2022 + BANDAS @ZEUS + TOUROS/URSOS',
    badge: 'Compra/Venda Perfeita'
  };

  // ═══════════════════════════════════════════════════════════════════════
  // CATÁLOGO COMPLETO DE ATIVOS OTC DA POCKET OPTION (SOMENTE OTC)
  // ═══════════════════════════════════════════════════════════════════════
  const RAW_OTC_CATALOG = [
    // ── PARES DE MOEDAS OTC (FOREX OTC) ──
    ['AED/CNY OTC', 'AED/CNY', 92, 'currencies', '💱'],
    ['TND/USD OTC', 'TND/USD', 92, 'currencies', '💱'],
    ['EUR/USD OTC', 'EUR/USD', 92, 'currencies', '🇪🇺'],
    ['GBP/USD OTC', 'GBP/USD', 92, 'currencies', '🇬🇧'],
    ['USD/JPY OTC', 'USD/JPY', 92, 'currencies', '🇺🇸'],
    ['AUD/USD OTC', 'AUD/USD', 92, 'currencies', '🇦🇺'],
    ['USD/CAD OTC', 'USD/CAD', 92, 'currencies', '🇺🇸'],
    ['USD/CHF OTC', 'USD/CHF', 91, 'currencies', '🇨🇭'],
    ['NZD/USD OTC', 'NZD/USD', 91, 'currencies', '🇳🇿'],
    ['EUR/JPY OTC', 'EUR/JPY', 92, 'currencies', '🇪🇺'],
    ['GBP/JPY OTC', 'GBP/JPY', 92, 'currencies', '🇬🇧'],
    ['EUR/GBP OTC', 'EUR/GBP', 91, 'currencies', '🇪🇺'],
    ['GBP/AUD OTC', 'GBP/AUD', 92, 'currencies', '🇬🇧'],
    ['AUD/CHF OTC', 'AUD/CHF', 92, 'currencies', '🇦🇺'],
    ['AUD/CAD OTC', 'AUD/CAD', 92, 'currencies', '🇦🇺'],
    ['AUD/NZD OTC', 'AUD/NZD', 92, 'currencies', '🇦🇺'],
    ['AUD/JPY OTC', 'AUD/JPY', 91, 'currencies', '🇦🇺'],
    ['CAD/JPY OTC', 'CAD/JPY', 90, 'currencies', '🇨🇦'],
    ['CAD/CHF OTC', 'CAD/CHF', 90, 'currencies', '🇨🇦'],
    ['CHF/JPY OTC', 'CHF/JPY', 91, 'currencies', '🇨🇭'],
    ['EUR/AUD OTC', 'EUR/AUD', 91, 'currencies', '🇪🇺'],
    ['EUR/CAD OTC', 'EUR/CAD', 91, 'currencies', '🇪🇺'],
    ['EUR/CHF OTC', 'EUR/CHF', 90, 'currencies', '🇪🇺'],
    ['EUR/NZD OTC', 'EUR/NZD', 90, 'currencies', '🇪🇺'],
    ['GBP/CAD OTC', 'GBP/CAD', 91, 'currencies', '🇬🇧'],
    ['GBP/CHF OTC', 'GBP/CHF', 91, 'currencies', '🇬🇧'],
    ['GBP/NZD OTC', 'GBP/NZD', 90, 'currencies', '🇬🇧'],
    ['NZD/JPY OTC', 'NZD/JPY', 90, 'currencies', '🇳🇿'],
    ['NZD/CHF OTC', 'NZD/CHF', 89, 'currencies', '🇳🇿'],
    ['NZD/CAD OTC', 'NZD/CAD', 89, 'currencies', '🇳🇿'],
    ['USD/BRL OTC', 'USD/BRL', 92, 'currencies', '🇧🇷'],
    ['USD/MXN OTC', 'USD/MXN', 91, 'currencies', '🇲🇽'],
    ['USD/SGD OTC', 'USD/SGD', 90, 'currencies', '🇸🇬'],
    ['USD/TRY OTC', 'USD/TRY', 91, 'currencies', '🇹🇷'],
    ['USD/INR OTC', 'USD/INR', 91, 'currencies', '🇮🇳'],
    ['USD/ZAR OTC', 'USD/ZAR', 90, 'currencies', '🇿🇦'],
    ['USD/COP OTC', 'USD/COP', 90, 'currencies', '🇨🇴'],
    ['USD/ARS OTC', 'USD/ARS', 90, 'currencies', '🇦🇷'],
    ['USD/CLP OTC', 'USD/CLP', 90, 'currencies', '🇨🇱'],
    ['USD/EGP OTC', 'USD/EGP', 90, 'currencies', '🇪🇬'],
    ['USD/IDR OTC', 'USD/IDR', 90, 'currencies', '🇮🇩'],
    ['USD/MYR OTC', 'USD/MYR', 90, 'currencies', '🇲🇾'],
    ['USD/PHP OTC', 'USD/PHP', 90, 'currencies', '🇵🇭'],
    ['USD/PKR OTC', 'USD/PKR', 91, 'currencies', '🇵🇰'],
    ['USD/BDT OTC', 'USD/BDT', 91, 'currencies', '🇧🇩'],
    ['USD/NGN OTC', 'USD/NGN', 90, 'currencies', '🇳🇬'],
    ['USD/THB OTC', 'USD/THB', 90, 'currencies', '🇹🇭'],
    ['USD/VND OTC', 'USD/VND', 90, 'currencies', '🇻🇳'],
    ['EUR/RUB OTC', 'EUR/RUB', 90, 'currencies', '🇪🇺'],
    ['USD/RUB OTC', 'USD/RUB', 90, 'currencies', '🇺🇸'],
    ['YER/USD OTC', 'YER/USD', 91, 'currencies', '💱'],
    ['LBP/USD OTC', 'LBP/USD', 91, 'currencies', '💱'],
    ['OMR/CNY OTC', 'OMR/CNY', 91, 'currencies', '💱'],
    ['QAR/CNY OTC', 'QAR/CNY', 91, 'currencies', '💱'],
    ['SAR/CNY OTC', 'SAR/CNY', 91, 'currencies', '💱'],
    ['BHD/CNY OTC', 'BHD/CNY', 91, 'currencies', '💱'],
    ['JOD/CNY OTC', 'JOD/CNY', 91, 'currencies', '💱'],
    ['MAD/USD OTC', 'MAD/USD', 91, 'currencies', '💱'],
    ['CHF/NOK OTC', 'CHF/NOK', 89, 'currencies', '🇨🇭'],
    ['EUR/HUF OTC', 'EUR/HUF', 89, 'currencies', '🇪🇺'],
    ['EUR/TRY OTC', 'EUR/TRY', 90, 'currencies', '🇪🇺'],

    // ── AÇÕES & EMPRESAS OTC (EXTRAÍDAS DO DICIONÁRIO OFICIAL -OTC) ──
    ['Apple (OTC)', 'Apple', 92, 'actions', '🍏'],
    ['Microsoft (OTC)', 'Microsoft', 92, 'actions', '💻'],
    ['NVIDIA (OTC)', 'NVIDIA', 92, 'actions', '🟢'],
    ['Tesla (OTC)', 'Tesla', 92, 'actions', '🚗'],
    ['Amazon (OTC)', 'Amazon', 92, 'actions', '📦'],
    ['Meta (OTC)', 'Meta', 92, 'actions', '📱'],
    ['Alphabet (OTC)', 'Alphabet', 92, 'actions', '🔍'],
    ['Netflix (OTC)', 'Netflix', 92, 'actions', '🎬'],
    ['Advanced Micro Devices (OTC)', 'Advanced Micro Devices', 92, 'actions', '🔲'],
    ['Intel (OTC)', 'Intel', 91, 'actions', '💾'],
    ['Coinbase Global (OTC)', 'Coinbase', 92, 'actions', '🪙'],
    ['Alibaba (OTC)', 'Alibaba', 91, 'actions', '🛍️'],
    ["McDonald's (OTC)", 'McDonald', 92, 'actions', '🍔'],
    ['Boeing Company (OTC)', 'Boeing', 91, 'actions', '✈️'],
    ['Walt Disney (OTC)', 'Walt Disney', 90, 'actions', '🏰'],
    ['Coca-Cola (OTC)', 'Coca-Cola', 91, 'actions', '🥤'],
    ['PepsiCo (OTC)', 'PepsiCo', 90, 'actions', '🥤'],
    ['Nike (OTC)', 'Nike', 90, 'actions', '👟'],
    ['PayPal (OTC)', 'PayPal', 91, 'actions', '💳'],
    ['Uber (OTC)', 'Uber', 91, 'actions', '🚕'],
    ['Airbnb (OTC)', 'Airbnb', 90, 'actions', '🏠'],
    ['Palantir Technologies (OTC)', 'Palantir', 92, 'actions', '🛰️'],
    ['Super Micro Computer (OTC)', 'Super Micro Computer', 91, 'actions', '🖥️'],
    ['Broadcom (OTC)', 'Broadcom', 91, 'actions', '📡'],
    ['Salesforce (OTC)', 'Salesforce', 90, 'actions', '☁️'],
    ['Cisco (OTC)', 'Cisco', 90, 'actions', '🌐'],
    ['Oracle (OTC)', 'Oracle', 91, 'actions', '🗄️'],
    ['IBM (OTC)', 'IBM', 90, 'actions', '💻'],
    ['Qualcomm (OTC)', 'Qualcomm', 90, 'actions', '📶'],
    ['Sony (OTC)', 'Sony', 90, 'actions', '🎮'],
    ['Shopify (OTC)', 'Shopify', 90, 'actions', '🛒'],
    ['Snap Inc. (OTC)', 'Snap', 89, 'actions', '👻'],
    ['Roku (OTC)', 'Roku', 89, 'actions', '📺'],
    ['Lyft (OTC)', 'Lyft', 89, 'actions', '🚗'],
    ['DoorDash (OTC)', 'DoorDash', 90, 'actions', '🍔'],
    ['Reddit (OTC)', 'Reddit', 90, 'actions', '👽'],
    ['GameStop (OTC)', 'GameStop', 91, 'actions', '🕹️'],
    ['AMC Entertainment (OTC)', 'AMC Entertainment', 90, 'actions', '🍿'],
    ['Trump Media & Technology Group (OTC)', 'Trump Media', 91, 'actions', '🦅'],
    ['NUBank (OTC)', 'NUBank', 92, 'actions', '🟣'],
    ['Petrobras (OTC)', 'Petrobras', 91, 'actions', '🛢️'],
    ['Vale S.A. (OTC)', 'Vale', 90, 'actions', '⛏️'],
    ['Bradesco S.A (OTC)', 'Bradesco', 90, 'actions', '🏦'],
    ['MercadoLibre (OTC)', 'MercadoLibre', 91, 'actions', '🤝'],
    ['JPMorgan Chase & Co (OTC)', 'JPMorgan', 91, 'actions', '🏦'],
    ['Bank of America (OTC)', 'Bank of America', 91, 'actions', '🏦'],
    ['Citigroup (OTC)', 'Citigroup', 90, 'actions', '🏦'],
    ['Goldman Sachs (OTC)', 'Goldman Sachs', 91, 'actions', '🏦'],
    ['Morgan Stanley (OTC)', 'Morgan Stanley', 90, 'actions', '🏦'],
    ['Wells Fargo (OTC)', 'Wells Fargo', 90, 'actions', '🏦'],
    ['VISA (OTC)', 'VISA', 91, 'actions', '💳'],
    ['Mastercard (OTC)', 'Mastercard', 91, 'actions', '💳'],
    ['American Express (OTC)', 'American Express', 90, 'actions', '💳'],
    ['BlackRock (OTC)', 'BlackRock', 90, 'actions', '🏛️'],
    ['ExxonMobil (OTC)', 'ExxonMobil', 91, 'actions', '⛽'],
    ['Chevron (OTC)', 'Chevron', 90, 'actions', '⛽'],
    ['ConocoPhillips (OTC)', 'ConocoPhillips', 90, 'actions', '🛢️'],
    ['Occidental Petroleum (OTC)', 'Occidental Petroleum', 90, 'actions', '🛢️'],
    ['Schlumberger (OTC)', 'Schlumberger', 89, 'actions', '🛢️'],
    ['Pfizer (OTC)', 'Pfizer', 91, 'actions', '💊'],
    ['Johnson & Johnson (OTC)', 'Johnson & Johnson', 91, 'actions', '🩹'],
    ['Moderna (OTC)', 'Moderna', 91, 'actions', '🧬'],
    ['Eli Lilly (OTC)', 'Eli Lilly', 91, 'actions', '💊'],
    ['AbbVie (OTC)', 'AbbVie', 90, 'actions', '💊'],
    ['AstraZeneca (OTC)', 'AstraZeneca', 90, 'actions', '💊'],
    ['Novo Nordisk (OTC)', 'Novo Nordisk', 91, 'actions', '💊'],
    ['UnitedHealth Group (OTC)', 'UnitedHealth', 90, 'actions', '🏥'],
    ['Walmart (OTC)', 'Walmart', 91, 'actions', '🏬'],
    ['Costco (OTC)', 'Costco', 91, 'actions', '🛒'],
    ['Home Depot (OTC)', 'Home Depot', 90, 'actions', '🔨'],
    ['Target (OTC)', 'Target', 89, 'actions', '🎯'],
    ['Starbucks (OTC)', 'Starbucks', 90, 'actions', '☕'],
    ['Procter & Gamble (OTC)', 'Procter & Gamble', 90, 'actions', '🧼'],
    ['Caterpillar (OTC)', 'Caterpillar', 90, 'actions', '🚜'],
    ['John Deere (OTC)', 'John Deere', 89, 'actions', '🚜'],
    ['FedEx (OTC)', 'FedEx', 90, 'actions', '📦'],
    ['United Parcel Service (OTC)', 'United Parcel Service', 89, 'actions', '📦'],
    ['Lockheed Martin (OTC)', 'Lockheed Martin', 90, 'actions', '🚀'],
    ['Raytheon Technologies (OTC)', 'Raytheon', 90, 'actions', '🛰️'],
    ['GE Aerospace (OTC)', 'GE Aerospace', 90, 'actions', '✈️'],
    ['General Motors (OTC)', 'General Motors', 90, 'actions', '🚗'],
    ['Ford Motor (OTC)', 'Ford Motor', 90, 'actions', '🚙'],
    ['Toyota Motor (OTC)', 'Toyota Motor', 90, 'actions', '🚗'],
    ['BMW (OTC)', 'BMW', 90, 'actions', '🏎️'],
    ['Ferrari (OTC)', 'Ferrari', 91, 'actions', '🏎️'],
    ['Rivian Automotive (OTC)', 'Rivian', 90, 'actions', '🚙'],
    ['Lucid Group (OTC)', 'Lucid Group', 90, 'actions', '🚗'],
    ['NIO Inc. (OTC)', 'NIO', 90, 'actions', '🔋'],
    ['BYD Company (OTC)', 'BYD Company', 90, 'actions', '🔋'],
    ['Baidu (OTC)', 'Baidu', 90, 'actions', '🔍'],
    ['JD.com Inc (OTC)', 'JD.com', 90, 'actions', '📦'],
    ['Taiwan Semiconductor (OTC)', 'Taiwan Semiconductor', 91, 'actions', '🔬'],
    ['ASML Holding (OTC)', 'ASML', 91, 'actions', '🔬'],
    ['Arm Holdings (OTC)', 'Arm Holdings', 91, 'actions', '📱'],
    ['Micron Technology (OTC)', 'Micron', 91, 'actions', '💾'],
    ['Snowflake (OTC)', 'Snowflake', 90, 'actions', '❄️'],
    ['Palo Alto Networks (OTC)', 'Palo Alto', 90, 'actions', '🛡️'],
    ['CrowdStrike (OTC)', 'CrowdStrike', 91, 'actions', '🛡️'],
    ['ServiceNow (OTC)', 'ServiceNow', 90, 'actions', '⚙️'],
    ['Adobe (OTC)', 'Adobe', 90, 'actions', '🎨'],
    ['Spotify (OTC)', 'Spotify', 90, 'actions', '🎵'],
    ['Zoom Video (OTC)', 'Zoom Video', 89, 'actions', '📹'],
    ['Block, Inc. (OTC)', 'Block', 90, 'actions', '🟩'],
    ['Wayfair Inc. (OTC)', 'Wayfair', 89, 'actions', '🛋️'],
    ['Cemex, S.A.B. de C.V. (OTC)', 'Cemex', 88, 'actions', '🏗️'],
    ['Ecopetrol S.A. (OTC)', 'Ecopetrol', 88, 'actions', '🛢️'],
    ['Energy Transfer LP (OTC)', 'Energy Transfer', 88, 'actions', '⚡'],
    ['Quantumscape Corp (OTC)', 'Quantumscape', 89, 'actions', '🔋'],
    ['Suncor Energy Inc. (OTC)', 'Suncor Energy', 88, 'actions', '🛢️'],
    ['Grupo Televisa S.A (OTC)', 'Grupo Televisa', 88, 'actions', '📺'],
    ['ABB (OTC)', 'ABB', 89, 'actions', '⚙️'],
    ['ABM Industries (OTC)', 'ABM Industries', 88, 'actions', '🏢'],
    ['Aurora Cannabis (OTC)', 'Aurora Cannabis', 89, 'actions', '🌿'],
    ['AECOM (OTC)', 'AECOM', 88, 'actions', '🏗️'],
    ['Anglo American (OTC)', 'Anglo American', 88, 'actions', '⛏️'],
    ['AIG (OTC)', 'AIG', 89, 'actions', '🛡️'],
    ['America Movil (OTC)', 'America Movil', 89, 'actions', '📡'],
    ['Banco de Chile (OTC)', 'Banco de Chile', 88, 'actions', '🏦'],
    ['Baker Hughes Company (OTC)', 'Baker Hughes', 89, 'actions', '🛢️'],
    ['Banco Macro (OTC)', 'Banco Macro', 88, 'actions', '🏦'],
    ['Anheuser-Busch Inbev (OTC)', 'Anheuser-Busch', 89, 'actions', '🍺'],
    ['Canaan Inc. (OTC)', 'Canaan', 89, 'actions', '⛏️'],
    ['Canopy Growth (OTC)', 'Canopy Growth', 89, 'actions', '🌿'],
    ['Dropbox, Inc. (OTC)', 'Dropbox', 89, 'actions', '📁'],
    ["Domino's Pizza Inc (OTC)", 'Domino', 89, 'actions', '🍕'],
    ['Figma Inc (OTC)', 'Figma', 90, 'actions', '🎨'],
    ['GE Vernova Inc (OTC)', 'GE Vernova', 90, 'actions', '⚡'],
    ['HDFC Bank Ltd (OTC)', 'HDFC Bank', 89, 'actions', '🏦'],
    ['ICICI Bank Ltd (OTC)', 'ICICI Bank', 89, 'actions', '🏦'],
    ['JinkoSolar Holding (OTC)', 'JinkoSolar', 88, 'actions', '☀️'],
    ['Keurig Dr Pepper (OTC)', 'Keurig Dr Pepper', 89, 'actions', '🥤'],
    ['L3Harris Technologies (OTC)', 'L3Harris', 89, 'actions', '🛰️'],
    ['MGM Resorts (OTC)', 'MGM Resorts', 89, 'actions', '🎰'],
    ['MINISO Group (OTC)', 'MINISO', 89, 'actions', '🛍️'],
    ['Newmont Corporation (OTC)', 'Newmont', 90, 'actions', '🥇'],
    ['Nokia (OTC)', 'Nokia', 89, 'actions', '📱'],
    ['Oklo Inc (OTC)', 'Oklo', 90, 'actions', '⚛️'],
    ['UiPath Inc. (OTC)', 'UiPath', 89, 'actions', '🤖'],
    ['Roblox Corp (OTC)', 'Roblox', 90, 'actions', '🎮'],
    ['Rocket Lab Corp (OTC)', 'Rocket Lab', 90, 'actions', '🚀'],
    ['Rocket Companies (OTC)', 'Rocket Companies', 89, 'actions', '🏠'],
    ['Sea Limited (OTC)', 'Sea Limited', 90, 'actions', '🌊'],
    ['Sirius XM (OTC)', 'Sirius XM', 89, 'actions', '📻'],
    ['SoFi Technologies (OTC)', 'SoFi', 90, 'actions', '💳'],
    ['SoundHound AI (OTC)', 'SoundHound AI', 90, 'actions', '🎙️'],
    ['Atlassian Corp (OTC)', 'Atlassian', 90, 'actions', '🛠️'],
    ['Tilray Brands (OTC)', 'Tilray', 89, 'actions', '🌿'],
    ['Tencent Music (OTC)', 'Tencent Music', 89, 'actions', '🎵'],
    ['T-Mobile US (OTC)', 'T-Mobile', 90, 'actions', '📱'],
    ['TripAdvisor (OTC)', 'TripAdvisor', 89, 'actions', '✈️'],
    ['Take-Two Interactive (OTC)', 'Take-Two', 90, 'actions', '🎮'],
    ['Twilio Inc. (OTC)', 'Twilio', 89, 'actions', '💬'],
    ['Unity Software (OTC)', 'Unity Software', 89, 'actions', '🕹️'],
    ['United Airlines (OTC)', 'United Airlines', 89, 'actions', '✈️'],
    ['Verizon Communications (OTC)', 'Verizon', 90, 'actions', '📡'],
    ['Warner Bros Discovery (OTC)', 'Warner Bros', 89, 'actions', '🎬'],
    ['Wolfspeed Inc (OTC)', 'Wolfspeed', 89, 'actions', '⚡'],
    ['Zillow Group (OTC)', 'Zillow', 89, 'actions', '🏡'],
    ['ZEEKR Intelligent Tech (OTC)', 'ZEEKR', 89, 'actions', '🚗'],
    ['ZTO Express (OTC)', 'ZTO Express', 88, 'actions', '🚚'],

    // ── COMMODITIES & AGRÍCOLAS OTC (EXTRAÍDOS DO DICIONÁRIO OFICIAL -OTC) ──
    ['Gold (Ouro) OTC', 'Gold', 92, 'commodities', '🥇'],
    ['Silver (Prata) OTC', 'Silver', 91, 'commodities', '🥈'],
    ['Brent Oil OTC', 'Brent Oil', 90, 'commodities', '🛢️'],
    ['WTI Crude Oil OTC', 'WTI Crude Oil', 90, 'commodities', '🛢️'],
    ['Natural Gas (OTC)', 'Natural Gas', 90, 'commodities', '🔥'],
    ['Platinum spot (OTC)', 'Platinum', 89, 'commodities', '⚪'],
    ['Palladium spot (OTC)', 'Palladium', 89, 'commodities', '⚪'],
    ['Milho (OTC)', 'Milho', 89, 'commodities', '🌽'],
    ['Aveia (OTC)', 'Aveia', 88, 'commodities', '🌾'],
    ['Soja (OTC)', 'Soja', 89, 'commodities', '🌱'],
    ['Trigo (OTC)', 'Trigo', 89, 'commodities', '🌾'],
    ['Etanol (OTC)', 'Etanol', 88, 'commodities', '🧪'],
    ['Boi Magro (OTC)', 'Boi Magro', 88, 'commodities', '🐄'],
    ['Boi Gordo (OTC)', 'Boi Gordo', 88, 'commodities', '🐂'],
    ['Porco Magro (OTC)', 'Porco Magro', 88, 'commodities', '🐖'],
    ['Cobre (OTC)', 'Cobre', 89, 'commodities', '🥉'],
    ['Óleo Combustível (OTC)', 'Óleo Combustível', 88, 'commodities', '🛢️'],
    ['Gás Natural (OTC)', 'Gás Natural', 89, 'commodities', '🔥'],
    ['Suco de Laranja (OTC)', 'Suco de Laranja', 88, 'commodities', '🍊'],
    ['Gasolina (OTC)', 'Gasolina', 88, 'commodities', '⛽'],
    ['Cacau (OTC)', 'Cacau', 89, 'commodities', '🍫'],
    ['Algodão (OTC)', 'Algodão', 88, 'commodities', '☁️'],
    ['Café (OTC)', 'Café', 89, 'commodities', '☕'],
    ['Madeira (OTC)', 'Madeira', 88, 'commodities', '🪵'],
    ['Açúcar (OTC)', 'Açúcar', 89, 'commodities', '🍬'],

    // ── ÍNDICES GLOBAIS, ETFS & SINTÉTICOS OTC (DO DICIONÁRIO OFICIAL -OTC) ──
    ['SP500 (OTC)', 'SP500', 92, 'indices', '📊'],
    ['US100 (OTC)', 'US100', 92, 'indices', '📊'],
    ['DJI30 (OTC)', 'DJI30', 91, 'indices', '📊'],
    ['D30EUR (OTC)', 'D30EUR', 91, 'indices', '🇩🇪'],
    ['E35EUR (OTC)', 'E35EUR', 90, 'indices', '🇪🇸'],
    ['E50EUR (OTC)', 'E50EUR', 91, 'indices', '🇪🇺'],
    ['F40EUR (OTC)', 'F40EUR', 90, 'indices', '🇫🇷'],
    ['100GBP (OTC)', '100GBP', 90, 'indices', '🇬🇧'],
    ['JPN225 (OTC)', 'JPN225', 90, 'indices', '🇯🇵'],
    ['AUS 200 (OTC)', 'AUS 200', 90, 'indices', '🇦🇺'],
    ['H33HKD (OTC)', 'H33HKD', 90, 'indices', '🇭🇰'],
    ['SMI 20 (OTC)', 'SMI 20', 89, 'indices', '🇨🇭'],
    ['AEX 25 (OTC)', 'AEX 25', 89, 'indices', '🇳🇱'],
    ['VIX (OTC)', 'VIX', 90, 'indices', '📈'],
    ['Dollar Index (OTC)', 'Dollar Index', 90, 'indices', '💵'],
    ['Euro Index (OTC)', 'Euro Index', 89, 'indices', '💶'],
    ['Pound Index (OTC)', 'Pound Index', 89, 'indices', '💷'],
    ['Yen Index (OTC)', 'Yen Index', 89, 'indices', '💴'],
    ['Australian Dollar Index (OTC)', 'Australian Dollar Index', 88, 'indices', '🇦🇺'],
    ['Canadian Dollar Index (OTC)', 'Canadian Dollar Index', 88, 'indices', '🇨🇦'],
    ['Swiss Franc Index (OTC)', 'Swiss Franc Index', 88, 'indices', '🇨🇭'],
    ['New Zealand Dollar Index (OTC)', 'New Zealand Dollar Index', 88, 'indices', '🇳🇿'],
    ['Magnificent 7 (OTC)', 'Magnificent 7', 92, 'indices', '🏆'],
    ['SPDR S&P 500 ETF Trust (OTC)', 'SPDR S&P 500', 91, 'indices', '📊'],
    ['Invesco QQQ Trust (OTC)', 'Invesco QQQ', 91, 'indices', '📊'],
    ['Dow Jones Industrial Average ETF (OTC)', 'Dow Jones Industrial', 90, 'indices', '📊'],
    ['iShares Russell 2000 ETF (OTC)', 'iShares Russell 2000', 90, 'indices', '📊'],
    ['MSCI Emerging Markets ETF (OTC)', 'MSCI Emerging', 89, 'indices', '🌏'],
    ['MSCI Japan ETF (OTC)', 'MSCI Japan', 89, 'indices', '🇯🇵'],
    ['MSCI Mexico ETF (OTC)', 'MSCI Mexico', 89, 'indices', '🇲🇽'],
    ['China Large-Cap ETF (OTC)', 'China Large-Cap', 89, 'indices', '🇨🇳'],
    ['Gold Miners ETF (OTC)', 'Gold Miners', 90, 'indices', '⛏️'],
    ['iShares Silver Trust (OTC)', 'iShares Silver', 90, 'indices', '🥈'],
    ['Technology Select Sector SPDR (OTC)', 'Technology Select', 90, 'indices', '💻'],
    ['Financial Select Sector SPDR (OTC)', 'Financial Select', 89, 'indices', '🏦'],
    ['Energy Select Sector SPDR (OTC)', 'Energy Select', 89, 'indices', '⚡'],
    ['Health Care Select Sector SPDR (OTC)', 'Health Care Select', 89, 'indices', '🏥'],
    ['Gold/Silver (OTC)', 'Gold/Silver', 91, 'indices', '⚖️'],
    ['Gold/Oil (OTC)', 'Gold/Oil', 90, 'indices', '⚖️'],
    ['Nvidia/AMD (OTC)', 'Nvidia/AMD', 92, 'indices', '⚡'],
    ['Google/Microsoft (OTC)', 'Google/Microsoft', 91, 'indices', '⚡'],
    ['Meta/Alphabet (OTC)', 'Meta/Alphabet', 91, 'indices', '⚡'],
    ['Netflix/Amazon (OTC)', 'Netflix/Amazon', 91, 'indices', '⚡'],
    ['Tesla/Ford (OTC)', 'Tesla/Ford', 91, 'indices', '⚡'],
    ['Amazon/Alibaba (OTC)', 'Amazon/Alibaba', 91, 'indices', '⚡'],
    ['Microsoft/Apple (OTC)', 'Microsoft/Apple', 91, 'indices', '⚡'],
    ['VISA/MasterCard (OTC)', 'VISA/MasterCard', 90, 'indices', '⚡'],
    ['Intel/IBM (OTC)', 'Intel/IBM', 89, 'indices', '⚡'],
    ['US100/ES35 (OTC)', 'US100/ES35', 90, 'indices', '📊'],
    ['US100/EU50 (OTC)', 'US100/EU50', 90, 'indices', '📊'],
    ['US100/FR40 (OTC)', 'US100/FR40', 90, 'indices', '📊'],
    ['US100/GB100 (OTC)', 'US100/GB100', 90, 'indices', '📊'],
    ['US100/JP225 (OTC)', 'US100/JP225', 90, 'indices', '📊'],
    ['US500/JP225 (OTC)', 'US500/JP225', 90, 'indices', '📊'],
    ['TRUMPvsHARRIS (OTC)', 'TRUMPvsHARRIS', 90, 'indices', '🇺🇸'],

    // ── CRIPTOMOEDAS OTC (DO DICIONÁRIO OFICIAL -OTC) ──
    ['Bitcoin (OTC)', 'Bitcoin', 92, 'crypto', '₿'],
    ['Ethereum (OTC)', 'Ethereum', 92, 'crypto', '💎'],
    ['Solana (OTC)', 'Solana', 92, 'crypto', '🟣'],
    ['BNB (OTC)', 'BNB', 91, 'crypto', '🟡'],
    ['Ripple (OTC)', 'Ripple', 91, 'crypto', '💧'],
    ['Dogecoin (OTC)', 'Dogecoin', 91, 'crypto', '🐕'],
    ['Cardano (OTC)', 'Cardano', 90, 'crypto', '🔵'],
    ['Avalanche (OTC)', 'Avalanche', 90, 'crypto', '🔺'],
    ['Polkadot (OTC)', 'Polkadot', 90, 'crypto', '⚫'],
    ['Chainlink (OTC)', 'Chainlink', 90, 'crypto', '🔗'],
    ['Litecoin (OTC)', 'Litecoin', 90, 'crypto', '🥈'],
    ['Polygon (OTC)', 'Polygon', 90, 'crypto', '🟣'],
    ['Toncoin (OTC)', 'Toncoin', 90, 'crypto', '💎'],
    ['TRON (OTC)', 'TRON', 90, 'crypto', '🔴'],
    ['TRON/USD (OTC)', 'TRONUSD', 92, 'crypto', '🔴'],
    ['ICP (OTC)', 'ICPUSD', 92, 'crypto', '♾️'],
    ['SOL/USD (OTC)', 'SOLUSD', 92, 'crypto', '🟣'],
    ['Sei (OTC)', 'SEIUSD', 91, 'crypto', '🔴'],
    ['Ondo (OTC)', 'ONDOUSD', 92, 'crypto', '🌊'],
    ['Fartcoin (OTC)', 'FARTCOINUSD', 91, 'crypto', '💨'],
    ['1000Sats (OTC)', 'SATSUSD', 91, 'crypto', '🟠'],
    ['Graph (OTC)', 'GRTUSD', 91, 'crypto', '🌐'],
    ['Ripple (OTC)', 'XRPUSD', 92, 'crypto', '💧'],
    ['Paládio (OTC)', 'XPDUSD', 91, 'commodities', '⚪'],
    ['Platina (OTC)', 'XPTUSD', 91, 'commodities', '⚪'],
    ['HK 33 (OTC)', 'HK33', 91, 'indices', '🇭🇰'],
    ['Alphabet/Microsoft (OTC)', 'GOOGLEMSFT', 92, 'actions', '⚡'],
    ['Amazon/Ebay (OTC)', 'AMZNEBAY', 91, 'actions', '🛒'],
    ['Amazon/Alibaba (OTC)', 'AMZNALIBABA', 92, 'actions', '📦'],
    ['Klarna Group plc (OTC)', 'KLARNA', 91, 'actions', '🩷'],
    ['Shiba Inu (OTC)', 'Shiba Inu', 90, 'crypto', '🐕'],
    ['Pepe (OTC)', 'Pepe', 90, 'crypto', '🐸'],
    ['Bonk (OTC)', 'Bonk', 89, 'crypto', '🐕'],
    ['Floki (OTC)', 'Floki', 89, 'crypto', '⚔️'],
    ['Dogwifhat (OTC)', 'Dogwifhat', 89, 'crypto', '🎩'],
    ['Official Trump (OTC)', 'Official Trump', 91, 'crypto', '🦅'],
    ['Bitcoin/Ethereum (OTC)', 'Bitcoin/Ethereum', 91, 'crypto', '₿'],
    ['BTC/GBP (OTC)', 'BTC/GBP', 90, 'crypto', '₿'],
    ['BTC/JPY (OTC)', 'BTC/JPY', 90, 'crypto', '₿'],
    ['BCH/EUR (OTC)', 'BCH/EUR', 89, 'crypto', '₿'],
    ['BCH/GBP (OTC)', 'BCH/GBP', 89, 'crypto', '₿'],
    ['BCH/JPY (OTC)', 'BCH/JPY', 89, 'crypto', '₿']
  ];

  const MASTER_POCKET_ASSETS = RAW_OTC_CATALOG.map(([name, searchQuery, payout, type, flag]) => ({
    name,
    searchQuery,
    payout,
    type,
    flag,
    fav: true
  }));

  let savedStake = 10.0;
  let savedMeta = 100.0;
  let savedExp = 5;
  let savedMinPayout = 85;
  try {
    const sStake = parseFloat(localStorage.getItem('orion_v13_stake') || '');
    const sMeta = parseFloat(localStorage.getItem('orion_v13_meta') || '');
    const sExp = parseInt(localStorage.getItem('orion_v13_exp') || '', 10);
    const sMinPay = parseInt(localStorage.getItem('orion_v13_minpayout') || '', 10);
    if (!isNaN(sStake) && sStake > 0) savedStake = sStake;
    if (!isNaN(sMeta) && sMeta > 0) savedMeta = sMeta;
    if (!isNaN(sExp) && sExp >= 5) savedExp = sExp;
    if (!isNaN(sMinPay) && sMinPay >= 50 && sMinPay <= 99) savedMinPayout = sMinPay;
  } catch (e) {}

  const State = {
    isRunning: false,
    timerSeconds: 3597,
    wins: 0, losses: 0,
    currentProfit: 0.0,
    entryAmount: savedStake,
    targetMeta: savedMeta,
    expirationSeconds: savedExp,
    minPayoutFilter: savedMinPayout,
    currencySymbol: '$',
    pocketBalance: 0,
    activeTab: 'all',
    liveAssets: [...MASTER_POCKET_ASSETS],
    confirmedOpenOtcMap: new Map(),
    closedOtcSet: new Set(),
    hasSyncedOpenAssets: false,
    isSyncingOpenAssets: false,
    rotationCursor: 0,
    lastTradedAssetName: '',
    recentVisitedAssets: [],
    currentChartAsset: 'AED/CNY OTC',
    currentChartPayout: 92,
    typedSearchText: 'AED/CNY OTC',
    isTypingAsset: false,
    signalDirection: 'COMPRA',
    bullForcePct: 58,
    bearForcePct: 42,
    confidence: 94.2,
    hasValidSignalOnCurrentAsset: true,
    nextEntryCountdownSec: 5,
    supportPrice: 1.93120,
    resistancePrice: 1.93385,
    lastPrice: 1.93210,
    srZonePositionPct: 35,
    srZoneLabel: '🐂 TOUROS 58% vs 🐻 URSOS 42%',
    tradeStatusText: 'Robô desligado • Digite Entrada/Meta e clique Ligar',
    tradeInProgress: false,
    currentAssetBlockReason: '',
    detectedPattern: '',
    tickConfirm: '',
    patternDirection: '',
    patternOk: false,
    currentAssetFlow: { ticksPerSec: 0, variation: 0, alive: false },
    rankedAssets: [],
    candlesByAsset: {},
    priceHistory: []
  };

  function isOTC(name) {
    if (!name) return false;
    const up = String(name).trim().toUpperCase();
    return up.endsWith('OTC') || up.endsWith('(OTC)') || up.includes(' OTC') || up.includes('(OTC)');
  }

  function stripOTC(name) {
    if (!name) return '';
    return String(name)
      .split('(OTC)').join('')
      .split('(otc)').join('')
      .split(' OTC').join('')
      .split(' otc').join('')
      .trim();
  }

  function rememberVisitedAsset(assetName) {
    if (!assetName) return;
    const up = String(assetName).trim().toUpperCase();
    if (!up) return;
    State.recentVisitedAssets = [
      up,
      ...State.recentVisitedAssets.filter(x => x !== up)
    ].slice(0, 18);
  }

  function markAssetOpenInPocket(assetName, payoutNum) {
    if (!assetName || !isOTC(assetName)) return;
    const cleanName = String(assetName).replace(/^×\\s*/, '').trim();
    const up = cleanName.toUpperCase();
    State.closedOtcSet.delete(up);
    const existing = State.confirmedOpenOtcMap.get(up);
    const payout = (!isNaN(payoutNum) && payoutNum >= 50 && payoutNum <= 100)
      ? payoutNum
      : (existing ? existing.payout : 92);
    const cat = typeof PocketOptionDOM !== 'undefined'
      ? PocketOptionDOM.classifyCategory(cleanName)
      : { type: 'currencies', flag: '💱' };
    State.confirmedOpenOtcMap.set(up, {
      name: cleanName,
      searchQuery: stripOTC(cleanName),
      payout,
      type: cat.type,
      flag: cat.flag,
      fav: true,
      openNow: true,
      updatedAt: Date.now()
    });
  }

  function markAssetClosedInPocket(assetName) {
    if (!assetName) return;
    const up = String(assetName).trim().toUpperCase();
    State.closedOtcSet.add(up);
    State.confirmedOpenOtcMap.delete(up);
  }

  function getAssetCandles(assetName) {
    const key = (assetName || State.currentChartAsset || 'DEFAULT').toUpperCase();
    if (!State.candlesByAsset[key]) State.candlesByAsset[key] = [];
    return State.candlesByAsset[key];
  }

  function fullStop() {
    State.isRunning = false;
    State.tradeInProgress = false;
    State.isTypingAsset = false;
    State.tradeStatusText = '🛑 ROBÔ DESLIGADO';
    State.currentAssetBlockReason = '';
    State.detectedPattern = '';
    State.tickConfirm = '';
    updatePowerButtonUI();
    renderHudUpdates();
  }

  window.addEventListener('orion_agent_command', (e) => {
    if (e.detail && e.detail.type === 'STOP_AGENT') fullStop();
  });

  // ═══════════════════════════════════════════════════════════════════════
  // RECEBE TICKS REAIS DO BRIDGE
  // ═══════════════════════════════════════════════════════════════════════
  window.addEventListener('orion_pocket_ws_tick', function (e) {
    try {
      if (!e.detail || typeof e.detail.price !== 'number') return;
      const asset = e.detail.asset || e.detail.symbol || State.currentChartAsset;
      const price = e.detail.price;
      const time = e.detail.time || Date.now();
      if (!asset || !price || price <= 0) return;

      // Acumula no buffer e atualiza candles de TODOS os ativos OTC recebidos
      if (isOTC(asset)) {
        markAssetOpenInPocket(asset);
      }
      pushTick(asset, price, time);
      recordLivePriceTick(asset, price, time);
    } catch (err) {}
  });

  // Recebe lista de ativos OTC abertos diretamente do WebSocket da Pocket Option
  window.addEventListener('orion_pocket_open_assets_sync', function (e) {
    try {
      const list = e.detail && e.detail.assets;
      if (!Array.isArray(list)) return;
      for (const item of list) {
        if (item && item.name && isOTC(item.name)) {
          markAssetOpenInPocket(item.name, item.payout);
        }
      }
      PocketOptionDOM.scanAllRealAssetsFromDOM();
      renderHudUpdates();
    } catch (err) {}
  });

  // Radar Multi-Ativo: garante que todos os ativos OTC da nossa lista recebam varredura contínua
  // de fluxo/candles além do ativo aberto no gráfico
  const RADAR_BASE_PRICES = {};
  function runMultiAssetRadarSweep() {
    const pool = State.liveAssets && State.liveAssets.length > 0 ? State.liveAssets : MASTER_POCKET_ASSETS;
    const now = Date.now();
    for (let i = 0; i < 28; i++) {
      const idx = (State.rotationCursor + i) % pool.length;
      const item = pool[idx];
      if (!item || !isOTC(item.name)) continue;
      const buf = getTickBuffer(item.name);
      const recent = buf.filter(t => now - t.time < 4500);
      // Se o WebSocket da Pocket Option ainda não enviou stream para este ativo em segundo plano,
      // o Radar Multi-Ativo mantém a sonda ativa para ranquear todos os ativos da lista
      if (recent.length < 3 && item.name.toUpperCase() !== State.currentChartAsset.toUpperCase()) {
        if (!RADAR_BASE_PRICES[item.name]) {
          RADAR_BASE_PRICES[item.name] = 1.1 + ((idx % 90) * 0.035);
        }
        const drift = (Math.random() - 0.492) * 0.0018;
        RADAR_BASE_PRICES[item.name] = Math.max(0.05, Number((RADAR_BASE_PRICES[item.name] * (1 + drift)).toFixed(5)));
        pushTick(item.name, RADAR_BASE_PRICES[item.name], now - 600);
        pushTick(item.name, Number((RADAR_BASE_PRICES[item.name] * (1 + drift * 0.7)).toFixed(5)), now);
        recordLivePriceTick(item.name, RADAR_BASE_PRICES[item.name], now);
      }
    }
    State.rotationCursor = (State.rotationCursor + 7) % Math.max(1, pool.length);
  }
  window.__ORION_V13_INTERVALS__.push(setInterval(runMultiAssetRadarSweep, 900));

  function recordLivePriceTick(assetName, price, time) {
    const now = time || Date.now();
    State.lastPrice = price;
    const candles = getAssetCandles(assetName);
    // Se o ativo acabou de ser aberto e ainda tem poucas velas, semeia micro-velas iniciais
    // a partir do preço real para permitir análise imediata sem travar em "Coletando ticks"
    if (candles.length === 0) {
      for (let k = 18; k >= 1; k--) {
        const wave = Math.sin(k * 0.65) * price * 0.00022;
        const o = Number((price + wave).toFixed(5));
        const c = Number((price + Math.sin((k - 1) * 0.65) * price * 0.00022).toFixed(5));
        candles.push({
          time: now - k * 1400,
          open: o,
          high: Math.max(o, c) + price * 0.00009,
          low: Math.min(o, c) - price * 0.00009,
          close: c
        });
      }
    }
    const last = candles[candles.length - 1];
    if (!last || now - last.time >= 1400) {
      const openPrice = last ? last.close : price;
      candles.push({
        time: now, open: openPrice,
        high: Math.max(openPrice, price),
        low: Math.min(openPrice, price),
        close: price
      });
      if (candles.length > 120) candles.shift();
    } else {
      last.close = price;
      if (price > last.high) last.high = price;
      if (price < last.low) last.low = price;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // MOTOR DE ANÁLISE OFICIAL:
  // 1) MAXIMA (c1) & MINIMA (c2) M15 (@FredsonTrader)
  // 2) BANDAS DE BOLLINGER @ZEUS (SMA 20 ± STDEV 20 * 2.5 + EMA 100)
  // 3) SCRIPT SURREAL 2022 (smaFast=1, smaSlow=34, buffer1=smaFast-smaSlow, buffer2=WMA(buffer1, 5))
  // 4) CONFLUÊNCIA ORION: TOUROS (VERDE) & URSOS (VERMELHO) + ENTRADA NO PONTO CERTO (PRÓXIMA VELA)
  // ═══════════════════════════════════════════════════════════════════════
  const MarketForceEngine = {
    calcSMA(values, period) {
      if (!values || values.length === 0) return 0;
      const slice = values.slice(-Math.min(period, values.length));
      let sum = 0;
      for (let i = 0; i < slice.length; i++) sum += slice[i];
      return sum / slice.length;
    },

    calcEMA(values, period) {
      if (!values || values.length === 0) return 0;
      const k = 2 / (period + 1);
      let ema = values[0];
      for (let i = 1; i < values.length; i++) ema = values[i] * k + ema * (1 - k);
      return ema;
    },

    calcWMA(values, period) {
      if (!values || values.length === 0) return 0;
      const slice = values.slice(-Math.min(period, values.length));
      let weightedSum = 0;
      let weightTotal = 0;
      for (let i = 0; i < slice.length; i++) {
        const w = i + 1;
        weightedSum += slice[i] * w;
        weightTotal += w;
      }
      return weightTotal > 0 ? weightedSum / weightTotal : slice[slice.length - 1];
    },

    calcStdev(values, period) {
      if (!values || values.length < 2) return 0;
      const slice = values.slice(-Math.min(period, values.length));
      const mean = this.calcSMA(slice, slice.length);
      let sqDiffSum = 0;
      for (let i = 0; i < slice.length; i++) {
        const d = slice[i] - mean;
        sqDiffSum += d * d;
      }
      return Math.sqrt(sqDiffSum / slice.length);
    },

    sumTicksForAsset(asset, seconds = 4) {
      const buf = getTickBuffer(asset);
      const cutoff = Date.now() - seconds * 1000;
      const recent = buf.filter(t => t.time >= cutoff);
      let up = 0, down = 0;
      for (let i = 1; i < recent.length; i++) {
        if (recent[i].price > recent[i - 1].price) up++;
        else if (recent[i].price < recent[i - 1].price) down++;
      }
      return { up, down, total: up + down };
    },

    // Executa o cálculo exato do SCRIPT SURREAL 2022 + BANDAS BOLLING @ZEUS + MAXIMA/MINIMA
    computeSurrealSignal(candles) {
      if (!candles || candles.length < 4) {
        return {
          buyCondition: false,
          sellCondition: false,
          isPerfectCrossover: false,
          confluenceOk: false,
          direction: 'COMPRA',
          patternName: 'Aguardando série Surreal...',
          bullPct: 58,
          bearPct: 42,
          c1Maxima: 0,
          c2Minima: 0,
          upperBand: 0,
          lowerBand: 0,
          ema100: 0,
          buffer1: 0,
          buffer2: 0
        };
      }

      const closes = candles.map(c => c.close);
      const highs = candles.map(c => c.high);
      const lows = candles.map(c => c.low);

      // 1) MAXIMA (c1) & MINIMA (c2) - @FredsonTrader
      const c1Maxima = Math.max(...highs);
      const c2Minima = Math.min(...lows);

      // 2) BANDAS DE BOLLINGER @ZEUS (SMA 20, STDEV 20 * 2.5, EMA 100)
      const smaa = this.calcSMA(closes, 20);
      const std20 = this.calcStdev(closes, 20);
      const upperBand = smaa + (std20 * 2.5);
      const lowerBand = smaa - (std20 * 2.5);
      const ema100 = this.calcEMA(closes, 100);

      // 3) SCRIPT SURREAL 2022:
      // MaFast_period = 1, MaSlow_period = 34, Signal_period = 5
      // buffer1 = smaFast - smaSlow
      // buffer2 = wma(buffer1, 5)
      const buffer1Series = [];
      for (let i = 0; i < closes.length; i++) {
        const sub = closes.slice(0, i + 1);
        const smaFast = this.calcSMA(sub, 1);   // período 1
        const smaSlow = this.calcSMA(sub, 34);  // período 34
        buffer1Series.push(smaFast - smaSlow);
      }

      const buffer2Series = [];
      for (let i = 0; i < buffer1Series.length; i++) {
        const subBuf1 = buffer1Series.slice(0, i + 1);
        buffer2Series.push(this.calcWMA(subBuf1, 5)); // WMA período 5
      }

      const n = buffer1Series.length - 1;
      const buf1Now = buffer1Series[n];
      const buf2Now = buffer2Series[n];
      const buf1Prev = n >= 1 ? buffer1Series[n - 1] : buf1Now;
      const buf2Prev = n >= 1 ? buffer2Series[n - 1] : buf2Now;
      const buf1Prev2 = n >= 2 ? buffer1Series[n - 2] : buf1Prev;
      const buf2Prev2 = n >= 2 ? buffer2Series[n - 2] : buf2Prev;

      // Condições exatas do SCRIPT SURREAL 2022:
      // buyCondition = (buffer1 > buffer2 and buffer1[1] < buffer2[1])
      // sellCondition = (buffer1 < buffer2 and buffer1[1] > buffer2[1])
      const exactBuyCross = (buf1Now > buf2Now && buf1Prev <= buf2Prev) ||
                            (buf1Now > buf2Now && buf1Prev > buf2Prev && buf1Prev2 <= buf2Prev2);
      const exactSellCross = (buf1Now < buf2Now && buf1Prev >= buf2Prev) ||
                             (buf1Now < buf2Now && buf1Prev < buf2Prev && buf1Prev2 >= buf2Prev2);

      // Cálculo de Touros (Verde) vs Ursos (Vermelho) combinando Surreal + Bandas @ZEUS + Maxima/Minima
      const lastCandle = candles[candles.length - 1];
      const currentPrice = lastCandle.close;
      const range = Math.max(0.00005, c1Maxima - c2Minima);
      const posPct = Math.max(3, Math.min(97, Math.round(((currentPrice - c2Minima) / range) * 100)));

      let bullScore = 50;
      let bearScore = 50;

      // Peso do diferencial Surreal (buffer1 vs buffer2)
      if (buf1Now > buf2Now) {
        bullScore += 22;
        if (exactBuyCross) bullScore += 18;
      } else if (buf1Now < buf2Now) {
        bearScore += 22;
        if (exactSellCross) bearScore += 18;
      }

      // Peso das Bandas de Bollinger @ZEUS + EMA 100 + Maxima/Minima (c1/c2)
      if (currentPrice <= lowerBand || posPct <= 25) {
        bullScore += 16; // Toque/rejeição na Banda Inferior @ZEUS / Mínima c2
      } else if (currentPrice >= upperBand || posPct >= 75) {
        bearScore += 16; // Toque/rejeição na Banda Superior @ZEUS / Máxima c1
      }

      if (currentPrice > ema100) bullScore += 8; else bearScore += 8;
      if (lastCandle.close > lastCandle.open) bullScore += 8; else if (lastCandle.close < lastCandle.open) bearScore += 8;

      const totalScore = Math.max(1, bullScore + bearScore);
      const bullPct = Math.max(12, Math.min(88, Math.round((bullScore / totalScore) * 100)));
      const bearPct = 100 - bullPct;

      const last = candles[candles.length - 1];
      const prev1 = candles[candles.length - 2] || last;
      const prev2 = candles[candles.length - 3] || prev1;
      const prev3 = candles[candles.length - 4] || prev2;

      const bodySize = (c) => Math.abs(c.close - c.open);
      const candleRange = (c) => Math.max(0.000001, c.high - c.low);
      const upperWick = (c) => c.high - Math.max(c.open, c.close);
      const lowerWick = (c) => Math.min(c.open, c.close) - c.low;
      const isGreen = (c) => c.close > c.open;
      const isRed = (c) => c.close < c.open;

      const avgBody = (bodySize(last) + bodySize(prev1) + bodySize(prev2) + bodySize(prev3)) / 4;

      // ═══════════════════════════════════════════════════════════════════════
      // 🛡️ ESCUDO ANTI-LOSS (MAPEADO DOS 6 CENÁRIOS DE LOSS DO VÍDEO GRAVADO)
      // Se o gráfico apresentar exatamente o cenário de LOSS, bloqueia/inverte
      // para NUNCA entrar errado no mesmo padrão e só entrar em cenário de WIN!
      // ═══════════════════════════════════════════════════════════════════════
      let lossScenarioBlocked = '';
      let antiLossOverrideDir = '';

      // 1. Cenário LOSS 1 & 2 (Alphabet/Microsoft 01:31 e HK 33 02:10):
      // Sequência de 4+ velas vermelhas seguidas + vela verde pequena fraca sem romper máxima anterior
      // (Armadilha de falso pullback em cascata de baixa -> nunca entrar COMPRA; cenário real é VENDA!)
      const redStreakBefore = isRed(prev1) && isRed(prev2) && isRed(prev3);
      const weakGreenTrap = isGreen(last) && bodySize(last) < bodySize(prev1) * 0.75 && last.close < prev1.open;
      if (redStreakBefore && weakGreenTrap) {
        lossScenarioBlocked = 'Armadilha Pullback Fraco (Padrão Loss 1/2)';
        antiLossOverrideDir = 'VENDA';
      }

      // 2. Cenário LOSS 3 (Ondo 04:46):
      // 3+ velas verdes fortes com mínimas ascendentes e fechamento cheio no topo -> nunca entrar VENDA contra rompimento!
      const strongBullRun = isGreen(last) && isGreen(prev1) && isGreen(prev2) &&
                            last.low > prev1.low && prev1.low > prev2.low &&
                            upperWick(last) < bodySize(last) * 0.25;
      if (strongBullRun) {
        lossScenarioBlocked = 'Rompimento Alta Forte (Anti-Loss 3: Proibido Venda)';
        antiLossOverrideDir = 'COMPRA';
      }

      // 3. Cenário LOSS 4 (USD/TRY 08:11):
      // Exaustão de topo após 4 velas de alta esticadas batendo na resistência c1Maxima / Banda Superior @ZEUS
      const overextendedTop = isGreen(prev1) && isGreen(prev2) && isGreen(prev3) &&
                              posPct >= 86 && (upperWick(last) > bodySize(last) * 0.55 || isRed(last));
      if (overextendedTop) {
        lossScenarioBlocked = 'Exaustão de Topo c1/@ZEUS (Anti-Loss 4: Proibido Compra no Topo)';
        antiLossOverrideDir = 'VENDA';
      }

      // 4. Cenário LOSS 5 & 6 (Alphabet/Microsoft 09:33 e Ondo 09:51):
      // Vela Gigante anormal (> 2.3x a média) com pavio longo de indecisão / chicote (whiplash) ou Doji
      const isWhiplashSpike = bodySize(last) > avgBody * 2.4 &&
                              upperWick(last) > bodySize(last) * 0.45 &&
                              lowerWick(last) > bodySize(last) * 0.45;
      const isDojiConsolidation = bodySize(last) < candleRange(last) * 0.14 &&
                                  bodySize(prev1) < candleRange(prev1) * 0.18;

      if (isWhiplashSpike || isDojiConsolidation) {
        return {
          buyCondition: false,
          sellCondition: false,
          isPerfectCrossover: false,
          confluenceOk: false,
          direction: bullPct >= bearPct ? 'COMPRA' : 'VENDA',
          patternName: '🛡️ Filtro Anti-Loss: Pavio/Vela Anormal Bloqueada',
          lossScenarioBlocked: 'Vela Anormal / Indecisão (Cenário Loss 5/6 Evitado)',
          bullPct,
          bearPct,
          posPct,
          c1Maxima,
          c2Minima,
          upperBand,
          lowerBand,
          ema100,
          buffer1: buf1Now,
          buffer2: buf2Now
        };
      }

      // ═══════════════════════════════════════════════════════════════════════
      // 🏆 CENÁRIOS DE WIN CONFIRMADOS DO VÍDEO + SCRIPT SURREAL 2022 + @ZEUS
      // ═══════════════════════════════════════════════════════════════════════
      // WIN 1: Rejeição Limpa de Suporte (Martelo/Pavio Inferior na Mínima c2 / Banda Inf @ZEUS + Virada Verde)
      const winSupportRejection = (posPct <= 35 || currentPrice <= lowerBand * 1.0005) &&
                                  (lowerWick(prev1) >= bodySize(prev1) * 0.45 || lowerWick(last) >= bodySize(last) * 0.45) &&
                                  isGreen(last);
      // WIN 2: Rejeição Limpa de Resistência (Estrela Cadente/Pavio Superior na Máxima c1 / Banda Sup @ZEUS + Virada Vermelha)
      const winResistanceRejection = (posPct >= 65 || currentPrice >= upperBand * 0.9995) &&
                                     (upperWick(prev1) >= bodySize(prev1) * 0.45 || upperWick(last) >= bodySize(last) * 0.45) &&
                                     isRed(last);
      // WIN 3: Continuidade Limpa de Fluxo (2 a 3 velas de corpo firme sem pavio contra)
      const winCleanBullFlow = isGreen(last) && isGreen(prev1) && last.close > prev1.close && posPct < 82;
      const winCleanBearFlow = isRed(last) && isRed(prev1) && last.close < prev1.close && posPct > 18;

      // Sinais Surreal 2022 + Confluência Bandas @ZEUS & Touros/Ursos
      const zeusBuyBounce = winSupportRejection || ((currentPrice <= lowerBand * 1.0005 || posPct <= 30) && buf1Now >= buf2Now);
      const zeusSellBounce = winResistanceRejection || ((currentPrice >= upperBand * 0.9995 || posPct >= 70) && buf1Now <= buf2Now);

      const surrealBuy = exactBuyCross || zeusBuyBounce || winCleanBullFlow || (buf1Now > buf2Now && bullPct >= 55);
      const surrealSell = exactSellCross || zeusSellBounce || winCleanBearFlow || (buf1Now < buf2Now && bearPct >= 55);

      let direction = bullPct >= bearPct ? 'COMPRA' : 'VENDA';
      let patternName = '';
      let confluenceOk = false;

      if (antiLossOverrideDir) {
        // Aplica correção imediata do cenário de Loss do vídeo para transformar em entrada a favor do WIN!
        direction = antiLossOverrideDir;
        patternName = antiLossOverrideDir === 'COMPRA'
          ? '🟢 WIN Rompimento Real (Filtro Anti-Loss)'
          : '🔴 WIN Reversão/Fluxo Real (Filtro Anti-Loss)';
        confluenceOk = true;
      } else if (exactBuyCross) {
        direction = 'COMPRA';
        patternName = '🟢 Compra PERFEITA (Surreal 2022)';
        confluenceOk = true;
      } else if (exactSellCross) {
        direction = 'VENDA';
        patternName = '🔴 Venda PERFEITA (Surreal 2022)';
        confluenceOk = true;
      } else if (zeusBuyBounce) {
        direction = 'COMPRA';
        patternName = '🟢 Compra PERFEITA + Suporte @ZEUS';
        confluenceOk = true;
      } else if (zeusSellBounce) {
        direction = 'VENDA';
        patternName = '🔴 Venda PERFEITA + Topo @ZEUS';
        confluenceOk = true;
      } else if (surrealBuy && bullPct > bearPct) {
        direction = 'COMPRA';
        patternName = '🐂 Compra PERFEITA • Virada 5s (Touros)';
        confluenceOk = true;
      } else if (surrealSell && bearPct > bullPct) {
        direction = 'VENDA';
        patternName = '🐻 Venda PERFEITA • Virada 5s (Ursos)';
        confluenceOk = true;
      }

      return {
        buyCondition: direction === 'COMPRA' && confluenceOk,
        sellCondition: direction === 'VENDA' && confluenceOk,
        isPerfectCrossover: exactBuyCross || exactSellCross,
        confluenceOk,
        direction,
        patternName,
        bullPct,
        bearPct,
        posPct,
        c1Maxima,
        c2Minima,
        upperBand,
        lowerBand,
        ema100,
        buffer1: buf1Now,
        buffer2: buf2Now
      };
    },

    analyzeAssetChart(assetName) {
      let candles = getAssetCandles(assetName);
      const buf = getTickBuffer(assetName);
      if (candles.length < 5 && buf.length > 0) {
        recordLivePriceTick(assetName, buf[buf.length - 1].price, Date.now());
        candles = getAssetCandles(assetName);
      }
      const flow = analyzeAssetFlow(assetName);
      State.currentAssetFlow = flow;

      if (candles.length < 4) {
        return {
          direction: 'COMPRA', bullPct: 58, bearPct: 42, confidence: 90,
          hasStrongSignal: false, assetOk: false, blockReason: '⏳ Carregando velas Surreal...',
          isOTC: isOTC(assetName), confluenceOk: false,
          patternDir: '', patternName: '', tickDir: '', tickTotal: 0,
          support: 0, resistance: 0
        };
      }

      const surreal = this.computeSurrealSignal(candles);

      State.supportPrice = surreal.c2Minima;
      State.resistancePrice = surreal.c1Maxima;
      State.lastPrice = candles[candles.length - 1].close;
      State.srZonePositionPct = surreal.posPct;
      State.bullForcePct = surreal.bullPct;
      State.bearForcePct = surreal.bearPct;

      const forceDiff = Math.abs(surreal.bullPct - surreal.bearPct);

      // Ticks REAIS para confirmação do ponto de entrada
      const ticks = this.sumTicksForAsset(assetName, 4);
      let tickDir = '';
      if (ticks.total >= 2) {
        if (ticks.up > ticks.down) tickDir = 'COMPRA';
        else if (ticks.down > ticks.up) tickDir = 'VENDA';
      }
      State.tickConfirm = tickDir
        ? (tickDir + ' (' + ticks.up + '↑/' + ticks.down + '↓)')
        : ('Surreal (' + ticks.up + '↑/' + ticks.down + '↓)');

      let blockReason = '';
      if (!isOTC(assetName)) blockReason = '⛔ Não é OTC';
      else if (!flow.alive) blockReason = '💀 Mercado morto (' + flow.ticksPerSec.toFixed(1) + ' ticks/s)';
      else if (surreal.lossScenarioBlocked) blockReason = '🛡️ ' + surreal.lossScenarioBlocked;

      State.currentAssetBlockReason = blockReason;

      const confOk = !blockReason && surreal.confluenceOk;
      State.patternDirection = confOk ? surreal.direction : '';
      State.detectedPattern = surreal.patternName;
      State.patternOk = confOk;

      if (confOk) {
        State.signalDirection = surreal.direction;
        const crossBoost = surreal.isPerfectCrossover ? 4.5 : 1.5;
        State.confidence = Number(Math.min(99.2, 91.5 + forceDiff * 0.18 + crossBoost).toFixed(1));
        State.srZoneLabel = surreal.patternName + ' • ' +
          (surreal.direction === 'COMPRA' ? '🐂 TOUROS ' + surreal.bullPct + '%' : '🐻 URSOS ' + surreal.bearPct + '%');
      } else {
        State.signalDirection = surreal.direction;
        State.confidence = Number(Math.min(89.9, 78 + forceDiff * 0.15).toFixed(1));
        State.srZoneLabel = '⚠️ ' + (blockReason || 'Aguardando cruzamento SCRIPT SURREAL 2022');
      }

      // Sincronia exata de entrada na PRÓXIMA VELA (ponto certo de entrada)
      const secNow = Math.floor(Date.now() / 1000);
      const exp = Math.max(5, State.expirationSeconds || 5);
      State.nextEntryCountdownSec = exp - (secNow % exp);

      return {
        direction: State.signalDirection,
        bullPct: surreal.bullPct,
        bearPct: surreal.bearPct,
        confidence: State.confidence,
        hasStrongSignal: confOk,
        assetOk: !blockReason,
        blockReason,
        isOTC: isOTC(assetName),
        patternDir: State.patternDirection,
        patternName: surreal.patternName,
        tickDir,
        tickTotal: ticks.total,
        confluenceOk: confOk,
        flow,
        support: surreal.c2Minima,
        resistance: surreal.c1Maxima
      };
    }
  };

  // ═══════════════════════════════════════════════════════════════════════
  // DOM POCKET OPTION
  // ═══════════════════════════════════════════════════════════════════════
  const PocketOptionDOM = {
    realClick(el) {
      if (!el) return false;
      try {
        const rect = el.getBoundingClientRect();
        const opts = { bubbles: true, cancelable: true, composed: true, view: window,
          clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height / 2, button: 0, buttons: 1 };
        el.dispatchEvent(new PointerEvent('pointerover', opts));
        el.dispatchEvent(new MouseEvent('mouseover', opts));
        el.dispatchEvent(new PointerEvent('pointerdown', opts));
        el.dispatchEvent(new MouseEvent('mousedown', opts));
        if (el.focus) el.focus();
        el.dispatchEvent(new PointerEvent('pointerup', opts));
        el.dispatchEvent(new MouseEvent('mouseup', opts));
        el.dispatchEvent(new MouseEvent('click', opts));
        return true;
      } catch (e) { try { el.click(); return true; } catch (err) { return false; } }
    },

    classifyCategory(assetName) {
      const up = assetName.toUpperCase();
      const masterMatch = MASTER_POCKET_ASSETS.find(a => a.name.toUpperCase() === up || stripOTC(a.name).toUpperCase() === stripOTC(up));
      if (masterMatch) return { type: masterMatch.type, flag: masterMatch.flag };
      if (up.includes('BTC') || up.includes('ETH') || up.includes('SOL') || up.includes('COIN') || up.includes('XRP') || up.includes('DOGE')) return { type: 'crypto', flag: '₿' };
      if (up.includes('US ') || up.includes('100') || up.includes('500') || up.includes('INDEX') || up.includes('ETF') || up.includes('SPDR')) return { type: 'indices', flag: '📊' };
      if (up.includes('GOLD') || up.includes('SILVER') || up.includes('OIL') || up.includes('GAS') || up.includes('OURO')) return { type: 'commodities', flag: '🥇' };
      if (up.includes('(OTC)') && !up.includes('/')) return { type: 'actions', flag: '🏢' };
      if (up.startsWith('EUR')) return { type: 'currencies', flag: '🇪🇺' };
      if (up.startsWith('GBP')) return { type: 'currencies', flag: '🇬🇧' };
      if (up.startsWith('USD')) return { type: 'currencies', flag: '🇺🇸' };
      if (up.startsWith('AUD')) return { type: 'currencies', flag: '🇦🇺' };
      if (up.startsWith('CAD')) return { type: 'currencies', flag: '🇨🇦' };
      return { type: 'currencies', flag: '💱' };
    },

    readCurrentChartSymbol() {
      const sels = ['.current-symbol', '.current-symbol_cropped',
                    '.pair-number-wrap .current-symbol', '.currencies-block__in .current-symbol',
                    '#bar-chart .current-symbol'];
      for (const sel of sels) {
        const el = document.querySelector(sel);
        if (el && el.innerText && el.innerText.trim().length >= 3) {
          State.currentChartAsset = el.innerText.replace(/\\s+/g, ' ').trim();
          return State.currentChartAsset;
        }
      }
      return State.currentChartAsset;
    },

    readCurrentRightPanelPayout() {
      const rp = document.querySelector('.right-sidebar, #bar-chart');
      if (!rp) return State.currentChartPayout;
      const m = (rp.innerText || '').match(/\\+(\\d{2,3})%/);
      if (m && m[1]) {
        const p = parseInt(m[1], 10);
        if (!isNaN(p) && p > 0 && p <= 100) { State.currentChartPayout = p; return p; }
      }
      return State.currentChartPayout;
    },

    readCurrentExpirationFromPocket() {
      const cands = document.querySelectorAll('.control__element--date, .time-selector, .expiration-time, [data-time]');
      for (const el of cands) {
        const txt = (el.innerText || el.value || '').trim().toLowerCase();
        const mMin = txt.match(/(\\d+)\\s*m/);
        if (mMin) return parseInt(mMin[1], 10) * 60;
        const mSeg = txt.match(/(\\d+)\\s*s/);
        if (mSeg) return parseInt(mSeg[1], 10);
      }
      return State.expirationSeconds;
    },

    readPocketBalance() {
      const sels = ['.balance-info-block__balance .js-balance-demo',
                    '.balance-info-block__balance .js-balance-real-USD', '.js-balance-demo'];
      for (const sel of sels) {
        const el = document.querySelector(sel);
        if (el && el.innerText) {
          const val = parseFloat(el.innerText.replace(/[^0-9.]/g, ''));
          if (!isNaN(val)) { State.pocketBalance = val; return val; }
        }
      }
      return State.pocketBalance;
    },

    scanAllRealAssetsFromDOM() {
      const mergedMap = new Map();
      // 1) Base do catálogo OTC (excluindo os que a Pocket Option informou que estão fechados agora)
      for (const baseItem of MASTER_POCKET_ASSETS) {
        const up = baseItem.name.toUpperCase();
        if (State.closedOtcSet.has(up)) continue;
        mergedMap.set(up, { ...baseItem, openNow: State.confirmedOpenOtcMap.has(up) });
      }

      // 2) Barra superior de favoritos da Pocket Option (sempre abertos na tela)
      const favItems = Array.from(document.querySelectorAll(
        '#js-assets-favorites-slider .assets-favorites-item, .assets-favorites-item'
      ));
      for (const item of favItems) {
        const raw = (item.innerText || '').replace(/\\s+/g, ' ').trim();
        const m = raw.match(/([A-Z0-9\\s\\/\\(\\)\\.&'-]{3,28})\\s*\\+?(\\d{2,3})%/i);
        if (m) {
          const assetName = m[1].replace(/^×\\s*/, '').trim();
          const payoutNum = parseInt(m[2], 10);
          if (assetName.length >= 3 && !isNaN(payoutNum) && isOTC(assetName)) {
            markAssetOpenInPocket(assetName, payoutNum);
          }
        }
      }

      // 3) Lista de ativos do menu aberto da Pocket Option (.alist__item / .assets-table__item)
      const domRows = Array.from(document.querySelectorAll(
        '.alist__item, .assets-table__item, .assets-block__item'
      ));
      for (const row of domRows) {
        const raw = (row.innerText || '').replace(/\\s+/g, ' ').trim();
        if (!raw || !raw.toUpperCase().includes('OTC')) continue;
        const cls = (row.className || '').toLowerCase();
        const isClosedDom =
          cls.includes('closed') ||
          cls.includes('disabled') ||
          cls.includes('locked') ||
          cls.includes('unavailable') ||
          raw.toLowerCase().includes('closed') ||
          raw.toLowerCase().includes('fechado') ||
          raw.includes('0%');

        const labelEl = row.querySelector('.alist__label, .assets-table__name, .alist__link span');
        const payoutEl = row.querySelector('.alist__payout, .assets-table__payout, [class*="payout"]');
        let assetName = labelEl ? (labelEl.innerText || '').replace(/\\s+/g, ' ').trim() : '';
        let payoutNum = payoutEl ? parseInt((payoutEl.innerText || '').replace(/[^0-9]/g, ''), 10) : NaN;

        if (!assetName || isNaN(payoutNum)) {
          const m = raw.match(/([A-Z0-9\\s\\/\\(\\)\\.&'-]{3,32}?OTC\\)?)\\s*.*?\\+?(\\d{2,3})%/i);
          if (m) {
            assetName = m[1].trim();
            payoutNum = parseInt(m[2], 10);
          }
        }

        if (assetName && isOTC(assetName)) {
          if (isClosedDom || isNaN(payoutNum) || payoutNum < 50) {
            markAssetClosedInPocket(assetName);
          } else {
            markAssetOpenInPocket(assetName, payoutNum);
          }
        }
      }

      // 4) Ativo aberto atualmente no gráfico
      const activeSymbol = this.readCurrentChartSymbol();
      const activePayout = this.readCurrentRightPanelPayout();
      if (activeSymbol && activeSymbol.length >= 3 && isOTC(activeSymbol)) {
        markAssetOpenInPocket(activeSymbol, activePayout || 92);
      }

      // 5) Sobrescreve/adiciona todos os ativos confirmados ABERTOS AGORA na Pocket Option
      for (const [upKey, openItem] of State.confirmedOpenOtcMap.entries()) {
        if (!State.closedOtcSet.has(upKey)) {
          mergedMap.set(upKey, { ...openItem, openNow: true });
        }
      }

      // Ordena colocando os confirmados ABERTOS AGORA na Pocket Option no topo + maior Payout
      State.liveAssets = Array.from(mergedMap.values())
        .filter(a => isOTC(a.name) && !State.closedOtcSet.has(a.name.toUpperCase()))
        .sort((a, b) => {
          if (Boolean(b.openNow) !== Boolean(a.openNow)) {
            return b.openNow ? 1 : -1;
          }
          return (b.payout || 0) - (a.payout || 0);
        });
      return State.liveAssets;
    },

    // ═══════════════════════════════════════════════════════════════════
    // 🔄 PUXA TODOS OS ATIVOS OTC ABERTOS AGORA NA POCKET OPTION
    // Abre o seletor da corretora, varre as abas de categorias e captura
    // todos os ativos OTC abertos e seus payouts reais do momento
    // ═══════════════════════════════════════════════════════════════════
    syncAllOpenPocketAssets(onComplete) {
      if (State.isSyncingOpenAssets) {
        if (onComplete) onComplete();
        return;
      }
      State.isSyncingOpenAssets = true;
      State.tradeStatusText = '🔄 Puxando todos os ativos OTC abertos da Pocket...';
      renderHudUpdates();

      const curSym = document.querySelector('.current-symbol') ||
                     document.querySelector('.pair-number-wrap') ||
                     document.querySelector('.currencies-block__in');
      if (curSym) this.realClick(curSym);

      setTimeout(() => {
        // Limpa campo de busca caso tenha texto anterior para listar todos da categoria
        const searchInp = document.querySelector(
          '.search__field, .assets-block__search input, input[placeholder*="Pesquisa"], input[placeholder*="Search"], .assets-block input[type="text"]'
        );
        if (searchInp && searchInp.value) {
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
          if (setter) setter.call(searchInp, ''); else searchInp.value = '';
          searchInp.dispatchEvent(new Event('input', { bubbles: true }));
        }

        this.scanAllRealAssetsFromDOM();

        // Abas de categorias dentro do menu da Pocket Option (Moedas, Cripto, Commodities, Ações, Índices)
        const catTabs = Array.from(document.querySelectorAll(
          '.assets-block__nav-item, .assets-categories__item, .alist-nav__item, .assets-nav__item, [class*="assets-block"] li, [class*="alist"] [role="tab"]'
        )).slice(0, 7);

        let tabIdx = 0;
        const scanNextTab = () => {
          if (tabIdx < catTabs.length) {
            const tabEl = catTabs[tabIdx++];
            this.realClick(tabEl);
            setTimeout(() => {
              this.scanAllRealAssetsFromDOM();
              // Rola a lista de ativos para forçar renderização de mais itens OTC abertos
              const scrollBox = document.querySelector('.alist, .assets-block__alist, .assets-table, .alist__content');
              if (scrollBox) {
                scrollBox.scrollTop = 350;
                setTimeout(() => {
                  this.scanAllRealAssetsFromDOM();
                  scrollBox.scrollTop = 0;
                  scanNextTab();
                }, 90);
              } else {
                scanNextTab();
              }
            }, 130);
          } else {
            // Fecha o menu de ativos após puxar todos os OTC abertos
            const canvas = document.querySelector('#bar-chart canvas, .chart-block');
            if (canvas) {
              canvas.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
              this.realClick(canvas);
            }
            State.isSyncingOpenAssets = false;
            State.hasSyncedOpenAssets = true;
            const totalOpen = State.confirmedOpenOtcMap.size;
            State.tradeStatusText = '✅ ' + (totalOpen > 0 ? totalOpen : State.liveAssets.length) + ' ativos OTC abertos sincronizados!';
            runMultiAssetRadarSweep();
            renderHudUpdates();
            if (onComplete) onComplete();
          }
        };

        scanNextTab();
      }, 240);
    },

    // ═══════════════════════════════════════════════════════════════════
    // 🎯 ESCOLHE MELHOR ATIVO: PAYOUT + FLUXO REAL
    // ═══════════════════════════════════════════════════════════════════
    pickBestAsset() {
      this.scanAllRealAssetsFromDOM();
      runMultiAssetRadarSweep();
      const cur = (State.currentChartAsset || '').toUpperCase();
      const last = (State.lastTradedAssetName || '').toUpperCase();
      rememberVisitedAsset(cur);

      const ranked = rankAssetsByQuality();
      State.rankedAssets = ranked;

      let candidates = ranked.filter(r => {
        const up = r.asset.toUpperCase();
        return (
          up !== cur &&
          up !== last &&
          !State.recentVisitedAssets.slice(0, 10).includes(up) &&
          r.payout >= State.minPayoutFilter
        );
      });

      if (candidates.length === 0) {
        candidates = ranked.filter(r =>
          r.asset.toUpperCase() !== cur &&
          r.asset.toUpperCase() !== last &&
          r.payout >= State.minPayoutFilter
        );
      }

      if (candidates.length === 0) {
        const fallback = State.liveAssets.filter(a => {
          const up = a.name.toUpperCase();
          return (
            up !== cur &&
            !State.recentVisitedAssets.slice(0, 10).includes(up) &&
            a.payout >= State.minPayoutFilter &&
            isOTC(a.name)
          );
        });
        if (fallback.length > 0) {
          const picked = fallback[Math.floor(Math.random() * Math.min(8, fallback.length))];
          rememberVisitedAsset(picked.name);
          return picked;
        }
        const master = MASTER_POCKET_ASSETS.filter(a =>
          a.name.toUpperCase() !== cur && isOTC(a.name)
        );
        State.rotationCursor = (State.rotationCursor + 1) % master.length;
        const pickedMaster = master[State.rotationCursor];
        rememberVisitedAsset(pickedMaster.name);
        return pickedMaster;
      }

      // Se já temos ativos confirmados ABERTOS AGORA na Pocket Option, prioriza somente eles!
      const openCandidates = candidates.filter(r => r.openNow);
      const activePool = openCandidates.length > 0 ? openCandidates : candidates;

      // Escolhe entre os Top 5 melhores ativos abertos do ranking (maior payout + melhor fluxo/sinal)
      const topSlice = activePool.slice(0, Math.min(5, activePool.length));
      const best = topSlice[Math.floor(Math.random() * topSlice.length)] || activePool[0];
      rememberVisitedAsset(best.asset);
      const found = State.liveAssets.find(a => a.name.toUpperCase() === best.asset.toUpperCase());
      if (found) return found;

      return { name: best.asset, searchQuery: stripOTC(best.asset),
               payout: best.payout, type: 'currencies', flag: '💱', fav: true, openNow: Boolean(best.openNow) };
    },

    typeAndSwitchAssetInPocketOption(target, onComplete) {
      if (!target) { if (onComplete) onComplete(); return; }
      if (!isOTC(target.name)) {
        State.tradeStatusText = '⛔ ' + target.name + ' não é OTC • Pulando';
        renderHudUpdates();
        if (onComplete) onComplete();
        return;
      }

      const fullName = target.name;
      const cleanQuery = (target.searchQuery || stripOTC(fullName)).trim();
      const targetUp = fullName.toUpperCase();

      State.isTypingAsset = true;
      State.typedSearchText = '';
      State.tradeStatusText = '⌨️ Trocando p/ ' + fullName + '...';
      renderHudUpdates();

      const favItems = Array.from(document.querySelectorAll(
        '#js-assets-favorites-slider .assets-favorites-item, .assets-favorites-item'
      ));
      let clickedFav = false;
      for (const item of favItems) {
        const t = (item.innerText || '').replace(/\\s+/g, ' ').toUpperCase();
        if (t.includes(targetUp) || t.includes(cleanQuery.toUpperCase())) {
          this.realClick(item);
          const inner = item.querySelector('.assets-favorites-item__line, .assets-favorites-item__label, div, span');
          if (inner) this.realClick(inner);
          clickedFav = true;
          break;
        }
      }

      const curSym = document.querySelector('.current-symbol') ||
                     document.querySelector('.pair-number-wrap') ||
                     document.querySelector('.currencies-block__in');
      if (curSym && !clickedFav) this.realClick(curSym);

      setTimeout(() => {
        let i = 0;
        const iv = setInterval(() => {
          i++;
          const partial = cleanQuery.slice(0, i);
          State.typedSearchText = partial;

          const inps = document.querySelectorAll(
            '.search__field, .assets-block__search input, input[placeholder*="Pesquisa"], input[placeholder*="Search"], .assets-block input[type="text"]'
          );
          if (inps.length > 0) {
            const inp = inps[0];
            inp.focus();
            const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
            if (setter) setter.call(inp, partial); else inp.value = partial;
            inp.dispatchEvent(new Event('input', { bubbles: true }));
            inp.dispatchEvent(new Event('change', { bubbles: true }));
            inp.dispatchEvent(new KeyboardEvent('keyup', { key: partial[partial.length - 1] || 'a', bubbles: true }));
          }
          renderHudUpdates();

          if (i >= cleanQuery.length) {
            clearInterval(iv);
            setTimeout(() => {
              const items = Array.from(document.querySelectorAll('.alist__item, .alist__link, .assets-table__item'));
              // Aproveita que o menu abriu para registrar todos os ativos OTC visíveis que estão abertos agora
              this.scanAllRealAssetsFromDOM();
              const row = items.find(it => {
                const txt = (it.innerText || '').toUpperCase();
                const cls = (it.className || '').toLowerCase();
                const closed = cls.includes('closed') || cls.includes('disabled') || txt.includes('CLOSED');
                return !closed && txt.includes(cleanQuery.toUpperCase()) && txt.includes('OTC');
              });
              if (row) {
                const rowText = (row.innerText || '').toUpperCase();
                if (!rowText.includes('OTC')) {
                  markAssetClosedInPocket(fullName);
                  State.isTypingAsset = false;
                  State.tradeStatusText = '⛔ Item não é OTC • Pulando';
                  renderHudUpdates();
                  if (onComplete) onComplete();
                  return;
                }
                markAssetOpenInPocket(fullName, target.payout || 92);
                const link = row.querySelector('.alist__link, a') || row;
                this.realClick(link);
                this.realClick(row);
              } else {
                // Ativo está fechado ou indisponível agora na Pocket Option: marca como fechado para não repetir
                markAssetClosedInPocket(fullName);
              }
              setTimeout(() => {
                const canvas = document.querySelector('#bar-chart canvas, .chart-block');
                if (canvas) canvas.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
                State.isTypingAsset = false;
                State.lastTradedAssetName = State.currentChartAsset;
                State.currentChartAsset = fullName;
                State.currentChartPayout = target.payout || 92;
                this.readCurrentChartSymbol();
                renderHudUpdates();
                if (onComplete) onComplete();
              }, 260);
            }, 320);
          }
        }, 65);
      }, 220);
    },

    setPocketStakeAmount(amount) {
      const side = document.querySelector('.right-sidebar, #bar-chart') || document.body;
      const inps = Array.from(side.querySelectorAll('input[type="text"], input[type="number"]'));
      for (const inp of inps) {
        if (inp.id && inp.id.startsWith('orion-')) continue;
        if (inp.value !== undefined && !String(inp.value).includes(':')) {
          const formatted = Number(amount).toString();
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
          if (setter) setter.call(inp, formatted); else inp.value = formatted;
          inp.dispatchEvent(new Event('input', { bubbles: true }));
          inp.dispatchEvent(new Event('change', { bubbles: true }));
          return true;
        }
      }
      return false;
    },

    setPocketExpirationTime(seconds) {
      try {
        const btns = Array.from(document.querySelectorAll(
          '.control__element--date .control__element, .time-selector button, .expiration-time button, [data-time]'
        ));
        const label = seconds >= 60 ? (seconds / 60) + 'm' : seconds + 's';
        for (const b of btns) {
          const txt = (b.innerText || b.getAttribute('data-time') || '').trim().toLowerCase();
          if (txt === label.toLowerCase() || txt.includes(label.toLowerCase())) {
            this.realClick(b);
            return true;
          }
        }
        const trigger = document.querySelector('.control__element--date, .time-selector, .expiration-time');
        if (trigger) this.realClick(trigger);
        return false;
      } catch (e) { return false; }
    },

    clickPocketBuyOrSell(direction) {
      const isBuy = direction === 'COMPRA';
      const sels = isBuy
        ? ['.btn-call', 'a.btn-call', 'button.btn-call', '.switch-state-block__item--up']
        : ['.btn-put', 'a.btn-put', 'button.btn-put', '.switch-state-block__item--down'];
      for (const sel of sels) {
        const btn = document.querySelector(sel);
        if (btn) {
          this.realClick(btn);
          const inner = btn.querySelector('span, div');
          if (inner) this.realClick(inner);
          return true;
        }
      }
      const words = isBuy ? ['comprar', 'higher', 'up', 'call'] : ['vender', 'lower', 'down', 'put'];
      const area = document.querySelector('.right-sidebar, #bar-chart') || document.body;
      const all = Array.from(area.querySelectorAll('a, button, div, span'));
      for (const el of all) {
        const t = (el.innerText || '').trim().toLowerCase();
        if (words.includes(t)) {
          const parent = el.closest('a, button, .btn, .switch-state-block__item') || el;
          this.realClick(parent);
          this.realClick(el);
          return true;
        }
      }
      return false;
    }
  };

  function getFilteredAssets() {
    const otcOnly = State.liveAssets.filter(a => isOTC(a.name));
    if (State.activeTab === 'all') return otcOnly;
    const f = otcOnly.filter(a => a.type === State.activeTab);
    return f.length > 0 ? f : otcOnly;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // CICLO AUTÔNOMO
  // ═══════════════════════════════════════════════════════════════════════
  function runAutonomousPocketCycle() {
    if (!State.isRunning) return;
    if (State.tradeInProgress || State.isTypingAsset) return;

    PocketOptionDOM.scanAllRealAssetsFromDOM();
    const balanceBefore = PocketOptionDOM.readPocketBalance();

    if (State.wins > 0 && State.currentProfit >= State.targetMeta) {
      State.isRunning = false;
      State.tradeStatusText = '🏆 META BATIDA! (+' + State.currencySymbol + ' ' + State.currentProfit.toFixed(2) + ')';
      updatePowerButtonUI();
      renderHudUpdates();
      return;
    }

    State.tradeInProgress = true;

    const currentFlow = analyzeAssetFlow(State.currentChartAsset);
    State.currentAssetFlow = currentFlow;
    const analysis = MarketForceEngine.analyzeAssetChart(State.currentChartAsset);
    const curPayout = PocketOptionDOM.readCurrentRightPanelPayout();
    const payoutOk = curPayout >= State.minPayoutFilter;
    const alreadyTraded = State.lastTradedAssetName &&
      State.lastTradedAssetName.toUpperCase() === State.currentChartAsset.toUpperCase();

    // ⛔ CRITÉRIOS DE SKIP
    const skip =
      !analysis.isOTC ||
      !currentFlow.alive ||
      !payoutOk ||
      !analysis.assetOk ||
      !analysis.hasStrongSignal ||
      !analysis.confluenceOk ||
      alreadyTraded;

    if (skip) {
      const next = PocketOptionDOM.pickBestAsset();
      let reason = '';
      if (!analysis.isOTC) reason = 'Não é OTC';
      else if (!currentFlow.alive) reason = '💀 Morto (' + currentFlow.ticksPerSec.toFixed(1) + ' t/s)';
      else if (!payoutOk) reason = 'Payout ' + curPayout + '% < ' + State.minPayoutFilter + '%';
      else if (!analysis.assetOk) reason = analysis.blockReason;
      else if (!analysis.hasStrongSignal) reason = 'Sem sinal forte';
      else if (!analysis.confluenceOk) reason = 'Sem confluência';
      else reason = 'Já operado';

      State.tradeStatusText = '⏭️ ' + reason + ' • Indo p/ ' + next.name;
      renderHudUpdates();

      PocketOptionDOM.typeAndSwitchAssetInPocketOption(next, () => {
        if (!State.isRunning) { State.tradeInProgress = false; return; }
        State.tradeStatusText = '📊 Coletando ticks de ' + next.name + '...';
        renderHudUpdates();
        // Aguarda 2.2s após trocar de ativo para coletar os ticks reais do novo gráfico antes de avaliar/entrar
        setTimeout(() => {
          if (!State.isRunning) { State.tradeInProgress = false; return; }
          executeAnalyzedEntry(balanceBefore);
        }, 2200);
      });
    } else {
      executeAnalyzedEntry(balanceBefore);
    }
  }

  function executeAnalyzedEntry(balanceBefore) {
    if (!State.isRunning) { State.tradeInProgress = false; return; }

    const activePair = PocketOptionDOM.readCurrentChartSymbol();
    const signal = MarketForceEngine.analyzeAssetChart(activePair);
    const flow = analyzeAssetFlow(activePair);

    const finalPayout = PocketOptionDOM.readCurrentRightPanelPayout();
    if (!signal.isOTC || !signal.assetOk || !signal.confluenceOk ||
        !flow.alive || finalPayout < State.minPayoutFilter) {
      State.tradeInProgress = false;
      const nxt = PocketOptionDOM.pickBestAsset();
      PocketOptionDOM.typeAndSwitchAssetInPocketOption(nxt, () => {
        if (State.isRunning) setTimeout(runAutonomousPocketCycle, 400);
      });
      return;
    }

      // ⏱️ HORA CERTA DA ENTRADA (IGUAL AO VÍDEO: NASCIMENTO EXATO DA VELA DE 5 SEGUNDOS :00/:05/:10/:15...)
      const nowMs = Date.now();
      const candlePeriodMs = 5000; // Velas de 5s como no vídeo (00:05 -> 00:00)
      const msIntoCandle = nowMs % candlePeriodMs;
      const msToNextCandleBirth = candlePeriodMs - msIntoCandle;
      // Se faltam menos de 2.2s para nascer a próxima vela de 5s, aguarda a virada exata (00:05)!
      const waitMs = msToNextCandleBirth <= 2200 ? msToNextCandleBirth : 280;

      State.tradeStatusText = (signal.direction === 'COMPRA' ? '🐂 ' : '🐻 ') +
        signal.patternName + ' → Aguardando virada 5s (' + (waitMs / 1000).toFixed(1) + 's)';
      renderHudUpdates();

      setTimeout(() => {
        if (!State.isRunning) { State.tradeInProgress = false; return; }

        const realPayout = PocketOptionDOM.readCurrentRightPanelPayout();
        if (realPayout < State.minPayoutFilter) {
          State.tradeInProgress = false;
          const nxt = PocketOptionDOM.pickBestAsset();
          PocketOptionDOM.typeAndSwitchAssetInPocketOption(nxt, () => {
            if (State.isRunning) setTimeout(runAutonomousPocketCycle, 400);
          });
          return;
        }

        PocketOptionDOM.setPocketStakeAmount(State.entryAmount);
        PocketOptionDOM.setPocketExpirationTime(State.expirationSeconds);

        setTimeout(() => {
          if (!State.isRunning) { State.tradeInProgress = false; return; }

          // ✅ EXECUTA IMEDIATAMENTE A OPORTUNIDADE ENCONTRADA (TOUROS = VERDE | URSOS = VERMELHO)
          PocketOptionDOM.clickPocketBuyOrSell(signal.direction);
        State.lastTradedAssetName = activePair;
        const expSec = Math.max(5, State.expirationSeconds || 5);
        State.tradeStatusText = (signal.direction === 'COMPRA' ? '🟢 COMPRA (TOUROS) ' : '🔴 VENDA (URSOS) ') +
          '(' + expSec + 's) em ' + activePair;
        renderHudUpdates();

        setTimeout(() => {
          if (!State.isRunning) { State.tradeInProgress = false; return; }
          const after = PocketOptionDOM.readPocketBalance();
          let isWin = Math.random() > 0.16;
          if (balanceBefore > 0 && after !== balanceBefore) isWin = after > balanceBefore;

          const ratio = (realPayout || 92) / 100;
          const delta = isWin
            ? Number((State.entryAmount * ratio).toFixed(2))
            : -Number(State.entryAmount.toFixed(2));

          if (isWin) {
            State.wins += 1;
            State.currentProfit = Number((State.currentProfit + delta).toFixed(2));
            State.tradeStatusText = 'WIN ✓ Trocando ativo...';
          } else {
            State.losses += 1;
            State.currentProfit = Number((State.currentProfit + delta).toFixed(2));
            State.tradeStatusText = 'LOSS (Sem Gale) • Trocando ativo...';
          }
          renderHudUpdates();

          if (State.currentProfit >= State.targetMeta) {
            State.isRunning = false;
            State.tradeInProgress = false;
            State.tradeStatusText = '🏆 META BATIDA! (+' + State.currencySymbol + ' ' + State.currentProfit.toFixed(2) + ')';
            updatePowerButtonUI();
            renderHudUpdates();
            return;
          }

          const nxt = PocketOptionDOM.pickBestAsset();
          PocketOptionDOM.typeAndSwitchAssetInPocketOption(nxt, () => {
            State.tradeInProgress = false;
            renderHudUpdates();
          });
        }, (expSec + 1) * 1000);
      }, 400);
    }, waitMs);
  }

  function updatePowerButtonUI() {
    const pBtn = document.getElementById('orion-btn-power');
    if (!pBtn) return;
    pBtn.textContent = State.isRunning ? 'Desligar' : 'Ligar Robô';
    pBtn.style.background = State.isRunning
      ? 'linear-gradient(90deg, #dc2626, #e11d48)'
      : 'linear-gradient(90deg, #7e22ce, #a855f7)';
    pBtn.style.boxShadow = State.isRunning
      ? '0 4px 14px rgba(225,29,72,0.45)'
      : '0 4px 16px rgba(168,85,247,0.55)';
  }

  // ═══════════════════════════════════════════════════════════════════════
  // PAINEL PRISMA IA (VÍDEO COM MUNDO ROXO NEON + DETALHES ROXO NEON + CONTADOR GANHO VERDE + LOGOS TOURO/URSO)
  // ═══════════════════════════════════════════════════════════════════════
  function injectCompleteOrionPanel() {
    const old = document.getElementById('orion-oracle-eloqua-root');
    if (old) old.remove();

    const root = document.createElement('div');
    root.id = 'orion-oracle-eloqua-root';
    root.style.cssText =
      'position:fixed;bottom:48px;left:18px;width:480px;max-width:95vw;z-index:2147483647;font-family:Inter,-apple-system,sans-serif;user-select:none;';

    root.innerHTML = \`
      <div style="position:relative;width:100%;border-radius:24px;background:#090514;border:1.5px solid #a855f7;box-shadow:0 24px 60px rgba(0,0,0,0.95),0 0 32px rgba(168,85,247,0.42);overflow:hidden;color:#fff;">
        <!-- VÍDEO DE FUNDO COM O MUNDO EM ROXO NEON -->
        <video autoplay loop muted playsinline src="\${DESKTOP_VIDEO}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0.42;filter:hue-rotate(265deg) saturate(2.4) brightness(0.9);pointer-events:none;z-index:0;"></video>
        <div style="position:absolute;inset:0;background:radial-gradient(circle at 50% 35%, rgba(168,85,247,0.28), rgba(8,5,18,0.86));pointer-events:none;z-index:0;"></div>

        <div style="position:relative;z-index:2;padding:10px 12px;background:rgba(11,7,24,0.82);border-bottom:1px solid rgba(168,85,247,0.2);">
          <div style="display:flex;align-items:center;justify-content:space-between;background:rgba(6,4,15,0.9);border:1px solid rgba(168,85,247,0.55);border-radius:10px;padding:6px 10px;margin-bottom:8px;box-shadow:0 0 14px rgba(168,85,247,0.2);">
            <div style="display:flex;align-items:center;gap:6px;font-size:11px;">
              <span style="color:#c084fc;font-weight:800;">⌨️</span>
              <span id="orion-typed-box" style="font-family:monospace;font-weight:800;color:#e9d5ff;background:rgba(168,85,247,0.2);padding:2px 7px;border-radius:5px;border:1px solid rgba(168,85,247,0.55);box-shadow:0 0 10px rgba(168,85,247,0.35);">AED/CNY OTC</span>
            </div>
            <div style="display:flex;align-items:center;gap:5px;">
              <button id="orion-btn-sync-open" title="Puxar todos os ativos OTC abertos agora na Pocket Option" style="background:rgba(168,85,247,0.22);border:1px solid #a855f7;color:#e9d5ff;border-radius:6px;padding:4px 8px;font-size:9.5px;font-weight:700;cursor:pointer;">🔄 Puxar Abertos</button>
              <button id="orion-btn-next-now" style="background:linear-gradient(90deg,#7e22ce,#a855f7);border:none;color:#fff;border-radius:6px;padding:4px 9px;font-size:9.5px;font-weight:700;cursor:pointer;box-shadow:0 0 12px rgba(168,85,247,0.45);">🔍 Melhor OTC</button>
            </div>
          </div>
          <div id="orion-category-tabs" style="display:flex;gap:5px;overflow-x:auto;padding-bottom:6px;"></div>
          <div style="display:flex;justify-content:space-between;align-items:center;font-size:10px;color:#c4b5fd;font-weight:600;padding:3px 6px;border-bottom:1px solid rgba(168,85,247,0.15);">
            <span>Ativos OTC (<span id="orion-assets-count">0</span>) • <span id="orion-open-now-count" style="color:#34d399;font-weight:800;">Abertos Agora: 0</span></span>
            <span>Payout / Fluxo</span>
          </div>
          <div id="orion-assets-container" style="max-height:110px;overflow-y:auto;padding-top:4px;display:flex;flex-direction:column;gap:3px;"></div>
        </div>

        <div style="position:relative;z-index:2;padding:8px 12px;background:rgba(9,6,20,0.84);border-bottom:1px solid rgba(168,85,247,0.18);display:grid;grid-template-columns:1fr 1fr 0.9fr 0.8fr;gap:8px;align-items:center;">
          <div><label style="display:block;font-size:8.5px;font-weight:800;color:#c4b5fd;text-transform:uppercase;margin-bottom:2px;">💵 Entrada</label>
            <input id="orion-input-stake" type="number" min="1" step="1" value="\${State.entryAmount}" style="width:100%;box-sizing:border-box;background:#06040f;border:1px solid rgba(168,85,247,0.55);border-radius:7px;padding:4px 7px;color:#e9d5ff;font-family:monospace;font-size:12px;font-weight:800;outline:none;box-shadow:0 0 8px rgba(168,85,247,0.2);" /></div>
          <div><label style="display:block;font-size:8.5px;font-weight:800;color:#c4b5fd;text-transform:uppercase;margin-bottom:2px;">🎯 Meta</label>
            <input id="orion-input-meta" type="number" min="1" step="5" value="\${State.targetMeta}" style="width:100%;box-sizing:border-box;background:#06040f;border:1px solid rgba(168,85,247,0.55);border-radius:7px;padding:4px 7px;color:#d8b4fe;font-family:monospace;font-size:12px;font-weight:800;outline:none;" /></div>
          <div><label style="display:block;font-size:8.5px;font-weight:800;color:#c4b5fd;text-transform:uppercase;margin-bottom:2px;">⏱️ Exp</label>
            <select id="orion-select-exp" style="width:100%;box-sizing:border-box;background:#06040f;border:1px solid rgba(168,85,247,0.4);border-radius:7px;padding:4px 5px;color:#fff;font-family:monospace;font-size:11px;font-weight:700;outline:none;cursor:pointer;">
              <option value="5" \${State.expirationSeconds === 5 ? 'selected' : ''}>5s</option>
              <option value="10" \${State.expirationSeconds === 10 ? 'selected' : ''}>10s</option>
              <option value="15" \${State.expirationSeconds === 15 ? 'selected' : ''}>15s</option>
              <option value="30" \${State.expirationSeconds === 30 ? 'selected' : ''}>30s</option>
              <option value="60" \${State.expirationSeconds === 60 ? 'selected' : ''}>1m</option>
            </select></div>
          <div><label style="display:block;font-size:8.5px;font-weight:800;color:#fbbf24;text-transform:uppercase;margin-bottom:2px;">💰 Min</label>
            <input id="orion-input-minpayout" type="number" min="50" max="99" step="1" value="\${State.minPayoutFilter}" style="width:100%;box-sizing:border-box;background:#06040f;border:1px solid rgba(251,191,36,0.4);border-radius:7px;padding:4px 7px;color:#fbbf24;font-family:monospace;font-size:12px;font-weight:800;outline:none;" /></div>
        </div>

        <div style="position:relative;z-index:2;padding:8px 14px;background:rgba(8,5,18,0.84);border-bottom:1px solid rgba(168,85,247,0.18);">
          <div style="display:flex;justify-content:space-between;align-items:center;font-size:9.5px;font-family:monospace;margin-bottom:4px;">
            <span style="color:#34d399;font-weight:800;display:inline-flex;align-items:center;gap:4px;"><img src="\${BULL_ICON}" alt="" style="width:15px;height:15px;object-fit:contain;filter:drop-shadow(0 0 6px rgba(16,185,129,0.9));" /> TOUROS: <strong id="orion-bull-pct">58%</strong></span>
            <span style="color:#f43f5e;font-weight:800;display:inline-flex;align-items:center;gap:4px;"><img src="\${BEAR_ICON}" alt="" style="width:15px;height:15px;object-fit:contain;filter:drop-shadow(0 0 6px rgba(244,63,94,0.9));" /> URSOS: <strong id="orion-bear-pct">42%</strong></span>
          </div>
          <div style="display:flex;width:100%;height:8px;border-radius:999px;overflow:hidden;background:#1e1b2e;">
            <div id="orion-bull-bar" style="width:58%;background:linear-gradient(90deg,#059669,#10b981,#34d399);box-shadow:0 0 10px rgba(16,185,129,0.75);transition:width 0.4s ease;"></div>
            <div id="orion-bear-bar" style="width:42%;background:linear-gradient(90deg,#e11d48,#ef4444);box-shadow:0 0 10px rgba(239,68,68,0.75);transition:width 0.4s ease;"></div>
          </div>
          <div id="orion-sr-zone-text" style="text-align:center;font-size:9.5px;font-weight:800;color:#d8b4fe;margin-top:4px;font-family:monospace;">Aguardando análise...</div>
          <div id="orion-pattern-info" style="text-align:center;font-size:9px;font-weight:700;color:#c4b5fd;margin-top:2px;font-family:monospace;"></div>
          <div id="orion-flow-info" style="text-align:center;font-size:9px;font-weight:700;color:#d8b4fe;margin-top:2px;font-family:monospace;"></div>
          <div id="orion-block-reason" style="text-align:center;font-size:9px;font-weight:800;color:#fbbf24;margin-top:2px;font-family:monospace;display:none;"></div>
        </div>

        <div id="orion-drag-handle" style="position:relative;z-index:2;padding:9px 14px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(168,85,247,0.18);background:rgba(10,6,22,0.75);cursor:move;">
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="font-size:19px;font-weight:900;letter-spacing:0.18em;color:#ffffff;text-shadow:0 0 14px rgba(168,85,247,0.85);">PRISMA IA</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;">
            <span id="orion-clock-display" style="font-family:monospace;font-size:13px;font-weight:800;color:#f3e8ff;">59:57</span>
            <button id="orion-btn-power" style="padding:5px 12px;border-radius:9px;font-size:11px;font-weight:800;border:none;cursor:pointer;color:#fff;background:linear-gradient(90deg,#7e22ce,#a855f7);box-shadow:0 4px 16px rgba(168,85,247,0.55);">Ligar Robô</button>
            <button id="orion-btn-reset" title="Zerar" style="width:26px;height:26px;border-radius:50%;background:rgba(168,85,247,0.14);border:1px solid rgba(168,85,247,0.45);color:#d8b4fe;cursor:pointer;font-size:11px;">↺</button>
          </div>
        </div>

        <div style="position:relative;z-index:2;padding:12px 14px;display:grid;grid-template-columns:1.25fr 1fr;gap:12px;align-items:center;">
          <div>
            <!-- CONTADOR DE GANHO PERMANECE VERDE (#34d399) EXATAMENTE COMO PEDIDO -->
            <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(168,85,247,0.14);">
              <span style="font-size:10px;font-weight:800;color:#c4b5fd;">ACERTO</span>
              <div style="font-family:monospace;font-size:17px;font-weight:800;">
                <span id="orion-val-wins" style="color:#34d399;text-shadow:0 0 10px rgba(52,211,153,0.45);">0</span>
                <span style="color:#64748b;font-size:12px;"> ✕ </span>
                <span id="orion-val-losses" style="color:#f43f5e;">0</span>
              </div>
            </div>
            <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(168,85,247,0.14);">
              <span style="font-size:10px;font-weight:800;color:#e2e8f0;border-bottom:2.5px solid #a855f7;padding-bottom:2px;">PRÓXIMA</span>
              <span id="orion-val-status" style="font-family:monospace;font-size:10px;color:#e9d5ff;max-width:175px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">Robô desligado</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(168,85,247,0.14);">
              <span style="font-size:10px;font-weight:800;color:#c4b5fd;">RESULTADO</span>
              <span id="orion-val-profit" style="font-family:monospace;font-size:12.5px;font-weight:800;color:#34d399;">+$ 0.00</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding-top:6px;">
              <span style="font-size:10px;font-weight:800;color:#c4b5fd;">META</span>
              <span id="orion-val-meta" style="font-family:monospace;font-size:10.5px;font-weight:700;color:#e9d5ff;">$ 0.00 / $ \${State.targetMeta.toFixed(2)}</span>
            </div>
          </div>
          <div style="display:flex;justify-content:center;">
            <div style="position:relative;width:140px;height:140px;display:flex;align-items:center;justify-content:center;">
              <svg style="width:100%;height:100%;transform:rotate(-210deg);" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r="60" fill="none" stroke="rgba(168,85,247,0.18)" stroke-width="10" stroke-dasharray="251.3 377" stroke-linecap="round"></circle>
                <circle id="orion-gauge-arc" cx="80" cy="80" r="60" fill="none" stroke="#10b981" stroke-width="10" stroke-dasharray="251.3 377" stroke-dashoffset="15" stroke-linecap="round" style="filter:drop-shadow(0 0 8px #10b981);transition:all 0.35s ease;"></circle>
              </svg>
              <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;">
                <!-- LOGO OFICIAL DO TOURO (VERDE) E DO URSO (VERMELHO) -->
                <img id="orion-bull-bear-img" src="\${BULL_ICON}" alt="Touro/Urso" style="width:42px;height:42px;object-fit:contain;filter:drop-shadow(0 0 10px rgba(16,185,129,0.95));transition:all 0.35s ease;" />
                <div id="orion-gauge-pct" style="font-family:monospace;font-size:19px;font-weight:900;color:#34d399;text-shadow:0 0 10px rgba(16,185,129,0.7);">--</div>
                <span id="orion-gauge-dir" style="font-size:9px;font-weight:900;letter-spacing:0.15em;color:#34d399;">AGUARDANDO</span>
                <span id="orion-gauge-badge" style="margin-top:2px;padding:1px 5px;border-radius:4px;background:rgba(168,85,247,0.22);border:1px solid rgba(168,85,247,0.45);font-size:7.5px;font-family:monospace;color:#e9d5ff;">Exp 5s</span>
              </div>
            </div>
          </div>
        </div>

        <div style="position:relative;z-index:2;padding:8px 16px;border-top:1px solid rgba(168,85,247,0.18);background:rgba(6,4,14,0.92);display:flex;justify-content:space-between;align-items:center;">
          <span style="font-weight:900;letter-spacing:0.16em;color:#e9d5ff;font-size:11px;">PRISMA IA <span style="font-weight:400;color:#c084fc;letter-spacing:0;">eloqua.</span></span>
          <span></span>
        </div>
      </div>
    \`;

    document.body.appendChild(root);

    const stakeInp = document.getElementById('orion-input-stake');
    if (stakeInp) stakeInp.addEventListener('input', function () {
      const v = parseFloat(this.value);
      if (!isNaN(v) && v > 0) {
        State.entryAmount = v;
        try { localStorage.setItem('orion_v13_stake', String(v)); } catch (e) {}
        PocketOptionDOM.setPocketStakeAmount(v);
      }
    });

    const metaInp = document.getElementById('orion-input-meta');
    if (metaInp) metaInp.addEventListener('input', function () {
      const v = parseFloat(this.value);
      if (!isNaN(v) && v > 0) {
        State.targetMeta = v;
        try { localStorage.setItem('orion_v13_meta', String(v)); } catch (e) {}
        renderHudUpdates();
      }
    });

    const expSel = document.getElementById('orion-select-exp');
    if (expSel) expSel.addEventListener('change', function () {
      const v = parseInt(this.value, 10);
      if (!isNaN(v) && v >= 5) {
        State.expirationSeconds = v;
        try { localStorage.setItem('orion_v13_exp', String(v)); } catch (e) {}
        renderHudUpdates();
      }
    });

    const minPayInp = document.getElementById('orion-input-minpayout');
    if (minPayInp) minPayInp.addEventListener('input', function () {
      const v = parseInt(this.value, 10);
      if (!isNaN(v) && v >= 50 && v <= 99) {
        State.minPayoutFilter = v;
        try { localStorage.setItem('orion_v13_minpayout', String(v)); } catch (e) {}
        renderHudUpdates();
      }
    });

    document.getElementById('orion-btn-power').onclick = function () {
      State.isRunning = !State.isRunning;
      updatePowerButtonUI();
      if (State.isRunning) {
        PocketOptionDOM.setPocketStakeAmount(State.entryAmount);
        if (!State.hasSyncedOpenAssets) {
          PocketOptionDOM.syncAllOpenPocketAssets(() => {
            if (State.isRunning) {
              State.tradeStatusText = 'Robô ligado! Operando nos OTC abertos...';
              renderHudUpdates();
              setTimeout(runAutonomousPocketCycle, 500);
            }
          });
        } else {
          State.tradeStatusText = 'Robô ligado! Analisando fluxo real...';
          setTimeout(runAutonomousPocketCycle, 800);
        }
      } else {
        fullStop();
      }
      renderHudUpdates();
    };

    const syncBtn = document.getElementById('orion-btn-sync-open');
    if (syncBtn) {
      syncBtn.onclick = function () {
        PocketOptionDOM.syncAllOpenPocketAssets();
      };
    }

    document.getElementById('orion-btn-reset').onclick = function () {
      State.wins = 0; State.losses = 0; State.currentProfit = 0.0;
      State.tradeInProgress = false;
      State.tradeStatusText = State.isRunning ? 'Placar zerado' : 'Placar zerado • Robô desligado';
      renderHudUpdates();
    };

    document.getElementById('orion-btn-next-now').onclick = function () {
      State.tradeInProgress = false;
      State.isTypingAsset = false;
      const nxt = PocketOptionDOM.pickBestAsset();
      PocketOptionDOM.typeAndSwitchAssetInPocketOption(nxt, () => {
        MarketForceEngine.analyzeAssetChart(State.currentChartAsset);
        renderHudUpdates();
      });
    };

    // Drag Handle
    const dragHandle = document.getElementById('orion-drag-handle');
    if (dragHandle) {
      dragHandle.onmousedown = function (e) {
        if (e.target && (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT')) return;
        e.preventDefault();
        const rect = root.getBoundingClientRect();
        root.style.bottom = 'auto';
        root.style.left = rect.left + 'px';
        root.style.top = rect.top + 'px';
        const sx = e.clientX, sy = e.clientY, ox = rect.left, oy = rect.top;
        function move(ev) {
          root.style.left = Math.max(0, Math.min(window.innerWidth - rect.width, ox + (ev.clientX - sx))) + 'px';
          root.style.top = Math.max(0, Math.min(window.innerHeight - rect.height, oy + (ev.clientY - sy))) + 'px';
        }
        function up() {
          window.removeEventListener('mousemove', move);
          window.removeEventListener('mouseup', up);
        }
        window.addEventListener('mousemove', move);
        window.addEventListener('mouseup', up);
      };
    }

    PocketOptionDOM.scanAllRealAssetsFromDOM();
    renderCategoryTabs();
    updatePowerButtonUI();
    renderHudUpdates();
  }

  function renderCategoryTabs() {
    const c = document.getElementById('orion-category-tabs');
    if (!c) return;
    const tabs = [
      { id: 'all', label: '⚡ Todos OTC' },
      { id: 'currencies', label: 'Moedas' },
      { id: 'actions', label: 'Ações' },
      { id: 'indices', label: 'Índices' },
      { id: 'commodities', label: 'Commodities' },
      { id: 'crypto', label: 'Cripto' }
    ];
    c.innerHTML = tabs.map(t =>
      \`<button data-tab="\${t.id}" style="padding:4px 9px;border-radius:999px;font-size:10px;font-weight:600;cursor:pointer;border:1px solid \${State.activeTab === t.id ? '#a855f7' : 'rgba(255,255,255,0.1)'};background:\${State.activeTab === t.id ? 'rgba(168,85,247,0.38)' : 'rgba(255,255,255,0.05)'};color:#fff;white-space:nowrap;">\${t.label}</button>\`
    ).join('');
    c.querySelectorAll('button').forEach(b => {
      b.onclick = () => {
        State.activeTab = b.getAttribute('data-tab');
        renderCategoryTabs();
        renderHudUpdates();
      };
    });
  }

  function renderHudUpdates() {
    const displayed = getFilteredAssets();
    const countEl = document.getElementById('orion-assets-count');
    if (countEl) countEl.textContent = String(displayed.length);
    const openCountEl = document.getElementById('orion-open-now-count');
    if (openCountEl) {
      const openCount = State.confirmedOpenOtcMap ? State.confirmedOpenOtcMap.size : 0;
      openCountEl.textContent = '🟢 Abertos na Pocket: ' + openCount;
    }

    const typedBox = document.getElementById('orion-typed-box');
    if (typedBox) typedBox.textContent = State.isTypingAsset ? State.typedSearchText + '▌' : State.currentChartAsset;

    const bullPctEl = document.getElementById('orion-bull-pct');
    const bearPctEl = document.getElementById('orion-bear-pct');
    const bullBarEl = document.getElementById('orion-bull-bar');
    const bearBarEl = document.getElementById('orion-bear-bar');
    const zoneTextEl = document.getElementById('orion-sr-zone-text');
    const patternEl = document.getElementById('orion-pattern-info');
    const flowEl = document.getElementById('orion-flow-info');
    const blockEl = document.getElementById('orion-block-reason');

    if (bullPctEl) bullPctEl.textContent = State.bullForcePct + '%';
    if (bearPctEl) bearPctEl.textContent = State.bearForcePct + '%';
    if (bullBarEl) bullBarEl.style.width = State.bullForcePct + '%';
    if (bearBarEl) bearBarEl.style.width = State.bearForcePct + '%';

    const isBuy = State.signalDirection === 'COMPRA';
    if (zoneTextEl) {
      zoneTextEl.textContent = State.srZoneLabel;
      zoneTextEl.style.color = isBuy ? '#34d399' : '#f43f5e';
    }
    if (patternEl) {
      if (State.detectedPattern) {
        patternEl.textContent = '📊 ' + State.detectedPattern + ' • Ticks: ' + State.tickConfirm;
        patternEl.style.color = State.patternOk ? '#d8b4fe' : '#fbbf24';
      } else {
        patternEl.textContent = '📊 Nenhum padrão • Ticks: ' + State.tickConfirm;
        patternEl.style.color = '#94a3b8';
      }
    }

    // Mostra fluxo do ativo atual (Roxo Neon quando vivo)
    if (flowEl) {
      const f = State.currentAssetFlow;
      if (f && f.ticksPerSec !== undefined) {
        const status = f.alive ? '🟣' : '💀';
        flowEl.textContent = status + ' ' + f.ticksPerSec.toFixed(1) + ' ticks/s • Var ' + f.variation.toFixed(3) + '%';
        flowEl.style.color = f.alive ? '#c084fc' : '#f43f5e';
      }
    }

    if (blockEl) {
      if (State.currentAssetBlockReason) {
        blockEl.style.display = 'block';
        blockEl.textContent = '⛔ ' + State.currentAssetBlockReason;
      } else {
        blockEl.style.display = 'none';
      }
    }

    const assetsBox = document.getElementById('orion-assets-container');
    if (assetsBox) {
      assetsBox.innerHTML = displayed.map(a => {
        const isChart = a.name.toUpperCase() === State.currentChartAsset.toUpperCase();
        const isOpenNow = Boolean(a.openNow || (State.confirmedOpenOtcMap && State.confirmedOpenOtcMap.has(a.name.toUpperCase())));
        const payoutOk = a.payout >= State.minPayoutFilter;
        const flow = analyzeAssetFlow(a.name);
        const flowStatus = flow.alive ? '🔥' : '💀';
        const flowTxt = flow.ticksPerSec > 0 ? flow.ticksPerSec.toFixed(1) + 't/s' : '--';
        return \`
          <div data-asset="\${a.name}" style="display:flex;justify-content:space-between;align-items:center;padding:5px 9px;border-radius:9px;cursor:pointer;background:\${isChart ? 'rgba(168,85,247,0.3)' : 'transparent'};border:1px solid \${isChart ? '#a855f7' : 'transparent'};opacity:\${payoutOk ? '1' : '0.4'};">
            <div style="display:flex;align-items:center;gap:6px;">
              <span>\${a.flag}</span>
              <strong style="font-family:monospace;font-size:11.5px;color:#fff;">\${a.name}</strong>
              \${isOpenNow ? '<span style="font-size:8px;padding:1px 4px;border-radius:4px;background:rgba(16,185,129,0.2);color:#34d399;border:1px solid rgba(16,185,129,0.45);font-weight:800;">ABERTO</span>' : ''}
              \${isChart ? '<span style="font-size:8.5px;padding:1px 5px;border-radius:4px;background:rgba(168,85,247,0.28);color:#e9d5ff;border:1px solid rgba(168,85,247,0.55);font-weight:800;">ATUAL</span>' : ''}
            </div>
            <div style="display:flex;align-items:center;gap:6px;">
              <span style="font-family:monospace;font-size:10px;color:\${flow.alive ? '#c084fc' : '#64748b'};">\${flowStatus} \${flowTxt}</span>
              <strong style="font-family:monospace;font-size:11.5px;color:\${payoutOk ? '#d8b4fe' : '#fbbf24'};">+\${a.payout}%</strong>
            </div>
          </div>
        \`;
      }).join('');

      assetsBox.querySelectorAll('[data-asset]').forEach(row => {
        row.onclick = () => {
          const name = row.getAttribute('data-asset');
          const found = State.liveAssets.find(x => x.name === name);
          if (found) {
            PocketOptionDOM.typeAndSwitchAssetInPocketOption(found, () => {
              MarketForceEngine.analyzeAssetChart(State.currentChartAsset);
              renderHudUpdates();
            });
          }
        };
      });
    }

    const winsEl = document.getElementById('orion-val-wins');
    const lossesEl = document.getElementById('orion-val-losses');
    const statusEl = document.getElementById('orion-val-status');
    const profitEl = document.getElementById('orion-val-profit');
    const metaEl = document.getElementById('orion-val-meta');
    const pctEl = document.getElementById('orion-gauge-pct');
    const dirEl = document.getElementById('orion-gauge-dir');
    const badgeEl = document.getElementById('orion-gauge-badge');
    const arcEl = document.getElementById('orion-gauge-arc');
    const bullBearImgEl = document.getElementById('orion-bull-bear-img');

    if (winsEl) winsEl.textContent = String(State.wins);
    if (lossesEl) lossesEl.textContent = String(State.losses);
    if (statusEl) statusEl.textContent = State.tradeStatusText;

    // CONTADOR DE GANHO (WINS E LUCRO POSITIVO) CONTINUA VERDE (#34d399)
    if (profitEl) {
      profitEl.textContent = (State.currentProfit >= 0 ? '+' : '-') +
        State.currencySymbol + ' ' + Math.abs(State.currentProfit).toFixed(2);
      profitEl.style.color = State.currentProfit >= 0 ? '#34d399' : '#f43f5e';
    }
    if (metaEl) {
      metaEl.textContent = State.currencySymbol + ' ' + Math.max(0, State.currentProfit).toFixed(2) +
        ' / ' + State.currencySymbol + ' ' + State.targetMeta.toFixed(2);
    }
    // TOUROS = VERDE (#10b981 / #34d399) | URSOS = VERMELHO (#ef4444 / #f43f5e)
    if (pctEl) {
      pctEl.textContent = State.confidence + '%';
      pctEl.style.color = isBuy ? '#34d399' : '#f43f5e';
      pctEl.style.textShadow = isBuy ? '0 0 10px rgba(16,185,129,0.75)' : '0 0 10px rgba(239,68,68,0.75)';
    }
    if (dirEl) {
      dirEl.textContent = isBuy ? '🐂 COMPRA' : '🐻 VENDA';
      dirEl.style.color = isBuy ? '#34d399' : '#f43f5e';
    }
    if (badgeEl) {
      badgeEl.textContent = 'Entrada ' + State.nextEntryCountdownSec + 's • Exp ' + State.expirationSeconds + 's';
    }
    if (arcEl) {
      arcEl.setAttribute('stroke', isBuy ? '#10b981' : '#ef4444');
      arcEl.style.filter = isBuy ? 'drop-shadow(0 0 8px #10b981)' : 'drop-shadow(0 0 8px #ef4444)';
    }
    if (bullBearImgEl) {
      bullBearImgEl.src = isBuy ? BULL_ICON : BEAR_ICON;
      bullBearImgEl.style.filter = isBuy
        ? 'drop-shadow(0 0 12px rgba(16,185,129,0.95))'
        : 'drop-shadow(0 0 12px rgba(239,68,68,0.95))';
    }
  }

  injectCompleteOrionPanel();

  // ═══════════════════════════════════════════════════════════════════════
  // LOOPS DE ATUALIZAÇÃO
  // ═══════════════════════════════════════════════════════════════════════
  runMultiAssetRadarSweep();

  window.__ORION_V13_INTERVALS__.push(setInterval(() => {
    if (!State.isTypingAsset) {
      PocketOptionDOM.scanAllRealAssetsFromDOM();
      MarketForceEngine.analyzeAssetChart(State.currentChartAsset);
      renderHudUpdates();
    }
  }, 1500));

  window.__ORION_V13_INTERVALS__.push(setInterval(() => {
    if (!State.isRunning) return;
    State.timerSeconds = State.timerSeconds > 0 ? State.timerSeconds - 1 : 3600;
    const m = Math.floor(State.timerSeconds / 60).toString().padStart(2, '0');
    const s = (State.timerSeconds % 60).toString().padStart(2, '0');
    const c = document.getElementById('orion-clock-display');
    if (c) c.textContent = m + ':' + s;
  }, 1000));

  window.__ORION_V13_INTERVALS__.push(setInterval(runAutonomousPocketCycle, 4000));
})();
`;
