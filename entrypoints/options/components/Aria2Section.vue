<script lang="ts" setup>
/**
 * @fileoverview Aria2 RPC settings section.
 *
 * Aria2 RPC host/port/secret configuration with a "Test Connection" button
 * and status feedback. Uses Naive UI components for visual consistency.
 */
import { computed } from 'vue';
import { NFormItem, NInput, NInputNumber, NButton, NTag, NIcon, NSwitch } from 'naive-ui';
import { CheckmarkCircleOutline, CloseCircleOutline } from '@vicons/ionicons5';

const props = defineProps<{
  enabled: boolean;
  host: string;
  port: number;
  secret: string;
  secure: boolean;
  downloadDir: string;
  testing: boolean;
  connected: boolean;
  version: string | null;
  error: string | null;
}>();

const emit = defineEmits<{
  'update:enabled': [value: boolean];
  'update:host': [value: string];
  'update:port': [value: number];
  'update:secret': [value: string];
  'update:secure': [value: boolean];
  'update:downloadDir': [value: string];
  test: [];
}>();

import { useI18n } from '@/shared/i18n/engine';

const { t: i18n } = useI18n();

const isConnected = computed(() => props.connected);

const errorMessage = computed(() => {
  if (!props.error) return null;
  return props.error;
});
</script>

<template>
  <div class="section">
    <div class="section__row">
      <NFormItem :label="i18n('options_aria2_enabled_label', 'Enable Aria2 RPC')">
        <NSwitch :value="enabled" @update:value="(v: boolean) => emit('update:enabled', v)" />
      </NFormItem>
    </div>

    <template v-if="enabled">
      <div class="section__grid">
        <NFormItem :label="i18n('options_aria2_host_label', 'Host')">
          <NInput
            :value="host"
            :placeholder="i18n('options_aria2_host_placeholder', '127.0.0.1')"
            style="width: 160px"
            @update:value="(v: string) => emit('update:host', v)"
          />
        </NFormItem>
        <NFormItem :label="i18n('options_aria2_port_label', 'Port')">
          <NInputNumber
            :value="port"
            :min="1"
            :max="65535"
            style="width: 120px"
            @update:value="(v: number | null) => emit('update:port', v ?? 6800)"
          />
        </NFormItem>
        <NFormItem :label="i18n('options_aria2_secure_label', 'HTTPS')">
          <NSwitch :value="secure" @update:value="(v: boolean) => emit('update:secure', v)" />
        </NFormItem>
      </div>

      <div class="section__grid">
        <NFormItem :label="i18n('options_aria2_secret_label', 'Secret Token')">
          <NInput
            :value="secret"
            type="password"
            show-password-on="click"
            :placeholder="i18n('options_aria2_secret_placeholder', 'RPC secret')"
            style="width: 280px"
            @update:value="(v: string) => emit('update:secret', v)"
          />
        </NFormItem>
        <NFormItem :label="i18n('options_aria2_dir_label', 'Download Directory')">
          <NInput
            :value="downloadDir"
            :placeholder="i18n('options_aria2_dir_placeholder', '/downloads')"
            style="width: 280px"
            @update:value="(v: string) => emit('update:downloadDir', v)"
          />
        </NFormItem>
      </div>

      <div class="section__row">
        <NButton type="primary" :loading="testing" @click="emit('test')">
          <Transition :name="testing ? 'text-swap' : 'text-swap-reverse'" mode="out-in">
            <span v-if="testing" key="testing">
              {{ i18n('options_testing_connection', 'Testing...') }}
            </span>
            <span v-else key="idle">
              {{ i18n('options_test_aria2', 'Test Aria2 Connection') }}
            </span>
          </Transition>
        </NButton>

        <Transition name="fade" mode="out-in">
          <span
            v-if="isConnected && version"
            key="ok"
            class="section__feedback section__feedback--ok"
          >
            <NIcon :size="16"><CheckmarkCircleOutline /></NIcon>
            {{ i18n('options_connection_success_prefix', 'Connected · Aria2') }}
            <NTag size="small" round>v{{ version }}</NTag>
          </span>
          <span v-else-if="error" key="err" class="section__feedback section__feedback--err">
            <NIcon :size="16"><CloseCircleOutline /></NIcon>
            {{ errorMessage }}
          </span>
        </Transition>
      </div>
    </template>
  </div>
</template>

<style scoped>
.section__grid {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.section__row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
}

.section__feedback {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
}

.section__feedback--ok {
  color: var(--color-success);
}

.section__feedback--err {
  color: var(--color-error);
}
</style>
