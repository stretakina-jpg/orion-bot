import { AlpineActive, AlpineBalance } from '../types';

export class AlpineClient {
  private ws: WebSocket | null = null;
  public authed = false;
  private reqCounter = 1000;
  private listeners = new Set<(msg: any) => void>();
  private pending = new Map<string, (resp: any) => void>();
  public clientSessionId = '';

  async login(identifier: string, password: string): Promise<{ ssid?: string; message?: string; error?: string }> {
    const res = await fetch('https://ucycjlwmgdnayebmpfmf.supabase.co/functions/v1/alpine-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization:
          'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjeWNqbHdtZ2RuYXllYm1wZm1mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2OTE5NDgsImV4cCI6MjA4MjI2Nzk0OH0.ZO_zA0cZvnVIz9oSstMRW-bKi5iLSDg2UC02M8Olync',
      },
      body: JSON.stringify({ identifier, password }),
    });
    return await res.json();
  }

  connect(ssid: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket('wss://ws.alpineforex.com/echo/websocket');
      } catch (err) {
        return reject(err);
      }

      this.ws.onopen = () => {
        const payload = {
          name: 'authenticate',
          request_id: this.nextReqId(),
          local_time: Date.now(),
          msg: {
            ssid,
            protocol: 3,
            session_id: '',
            client_session_id: '',
          },
        };
        this.ws?.send(JSON.stringify(payload));
      };

      this.ws.onmessage = (event) => {
        let parsed: any;
        try {
          parsed = JSON.parse(event.data);
        } catch {
          return;
        }

        if (parsed.name === 'authenticated') {
          this.authed = parsed.msg === true;
          this.clientSessionId = parsed.client_session_id || '';
          if (this.authed) {
            resolve();
          } else {
            reject(new Error('Alpine authentication failed'));
          }
          return;
        }

        if (parsed.request_id && this.pending.has(parsed.request_id)) {
          const handler = this.pending.get(parsed.request_id);
          this.pending.delete(parsed.request_id);
          handler?.(parsed);
        }

        this.listeners.forEach((fn) => fn(parsed));
      };

      this.ws.onerror = () => {
        reject(new Error('WebSocket connection error'));
      };

      this.ws.onclose = () => {
        this.authed = false;
      };
    });
  }

  on(listener: (msg: any) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  disconnect() {
    if (this.ws) {
      try {
        this.ws.close();
      } catch {}
      this.ws = null;
    }
    this.authed = false;
    this.listeners.clear();
    this.pending.clear();
  }

  private nextReqId(): string {
    this.reqCounter += 1;
    return `${Date.now()}_${this.reqCounter}`;
  }

  send(name: string, version: string, body: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket not connected'));
        return;
      }
      const reqId = this.nextReqId();
      const packet = {
        name: 'sendMessage',
        request_id: reqId,
        local_time: Date.now(),
        msg: {
          name,
          version,
          body,
        },
      };

      const timeout = setTimeout(() => {
        this.pending.delete(reqId);
        reject(new Error(`Timeout waiting for ${name}`));
      }, 15000);

      this.pending.set(reqId, (resp) => {
        clearTimeout(timeout);
        resolve(resp);
      });

      this.ws.send(JSON.stringify(packet));
    });
  }

  async getBalances(): Promise<AlpineBalance[]> {
    const res = await this.send('internal-billing.get-balances', '1.0', {
      types_ids: [1, 4],
      tournaments_statuses_ids: [3, 2],
    });
    return Array.isArray(res?.msg) ? res.msg : [];
  }

  async getInitializationData(): Promise<any> {
    const res = await this.send('get-initialization-data', '4.0', []);
    return res?.msg;
  }

  subscribeCandles(activeId: number, size = 5) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    const packet = {
      name: 'subscribeMessage',
      request_id: this.nextReqId(),
      local_time: Date.now(),
      msg: {
        name: 'candle-generated',
        version: '1.0',
        params: {
          routingFilters: {
            active_id: activeId,
            size,
          },
        },
      },
    };
    this.ws.send(JSON.stringify(packet));
  }

  unsubscribeCandles(activeId: number, size = 5) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    const packet = {
      name: 'unsubscribeMessage',
      request_id: this.nextReqId(),
      local_time: Date.now(),
      msg: {
        name: 'candle-generated',
        version: '1.0',
        params: {
          routingFilters: {
            active_id: activeId,
            size,
          },
        },
      },
    };
    this.ws.send(JSON.stringify(packet));
  }

  async placeBlitz(params: {
    user_balance_id: number;
    active_id: number;
    direction: 'call' | 'put';
    expiration_size: number;
    price_cents: number;
    profit_percent: number;
  }): Promise<any> {
    const nowSec = Math.floor(Date.now() / 1000);
    return await this.send('binary-options.open-option', '2.0', {
      user_balance_id: params.user_balance_id,
      active_id: params.active_id,
      option_type_id: 12,
      direction: params.direction,
      expired: nowSec + params.expiration_size,
      refund_value: 0,
      price: params.price_cents,
      value: params.price_cents * (1 + params.profit_percent / 100),
      profit_percent: params.profit_percent,
      expiration_size: params.expiration_size,
    });
  }
}
