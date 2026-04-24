/**
 * @fileoverview Aria2 connection settings composable.
 *
 * Manages Aria2 RPC configuration form state and connection testing.
 * Provides reactive bindings for host, port, secret, secure, downloadDir
 * and handles test connection flow.
 */
import { ref, computed } from 'vue';
import type { Aria2Config } from '@/shared/types';
import { Aria2Client } from '@/lib/api';

export interface UseAria2Options {
  initialConfig: Aria2Config;
  onSave: (config: Aria2Config) => Promise<void>;
}

export interface Aria2TestResult {
  success: boolean;
  version?: string;
  error?: string;
}

export function useAria2(options: UseAria2Options) {
  const { initialConfig, onSave } = options;

  // Form state
  const enabled = ref(initialConfig.enabled);
  const host = ref(initialConfig.host);
  const port = ref(initialConfig.port);
  const secret = ref(initialConfig.secret);
  const secure = ref(initialConfig.secure);
  const downloadDir = ref(initialConfig.downloadDir);

  // Test state
  const testing = ref(false);
  const connected = ref(false);
  const version = ref<string | null>(null);
  const error = ref<string | null>(null);

  const hasChanges = computed(() => {
    return (
      enabled.value !== initialConfig.enabled ||
      host.value !== initialConfig.host ||
      port.value !== initialConfig.port ||
      secret.value !== initialConfig.secret ||
      secure.value !== initialConfig.secure ||
      downloadDir.value !== initialConfig.downloadDir
    );
  });

  const config = computed<Aria2Config>(() => ({
    enabled: enabled.value,
    host: host.value,
    port: port.value,
    secret: secret.value,
    secure: secure.value,
    downloadDir: downloadDir.value,
  }));

  async function testConnection(): Promise<Aria2TestResult> {
    testing.value = true;
    connected.value = false;
    version.value = null;
    error.value = null;

    try {
      const client = new Aria2Client({
        host: host.value,
        port: port.value,
        secret: secret.value,
        secure: secure.value,
        downloadDir: downloadDir.value,
      });

      const versionInfo = await client.getVersion();
      connected.value = true;
      version.value = versionInfo.version;
      testing.value = false;
      return { success: true, version: versionInfo.version };
    } catch (e) {
      connected.value = false;
      error.value = e instanceof Error ? e.message : String(e);
      testing.value = false;
      return { success: false, error: error.value };
    }
  }

  async function save(): Promise<void> {
    await onSave(config.value);
  }

  function reset(): void {
    enabled.value = initialConfig.enabled;
    host.value = initialConfig.host;
    port.value = initialConfig.port;
    secret.value = initialConfig.secret;
    secure.value = initialConfig.secure;
    downloadDir.value = initialConfig.downloadDir;
    connected.value = false;
    version.value = null;
    error.value = null;
  }

  return {
    // State
    enabled,
    host,
    port,
    secret,
    secure,
    downloadDir,
    testing,
    connected,
    version,
    error,
    hasChanges,
    config,
    // Actions
    testConnection,
    save,
    reset,
  };
}
