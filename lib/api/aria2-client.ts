/**
 * @fileoverview Aria2 RPC client for direct communication with Aria2 daemon.
 *
 * Provides JSON-RPC 2.0 interface to Aria2 server for adding downloads,
 * querying status, and managing tasks.
 *
 * Endpoints consumed:
 * - `POST /jsonrpc` — JSON-RPC 2.0 endpoint for all operations
 */

import { API_TIMEOUT_MS } from '@/shared/constants';

// ── Types ────────────────────────────────────────────────────

export interface Aria2Config {
  host: string;
  port: number;
  secret: string;
  secure: boolean;
  downloadDir: string;
}

export interface Aria2DownloadRequest {
  url: string;
  referer?: string;
  cookie?: string;
  filename?: string;
  dir?: string;
  proxy?: string;
  'user-agent'?: string;
  header?: string[];
  headers?: string;
}

export interface Aria2DownloadResponse {
  gid: string;
}

export interface Aria2GlobalStat {
  downloadSpeed: string;
  uploadSpeed: string;
  numActive: string;
  numWaiting: string;
  numStopped: string;
  numStoppedTotal: string;
}

export interface Aria2Version {
  version: string;
  enabledFeatures: string[];
}

interface JsonRpcRequest {
  jsonrpc: '2.0';
  id: string;
  method: string;
  params: (string | object)[];
}

interface JsonRpcResponse<T> {
  jsonrpc: '2.0';
  id: string;
  result?: T;
  error?: {
    code: number;
    message: string;
  };
}

// ── Client ───────────────────────────────────────────────────

export class Aria2Client {
  private config: Aria2Config;
  private requestId = 0;

  constructor(config: Aria2Config) {
    this.config = { ...config };
  }

  /** Current base URL derived from the configured host and port. */
  get baseUrl(): string {
    const protocol = this.config.secure ? 'https' : 'http';
    return `${protocol}://${this.config.host}:${this.config.port}`;
  }

  /** Update config at runtime (e.g. when user changes settings). */
  updateConfig(config: Aria2Config): void {
    this.config = { ...config };
  }

  /**
   * Build the secret token parameter for authenticated requests.
   * Returns empty string when no secret is configured.
   */
  private secretToken(): string {
    if (this.config.secret) {
      return `token:${this.config.secret}`;
    }
    return '';
  }

  /**
   * Generate a unique request ID.
   */
  private generateId(): string {
    return `aria2-${++this.requestId}-${Date.now()}`;
  }

  /**
   * Make a JSON-RPC call to Aria2 server.
   */
  private async rpcCall<T>(method: string, params: (string | object)[] = []): Promise<T> {
    const id = this.generateId();
    const token = this.secretToken();
    const rpcParams = token ? [token, ...params] : params;

    const request: JsonRpcRequest = {
      jsonrpc: '2.0',
      id,
      method: `aria2.${method}`,
      params: rpcParams,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

    try {
      const response = await fetch(`${this.baseUrl}/jsonrpc`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`RPC call failed: HTTP ${response.status}`);
      }

      const data: JsonRpcResponse<T> = await response.json();

      if (data.error) {
        throw new Error(`RPC error ${data.error.code}: ${data.error.message}`);
      }

      if (data.result === undefined) {
        throw new Error('RPC response missing result');
      }

      return data.result;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Get Aria2 version info.
   * @throws on network error or RPC error.
   */
  async getVersion(): Promise<Aria2Version> {
    return this.rpcCall<Aria2Version>('getVersion');
  }

  /**
   * Heartbeat check — tests connectivity and authentication.
   * @throws on network error or auth failure.
   */
  async ping(): Promise<Aria2Version> {
    return this.getVersion();
  }

  /**
   * Fetch global download statistics.
   * @throws on network error or RPC error.
   */
  async getGlobalStat(): Promise<Aria2GlobalStat> {
    return this.rpcCall<Aria2GlobalStat>('getGlobalStat');
  }

  /**
   * Add a new download by URL.
   * @throws on network error or RPC error.
   */
  async addUri(request: Aria2DownloadRequest): Promise<Aria2DownloadResponse> {
    const options: Record<string, string | string[]> = {};

    // Use request dir first, then fall back to config downloadDir
    const downloadDir = request.dir || this.config.downloadDir;
    if (downloadDir) {
      options.dir = downloadDir;
    }
    if (request.filename) {
      options.out = request.filename;
    }
    if (request.referer) {
      options.referer = request.referer;
    }
    if (request.cookie) {
      options.cookie = request.cookie;
    }
    if (request.proxy) {
      options['all-proxy'] = request.proxy;
    }
    if (request['user-agent']) {
      options['user-agent'] = request['user-agent'];
    }

    // Parse headers from string (newline-separated "Header-Name: value")
    const headers: string[] = [];
    if (request.header && request.header.length > 0) {
      headers.push(...request.header);
    }
    if (request.headers) {
      const parsedHeaders = request.headers
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0 && line.includes(':'));
      headers.push(...parsedHeaders);
    }
    if (headers.length > 0) {
      options.header = headers;
    }

    const gid = await this.rpcCall<string>('addUri', [[request.url], options]);
    return { gid };
  }

  /**
   * Pause all active downloads.
   * @throws on network error or RPC error.
   */
  async pauseAll(): Promise<string> {
    return this.rpcCall<string>('pauseAll');
  }

  /**
   * Unpause all paused downloads.
   * @throws on network error or RPC error.
   */
  async unpauseAll(): Promise<string> {
    return this.rpcCall<string>('unpauseAll');
  }

  /**
   * Non-throwing reachability check.
   * @returns `true` if the Aria2 server is running and responsive.
   */
  async isReachable(): Promise<boolean> {
    try {
      await this.ping();
      return true;
    } catch {
      return false;
    }
  }
}
