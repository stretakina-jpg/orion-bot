import React, { useEffect, useRef } from 'react';
import { TrendingUp, Zap, Shield, BarChart3, ChevronRight } from 'lucide-react';
import { useI18n } from '../lib/i18n';

const LOGO_ORION =
  'https://ucycjlwmgdnayebmpfmf.supabase.co/storage/v1/object/public/admin-files/1777054984651-ORION-LOGO.png';
const VIDEO_BACKGROUND =
  'https://oggtaibqhyvmupulskfm.supabase.co/storage/v1/object/public/admin-files/1777054051734-Background_Orion.mp4';

const HOME_BROKERS = [
  {
    name: 'Quotex',
    logo: 'https://ucycjlwmgdnayebmpfmf.supabase.co/storage/v1/object/public/admin-files/1777055305836-quotex.png',
  },
  {
    name: 'IQ Option',
    logo: 'https://ucycjlwmgdnayebmpfmf.supabase.co/storage/v1/object/public/admin-files/1777055326325-iqoption.png',
  },
  {
    name: 'Alpine Forex',
    logo: 'https://ucycjlwmgdnayebmpfmf.supabase.co/storage/v1/object/public/admin-files/1777055340200-alpineforex.png',
  },
  {
    name: 'Pocket Option',
    logo: 'https://ucycjlwmgdnayebmpfmf.supabase.co/storage/v1/object/public/admin-files/1777055360770-pocket.png',
  },
  {
    name: 'Polarium Broker',
    logo: 'https://ucycjlwmgdnayebmpfmf.supabase.co/storage/v1/object/public/admin-files/1777055379517-polarium.png',
  },
  {
    name: 'Exnova',
    logo: 'https://ucycjlwmgdnayebmpfmf.supabase.co/storage/v1/object/public/admin-files/1777055402341-exnova.png',
  },
];

interface HomeLandingProps {
  onStartNow?: () => void;
}

export const HomeLanding: React.FC<HomeLandingProps> = ({ onStartNow }) => {
  const { t } = useI18n();
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.fade-in').forEach((el) => {
      observerRef.current?.observe(el);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  const featuresList = [
    t('home.feat1'),
    t('home.feat2'),
    t('home.feat3'),
    t('home.feat4'),
    t('home.feat5'),
    t('home.feat6'),
    t('home.feat7'),
    t('home.feat8'),
    t('home.feat9'),
    t('home.feat10'),
    t('home.feat11'),
    t('home.feat12'),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-slate-950/80 backdrop-blur-lg border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2">
            <img
              src={LOGO_ORION}
              alt="Orion"
              className="h-10 w-auto object-contain"
              width={160}
              height={40}
            />
          </a>
          <div className="flex items-center gap-4">
            <button
              onClick={onStartNow}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium text-sm transition-colors duration-200 cursor-pointer"
            >
              {t('trade.openPanel')}
            </button>
            <a
              href="#pricing"
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg font-medium text-sm transition-colors duration-200 border border-slate-700"
            >
              {t('home.seePlans')}
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-6 py-24 relative overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
          src={VIDEO_BACKGROUND}
        />
        <div className="absolute inset-0 bg-slate-950/80 z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-slate-950/60 z-10" />

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-20 pt-10">
          <div className="space-y-8">
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
              <span className="text-white">Orion</span>
              <br />
              <span className="text-slate-400">{t('home.traderBot')}</span>
            </h1>

            <p className="text-xl text-slate-400 leading-relaxed max-w-xl">
              {t('home.heroDesc')}
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                type="button"
                onClick={onStartNow}
                className="group px-8 py-4 bg-slate-100 hover:bg-white text-slate-900 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 cursor-pointer shadow-lg hover:scale-[1.02] active:scale-[0.98]"
              >
                {t('home.startNow')}
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <a
                href="#features"
                className="px-8 py-4 border border-slate-700 hover:border-slate-600 rounded-xl font-semibold transition-all duration-200 hover:bg-white/5"
              >
                {t('home.seeFeatures')}
              </a>
            </div>

            <div className="flex items-center gap-6 pt-4 text-sm text-slate-400">
              <div>
                <p className="text-2xl font-bold text-white font-mono">3.847</p>
                <p>{t('home.activeUsers')}</p>
              </div>
              <div className="w-px h-12 bg-slate-800" />
              <div>
                <p className="text-2xl font-bold text-white font-mono">94.2%</p>
                <p>{t('home.precisionRate')}</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative bg-slate-900/50 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-sm shadow-2xl">
              <div className="flex items-center justify-between pb-6 border-b border-slate-800 mb-6">
                <img
                  src={LOGO_ORION}
                  alt="Orion"
                  className="h-10 w-auto object-contain"
                  width={160}
                  height={40}
                />
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-green-400 text-sm font-medium">
                    {t('home.operating')}
                  </span>
                </div>
              </div>

              <p className="text-slate-400 text-sm mb-5 font-medium">
                {t('home.compatibleBrokers')}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                {HOME_BROKERS.map((b) => (
                  <div
                    key={b.name}
                    className="group aspect-[16/9] bg-slate-800/40 border border-slate-800 hover:border-slate-700 rounded-xl flex items-center justify-center p-3 sm:p-4 transition-all duration-300 hover:bg-slate-800/70"
                    title={b.name}
                  >
                    <img
                      src={b.logo}
                      alt={b.name}
                      className="max-h-full max-w-full w-auto h-auto object-contain transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 fade-in">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4 text-white">
              {t('home.proTech')}
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              {t('home.proTechDesc')}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="fade-in group bg-slate-900/50 border border-slate-800 rounded-2xl p-8 hover:border-slate-700 transition-all duration-300 hover:bg-slate-900/80">
              <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mb-6 group-hover:bg-slate-700 transition-colors">
                <TrendingUp className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">
                {t('home.advancedAlgorithms')}
              </h3>
              <p className="text-slate-400 leading-relaxed">
                {t('home.advancedAlgorithmsDesc')}
              </p>
            </div>

            <div className="fade-in group bg-slate-900/50 border border-slate-800 rounded-2xl p-8 hover:border-slate-700 transition-all duration-300 hover:bg-slate-900/80">
              <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mb-6 group-hover:bg-slate-700 transition-colors">
                <Zap className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">
                {t('home.efficientExecution')}
              </h3>
              <p className="text-slate-400 leading-relaxed">
                {t('home.efficientExecutionDesc')}
              </p>
            </div>

            <div className="fade-in group bg-slate-900/50 border border-slate-800 rounded-2xl p-8 hover:border-slate-700 transition-all duration-300 hover:bg-slate-900/80">
              <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mb-6 group-hover:bg-slate-700 transition-colors">
                <Shield className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">
                {t('home.riskManagement')}
              </h3>
              <p className="text-slate-400 leading-relaxed">
                {t('home.riskManagementDesc')}
              </p>
            </div>

            <div className="fade-in group bg-slate-900/50 border border-slate-800 rounded-2xl p-8 hover:border-slate-700 transition-all duration-300 hover:bg-slate-900/80">
              <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mb-6 group-hover:bg-slate-700 transition-colors">
                <BarChart3 className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">
                {t('home.completeDashboard')}
              </h3>
              <p className="text-slate-400 leading-relaxed">
                {t('home.completeDashboardDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Included Features list */}
      <section className="py-32 px-6 relative bg-slate-900/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 fade-in">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4 text-white">
              {t('home.includedFeatures')}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {featuresList.map((feature, i) => (
              <div
                key={i}
                className="fade-in flex items-start gap-4 p-5 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-slate-700 transition-all duration-300"
              >
                <div className="flex-shrink-0 w-5 h-5 mt-0.5">
                  <svg
                    className="w-5 h-5 text-blue-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <p className="text-slate-300 font-medium">{feature}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Card */}
      <section id="pricing" className="py-32 px-6 relative">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 fade-in">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4 text-white">
              {t('home.annualPlan')}
            </h2>
            <p className="text-xl text-slate-400">{t('home.fullAccess')}</p>
          </div>

          <div className="fade-in">
            <div className="relative bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
              <div className="p-8 lg:p-12">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-6 mb-8">
                  <div>
                    <div className="inline-block px-4 py-1.5 bg-slate-800 border border-slate-700 rounded-full text-sm mb-4 font-semibold text-blue-300">
                      {t('home.premiumPlan')}
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-2">
                      {t('home.annualAccess')}
                    </h3>
                    <p className="text-slate-400">{t('home.allFeaturesIncluded')}</p>
                  </div>
                  <img
                    src={LOGO_ORION}
                    alt="Orion"
                    className="h-16 w-auto object-contain"
                    width={256}
                    height={64}
                  />
                </div>

                <div className="grid lg:grid-cols-2 gap-8 mb-8">
                  <div>
                    <div className="flex items-baseline gap-3 mb-4">
                      <span className="text-5xl font-bold text-white font-mono">R$ 497</span>
                      <div>
                        <p className="text-slate-500 line-through text-lg">R$ 997</p>
                      </div>
                    </div>
                    <p className="text-slate-400 mb-2">{t('home.or12x')}</p>
                    <p className="text-blue-400 text-sm font-semibold">
                      {t('home.launchOffer')}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {[
                      t('home.365days'),
                      t('home.allFeatures'),
                      t('home.freeUpdates'),
                      t('home.prioritySupport'),
                      t('home.exclusiveCommunity'),
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-5 h-5 bg-slate-800 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <span className="text-slate-300 font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onStartNow}
                  className="block w-full py-4 bg-slate-100 hover:bg-white text-slate-900 rounded-xl text-center text-lg font-semibold hover:scale-[1.02] transition-all duration-200 mb-6 cursor-pointer"
                >
                  {t('home.subscribeNow')}
                </button>

                <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    {t('home.securePayment')}
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    {t('home.immediateAccess')}
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-400" />
                    {t('home.guarantee7days')}
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 border-t border-slate-800 px-8 py-6">
                <p className="text-center text-sm text-slate-400">
                  <span className="font-semibold text-white">
                    {t('home.refundPolicy')}
                  </span>{' '}
                  {t('home.refundDesc')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-900">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <img
              src={LOGO_ORION}
              alt="Orion"
              className="h-10 w-auto object-contain opacity-60"
              width={160}
              height={40}
            />
            <p className="text-slate-500 text-sm text-center">
              © {new Date().getFullYear()} Orion Bot. {t('home.allRights')}
            </p>
          </div>

          <div className="mt-10 pt-8 border-t border-slate-900/80">
            <p className="text-center text-xs uppercase tracking-widest text-slate-600 mb-5 font-semibold">
              {t('home.compatibleBrokers')}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 sm:gap-x-10">
              {HOME_BROKERS.map((b) => (
                <img
                  key={b.name}
                  src={b.logo}
                  alt={b.name}
                  className="h-5 sm:h-6 w-auto object-contain opacity-40 hover:opacity-70 transition-opacity duration-300 grayscale hover:grayscale-0"
                  loading="lazy"
                />
              ))}
            </div>
          </div>

          <p className="text-slate-600 text-xs text-center mt-8 leading-relaxed max-w-2xl mx-auto">
            {t('home.riskWarning')}
          </p>
        </div>
      </footer>
    </div>
  );
};
