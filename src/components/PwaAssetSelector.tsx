import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Star,
  TrendingUp,
  TrendingDown,
  X,
  ChevronRight,
  Flame,
  Globe2,
  Coins,
  Gem,
  Check,
} from 'lucide-react';

export interface PwaAsset {
  id: string;
  name: string;
  category: 'currencies' | 'crypto' | 'commodities' | 'stocks';
  payout: number;
  basePrice: number;
  change24h: number;
  sentimentUp: number; // 0 - 100
  isOtc: boolean;
  isFavorite?: boolean;
}

export const DEFAULT_PWA_ASSETS: PwaAsset[] = [
  {
    id: 'US500_OTC',
    name: 'US 500 (OTC)',
    category: 'stocks',
    payout: 86,
    basePrice: 5892.4,
    change24h: 0.65,
    sentimentUp: 76,
    isOtc: true,
    isFavorite: true,
  },
  {
    id: 'US100_OTC',
    name: 'US 100 (OTC)',
    category: 'stocks',
    payout: 86,
    basePrice: 20450.8,
    change24h: 0.82,
    sentimentUp: 74,
    isOtc: true,
    isFavorite: true,
  },
  {
    id: 'US30_OTC',
    name: 'US 30 (OTC)',
    category: 'stocks',
    payout: 86,
    basePrice: 43210.5,
    change24h: 0.45,
    sentimentUp: 71,
    isOtc: true,
    isFavorite: true,
  },
  {
    id: 'US2000_OTC',
    name: 'US 2000 (OTC)',
    category: 'stocks',
    payout: 86,
    basePrice: 2280.3,
    change24h: -0.15,
    sentimentUp: 69,
    isOtc: true,
    isFavorite: true,
  },
  {
    id: 'EURUSD_OTC',
    name: 'EUR/USD (OTC)',
    category: 'currencies',
    payout: 95,
    basePrice: 1.08450,
    change24h: 0.42,
    sentimentUp: 68,
    isOtc: true,
    isFavorite: true,
  },
  {
    id: 'GBPUSD_OTC',
    name: 'GBP/USD (OTC)',
    category: 'currencies',
    payout: 94,
    basePrice: 1.29320,
    change24h: -0.18,
    sentimentUp: 54,
    isOtc: true,
    isFavorite: true,
  },
  {
    id: 'USDJPY_OTC',
    name: 'USD/JPY (OTC)',
    category: 'currencies',
    payout: 93,
    basePrice: 154.250,
    change24h: 0.35,
    sentimentUp: 61,
    isOtc: true,
    isFavorite: true,
  },
  {
    id: 'AUDUSD_OTC',
    name: 'AUD/USD (OTC)',
    category: 'currencies',
    payout: 92,
    basePrice: 0.65420,
    change24h: -0.22,
    sentimentUp: 48,
    isOtc: true,
  },
  {
    id: 'EURGBP_OTC',
    name: 'EUR/GBP (OTC)',
    category: 'currencies',
    payout: 90,
    basePrice: 0.83860,
    change24h: 0.12,
    sentimentUp: 52,
    isOtc: true,
  },
  {
    id: 'BTCUSD_OTC',
    name: 'BTC/USD (OTC)',
    category: 'crypto',
    payout: 91,
    basePrice: 63840.0,
    change24h: 2.15,
    sentimentUp: 76,
    isOtc: true,
    isFavorite: true,
  },
  {
    id: 'ETHUSD_OTC',
    name: 'ETH/USD (OTC)',
    category: 'crypto',
    payout: 90,
    basePrice: 2640.50,
    change24h: 1.84,
    sentimentUp: 71,
    isOtc: true,
  },
  {
    id: 'SOLUSD_OTC',
    name: 'SOL/USD (OTC)',
    category: 'crypto',
    payout: 89,
    basePrice: 152.80,
    change24h: 3.42,
    sentimentUp: 82,
    isOtc: true,
  },
  {
    id: 'GOLD_OTC',
    name: 'Ouro / Gold (OTC)',
    category: 'commodities',
    payout: 92,
    basePrice: 2650.40,
    change24h: 0.65,
    sentimentUp: 74,
    isOtc: true,
    isFavorite: true,
  },
  {
    id: 'SILVER_OTC',
    name: 'Prata / Silver (OTC)',
    category: 'commodities',
    payout: 88,
    basePrice: 31.85,
    change24h: -0.45,
    sentimentUp: 45,
    isOtc: true,
  },
  {
    id: 'OIL_BRENT_OTC',
    name: 'Petróleo Brent (OTC)',
    category: 'commodities',
    payout: 87,
    basePrice: 74.20,
    change24h: -1.10,
    sentimentUp: 38,
    isOtc: true,
  },
];

interface PwaAssetSelectorProps {
  selectedAssetId?: string;
  onSelectAsset?: (asset: PwaAsset) => void;
  showModalInitially?: boolean;
  compactMode?: boolean;
}

export const PwaAssetSelector: React.FC<PwaAssetSelectorProps> = ({
  selectedAssetId = 'EURUSD_OTC',
  onSelectAsset,
  showModalInitially = false,
  compactMode = false,
}) => {
  const [currentId, setCurrentId] = useState<string>(selectedAssetId);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(showModalInitially);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'currencies' | 'crypto' | 'commodities' | 'favorites'>('all');
  const [favorites, setFavorites] = useState<string[]>(() => {
    return DEFAULT_PWA_ASSETS.filter((a) => a.isFavorite).map((a) => a.id);
  });

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const currentAsset = useMemo(
    () => DEFAULT_PWA_ASSETS.find((a) => a.id === currentId) || DEFAULT_PWA_ASSETS[0],
    [currentId]
  );

  const filteredAssets = useMemo(() => {
    return DEFAULT_PWA_ASSETS.filter((asset) => {
      const matchesSearch =
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.id.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (selectedCategory === 'favorites') {
        return favorites.includes(asset.id);
      }
      if (selectedCategory !== 'all') {
        return asset.category === selectedCategory;
      }
      return true;
    }).sort((a, b) => b.payout - a.payout);
  }, [searchQuery, selectedCategory, favorites]);

  const handleSelect = (asset: PwaAsset) => {
    setCurrentId(asset.id);
    if (onSelectAsset) {
      onSelectAsset(asset);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="_wrapper_jfp1l_8 w-full select-none">
      {/* 1. TOP CAROUSEL SELECTOR BAR */}
      <div className="flex items-center gap-1.5 w-full bg-[#0b0f17]/95 border-b border-white/[0.08] px-2 py-1.5 backdrop-blur-md">
        {/* Quick Add / Search Filter Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 transition-all shrink-0 cursor-pointer shadow-sm shadow-purple-950/40"
          title="Abrir Seletor de Ativos OTC"
        >
          <Plus className="w-4 h-4 text-purple-200" />
        </button>

        {/* Carousel Viewport */}
        <div className="_carouselWrapper_jfp1l_16 flex-1 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 min-w-max">
            {DEFAULT_PWA_ASSETS.slice(0, compactMode ? 6 : 8).map((asset) => {
              const isSelected = asset.id === currentId;
              return (
                <div
                  key={asset.id}
                  onClick={() => handleSelect(asset)}
                  className={`_wrapper_prpkb_1 ${
                    isSelected ? '_selected_prpkb_30' : ''
                  } ${
                    asset.change24h >= 0 ? '_profit_prpkb_41' : '_loss_prpkb_52'
                  }`}
                  role="button"
                  tabIndex={0}
                >
                  <div className="_info_prpkb_78 flex items-center justify-between gap-2 w-full">
                    <div className="flex flex-col min-w-0">
                      <span className="text-[11px] font-bold text-white tracking-wide truncate">
                        {asset.name.replace(' (OTC)', '')}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono">
                        OTC • {asset.change24h >= 0 ? '+' : ''}{asset.change24h}%
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          asset.payout >= 90
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {asset.payout}%
                      </span>

                      {/* Mini Sentiment Bar */}
                      <div className="_Sentiment_2mua0_1">
                        <div
                          className="_bar_2mua0_27"
                          data-direction={asset.sentimentUp >= 50 ? 'up' : 'down'}
                          style={{
                            height: `${Math.max(10, (asset.sentimentUp / 100) * 20)}px`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* All Assets shortcut */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white text-[11px] font-semibold transition-colors shrink-0 cursor-pointer border border-white/10"
        >
          <span>Todos</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>

      {/* 2. FULL MODAL ASSET SELECTOR */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-[#090d14] border border-white/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-[#0c121d]">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-purple-500 animate-pulse" />
                <h3 className="font-heading font-bold text-white text-base tracking-wide">
                  SELETOR DE ATIVOS OTC • ORION TRADER
                </h3>
                <span className="text-[10px] font-bold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded">
                  PWA Asset Engine
                </span>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input Bar */}
            <div className="px-5 pt-4 pb-2">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
                <input
                  type="text"
                  placeholder="Pesquisar moeda, cripto, commodity ou par OTC..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#121824] border border-white/10 focus:border-purple-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 text-slate-400 hover:text-white text-xs"
                  >
                    Limpar
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1.5 px-5 py-2 border-b border-white/10 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'bg-white/[0.04] text-slate-400 hover:text-white'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Todos ({DEFAULT_PWA_ASSETS.length})</span>
              </button>

              <button
                onClick={() => setSelectedCategory('currencies')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  selectedCategory === 'currencies'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'bg-white/[0.04] text-slate-400 hover:text-white'
                }`}
              >
                <Globe2 className="w-3.5 h-3.5" />
                <span>Moedas OTC</span>
              </button>

              <button
                onClick={() => setSelectedCategory('crypto')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  selectedCategory === 'crypto'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'bg-white/[0.04] text-slate-400 hover:text-white'
                }`}
              >
                <Coins className="w-3.5 h-3.5" />
                <span>Cripto</span>
              </button>

              <button
                onClick={() => setSelectedCategory('commodities')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  selectedCategory === 'commodities'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'bg-white/[0.04] text-slate-400 hover:text-white'
                }`}
              >
                <Gem className="w-3.5 h-3.5" />
                <span>Commodities</span>
              </button>

              <button
                onClick={() => setSelectedCategory('favorites')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  selectedCategory === 'favorites'
                    ? 'bg-amber-500 text-black font-bold shadow-md shadow-amber-500/30'
                    : 'bg-white/[0.04] text-slate-400 hover:text-white'
                }`}
              >
                <Star className="w-3.5 h-3.5" />
                <span>Favoritos ({favorites.length})</span>
              </button>
            </div>

            {/* Assets List */}
            <div className="flex-1 overflow-y-auto px-5 py-3 space-y-1.5 divide-y divide-white/[0.04]">
              {filteredAssets.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Nenhum ativo encontrado para &quot;{searchQuery}&quot;.
                </div>
              ) : (
                filteredAssets.map((asset) => {
                  const isFav = favorites.includes(asset.id);
                  const isSelected = asset.id === currentId;

                  return (
                    <div
                      key={asset.id}
                      onClick={() => handleSelect(asset)}
                      className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-purple-600/15 border border-purple-500/40'
                          : 'hover:bg-white/[0.04] border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => toggleFavorite(asset.id, e)}
                          className="p-1 rounded-md text-slate-500 hover:text-amber-400 cursor-pointer transition-colors"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              isFav ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
                            }`}
                          />
                        </button>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-xs tracking-wide">
                              {asset.name}
                            </span>
                            {asset.isOtc && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                OTC
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono">
                            Preço base: {asset.basePrice > 100 ? asset.basePrice.toLocaleString() : asset.basePrice.toFixed(5)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {/* 24h Trend */}
                        <div className="text-right">
                          <span
                            className={`text-xs font-bold font-mono flex items-center justify-end gap-1 ${
                              asset.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {asset.change24h >= 0 ? (
                              <TrendingUp className="w-3.5 h-3.5" />
                            ) : (
                              <TrendingDown className="w-3.5 h-3.5" />
                            )}
                            {asset.change24h >= 0 ? '+' : ''}{asset.change24h}%
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            Sentimento: {asset.sentimentUp}% Alta
                          </span>
                        </div>

                        {/* Payout Tag */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                            +{asset.payout}%
                          </span>
                          {isSelected && (
                            <Check className="w-4 h-4 text-purple-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-white/10 bg-[#0c121d] flex items-center justify-between text-xs text-slate-400">
              <span>
                Ativo selecionado:{' '}
                <strong className="text-white">{currentAsset.name}</strong> (+{currentAsset.payout}%)
              </span>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold cursor-pointer transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
