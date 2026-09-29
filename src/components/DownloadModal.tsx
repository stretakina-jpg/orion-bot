import React, { useEffect } from 'react';
import { X, Download } from 'lucide-react';
import { useI18n } from '../lib/i18n';
import { downloadOrionExtensionZip } from '../lib/orionExtensionBundle';

interface DownloadModalProps {
  onClose: () => void;
}

const ANDROID_APK_URL =
  'https://ucycjlwmgdnayebmpfmf.supabase.co/storage/v1/object/public/admin-files/1778607789202-Orion_for_Quotex.apk';
const WINDOWS_EXE_URL =
  'https://www.mediafire.com/file/3sdshzdj4j7sfzf/Orion+Windows.exe/file';
const ANDROID_ICON = 'https://cdn-icons-png.flaticon.com/512/14/14415.png';
const WINDOWS_ICON =
  'https://logos-world.net/wp-content/uploads/2020/12/Windows-New-Logo.png';
const APPLE_ICON =
  'https://www.freepnglogos.com/uploads/apple-logo-png/apple-logo-png-index-content-uploads-10.png';

export const DownloadModal: React.FC<DownloadModalProps> = ({ onClose }) => {
  const { t } = useI18n();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6 sm:px-6 animate-[fadeIn_0.25s_ease-out]">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-3xl border border-white/15 bg-gradient-to-b from-slate-900/95 to-black/95 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-9 h-9 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/25 text-white/80 hover:text-white flex items-center justify-center transition-colors z-10 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-7 sm:p-10">
          <div className="flex items-center justify-center mb-6">
            <img
              src="https://cdn.worldvectorlogo.com/logos/quotex-io-1.svg"
              alt="Quotex"
              className="h-8 sm:h-10 w-auto object-contain"
              style={{ filter: 'brightness(0) invert(1)' }}
            />
          </div>

          <h3 className="text-center text-white text-2xl sm:text-3xl font-bold tracking-tight">
            {t('download.title')}
          </h3>
          <p className="mt-2 text-center text-white/60 text-sm sm:text-base">
            {t('download.desc')}
          </p>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Android */}
            <a
              href={ANDROID_APK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative rounded-2xl border border-white/15 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/30 p-6 flex flex-col items-center justify-center gap-4 transition-all duration-200 hover:scale-[1.02] active:scale-[0.99] overflow-hidden cursor-pointer"
            >
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />
              <img
                src={ANDROID_ICON}
                alt="Android"
                className="h-14 w-14 object-contain"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-[0.25em] text-white/50">Download</p>
                <p className="mt-1 text-white font-semibold text-base">Android</p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest font-semibold text-emerald-300 group-hover:text-emerald-200">
                <Download className="w-3.5 h-3.5" strokeWidth={2.6} />
                {t('download.apk')}
              </span>
            </a>

            {/* Windows */}
            <a
              href={WINDOWS_EXE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative rounded-2xl border border-white/15 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/30 p-6 flex flex-col items-center justify-center gap-4 transition-all duration-200 hover:scale-[1.02] active:scale-[0.99] overflow-hidden cursor-pointer"
            >
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />
              <img
                src={WINDOWS_ICON}
                alt="Windows"
                className="h-14 w-14 object-contain"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-[0.25em] text-white/50">Download</p>
                <p className="mt-1 text-white font-semibold text-base">Windows</p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest font-semibold text-sky-300 group-hover:text-sky-200">
                <Download className="w-3.5 h-3.5" strokeWidth={2.6} />
                {t('download.exe')}
              </span>
            </a>

            {/* iOS */}
            <div
              aria-disabled="true"
              className="group relative rounded-2xl border border-white/10 bg-white/[0.02] p-6 flex flex-col items-center justify-center gap-4 overflow-hidden cursor-not-allowed select-none"
            >
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
              <div className="absolute inset-0 bg-black/30 pointer-events-none" />
              <img
                src={APPLE_ICON}
                alt="iOS"
                className="h-14 w-14 object-contain opacity-70 relative"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
              <div className="text-center relative">
                <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">Download</p>
                <p className="mt-1 text-white/80 font-semibold text-base">iOS</p>
              </div>
              <span className="relative inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest font-semibold text-amber-300/90 px-2.5 py-1 rounded-full border border-amber-400/25 bg-amber-400/5">
                {t('download.comingSoon')}
              </span>
            </div>
          </div>

          {/* Extensão Completa Pocket Option / Quotex (.ZIP) */}
          <div className="mt-5">
            <button
              type="button"
              onClick={downloadOrionExtensionZip}
              className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-500 to-purple-600 hover:from-emerald-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-600/25 border border-white/20 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>📦 Baixar Extensão Completa Pocket Option / Quotex (.ZIP)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
