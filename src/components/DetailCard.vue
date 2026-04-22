<script setup lang="ts">
import type { CatalogDetail } from '../types'
import StatusPill from './StatusPill.vue'

defineProps<{
  detail: CatalogDetail | null
  loading: boolean
  error: string | null
  compact?: boolean
}>()
</script>

<template>
  <section class="panel detail-card" :data-compact="compact">
    <div class="panel-header">
      <h2>商品详情</h2>
      <StatusPill :label="loading ? '查询进行中' : detail ? '重构成功' : error ? '查询失败' : '等待选择'" :tone="loading ? 'warning' : detail ? 'success' : error ? 'danger' : 'neutral'" />
    </div>
    <div v-if="detail" class="detail-grid">
      <div>
        <p class="eyebrow">名称</p>
        <strong>{{ detail.itemName }}</strong>
      </div>
      <div>
        <p class="eyebrow">类别</p>
        <strong>{{ detail.category }}</strong>
      </div>
      <div>
        <p class="eyebrow">价格</p>
        <strong>{{ detail.priceText }}</strong>
      </div>
      <div>
        <p class="eyebrow">库存</p>
        <strong>{{ detail.stockStatus }}</strong>
      </div>
      <div>
        <p class="eyebrow">商家</p>
        <strong>{{ detail.merchant }}</strong>
      </div>
      <div>
        <p class="eyebrow">更新时间</p>
        <strong>{{ detail.updatedAt }}</strong>
      </div>
    </div>
    <p v-else-if="error" class="empty-state">{{ error }}</p>
    <p v-else class="empty-state">从左侧列表选择任意商品，即可触发双服务器私有查询。</p>
  </section>
</template>
