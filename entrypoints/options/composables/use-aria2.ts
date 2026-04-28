/**
 * @fileoverview Aria2 connection testing composable.
 *
 * Manages Aria2 RPC connection testing state only.
 * Form state is managed by the parent usePreferenceForm.
 */
import { ref } from 'vue';
import type { Aria2Config } from '@/shared/types';
import { Aria2Client } from '@/lib/api';

export interface Aria2TestResult {
  success: boolean;
  version?: string;
  error?: string;
}

export function useAria2() {
  // Test state only — form fields are bound to usePreferenceForm
  const testing = ref(false);
  const connected = ref(false);
  const version = ref<string | null>(null);
  const error = ref<string | null>(null);

  async function testConnection(config: Aria2Config): Promise<Aria2TestResult> {
    testing.value = true;
    connected.value = false;
    version.value = null;
    error.value = null;

    try {
      const client = new Aria2Client(config);
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

  function resetTestState(): void {
    connected.value = false;
    version.value = null;
    error.value = null;
  }

  return {
    testing,
    connected,
    version,
    error,
    testConnection,
    resetTestState,
  };
}
