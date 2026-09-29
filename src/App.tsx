import { useState, useEffect } from 'react';
import { TradingPanel } from './components/TradingPanel';
import { HomeLanding } from './components/HomeLanding';
import { AdminPanel } from './components/AdminPanel';
import { ActivateQuotex } from './components/ActivateQuotex';
import { PurchaseComplete } from './components/PurchaseComplete';
import { QuotexRedirect } from './components/QuotexRedirect';
import { NavigationHeader } from './components/NavigationHeader';
import { EmbeddedWebTrader } from './components/EmbeddedWebTrader';
import { ConfigModal } from './components/ConfigModal';
import { OrionCodeViewer } from './components/OrionCodeViewer';
import { PwaAssetSelector, PwaAsset } from './components/PwaAssetSelector';
import { ArrowLeft, Sparkles, Sliders } from 'lucide-react';
import { loadOrionConfig } from './lib/orionConfig';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      if (path === '/home') return '/home';
      if (path === '/admin') return '/admin';
      if (path === '/ativarquotex') return '/ativarquotex';
      if (path === '/compraconcluida') return '/compraconcluida';
      if (path === '/quotexredirect') return '/quotexredirect';
      if (path === '/trade') return '/trade';
      if (path === '/webtrader') return '/webtrader';
      if (path === '/brokerqx') return '/webtrader';
      if (path === '/pwa/asset-selector' || path === '/asset-selector') return '/pwa/asset-selector';
      if (path === '/codigo' || path === '/code') return '/codigo';
      if (path === '/config' || path === '/configuracoes') return '/config';
      // Also check hash
      const hash = window.location.hash.replace('#', '').toLowerCase();
      if (hash.startsWith('/')) return hash;
    }
    return '/';
  });

  const [showConfigModal, setShowConfigModal] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname.toLowerCase() === '/config';
    }
    return false;
  });

  useEffect(() => {
    const handlePopState = () => {
      const p = window.location.pathname.toLowerCase();
      setCurrentPath(p || '/');
      if (p === '/config') {
        setShowConfigModal(true);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    if (path === '/config') {
      setShowConfigModal(true);
      return;
    }
    setCurrentPath(path);
    try {
      window.history.pushState({}, '', path);
    } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderRoute = () => {
    switch (currentPath) {
      case '/webtrader':
        return (
          <EmbeddedWebTrader
            onBack={() => navigateTo('/')}
            onOpenConfig={() => setShowConfigModal(true)}
            onOpenCode={() => navigateTo('/codigo')}
          />
        );
      case '/codigo':
      case '/code':
        return (
          <div className="min-h-screen bg-slate-950 text-white pt-16 p-4 sm:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto space-y-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => navigateTo('/')}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Voltar ao Painel</span>
                </button>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">Ambiente do Usuário:</span>
                  <span className="font-mono text-purple-300 font-bold">glkhali7777@gmail.com</span>
                  <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 font-bold text-[10px]">
                    VIP VIBE ⚡
                  </span>
                </div>
              </div>

              <OrionCodeViewer />
            </div>
          </div>
        );
      case '/home':
        return <HomeLanding onStartNow={() => navigateTo('/')} />;
      case '/admin':
        return <AdminPanel onBack={() => navigateTo('/')} />;
      case '/ativarquotex':
        return <ActivateQuotex />;
      case '/compraconcluida':
        return <PurchaseComplete onNavigateHome={() => navigateTo('/')} />;
      case '/quotexredirect':
        return <QuotexRedirect />;
      case '/pwa/asset-selector':
        return (
          <div className="min-h-screen bg-[#06080B] text-white pt-16 p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => navigateTo('/webtrader')}
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Voltar ao WebTrader</span>
                </button>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">PWA Target:</span>
                  <span className="font-mono text-purple-300 font-bold">/brokerqx</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                    ONLINE
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#0b0f17] overflow-hidden shadow-2xl p-4 sm:p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <h2 className="text-lg font-bold font-heading text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      Seletor de Ativos PWA Oficial
                    </h2>
                    <p className="text-xs text-slate-400">
                      https://oriontraderbot.app/pwa/asset-selector • Cotações e Payouts em Tempo Real
                    </p>
                  </div>
                  <button
                    onClick={() => navigateTo('/webtrader')}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-colors cursor-pointer shadow-lg shadow-purple-600/30"
                  >
                    Ir ao Gráfico
                  </button>
                </div>

                <PwaAssetSelector
                  showModalInitially={true}
                  onSelectAsset={(asset: PwaAsset) => {
                    navigateTo('/webtrader');
                  }}
                />
              </div>
            </div>
          </div>
        );
      case '/config':
        return (
          <TradingPanel
            onOpenWebTrader={() => navigateTo('/webtrader')}
            onOpenConfig={() => setShowConfigModal(true)}
            onOpenCode={() => navigateTo('/codigo')}
          />
        );
      case '/':
      case '/trade':
      default:
        return (
          <TradingPanel
            onOpenWebTrader={() => navigateTo('/webtrader')}
            onOpenConfig={() => setShowConfigModal(true)}
            onOpenCode={() => navigateTo('/codigo')}
          />
        );
    }
  };

  return (
    <div className="relative min-h-screen bg-black font-sans selection:bg-purple-500/30 selection:text-white">
      {/* Top right quick switcher (shown on non-webtrader views to avoid overlapping WebTrader header) */}
      {currentPath !== '/webtrader' && (
        <NavigationHeader
          currentPath={currentPath}
          onNavigate={navigateTo}
          onOpenConfig={() => setShowConfigModal(true)}
        />
      )}

      {/* Current View */}
      {renderRoute()}

      {/* Global Configuration Modal */}
      <ConfigModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        onOpenCodeViewer={() => navigateTo('/codigo')}
        onOpenWebTrader={() => navigateTo('/webtrader')}
      />
    </div>
  );
}
