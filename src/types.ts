export type Locale = 'pt' | 'en' | 'es';

export interface Broker {
  key: string;
  name: string;
  logo: string;
  freeAllowed?: boolean;
}

export interface UserAccount {
  id?: string;
  email: string;
  plan: 'ouro' | 'prata';
  created_at: string;
  last_seen_at?: string;
  realBalance?: number;
  demoBalance?: number;
}

export interface StorageFile {
  name: string;
  url: string;
  size?: number;
  createdAt?: string | null;
}

export interface BotTrade {
  id: string;
  ticker: string;
  direction: 'call' | 'put';
  entryPrice: number;
  exitPrice: number | null;
  amountCents: number;
  status: 'pending' | 'win' | 'loss' | 'doji';
  createdAt: number;
  expiresAt: number;
}

export interface AlpineBalance {
  id: number;
  type: number;
  amount: number;
  currency: string;
}

export interface AlpineActive {
  id: number;
  ticker: string;
  profit: number;
}
