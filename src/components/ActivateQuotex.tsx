import React, { useState, useEffect } from 'react';
import { ExternalLink } from 'lucide-react';
import { useI18n } from '../lib/i18n';

const VIDEO_DESKTOP =
  'https://ucycjlwmgdnayebmpfmf.supabase.co/storage/v1/object/public/admin-files/1777057704514-Orion_desktop_background.mp4';
const VIDEO_MOBILE =
  'https://ucycjlwmgdnayebmpfmf.supabase.co/storage/v1/object/public/admin-files/1777058228948-Orion_mobile_video_2.mp4';
const LOGO_ORION =
  'https://ucycjlwmgdnayebmpfmf.supabase.co/storage/v1/object/public/admin-files/1777054984651-ORION-LOGO.png';
const QUOTEX_SIGNUP_URL = 'https://broker-qx.pro/sign-up/?lid=2113332';

export const ActivateQuotex: React.FC = () => {
  const { t } = useI18n();
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 768px)').matches : false
  );

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const videoSrc = isMobile ? VIDEO_MOBILE : VIDEO_DESKTOP;

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white">
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover z-0"
        src={videoSrc}
        key={videoSrc}
      />
      <div className="absolute inset-0 bg-black/85 z-10" />

      <div className="relative z-20 min-h-screen flex flex-col items-center justify-start px-6 pt-14 sm:pt-20 pb-16">
        <img
          src={LOGO_ORION}
          alt="Orion"
          className="h-12 sm:h-16 w-auto object-contain drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]"
        />

        <div className="mt-12 sm:mt-16 w-full max-w-xl">
          <div className="relative rounded-3xl border border-white/15 bg-white/[0.05] backdrop-blur-2xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)] p-7 sm:p-10">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

            <div className="flex items-center justify-center mb-6 sm:mb-8">
              <img
                src="https://cdn.worldvectorlogo.com/logos/quotex-io-1.svg"
                alt="Quotex"
                className="h-8 sm:h-10 w-auto object-contain drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </div>

            <p className="text-center text-white/85 text-base sm:text-lg leading-[1.6] font-normal">
              {t('activate.desc')}
            </p>

            <a
              href={QUOTEX_SIGNUP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 hover:from-emerald-300 hover:to-emerald-500 text-slate-900 font-bold text-sm sm:text-base tracking-[0.18em] uppercase shadow-[0_20px_45px_-10px_rgba(16,185,129,0.6)] transition-all duration-200 hover:scale-[1.02] active:scale-[0.99] cursor-pointer"
            >
              <span>{t('activate.register')}</span>
              <ExternalLink className="w-4 h-4" strokeWidth={2.6} />
            </a>

            <p className="mt-8 text-center text-white/80 text-sm sm:text-base font-medium">
              Assista o passo a passo abaixo:
            </p>

            <div
              className="mt-4 w-full rounded-xl overflow-hidden shadow-2xl"
              style={{ position: 'relative', paddingTop: '179.8148148148148%' }}
            >
              <iframe
                id="panda-2e2b16c7-840c-4fa7-9d28-84dd9acdd097"
                src="https://player-vz-b3cab787-147.tv.pandavideo.com.br/embed/?v=2e2b16c7-840c-4fa7-9d28-84dd9acdd097"
                style={{
                  border: 'none',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                }}
                allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture"
                allowFullScreen
                width="100%"
                height="100%"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
