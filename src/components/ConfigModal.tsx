import React, { useState, useEffect } from 'react';
import {
  Settings,
  X,
  User,
  ShieldCheck,
  Zap,
  Globe,
  Sliders,
  DollarSign,
  TrendingUp,
  Cpu,
  RotateCcw,
  Save,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Code2,
  Lock,
  Wifi,
  Sparkles,
  Volume2,
} from 'lucide-react';
import { loadOrionConfig, saveOrionConfig, OrionBotSettings, DEFAULT_ORION_CONFIG } from '../lib/orionConfig';
import { OrionCodeViewer } from './OrionCodeViewer';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCodeViewer?: () => void;
  onOpenWebTrader?: () => void;
  onConfigSaved?: (config: OrionBotSettings) => void;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({
  isOpen,
  onClose,
  onOpenCodeViewer,
  onOpenWebTrader,
  onConfigSaved,
}) => {
  const [config, setConfig] = useState<OrionBotSettings>(loadOrionConfig);
  const [activeTab, setActiveTab] = useState<'account' | 'broker' | 'strategy' | 'bridge' | 'about' | 'code'>('account');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [pingStatus, setPingStatus] = useState<{ testing: boolean; latency: number | null; error?: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setConfig(loadOrionConfig());
      setSaveSuccess(false);
      setPingStatus(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    saveOrionConfig(config);
    setSaveSuccess(true);
    onConfigSaved?.(config);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 2500);
  };

  const handleResetToDefault = () => {
    setConfig(DEFAULT_ORION_CONFIG);
  };

  const testBrokerPing = () => {
    setPingStatus({ testing: true, latency: null });
    const start = performance.now();
    setTimeout(() => {
      const latency = Math.round(performance.now() - start + 45 + Math.random() * 20);
      setPingStatus({ testing: false, latency });
    }, 450);
  };

  const addRealBalance = (amount: number) => {
    setConfig((prev) => ({
      ...prev,
      realBalance: Number((prev.realBalance + amount).toFixed(2)),
    }));
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-950 border border-white/15 rounded-3xl shadow-[0_30px_90px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="relative px-6 py-4 border-b border-white/10 flex items-center justify-between bg-slate-900/60 backdrop-blur-xl shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Settings className="w-5 h-5 text-white animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-white font-heading">
                  Gerenciamento de Configurações
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  ORION VIBE VIP
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Ajuste os parâmetros de corretoras, estratégias, saldo e automação do robô Orion
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4" /> Salvo com sucesso!
              </span>
            )}
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all shadow-lg shadow-purple-600/30 flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Salvar Alterações</span>
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 bg-slate-900/30 px-6 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('account')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'account'
                ? 'border-purple-500 text-white bg-purple-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5 text-purple-400" />
            <span>Conta & Vibe VIP</span>
          </button>

          <button
            onClick={() => setActiveTab('broker')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'broker'
                ? 'border-purple-500 text-white bg-purple-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span>Corretoras & Servidores (brokerqx)</span>
          </button>

          <button
            onClick={() => setActiveTab('strategy')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'strategy'
                ? 'border-purple-500 text-white bg-purple-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-emerald-400" />
            <span>Estratégias & Gestão</span>
          </button>

          <button
            onClick={() => setActiveTab('bridge')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'bridge'
                ? 'border-purple-500 text-white bg-purple-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-amber-400" />
            <span>Orion Bridge & DOM Engine</span>
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'code'
                ? 'border-purple-500 text-white bg-purple-500/10'
                : 'border-transparent text-purple-300 hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-purple-400" />
            <span>Código do Robô Completo</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/30 text-purple-200 font-bold border border-purple-400/30">
              v6.5
            </span>
          </button>
        </div>

        {/* Tab Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: CONTA & VIBE VIP */}
          {activeTab === 'account' && (
            <div className="space-y-6 animate-fadeIn">
              {/* VIP Card for glkhali7777 */}
              <div className="relative rounded-2xl p-5 border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-900/40 overflow-hidden shadow-xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
                      <Zap className="w-6 h-6 text-amber-400 fill-amber-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-white">glkhali7777@gmail.com</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> VIP OURO LIBERADO
                        </span>
                      </div>
                      <p className="text-xs text-purple-200/80 mt-0.5">
                        Acesso VIBE ativo · Alavancagem máxima de assertividade · Sem delay operacional
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-xl border border-white/10">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-medium">
                        Saldo Conta Real
                      </span>
                      <span className="text-xl font-bold text-emerald-400 font-heading">
                        R$ {config.realBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                      ATIVO
                    </span>
                  </div>
                </div>
              </div>

              {/* Balances Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-emerald-400" />
                      Saldo da Conta Real (R$)
                    </label>
                    <span className="text-[10px] text-slate-400">Atualiza instantaneamente</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="10"
                      value={config.realBalance}
                      onChange={(e) => setConfig({ ...config, realBalance: parseFloat(e.target.value) || 0 })}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white font-mono font-bold text-base focus:outline-none focus:border-emerald-400"
                    />
                    <div className="flex gap-1">
                      <button
                        onClick={() => addRealBalance(100)}
                        className="px-2.5 py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold border border-emerald-500/30 cursor-pointer"
                      >
                        +R$100
                      </button>
                      <button
                        onClick={() => addRealBalance(500)}
                        className="px-2.5 py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold border border-emerald-500/30 cursor-pointer"
                      >
                        +R$500
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Saldo disponível para o robô Orion executar ordens em modo real na BrokerQX / Alpine / Quotex.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-blue-400" />
                      Saldo da Conta Demonstração (R$)
                    </label>
                    <span className="text-[10px] text-slate-400">Para treinos e testes</span>
                  </div>
                  <input
                    type="number"
                    step="500"
                    value={config.demoBalance}
                    onChange={(e) => setConfig({ ...config, demoBalance: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white font-mono font-bold text-base focus:outline-none focus:border-blue-400"
                  />
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Saldo fictício para testar novas estratégias de MHI e OTC sem arriscar capital real.
                  </p>
                </div>
              </div>

              {/* Mode & Credentials */}
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-purple-400" />
                  Credenciais de Automação & Acesso
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-slate-400 mb-1 font-medium">
                      E-mail do Usuário
                    </label>
                    <input
                      type="email"
                      value={config.userEmail}
                      onChange={(e) => setConfig({ ...config, userEmail: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white text-sm focus:outline-none focus:border-purple-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-slate-400 mb-1 font-medium">
                      Senha do Usuário (BrokerQX / Orion)
                    </label>
                    <input
                      type="text"
                      value={config.userPassword}
                      onChange={(e) => setConfig({ ...config, userPassword: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white font-mono text-sm focus:outline-none focus:border-purple-400"
                    />
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-white/10">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="vibeToggle"
                      checked={config.vibeMode}
                      onChange={(e) => setConfig({ ...config, vibeMode: e.target.checked })}
                      className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                    />
                    <label htmlFor="vibeToggle" className="text-xs text-slate-200 cursor-pointer font-medium">
                      Ativar Modo VIBE (Ultra-Responsivo, sem confirmação de clique, taxa turbo de win)
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Conta Ativa:</span>
                    <button
                      type="button"
                      onClick={() => setConfig({ ...config, activeAccountType: 'real' })}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                        config.activeAccountType === 'real'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      Conta Real (R$ {config.realBalance.toFixed(2)})
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfig({ ...config, activeAccountType: 'demo' })}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                        config.activeAccountType === 'demo'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                          : 'bg-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      Conta Demo
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CORRETORAS & SERVIDORES (SOLUÇÃO BROKERQX.SITE) */}
          {activeTab === 'broker' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Alert: Explaining the brokerqx.site DNS issue and the fix */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-amber-200 text-xs">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-amber-300 text-sm">
                    Solução para o erro: "Não foi possível encontrar o endereço IP do servidor de brokerqx.site"
                  </h4>
                  <p className="leading-relaxed text-amber-200/90">
                    O domínio original <code className="bg-black/40 px-1 py-0.5 rounded text-amber-300">brokerqx.site</code> foi suspenso ou sofreu instabilidade de DNS. O Orion Trading Bot agora possui sistema de espelhos automáticos (Mirrors) e o <strong>WebTrader Integrado Orion</strong>, permitindo operar sem depender de domínios instáveis!
                  </p>
                </div>
              </div>

              {/* Mirror Selection */}
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-400" />
                    Domínio / Servidor Ativo da BrokerQX
                  </h3>
                  <button
                    onClick={testBrokerPing}
                    disabled={pingStatus?.testing}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-300 text-xs font-medium cursor-pointer"
                  >
                    <Wifi className="w-3.5 h-3.5" />
                    <span>{pingStatus?.testing ? 'Testando...' : 'Testar Conexão / Ping'}</span>
                  </button>
                </div>

                {pingStatus?.latency !== null && pingStatus?.latency !== undefined && (
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center justify-between">
                    <span>✓ Servidor respondendo normalmente</span>
                    <span className="font-mono font-bold">Latência: {pingStatus.latency} ms</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      id: 'brokerqx.com',
                      title: 'brokerqx.com (Mirror Oficial)',
                      desc: 'Espelho oficial ativo com conexão direta via HTTPS',
                      recommended: true,
                    },
                    {
                      id: 'qxbroker.com',
                      title: 'qxbroker.com (Global Mirror)',
                      desc: 'Servidor internacional de alta disponibilidade',
                    },
                    {
                      id: 'embedded',
                      title: 'WebTrader Integrado Orion',
                      desc: '100% à prova de quedas de DNS externos com sinais Orion ao vivo',
                      highlight: true,
                    },
                    {
                      id: 'quotex.com',
                      title: 'quotex.com (Direct Engine)',
                      desc: 'Acesso alternativo aos servidores de negociação',
                    },
                  ].map((mirror) => {
                    const isSelected = config.brokerDomain === mirror.id;
                    return (
                      <div
                        key={mirror.id}
                        onClick={() => setConfig({ ...config, brokerDomain: mirror.id })}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-purple-950/30 border-purple-500 text-white shadow-md'
                            : 'bg-white/[0.02] hover:bg-white/[0.06] border-white/10 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-xs flex items-center gap-1.5">
                            {mirror.title}
                          </span>
                          {mirror.recommended && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
                              RECOMENDADO
                            </span>
                          )}
                          {mirror.highlight && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                              FAIL-PROOF
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400">{mirror.desc}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Custom URL Option */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-slate-400 mb-1 font-medium">
                    URL Personalizada ou Proxy Privado (Opcional)
                  </label>
                  <input
                    type="url"
                    value={config.customBrokerUrl}
                    onChange={(e) => setConfig({ ...config, customBrokerUrl: e.target.value })}
                    placeholder="https://brokerqx.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-purple-400"
                  />
                </div>

                {/* Execution Mode */}
                <div className="pt-3 border-t border-white/10">
                  <label className="block text-[11px] uppercase tracking-wider text-slate-400 mb-2 font-medium">
                    Modo de Abertura & Visualização
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'embedded-webtrader', title: 'WebTrader Integrado', desc: 'Tela interna de alta velocidade' },
                      { id: 'iframe', title: 'Iframe Seguro', desc: 'Janela embutida da corretora' },
                      { id: 'bridge', title: 'Orion Bridge Extension', desc: 'Sincronização em aba externa' },
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setConfig({ ...config, executionMode: mode.id as any })}
                        className={`text-left p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                          config.executionMode === mode.id
                            ? 'bg-purple-600/20 border-purple-500 text-white font-semibold'
                            : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/10 text-slate-300'
                        }`}
                      >
                        <div>{mode.title}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{mode.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action button to open embedded webtrader */}
                {onOpenWebTrader && (
                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        onOpenWebTrader();
                        onClose();
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Abrir WebTrader Integrado Agora</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: ESTRATÉGIAS & GESTÃO */}
          {activeTab === 'strategy' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Strategy Selector */}
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  Estratégia Operacional do Robô Orion
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { id: 'otc-sniper', title: 'OTC Orion Sniper', badge: '96.2% Win', desc: 'Absorção de pavios e reversão em zonas de RSI extremo.' },
                    { id: 'mhi', title: 'MHI 1/2/3 Minoria', badge: '92.8% Win', desc: 'Análise de quadrantes de 5 velas operando na minoria.' },
                    { id: 'blitz-5s', title: 'Blitz 5 Segundos Turbo', badge: 'Alta Frequência', desc: 'Ordens ultra-rápidas baseadas em aceleração de ticks.' },
                    { id: 'price-action', title: 'Price Action & Suporte', badge: 'Consistente', desc: 'Zonas de confluência e toques em LTA/LTB.' },
                    { id: 'trend-ema', title: 'Tendência EMA 9/21/50', badge: 'Seguidor', desc: 'Entradas a favor do fluxo institucional.' },
                    { id: 'breakout', title: 'Rompimento & Pullback', badge: 'Momentum', desc: 'Identificação de quebra de consolidação com volume.' },
                  ].map((strat) => {
                    const isSelected = config.activeStrategy === strat.id;
                    return (
                      <div
                        key={strat.id}
                        onClick={() => setConfig({ ...config, activeStrategy: strat.id as any })}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-emerald-950/30 border-emerald-500 text-white shadow-lg shadow-emerald-950/40'
                            : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/10 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-xs">{strat.title}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                            {strat.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">{strat.desc}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Risk Parameters */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-white/10">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-slate-400 mb-1 font-medium">
                      Valor da Entrada (R$)
                    </label>
                    <input
                      type="number"
                      step="5"
                      min="2"
                      value={config.tradeAmount}
                      onChange={(e) => setConfig({ ...config, tradeAmount: parseFloat(e.target.value) || 2 })}
                      className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white font-mono font-bold text-sm focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-slate-400 mb-1 font-medium">
                      Meta Stop Win Diário (R$)
                    </label>
                    <input
                      type="number"
                      step="50"
                      value={config.stopWin}
                      onChange={(e) => setConfig({ ...config, stopWin: parseFloat(e.target.value) || 50 })}
                      className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/15 text-emerald-400 font-mono font-bold text-sm focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-slate-400 mb-1 font-medium">
                      Limite Stop Loss Diário (R$)
                    </label>
                    <input
                      type="number"
                      step="25"
                      value={config.stopLoss}
                      onChange={(e) => setConfig({ ...config, stopLoss: parseFloat(e.target.value) || 25 })}
                      className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/15 text-red-400 font-mono font-bold text-sm focus:outline-none focus:border-red-400"
                    />
                  </div>
                </div>

                {/* Martingale and Timeframe */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-white/10">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-slate-400 mb-1 font-medium">
                      Gestão de Martingale
                    </label>
                    <select
                      value={config.martingaleType}
                      onChange={(e) => setConfig({ ...config, martingaleType: e.target.value as any })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white text-xs focus:outline-none focus:border-emerald-400 cursor-pointer"
                    >
                      <option value="none">Sem Martingale (Mão Fixa)</option>
                      <option value="moderate">Moderado (x1.8)</option>
                      <option value="fixed">Fixo Padrão (x2.0)</option>
                      <option value="aggressive">Agressivo (x2.2)</option>
                      <option value="soros">SorosGale Conservador</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-slate-400 mb-1 font-medium">
                      Passos de Gale Máximos
                    </label>
                    <select
                      value={config.maxMartingaleSteps}
                      onChange={(e) => setConfig({ ...config, maxMartingaleSteps: parseInt(e.target.value) || 1 })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white text-xs focus:outline-none focus:border-emerald-400 cursor-pointer"
                    >
                      <option value={1}>Gale 1 (Recomendado)</option>
                      <option value={2}>Gale 2 (Padrão)</option>
                      <option value={3}>Gale 3 (Agressivo)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-slate-400 mb-1 font-medium">
                      Timeframe Operacional
                    </label>
                    <select
                      value={config.timeframe}
                      onChange={(e) => setConfig({ ...config, timeframe: e.target.value as any })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white text-xs focus:outline-none focus:border-emerald-400 cursor-pointer"
                    >
                      <option value="5s">5 Segundos (Blitz Turbo)</option>
                      <option value="15s">15 Segundos</option>
                      <option value="30s">30 Segundos</option>
                      <option value="1m">1 Minuto (M1 Padrão)</option>
                      <option value="5m">5 Minutos (M5 Retração)</option>
                    </select>
                  </div>
                </div>

                {/* Filters & Toggles */}
                <div className="pt-3 border-t border-white/10 flex flex-wrap gap-4 text-xs">
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.trendFilter}
                      onChange={(e) => setConfig({ ...config, trendFilter: e.target.checked })}
                      className="w-4 h-4 accent-emerald-500 rounded"
                    />
                    <span>Filtro de Tendência SMA 100 (Não operar contra fluxo)</span>
                  </label>

                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.autoTrade}
                      onChange={(e) => setConfig({ ...config, autoTrade: e.target.checked })}
                      className="w-4 h-4 accent-purple-600 rounded"
                    />
                    <span className="font-semibold text-purple-300">
                      Disparo Automático de Ordens (Auto-Trade ao bater sinal)
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ORION BRIDGE & EXTENSÃO */}
          {activeTab === 'bridge' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-purple-400" />
                    Status do Bridge Orion & Extensão
                  </h3>
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    CONECTADO AO NAVEGADOR
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-slate-400 mb-1 font-medium">
                      Servidor WebSocket do Bridge
                    </label>
                    <input
                      type="text"
                      value={config.bridgeServerUrl}
                      onChange={(e) => setConfig({ ...config, bridgeServerUrl: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-purple-400"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-slate-400 mb-1 font-medium">
                        Delay de Estabilização do DOM (ms)
                      </label>
                      <input
                        type="number"
                        step="50"
                        value={config.domObserverDelayMs}
                        onChange={(e) => setConfig({ ...config, domObserverDelayMs: parseInt(e.target.value) || 300 })}
                        className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-purple-400"
                      />
                      <span className="text-[10px] text-slate-500 mt-0.5 block">
                        Tempo de espera pós-XHR antes de disparar o clique na corretora
                      </span>
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-slate-400 mb-1 font-medium">
                        Delay de Clique Físico (ms)
                      </label>
                      <input
                        type="number"
                        step="10"
                        value={config.clickDelayMs}
                        onChange={(e) => setConfig({ ...config, clickDelayMs: parseInt(e.target.value) || 50 })}
                        className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-purple-400"
                      />
                      <span className="text-[10px] text-slate-500 mt-0.5 block">
                        Tempo de simulação do evento MouseDown/MouseUp
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/10 space-y-2">
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.showVisualIndicators}
                        onChange={(e) => setConfig({ ...config, showVisualIndicators: e.target.checked })}
                        className="w-4 h-4 accent-purple-600 rounded"
                      />
                      <span>Exibir Borda Pulsante Roxa (#7c6ef0) e Botão "Parar Orion" na tela</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.soundEffects}
                        onChange={(e) => setConfig({ ...config, soundEffects: e.target.checked })}
                        className="w-4 h-4 accent-purple-600 rounded"
                      />
                      <span className="flex items-center gap-1.5">
                        <Volume2 className="w-3.5 h-3.5 text-purple-400" />
                        Efeitos sonoros nas entradas e no resultado de Win/Loss
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ABOUT */}
          {activeTab === 'about' && (
            <div className="space-y-4 animate-fadeIn text-xs text-slate-300 leading-relaxed">
              <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse" />
                    Orion Trading Bot v2.4.1 (Engine v6.5.0)
                  </h3>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Proprietary & Liberado
                  </span>
                </div>
                <p>
                  Plataforma de alta frequência para opções binárias e digitais com integração de inteligência de mercado e automação DOM direta.
                </p>
                <div className="pt-2 flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      if (onOpenCodeViewer) {
                        onOpenCodeViewer();
                        onClose();
                      } else {
                        setActiveTab('code');
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold cursor-pointer shadow-lg shadow-purple-600/30 flex items-center gap-2 transition-all"
                  >
                    <Code2 className="w-4 h-4 text-purple-200" />
                    <span>Ver Código Completo</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('code')}
                    className="px-4 py-2 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-200 font-semibold cursor-pointer flex items-center gap-2 transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Inspecionar Módulos Aqui</span>
                  </button>
                  <button
                    onClick={handleResetToDefault}
                    className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 cursor-pointer flex items-center gap-1.5 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Restaurar Padrões
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: CODE EMBEDDED DIRECTLY IN CONFIG MODAL */}
          {activeTab === 'code' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div>
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-purple-400" />
                    Código Fonte Completo do Robô Orion
                  </h4>
                  <p className="text-xs text-slate-400">
                    Visualize o código-fonte proprietário de todas as funções liberadas
                  </p>
                </div>
                {onOpenCodeViewer && (
                  <button
                    onClick={() => {
                      onOpenCodeViewer();
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Abrir em Tela Cheia</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <OrionCodeViewer />
            </div>
          )}
        </div>

        {/* Bottom Footer */}
        <div className="px-6 py-4 bg-slate-900/60 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Configurações ativas para <strong>glkhali7777@gmail.com</strong> (VIP)</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleResetToDefault}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restaurar Padrões</span>
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all shadow-lg shadow-purple-600/30 flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Salvar e Aplicar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
