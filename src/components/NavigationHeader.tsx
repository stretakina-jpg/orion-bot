import React, { useState, useEffect } from 'react';
import { Globe, Settings, Code2, Zap, LayoutDashboard, Sparkles, Download } from 'lucide-react';
import { useI18n } from '../lib/i18n';
import { Locale } from '../types';
import { loadOrionConfig } from '../lib/orionConfig';
import { downloadOrionExtensionZip } from '../lib/orionExtensionBundle';

interface NavigationHeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenConfig?: () => void;
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  currentPath,
  onNavigate,
  onOpenConfig,
}) => {
  const { locale, changeLocale } = useI18n();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [config, setConfig] = useState(loadOrionConfig);

  useEffect(() => {
    const handleUpdate = () => {
      setConfig(loadOrionConfig());
    };
    window.addEventListener('orion_balance_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('orion_balance_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const languages: { code: Locale; label: string; flag: string }[] = [
    { code: 'pt', label: 'Português', flag: '🇧🇷' },
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
  ];

  return (
    <header className="fixed top-3 right-3 sm:right-4 z-50 flex items-center gap-2">
      {/* User VIP Badge Indicator */}
      <div
        onClick={() => onOpenConfig ? onOpenConfig() : onNavigate('/config')}
        className="hidden md:flex items-center gap-2 bg-slate-950/90 hover:bg-slate-900 border border-purple-500/40 rounded-full px-3 py-1.5 shadow-lg shadow-purple-950/40 text-xs cursor-pointer transition-all"
        title="Clique para abrir configurações da conta"
      >
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-white/90 font-medium font-mono text-[11px]">
          {config.userEmail || 'glkhali7777@gmail.com'}
        </span>
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-0.5">
          <Sparkles className="w-2.5 h-2.5" /> VIP
        </span>
        <span className="text-emerald-400 font-bold font-mono text-[11px]">
          R$ {config.realBalance.toFixed(2)}
        </span>
      </div>

      {/* Quick Route Nav Pill */}
      <div className="flex items-center gap-1 bg-slate-950/85 backdrop-blur-xl border border-white/10 rounded-full px-2 sm:px-3 py-1.5 shadow-lg shadow-black/40 text-xs">
        <button
          onClick={() => onNavigate('/')}
          className={`px-2 sm:px-2.5 py-1 rounded-full font-medium transition-colors cursor-pointer ${
            currentPath === '/' || currentPath === '/trade'
              ? 'bg-purple-600 text-white font-semibold shadow-md shadow-purple-600/30'
              : 'text-white/70 hover:text-white'
          }`}
        >
          Trading
        </button>

        <button
          onClick={() => onNavigate('/webtrader')}
          className={`px-2 sm:px-2.5 py-1 rounded-full font-medium transition-colors cursor-pointer flex items-center gap-1 ${
            currentPath === '/webtrader'
              ? 'bg-purple-600 text-white font-semibold shadow-md shadow-purple-600/30'
              : 'text-emerald-400 hover:text-emerald-300'
          }`}
          title="WebTrader Integrado Orion (Sem erro de DNS)"
        >
          <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
          <span className="hidden sm:inline">WebTrader</span>
        </button>

        <button
          onClick={() => onNavigate('/pwa/asset-selector')}
          className={`px-2 sm:px-2.5 py-1 rounded-full font-medium transition-colors cursor-pointer flex items-center gap-1 ${
            currentPath === '/pwa/asset-selector' || currentPath === '/asset-selector'
              ? 'bg-purple-600 text-white font-semibold shadow-md shadow-purple-600/30'
              : 'text-purple-300 hover:text-white'
          }`}
          title="Seletor de Ativos PWA (Cotações & Payouts)"
        >
          <Sparkles className="w-3 h-3 text-purple-400" />
          <span className="hidden sm:inline">Ativos OTC</span>
        </button>

        <button
          onClick={() => onOpenConfig ? onOpenConfig() : onNavigate('/config')}
          className={`px-2 sm:px-2.5 py-1 rounded-full font-medium transition-colors cursor-pointer flex items-center gap-1 ${
            currentPath === '/config'
              ? 'bg-purple-600 text-white font-semibold shadow-md shadow-purple-600/30'
              : 'text-purple-300 hover:text-white'
          }`}
          title="Gerenciamento de Configurações"
        >
          <Settings className="w-3 h-3" />
          <span className="hidden sm:inline">Configurações</span>
        </button>

        <button
          onClick={() => onNavigate('/codigo')}
          className={`px-2 sm:px-2.5 py-1 rounded-full font-medium transition-colors cursor-pointer flex items-center gap-1 ${
            currentPath === '/codigo'
              ? 'bg-purple-600 text-white font-semibold shadow-md shadow-purple-600/30'
              : 'text-slate-300 hover:text-white'
          }`}
          title="Ver Código Fonte Completo do Robô Orion"
        >
          <Code2 className="w-3 h-3 text-purple-400" />
          <span className="hidden md:inline">Código Robô</span>
        </button>

        <button
          onClick={downloadOrionExtensionZip}
          className="px-2.5 py-1 rounded-full font-bold transition-all cursor-pointer flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30"
          title="Baixar Extensão Completa Pocket Option / Quotex em .ZIP"
        >
          <Download className="w-3 h-3" />
          <span>Baixar .ZIP</span>
        </button>

        <button
          onClick={() => onNavigate('/ativarquotex')}
          className={`hidden md:block px-2.5 py-1 rounded-full font-medium transition-colors cursor-pointer ${
            currentPath === '/ativarquotex'
              ? 'bg-white/20 text-white'
              : 'text-white/60 hover:text-white'
          }`}
        >
          Quotex
        </button>

        <button
          onClick={() => onNavigate('/admin')}
          className={`px-2 sm:px-2.5 py-1 rounded-full font-medium transition-colors cursor-pointer ${
            currentPath === '/admin'
              ? 'bg-white/20 text-white'
              : 'text-white/60 hover:text-white'
          }`}
        >
          Admin
        </button>
      </div>

      {/* Language Switcher */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowLangMenu(!showLangMenu)}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-slate-950/80 hover:bg-slate-900 border border-white/15 text-white/80 hover:text-white text-xs font-semibold backdrop-blur-xl transition-all shadow-lg cursor-pointer"
        >
          <Globe className="w-3.5 h-3.5 text-blue-400" />
          <span className="uppercase text-[11px]">{locale}</span>
        </button>

        {showLangMenu && (
          <div className="absolute right-0 mt-2 w-32 rounded-xl bg-slate-900/95 border border-white/15 backdrop-blur-2xl shadow-2xl py-1 z-50">
            {languages.map((l) => (
              <button
                key={l.code}
                onClick={() => {
                  changeLocale(l.code);
                  setShowLangMenu(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${
                  locale === l.code
                    ? 'bg-blue-600/20 text-blue-300'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span>{l.flag}</span>
                <span>{l.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};
