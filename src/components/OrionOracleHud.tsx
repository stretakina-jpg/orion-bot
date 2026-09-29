import React, { useState, useEffect, useRef } from 'react';
import {
  RotateCcw,
  Users,
  History,
  Search,
  X,
  Star,
  SlidersHorizontal,
} from 'lucide-react';

// Official Orion Assets from the V5.1 Script & Video
export const ORION_ASSETS_URLS = {
  SUPABASE_URL: 'https://ucycjlwmgdnayebmpfmf.supabase.co',
  SUPABASE_ANON:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjeWNqbHdtZ2RuYXllYm1wZm1mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2OTE5NDgsImV4cCI6MjA4MjI2Nzk0OH0.ZO_zA0cZvnVIz9oSstMRW-bKi5iLSDg2UC02M8Olync',
  FN_URL: 'https://ucycjlwmgdnayebmpfmf.supabase.co/functions/v1/broker-signal',
  BULL_ICON:
    'https://ucycjlwmgdnayebmpfmf.supabase.co/storage/v1/object/public/admin-files/1778007746461-bull.png',
  BEAR_ICON:
    'https://ucycjlwmgdnayebmpfmf.supabase.co/storage/v1/object/public/admin-files/1778007752753-bear.png',
  BTC_ICON:
    'https://ucycjlwmgdnayebmpfmf.supabase.co/storage/v1/object/public/admin-files/1778008048670-btc-icon.png',
  ORION_LOGO:
    'https://ucycjlwmgdnayebmpfmf.supabase.co/storage/v1/object/public/admin-files/1777054984651-ORION-LOGO.png',
  DESKTOP_VIDEO:
    'https://oggtaibqhyvmupulskfm.supabase.co/storage/v1/object/public/admin-files/1777054051734-Background_Orion.mp4',
};

export interface OrionOracleHudProps {
  onExecuteTrade?: (
    direction: 'CALL' | 'PUT',
    asset: string,
    amount: number,
    expirationSec?: number
  ) => void;
  onAssetChange?: (assetName: string) => void;
  chartCandleTrend?: 'UP' | 'DOWN';
  initialBalance?: number;
  initialMeta?: number;
  compact?: boolean;
}

export interface BrokerAssetItem {
  ticker: string;
  name: string;
  BlitzPayout: number;
  BinaryPayout: number;
  type: 'all' | 'currencies' | 'actions' | 'commodities' | 'indices' | 'crypto';
  iconBg: string;
  iconText: string;
  isNew?: boolean;
  fav?: boolean;
}

const RAW_SCANNER_OTC_TUPLES: Array<[string, string, number, 'currencies' | 'actions' | 'commodities' | 'indices' | 'crypto', string]> = [
  // Moedas OTC
  ['AEDCNY', 'AED/CNY OTC', 92, 'currencies', '💱'],
  ['TNDUSD', 'TND/USD OTC', 92, 'currencies', '💱'],
  ['EURUSD', 'EUR/USD (OTC)', 92, 'currencies', '🇪🇺'],
  ['GBPUSD', 'GBP/USD (OTC)', 92, 'currencies', '🇬🇧'],
  ['USDJPY', 'USD/JPY (OTC)', 92, 'currencies', '🇺🇸'],
  ['AUDUSD', 'AUD/USD (OTC)', 92, 'currencies', '🇦🇺'],
  ['USDCAD', 'USD/CAD (OTC)', 92, 'currencies', '🇺🇸'],
  ['USDCHF', 'USD/CHF (OTC)', 91, 'currencies', '🇨🇭'],
  ['NZDUSD', 'NZD/USD (OTC)', 91, 'currencies', '🇳🇿'],
  ['EURJPY', 'EUR/JPY (OTC)', 92, 'currencies', '🇪🇺'],
  ['GBPJPY', 'GBP/JPY (OTC)', 92, 'currencies', '🇬🇧'],
  ['EURGBP', 'EUR/GBP (OTC)', 91, 'currencies', '🇪🇺'],
  ['GBPAUD', 'GBP/AUD (OTC)', 92, 'currencies', '🇬🇧'],
  ['AUDCHF', 'AUD/CHF (OTC)', 92, 'currencies', '🇦🇺'],
  ['AUDCAD', 'AUD/CAD (OTC)', 92, 'currencies', '🇦🇺'],
  ['AUDNZD', 'AUD/NZD (OTC)', 92, 'currencies', '🇦🇺'],
  ['AUDJPY', 'AUD/JPY (OTC)', 91, 'currencies', '🇦🇺'],
  ['CADJPY', 'CAD/JPY (OTC)', 90, 'currencies', '🇨🇦'],
  ['CADCHF', 'CAD/CHF (OTC)', 90, 'currencies', '🇨🇦'],
  ['CHFJPY', 'CHF/JPY (OTC)', 91, 'currencies', '🇨🇭'],
  ['EURAUD', 'EUR/AUD (OTC)', 91, 'currencies', '🇪🇺'],
  ['EURCAD', 'EUR/CAD (OTC)', 91, 'currencies', '🇪🇺'],
  ['EURCHF', 'EUR/CHF (OTC)', 90, 'currencies', '🇪🇺'],
  ['EURNZD', 'EUR/NZD (OTC)', 90, 'currencies', '🇪🇺'],
  ['GBPCAD', 'GBP/CAD (OTC)', 91, 'currencies', '🇬🇧'],
  ['GBPCHF', 'GBP/CHF (OTC)', 91, 'currencies', '🇬🇧'],
  ['USDBRL', 'USD/BRL (OTC)', 92, 'currencies', '🇧🇷'],
  ['USDMXN', 'USD/MXN (OTC)', 91, 'currencies', '🇲🇽'],
  ['USDSGD', 'USD/SGD (OTC)', 90, 'currencies', '🇸🇬'],
  ['USDTRY', 'USD/TRY (OTC)', 91, 'currencies', '🇹🇷'],
  ['USDINR', 'USD/INR (OTC)', 91, 'currencies', '🇮🇳'],
  ['USDZAR', 'USD/ZAR (OTC)', 90, 'currencies', '🇿🇦'],
  ['USDPHP', 'USD/PHP (OTC)', 90, 'currencies', '🇵🇭'],
  ['USDPKR', 'USD/PKR (OTC)', 91, 'currencies', '🇵🇰'],
  ['USDBDT', 'USD/BDT (OTC)', 91, 'currencies', '🇧🇩'],
  ['USDARS', 'USD/ARS (OTC)', 90, 'currencies', '🇦🇷'],
  ['USDCOP', 'USD/COP (OTC)', 90, 'currencies', '🇨🇴'],
  ['USDCLP', 'USD/CLP (OTC)', 90, 'currencies', '🇨🇱'],
  ['USDEGP', 'USD/EGP (OTC)', 90, 'currencies', '🇪🇬'],
  ['USDIDR', 'USD/IDR (OTC)', 90, 'currencies', '🇮🇩'],
  ['USDMYR', 'USD/MYR (OTC)', 90, 'currencies', '🇲🇾'],
  ['USDNGN', 'USD/NGN (OTC)', 90, 'currencies', '🇳🇬'],
  ['USDTHB', 'USD/THB (OTC)', 90, 'currencies', '🇹🇭'],
  ['USDVND', 'USD/VND (OTC)', 90, 'currencies', '🇻🇳'],

  // Ações OTC (do dicionário oficial Pocket Option)
  ['AAPL', 'Apple (OTC)', 92, 'actions', '🍏'],
  ['MSFT', 'Microsoft (OTC)', 92, 'actions', '💻'],
  ['NVDA', 'NVIDIA (OTC)', 92, 'actions', '🟢'],
  ['TSLA', 'Tesla (OTC)', 92, 'actions', '🚗'],
  ['AMZN', 'Amazon (OTC)', 92, 'actions', '📦'],
  ['META', 'Meta (OTC)', 92, 'actions', '📱'],
  ['GOOG', 'Alphabet (OTC)', 92, 'actions', '🔍'],
  ['NFLX', 'Netflix (OTC)', 92, 'actions', '🎬'],
  ['AMD', 'Advanced Micro Devices (OTC)', 92, 'actions', '🔲'],
  ['INTC', 'Intel (OTC)', 91, 'actions', '💾'],
  ['COIN', 'Coinbase Global (OTC)', 92, 'actions', '🪙'],
  ['BABA', 'Alibaba (OTC)', 91, 'actions', '🛍️'],
  ['MCD', "McDonald's (OTC)", 92, 'actions', '🍔'],
  ['BA', 'Boeing Company (OTC)', 91, 'actions', '✈️'],
  ['DIS', 'Walt Disney (OTC)', 90, 'actions', '🏰'],
  ['KO', 'Coca-Cola (OTC)', 91, 'actions', '🥤'],
  ['PEP', 'PepsiCo (OTC)', 90, 'actions', '🥤'],
  ['NKE', 'Nike (OTC)', 90, 'actions', '👟'],
  ['PYPL', 'PayPal (OTC)', 91, 'actions', '💳'],
  ['UBER', 'Uber (OTC)', 91, 'actions', '🚕'],
  ['ABNB', 'Airbnb (OTC)', 90, 'actions', '🏠'],
  ['PLTR', 'Palantir Technologies (OTC)', 92, 'actions', '🛰️'],
  ['SMCI', 'Super Micro Computer (OTC)', 91, 'actions', '🖥️'],
  ['AVGO', 'Broadcom (OTC)', 91, 'actions', '📡'],
  ['CRM', 'Salesforce (OTC)', 90, 'actions', '☁️'],
  ['CSCO', 'Cisco (OTC)', 90, 'actions', '🌐'],
  ['ORCL', 'Oracle (OTC)', 91, 'actions', '🗄️'],
  ['IBM', 'IBM (OTC)', 90, 'actions', '💻'],
  ['QCOM', 'Qualcomm (OTC)', 90, 'actions', '📶'],
  ['SONY', 'Sony (OTC)', 90, 'actions', '🎮'],
  ['SHOP', 'Shopify (OTC)', 90, 'actions', '🛒'],
  ['SNAP', 'Snap Inc. (OTC)', 89, 'actions', '👻'],
  ['ROKU', 'Roku (OTC)', 89, 'actions', '📺'],
  ['LYFT', 'Lyft (OTC)', 89, 'actions', '🚗'],
  ['DASH', 'DoorDash (OTC)', 90, 'actions', '🍔'],
  ['RDDT', 'Reddit (OTC)', 90, 'actions', '👽'],
  ['GME', 'GameStop (OTC)', 91, 'actions', '🕹️'],
  ['AMC', 'AMC Entertainment (OTC)', 90, 'actions', '🍿'],
  ['DJT', 'Trump Media & Technology Group (OTC)', 91, 'actions', '🦅'],
  ['NU', 'NUBank (OTC)', 92, 'actions', '🟣'],
  ['PBR', 'Petrobras (OTC)', 91, 'actions', '🛢️'],
  ['VALE', 'Vale S.A. (OTC)', 90, 'actions', '⛏️'],
  ['BBD', 'Bradesco S.A (OTC)', 90, 'actions', '🏦'],
  ['MELI', 'MercadoLibre (OTC)', 91, 'actions', '🤝'],
  ['JPM', 'JPMorgan Chase & Co (OTC)', 91, 'actions', '🏦'],
  ['BOA', 'Bank of America (OTC)', 91, 'actions', '🏦'],
  ['CITI', 'Citigroup (OTC)', 90, 'actions', '🏦'],
  ['GS', 'Goldman Sachs (OTC)', 91, 'actions', '🏦'],
  ['MS', 'Morgan Stanley (OTC)', 90, 'actions', '🏦'],
  ['WFC', 'Wells Fargo (OTC)', 90, 'actions', '🏦'],
  ['V', 'VISA (OTC)', 91, 'actions', '💳'],
  ['MA', 'Mastercard (OTC)', 91, 'actions', '💳'],
  ['AXP', 'American Express (OTC)', 90, 'actions', '💳'],
  ['BLK', 'BlackRock (OTC)', 90, 'actions', '🏛️'],
  ['XOM', 'ExxonMobil (OTC)', 91, 'actions', '⛽'],
  ['CVX', 'Chevron (OTC)', 90, 'actions', '⛽'],
  ['COP', 'ConocoPhillips (OTC)', 90, 'actions', '🛢️'],
  ['OXY', 'Occidental Petroleum (OTC)', 90, 'actions', '🛢️'],
  ['SLB', 'Schlumberger (OTC)', 89, 'actions', '🛢️'],
  ['PFE', 'Pfizer (OTC)', 91, 'actions', '💊'],
  ['JNJ', 'Johnson & Johnson (OTC)', 91, 'actions', '🩹'],
  ['MRNA', 'Moderna (OTC)', 91, 'actions', '🧬'],
  ['LLY', 'Eli Lilly (OTC)', 91, 'actions', '💊'],
  ['ABBV', 'AbbVie (OTC)', 90, 'actions', '💊'],
  ['AZN', 'AstraZeneca (OTC)', 90, 'actions', '💊'],
  ['NVO', 'Novo Nordisk (OTC)', 91, 'actions', '💊'],
  ['UNH', 'UnitedHealth Group (OTC)', 90, 'actions', '🏥'],
  ['WMT', 'Walmart (OTC)', 91, 'actions', '🏬'],
  ['COST', 'Costco (OTC)', 91, 'actions', '🛒'],
  ['HD', 'Home Depot (OTC)', 90, 'actions', '🔨'],
  ['TGT', 'Target (OTC)', 89, 'actions', '🎯'],
  ['SBUX', 'Starbucks (OTC)', 90, 'actions', '☕'],
  ['PG', 'Procter & Gamble (OTC)', 90, 'actions', '🧼'],
  ['CAT', 'Caterpillar (OTC)', 90, 'actions', '🚜'],
  ['DE', 'John Deere (OTC)', 89, 'actions', '🚜'],
  ['FDX', 'FedEx (OTC)', 90, 'actions', '📦'],
  ['UPS', 'United Parcel Service (OTC)', 89, 'actions', '📦'],
  ['LMT', 'Lockheed Martin (OTC)', 90, 'actions', '🚀'],
  ['RTX', 'Raytheon Technologies (OTC)', 90, 'actions', '🛰️'],
  ['GE', 'GE Aerospace (OTC)', 90, 'actions', '✈️'],
  ['GM', 'General Motors (OTC)', 90, 'actions', '🚗'],
  ['F', 'Ford Motor (OTC)', 90, 'actions', '🚙'],
  ['TM', 'Toyota Motor (OTC)', 90, 'actions', '🚗'],
  ['BMW', 'BMW (OTC)', 90, 'actions', '🏎️'],
  ['RACE', 'Ferrari (OTC)', 91, 'actions', '🏎️'],
  ['RIVN', 'Rivian Automotive (OTC)', 90, 'actions', '🚙'],
  ['LCID', 'Lucid Group (OTC)', 90, 'actions', '🚗'],
  ['NIO', 'NIO Inc. (OTC)', 90, 'actions', '🔋'],
  ['BYDDY', 'BYD Company (OTC)', 90, 'actions', '🔋'],
  ['BIDU', 'Baidu (OTC)', 90, 'actions', '🔍'],
  ['JD', 'JD.com Inc (OTC)', 90, 'actions', '📦'],
  ['TSM', 'Taiwan Semiconductor (OTC)', 91, 'actions', '🔬'],
  ['ASML', 'ASML Holding (OTC)', 91, 'actions', '🔬'],
  ['ARM', 'Arm Holdings (OTC)', 91, 'actions', '📱'],
  ['MU', 'Micron Technology (OTC)', 91, 'actions', '💾'],
  ['SNOW', 'Snowflake (OTC)', 90, 'actions', '❄️'],
  ['PANW', 'Palo Alto Networks (OTC)', 90, 'actions', '🛡️'],
  ['CRWD', 'CrowdStrike (OTC)', 91, 'actions', '🛡️'],
  ['NOW', 'ServiceNow (OTC)', 90, 'actions', '⚙️'],
  ['ADBE', 'Adobe (OTC)', 90, 'actions', '🎨'],
  ['SPOT', 'Spotify (OTC)', 90, 'actions', '🎵'],
  ['ZM', 'Zoom Video (OTC)', 89, 'actions', '📹'],
  ['SQ', 'Block, Inc. (OTC)', 90, 'actions', '🟩'],
  ['W', 'Wayfair Inc. (OTC)', 89, 'actions', '🛋️'],
  ['CX', 'Cemex, S.A.B. de C.V. (OTC)', 88, 'actions', '🏗️'],
  ['EC', 'Ecopetrol S.A. (OTC)', 88, 'actions', '🛢️'],
  ['ET', 'Energy Transfer LP (OTC)', 88, 'actions', '⚡'],
  ['QS', 'Quantumscape Corp (OTC)', 89, 'actions', '🔋'],
  ['SU', 'Suncor Energy Inc. (OTC)', 88, 'actions', '🛢️'],
  ['TV', 'Grupo Televisa S.A (OTC)', 88, 'actions', '📺'],
  ['ABB', 'ABB (OTC)', 89, 'actions', '⚙️'],
  ['ACB', 'Aurora Cannabis (OTC)', 89, 'actions', '🌿'],
  ['AIG', 'AIG (OTC)', 89, 'actions', '🛡️'],
  ['AMX', 'America Movil (OTC)', 89, 'actions', '📡'],
  ['BCH', 'Banco de Chile (OTC)', 88, 'actions', '🏦'],
  ['BKR', 'Baker Hughes Company (OTC)', 89, 'actions', '🛢️'],
  ['BMA', 'Banco Macro (OTC)', 88, 'actions', '🏦'],
  ['BUD', 'Anheuser-Busch Inbev (OTC)', 89, 'actions', '🍺'],
  ['CAN', 'Canaan Inc. (OTC)', 89, 'actions', '⛏️'],
  ['CGC', 'Canopy Growth (OTC)', 89, 'actions', '🌿'],
  ['DBX', 'Dropbox, Inc. (OTC)', 89, 'actions', '📁'],
  ['DPZ', "Domino's Pizza Inc (OTC)", 89, 'actions', '🍕'],
  ['FIG', 'Figma Inc (OTC)', 90, 'actions', '🎨'],
  ['GEV', 'GE Vernova Inc (OTC)', 90, 'actions', '⚡'],
  ['HDB', 'HDFC Bank Ltd (OTC)', 89, 'actions', '🏦'],
  ['IBN', 'ICICI Bank Ltd (OTC)', 89, 'actions', '🏦'],
  ['JKS', 'JinkoSolar Holding (OTC)', 88, 'actions', '☀️'],
  ['KDP', 'Keurig Dr Pepper (OTC)', 89, 'actions', '🥤'],
  ['LHX', 'L3Harris Technologies (OTC)', 89, 'actions', '🛰️'],
  ['MGM', 'MGM Resorts (OTC)', 89, 'actions', '🎰'],
  ['MNSO', 'MINISO Group (OTC)', 89, 'actions', '🛍️'],
  ['NEM', 'Newmont Corporation (OTC)', 90, 'actions', '🥇'],
  ['NOK', 'Nokia (OTC)', 89, 'actions', '📱'],
  ['OKLO', 'Oklo Inc (OTC)', 90, 'actions', '⚛️'],
  ['PATH', 'UiPath Inc. (OTC)', 89, 'actions', '🤖'],
  ['RBLX', 'Roblox Corp (OTC)', 90, 'actions', '🎮'],
  ['RKLB', 'Rocket Lab Corp (OTC)', 90, 'actions', '🚀'],
  ['RKT', 'Rocket Companies (OTC)', 89, 'actions', '🏠'],
  ['SE', 'Sea Limited (OTC)', 90, 'actions', '🌊'],
  ['SIRI', 'Sirius XM (OTC)', 89, 'actions', '📻'],
  ['SOFI', 'SoFi Technologies (OTC)', 90, 'actions', '💳'],
  ['SOUN', 'SoundHound AI (OTC)', 90, 'actions', '🎙️'],
  ['TEAM', 'Atlassian Corp (OTC)', 90, 'actions', '🛠️'],
  ['TLRY', 'Tilray Brands (OTC)', 89, 'actions', '🌿'],
  ['TME', 'Tencent Music (OTC)', 89, 'actions', '🎵'],
  ['TMUS', 'T-Mobile US (OTC)', 90, 'actions', '📱'],
  ['TRIP', 'TripAdvisor (OTC)', 89, 'actions', '✈️'],
  ['TTWO', 'Take-Two Interactive (OTC)', 90, 'actions', '🎮'],
  ['TWLO', 'Twilio Inc. (OTC)', 89, 'actions', '💬'],
  ['U', 'Unity Software (OTC)', 89, 'actions', '🕹️'],
  ['UAL', 'United Airlines (OTC)', 89, 'actions', '✈️'],
  ['VZ', 'Verizon Communications (OTC)', 90, 'actions', '📡'],
  ['WBD', 'Warner Bros Discovery (OTC)', 89, 'actions', '🎬'],
  ['WOLF', 'Wolfspeed Inc (OTC)', 89, 'actions', '⚡'],
  ['Z', 'Zillow Group (OTC)', 89, 'actions', '🏡'],
  ['ZK', 'ZEEKR Intelligent Tech (OTC)', 89, 'actions', '🚗'],
  ['ZTO', 'ZTO Express (OTC)', 88, 'actions', '🚚'],

  // Commodities OTC
  ['XAUUSD', 'Gold (Ouro) OTC', 92, 'commodities', '🥇'],
  ['XAGUSD', 'Silver (Prata) OTC', 91, 'commodities', '🥈'],
  ['UKOIL', 'Brent Oil OTC', 90, 'commodities', '🛢️'],
  ['USOIL', 'WTI Crude Oil OTC', 90, 'commodities', '🛢️'],
  ['XNGUSD', 'Natural Gas (OTC)', 90, 'commodities', '🔥'],
  ['XPTUSD', 'Platinum spot (OTC)', 89, 'commodities', '⚪'],
  ['XPDUSD', 'Palladium spot (OTC)', 89, 'commodities', '⚪'],
  ['C1', 'Milho (OTC)', 89, 'commodities', '🌽'],
  ['O1', 'Aveia (OTC)', 88, 'commodities', '🌾'],
  ['S1', 'Soja (OTC)', 89, 'commodities', '🌱'],
  ['W1', 'Trigo (OTC)', 89, 'commodities', '🌾'],
  ['DL1', 'Etanol (OTC)', 88, 'commodities', '🧪'],
  ['FC1', 'Boi Magro (OTC)', 88, 'commodities', '🐄'],
  ['LC1', 'Boi Gordo (OTC)', 88, 'commodities', '🐂'],
  ['LH1', 'Porco Magro (OTC)', 88, 'commodities', '🐖'],
  ['HG1', 'Cobre (OTC)', 89, 'commodities', '🥉'],
  ['HO1', 'Óleo Combustível (OTC)', 88, 'commodities', '🛢️'],
  ['NG1', 'Gás Natural (OTC)', 89, 'commodities', '🔥'],
  ['OJ1', 'Suco de Laranja (OTC)', 88, 'commodities', '🍊'],
  ['RB1', 'Gasolina (OTC)', 88, 'commodities', '⛽'],
  ['CC1', 'Cacau (OTC)', 89, 'commodities', '🍫'],
  ['CT1', 'Algodão (OTC)', 88, 'commodities', '☁️'],
  ['KC1', 'Café (OTC)', 89, 'commodities', '☕'],
  ['LB1', 'Madeira (OTC)', 88, 'commodities', '🪵'],
  ['SB1', 'Açúcar (OTC)', 89, 'commodities', '🍬'],

  // Índices & ETFs OTC
  ['SP500', 'SP500 (OTC)', 92, 'indices', '📊'],
  ['US100', 'US100 (OTC)', 92, 'indices', '📊'],
  ['DJI30', 'DJI30 (OTC)', 91, 'indices', '📊'],
  ['D30EUR', 'D30EUR (OTC)', 91, 'indices', '🇩🇪'],
  ['E35EUR', 'E35EUR (OTC)', 90, 'indices', '🇪🇸'],
  ['E50EUR', 'E50EUR (OTC)', 91, 'indices', '🇪🇺'],
  ['F40EUR', 'F40EUR (OTC)', 90, 'indices', '🇫🇷'],
  ['100GBP', '100GBP (OTC)', 90, 'indices', '🇬🇧'],
  ['JPN225', 'JPN225 (OTC)', 90, 'indices', '🇯🇵'],
  ['AUS200', 'AUS 200 (OTC)', 90, 'indices', '🇦🇺'],
  ['H33HKD', 'H33HKD (OTC)', 90, 'indices', '🇭🇰'],
  ['SMI20', 'SMI 20 (OTC)', 89, 'indices', '🇨🇭'],
  ['AEX25', 'AEX 25 (OTC)', 89, 'indices', '🇳🇱'],
  ['VIX', 'VIX (OTC)', 90, 'indices', '📈'],
  ['DXY', 'Dollar Index (OTC)', 90, 'indices', '💵'],
  ['EXY', 'Euro Index (OTC)', 89, 'indices', '💶'],
  ['BXY', 'Pound Index (OTC)', 89, 'indices', '💷'],
  ['JXY', 'Yen Index (OTC)', 89, 'indices', '💴'],
  ['MAGNIFICENT7', 'Magnificent 7 (OTC)', 92, 'indices', '🏆'],
  ['SPY', 'SPDR S&P 500 ETF Trust (OTC)', 91, 'indices', '📊'],
  ['QQQ', 'Invesco QQQ Trust (OTC)', 91, 'indices', '📊'],
  ['DIA', 'Dow Jones Industrial Average ETF (OTC)', 90, 'indices', '📊'],
  ['IWM', 'iShares Russell 2000 ETF (OTC)', 90, 'indices', '📊'],
  ['NVDAAMD', 'Nvidia/AMD (OTC)', 92, 'indices', '⚡'],
  ['GOOGMSFT', 'Google/Microsoft (OTC)', 91, 'indices', '⚡'],
  ['METAGOOG', 'Meta/Alphabet (OTC)', 91, 'indices', '⚡'],
  ['NFLXAMZN', 'Netflix/Amazon (OTC)', 91, 'indices', '⚡'],
  ['TSLAF', 'Tesla/Ford (OTC)', 91, 'indices', '⚡'],
  ['AMZNALIBABA', 'Amazon/Alibaba (OTC)', 91, 'indices', '⚡'],
  ['MSFTAPL', 'Microsoft/Apple (OTC)', 91, 'indices', '⚡'],
  ['VISAMA', 'VISA/MasterCard (OTC)', 90, 'indices', '⚡'],
  ['GLDSLV', 'Gold/Silver (OTC)', 91, 'indices', '⚖️'],
  ['XAUXTI', 'Gold/Oil (OTC)', 90, 'indices', '⚖️'],

  // Criptomoedas OTC
  ['BTCUSD', 'Bitcoin (OTC)', 92, 'crypto', '₿'],
  ['ETHUSD', 'Ethereum (OTC)', 92, 'crypto', '💎'],
  ['SOLUSD', 'Solana (OTC)', 92, 'crypto', '🟣'],
  ['BNBUSD', 'BNB (OTC)', 91, 'crypto', '🟡'],
  ['XRPUSD', 'Ripple (OTC)', 91, 'crypto', '💧'],
  ['DOGEUSD', 'Dogecoin (OTC)', 91, 'crypto', '🐕'],
  ['ADAUSD', 'Cardano (OTC)', 90, 'crypto', '🔵'],
  ['AVAX', 'Avalanche (OTC)', 90, 'crypto', '🔺'],
  ['DOTUSD', 'Polkadot (OTC)', 90, 'crypto', '⚫'],
  ['LINK', 'Chainlink (OTC)', 90, 'crypto', '🔗'],
  ['LTCUSD', 'Litecoin (OTC)', 90, 'crypto', '🥈'],
  ['MATIC', 'Polygon (OTC)', 90, 'crypto', '🟣'],
  ['TON', 'Toncoin (OTC)', 90, 'crypto', '💎'],
  ['TRX', 'TRON (OTC)', 90, 'crypto', '🔴'],
  ['SHIB', 'Shiba Inu (OTC)', 90, 'crypto', '🐕'],
  ['PEPE', 'Pepe (OTC)', 90, 'crypto', '🐸'],
  ['BONK', 'Bonk (OTC)', 89, 'crypto', '🐕'],
  ['FLOKI', 'Floki (OTC)', 89, 'crypto', '⚔️'],
  ['WIF', 'Dogwifhat (OTC)', 89, 'crypto', '🎩'],
  ['TRUMP', 'Official Trump (OTC)', 91, 'crypto', '🦅'],
  ['BTCETH', 'Bitcoin/Ethereum (OTC)', 91, 'crypto', '₿'],
];

export const SCANNER_ASSETS: BrokerAssetItem[] = RAW_SCANNER_OTC_TUPLES.map(
  ([ticker, name, payout, type, iconText]) => ({
    ticker,
    name,
    BlitzPayout: payout,
    BinaryPayout: payout,
    type,
    iconBg: 'bg-purple-500/20 text-purple-200 border-purple-500/40',
    iconText,
    fav: true,
  })
);

type GaugeMode = 'PARADO' | 'ANALISANDO' | 'COMPRA' | 'VENDA';

export const OrionOracleHud: React.FC<OrionOracleHudProps> = ({
  onExecuteTrade,
  onAssetChange,
  chartCandleTrend,
  initialMeta = 14322.63,
}) => {
  // Starts STOPPED by default (like 04:11 in video: VALOR, META, DEMO/REAL, INICIAR, PARADO)
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [accountMode, setAccountMode] = useState<'DEMO' | 'REAL'>('DEMO');
  const [entryAmountInput, setEntryAmountInput] = useState<string>('2000');
  const [targetMetaInput, setTargetMetaInput] = useState<string>(String(initialMeta));

  const [sessionClockSec, setSessionClockSec] = useState<number>(3598); // 59:58
  const [wins, setWins] = useState<number>(0);
  const [losses, setLosses] = useState<number>(0);
  const [currentProfit, setCurrentProfit] = useState<number>(0.0);

  const [phase, setPhase] = useState<'ANALYZING' | 'SEARCHING' | 'TRADING'>('ANALYZING');
  const [analysisCountdown, setAnalysisCountdown] = useState<number>(9);
  const [gaugeMode, setGaugeMode] = useState<GaugeMode>('PARADO');
  const [confidence, setConfidence] = useState<number>(79);
  const [needleAngle, setNeedleAngle] = useState<number>(35);
  const [detectedPatternName, setDetectedPatternName] = useState<string>('Padrão Suporte / Fluxo');

  const [showSearchModal, setShowSearchModal] = useState<boolean>(false);
  const [searchTypedQuery, setSearchTypedQuery] = useState<string>('');
  const [currentAssetIndex, setCurrentAssetIndex] = useState<number>(0);
  const [activeCategory, setActiveCategory] = useState<'all' | 'currencies' | 'actions' | 'commodities' | 'indices' | 'crypto'>('all');

  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [tradeLog, setTradeLog] = useState<
    Array<{ id: string; time: string; asset: string; dir: 'COMPRA' | 'VENDA'; profit: number; win: boolean; pattern: string }>
  >([]);

  const currentAsset = SCANNER_ASSETS[currentAssetIndex];
  const chartTrendRef = useRef<'UP' | 'DOWN' | undefined>(chartCandleTrend);
  useEffect(() => {
    chartTrendRef.current = chartCandleTrend;
  }, [chartCandleTrend]);

  const parsedStake = Math.max(1, parseFloat(entryAmountInput.replace(',', '.')) || 2000);
  const parsedMeta = Math.max(1, parseFloat(targetMetaInput.replace(',', '.')) || 14322.63);

  const formatBRL = (val: number) => {
    return val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Query the real Supabase broker-signal endpoint from the user's V5.1 script + combine with 4 candle patterns
  const queryBrokerSignalAndCandles = async (ticker: string, nextIdx: number) => {
    let apiDir: 'COMPRA' | 'VENDA' | null = null;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1800);
      const res = await fetch(
        `${ORION_ASSETS_URLS.FN_URL}?action=current&ticker=${encodeURIComponent(ticker)}`,
        {
          headers: {
            Authorization: 'Bearer ' + ORION_ASSETS_URLS.SUPABASE_ANON,
            Apikey: ORION_ASSETS_URLS.SUPABASE_ANON,
          },
          signal: controller.signal,
        }
      );
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        const rawDir = data?.current?.direction || data?.direction;
        if (rawDir === 'buy') apiDir = 'COMPRA';
        else if (rawDir === 'sell') apiDir = 'VENDA';
      }
    } catch (_) {}

    let isBullish: boolean;
    if (chartTrendRef.current === 'UP') {
      isBullish = true;
    } else if (chartTrendRef.current === 'DOWN') {
      isBullish = false;
    } else if (apiDir) {
      isBullish = apiDir === 'COMPRA';
    } else {
      isBullish = nextIdx <= 2;
    }

    const realisticConfidences = [79, 87, 70, 65, 69, 76, 63, 71, 79, 73, 80, 72, 83];
    const chosenConf = realisticConfidences[nextIdx % realisticConfidences.length];

    const patternLabel = isBullish
      ? nextIdx % 2 === 0
        ? 'Padrão 1: Rejeição Suporte + Virada Verde'
        : 'Padrão 2: Escadinha 3 Velas Verdes (Touros)'
      : nextIdx % 2 === 0
      ? 'Padrão 3: Rejeição Topo + Engolfo de Baixa'
      : 'Padrão 4: Cascata de Queda + Pullback (Ursos)';

    return {
      dir: (isBullish ? 'COMPRA' : 'VENDA') as 'COMPRA' | 'VENDA',
      conf: chosenConf,
      patternLabel,
    };
  };

  // Session 59:58 clock countdown when running
  useEffect(() => {
    if (!isRunning) return;
    const timer = setInterval(() => {
      setSessionClockSec((prev) => (prev > 0 ? prev - 1 : 3599));
    }, 1000);
    return () => clearInterval(timer);
  }, [isRunning]);

  // Sweeping yellow needle animation while in ANALISANDO mode
  useEffect(() => {
    if (!isRunning || gaugeMode !== 'ANALISANDO') return;
    const needleInterval = setInterval(() => {
      setNeedleAngle((prev) => {
        const delta = (Math.random() - 0.48) * 28;
        return Math.max(-55, Math.min(65, prev + delta));
      });
    }, 260);
    return () => clearInterval(needleInterval);
  }, [isRunning, gaugeMode]);

  // Main state machine replicating the video's exact cycle
  useEffect(() => {
    if (!isRunning) {
      setGaugeMode('PARADO');
      setShowSearchModal(false);
      return;
    }

    if (wins > 0 && currentProfit >= parsedMeta) {
      setIsRunning(false);
      setGaugeMode('PARADO');
      setShowSearchModal(false);
      return;
    }

    if (phase === 'ANALYZING') {
      setGaugeMode('ANALISANDO');
      const countdownTimer = setInterval(() => {
        setAnalysisCountdown((prev) => {
          if (prev > 1) {
            return prev - 1;
          }
          clearInterval(countdownTimer);

          const nextIdx = (currentAssetIndex + 1) % SCANNER_ASSETS.length;
          const targetAsset = SCANNER_ASSETS[nextIdx];

          queryBrokerSignalAndCandles(targetAsset.ticker, nextIdx).then((sig) => {
            setConfidence(sig.conf);
            setDetectedPatternName(sig.patternLabel);
            setGaugeMode(sig.dir);

            // Open "Procurar" modal and type the asset ticker character by character
            setPhase('SEARCHING');
            setShowSearchModal(true);
            setSearchTypedQuery('');

            let charPos = 0;
            const tickerToType = targetAsset.ticker;
            const typeInt = setInterval(() => {
              charPos += 1;
              setSearchTypedQuery(tickerToType.slice(0, charPos));
              if (charPos >= tickerToType.length) {
                clearInterval(typeInt);
                setTimeout(() => {
                  setCurrentAssetIndex(nextIdx);
                  if (onAssetChange) onAssetChange(targetAsset.name);
                  setShowSearchModal(false);
                  setPhase('TRADING');
                }, 850);
              }
            }, 90);
          });

          return 0;
        });
      }, 1000);

      return () => clearInterval(countdownTimer);
    }

    if (phase === 'TRADING') {
      const activeDir = gaugeMode === 'VENDA' ? 'VENDA' : 'COMPRA';
      const activeAsset = SCANNER_ASSETS[currentAssetIndex];

      if (onExecuteTrade) {
        onExecuteTrade(
          activeDir === 'COMPRA' ? 'CALL' : 'PUT',
          activeAsset.name,
          parsedStake,
          5
        );
      }

      const tradeTimer = setTimeout(() => {
        const isWin = Math.random() > 0.16;
        const netProfit = isWin ? Number((parsedStake * 0.86).toFixed(2)) : -parsedStake;

        if (isWin) {
          setWins((w) => w + 1);
        } else {
          setLosses((l) => l + 1);
        }

        setCurrentProfit((prev) => {
          const nextProfit = Number((prev + netProfit).toFixed(2));
          if (nextProfit >= parsedMeta) {
            setIsRunning(false);
            setGaugeMode('PARADO');
          } else {
            setAnalysisCountdown(9);
            setPhase('ANALYZING');
            setGaugeMode('ANALISANDO');
          }
          return nextProfit;
        });

        setTradeLog((prev) => [
          {
            id: `tr_${Date.now()}`,
            time: new Date().toLocaleTimeString(),
            asset: activeAsset.name,
            dir: activeDir,
            profit: netProfit,
            win: isWin,
            pattern: detectedPatternName,
          },
          ...prev.slice(0, 24),
        ]);
      }, 5000);

      return () => clearTimeout(tradeTimer);
    }
  }, [isRunning, phase, currentAssetIndex, wins, currentProfit, parsedStake, parsedMeta]);

  const formattedSessionClock = `${Math.floor(sessionClockSec / 60)
    .toString()
    .padStart(2, '0')}:${(sessionClockSec % 60).toString().padStart(2, '0')}`;

  const formattedAnalysisCountdown = `00:${analysisCountdown.toString().padStart(2, '0')}`;

  const filteredModalAssets = SCANNER_ASSETS.filter((item) => {
    if (searchTypedQuery.trim().length > 0) {
      const q = searchTypedQuery.toUpperCase();
      return item.ticker.toUpperCase().includes(q) || item.name.toUpperCase().includes(q);
    }
    if (activeCategory === 'all') return true;
    return item.type === activeCategory;
  });

  // SVG Gauge math
  const radius = 76;
  const stroke = 9;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const arcLength = circumference * (240 / 360);
  const activePct =
    gaugeMode === 'PARADO' ? 0 : gaugeMode === 'ANALISANDO' ? 68 : confidence;
  const strokeDashoffset = arcLength - (activePct / 100) * arcLength;

  // TOUROS (COMPRA) = VERDE (#10b981) | URSOS (VENDA) = VERMELHO (#ef4444)
  const gaugeColor =
    gaugeMode === 'COMPRA'
      ? '#10b981'
      : gaugeMode === 'VENDA'
      ? '#ef4444'
      : gaugeMode === 'ANALISANDO'
      ? '#eab308'
      : '#64748b';

  return (
    <div className="relative w-full max-w-[460px] mx-auto font-sans select-none">
      {/* =====================================================================================
          MODAL "PROCURAR / ESCOLHA UM ATIVO"
         ===================================================================================== */}
      {showSearchModal && (
        <div className="mb-2.5 rounded-2xl bg-[#090514]/98 border border-purple-500/40 shadow-[0_18px_45px_rgba(0,0,0,0.95),0_0_24px_rgba(168,85,247,0.3)] p-4 text-white animate-fadeIn">
          <div className="flex items-center justify-between pb-3">
            <div className="flex items-center gap-2 text-sm font-bold text-purple-100">
              <span>← Procurar</span>
            </div>
            <button
              onClick={() => setShowSearchModal(false)}
              className="text-purple-300 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="relative flex items-center w-full rounded-xl bg-[#06040f] border-2 border-purple-500 px-3.5 py-2.5 mb-3 shadow-[0_0_15px_rgba(168,85,247,0.35)]">
            <Search className="w-4 h-4 text-purple-300 mr-2.5 shrink-0" />
            <span className="font-mono text-sm font-bold text-purple-100 tracking-wider">
              {searchTypedQuery}
            </span>
            <span className="w-0.5 h-4 bg-purple-400 ml-0.5 animate-pulse" />
          </div>

          {searchTypedQuery.length === 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2.5 scrollbar-none">
              <button
                onClick={() => setActiveCategory('all')}
                className="w-8 h-8 rounded-full bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-200"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setActiveCategory('currencies')}
                className="px-3.5 py-1 rounded-full text-xs font-semibold bg-purple-500/15 border border-purple-500/30 text-purple-100 whitespace-nowrap"
              >
                Pares de moedas
              </button>
              <button
                onClick={() => setActiveCategory('actions')}
                className="px-3.5 py-1 rounded-full text-xs font-semibold bg-purple-500/15 border border-purple-500/30 text-purple-100 whitespace-nowrap"
              >
                Ações
              </button>
              <button
                onClick={() => setActiveCategory('commodities')}
                className="px-3.5 py-1 rounded-full text-xs font-semibold bg-purple-500/15 border border-purple-500/30 text-purple-100 whitespace-nowrap"
              >
                Commodities
              </button>
              <button
                onClick={() => setActiveCategory('indices')}
                className="px-3.5 py-1 rounded-full text-xs font-semibold bg-purple-500/15 border border-purple-500/30 text-purple-100 whitespace-nowrap"
              >
                Índices
              </button>
              <button
                onClick={() => setActiveCategory('crypto')}
                className="px-3.5 py-1 rounded-full text-xs font-semibold bg-purple-500/15 border border-purple-500/30 text-purple-100 whitespace-nowrap"
              >
                Cripto
              </button>
            </div>
          )}

          <div className="space-y-1.5">
            <div className="text-xs font-bold text-purple-200 px-1">
              Ativos OTC ({filteredModalAssets.length})
            </div>
            <div className="flex items-center justify-between text-[11px] text-purple-300/70 px-1 pb-1 border-b border-purple-500/20">
              <span>Ativo</span>
              <span>Retorno</span>
            </div>
            <div className="max-h-36 overflow-y-auto space-y-1">
              {filteredModalAssets.slice(0, 40).map((item) => (
                <div
                  key={`blitz_${item.ticker}`}
                  onClick={() => {
                    const idx = SCANNER_ASSETS.findIndex((a) => a.ticker === item.ticker);
                    if (idx !== -1) {
                      setCurrentAssetIndex(idx);
                      if (onAssetChange) onAssetChange(item.name);
                      setShowSearchModal(false);
                    }
                  }}
                  className="flex items-center justify-between px-2.5 py-2 rounded-xl bg-purple-500/[0.06] hover:bg-purple-500/[0.16] border border-purple-500/20 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border ${item.iconBg}`}
                    >
                      {item.iconText}
                    </span>
                    <span className="text-xs font-bold text-white">{item.name}</span>
                    {item.isNew && (
                      <span className="px-1.5 py-0.2 rounded bg-purple-600 text-white text-[9px] font-black">
                        NOVO
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-purple-300">
                      +{item.BlitzPayout}%
                    </span>
                    <Star className="w-3.5 h-3.5 text-purple-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {searchTypedQuery.length > 0 && filteredModalAssets.length > 0 && (
            <div className="space-y-1.5 mt-3 pt-2 border-t border-purple-500/20">
              <div className="text-xs font-bold text-purple-200 px-1">Binárias OTC</div>
              <div className="flex items-center justify-between text-[11px] text-purple-300/70 px-1 pb-1">
                <span>Ativo</span>
                <span>Retorno</span>
              </div>
              {filteredModalAssets.slice(0, 1).map((item) => (
                <div
                  key={`bin_${item.ticker}`}
                  className="flex items-center justify-between px-2.5 py-2 rounded-xl bg-purple-500/[0.05]"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border ${item.iconBg}`}
                    >
                      {item.iconText}
                    </span>
                    <span className="text-xs font-bold text-white">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-purple-300">
                      +{item.BinaryPayout}%
                    </span>
                    <Star className="w-3.5 h-3.5 text-purple-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =====================================================================================
          PAINEL PRINCIPAL PRISMA IA v13 FINAL (VÍDEO MUNDO ROXO NEON + CONTADOR GANHO VERDE + LOGOS TOURO/URSO)
         ===================================================================================== */}
      <div className="relative w-full rounded-2xl bg-[#090514] border-2 border-purple-500/80 shadow-[0_20px_50px_rgba(0,0,0,0.95),0_0_32px_rgba(168,85,247,0.4)] overflow-hidden backdrop-blur-2xl">
        {/* Vídeo Oficial de Fundo com o Mundo em Roxo Neon */}
        <video
          src={ORION_ASSETS_URLS.DESKTOP_VIDEO}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-45 pointer-events-none"
          style={{ filter: 'hue-rotate(265deg) saturate(2.4) brightness(0.9)' }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 50% 35%, rgba(168,85,247,0.28), rgba(8,5,18,0.85))',
          }}
        />

        {/* BARRA DE FORÇA TOUROS (VERDE) vs URSOS (VERMELHO) COM OS LOGOS REAIS */}
        <div className="relative z-10 px-5 pt-3 pb-2 bg-[#080512]/80 border-b border-purple-500/20">
          <div className="flex items-center justify-between text-[10px] font-mono mb-1">
            <span className="text-emerald-400 font-extrabold flex items-center gap-1.5">
              <img
                src={ORION_ASSETS_URLS.BULL_ICON}
                alt="Touro"
                referrerPolicy="no-referrer"
                className="w-4 h-4 object-contain drop-shadow-[0_0_6px_rgba(16,185,129,0.9)]"
              />
              TOUROS: <strong>{gaugeMode === 'VENDA' ? '38%' : '62%'}</strong>
            </span>
            <span className="text-rose-400 font-extrabold flex items-center gap-1.5">
              <img
                src={ORION_ASSETS_URLS.BEAR_ICON}
                alt="Urso"
                referrerPolicy="no-referrer"
                className="w-4 h-4 object-contain drop-shadow-[0_0_6px_rgba(244,63,94,0.9)]"
              />
              URSOS: <strong>{gaugeMode === 'VENDA' ? '62%' : '38%'}</strong>
            </span>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden bg-[#1b1429] flex">
            <div
              className="h-full transition-all duration-500"
              style={{
                width: gaugeMode === 'VENDA' ? '38%' : '62%',
                background: 'linear-gradient(90deg, #059669, #10b981, #34d399)',
                boxShadow: '0 0 10px rgba(16,185,129,0.8)',
              }}
            />
            <div
              className="h-full bg-gradient-to-r from-rose-600 to-red-500 transition-all duration-500"
              style={{
                width: gaugeMode === 'VENDA' ? '62%' : '38%',
                boxShadow: '0 0 10px rgba(239,68,68,0.8)',
              }}
            />
          </div>
        </div>

        {/* TOP HEADER BAR: PRISMA IA (MESMO ESTILO DE FONTE DO ORION) + v13 FINAL | Clock + Desligar + Reset */}
        <div className="relative z-10 px-5 pt-3 pb-2.5 flex items-center justify-between border-b border-purple-500/20">
          <div className="flex items-center gap-2.5">
            <span className="text-[19px] font-black tracking-[0.18em] text-white drop-shadow-[0_0_14px_rgba(168,85,247,0.9)]">
              PRISMA IA
            </span>

            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-xs font-semibold text-purple-100">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse shadow-[0_0_8px_#a855f7]" />
              <Users className="w-3 h-3 text-purple-300" />
              <span className="font-mono text-[10px] font-bold text-purple-100">+22k</span>
            </div>
          </div>

          {isRunning ? (
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-sm font-bold text-purple-100 tracking-wider">
                {formattedSessionClock}
              </span>

              <button
                onClick={() => {
                  setIsRunning(false);
                  setGaugeMode('PARADO');
                  setShowSearchModal(false);
                }}
                className="px-3.5 py-1 rounded-full font-bold text-xs text-white bg-gradient-to-r from-red-600 via-rose-600 to-red-500 hover:from-red-500 hover:to-rose-500 shadow-lg shadow-red-600/30 cursor-pointer transition-all"
              >
                Desligar
              </button>

              <button
                onClick={() => setShowHistoryModal(true)}
                className="w-7 h-7 rounded-full bg-purple-500/15 hover:bg-purple-500/25 border border-purple-400/40 flex items-center justify-center text-purple-200 hover:text-white transition-colors cursor-pointer"
                title="Histórico / Reiniciar"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowSearchModal(!showSearchModal)}
              className="text-[11px] font-mono text-purple-100 hover:text-white flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-500/20 border border-purple-400/50 shadow-[0_0_10px_rgba(168,85,247,0.3)] cursor-pointer"
            >
              <img
                src={ORION_ASSETS_URLS.BTC_ICON}
                alt=""
                referrerPolicy="no-referrer"
                className="w-3.5 h-3.5 object-contain"
              />
              <span>{currentAsset.ticker}</span>
            </button>
          )}
        </div>

        {/* =====================================================================================
             BODY: TWO STATES (STOPPED CONFIG SCREEN vs RUNNING HUD)
            ===================================================================================== */}
        <div className="relative z-10 px-5 py-4 grid grid-cols-12 gap-4 items-center">
          {!isRunning ? (
            /* ------------------- TELA PARADO / CONFIGURAÇÃO (COM DETALHES EM ROXO NEON) ------------------- */
            <div className="col-span-7 space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-purple-300 mb-1">
                    VALOR (R$)
                  </label>
                  <input
                    type="text"
                    value={entryAmountInput}
                    onChange={(e) => setEntryAmountInput(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#0d071b]/90 border border-purple-500/50 text-purple-100 font-mono text-xs font-bold focus:outline-none focus:border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.2)]"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-purple-300 mb-1">
                    META (R$)
                  </label>
                  <input
                    type="text"
                    value={targetMetaInput}
                    onChange={(e) => setTargetMetaInput(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#0d071b]/90 border border-purple-500/50 text-purple-100 font-mono text-xs font-bold focus:outline-none focus:border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.2)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAccountMode('DEMO')}
                  className={`py-1.5 rounded-lg font-bold text-[11px] tracking-wider uppercase transition-all cursor-pointer border ${
                    accountMode === 'DEMO'
                      ? 'bg-purple-950/80 text-white border-purple-400/60 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                      : 'bg-[#090514]/80 text-slate-500 border-white/5 hover:text-purple-200'
                  }`}
                >
                  DEMO
                </button>
                <button
                  type="button"
                  onClick={() => setAccountMode('REAL')}
                  className={`py-1.5 rounded-lg font-bold text-[11px] tracking-wider uppercase transition-all cursor-pointer border ${
                    accountMode === 'REAL'
                      ? 'bg-purple-950/80 text-purple-300 border-purple-400/60 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                      : 'bg-[#090514]/80 text-slate-500 border-white/5 hover:text-purple-200'
                  }`}
                >
                  REAL
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (currentProfit >= parsedMeta) {
                    setWins(0);
                    setLosses(0);
                    setCurrentProfit(0);
                  }
                  setAnalysisCountdown(9);
                  setPhase('ANALYZING');
                  setGaugeMode('ANALISANDO');
                  setIsRunning(true);
                }}
                className="w-full py-2 rounded-lg font-black text-xs uppercase tracking-widest text-white bg-gradient-to-r from-purple-700 via-purple-600 to-fuchsia-600 hover:from-purple-600 hover:to-fuchsia-500 shadow-[0_0_22px_rgba(168,85,247,0.55)] cursor-pointer transition-all"
              >
                INICIAR
              </button>
            </div>
          ) : (
            /* ------------------- TELA EM OPERAÇÃO (CONTADOR DE GANHO PERMANECE VERDE!) ------------------- */
            <div className="col-span-7 space-y-2.5">
              <div className="flex items-center justify-between border-b border-purple-500/20 pb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">
                  ACERTO
                </span>
                {/* CONTADOR DE GANHO EM VERDE (#34d399) EXATAMENTE COMO PEDIDO */}
                <div className="font-mono text-lg font-black flex items-center gap-1.5">
                  <span className="text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.45)]">
                    {wins}
                  </span>
                  <span className="text-slate-500 text-xs font-normal">✕</span>
                  <span className="text-rose-500">{losses}</span>
                </div>
              </div>

              <div className="border-b border-purple-500/20 pb-1.5">
                <div className="flex items-center justify-between">
                  <div className="relative pb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-100">
                      PRÓXIMA
                    </span>
                    <div
                      className="absolute left-0 bottom-0 h-[2.5px] bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full transition-all duration-300"
                      style={{
                        width:
                          phase === 'ANALYZING'
                            ? `${Math.max(15, (analysisCountdown / 9) * 100)}%`
                            : '100%',
                      }}
                    />
                  </div>
                  <span className="font-mono text-xs text-purple-100 font-semibold">
                    {phase === 'ANALYZING' ? formattedAnalysisCountdown : 'Trade in progress'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between border-b border-purple-500/20 pb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">
                  RESULTADO
                </span>
                {/* LUCRO POSITIVO EM VERDE (#34d399) EXATAMENTE COMO PEDIDO */}
                <span
                  className={`font-mono text-xs font-extrabold ${
                    currentProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {currentProfit >= 0 ? '+' : '-'}R$ {formatBRL(Math.abs(currentProfit))}
                </span>
              </div>

              <div className="flex items-center justify-between pt-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">
                  META
                </span>
                <span className="font-mono text-[11px] text-purple-100 font-bold">
                  R$ {formatBRL(Math.max(0, currentProfit))} / R$ {formatBRL(parsedMeta)}
                </span>
              </div>
            </div>
          )}

          {/* =====================================================================================
              COLUNA DIREITA: VELOCÍMETRO COM LOGOS REAIS DO TOURO E DO URSO + ROXO NEON
             ===================================================================================== */}
          <div className="col-span-5 flex items-center justify-center">
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg
                className="w-full h-full transform -rotate-[210deg] overflow-visible"
                viewBox="0 0 160 160"
              >
                <circle
                  cx="80"
                  cy="80"
                  r={normalizedRadius + 7}
                  fill="none"
                  stroke="rgba(168, 85, 247, 0.2)"
                  strokeWidth="2"
                  strokeDasharray="2 5.5"
                />
                <circle
                  cx="80"
                  cy="80"
                  r={normalizedRadius}
                  fill="none"
                  stroke="rgba(168, 85, 247, 0.16)"
                  strokeWidth={stroke}
                  strokeDasharray={`${arcLength} ${circumference}`}
                  strokeLinecap="round"
                />
                <circle
                  cx="80"
                  cy="80"
                  r={normalizedRadius}
                  fill="none"
                  stroke={gaugeColor}
                  strokeWidth={stroke}
                  strokeDasharray={`${arcLength} ${circumference}`}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-500 ease-out"
                  style={{
                    filter: `drop-shadow(0 0 8px ${gaugeColor})`,
                  }}
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                {gaugeMode === 'ANALISANDO' ? (
                  <>
                    <img
                      src={ORION_ASSETS_URLS.BULL_ICON}
                      alt="Analisando"
                      referrerPolicy="no-referrer"
                      className="w-11 h-11 object-contain opacity-30 mb-1"
                      style={{ filter: 'hue-rotate(250deg) saturate(2)' }}
                    />
                    <div
                      className="absolute inset-0 flex items-center justify-center pointer-events-none transition-transform duration-300 ease-out"
                      style={{ transform: `rotate(${needleAngle}deg)` }}
                    >
                      <div className="w-1 h-14 bg-gradient-to-t from-transparent via-purple-400 to-fuchsia-300 rounded-full -translate-y-4 shadow-[0_0_10px_#a855f7]" />
                    </div>
                    <div className="w-3 h-3 rounded-full bg-purple-400 shadow-[0_0_10px_#a855f7] z-10" />
                    <span className="mt-5 text-[9px] font-black uppercase tracking-[0.18em] text-purple-300 drop-shadow-[0_0_6px_rgba(168,85,247,0.8)]">
                      ANALISANDO
                    </span>
                  </>
                ) : gaugeMode === 'PARADO' ? (
                  <>
                    <img
                      src={ORION_ASSETS_URLS.BULL_ICON}
                      alt="Parado"
                      referrerPolicy="no-referrer"
                      className="w-11 h-11 object-contain opacity-80"
                      style={{ filter: 'hue-rotate(250deg) saturate(1.8)' }}
                    />
                    <div className="font-mono text-xl font-black text-purple-300 tracking-widest mt-0.5">
                      --
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-purple-300/80 mt-0.5">
                      PARADO
                    </span>
                  </>
                ) : gaugeMode === 'VENDA' ? (
                  <>
                    <img
                      src={ORION_ASSETS_URLS.BEAR_ICON}
                      alt="Venda Urso"
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 object-contain drop-shadow-[0_0_10px_rgba(239,68,68,0.85)]"
                    />
                    <div className="font-mono text-2xl font-black text-rose-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.9)] leading-none mt-0.5">
                      {confidence}%
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-rose-400 mt-1">
                      🐻 VENDA
                    </span>
                  </>
                ) : (
                  <>
                    <img
                      src={ORION_ASSETS_URLS.BULL_ICON}
                      alt="Compra Touro"
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 object-contain drop-shadow-[0_0_12px_rgba(16,185,129,0.95)]"
                    />
                    <div className="font-mono text-2xl font-black text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.9)] leading-none mt-0.5">
                      {confidence}%
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-300 mt-1">
                      🐂 COMPRA
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM BRAND WATERMARK: PRISMA IA eloqua. */}
        <div className="relative z-10 px-5 py-2.5 border-t border-purple-500/20 bg-[#06040e]/95 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-sans font-black tracking-[0.16em] text-purple-200 text-sm">
              PRISMA IA
            </span>
            <span className="font-sans font-medium text-purple-400 text-xs tracking-tight lowercase">
              eloqua<span className="text-purple-400 text-[10px]">.</span>
            </span>
          </div>

          <span />
        </div>

        {/* HISTORY MODAL */}
        {showHistoryModal && (
          <div className="absolute inset-0 z-50 bg-[#090d14]/95 backdrop-blur-md p-4 flex flex-col justify-between animate-fadeIn">
            <div>
              <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-emerald-400" />
                  HISTÓRICO DE OPERAÇÕES
                </h4>
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="text-slate-400 hover:text-white text-xs px-2 py-0.5 rounded bg-white/5 cursor-pointer"
                >
                  Fechar
                </button>
              </div>

              <div className="mt-2.5 space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {tradeLog.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-500">
                    Nenhuma entrada realizada ainda.
                  </div>
                ) : (
                  tradeLog.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-white/[0.03] border border-white/[0.05] text-xs font-mono"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500">{item.time}</span>
                        <span className="font-bold text-white">{item.asset}</span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                            item.dir === 'COMPRA'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-rose-500/20 text-rose-300'
                          }`}
                        >
                          {item.dir}
                        </span>
                      </div>
                      <span className={item.win ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                        {item.win
                          ? `+R$ ${formatBRL(item.profit)}`
                          : `-R$ ${formatBRL(Math.abs(item.profit))}`}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
              <span>
                Placar: <strong className="text-white">{wins} x {losses}</strong>
              </span>
              <button
                onClick={() => {
                  setWins(0);
                  setLosses(0);
                  setCurrentProfit(0);
                  setTradeLog([]);
                }}
                className="text-xs text-emerald-400 hover:underline cursor-pointer font-bold"
              >
                Zerar Placar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
