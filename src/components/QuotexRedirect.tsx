import React, { useState, useEffect } from 'react';
import { useI18n } from '../lib/i18n';

const LOGO_ORION =
  'https://ucycjlwmgdnayebmpfmf.supabase.co/storage/v1/object/public/admin-files/1777054984651-ORION-LOGO.png';
const LOGO_QUOTEX = 'https://cdn.worldvectorlogo.com/logos/quotex-io-1.svg';
const TARGET_URL = 'https://quotex.com/';
const DURATION_MS = 5000;

export const QuotexRedirect: React.FC = () => {
  const { t } = useI18n();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    let animId: number;

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, (elapsed / DURATION_MS) * 100);
      setProgress(pct);

      if (elapsed < DURATION_MS) {
        animId = requestAnimationFrame(tick);
      } else {
        window.location.replace(TARGET_URL);
      }
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white flex items-center justify-center px-6">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[640px] h-[640px] rounded-full bg-white/[0.04] blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[420px] h-[420px] rounded-full bg-sky-500/[0.06] blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[420px] h-[420px] rounded-full bg-emerald-500/[0.05] blur-3xl" />
      </div>

      <div className="relative w-full max-w-xl flex flex-col items-center">
        <div className="flex items-center justify-center gap-6 sm:gap-10 mb-12">
          <img
            src={LOGO_ORION}
            alt="Orion"
            className="h-12 sm:h-14 w-auto object-contain drop-shadow-[0_6px_18px_rgba(255,255,255,0.12)]"
          />
          <div className="h-10 sm:h-12 w-px bg-gradient-to-b from-transparent via-white/50 to-transparent" />
          <img
            src={LOGO_QUOTEX}
            alt="Quotex"
            className="h-8 sm:h-10 w-auto object-contain drop-shadow-[0_6px_18px_rgba(255,255,255,0.12)]"
            style={{ filter: 'brightness(0) invert(1)' }}
          />
        </div>

        <p className="text-center text-white/90 text-lg sm:text-xl font-medium tracking-wide mb-8">
          {t('redirect.opening')}
        </p>

        <div className="w-full max-w-md">
          <div className="relative h-[3px] w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-white rounded-full transition-[width] duration-100 ease-linear shadow-[0_0_18px_rgba(255,255,255,0.65)]"
              style={{ width: `${progress}%` }}
            />
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-transparent via-white/70 to-transparent rounded-full opacity-60 transition-[width] duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] uppercase tracking-[0.25em] text-white/50">
            <span>{t('redirect.loading')}</span>
            <span className="tabular-nums text-white/70">{Math.floor(progress)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
