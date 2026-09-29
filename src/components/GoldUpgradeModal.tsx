import React from 'react';
import { X, Crown, Check } from 'lucide-react';
import { useI18n } from '../lib/i18n';

interface GoldUpgradeModalProps {
  email: string;
  onClose: () => void;
}

const LOGO_ORION =
  'https://ucycjlwmgdnayebmpfmf.supabase.co/storage/v1/object/public/admin-files/1777054984651-ORION-LOGO.png';
const CHECKOUT_URL = 'https://go.perfectpay.com.br/PPU38CQC4HN';
const BROKERS_LIST = [
  'Quotex',
  'BrokerQX',
  'IQ Option',
  'Alpine Forex',
  'Pocket Option',
  'Polarium Broker',
];

export const GoldUpgradeModal: React.FC<GoldUpgradeModalProps> = ({ email, onClose }) => {
  const { t } = useI18n();
  const checkoutHref = email
    ? `${CHECKOUT_URL}?email=${encodeURIComponent(email)}`
    : CHECKOUT_URL;

  const benefits = [
    t('upgrade.benefit1'),
    t('upgrade.benefit2'),
    t('upgrade.benefit3'),
    t('upgrade.benefit4'),
  ];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 py-8 animate-[fadeIn_0.3s_ease-out]">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-md">
        <div className="absolute -inset-16 rounded-[3rem] bg-gradient-to-br from-amber-400/25 via-transparent to-amber-200/10 blur-3xl opacity-70 pointer-events-none" />
        <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-br from-amber-300/40 via-white/10 to-amber-500/30 opacity-80 blur-[1px] pointer-events-none" />

        <div className="relative rounded-3xl overflow-hidden border border-amber-300/25 bg-white/[0.06] backdrop-blur-2xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-300/10 via-white/[0.02] to-transparent pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-200/60 to-transparent" />

          <div className="relative px-7 pt-6 pb-7">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/25 text-white/60 hover:text-white transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-3 mb-5 mt-1">
              <img
                src={LOGO_ORION}
                alt="Orion"
                className="h-10 w-auto object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]"
              />
              <div className="h-8 w-px bg-gradient-to-b from-transparent via-amber-200/40 to-transparent" />
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-400/40">
                <Crown
                  className="w-3.5 h-3.5 text-amber-400"
                  style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.4))' }}
                  strokeWidth={2.3}
                />
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-200">
                  {t('upgrade.goldPlan')}
                </span>
              </div>
            </div>

            <h2 className="text-center text-[22px] sm:text-2xl font-semibold text-white tracking-tight leading-snug">
              {t('upgrade.unlockBrokers')}
            </h2>
            <p className="text-center text-slate-300/80 text-sm mt-1.5 mb-5 leading-relaxed">
              {t('upgrade.desc')}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-1.5 mb-5">
              {BROKERS_LIST.map((bName) => (
                <span
                  key={bName}
                  className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-200"
                >
                  {bName}
                </span>
              ))}
            </div>

            <ul className="space-y-2.5 mb-6">
              {benefits.map((benefit, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-200">
                  <span className="mt-0.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/20 border border-amber-400/40 shrink-0">
                    <Check className="w-3 h-3 text-amber-200" strokeWidth={3} />
                  </span>
                  <span className="leading-snug">{benefit}</span>
                </li>
              ))}
            </ul>

            <div className="flex items-baseline justify-center gap-1.5 mb-5">
              <span className="text-sm text-slate-400">R$</span>
              <span className="text-5xl font-bold text-white tracking-tight">97</span>
              <span className="text-lg font-semibold text-slate-300">,00</span>
              <span className="text-xs text-slate-400 ml-1">{t('upgrade.singlePayment')}</span>
            </div>

            <a
              href={checkoutHref}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 hover:from-amber-200 hover:via-amber-300 hover:to-amber-400 text-amber-950 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_14px_40px_-10px_rgba(245,158,11,0.55)] cursor-pointer"
            >
              {t('upgrade.buyGold')}
            </a>

            <p className="mt-4 text-center text-xs text-amber-300/90 font-medium leading-relaxed">
              <span className="text-white/50 line-through">Valor original R$ 597,00</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
