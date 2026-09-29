import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ExternalLink, Power, PowerOff, TrendingUp, TrendingDown } from 'lucide-react';
import { AlpineClient } from '../lib/alpineWs';
import { supabase } from '../lib/supabase';
import { CandleChart } from './CandleChart';
import { AlpineActive, AlpineBalance, BotTrade } from '../types';

interface AlpineDashboardProps {
  onBack: () => void;
  userEmail: string;
}

const LOGO_ORION =
  'https://ucycjlwmgdnayebmpfmf.supabase.co/storage/v1/object/public/admin-files/1777054984651-ORION-LOGO.png';
const LOGO_ALPINE =
  'https://ucycjlwmgdnayebmpfmf.supabase.co/storage/v1/object/public/admin-files/1777055340200-alpineforex.png';
const SSID_PREFIX = 'alpine_ssid_';
const EXPIRY_SECONDS = 30;
const TRADE_AMOUNT_CENTS = 200; // $2.00 default

function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return '';
  let id = window.localStorage.getItem('alpine_bot_session_id');
  if (!id) {
    id = (crypto.randomUUID && crypto.randomUUID()) || `s_${Date.now()}_${Math.random()}`;
    window.localStorage.setItem('alpine_bot_session_id', id);
  }
  return id;
}

export const AlpineDashboard: React.FC<AlpineDashboardProps> = ({ onBack, userEmail }) => {
  const storageKey = userEmail ? `${SSID_PREFIX}${userEmail}` : `${SSID_PREFIX}default`;

  const [viewState, setViewState] = useState<'login' | 'dashboard'>('login');
  const [hasStoredSsid, setHasStoredSsid] = useState(() =>
    typeof window === 'undefined' ? false : !!window.localStorage.getItem(storageKey)
  );

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const [realBalance, setRealBalance] = useState<AlpineBalance | null>(null);
  const [selectedActiveId, setSelectedActiveId] = useState<number | null>(null);
  const [activesList, setActivesList] = useState<AlpineActive[]>([]);
  const [isBotActive, setIsBotActive] = useState(false);

  const [candlePoints, setCandlePoints] = useState<number[]>([]);
  const [livePrice, setLivePrice] = useState<number | null>(null);
  const [tradesHistory, setTradesHistory] = useState<BotTrade[]>([]);
  const [, setForceTick] = useState(0);

  const clientRef = useRef<AlpineClient | null>(null);
  const subscribeActiveRef = useRef<number | null>(null);
  const simIntervalRef = useRef<any>(null);
  const lastTickTimeRef = useRef<number>(0);
  const latestPriceRef = useRef<number | null>(null);
  const tradesRef = useRef<BotTrade[]>([]);
  const lastMinuteTradedRef = useRef<number>(-1);
  const botActiveRef = useRef(false);
  const botSessionIdRef = useRef(getOrCreateSessionId());
  const tickTimestampsRef = useRef<number[]>([]);

  useEffect(() => {
    botActiveRef.current = isBotActive;
  }, [isBotActive]);

  useEffect(() => {
    tradesRef.current = tradesHistory;
  }, [tradesHistory]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
      clientRef.current?.disconnect();
    };
  }, []);

  const initData = async (client: AlpineClient) => {
    const balances = await client.getBalances();
    const realBal = balances.find((b) => b.type === 1) || null;
    setRealBalance(realBal);

    const initData = await client.getInitializationData();
    const turboActives = initData?.turbo?.actives || {};
    const filtered: AlpineActive[] = [];

    for (const key of Object.keys(turboActives)) {
      const act = turboActives[key];
      if (
        act?.enabled &&
        !act?.is_suspended &&
        act?.provider === 'OTC' &&
        typeof act?.ticker === 'string' &&
        act.ticker.includes('-OTC')
      ) {
        filtered.push({
          id: act.id,
          ticker: act.ticker,
          profit: 100 - (act?.option?.profit?.commission ?? 15),
        });
      }
    }

    // Sort by highest profit
    filtered.sort((a, b) => b.profit - a.profit);
    setActivesList(filtered);
    setSelectedActiveId(filtered[0]?.id ?? null);
    setViewState('dashboard');
  };

  // Restore stored session if available
  useEffect(() => {
    if (!hasStoredSsid || viewState !== 'login') return;
    const ssid = window.localStorage.getItem(storageKey);
    if (!ssid) {
      setHasStoredSsid(false);
      return;
    }

    let isCancelled = false;
    (async () => {
      setIsLoggingIn(true);
      setLoginError(null);
      try {
        const client = new AlpineClient();
        clientRef.current = client;
        await client.connect(ssid);
        if (isCancelled) return;
        await initData(client);
      } catch {
        window.localStorage.removeItem(storageKey);
        clientRef.current?.disconnect();
        clientRef.current = null;
        if (!isCancelled) setHasStoredSsid(false);
      } finally {
        if (!isCancelled) setIsLoggingIn(false);
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [hasStoredSsid, viewState, storageKey]);

  // Login handler
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      const client = new AlpineClient();
      clientRef.current = client;
      const res = await client.login(loginEmail.trim(), loginPassword);
      if (!res.ssid) {
        throw new Error(res.message || res.error || 'Credenciais inválidas');
      }
      await client.connect(res.ssid);
      window.localStorage.setItem(storageKey, res.ssid);
      await initData(client);
    } catch (err: any) {
      setLoginError(err.message || 'Erro ao fazer login na Alpine');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Subscribe to candles
  useEffect(() => {
    if (viewState !== 'dashboard' || !selectedActiveId || !clientRef.current) return;

    if (subscribeActiveRef.current && subscribeActiveRef.current !== selectedActiveId) {
      clientRef.current.unsubscribeCandles(subscribeActiveRef.current, 5);
    }
    subscribeActiveRef.current = selectedActiveId;
    setCandlePoints([]);
    setLivePrice(null);
    lastTickTimeRef.current = 0;

    clientRef.current.subscribeCandles(selectedActiveId, 5);

    const unsubscribe = clientRef.current.on((event) => {
      if (event?.name !== 'candle-generated') return;
      const msg = event?.msg;
      if (!msg || msg.active_id !== selectedActiveId) return;

      const price = typeof msg.close === 'number' ? msg.close : msg?.price;
      if (typeof price !== 'number') return;

      const now = Date.now();
      lastTickTimeRef.current = now;
      tickTimestampsRef.current.push(now);
      if (tickTimestampsRef.current.length > 200) {
        tickTimestampsRef.current.splice(0, tickTimestampsRef.current.length - 200);
      }

      latestPriceRef.current = price;
      setLivePrice(price);
      setCandlePoints((prev) => {
        const next = [...prev, price];
        return next.length > 180 ? next.slice(-180) : next;
      });
    });

    // Fallback simulation ticks if broker WS stream has small gaps
    if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    simIntervalRef.current = setInterval(() => {
      if (Date.now() - lastTickTimeRef.current < 3000) return;
      setCandlePoints((prev) => {
        const base = prev.length > 0 ? prev[prev.length - 1] : 1.08542;
        const delta = (Math.random() - 0.5) * base * 0.00012;
        const updated = base + delta;
        latestPriceRef.current = updated;
        setLivePrice(updated);
        const next = [...prev, updated];
        return next.length > 180 ? next.slice(-180) : next;
      });
    }, 400);

    return () => {
      unsubscribe();
      if (simIntervalRef.current) {
        clearInterval(simIntervalRef.current);
        simIntervalRef.current = null;
      }
    };
  }, [viewState, selectedActiveId]);

  // Order placement
  const executeBotOrder = async () => {
    if (!realBalance || !selectedActiveId || !clientRef.current) return;
    const active = activesList.find((a) => a.id === selectedActiveId);
    if (!active) return;
    const price = latestPriceRef.current;
    if (price == null) return;

    const direction: 'call' | 'put' = Math.random() > 0.5 ? 'call' : 'put';
    const now = Date.now();
    const expiresAt = now + EXPIRY_SECONDS * 1000;

    try {
      const res = await clientRef.current.placeBlitz({
        user_balance_id: realBalance.id,
        active_id: selectedActiveId,
        direction,
        expiration_size: EXPIRY_SECONDS,
        price_cents: TRADE_AMOUNT_CENTS,
        profit_percent: active.profit,
      });

      if (res?.status !== 2000) {
        console.warn('Ordem recusada pela corretora:', res);
        return;
      }

      // Record in Supabase or local state
      let tradeId: string | null = null;
      try {
        const { data } = await supabase.rpc('insert_bot_trade', {
          p_session_id: botSessionIdRef.current,
          p_ticker: active.ticker,
          p_direction: direction,
          p_entry_price: price,
          p_amount_cents: TRADE_AMOUNT_CENTS,
          p_expires_at: new Date(expiresAt).toISOString(),
        });
        tradeId = data;
      } catch {}

      const newTrade: BotTrade = {
        id: tradeId || `local_${now}`,
        ticker: active.ticker,
        direction,
        entryPrice: price,
        exitPrice: null,
        amountCents: TRADE_AMOUNT_CENTS,
        status: 'pending',
        createdAt: now,
        expiresAt,
      };

      setTradesHistory((prev) => [newTrade, ...prev].slice(0, 30));
    } catch (err) {
      console.error('Falha ao enviar ordem:', err);
    }
  };

  // Resolve pending trades
  const resolveTrade = async (trade: BotTrade) => {
    const currentP = latestPriceRef.current;
    if (currentP == null) return;

    let result: 'win' | 'loss' | 'doji' = 'loss';
    if (currentP === trade.entryPrice) {
      result = 'doji';
    } else if (trade.direction === 'call') {
      result = currentP > trade.entryPrice ? 'win' : 'loss';
    } else {
      result = currentP < trade.entryPrice ? 'win' : 'loss';
    }

    setTradesHistory((prev) =>
      prev.map((t) => (t.id === trade.id ? { ...t, exitPrice: currentP, status: result } : t))
    );

    try {
      await supabase.rpc('resolve_bot_trade', {
        p_id: trade.id,
        p_session_id: botSessionIdRef.current,
        p_exit_price: currentP,
        p_status: result,
      });
    } catch {}
  };

  // Bot timer loop
  useEffect(() => {
    if (viewState !== 'dashboard') return;
    const interval = setInterval(() => {
      setForceTick((v) => v + 1);
      const date = new Date();
      const min = date.getMinutes();
      const sec = date.getSeconds();

      // Trigger automatic entry at second 0 of even minutes
      if (botActiveRef.current && sec === 0 && min % 2 === 0 && lastMinuteTradedRef.current !== min) {
        lastMinuteTradedRef.current = min;
        executeBotOrder();
      }

      // Check expired trades
      const now = Date.now();
      tradesRef.current
        .filter((t) => t.status === 'pending' && now >= t.expiresAt)
        .forEach((t) => resolveTrade(t));
    }, 250);

    return () => clearInterval(interval);
  }, [viewState, selectedActiveId, realBalance, activesList]);

  const toggleBot = () => {
    if (isBotActive) {
      setIsBotActive(false);
    } else {
      if (!realBalance || !selectedActiveId) return;
      setIsBotActive(true);
      lastMinuteTradedRef.current = -1;
    }
  };

  const formatCurrency = (val: number, cur?: string) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: cur || 'USD',
    }).format(val);

  // LOGIN SCREEN
  if (viewState === 'login') {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 py-12">
        <div className="relative w-full max-w-md">
          <div className="absolute -inset-16 rounded-[3rem] bg-gradient-to-br from-blue-400/20 via-transparent to-white/10 blur-3xl opacity-60 pointer-events-none" />
          <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-br from-white/30 via-white/5 to-white/10 opacity-80 blur-[1px] pointer-events-none" />

          <div className="relative rounded-3xl overflow-hidden border border-white/15 bg-white/[0.06] backdrop-blur-2xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/[0.02] to-transparent pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

            <div className="relative px-8 pt-6 pb-7">
              <button
                onClick={onBack}
                className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </button>

              <div className="flex items-center justify-center gap-3 sm:gap-5 mb-6 px-2">
                <img
                  src={LOGO_ORION}
                  alt="Orion"
                  className="h-9 sm:h-12 max-w-[40%] w-auto object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]"
                />
                <div className="h-8 sm:h-10 w-px bg-gradient-to-b from-transparent via-white/40 to-transparent shrink-0" />
                <img
                  src={LOGO_ALPINE}
                  alt="Alpine Forex"
                  className="h-6 sm:h-8 max-w-[40%] w-auto object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]"
                />
              </div>

              <h2 className="text-center text-2xl font-semibold text-white tracking-tight">
                Entrar na Alpine
              </h2>
              <p className="text-center text-slate-300/80 text-sm mt-1.5 mb-6">
                Use o e-mail e senha da sua conta Alpine Forex.
              </p>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-widest text-slate-300/70 mb-2 font-medium">
                    E-mail Alpine
                  </label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all backdrop-blur-xl"
                    placeholder="seuemail@exemplo.com"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-widest text-slate-300/70 mb-2 font-medium">
                    Senha
                  </label>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all backdrop-blur-xl"
                    placeholder="Sua senha"
                  />
                </div>

                {loginError && (
                  <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-xl p-3 backdrop-blur-xl">
                    {loginError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-3.5 bg-white/90 hover:bg-white text-slate-900 rounded-xl font-semibold transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-black/30 cursor-pointer"
                >
                  {isLoggingIn ? 'Entrando...' : 'Entrar'}
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-white/10">
                <p className="text-center text-xs text-white/50 mb-3">
                  Ainda não tem uma conta na Alpine?
                </p>
                <a
                  href="https://trade.alpineforex.com/pt/register"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/15 hover:border-white/30 text-white rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 backdrop-blur-xl text-sm"
                >
                  Registrar na Alpine
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // DASHBOARD VIEW
  const currentActive = activesList.find((a) => a.id === selectedActiveId);
  const nowMs = Date.now();

  const winCount = tradesHistory.filter((t) => t.status === 'win').length;
  const lossCount = tradesHistory.filter((t) => t.status === 'loss').length;
  const ticksPerSecond =
    tickTimestampsRef.current.filter((ts) => nowMs - ts < 10000).length / 10;

  // Calculate market directional pressure (last 30 ticks)
  const recent = candlePoints.slice(-30);
  let ups = 0;
  let downs = 0;
  for (let i = 1; i < recent.length; i++) {
    if (recent[i] > recent[i - 1]) ups++;
    else if (recent[i] < recent[i - 1]) downs++;
  }
  const totalDeltas = ups + downs;
  const upPercent = totalDeltas > 0 ? Math.round((ups * 100) / totalDeltas) : 50;
  const downPercent = totalDeltas > 0 ? 100 - upPercent : 50;

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-10 py-4 lg:py-6">
      <div className="max-w-[1400px] lg:max-w-[1800px] mx-auto">
        {/* Top Header */}
        <div className="flex items-center justify-center mb-3 lg:mb-5 gap-3">
          <div className="flex items-center gap-3 lg:gap-5">
            <img
              src={LOGO_ORION}
              alt="Orion"
              className="h-7 sm:h-8 lg:h-12 w-auto object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.7)]"
            />
            <div className="h-6 lg:h-9 w-px bg-gradient-to-b from-transparent via-white/40 to-transparent" />
            <img
              src={LOGO_ALPINE}
              alt="Alpine Forex"
              className="h-5 sm:h-6 lg:h-9 w-auto object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.7)]"
            />
          </div>
        </div>

        {/* Main Terminal Grid */}
        <div className="rounded-2xl border border-white/10 bg-slate-950/60 backdrop-blur-xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.8)] overflow-hidden">
          <div className="grid items-stretch grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:grid-cols-[minmax(0,2.4fr)_minmax(0,1fr)] h-[320px] sm:h-[380px] lg:h-[760px] divide-x divide-white/10">
            {/* Left Column: Stats & Operations */}
            <div className="h-full min-w-0 flex flex-col overflow-hidden">
              {/* Account Bar */}
              <div className="px-2 sm:px-3 lg:px-5 py-2 lg:py-3.5 border-b border-white/10 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 lg:gap-3 min-w-0">
                  <div className="min-w-0">
                    <p className="text-[8px] sm:text-[9px] lg:text-[10px] uppercase tracking-[0.18em] text-white/50 leading-none font-semibold">
                      Saldo
                    </p>
                    <p className="text-[11px] sm:text-sm lg:text-lg font-bold text-white tracking-tight truncate leading-tight mt-0.5">
                      {realBalance ? formatCurrency(realBalance.amount, realBalance.currency) : '---'}
                    </p>
                  </div>

                  <button
                    onClick={toggleBot}
                    aria-label={isBotActive ? 'Desligar robô' : 'Ligar robô'}
                    className={`shrink-0 w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                      isBotActive
                        ? 'bg-rose-500/90 hover:bg-rose-500 text-white shadow-[0_4px_18px_-4px_rgba(244,63,94,0.8)]'
                        : 'bg-white/90 hover:bg-white text-slate-900 shadow-[0_4px_18px_-4px_rgba(255,255,255,0.4)]'
                    }`}
                  >
                    {isBotActive ? (
                      <PowerOff className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4" />
                    ) : (
                      <Power className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4" />
                    )}
                  </button>
                </div>

                {/* Win / Loss badges */}
                <div className="flex items-center gap-1 lg:gap-2 text-[9px] sm:text-[10px] lg:text-xs font-semibold tabular-nums shrink-0">
                  <span className="px-1 lg:px-2 py-0.5 lg:py-1 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-400/30">
                    {winCount}W
                  </span>
                  <span className="px-1 lg:px-2 py-0.5 lg:py-1 rounded bg-rose-500/15 text-rose-300 border border-rose-400/30">
                    {lossCount}L
                  </span>
                </div>
              </div>

              {/* Gauges and Trend Pressure */}
              <div className="flex-1 overflow-y-auto">
                <div className="px-2 sm:px-4 lg:px-6 pt-3 lg:pt-5 pb-2 lg:pb-4 border-b border-white/10">
                  <div className="grid grid-cols-[1fr_auto] gap-3 lg:gap-5 items-center">
                    {/* Tick Volume Gauge */}
                    <div className="flex flex-col items-center justify-center min-w-0">
                      <svg viewBox="0 0 100 60" className="w-full max-w-[160px] lg:max-w-[200px] h-auto">
                        <defs>
                          <linearGradient id="gaugeFillAlpine" x1="0" x2="1" y1="0" y2="0">
                            <stop offset="0%" stopColor="#22d3ee" />
                            <stop offset="60%" stopColor="#34d399" />
                            <stop offset="100%" stopColor="#fbbf24" />
                          </linearGradient>
                        </defs>
                        <path
                          d="M 10 55 A 40 40 0 0 1 90 55"
                          fill="none"
                          stroke="rgba(255,255,255,0.08)"
                          strokeWidth="8"
                          strokeLinecap="round"
                        />
                        <path
                          d="M 10 55 A 40 40 0 0 1 90 55"
                          fill="none"
                          stroke={isBotActive ? 'url(#gaugeFillAlpine)' : 'rgba(255,255,255,0.18)'}
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray={`${Math.max(0, Math.min(1, ticksPerSecond / 10)) * Math.PI * 40} ${
                            Math.PI * 40
                          }`}
                          style={{ transition: 'stroke-dasharray 400ms ease-out' }}
                        />
                        <text
                          x="50"
                          y="46"
                          textAnchor="middle"
                          className="font-bold tabular-nums"
                          fill={isBotActive ? '#ffffff' : 'rgba(255,255,255,0.4)'}
                          style={{ fontSize: 14 }}
                        >
                          {isBotActive ? ticksPerSecond.toFixed(1) : '--'}
                        </text>
                        <text
                          x="50"
                          y="56"
                          textAnchor="middle"
                          fill="rgba(255,255,255,0.45)"
                          style={{ fontSize: 5, letterSpacing: 1.2 }}
                        >
                          TICKS/S
                        </text>
                      </svg>
                      <p className="mt-1 lg:mt-1.5 text-[8px] sm:text-[9px] lg:text-[10px] uppercase tracking-[0.2em] text-white/45 font-semibold">
                        Volume
                      </p>
                    </div>

                    {/* Alta / Queda percentage indicators */}
                    <div className="flex flex-col gap-1.5 lg:gap-2.5 shrink-0">
                      {/* Alta */}
                      <div
                        className={`relative overflow-hidden rounded-xl lg:rounded-2xl px-2.5 lg:px-3.5 py-2 lg:py-2.5 min-w-[100px] lg:min-w-[140px] backdrop-blur-xl transition-all duration-500 ${
                          isBotActive
                            ? 'bg-gradient-to-br from-emerald-500/25 via-emerald-500/[0.06] to-transparent ring-1 ring-emerald-400/30'
                            : 'bg-white/[0.03] ring-1 ring-white/10'
                        }`}
                      >
                        <div className="relative flex items-center gap-2 lg:gap-2.5">
                          <div
                            className={`shrink-0 w-6 h-6 lg:w-8 lg:h-8 rounded-lg flex items-center justify-center ${
                              isBotActive
                                ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/40'
                                : 'bg-white/5 text-white/30'
                            }`}
                          >
                            <TrendingUp className="w-3 h-3 lg:w-4 lg:h-4" />
                          </div>
                          <div className="min-w-0 flex-1 leading-none">
                            <p className="text-[8px] sm:text-[9px] lg:text-[10px] uppercase tracking-[0.2em] font-semibold text-emerald-200/90">
                              Alta
                            </p>
                            <p className="mt-1 text-lg lg:text-2xl font-bold tabular-nums text-white">
                              {isBotActive ? `${upPercent}%` : '--'}
                            </p>
                          </div>
                        </div>
                        <div className="relative mt-2 lg:mt-2.5 h-1 lg:h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                          <div
                            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-cyan-300 transition-[width] duration-700 ease-out"
                            style={{ width: isBotActive ? `${upPercent}%` : '0%' }}
                          />
                        </div>
                      </div>

                      {/* Queda */}
                      <div
                        className={`relative overflow-hidden rounded-xl lg:rounded-2xl px-2.5 lg:px-3.5 py-2 lg:py-2.5 min-w-[100px] lg:min-w-[140px] backdrop-blur-xl transition-all duration-500 ${
                          isBotActive
                            ? 'bg-gradient-to-br from-rose-500/25 via-rose-500/[0.06] to-transparent ring-1 ring-rose-400/30'
                            : 'bg-white/[0.03] ring-1 ring-white/10'
                        }`}
                      >
                        <div className="relative flex items-center gap-2 lg:gap-2.5">
                          <div
                            className={`shrink-0 w-6 h-6 lg:w-8 lg:h-8 rounded-lg flex items-center justify-center ${
                              isBotActive
                                ? 'bg-rose-500/20 text-rose-300 ring-1 ring-rose-400/40'
                                : 'bg-white/5 text-white/30'
                            }`}
                          >
                            <TrendingDown className="w-3 h-3 lg:w-4 lg:h-4" />
                          </div>
                          <div className="min-w-0 flex-1 leading-none">
                            <p className="text-[8px] sm:text-[9px] lg:text-[10px] uppercase tracking-[0.2em] font-semibold text-rose-200/90">
                              Queda
                            </p>
                            <p className="mt-1 text-lg lg:text-2xl font-bold tabular-nums text-white">
                              {isBotActive ? `${downPercent}%` : '--'}
                            </p>
                          </div>
                        </div>
                        <div className="relative mt-2 lg:mt-2.5 h-1 lg:h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                          <div
                            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-rose-500 via-rose-400 to-amber-300 transition-[width] duration-700 ease-out"
                            style={{ width: isBotActive ? `${downPercent}%` : '0%' }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Operations History Header */}
                <div className="px-2 sm:px-4 lg:px-6 pt-2.5 pb-1">
                  <p className="text-[8px] sm:text-[9px] lg:text-[10px] uppercase tracking-[0.18em] text-white/40 font-semibold">
                    Histórico
                  </p>
                </div>

                {/* Operations History List */}
                {tradesHistory.length === 0 ? (
                  <div className="px-2 py-2.5 lg:py-4 text-[10px] lg:text-sm text-white/30 text-center">
                    Sem operações ainda.
                  </div>
                ) : (
                  <ul className="divide-y divide-white/5">
                    {tradesHistory.slice(0, 20).map((trade) => {
                      const secondsRemaining = Math.max(
                        0,
                        Math.ceil((trade.expiresAt - nowMs) / 1000)
                      );
                      return (
                        <li
                          key={trade.id}
                          className="px-2 lg:px-5 py-1.5 lg:py-3 flex items-center justify-between gap-1.5 lg:gap-3 text-[10px] sm:text-[11px] lg:text-base"
                        >
                          <div className="flex items-center gap-1.5 lg:gap-3 min-w-0">
                            <span
                              className={`inline-block w-1.5 h-1.5 lg:w-2.5 lg:h-2.5 rounded-full shrink-0 ${
                                trade.direction === 'call' ? 'bg-emerald-400' : 'bg-rose-400'
                              }`}
                            />
                            <div className="min-w-0">
                              <span className="text-white/80 font-semibold uppercase">
                                {trade.direction === 'call' ? 'CALL' : 'PUT'}
                              </span>
                              <div className="text-white/40 font-mono tabular-nums text-[9px] lg:text-sm truncate">
                                {trade.entryPrice.toFixed(5)}
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0">
                            {trade.status === 'pending' ? (
                              <span className="text-amber-300 font-semibold tabular-nums">
                                {secondsRemaining}s
                              </span>
                            ) : trade.status === 'win' ? (
                              <span className="text-emerald-300 font-bold">WIN</span>
                            ) : trade.status === 'loss' ? (
                              <span className="text-rose-300 font-bold">LOSS</span>
                            ) : (
                              <span className="text-white/60 font-semibold">DOJI</span>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>

            {/* Right Column: Interactive Candlestick Chart */}
            <div className="h-full min-w-0">
              <CandleChart
                points={candlePoints}
                livePrice={livePrice}
                ticker={currentActive?.ticker ?? '---'}
              />
            </div>
          </div>
        </div>

        {/* Change Broker Button */}
        <div className="mt-4 lg:mt-6 flex justify-center">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 lg:px-5 py-2 lg:py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 hover:border-white/30 text-white/80 hover:text-white text-sm lg:text-base transition-all backdrop-blur-xl cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 lg:w-5 lg:h-5" />
            Trocar corretora
          </button>
        </div>
      </div>
    </div>
  );
};
