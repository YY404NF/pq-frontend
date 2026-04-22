<script setup lang="ts">
import { computed, onMounted } from 'vue'

import DetailCard from '../components/DetailCard.vue'
import ProcessTimeline from '../components/ProcessTimeline.vue'
import ProductCard from '../components/ProductCard.vue'
import StatusPill from '../components/StatusPill.vue'
import { appState, initializeApp, selectAndQuery } from '../state/appState'

const loading = computed(() => ['loading', 'generating', 'requesting', 'reconstructing'].includes(appState.stage))

async function handleSelect(recordId: number) {
  const item = appState.catalog.find((entry) => entry.recordId === recordId)
  if (!item) {
    return
  }
  await selectAndQuery(item)
}

onMounted(async () => {
  if (!appState.initialized) {
    await initializeApp()
  }
})
</script>

<template>
  <div class="page-stack">
    <section class="panel">
      <div class="panel-header">
        <div>
          <p class="eyebrow">Demo View</p>
          <h1>演示页</h1>
        </div>
        <StatusPill
          :label="appState.versionMismatch ? '版本不一致' : '版本已对齐'"
          :tone="appState.versionMismatch ? 'danger' : 'success'"
        />
      </div>
      <p class="lead">
        左侧模拟真实商品详情查看流程，右侧同步展示 DPF 私有查询的协议时间线、请求报文、响应报文与重构结果。
      </p>
    </section>

    <section class="demo-layout">
      <div class="demo-column demo-column--scene">
        <article class="catalog-header panel">
          <div>
            <p class="eyebrow">公开目录</p>
            <strong>{{ appState.catalog.length }} 条记录</strong>
          </div>
          <button class="ghost-button" type="button" @click="initializeApp">刷新目录</button>
        </article>

        <article v-if="appState.lastError && !appState.catalog.length" class="panel empty-state">
          {{ appState.lastError }}
        </article>

        <div class="catalog-grid">
          <div
            v-for="item in appState.catalog"
            :key="item.recordId"
            class="catalog-row"
          >
            <ProductCard
              :item="item"
              :active="appState.activeItemId === item.recordId"
              @select="handleSelect(item.recordId)"
            />
            <DetailCard
              v-if="appState.activeItemId === item.recordId"
              :detail="appState.activeDetail"
              :loading="loading"
              :error="appState.lastError"
              compact
            />
          </div>
        </div>
      </div>

      <div class="demo-column demo-column--protocol">
        <section class="panel">
          <div class="panel-header">
            <div>
              <p class="eyebrow">Protocol Dashboard</p>
              <h2>协议过程</h2>
            </div>
            <StatusPill
              :label="appState.lastQueryRun?.stage ?? 'idle'"
              :tone="
                appState.lastQueryRun?.stage === 'success'
                  ? 'success'
                  : appState.lastQueryRun?.stage === 'error'
                    ? 'danger'
                    : 'neutral'
              "
            />
          </div>
          <p class="lead">这里完整保留客户端生成的请求报文、双服务器响应结果以及最终重构出的记录摘要。</p>
        </section>

        <ProcessTimeline :run="appState.lastQueryRun" />

      </div>
    </section>
  </div>
</template>
