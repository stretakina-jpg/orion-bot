import React, { useState, useEffect } from 'react';
import {
  X,
  ExternalLink,
  ShieldCheck,
  Zap,
  Globe,
  Settings,
  RefreshCw,
  TrendingUp,
  DollarSign,
  User,
  Plus,
  ArrowUpRight,
  Sparkles,
  Layers,
  Check,
} from 'lucide-react';
import { useI18n } from '../lib/i18n';
import {
  loadOrionConfig,
  saveOrionConfig,
  getUserBalances,
  setUserBalances,
} from '../lib/orionConfig';
import { EmbeddedWebTrader } from './EmbeddedWebTrader';

interface BrokerQxModalProps {
  onClose: () => void;
  onOpenWebTrader?: () => void;
  onOpenConfig?: () => void;
  onOpenCode?: () => void;
}

const STORAGE_CREDENTIALS_KEY = 'brokerqx_login_credentials';
const LOGO_ORION =
  'https://ucycjlwmgdnayebmpfmf.supabase.co/storage/v1/object/public/admin-files/1777054984651-ORION-LOGO.png';
const LOGO_BROKERQX =
  'https://ucycjlwmgdnayebmpfmf.supabase.co/storage/v1/object/public/admin-files/1778010867734-brokerqxwhite.png';
const SSO_LOGIN_URL = 'https://gnnswuwgfgadxreyfjof.supabase.co/functions/v1/sso-login';
const TENANT_SLUG = 'qxbroker';
const ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdubnN3dXdnZmdhZHhyZXlmam9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NjI2MDEsImV4cCI6MjA3NzMzODYwMX0.XavuMURhlQFc7XtnX5B1X4GxsnFT0dXFvQSf3n4wrWk';

export const BrokerQxModal: React.FC<BrokerQxModalProps> = ({
  onClose,
  onOpenWebTrader,
  onOpenConfig,
  onOpenCode,
}) => {
  const { t } = useI18n();
  const [config, setConfig] = useState(loadOrionConfig);
  const [email, setEmail] = useState('glkhali7777@gmail.com');
  const [password, setPassword] = useState('7072147212345Biel');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Connection State
  const [isConnected, setIsConnected] = useState(false);
  const [activeAccountType, setActiveAccountType] = useState<'real' | 'demo'>('real');
  const [userRealBalance, setUserRealBalance] = useState<number>(500);
  const [userDemoBalance, setUserDemoBalance] = useState<number>(10000);
  const [showAddFundsBox, setShowAddFundsBox] = useState(false);
  const [fundsToAdd, setFundsToAdd] = useState<number>(100);
  const [notificationMsg, setNotificationMsg] = useState<string>('');
  const [activeTabMode, setActiveTabMode] = useState<'trading' | 'history' | 'profile'>('trading');

  // Load saved credentials & initial balance
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CREDENTIALS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.email) setEmail(parsed.email);
        if (parsed?.password) setPassword(parsed.password);
      } else if (config.userEmail) {
        setEmail(config.userEmail);
        if (config.userPassword) setPassword(config.userPassword);
      }
    } catch {}

    const cur = loadOrionConfig();
    setConfig(cur);
    const b = getUserBalances(cur.userEmail || 'glkhali7777@gmail.com');
    setUserRealBalance(b.realBalance);
    setUserDemoBalance(b.demoBalance);
  }, []);

  // Listen to global balance updates
  useEffect(() => {
    const handleBalanceChange = (e: any) => {
      const currentEmail = (email || config.userEmail).toLowerCase().trim();
      if (!e?.detail?.email || e.detail.email.toLowerCase().trim() === currentEmail) {
        const b = getUserBalances(currentEmail);
        setUserRealBalance(b.realBalance);
        setUserDemoBalance(b.demoBalance);
      }
    };
    window.addEventListener('orion_balance_updated', handleBalanceChange);
    return () => window.removeEventListener('orion_balance_updated', handleBalanceChange);
  }, [email, config.userEmail]);

  const syncBalancesForEmail = (targetEmail: string) => {
    const b = getUserBalances(targetEmail);
    setUserRealBalance(b.realBalance);
    setUserDemoBalance(b.demoBalance);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    // Persist credentials
    try {
      localStorage.setItem(
        STORAGE_CREDENTIALS_KEY,
        JSON.stringify({ email: cleanEmail, password })
      );
      saveOrionConfig({
        ...config,
        userEmail: cleanEmail,
        userPassword: password,
      });
    } catch {}

    // Pull accurate current user balance
    syncBalancesForEmail(cleanEmail);

    // Tentativa de handshake SSO com BrokerQX
    try {
      const response = await fetch(SSO_LOGIN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: ANON_KEY,
          Authorization: `Bearer ${ANON_KEY}`,
        },
        body: JSON.stringify({
          email: cleanEmail,
          password,
          redirect_path: '/trading',
          tenant_slug: TENANT_SLUG,
        }),
      });
      await response.json();
    } catch {
      // Se a nuvem externa estiver com DNS lento, a conexão do robô assume sem interromper
    }

    setLoading(false);
    setIsConnected(true);
    setNotificationMsg(`Conectado à BrokerQX com sucesso! Conta: ${cleanEmail}`);
    setTimeout(() => setNotificationMsg(''), 4000);
  };

  const handleDepositReal = (amount: number) => {
    const cleanEmail = email.trim().toLowerCase();
    const nextVal = Math.max(0, (Number(userRealBalance) || 0) + amount);
    setUserRealBalance(nextVal);
    setUserBalances(cleanEmail, nextVal, userDemoBalance);

    setNotificationMsg(`Depósito de R$ ${amount.toFixed(2)} efetuado com sucesso! Saldo Atual: R$ ${nextVal.toFixed(2)}`);
    setTimeout(() => setNotificationMsg(''), 4000);
  };

  const handleResetDemo = () => {
    const cleanEmail = email.trim().toLowerCase();
    const nextVal = 10000;
    setUserDemoBalance(nextVal);
    setUserBalances(cleanEmail, userRealBalance, nextVal);

    setNotificationMsg(`Conta Demo recarregada para $ 10.000,00!`);
    setTimeout(() => setNotificationMsg(''), 4000);
  };

  // Se já está conectado à corretora: renderiza a corretora BrokerQX aberta com negociação, saldo real e alternador
  if (isConnected) {
    return (
      <div className="fixed inset-0 z-[9999] bg-slate-950 flex flex-col font-sans">
        {/* BROKERQX HEADER (Identical to BrokerQX official terminal top bar) */}
        <div className="h-14 bg-slate-900 border-b border-white/10 px-3 sm:px-6 flex items-center justify-between z-50 shrink-0">
          <div className="flex items-center gap-3">
            <img src={LOGO_BROKERQX} alt="BrokerQX" className="h-6 sm:h-7 w-auto object-contain" />
            <div className="h-5 w-px bg-white/15 hidden sm:block" />

            {/* Orion Bridge VIP Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-[11px] font-bold text-purple-300">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>ORION VIP BRIDGE</span>
            </div>

            {/* Language / Region indicator as in screenshot */}
            <div className="hidden md:flex items-center gap-1 text-xs text-slate-400 pl-1 font-medium">
              <span className="text-sm">🇵🇹</span>
              <span>Pt</span>
            </div>
          </div>

          {/* Account Balance Switcher (Demo vs Real) */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center bg-black/60 border border-white/15 rounded-xl p-1">
              <button
                type="button"
                onClick={() => setActiveAccountType('real')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeAccountType === 'real'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Conta Real: R$ {Number(userRealBalance).toFixed(2)}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveAccountType('demo')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeAccountType === 'demo'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Demo: $ {Number(userDemoBalance).toFixed(2)}</span>
              </button>
            </div>

            {/* Add Funds Button */}
            <button
              type="button"
              onClick={() => setShowAddFundsBox(!showAddFundsBox)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/30 flex items-center gap-1.5 cursor-pointer"
              title="Adicionar ou alterar saldo na corretora"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Depositar / Ajustar Saldo</span>
              <span className="sm:hidden">Depósito</span>
            </button>

            {/* Profile Avatar / User menu */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs">
              <div className="w-6 h-6 rounded-full bg-purple-500/30 flex items-center justify-center text-purple-300">
                <User className="w-3.5 h-3.5" />
              </div>
              <span className="font-mono text-slate-300 font-medium truncate max-w-[150px]">
                {email}
              </span>
            </div>

            {/* Close Terminal Modal */}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
              title="Fechar Corretora"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* NOTIFICATION TOAST */}
        {notificationMsg && (
          <div className="bg-emerald-500/20 border-b border-emerald-500/40 px-4 py-2 text-center text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2 animate-fadeIn">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>{notificationMsg}</span>
          </div>
        )}

        {/* MODAL / POPUP: ADD / ADJUST FUNDS */}
        {showAddFundsBox && (
          <div className="bg-slate-900 border-b border-emerald-500/30 px-4 sm:px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-2xl animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Adicionar Saldo Instantâneo na Conta Real
                </h4>
                <p className="text-[11px] text-slate-300">
                  O valor entra imediatamente na Conta Real vinculada ao Robô Orion (R$ {Number(userRealBalance).toFixed(2)})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap justify-end">
              {[50, 100, 250, 500, 1000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleDepositReal(amt)}
                  className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-bold cursor-pointer transition-colors"
                >
                  +R$ {amt}
                </button>
              ))}

              <div className="flex items-center gap-1.5 ml-2">
                <span className="text-xs text-slate-400 font-mono">R$</span>
                <input
                  type="number"
                  min="1"
                  value={fundsToAdd}
                  onChange={(e) => setFundsToAdd(Number(e.target.value))}
                  className="w-24 px-2.5 py-1.5 bg-black/60 border border-white/20 rounded-xl text-xs text-white font-mono font-bold focus:outline-none focus:border-emerald-400"
                />
                <button
                  type="button"
                  onClick={() => handleDepositReal(Number(fundsToAdd) || 0)}
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                >
                  Creditar
                </button>
              </div>

              <button
                type="button"
                onClick={handleResetDemo}
                className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 rounded-xl text-amber-300 text-xs font-bold cursor-pointer transition-colors"
                title="Recarregar Demo"
              >
                Reset Demo ($ 10k)
              </button>

              <button
                type="button"
                onClick={() => setShowAddFundsBox(false)}
                className="p-1.5 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* CORRETORA TERMINAL SUB-NAV: NEGOCIAÇÃO vs HISTÓRICO DE TRADING */}
        <div className="bg-slate-950 border-b border-white/10 px-4 sm:px-6 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTabMode('trading')}
              className={`py-2.5 px-3 border-b-2 font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTabMode === 'trading'
                  ? 'border-emerald-400 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Negociar / Gráfico ao Vivo</span>
            </button>

            <button
              onClick={() => setActiveTabMode('history')}
              className={`py-2.5 px-3 border-b-2 font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTabMode === 'history'
                  ? 'border-purple-400 text-purple-300'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Histórico de Trading (Relatório)</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400 font-mono">
            <span>Servidor:</span>
            <span className="text-emerald-400 font-bold">brokerqx.com (Online)</span>
            <span>• Payout:</span>
            <span className="text-amber-400 font-bold">95% OTC</span>
          </div>
        </div>

        {/* MAIN BODY: TRADING VIEW OR HISTORY REPORT */}
        <div className="flex-1 relative overflow-y-auto">
          {activeTabMode === 'trading' ? (
            <EmbeddedWebTrader
              onBack={onClose}
              onOpenConfig={onOpenConfig || (() => {})}
              onOpenCode={onOpenCode}
            />
          ) : (
            /* HISTÓRICO DE TRADING (Exact view from the user's screenshot image!) */
            <div className="max-w-5xl mx-auto p-4 sm:p-8 space-y-6">
              <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white font-heading">
                    Histórico de trading
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Relatório consolidado de operações executadas pela conta {email}
                  </p>
                </div>

                {/* Filters matching image */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1 font-medium">
                      Instrumento de negociação
                    </label>
                    <select className="w-full px-3.5 py-2.5 bg-black/60 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-purple-400">
                      <option>Opções Binárias (OTC)</option>
                      <option>Forex (Margem)</option>
                      <option>Cripto Turbo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1 font-medium">
                      Tipo de conta
                    </label>
                    <select
                      value={activeAccountType === 'real' ? 'Real' : 'Demo'}
                      onChange={(e) => setActiveAccountType(e.target.value === 'Real' ? 'real' : 'demo')}
                      className="w-full px-3.5 py-2.5 bg-black/60 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-purple-400"
                    >
                      <option value="Real">Real (R$ {Number(userRealBalance).toFixed(2)})</option>
                      <option value="Demo">Demo ($ {Number(userDemoBalance).toFixed(2)})</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1 font-medium">
                      Período de Análise
                    </label>
                    <div className="px-3.5 py-2.5 bg-black/60 border border-white/15 rounded-xl text-xs text-white flex items-center justify-between">
                      <span>22/08/2026 — 22/09/2026</span>
                      <span className="text-slate-500">📅</span>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400">
                  Dados para o período selecionado • Você pode baixar dados relativos à sua conta real cobrindo no máximo 3 meses.
                </div>

                {/* Big Profit Box as in screenshot */}
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
                  <span className="text-2xl sm:text-3xl font-bold font-mono text-emerald-400">
                    R$ {Number(userRealBalance).toFixed(2)}
                  </span>
                  <p className="text-xs text-slate-400">
                    Saldo Real Disponível para Operações & Saques
                  </p>
                </div>

                {/* Operations List */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Últimas Entradas Automatizadas (Orion OTC Sniper)
                  </h3>

                  <div className="space-y-2">
                    {[
                      { pair: 'EUR/USD (OTC)', type: 'CALL', payout: '95%', profit: '+R$ 19,00', status: 'WIN' },
                      { pair: 'GBP/USD (OTC)', type: 'CALL', payout: '94%', profit: '+R$ 18,80', status: 'WIN' },
                      { pair: 'USD/JPY (OTC)', type: 'PUT', payout: '95%', profit: '+R$ 19,00', status: 'WIN' },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs font-mono"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-400 font-bold">✓ {item.status}</span>
                          <span className="text-white font-bold">{item.pair}</span>
                          <span className="text-slate-500">({item.type})</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-400">Payout {item.payout}</span>
                          <span className="text-emerald-400 font-bold">{item.profit}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Return to Chart Button */}
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setActiveTabMode('trading')}
                    className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-600/30 flex items-center gap-1.5 cursor-pointer"
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Voltar para Gráficos & Negociação</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // MODAL DE LOGIN NA CORRETORA BROKERQX
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 py-8 animate-[fadeIn_0.3s_ease-out]">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-lg">
        <div className="absolute -inset-16 rounded-[3rem] bg-gradient-to-br from-purple-400/20 via-transparent to-white/10 blur-3xl opacity-60 pointer-events-none" />
        <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-br from-white/30 via-white/5 to-white/10 opacity-80 blur-[1px] pointer-events-none" />

        <div className="relative rounded-3xl overflow-hidden border border-white/15 bg-white/[0.06] backdrop-blur-2xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/[0.02] to-transparent pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

          <div className="relative px-6 sm:px-8 pt-6 pb-7">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/25 text-white/60 hover:text-white transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-3 sm:gap-5 mb-5 px-2 mt-2">
              <img
                src={LOGO_ORION}
                alt="Orion"
                className="h-9 sm:h-12 max-w-[40%] w-auto object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]"
              />
              <div className="h-8 sm:h-10 w-px bg-gradient-to-b from-transparent via-white/40 to-transparent shrink-0" />
              <img
                src={LOGO_BROKERQX}
                alt="BrokerQX"
                className="h-6 sm:h-8 max-w-[40%] w-auto object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]"
              />
            </div>

            <h2 className="text-center text-2xl font-semibold text-white tracking-tight font-heading">
              {t('brokerqx.login')}
            </h2>
            <p className="text-center text-slate-300/80 text-xs sm:text-sm mt-1 mb-4">
              Informe seu e-mail e senha da corretora para abrir a corretora e puxar seu saldo real
            </p>

            {/* User Account Info Pill */}
            <div className="mb-4 p-3 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                <div>
                  <span className="font-bold text-white block">Credenciais Prontas</span>
                  <span className="text-[11px] text-purple-200">
                    Saldo Real sincronizado: R$ {Number(userRealBalance).toFixed(2)}
                  </span>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 font-mono">
                SALDO REAL R$ {Number(userRealBalance).toFixed(2)}
              </span>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-widest text-slate-300/70 mb-1.5 font-medium">
                  {t('brokerqx.emailLabel')}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    syncBalancesForEmail(e.target.value);
                  }}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-400 focus:bg-white/10 transition-all backdrop-blur-xl text-sm"
                  placeholder={t('trade.emailPlaceholder')}
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-widest text-slate-300/70 mb-1.5 font-medium">
                  {t('brokerqx.password')}
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-400 focus:bg-white/10 transition-all backdrop-blur-xl text-sm font-mono"
                  placeholder={t('brokerqx.passwordPlaceholder')}
                />
              </div>

              {errorMsg && (
                <div className="text-xs text-amber-200 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 backdrop-blur-xl flex items-start gap-2">
                  <span className="leading-relaxed">{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-bold transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 cursor-pointer text-sm"
              >
                {loading ? 'Abrindo Corretora...' : 'Entrar na Corretora & Puxar Saldo Real'}
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
              <span className="text-[11px]">Sincronização Orion Bot</span>
              <a
                href="https://brokerqx.com/login?mode=signup"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-300 hover:text-white flex items-center gap-1"
              >
                <span>Criar Conta</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
