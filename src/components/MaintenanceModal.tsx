import React, { useEffect } from 'react';
import { X, Wrench } from 'lucide-react';
import { useI18n } from '../lib/i18n';

interface MaintenanceModalProps {
  brokerName: string;
  onClose: () => void;
}

export const MaintenanceModal: React.FC<MaintenanceModalProps> = ({ brokerName, onClose }) => {
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
      <div className="relative w-full max-w-md rounded-3xl border border-white/15 bg-gradient-to-b from-slate-900/95 to-black/95 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-300/60 to-transparent" />

        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-9 h-9 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/25 text-white/80 hover:text-white flex items-center justify-center transition-colors z-10 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-8 sm:p-10 text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center mb-5">
            <Wrench className="w-7 h-7 text-amber-300" strokeWidth={2.2} />
          </div>

          <h3 className="text-white text-2xl sm:text-3xl font-bold tracking-tight">
            {t('maintenance.title')}
          </h3>
          <p className="mt-3 text-white/70 text-sm sm:text-base leading-relaxed">
            <span className="text-white font-semibold">{brokerName}</span>{' '}
            {t('maintenance.desc')}
          </p>

          <button
            type="button"
            onClick={onClose}
            className="mt-7 w-full inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 hover:border-white/30 text-white font-semibold text-sm tracking-[0.15em] uppercase transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            {t('maintenance.understood')}
          </button>
        </div>
      </div>
    </div>
  );
};
