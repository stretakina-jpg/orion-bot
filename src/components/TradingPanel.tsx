import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, LogOut, Crown, Medal, Settings, Code2, Zap, Sparkles, AlertCircle } from 'lucide-react';
import { useI18n } from '../lib/i18n';
import { supabase } from '../lib/supabase';
import { BrokerQxModal } from './BrokerQxModal';
import { GoldUpgradeModal } from './GoldUpgradeModal';
import { DownloadModal } from './DownloadModal';
import { MaintenanceModal } from './MaintenanceModal';
import { AlpineDashboard } from './AlpineDashboard';
import { Broker } from '../types';
import { loadOrionConfig } from '../lib/orionConfig';

interface TradingPanelProps {
  onOpenWebTrader?: () => void;
  onOpenConfig?: () => void;
  onOpenCode?: () => void;
}

const VIDEO_DESKTOP =
  'https://ucycjlwmgdnayebmpfmf.supabase.co/storage/v1/object/public/admin-files/1777057704514-Orion_desktop_background.mp4';
const VIDEO_MOBILE =
  'https://ucycjlwmgdnayebmpfmf.supabase.co/storage/v1/object/public/admin-files/1777058228948-Orion_mobile_video_2.mp4';
const VIDEO_GENERIC =
  'https://oggtaibqhyvmupulskfm.supabase.co/storage/v1/object/public/admin-files/1777054051734-Background_Orion.mp4';
const LOGO_ORION =
  'https://ucycjlwmgdnayebmpfmf.supabase.co/storage/v1/object/public/admin-files/1777054984651-ORION-LOGO.png';

const BROKERS: Broker[] = [
  {
    key: 'brokerqx',
    name: 'BrokerQX',
    logo: 'https://ucycjlwmgdnayebmpfmf.supabase.co/storage/v1/object/public/admin-files/1778010867734-brokerqxwhite.png',
    freeAllowed: true,
  },
  {
    key: 'quotex',
    name: 'Quotex',
    logo: 'https://ucycjlwmgdnayebmpfmf.supabase.co/storage/v1/object/public/admin-files/1777055305836-quotex.png',
  },
  {
    key: 'iqoption',
    name: 'IQ Option',
    logo: 'https://ucycjlwmgdnayebmpfmf.supabase.co/storage/v1/object/public/admin-files/1777055326325-iqoption.png',
  },
  {
    key: 'alpine',
    name: 'Alpine Forex',
    logo: 'https://ucycjlwmgdnayebmpfmf.supabase.co/storage/v1/object/public/admin-files/1777055340200-alpineforex.png',
  },
  {
    key: 'pocket',
    name: 'Pocket Option',
    logo: 'https://ucycjlwmgdnayebmpfmf.supabase.co/storage/v1/object/public/admin-files/1777055360770-pocket.png',
    freeAllowed: true,
  },
  {
    key: 'polarium',
    name: 'Polarium Broker',
    logo: 'https://ucycjlwmgdnayebmpfmf.supabase.co/storage/v1/object/public/admin-files/1777055379517-polarium.png',
  },
];

export const TradingPanel: React.FC<TradingPanelProps> = ({
  onOpenWebTrader,
  onOpenConfig,
  onOpenCode,
}) => {
  const { t } = useI18n();
  const config = loadOrionConfig();

  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 768px)').matches : false
  );
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [showOpenButton, setShowOpenButton] = useState(false);
  const [logosLoaded, setLogosLoaded] = useState(false);

  // States: 'intro' | 'email' | 'brokers' | 'alpine'
  const [viewState, setViewState] = useState<'intro' | 'email' | 'brokers' | 'alpine'>('intro');
  const [userEmail, setUserEmail] = useState<string>(() =>
    typeof window === 'undefined'
      ? 'glkhali7777@gmail.com'
      : localStorage.getItem('orion_user_email') || 'glkhali7777@gmail.com'
  );
  const [emailInputError, setEmailInputError] = useState<string | null>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [isPremium, setIsPremium] = useState(true); // Automatically true for glkhali7777

  // Modals
  const [showBrokerQxModal, setShowBrokerQxModal] = useState(false);
  const [showGoldModal, setShowGoldModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [maintenanceBrokerName, setMaintenanceBrokerName] = useState<string | null>(null);
  const [onlineCounts, setOnlineCounts] = useState<Record<string, number>>({});

  const videoRef = useRef<HTMLVideoElement | null>(null);


  // Preload broker logos
  useEffect(() => {
    let active = true;
    Promise.all(
      BROKERS.map(
        (b) =>
          new Promise<void>((resolve) => {
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = () => resolve();
            img.src = b.logo;
          })
      )
    ).then(() => {
      if (active) setLogosLoaded(true);
    });
    return () => {
      active = false;
    };
  }, []);

  // Screen resize listener for video
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Delayed reveal for button in intro
  useEffect(() => {
    if (!isVideoPlaying || viewState !== 'intro') return;
    const timer = setTimeout(() => setShowOpenButton(true), 2000);
    return () => clearTimeout(timer);
  }, [isVideoPlaying, viewState]);

  // Fallback reveal in case video events don't fire
  useEffect(() => {
    if (viewState !== 'intro') return;
    const timer = setTimeout(() => {
      setIsVideoPlaying(true);
      setShowOpenButton(true);
      setLogosLoaded(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, [viewState]);

  // Online counts fetch
  useEffect(() => {
    if (viewState !== 'brokers' || !isPremium) return;
    let active = true;

    const fetchCounts = async () => {
      try {
        const { data, error } = await supabase.rpc('get_broker_online_counts');
        if (active && !error && Array.isArray(data)) {
          const map: Record<string, number> = {};
          for (const item of data) {
            map[item.broker_key] = item.online_count;
          }
          setOnlineCounts(map);
        }
      } catch {}
    };

    fetchCounts();
    const interval = setInterval(fetchCounts, 10000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [viewState, isPremium]);

  const activeVideoSrc =
    viewState === 'intro' ? (isMobile ? VIDEO_MOBILE : VIDEO_DESKTOP) : VIDEO_GENERIC;

  const handleOpenPanel = async () => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('orion_user_email') : null;
    if (saved) {
      setUserEmail(saved);
      setCheckingEmail(true);
      try {
        const { data } = await supabase
          .from('premium_users')
          .select('email')
          .eq('email', saved.toLowerCase())
          .maybeSingle();
        setIsPremium(!!data);
      } catch {
        setIsPremium(false);
      } finally {
        setCheckingEmail(false);
      }
      recordUserAccess(saved.toLowerCase());
      setViewState('brokers');
      return;
    }
    setViewState('email');
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('orion_user_email');
    } catch {}
    setUserEmail('');
    setIsPremium(false);
    setViewState('intro');
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = userEmail.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      setEmailInputError(t('trade.invalidEmail'));
      return;
    }

    setEmailInputError(null);
    setCheckingEmail(true);

    try {
      const { data } = await supabase
        .from('premium_users')
        .select('email')
        .eq('email', clean)
        .maybeSingle();
      setIsPremium(!!data);
      try {
        localStorage.setItem('orion_user_email', clean);
      } catch {}
      recordUserAccess(clean);
      setViewState('brokers');
    } catch {
      setIsPremium(false);
      try {
        localStorage.setItem('orion_user_email', clean);
      } catch {}
      recordUserAccess(clean);
      setViewState('brokers');
    } finally {
      setCheckingEmail(false);
    }
  };

  const recordUserAccess = async (email: string) => {
    const clean = email.trim().toLowerCase();
    if (!clean) return;
    try {
      const { data } = await supabase
        .from('user_accounts')
        .select('id')
        .eq('email', clean)
        .maybeSingle();
      if (data) {
        await supabase
          .from('user_accounts')
          .update({ last_seen_at: new Date().toISOString() })
          .eq('email', clean);
      } else {
        await supabase.from('user_accounts').insert({ email: clean });
      }
    } catch {}
  };

  const handleBrokerClick = (brokerKey: string) => {
    if (brokerKey === 'brokerqx') {
      setShowBrokerQxModal(true);
    } else if (brokerKey === 'quotex') {
      setShowDownloadModal(true);
    } else if (brokerKey === 'alpine') {
      setViewState('alpine');
    } else if (brokerKey === 'pocket') {
      onOpenWebTrader?.();
    } else {
      const broker = BROKERS.find((b) => b.key === brokerKey);
      if (broker) {
        setMaintenanceBrokerName(broker.name);
      }
    }
  };

  if (viewState === 'alpine') {
    return (
      <div className="w-full animate-[fadeIn_0.6s_ease-out]">
        <AlpineDashboard
          onBack={() => setViewState('brokers')}
          userEmail={userEmail.trim().toLowerCase()}
        />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white">
      {/* Background Video */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        onPlaying={() => setIsVideoPlaying(true)}
        onPause={() => setIsVideoPlaying(false)}
        onError={() => {
          setIsVideoPlaying(true);
          setShowOpenButton(true);
          setLogosLoaded(true);
        }}
        onStalled={() => {
          setShowOpenButton(true);
          setLogosLoaded(true);
        }}
        className="absolute inset-0 w-full h-full object-cover z-0"
        src={activeVideoSrc}
        key={activeVideoSrc}
      />

      {viewState !== 'intro' && <div className="absolute inset-0 bg-black/70 z-10" />}

      {/* Main Container */}
      <div className="relative z-20 min-h-screen flex flex-col items-center px-6">
        {/* INTRO VIEW */}
        {viewState === 'intro' && (
          <>
            <div className="flex-1 w-full flex items-end justify-center pb-[22vh] sm:pb-[14vh]">
              <button
                type="button"
                onClick={handleOpenPanel}
                className={`group inline-flex items-center gap-3 px-8 sm:px-10 py-4 sm:py-5 bg-white hover:bg-slate-100 text-slate-900 rounded-full font-semibold text-base sm:text-lg shadow-2xl shadow-black/40 transition-all duration-500 ease-out cursor-pointer ${
                  showOpenButton
                    ? 'opacity-100 translate-y-0 pointer-events-auto'
                    : 'opacity-0 translate-y-4 pointer-events-none'
                }`}
              >
                {t('trade.openPanel')}
                <ChevronRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </div>

            <div
              className={`w-full max-w-5xl pb-[20vh] sm:pb-8 transition-opacity duration-700 ${
                logosLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 sm:gap-x-10">
                {BROKERS.map((b) => (
                  <img
                    key={b.key}
                    src={b.logo}
                    alt={b.name}
                    className="h-4 sm:h-5 w-auto object-contain opacity-50 hover:opacity-80 transition-opacity duration-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]"
                    loading="eager"
                    decoding="async"
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {/* EMAIL IDENTIFICATION VIEW */}
        {viewState === 'email' && (
          <div className="flex-1 w-full flex flex-col items-center justify-center py-10 sm:py-16 animate-[fadeIn_0.6s_ease-out]">
            <div className="relative w-full max-w-md">
              <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-br from-white/30 via-white/5 to-white/10 opacity-80 blur-[1px] pointer-events-none" />
              <div className="absolute -inset-16 rounded-[3rem] bg-gradient-to-br from-blue-400/20 via-transparent to-white/10 blur-3xl opacity-60 pointer-events-none" />

              <form
                onSubmit={handleEmailSubmit}
                className="relative rounded-3xl overflow-hidden border border-white/15 bg-white/[0.06] backdrop-blur-2xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/[0.02] to-transparent pointer-events-none" />
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

                <div className="relative px-8 pt-8 pb-7">
                  <div className="flex items-center justify-center mb-6">
                    <img
                      src={LOGO_ORION}
                      alt="Orion"
                      className="h-14 w-auto object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]"
                    />
                  </div>

                  <h2 className="text-center text-2xl font-semibold text-white tracking-tight">
                    {t('trade.identify')}
                  </h2>
                  <p className="text-center text-slate-300/80 text-sm mt-1.5 mb-7">
                    {t('trade.identifyDesc')}
                  </p>

                  <label className="block text-[11px] uppercase tracking-widest text-slate-300/70 mb-2 font-medium">
                    {t('trade.yourEmail')}
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      autoFocus
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all backdrop-blur-xl"
                      placeholder={t('trade.emailPlaceholder')}
                    />
                  </div>

                  {emailInputError && (
                    <p className="mt-2 text-sm text-red-300">{emailInputError}</p>
                  )}

                  <button
                    type="submit"
                    disabled={checkingEmail}
                    className="mt-6 w-full py-3.5 bg-white/90 hover:bg-white text-slate-900 rounded-xl font-semibold transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-black/30 cursor-pointer"
                  >
                    {checkingEmail ? 'Verificando...' : t('trade.continue')}
                  </button>
                </div>
              </form>
            </div>

            <div className="w-full max-w-5xl mt-10 sm:mt-14">
              <p className="text-center text-[10px] uppercase tracking-[0.2em] text-white/40 mb-4">
                {t('trade.compatibleBrokers')}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 sm:gap-x-10">
                {BROKERS.map((b) => (
                  <img
                    key={b.key}
                    src={b.logo}
                    alt={b.name}
                    className="h-4 sm:h-5 w-auto object-contain opacity-50 hover:opacity-80 transition-opacity duration-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]"
                    loading="lazy"
                    decoding="async"
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* BROKERS SELECTION GRID */}
        {viewState === 'brokers' && (
          <div className="flex-1 w-full flex flex-col items-center py-10 sm:py-14 animate-[fadeIn_0.8s_ease-out]">
            {/* User status banner */}
            <div className="w-full max-w-5xl mb-8 sm:mb-10">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 px-4 sm:px-6 py-4 rounded-3xl bg-white/[0.06] backdrop-blur-2xl border border-white/15 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 border border-white/20 flex items-center justify-center text-white text-base font-bold uppercase font-mono shadow-lg shadow-purple-500/30">
                    {userEmail.charAt(0) || 'G'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-white font-bold text-sm sm:text-base truncate">
                        {userEmail}
                      </p>
                      <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full border bg-amber-500/20 text-amber-300 border-amber-500/40">
                        <Sparkles className="w-3 h-3" /> VIP OURO LIBERADO
                      </span>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 mt-1 flex-wrap text-xs">
                      <div className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-xl border border-white/10">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Saldo Real:</span>
                        <span className="text-emerald-400 font-bold font-mono">
                          R$ {userEmail.toLowerCase() === 'glkhali7777@gmail.com' ? '500,00' : config.realBalance.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-purple-300 text-[11px] font-medium">
                        <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span>Acesso VIBE Ativo</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick actions buttons in user banner */}
                <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
                  {onOpenWebTrader && (
                    <button
                      type="button"
                      onClick={onOpenWebTrader}
                      className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all shadow-md shadow-purple-600/30 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                      <span>WebTrader</span>
                    </button>
                  )}

                  {onOpenConfig && (
                    <button
                      type="button"
                      onClick={onOpenConfig}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-medium text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Settings className="w-3.5 h-3.5 text-purple-300" />
                      <span>Configurações</span>
                    </button>
                  )}

                  {onOpenCode && (
                    <button
                      type="button"
                      onClick={onOpenCode}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white font-medium text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Code2 className="w-3.5 h-3.5 text-blue-300" />
                      <span>Código Robô</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleLogout}
                    aria-label={t('trade.logout')}
                    title={t('trade.logout')}
                    className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/30 text-white/80 hover:text-white transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* HERO CARD: WEBTRADER INTEGRADO (SOLUÇÃO BROKERQX.SITE) */}
            <div className="w-full max-w-5xl mb-8">
              <div className="relative rounded-3xl p-6 sm:p-7 border border-purple-500/40 bg-gradient-to-r from-purple-950/60 via-indigo-950/40 to-slate-950/60 backdrop-blur-2xl shadow-[0_20px_60px_-15px_rgba(124,110,240,0.3)] overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        100% OPERACIONAL · SEM ERRO DE DNS
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        BROKERQX FAIL-PROOF
                      </span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-bold text-white font-heading tracking-tight">
                      WebTrader Integrado Orion · Conta Real R$ 500,00
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      Negocie diretamente sem sofrer com quedas do domínio <code className="bg-black/40 px-1 py-0.5 rounded text-purple-300">brokerqx.site</code>. Gráficos de velas ao vivo, radar de sinais algorítmicos (MHI & OTC Sniper 96.2%) e execução instantânea.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => onOpenWebTrader ? onOpenWebTrader() : handleBrokerClick('brokerqx')}
                      className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                      <span>Abrir WebTrader Integrado</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenConfig && onOpenConfig()}
                      className="w-full sm:w-auto px-4 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Settings className="w-4 h-4 text-slate-300" />
                      <span>Configurar Corretoras</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Header Titles */}
            <div className="text-center mb-8 sm:mb-10">
              <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight font-heading">
                Conectar com Corretoras Tradicionais
              </h2>
              <p className="mt-2 text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">
                Selecione a corretora desejada para conectar via extensão Orion Bridge ou espelhos oficiais
              </p>
            </div>

            {/* Brokers Grid */}
            <div className="w-full max-w-5xl grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
              {BROKERS.map((broker) => {
                const isLocked = !isPremium && !broker.freeAllowed;
                const isFreeTag = !isPremium && broker.freeAllowed;
                const isLiveTag = isPremium || broker.freeAllowed;
                const count = onlineCounts[broker.key];

                return (
                  <button
                    key={broker.key}
                    type="button"
                    onClick={() => (isLocked ? setShowGoldModal(true) : handleBrokerClick(broker.key))}
                    className={`group relative aspect-[16/9] rounded-2xl flex items-center justify-center p-5 sm:p-6 overflow-hidden transition-all duration-300 cursor-pointer ${
                      isLocked
                        ? 'bg-white/[0.03] border border-white/5 backdrop-blur-md hover:border-amber-400/40 hover:bg-white/[0.06]'
                        : 'bg-white/[0.06] backdrop-blur-2xl border border-white/15 hover:border-white/30 hover:bg-white/10 hover:scale-[1.03] hover:shadow-2xl hover:shadow-black/50'
                    }`}
                    title={broker.name}
                  >
                    {!isLocked && (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-white/[0.02] to-transparent pointer-events-none" />
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
                      </>
                    )}

                    <img
                      src={broker.logo}
                      alt={broker.name}
                      className={`max-h-full max-w-full w-auto h-auto object-contain transition-all duration-300 ${
                        isLocked ? 'opacity-20 grayscale' : 'group-hover:scale-105'
                      }`}
                      loading="eager"
                      decoding="async"
                    />

                    {isLocked && (
                      <div className="absolute inset-0 rounded-2xl bg-black/40 backdrop-blur-[2px]" />
                    )}

                    {isFreeTag && (
                      <span className="absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] sm:text-xs font-medium px-2.5 py-1 rounded-full bg-green-500/15 text-green-400 border border-green-500/30">
                        {t('trade.freeAccount')}
                      </span>
                    )}

                    {isLiveTag && (
                      <div className="absolute top-1.5 left-1.5 sm:top-2.5 sm:left-2.5 z-10 pointer-events-none">
                        <div className="relative inline-flex items-center gap-1 sm:gap-1.5 pl-1.5 pr-1.5 sm:pl-2 sm:pr-2.5 py-[3px] sm:py-1 rounded sm:rounded-md bg-black/70 backdrop-blur-xl border border-emerald-400/25 shadow-[0_6px_20px_-6px_rgba(0,0,0,0.6)] overflow-hidden">
                          <span
                            className="absolute inset-y-0 left-0 w-[1.5px] sm:w-[2px] bg-gradient-to-b from-emerald-200 via-emerald-400 to-emerald-600"
                            style={{ boxShadow: '0 0 10px rgba(52,211,153,0.6)' }}
                          />
                          <span className="relative flex h-1 w-1 sm:h-1.5 sm:w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-1 w-1 sm:h-1.5 sm:w-1.5 bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]" />
                          </span>
                          <span className="hidden sm:inline text-[9px] font-bold uppercase tracking-[0.18em] text-emerald-200/90 font-mono">
                            {t('trade.live')}
                          </span>
                          <span className="sm:hidden text-[7px] font-bold uppercase tracking-[0.12em] text-emerald-200/90 font-mono">
                            {t('trade.live')}
                          </span>
                          {typeof count === 'number' && (
                            <>
                              <span className="h-2 sm:h-3 w-px bg-white/15" />
                              <span className="text-[8px] sm:text-[10px] font-bold tabular-nums text-white font-mono">
                                {count.toLocaleString('pt-BR')}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Compatible brokers footer logos */}
            <div className="w-full max-w-5xl mt-14 sm:mt-20">
              <p className="text-center text-[10px] uppercase tracking-[0.2em] text-white/40 mb-4">
                {t('trade.compatibleBrokers')}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 sm:gap-x-10">
                {BROKERS.map((b) => (
                  <img
                    key={b.key}
                    src={b.logo}
                    alt={b.name}
                    className="h-4 sm:h-5 w-auto object-contain opacity-50 hover:opacity-80 transition-opacity duration-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]"
                    loading="lazy"
                    decoding="async"
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODALS */}
      {showBrokerQxModal && (
        <BrokerQxModal
          onClose={() => setShowBrokerQxModal(false)}
          onOpenWebTrader={onOpenWebTrader}
          onOpenConfig={onOpenConfig}
          onOpenCode={onOpenCode}
        />
      )}
      {showGoldModal && (
        <GoldUpgradeModal email={userEmail} onClose={() => setShowGoldModal(false)} />
      )}
      {showDownloadModal && <DownloadModal onClose={() => setShowDownloadModal(false)} />}
      {maintenanceBrokerName && (
        <MaintenanceModal
          brokerName={maintenanceBrokerName}
          onClose={() => setMaintenanceBrokerName(null)}
        />
      )}
    </div>
  );
};
