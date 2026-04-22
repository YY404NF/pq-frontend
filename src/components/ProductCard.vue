<script setup lang="ts">
import type { CatalogItem } from '../types'

defineProps<{
  item: CatalogItem
  active?: boolean
}>()

defineEmits<{
  select: []
}>()
</script>

<template>
  <article class="product-card" :data-active="active">
    <div class="product-card__slot product-card__slot--title">
      <strong>{{ item.itemName }}</strong>
    </div>
    <div class="product-card__slot product-card__slot--price">
      <span>{{ item.priceText }}</span>
    </div>
    <footer class="product-card__slot product-card__slot--action">
      <button class="ghost-button" type="button" @click="$emit('select')">查看详情</button>
    </footer>
    <div class="product-card__slot product-card__slot--merchant">
      <small>{{ item.merchant }}</small>
    </div>
  </article>
</template>
