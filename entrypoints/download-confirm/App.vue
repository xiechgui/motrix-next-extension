<script lang="ts" setup>
/**
 * @fileoverview Download confirmation popup for Aria2 RPC downloads.
 *
 * Displays file metadata (name, size) and allows user to edit:
 * - Filename
 * - Download directory
 * - Proxy
 *
 * Communicates back to background script via chrome.runtime.sendMessage.
 */
import { ref, onMounted, computed } from 'vue';
import { NConfigProvider, NInput, NButton, NSpace, NCheckbox, NDivider } from 'naive-ui';
import { useTheme } from '@/shared/use-theme';
import { createI18n, useNaiveLocale } from '@/shared/i18n/engine';
import { DEFAULT_UI_PREFS } from '@/shared/constants';
import type { Aria2DownloadParams } from '@/shared/types';

const i18nCtx = createI18n();
const { t: i18n } = i18nCtx;
const { naiveLocale, naiveDateLocale } = useNaiveLocale(i18nCtx.effectiveLocale);

const colorSchemeId = ref(DEFAULT_UI_PREFS.colorScheme);
const { naiveTheme, themeOverrides } = useTheme(colorSchemeId);

// ─── State ─────────────────────────────────────────────────────────

const downloadInfo = ref<{
  url: string;
  filename: string;
  fileSize: number;
  referer: string;
  cookie: string;
  requestId: string;
} | null>(null);

const editedFilename = ref('');
const editedDir = ref('');
const saveDirAsDefault = ref(false);
const editedProxy = ref('');
const saveProxyAsDefault = ref(false);
const loading = ref(false);
const aria2Status = ref<{ connected: boolean; version: string } | null>(null);
const aria2Rpc = ref('default');
const showAdvanced = ref(false);

// Advanced options
const editedUrl = ref('');
const editedHeaders = ref('');

// History options for directory and proxy autocomplete
const dirHistory = ref<string[]>([]);
const proxyHistory = ref<string[]>([]);

// ─── Computed ───────────────────────────────────────────────────────

const sizeDisplay = computed(() => {
  if (!downloadInfo.value) return '';
  const bytes = downloadInfo.value.fileSize;
  if (bytes <= 0) return i18n('confirm_unknown_size', 'Unknown size');
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(2)}${units[unitIndex]}`;
});

// ─── Actions ───────────────────────────────────────────────────────

function confirmDownload(): void {
  if (!downloadInfo.value) return;
  loading.value = true;

  // Save history
  if (editedDir.value) {
    saveToHistory('aria2_dir_history', editedDir.value);
  }
  if (editedProxy.value) {
    saveToHistory('aria2_proxy_history', editedProxy.value);
  }

  // Save defaults if checkbox is checked
  const defaultsToSave: Record<string, string> = {};
  if (saveDirAsDefault.value && editedDir.value) {
    defaultsToSave.aria2_default_dir = editedDir.value;
  }
  if (saveProxyAsDefault.value && editedProxy.value) {
    defaultsToSave.aria2_default_proxy = editedProxy.value;
  }
  if (Object.keys(defaultsToSave).length > 0) {
    void chrome.storage.local.set(defaultsToSave);
  }

  const params: Aria2DownloadParams = {
    requestId: downloadInfo.value.requestId,
    url: editedUrl.value || downloadInfo.value.url,
    filename: editedFilename.value || downloadInfo.value.filename,
    dir: editedDir.value || undefined,
    proxy: editedProxy.value || undefined,
    referer: downloadInfo.value.referer || undefined,
    cookie: downloadInfo.value.cookie || undefined,
    headers: editedHeaders.value || undefined,
  };

  chrome.runtime.sendMessage({ type: 'aria2-confirm-download', params }, () => {
    window.close();
  });
}

function cancelDownload(): void {
  if (!downloadInfo.value) return;

  chrome.runtime.sendMessage(
    { type: 'aria2-cancel-download', requestId: downloadInfo.value.requestId },
    () => {
      window.close();
    },
  );
}

async function checkAria2Status(): Promise<void> {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'aria2-get-status' });
    if (response && response.connected) {
      aria2Status.value = { connected: true, version: response.version || '' };
    } else {
      aria2Status.value = { connected: false, version: '' };
    }
  } catch {
    aria2Status.value = { connected: false, version: '' };
  }
}

function saveToHistory(key: string, value: string): void {
  try {
    void chrome.storage.local.get(key).then((result) => {
      const history: string[] = (result[key] as string[]) || [];
      const filtered = history.filter((v) => v !== value);
      filtered.unshift(value);
      const trimmed = filtered.slice(0, 5);
      void chrome.storage.local.set({ [key]: trimmed });
    });
  } catch {
    // Ignore storage errors
  }
}

function loadHistory(key: string): Promise<string[]> {
  return chrome.storage.local.get(key).then((result) => {
    return (result[key] as string[]) || [];
  });
}

// ─── Lifecycle ──────────────────────────────────────────────────────

onMounted(async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const data = urlParams.get('data');
  if (!data) {
    window.close();
    return;
  }

  try {
    const parsed = JSON.parse(decodeURIComponent(data));
    downloadInfo.value = parsed;
    editedFilename.value = parsed.filename || '';
    editedUrl.value = parsed.url || '';

    // Load saved defaults
    const defaults = await chrome.storage.local.get(['aria2_default_dir', 'aria2_default_proxy']);
    const savedDir = (defaults.aria2_default_dir as string) || '';
    const savedProxy = (defaults.aria2_default_proxy as string) || '';

    // Use saved defaults if no dir/proxy passed in params
    editedDir.value = parsed.dir || savedDir || '';
    editedProxy.value = parsed.proxy || savedProxy || '';
  } catch {
    window.close();
  }

  // Load history options
  dirHistory.value = await loadHistory('aria2_dir_history');
  proxyHistory.value = await loadHistory('aria2_proxy_history');

  // Set window title
  document.title = i18n('confirm_window_title', '发送到 Aria2');

  void checkAria2Status();
});
</script>

<template>
  <NConfigProvider
    :theme="naiveTheme"
    :theme-overrides="themeOverrides"
    :locale="naiveLocale"
    :date-locale="naiveDateLocale"
    inline-theme-disabled
  >
    <div class="confirm-root">
      <div v-if="downloadInfo" class="confirm-body">
        <!-- Form fields -->
        <div class="form-row">
          <label class="form-label">{{ i18n('confirm_filename_label', '文件名') }}:</label>
          <NInput v-model:value="editedFilename" :placeholder="downloadInfo.filename" clearable />
        </div>

        <div class="form-row">
          <label class="form-label">{{ i18n('confirm_dir_label', '下载路径') }}:</label>
          <NInput
            v-model:value="editedDir"
            :placeholder="i18n('confirm_dir_placeholder', '输入下载路径')"
            clearable
            :list="dirHistory"
            class="form-input"
          />
        </div>

        <div class="form-row form-row--save">
          <label class="form-label"></label>
          <NCheckbox v-model:checked="saveDirAsDefault" class="form-save-default">
            {{ i18n('confirm_save_as_default', '保存为默认值') }}
          </NCheckbox>
        </div>

        <div class="form-row">
          <label class="form-label">{{ i18n('confirm_proxy_label', '代理') }}:</label>
          <NInput
            v-model:value="editedProxy"
            :placeholder="i18n('confirm_proxy_placeholder', '输入代理地址')"
            clearable
            :list="proxyHistory"
            class="form-input"
          />
        </div>

        <div class="form-row form-row--save">
          <label class="form-label"></label>
          <NCheckbox v-model:checked="saveProxyAsDefault" class="form-save-default">
            {{ i18n('confirm_save_as_default', '保存为默认值') }}
          </NCheckbox>
        </div>

        <div class="form-row">
          <label class="form-label">{{ i18n('confirm_aria2_rpc_label', 'aria2 rpc') }}:</label>
          <NInput :value="aria2Rpc" disabled class="form-input--disabled" />
        </div>

        <div class="form-row">
          <label class="form-label">{{ i18n('confirm_aria2_info_label', 'aria2 状态') }}:</label>
          <div
            class="aria2-status"
            :class="
              aria2Status?.connected ? 'aria2-status--connected' : 'aria2-status--disconnected'
            "
          >
            <template v-if="aria2Status">
              {{
                aria2Status.connected
                  ? i18n('confirm_connected', '已连接') + ` [aria2 v${aria2Status.version}]`
                  : i18n('confirm_disconnected', '未连接')
              }}
            </template>
            <template v-else>{{ i18n('confirm_checking', '检查中...') }}</template>
          </div>
        </div>

        <div class="form-row">
          <label class="form-label">{{ i18n('confirm_size_label', '文件大小') }}:</label>
          <NInput :value="sizeDisplay" disabled class="form-input--disabled" />
        </div>

        <!-- Advanced section -->
        <div v-if="showAdvanced" class="advanced-section">
          <NDivider title-placement="left">
            {{ i18n('confirm_advanced', '高级选项') }}
          </NDivider>

          <div class="form-row form-row--vertical">
            <label class="form-label">{{ i18n('confirm_url_label', '下载链接') }}:</label>
            <NInput
              v-model:value="editedUrl"
              type="textarea"
              :placeholder="i18n('confirm_url_placeholder', '输入下载链接')"
              :autosize="{ minRows: 2, maxRows: 4 }"
              class="form-textarea"
            />
          </div>

          <div class="form-row form-row--vertical">
            <label class="form-label">{{ i18n('confirm_headers_label', '请求头') }}:</label>
            <NInput
              v-model:value="editedHeaders"
              type="textarea"
              :placeholder="
                i18n('confirm_headers_placeholder', '每行一个header，格式: Header-Name: value')
              "
              :autosize="{ minRows: 3, maxRows: 6 }"
              class="form-textarea"
            />
          </div>
        </div>

        <!-- Actions -->
        <div class="form-actions">
          <NButton @click="showAdvanced = !showAdvanced">
            {{ i18n('confirm_advance', '高级') }}
          </NButton>
          <NSpace class="form-actions__right">
            <NButton type="primary" :loading="loading" @click="confirmDownload">
              {{ i18n('confirm_confirm', '确认') }}
            </NButton>
            <NButton @click="cancelDownload">
              {{ i18n('confirm_cancel', '取消') }}
            </NButton>
          </NSpace>
        </div>
      </div>
    </div>
  </NConfigProvider>
</template>

<style scoped>
.confirm-root {
  padding: 16px 20px;
  background: var(--n-color);
  min-height: 100vh;
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.confirm-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-row--save {
  margin-top: -6px;
  margin-bottom: 4px;
}

.form-row--vertical {
  align-items: flex-start;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  width: 80px;
  text-align: right;
  font-size: 13px;
  color: var(--n-text-color);
  flex-shrink: 0;
}

.form-save-default {
  font-size: 12px;
  color: var(--n-text-color-3);
}

.form-input {
  flex: 1;
}

.form-input--disabled {
  flex: 1;
  opacity: 0.6;
}

.form-textarea {
  width: 100%;
}

.aria2-status {
  flex: 1;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 13px;
  line-height: 1.4;
}

.aria2-status--connected {
  background-color: #d4edda;
  color: #155724;
}

.aria2-status--disconnected {
  background-color: #f8d7da;
  color: #721c24;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--n-border-color);
}

.form-actions__right {
  display: flex;
  gap: 8px;
}

.advanced-section {
  margin-top: 4px;
}
</style>
