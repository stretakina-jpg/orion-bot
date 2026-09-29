export interface OrionBotSettings {
  // User Profile & Account
  userEmail: string;
  userPassword: string;
  plan: 'ouro' | 'prata';
  vibeMode: boolean;
  realBalance: number;
  demoBalance: number;
  activeAccountType: 'real' | 'demo';

  // Broker & Network Connection
  primaryBroker: string;
  brokerDomain: string; // 'brokerqx.com' | 'qxbroker.com' | 'quotex.com' | 'embedded' | 'custom'
  customBrokerUrl: string;
  executionMode: 'embedded-webtrader' | 'iframe' | 'direct' | 'bridge';
  autoFallbackOnDnsError: boolean;

  // Trading Automation & Risk
  activeStrategy: 'mhi' | 'price-action' | 'trend-ema' | 'breakout' | 'blitz-5s' | 'otc-sniper';
  timeframe: '5s' | '15s' | '30s' | '1m' | '5m';
  tradeAmount: number; // in currency units (e.g. R$ 10)
  currency: 'BRL' | 'USD' | 'EUR';
  martingaleType: 'none' | 'fixed' | 'moderate' | 'aggressive' | 'soros';
  martingaleMultiplier: number;
  maxMartingaleSteps: number;
  stopWin: number;
  stopLoss: number;
  minPayout: number; // e.g. 80 (%)
  trendFilter: boolean;
  newsFilter: boolean;
  autoTrade: boolean;

  // Orion Bridge & DOM Engine
  bridgeStatus: 'connected' | 'connecting' | 'disconnected';
  bridgeServerUrl: string;
  domObserverDelayMs: number;
  clickDelayMs: number;
  showVisualIndicators: boolean;
  soundEffects: boolean;
}

export const DEFAULT_ORION_CONFIG: OrionBotSettings = {
  userEmail: 'glkhali7777@gmail.com',
  userPassword: '7072147212345Biel',
  plan: 'ouro',
  vibeMode: true,
  realBalance: 500.00,
  demoBalance: 10000.00,
  activeAccountType: 'real',

  primaryBroker: 'brokerqx',
  brokerDomain: 'brokerqx.com',
  customBrokerUrl: 'https://brokerqx.com',
  executionMode: 'embedded-webtrader',
  autoFallbackOnDnsError: true,

  activeStrategy: 'otc-sniper',
  timeframe: '5s',
  tradeAmount: 10.00,
  currency: 'BRL',
  martingaleType: 'moderate',
  martingaleMultiplier: 1.8,
  maxMartingaleSteps: 2,
  stopWin: 250.00,
  stopLoss: 100.00,
  minPayout: 82,
  trendFilter: true,
  newsFilter: false,
  autoTrade: false,

  bridgeStatus: 'connected',
  bridgeServerUrl: 'wss://orion.cloudconsultingmastery.com/bridge',
  domObserverDelayMs: 300,
  clickDelayMs: 50,
  showVisualIndicators: true,
  soundEffects: true,
};

const STORAGE_KEY = 'orion_bot_configuration_v2';
const USER_BALANCES_KEY = 'orion_users_balance_map';

export function getUserBalances(email: string): { realBalance: number; demoBalance: number } {
  if (typeof window === 'undefined') return { realBalance: 500, demoBalance: 10000 };
  try {
    const raw = localStorage.getItem(USER_BALANCES_KEY);
    const map = raw ? JSON.parse(raw) : {};
    const key = email.toLowerCase().trim();
    if (map[key]) {
      return {
        realBalance: typeof map[key].realBalance === 'number' ? map[key].realBalance : 500,
        demoBalance: typeof map[key].demoBalance === 'number' ? map[key].demoBalance : 10000,
      };
    }
  } catch {}
  const isDefaultVip = email.toLowerCase().includes('glkhali') || email.toLowerCase().includes('stretakina');
  return { realBalance: isDefaultVip ? 500 : 100, demoBalance: 10000 };
}

export function setUserBalances(email: string, realBalance: number, demoBalance: number): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(USER_BALANCES_KEY);
    const map = raw ? JSON.parse(raw) : {};
    const key = email.toLowerCase().trim();
    map[key] = { realBalance: Number(realBalance), demoBalance: Number(demoBalance) };
    localStorage.setItem(USER_BALANCES_KEY, JSON.stringify(map));

    // If current active user in Orion is this user, sync active config as well!
    const active = loadOrionConfig();
    if (active.userEmail.toLowerCase().trim() === key) {
      saveOrionConfig({
        ...active,
        realBalance: Number(realBalance),
        demoBalance: Number(demoBalance),
      });
    }

    // Dispatch global custom event so all active views update in real-time
    window.dispatchEvent(new CustomEvent('orion_balance_updated', {
      detail: { email: key, realBalance: Number(realBalance), demoBalance: Number(demoBalance) },
    }));
  } catch {}
}

export function loadOrionConfig(): OrionBotSettings {
  if (typeof window === 'undefined') return DEFAULT_ORION_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // First initialization: save default with glkhali7777 preset
      saveOrionConfig(DEFAULT_ORION_CONFIG);
      return DEFAULT_ORION_CONFIG;
    }
    const parsed = JSON.parse(raw);
    const activeEmail = (parsed.userEmail || 'glkhali7777@gmail.com').toLowerCase().trim();
    const balances = getUserBalances(activeEmail);

    return {
      ...DEFAULT_ORION_CONFIG,
      ...parsed,
      realBalance: typeof balances.realBalance === 'number' ? balances.realBalance : parsed.realBalance || 500.0,
      demoBalance: typeof balances.demoBalance === 'number' ? balances.demoBalance : parsed.demoBalance || 10000.0,
      ...(activeEmail === 'glkhali7777@gmail.com' || activeEmail === 'stretakina@gmail.com' ? {
        vibeMode: true,
        plan: 'ouro',
      } : {}),
    };
  } catch {
    return DEFAULT_ORION_CONFIG;
  }
}

export function saveOrionConfig(config: OrionBotSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    // Also sync user balances map
    const key = config.userEmail.toLowerCase().trim();
    const raw = localStorage.getItem(USER_BALANCES_KEY);
    const map = raw ? JSON.parse(raw) : {};
    map[key] = { realBalance: config.realBalance, demoBalance: config.demoBalance };
    localStorage.setItem(USER_BALANCES_KEY, JSON.stringify(map));

    // Also sync the standard keys used by other components
    localStorage.setItem('orion_user_email', config.userEmail);
    localStorage.setItem('orion_user_plan', config.plan);
    localStorage.setItem('orion_vibe_mode', config.vibeMode ? '1' : '0');
    localStorage.setItem('orion_real_balance', String(config.realBalance));

    // Broadcast balance update
    window.dispatchEvent(new CustomEvent('orion_balance_updated', {
      detail: { email: key, realBalance: config.realBalance, demoBalance: config.demoBalance },
    }));
  } catch {}
}
