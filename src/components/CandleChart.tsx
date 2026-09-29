import React, { useEffect, useRef, useState } from 'react';
import * as LightweightCharts from 'lightweight-charts';
import { supabase } from '../lib/supabase';

interface CandleChartProps {
  points: number[];
  livePrice: number | null;
  ticker: string;
  children?: React.ReactNode;
}

const CANDLE_PERIOD = 60;
const DEBOUNCE_MS = 800;

export const CandleChart: React.FC<CandleChartProps> = ({ points, livePrice, ticker, children }) => {
  const prevPointsRef = useRef<number[] | null>(null);
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<any>(null);
  const seriesRef = useRef<any>(null);
  const currentCandleRef = useRef<any>(null);
  const currentTickerRef = useRef(ticker);
  const lastSyncTimeRef = useRef(0);
  const pendingPriceRef = useRef<number | null>(null);
  const syncTimerRef = useRef<any>(null);

  const [tickDirection, setTickDirection] = useState<'up' | 'down' | 'flat'>('flat');
  const prevPriceRef = useRef<number | null>(null);
  const tickCountRef = useRef(0);

  useEffect(() => {
    currentTickerRef.current = ticker;
    currentCandleRef.current = null;
    if (seriesRef.current) {
      try {
        seriesRef.current.setData([]);
      } catch {}
    }
  }, [ticker]);

  useEffect(() => {
    if (points.length === 0) {
      prevPointsRef.current = null;
      return;
    }
    const latest = points[points.length - 1];
    if (prevPointsRef.current !== points) {
      prevPointsRef.current = points;
      updateCandle(latest);
    }
  }, [points]);

  const updateCandle = (price: number) => {
    const nowSec = Math.floor(Date.now() / 1000);
    const bucketTime = Math.floor(nowSec / CANDLE_PERIOD) * CANDLE_PERIOD;
    const cur = currentCandleRef.current;
    const isNew = !cur || cur.time !== bucketTime;

    const candle = isNew
      ? { time: bucketTime, open: price, high: price, low: price, close: price }
      : {
          time: bucketTime,
          open: cur.open,
          high: Math.max(cur.high, price),
          low: Math.min(cur.low, price),
          close: price,
        };

    currentCandleRef.current = candle;

    if (seriesRef.current) {
      try {
        if (isNew) {
          seriesRef.current.setData([candle]);
        } else {
          seriesRef.current.update(candle);
        }
      } catch {}
    }

    queueUpsert(price);
  };

  const queueUpsert = (price: number) => {
    pendingPriceRef.current = price;
    const elapsed = Date.now() - lastSyncTimeRef.current;
    if (elapsed >= DEBOUNCE_MS) {
      doUpsert();
    } else if (!syncTimerRef.current) {
      syncTimerRef.current = setTimeout(() => {
        syncTimerRef.current = null;
        doUpsert();
      }, DEBOUNCE_MS - elapsed);
    }
  };

  const doUpsert = () => {
    const price = pendingPriceRef.current;
    const t = currentTickerRef.current;
    pendingPriceRef.current = null;
    if (price == null || !t || t === '---') return;
    lastSyncTimeRef.current = Date.now();
    try {
      supabase.rpc('upsert_candle', { p_ticker: t, p_price: price }).then(() => {});
    } catch {}
  };

  useEffect(() => {
    return () => {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    };
  }, []);

  // Initialize chart
  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container) return;

    let chart: any = null;
    let series: any = null;

    try {
      chart = (LightweightCharts as any).createChart(container, {
        width: container.clientWidth || 300,
        height: container.clientHeight || 300,
        layout: {
          background: { color: 'transparent' },
          textColor: 'rgba(255, 255, 255, 0.55)',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          fontSize: 11,
        },
        grid: {
          vertLines: { visible: false },
          horzLines: { visible: false },
        },
        crosshair: {
          vertLine: { color: 'rgba(255, 255, 255, 0.2)', width: 1, style: 3 },
          horzLine: { color: 'rgba(255, 255, 255, 0.2)', width: 1, style: 3, labelBackgroundColor: '#0b1324' },
        },
        rightPriceScale: { visible: false },
        leftPriceScale: { visible: false },
        timeScale: {
          visible: false,
          borderVisible: false,
          barSpacing: container.clientWidth >= 320 ? 110 : 50,
          rightOffset: 0,
        },
        handleScroll: false,
        handleScale: false,
      });

      const candleOptions = {
        upColor: '#00ffa3',
        downColor: '#ff3d6a',
        borderUpColor: '#00ffa3',
        borderDownColor: '#ff3d6a',
        wickUpColor: 'rgba(0, 255, 163, 0.85)',
        wickDownColor: 'rgba(255, 61, 106, 0.85)',
        priceLineVisible: false,
        lastValueVisible: false,
        priceScaleId: 'right',
        autoscaleInfoProvider: () => {
          const c = currentCandleRef.current;
          if (!c) return null;
          const open = c.open;
          const margin = Math.max(Math.abs(c.high - open), Math.abs(c.low - open), open * 0.00015) * 2.2;
          return {
            priceRange: {
              minValue: open - margin,
              maxValue: open + margin,
            },
          };
        },
      };

      if (typeof chart.addSeries === 'function' && (LightweightCharts as any).CandlestickSeries) {
        series = chart.addSeries((LightweightCharts as any).CandlestickSeries, candleOptions);
      } else if (typeof chart.addCandlestickSeries === 'function') {
        series = chart.addCandlestickSeries(candleOptions);
      }

      chart.priceScale('right')?.applyOptions({
        scaleMargins: {
          top: 0.08,
          bottom: 0.32,
        },
      });

      chartRef.current = chart;
      seriesRef.current = series;

      const adjustBarSpacing = () => {
        if (!container || !chart) return;
        const w = container.clientWidth;
        const spacing = w >= 320 ? 110 : 50;
        const offset = Math.max(0, w / (2 * spacing) - 0.5);
        chart.timeScale?.().applyOptions?.({
          barSpacing: spacing,
          rightOffset: offset,
        });
      };

      if (currentCandleRef.current && series) {
        series.setData([currentCandleRef.current]);
      }
      adjustBarSpacing();

      const resizeObserver = new ResizeObserver(() => {
        if (!container || !chart) return;
        chart.applyOptions({
          width: container.clientWidth,
          height: container.clientHeight,
        });
        adjustBarSpacing();
      });
      resizeObserver.observe(container);

      return () => {
        resizeObserver.disconnect();
        seriesRef.current = null;
        chartRef.current = null;
        try {
          chart.remove();
        } catch {}
      };
    } catch (err) {
      console.warn('LightweightCharts init error, using fallback:', err);
    }
  }, []);

  useEffect(() => {
    if (livePrice == null) return;
    const prev = prevPriceRef.current;
    if (prev != null && prev !== livePrice) {
      setTickDirection(livePrice > prev ? 'up' : 'down');
    }
    prevPriceRef.current = livePrice;
    tickCountRef.current += 1;
  }, [livePrice]);

  const isUp =
    livePrice != null && currentCandleRef.current
      ? livePrice >= currentCandleRef.current.open
      : true;

  const displayPrice = livePrice != null ? livePrice.toFixed(5) : '---';

  return (
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-br from-slate-950/40 via-slate-950/20 to-black/40">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,rgba(0,200,255,0.08),transparent_60%)]" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_bottom_right,rgba(0,255,163,0.05),transparent_55%)]" />

      {/* Header with ticker and live price */}
      <div className="absolute top-2 left-2 right-2 sm:top-3 sm:left-3 sm:right-3 lg:top-5 lg:left-5 lg:right-5 flex flex-col items-center z-20 gap-0.5 lg:gap-1.5">
        <p className="text-[8px] sm:text-[10px] lg:text-sm uppercase tracking-[0.18em] text-white/50 truncate max-w-full font-mono">
          {ticker}
        </p>
        <div
          key={`${displayPrice}_${tickCountRef.current}`}
          className={`text-[11px] sm:text-sm lg:text-2xl font-mono font-semibold tabular-nums truncate max-w-full inline-flex items-center gap-1.5 ${
            isUp ? 'text-emerald-300' : 'text-rose-300'
          }`}
          style={{
            animation: 'priceFlash 480ms cubic-bezier(0.34, 1.56, 0.64, 1)',
            textShadow: isUp ? '0 0 14px rgba(0,255,163,0.7)' : '0 0 14px rgba(255,61,106,0.7)',
          }}
        >
          <span>{displayPrice}</span>
          {livePrice != null && tickDirection !== 'flat' && (
            <span
              className={`inline-block leading-none text-[8px] sm:text-[10px] lg:text-base ${
                tickDirection === 'up' ? 'text-emerald-300' : 'text-rose-300'
              }`}
              style={{
                transform: tickDirection === 'up' ? 'translateY(-1px)' : 'translateY(1px)',
              }}
            >
              {tickDirection === 'up' ? '▲' : '▼'}
            </span>
          )}
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div ref={chartContainerRef} className="absolute inset-0 w-full h-full pt-10 sm:pt-12 lg:pt-20" />

      {children && (
        <div className="absolute left-0 right-0 bottom-0 z-20 p-4 sm:p-5 pointer-events-none">
          <div className="pointer-events-auto">{children}</div>
        </div>
      )}
    </div>
  );
};
