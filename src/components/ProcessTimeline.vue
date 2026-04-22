<script setup lang="ts">
import type { QueryRun } from '../types'
import JsonPanel from './JsonPanel.vue'
import StatusPill from './StatusPill.vue'

defineProps<{
  run: QueryRun | null
}>()
</script>

<template>
  <section class="panel">
    <div class="panel-header">
      <h2>协议时间线</h2>
      <StatusPill v-if="run" :label="run.stage" :tone="run.stage === 'success' ? 'success' : run.stage === 'error' ? 'danger' : 'warning'" />
    </div>
    <ol class="timeline" v-if="run">
      <li :data-active="true">
        <strong>1. 选择目标记录</strong>
        <p>{{ run.target?.itemName ?? '等待选择' }}</p>
        <JsonPanel v-if="run.generationInput" title="生成输入" :payload="run.generationInput" compact />
      </li>
      <li :data-active="run.stage !== 'idle'">
        <strong>2. 本地生成 DPF Key Share</strong>
        <p>{{ run.requestA ? '已生成并序列化为请求体' : '尚未生成' }}</p>
        <div v-if="run.generatedKeys" class="timeline-json-grid">
          <JsonPanel title="Key Share A" :payload="run.generatedKeys.left" compact />
          <JsonPanel title="Key Share B" :payload="run.generatedKeys.right" compact />
        </div>
      </li>
      <li :data-active="Boolean(run.responseA || run.responseB)">
        <strong>3. 并发发送双路请求</strong>
        <p>{{ run.responseA && run.responseB ? '双服务器均已响应' : '等待服务响应' }}</p>
        <div v-if="run.requestA || run.requestB" class="timeline-json-grid">
          <JsonPanel v-if="run.requestA" title="Request → Server A" :payload="run.requestA" compact />
          <JsonPanel v-if="run.requestB" title="Request → Server B" :payload="run.requestB" compact />
        </div>
        <div v-if="run.responseA || run.responseB" class="timeline-json-grid">
          <JsonPanel v-if="run.responseA" title="Response ← Server A" :payload="run.responseA" compact />
          <JsonPanel v-if="run.responseB" title="Response ← Server B" :payload="run.responseB" compact />
        </div>
      </li>
      <li :data-active="Boolean(run.reconstructedDetail)">
        <strong>4. 前端重构详情记录</strong>
        <p>{{ run.reconstructedDetail ? run.reconstructedDetail.itemName : run.error ?? '尚未完成重构' }}</p>
        <JsonPanel v-if="run.reconstructedDetail" title="恢复结果" :payload="run.reconstructedDetail" compact />
      </li>
    </ol>
    <p v-else class="empty-state">尚未产生查询过程。请先到场景页发起一次私有查询。</p>
  </section>
</template>
