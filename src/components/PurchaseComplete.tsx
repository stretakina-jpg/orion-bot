import React from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { useI18n } from '../lib/i18n';

interface PurchaseCompleteProps {
  onNavigateHome: () => void;
}

const LOGO_ORION =
  'https://ucycjlwmgdnayebmpfmf.supabase.co/storage/v1/object/public/admin-files/1777054984651-ORION-LOGO.png';

export const PurchaseComplete: React.FC<PurchaseCompleteProps> = ({ onNavigateHome }) => {
  const { t } = useI18n();

  return (
    <div className="min-h-screen w-full bg-black text-white flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        <div className="flex justify-center mb-10">
          <img
            src={LOGO_ORION}
            alt="Orion"
            className="h-16 md:h-20 object-contain drop-shadow-[0_0_20px_rgba(16,185,129,0.35)]"
          />
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8 md:p-10 shadow-2xl">
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 rounded-full bg-emerald-500/30 blur-2xl animate-pulse" />
              <div className="relative h-20 w-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <CheckCircle2 className="h-12 w-12 text-white" strokeWidth={2.5} />
              </div>
            </div>

            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mb-3">
              {t('purchase.title')}
            </h1>

            <p className="text-neutral-400 leading-relaxed mb-8 max-w-sm">
              {t('purchase.desc')}
            </p>

            <button
              onClick={onNavigateHome}
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 px-7 py-3.5 font-medium text-white shadow-lg shadow-emerald-500/30 transition-all duration-200 hover:shadow-emerald-400/40 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              {t('purchase.access')}
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-neutral-500 mt-6">{t('purchase.welcome')}</p>
      </div>
    </div>
  );
};
