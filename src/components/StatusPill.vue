<script setup lang="ts">
defineProps<{
  label: string
  tone?: 'neutral' | 'success' | 'warning' | 'danger'
}>()
</script>

<template>
  <span class="status-pill" :data-tone="tone ?? 'neutral'">{{ label }}</span>
</template>
