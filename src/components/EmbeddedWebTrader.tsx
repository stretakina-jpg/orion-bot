import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Settings,
  Code2,
  TrendingUp,
  TrendingDown,
  Play,
  Pause,
  Zap,
  Volume2,
  VolumeX,
  Shield,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { loadOrionConfig, OrionBotSettings, saveOrionConfig } from '../lib/orionConfig';
import { CandleChart } from './CandleChart';
import { BotTrade } from '../types';
import { PwaAssetSelector, PwaAsset, DEFAULT_PWA_ASSETS } from './PwaAssetSelector';
import { OrionOracleHud } from './OrionOracleHud';

interface EmbeddedWebTraderProps {
  onBack: () => void;
  onOpenConfig?: () => void;
  onOpenCode?: () => void;
}

const ASSETS = DEFAULT_PWA_ASSETS.map((a) => ({
  id: a.id,
  name: a.name,
  payout: a.payout,
  basePrice: a.basePrice,
}));

export const EmbeddedWebTrader: React.FC<EmbeddedWebTraderProps> = ({
  onBack,
  onOpenConfig,
  onOpenCode,
}) => {
  const [config, setConfig] = useState<OrionBotSettings>(loadOrionConfig);
  const [selectedAsset, setSelectedAsset] = useState(ASSETS[0]);
  const [accountType, setAccountType] = useState<'real' | 'demo'>(config.activeAccountType || 'real');
  const [realBalance, setRealBalance] = useState<number>(config.realBalance || 500.0);
  const [demoBalance, setDemoBalance] = useState<number>(config.demoBalance || 10000.0);
  const [tradeAmount, setTradeAmount] = useState<number>(config.tradeAmount || 10.0);
  const [isBotActive, setIsBotActive] = useState<boolean>(false);
  const [livePrice, setLivePrice] = useState<number>(selectedAsset.basePrice);
  const [candlePoints, setCandlePoints] = useState<number[]>([
    selectedAsset.basePrice,
    selectedAsset.basePrice + 0.0001,
    selectedAsset.basePrice - 0.0002,
    selectedAsset.basePrice + 0.0003,
  ]);
  const [activeSignal, setActiveSignal] = useState<{
    direction: 'CALL' | 'PUT' | 'WAIT';
    confidence: number;
    strategy: string;
    expiresIn: number;
  }>({
    direction: 'CALL',
    confidence: 96.4,
    strategy: 'Orion OTC Sniper (VIBE)',
    expiresIn: 18,
  });
  const [tradesHistory, setTradesHistory] = useState<BotTrade[]>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [activeMirror, setActiveMirror] = useState<string>('embedded');
  const [showOracleHud, setShowOracleHud] = useState<boolean>(true);

  const priceRef = useRef(livePrice);
  priceRef.current = livePrice;

  // Sync with storage on mount and when balance is updated
  useEffect(() => {
    const sync = () => {
      const cur = loadOrionConfig();
      setConfig(cur);
      setRealBalance(cur.realBalance);
      setDemoBalance(cur.demoBalance);
    };
    sync();

    const handleUpdate = (e: any) => {
      sync();
      if (e?.detail) {
        if (typeof e.detail.realBalance === 'number') setRealBalance(e.detail.realBalance);
        if (typeof e.detail.demoBalance === 'number') setDemoBalance(e.detail.demoBalance);
      }
    };

    window.addEventListener('orion_balance_updated', handleUpdate);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('orion_balance_updated', handleUpdate);
      window.removeEventListener('storage', sync);
    };
  }, []);

  // Price ticking engine
  useEffect(() => {
    const interval = setInterval(() => {
      const delta = (Math.random() - 0.49) * (selectedAsset.basePrice * 0.00025);
      const newPrice = Number((priceRef.current + delta).toFixed(5));
      setLivePrice(newPrice);
      setCandlePoints((prev) => {
        const next = [...prev.slice(-30), newPrice];
        return next;
      });
    }, 600);

    return () => clearInterval(interval);
  }, [selectedAsset]);

  // Signal generation cycle
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSignal((prev) => {
        if (prev.expiresIn <= 1) {
          const dirs: ('CALL' | 'PUT')[] = ['CALL', 'PUT'];
          const picked = dirs[Math.floor(Math.random() * dirs.length)];
          const conf = Number((91 + Math.random() * 7).toFixed(1));
          return {
            direction: picked,
            confidence: conf,
            strategy: config.activeStrategy === 'mhi' ? 'MHI 1 Minoria' : 'Orion OTC Sniper (VIBE)',
            expiresIn: 25,
          };
        }
        return { ...prev, expiresIn: prev.expiresIn - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [config.activeStrategy]);

  // Auto-trade triggered by bot
  useEffect(() => {
    if (!isBotActive) return;
    if (activeSignal.expiresIn === 20 && activeSignal.direction !== 'WAIT') {
      executeOrder(activeSignal.direction === 'CALL' ? 'call' : 'put', true);
    }
  }, [isBotActive, activeSignal.expiresIn]);

  const executeOrder = (direction: 'call' | 'put', fromBot = false, customAmount?: number, customExpSec?: number) => {
    const balance = accountType === 'real' ? realBalance : demoBalance;
    const currentAmount = customAmount && customAmount > 0 ? customAmount : tradeAmount;
    const expMs = (customExpSec && customExpSec >= 5 ? customExpSec : 5) * 1000;
    if (balance < currentAmount) {
      return;
    }

    const entry = livePrice;

    // Deduct stake
    if (accountType === 'real') {
      const updated = Number((realBalance - currentAmount).toFixed(2));
      setRealBalance(updated);
      saveOrionConfig({ ...config, realBalance: updated });
    } else {
      setDemoBalance((prev) => Number((prev - currentAmount).toFixed(2)));
    }

    const tradeId = `t_${Date.now()}`;
    const newTrade: BotTrade = {
      id: tradeId,
      ticker: selectedAsset.name,
      direction,
      entryPrice: entry,
      exitPrice: null,
      amountCents: Math.round(currentAmount * 100),
      status: 'pending',
      createdAt: Date.now(),
      expiresAt: Date.now() + expMs,
    };

    setTradesHistory((prev) => [newTrade, ...prev]);

    // Outcome after selected expiration time
    setTimeout(() => {
      const exit = livePrice;
      const isCallWin = direction === 'call' && exit >= entry;
      const isPutWin = direction === 'put' && exit <= entry;
      const isWin = isCallWin || isPutWin;

      const payoutMultiplier = 1 + selectedAsset.payout / 100;
      const returnAmount = isWin ? currentAmount * payoutMultiplier : 0;

      if (isWin) {
        if (accountType === 'real') {
          setRealBalance((prev) => {
            const next = Number((prev + returnAmount).toFixed(2));
            saveOrionConfig({ ...config, realBalance: next });
            return next;
          });
        } else {
          setDemoBalance((prev) => Number((prev + returnAmount).toFixed(2)));
        }
      }

      setTradesHistory((prev) =>
        prev.map((t) =>
          t.id === tradeId
            ? {
                ...t,
                exitPrice: exit,
                status: isWin ? 'win' : 'loss',
              }
            : t
        )
      );
    }, expMs);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans selection:bg-purple-500/30 selection:text-white">
      {/* Top Header Bar */}
      <header className="h-14 border-b border-white/10 px-4 flex items-center justify-between bg-slate-950/80 backdrop-blur-xl shrink-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Voltar ao Painel Principal"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <span className="font-heading text-lg font-bold tracking-tight bg-gradient-to-r from-purple-400 via-blue-400 to-indigo-300 bg-clip-text text-transparent">
              ORION WEBTRADER
            </span>
            <span className="hidden sm:inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              BROKERQX FAIL-PROOF ENGINE
            </span>
          </div>

          {/* Mirror / DNS Selector to fix brokerqx.site */}
          <div className="hidden lg:flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-xl border border-white/10 text-xs text-slate-300">
            <span className="text-[10px] text-slate-400 uppercase font-medium">Servidor:</span>
            <select
              value={activeMirror}
              onChange={(e) => setActiveMirror(e.target.value)}
              className="bg-transparent text-white font-semibold text-xs focus:outline-none cursor-pointer"
            >
              <option value="embedded" className="bg-slate-900">WebTrader Integrado (Ativo ✓)</option>
              <option value="brokerqx.com" className="bg-slate-900">Mirror 1: brokerqx.com</option>
              <option value="qxbroker.com" className="bg-slate-900">Mirror 2: qxbroker.com</option>
              <option value="quotex.com" className="bg-slate-900">Mirror 3: quotex.com</option>
            </select>
          </div>
        </div>

        {/* User Account & Balance Pill */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Account Balance Switcher */}
          <div className="flex items-center bg-black/50 border border-white/15 rounded-xl p-1 shadow-inner">
            <button
              onClick={() => setAccountType('real')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                accountType === 'real'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-950" />
              <span>Real R$ {realBalance.toFixed(2)}</span>
            </button>
            <button
              onClick={() => setAccountType('demo')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                accountType === 'demo'
                  ? 'bg-blue-500 text-slate-950 shadow-md shadow-blue-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Demo R$ {demoBalance.toFixed(2)}</span>
            </button>
          </div>

          {/* User Badge */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-xs">
            <span className="text-purple-300 font-semibold">{config.userEmail}</span>
            <span className="px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 text-[10px] font-bold">
              VIP VIBE ⚡
            </span>
          </div>

          {/* Action buttons */}
          {onOpenCode && (
            <button
              onClick={onOpenCode}
              className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 text-xs font-semibold transition-all cursor-pointer"
              title="Inspecionar Código do Robô Orion"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Código</span>
            </button>
          )}

          {onOpenConfig && (
            <button
              onClick={onOpenConfig}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors cursor-pointer"
              title="Abrir Configurações"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left Chart & Market Area (8 cols) */}
        <div className="lg:col-span-8 flex flex-col border-b lg:border-b-0 lg:border-r border-white/10 bg-slate-950 relative">
          {/* PWA Asset Carousel & Selector */}
          <PwaAssetSelector
            selectedAssetId={selectedAsset.id}
            onSelectAsset={(asset: PwaAsset) => {
              setSelectedAsset({
                id: asset.id,
                name: asset.name,
                payout: asset.payout,
                basePrice: asset.basePrice,
              });
              setLivePrice(asset.basePrice);
            }}
          />

          {/* Subheader with Ticker & Status */}
          <div className="px-3 py-2 border-b border-white/[0.08] flex items-center justify-between bg-slate-950/60 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Ativo em Negociação:</span>
              <span className="font-bold text-white font-heading tracking-wide">
                {selectedAsset.name}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold text-[10px]">
                +{selectedAsset.payout}% Lucro
              </span>
            </div>

            <div className="flex items-center gap-2 font-mono">
              <span className="text-[11px] text-slate-400">Cotação:</span>
              <span className="text-base font-bold text-white tracking-wider animate-priceFlash">
                {livePrice.toFixed(5)}
              </span>
            </div>
          </div>

          {/* Orion Bot Live Signal Radar Banner */}
          <div className="mx-3 mt-3 p-3 rounded-2xl bg-gradient-to-r from-purple-950/40 via-indigo-950/40 to-slate-900/40 border border-purple-500/30 flex items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                    Radar Orion: {activeSignal.strategy}
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                    {activeSignal.confidence}% CONFIANÇA
                  </span>
                </div>
                <div className="text-sm font-bold text-white flex items-center gap-2 mt-0.5">
                  <span>Sinal Iminente:</span>
                  <span
                    className={`font-black uppercase px-2 py-0.5 rounded text-xs ${
                      activeSignal.direction === 'CALL'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}
                  >
                    {activeSignal.direction} (COMPRA/VENDA)
                  </span>
                  <span className="text-xs font-mono text-purple-300 font-normal">
                    em {activeSignal.expiresIn}s
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* HUD Orion Oracle Toggle */}
              <button
                type="button"
                onClick={() => setShowOracleHud(!showOracleHud)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                  showOracleHud
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-lg shadow-emerald-500/20'
                    : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                }`}
                title="Exibir/Ocultar HUD Oficial Orion Oracle (com Troca Automática de Ativos)"
              >
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">HUD Oracle</span>
                <span className="text-[10px] opacity-75">{showOracleHud ? 'ON' : 'OFF'}</span>
              </button>

              {/* Bot Auto Trade Toggle */}
              <button
                onClick={() => setIsBotActive(!isBotActive)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg ${
                  isBotActive
                    ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/40'
                    : 'bg-white/10 hover:bg-white/15 text-slate-200 border border-white/15'
                }`}
              >
                {isBotActive ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
                <span>{isBotActive ? 'Robô Operando' : 'Ligar Robô'}</span>
              </button>
            </div>
          </div>

          {/* DEDICATED ORION ORACLE HUD (IDENTICAL TO USER VIDEO WITH AUTO MULTI-ASSET SWITCHING) */}
          {showOracleHud && (
            <div className="mx-3 mt-3 animate-fadeIn">
              <OrionOracleHud
                chartCandleTrend={
                  candlePoints.length >= 2 &&
                  candlePoints[candlePoints.length - 1] >=
                    candlePoints[Math.max(0, candlePoints.length - 4)]
                    ? 'UP'
                    : 'DOWN'
                }
                onExecuteTrade={(dir, assetName, amt, expSec) => {
                  setTradeAmount(amt);
                  executeOrder(dir.toLowerCase() as 'call' | 'put', true, amt, expSec);
                }}
                onAssetChange={(assetName) => {
                  const match = ASSETS.find(
                    (a) => a.name.includes(assetName) || assetName.includes(a.name)
                  );
                  if (match) {
                    setSelectedAsset(match);
                    setLivePrice(match.basePrice);
                  } else {
                    const dynamicBase = Number((0.07 + Math.random() * 110).toFixed(4));
                    setSelectedAsset({
                      id: assetName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
                      name: assetName,
                      payout: 86,
                      basePrice: dynamicBase,
                    });
                    setLivePrice(dynamicBase);
                  }
                }}
                initialBalance={realBalance}
                initialMeta={config.stopWin || 14322.63}
              />
            </div>
          )}

          {/* Interactive Chart Container */}
          <div className="flex-1 p-3 min-h-[340px]">
            <CandleChart points={candlePoints} livePrice={livePrice} ticker={selectedAsset.name} />
          </div>
        </div>

        {/* Right Trading & Execution Panel (4 cols) */}
        <div className="lg:col-span-4 p-4 sm:p-5 flex flex-col justify-between bg-slate-900/30 space-y-4 overflow-y-auto">
          {/* Order Configuration Box */}
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
              <span className="text-xs font-semibold text-slate-300 block">
                Valor do Investimento
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-400 font-mono">R$</span>
                <input
                  type="number"
                  step="5"
                  min="2"
                  value={tradeAmount}
                  onChange={(e) => setTradeAmount(parseFloat(e.target.value) || 2)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white font-mono font-bold text-lg focus:outline-none focus:border-purple-400"
                />
              </div>

              {/* Quick amount chips */}
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {[10, 20, 50, 100].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setTradeAmount(amt)}
                    className="py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono font-semibold text-slate-300 hover:text-white cursor-pointer transition-colors"
                  >
                    R$ {amt}
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-slate-400">Rendimento Previsto:</span>
                <span className="text-emerald-400 font-mono font-bold">
                  + R$ {(tradeAmount * (selectedAsset.payout / 100)).toFixed(2)} ({selectedAsset.payout}%)
                </span>
              </div>
            </div>

            {/* CALL / PUT EXECUTION BUTTONS */}
            <div className="grid grid-cols-2 gap-3">
              {/* CALL BUTTON (GREEN) */}
              <button
                type="button"
                onClick={() => executeOrder('call')}
                className="py-5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-base uppercase tracking-wider flex flex-col items-center justify-center gap-1 shadow-xl shadow-emerald-600/30 active:scale-95 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>COMPRA</span>
                </div>
                <span className="text-[11px] font-normal opacity-90">CALL · ACIMA</span>
              </button>

              {/* PUT BUTTON (RED) */}
              <button
                type="button"
                onClick={() => executeOrder('put')}
                className="py-5 px-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-base uppercase tracking-wider flex flex-col items-center justify-center gap-1 shadow-xl shadow-rose-600/30 active:scale-95 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-5 h-5" />
                  <span>VENDA</span>
                </div>
                <span className="text-[11px] font-normal opacity-90">PUT · ABAIXO</span>
              </button>
            </div>
          </div>

          {/* Recent Trades Log */}
          <div className="flex-1 flex flex-col rounded-2xl bg-white/[0.02] border border-white/10 p-3 min-h-[180px]">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300 pb-2 border-b border-white/10 mb-2">
              <span>Histórico de Operações</span>
              <span className="text-[10px] text-slate-500 font-mono">{tradesHistory.length} ordens</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[220px]">
              {tradesHistory.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-xs text-slate-500 py-6">
                  <Shield className="w-6 h-6 mb-1 text-slate-600" />
                  <span>Nenhuma operação no momento</span>
                  <span className="text-[10px]">Ligue o Robô ou aperte Compra/Venda</span>
                </div>
              ) : (
                tradesHistory.map((t) => (
                  <div
                    key={t.id}
                    className="p-2 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          t.status === 'win'
                            ? 'bg-emerald-400'
                            : t.status === 'loss'
                            ? 'bg-rose-500'
                            : 'bg-amber-400 animate-pulse'
                        }`}
                      />
                      <div>
                        <div className="font-semibold text-slate-200">
                          {t.direction.toUpperCase()} · R$ {(t.amountCents / 100).toFixed(2)}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Entrada: {t.entryPrice.toFixed(5)}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      {t.status === 'pending' ? (
                        <span className="text-[10px] text-amber-300 font-mono">Em execução...</span>
                      ) : t.status === 'win' ? (
                        <span className="text-xs font-bold text-emerald-400 font-mono">+ R$ {(t.amountCents / 100 * 0.95).toFixed(2)}</span>
                      ) : (
                        <span className="text-xs font-bold text-rose-400 font-mono">- R$ {(t.amountCents / 100).toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Notice footer */}
          <div className="text-[11px] text-slate-400 p-2.5 rounded-xl bg-purple-950/20 border border-purple-500/20 flex items-center justify-between">
            <span className="text-purple-300">Modo VIBE Ativo</span>
            <button
              onClick={onOpenConfig}
              className="text-xs text-white underline hover:text-purple-300 cursor-pointer"
            >
              Configurar Robô
            </button>
          </div>
        </div>
      </div>

      {/* AGENT-INDICATOR.JS VISUAL OVERLAYS (FROM glkhali7777/teste-rei - UNLOCKED) */}
      {showOracleHud && (
        <>
          {/* 1. Overlay Pulsante (#orion-pulse-overlay) */}
          <div
            id="orion-pulse-overlay"
            className="fixed inset-0 pointer-events-none z-40 border-2 border-[#7c6ef0] shadow-[inset_0_0_22px_rgba(124,110,240,0.18)] animate-pulse"
          />

          {/* 2. Botão "Arrêter Orion" (#orion-stop-button) */}
          <button
            id="orion-stop-button"
            onClick={() => {
              setIsBotActive(false);
              setShowOracleHud(false);
            }}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-[#7c6ef0] hover:bg-[#6b5ce0] text-white rounded-lg px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-[#7c6ef0]/40 cursor-pointer transition-all"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="6" width="12" height="12" rx="1" />
            </svg>
            <span>Arrêter Orion</span>
          </button>

          {/* 3. Indicador de Status "Orion actif" (#orion-status-indicator) */}
          <div
            id="orion-status-indicator"
            className="fixed bottom-4 right-4 z-50 bg-[#111111]/95 border border-[#7c6ef0] rounded-xl px-3.5 py-2 text-[11px] text-slate-300 flex items-center gap-2 backdrop-blur-md shadow-xl"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" stroke="#7c6ef0" fill="none" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="6" />
              <circle cx="12" cy="12" r="2" fill="#7c6ef0" />
            </svg>
            <span>Orion actif • {selectedAsset.name}</span>
          </div>
        </>
      )}
    </div>
  );
};
