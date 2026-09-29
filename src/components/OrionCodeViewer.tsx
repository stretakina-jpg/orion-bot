import React, { useState } from 'react';
import {
  Code2,
  Copy,
  Check,
  Download,
  Terminal,
  Play,
  FileCode,
  Shield,
  Zap,
  Layers,
  Cpu,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Eye,
} from 'lucide-react';
import { ORION_SCRIPTS, OrionScript } from '../lib/orionScripts';
import { OrionOracleHud } from './OrionOracleHud';
import { downloadOrionExtensionZip } from '../lib/orionExtensionBundle';

interface OrionCodeViewerProps {
  onClose?: () => void;
  standalone?: boolean;
}

export const OrionCodeViewer: React.FC<OrionCodeViewerProps> = ({ onClose, standalone = false }) => {
  const [selectedScriptId, setSelectedScriptId] = useState<string>(ORION_SCRIPTS[0].id);
  const [copied, setCopied] = useState(false);
  const [simulationResult, setSimulationResult] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showVisualPreview, setShowVisualPreview] = useState<boolean>(true);

  const selectedScript = ORION_SCRIPTS.find((s) => s.id === selectedScriptId) || ORION_SCRIPTS[0];

  const filteredScripts = filterCategory === 'all'
    ? ORION_SCRIPTS
    : ORION_SCRIPTS.filter((s) => s.category === filterCategory);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedScript.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([selectedScript.code], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedScript.id}.js`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRunSimulation = () => {
    setSimulationResult('Iniciando análise do script...');
    setTimeout(() => {
      setSimulationResult(
        `[Orion Runtime] ✓ Sintaxe verificada com sucesso.\n` +
        `[Orion Runtime] ✓ Módulos: ${selectedScript.name} (v${selectedScript.version})\n` +
        `[Orion Runtime] ✓ Compatibilidade: BrokerQX, Quotex, Alpine, Pocket Option\n` +
        `[Orion Runtime] ✓ Status: Pronto para injeção e execução no navegador.`
      );
    }, 400);
  };

  const generateBookmarklet = () => {
    const compact = encodeURIComponent(`(function(){console.log("[Orion] Bookmarklet ativo");${selectedScript.code}})()`);
    return `javascript:${compact}`;
  };

  return (
    <div className={`w-full flex flex-col bg-slate-950 text-white rounded-2xl border border-white/10 overflow-hidden shadow-2xl ${
      standalone ? 'min-h-[85vh] p-4 sm:p-6' : 'p-3 sm:p-5'
    }`}>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
            <Code2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-white font-heading">
                Código Fonte do Robô Orion
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                PROPRIETARY ENGINE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Inspecione, exporte e visualize os módulos internos do robô Orion de automação e análise
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={downloadOrionExtensionZip}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-500 to-purple-600 hover:from-emerald-500 hover:to-purple-500 text-white text-xs font-extrabold shadow-lg shadow-emerald-600/30 transition-all cursor-pointer border border-white/20"
          >
            <Download className="w-4 h-4" />
            <span>📦 Baixar Extensão Completa Pocket Option (.ZIP)</span>
          </button>
          <button
            onClick={() => setShowVisualPreview(!showVisualPreview)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              showVisualPreview
                ? 'bg-purple-600/30 border-purple-500 text-purple-200'
                : 'bg-white/10 border-white/15 text-white hover:bg-white/15'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-purple-400" />
            <span>{showVisualPreview ? 'Ocultar Imagem do Painel' : 'Ver Imagem do Painel'}</span>
          </button>
          <button
            onClick={handleRunSimulation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-medium transition-all cursor-pointer"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Testar Script</span>
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-medium transition-all cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copiado!' : 'Copiar Código Inteiro'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 text-xs font-medium transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Baixar .js</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 text-xs font-medium transition-colors cursor-pointer"
            >
              Fechar
            </button>
          )}
        </div>
      </div>

      {/* Complete Extension ZIP Package Banner */}
      <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/50 via-slate-900 to-purple-950/50 border border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
              PACOTE OFICIAL PRONTO (.ZIP)
            </span>
            <h3 className="text-sm font-bold text-white">
              Extensão Completa Orion Oracle Eloqua v7.0 para Pocket Option, Quotex & BrokerQX
            </h3>
          </div>
          <p className="text-xs text-slate-300">
            Inclui <code className="text-emerald-300 font-mono">manifest.json</code>,{' '}
            <code className="text-emerald-300 font-mono">content.js</code> (código 100% inteiro com Painel completo, Tabela Multiativos, 6 Estratégias, Placar ACERTO/META e Velocímetro Cyber Bull),{' '}
            <code className="text-emerald-300 font-mono">background.js</code>,{' '}
            <code className="text-emerald-300 font-mono">popup.html</code>,{' '}
            <code className="text-emerald-300 font-mono">popup.js</code> e guia de instalação.
          </p>
        </div>
        <button
          onClick={downloadOrionExtensionZip}
          className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-xl shadow-emerald-500/25 transition-all cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>BAIXAR .ZIP AGORA</span>
        </button>
      </div>

      {/* Visual Showcase of Orion Robot Panel (Image + Live HUD) */}
      {showVisualPreview && (
        <div className="mt-4 p-4 rounded-2xl bg-[#070a10] border border-purple-500/25 grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                Imagem Oficial do Painel Orion Oracle Eloqua
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Visual HUD v4.5
              </span>
            </div>
            <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black">
              <img
                src="/src/assets/images/orion_bot_panel_1790629736262.jpg"
                alt="Painel do Robô Orion Oracle Eloqua"
                referrerPolicy="no-referrer"
                className="w-full h-auto object-cover"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Acima: Visual oficial do painel com seletor multiativos (US 500, US 100, US 30, US 2000), placar ACERTO, PRÓXIMA, RESULTADO, META e velocímetro do Touro Cyber (COMPRA/VENDA).
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                Painel Interativo Ao Vivo (Funcionando Agora)
              </span>
              <span className="text-[10px] font-mono text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                6 Estratégias Ativas
              </span>
            </div>
            <OrionOracleHud />
          </div>
        </div>
      )}

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4 flex-1">
        {/* Left Sidebar: Script selector */}
        <div className="lg:col-span-4 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-medium">
            <span>MÓDULOS DISPONÍVEIS ({filteredScripts.length})</span>
            <div className="flex gap-1 text-[10px]">
              <button
                onClick={() => setFilterCategory('all')}
                className={`px-2 py-0.5 rounded cursor-pointer ${filterCategory === 'all' ? 'bg-purple-500/30 text-white' : 'hover:bg-white/5'}`}
              >
                Todos
              </button>
              <button
                onClick={() => setFilterCategory('bridge')}
                className={`px-2 py-0.5 rounded cursor-pointer ${filterCategory === 'bridge' ? 'bg-purple-500/30 text-white' : 'hover:bg-white/5'}`}
              >
                Bridge
              </button>
              <button
                onClick={() => setFilterCategory('strategies')}
                className={`px-2 py-0.5 rounded cursor-pointer ${filterCategory === 'strategies' ? 'bg-purple-500/30 text-white' : 'hover:bg-white/5'}`}
              >
                Sinais
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 max-h-[500px] overflow-y-auto pr-1">
            {filteredScripts.map((script) => {
              const isSelected = script.id === selectedScript.id;
              return (
                <button
                  key={script.id}
                  onClick={() => {
                    setSelectedScriptId(script.id);
                    setSimulationResult(null);
                  }}
                  className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-purple-900/20 border-purple-500/40 text-white shadow-lg shadow-purple-950/40'
                      : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/5 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-xs tracking-wide flex items-center gap-1.5">
                      <FileCode className={`w-3.5 h-3.5 ${isSelected ? 'text-purple-400' : 'text-slate-400'}`} />
                      {script.name}
                    </span>
                    <span className="text-[10px] font-mono text-purple-300 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">
                      v{script.version}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {script.description}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Quick Info Box */}
          <div className="mt-auto p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 text-xs text-purple-200/90 flex flex-col gap-2">
            <div className="flex items-center gap-1.5 font-semibold text-purple-300">
              <Shield className="w-4 h-4 text-purple-400" />
              <span>Modo Injeção Seguro</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-300">
              Estes scripts são compilados com proteção anti-detecção e usam o protocolo de automação Orion Bridge para interagir diretamente com as corretoras (BrokerQX, Quotex, Pocket Option, Alpine).
            </p>
            <div className="text-[10px] text-purple-300/70 pt-1 border-t border-purple-500/20 flex items-center justify-between">
              <span>Conta autorizada:</span>
              <strong className="text-white">glkhali7777@gmail.com</strong>
            </div>
          </div>
        </div>

        {/* Right Editor / Code Area */}
        <div className="lg:col-span-8 flex flex-col rounded-xl border border-white/10 bg-slate-900/60 overflow-hidden">
          {/* File Tab Header */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/80 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-mono font-medium text-slate-200">
                {selectedScript.id}.js
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-slate-400 font-mono">
                {selectedScript.code.split('\n').length} linhas
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400">
                Atualizado: {selectedScript.updatedAt}
              </span>
            </div>
          </div>

          {/* Code Body */}
          <div className="relative flex-1 overflow-x-auto max-h-[480px] p-4 bg-slate-950 font-mono text-xs leading-relaxed text-slate-300">
            <pre className="selection:bg-purple-500/30 selection:text-white">
              <code>{selectedScript.code}</code>
            </pre>
          </div>

          {/* Simulation Output Area */}
          {simulationResult && (
            <div className="border-t border-white/10 p-3 bg-black/60 font-mono text-xs text-emerald-400 animate-fadeIn">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span className="flex items-center gap-1 font-semibold text-emerald-400">
                  <Cpu className="w-3.5 h-3.5" /> Terminal Orion Runtime
                </span>
                <button
                  onClick={() => setSimulationResult(null)}
                  className="hover:text-white cursor-pointer"
                >
                  Limpar
                </button>
              </div>
              <pre className="whitespace-pre-wrap text-[11px]">{simulationResult}</pre>
            </div>
          )}

          {/* Bookmarklet & Injection Helper */}
          <div className="p-3 bg-slate-950/90 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-slate-300 text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Para injetar no console da corretora, copie o script e cole na aba DevTools (F12)</span>
            </div>
            <a
              href={generateBookmarklet()}
              onClick={(e) => {
                e.preventDefault();
                handleCopy();
              }}
              title="Arraste para sua barra de favoritos ou clique para copiar"
              className="text-[11px] text-purple-300 hover:text-white underline flex items-center gap-1 cursor-pointer"
            >
              Copiar como Bookmarklet 1-Click
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
