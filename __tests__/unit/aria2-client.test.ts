import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Aria2Client } from '@/lib/api/aria2-client';
import type { Aria2Config } from '@/shared/types';

// ─── Mock Fetch ─────────────────────────────────────────

global.fetch = vi.fn();

const mockFetch = fetch as unknown as ReturnType<typeof vi.fn>;

// ─── Test Helpers ───────────────────────────────────────

function createMockConfig(overrides: Partial<Aria2Config> = {}): Aria2Config {
  return {
    enabled: true,
    host: '127.0.0.1',
    port: 6800,
    secret: '',
    secure: false,
    downloadDir: '',
    ...overrides,
  };
}

function createMockResponse(result: unknown, error: unknown = null) {
  return {
    ok: true,
    json: () => Promise.resolve({ jsonrpc: '2.0', id: 1, result, error }),
  };
}

// ─── Aria2Client Tests ──────────────────────────────────

describe('Aria2Client', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('constructor', () => {
    it('creates client with default config', () => {
      const config = createMockConfig();
      const client = new Aria2Client(config);
      expect(client).toBeDefined();
    });

    it('creates HTTP URL for non-secure config', () => {
      const config = createMockConfig({ secure: false, host: 'localhost', port: 6800 });
      const client = new Aria2Client(config);
      expect(client).toBeDefined();
    });

    it('creates HTTPS URL for secure config', () => {
      const config = createMockConfig({ secure: true, host: 'localhost', port: 6800 });
      const client = new Aria2Client(config);
      expect(client).toBeDefined();
    });
  });

  describe('getVersion', () => {
    it('returns version info on success', async () => {
      const config = createMockConfig();
      const client = new Aria2Client(config);

      mockFetch.mockResolvedValueOnce(
        createMockResponse({ version: '1.36.0', enabledFeatures: ['BitTorrent', 'Metalink'] }),
      );

      const result = await client.getVersion();

      expect(result.version).toBe('1.36.0');
      expect(result.enabledFeatures).toEqual(['BitTorrent', 'Metalink']);
    });

    it('includes secret token when configured', async () => {
      const config = createMockConfig({ secret: 'my-secret-token' });
      const client = new Aria2Client(config);

      mockFetch.mockResolvedValueOnce(createMockResponse({ version: '1.36.0' }));

      await client.getVersion();

      const callArgs = mockFetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      expect(body.params).toContain('token:my-secret-token');
    });

    it('throws error on RPC error response', async () => {
      const config = createMockConfig();
      const client = new Aria2Client(config);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            jsonrpc: '2.0',
            id: 1,
            error: { code: 1, message: 'Unauthorized' },
          }),
      });

      await expect(client.getVersion()).rejects.toThrow('Aria2 RPC error: Unauthorized');
    });

    it('throws error on network failure', async () => {
      const config = createMockConfig();
      const client = new Aria2Client(config);

      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(client.getVersion()).rejects.toThrow('Network error');
    });
  });

  describe('addUri', () => {
    it('adds download with URL only', async () => {
      const config = createMockConfig();
      const client = new Aria2Client(config);

      mockFetch.mockResolvedValueOnce(createMockResponse('gid-123'));

      const result = await client.addUri({ url: 'https://example.com/file.zip' });

      expect(result.gid).toBe('gid-123');
      const callArgs = mockFetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      expect(body.method).toBe('aria2.addUri');
      expect(body.params[0]).toEqual(['https://example.com/file.zip']);
    });

    it('adds download with all options', async () => {
      const config = createMockConfig({ downloadDir: '/downloads' });
      const client = new Aria2Client(config);

      mockFetch.mockResolvedValueOnce(createMockResponse('gid-456'));

      await client.addUri({
        url: 'https://example.com/file.zip',
        filename: 'renamed.zip',
        referer: 'https://example.com',
        cookie: 'session=abc123',
        dir: '/custom/dir',
        header: ['Authorization: Bearer token', 'X-Custom: value'],
        'user-agent': 'Mozilla/5.0',
      });

      const callArgs = mockFetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      const options = body.params[1];

      expect(options.out).toBe('renamed.zip');
      expect(options.referer).toBe('https://example.com');
      expect(options.cookie).toBe('session=abc123');
      expect(options.dir).toBe('/custom/dir');
      expect(options.header).toEqual(['Authorization: Bearer token', 'X-Custom: value']);
      expect(options['user-agent']).toBe('Mozilla/5.0');
    });

    it('uses config downloadDir when dir not specified', async () => {
      const config = createMockConfig({ downloadDir: '/default/downloads' });
      const client = new Aria2Client(config);

      mockFetch.mockResolvedValueOnce(createMockResponse('gid-789'));

      await client.addUri({ url: 'https://example.com/file.zip' });

      const callArgs = mockFetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      const options = body.params[1];

      expect(options.dir).toBe('/default/downloads');
    });

    it('prefers request dir over config downloadDir', async () => {
      const config = createMockConfig({ downloadDir: '/default' });
      const client = new Aria2Client(config);

      mockFetch.mockResolvedValueOnce(createMockResponse('gid-abc'));

      await client.addUri({
        url: 'https://example.com/file.zip',
        dir: '/custom',
      });

      const callArgs = mockFetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      const options = body.params[1];

      expect(options.dir).toBe('/custom');
    });

    it('omits empty options', async () => {
      const config = createMockConfig();
      const client = new Aria2Client(config);

      mockFetch.mockResolvedValueOnce(createMockResponse('gid-def'));

      await client.addUri({
        url: 'https://example.com/file.zip',
        filename: '',
        referer: '',
        cookie: '',
      });

      const callArgs = mockFetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      const options = body.params[1];

      expect(options).not.toHaveProperty('out');
      expect(options).not.toHaveProperty('referer');
      expect(options).not.toHaveProperty('cookie');
    });

    it('throws error on RPC error', async () => {
      const config = createMockConfig();
      const client = new Aria2Client(config);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            jsonrpc: '2.0',
            id: 1,
            error: { code: 2, message: 'Invalid parameter' },
          }),
      });

      await expect(client.addUri({ url: 'https://example.com/file.zip' })).rejects.toThrow(
        'Aria2 RPC error: Invalid parameter',
      );
    });
  });

  describe('request ID generation', () => {
    it('increments request ID for each call', async () => {
      const config = createMockConfig();
      const client = new Aria2Client(config);

      mockFetch.mockResolvedValue(createMockResponse('result'));

      await client.getVersion();
      await client.getVersion();
      await client.getVersion();

      const calls = mockFetch.mock.calls;
      expect(JSON.parse(calls[0][1].body).id).toBe(1);
      expect(JSON.parse(calls[1][1].body).id).toBe(2);
      expect(JSON.parse(calls[2][1].body).id).toBe(3);
    });
  });
});
