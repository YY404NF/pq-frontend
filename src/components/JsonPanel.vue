<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  title: string
  payload: unknown
  compact?: boolean
}>()

const formatted = computed(() =>
  JSON.stringify(
    props.payload,
    (_key, value) => (typeof value === 'bigint' ? value.toString() : value),
    2,
  ),
)

const highlighted = computed(() => {
  const escaped = formatted.value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')

  return escaped.replace(
    /("(\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b-?\d+(?:\.\d+)?(?:[eE][+\-]?\d+)?\b|\btrue\b|\bfalse\b|\bnull\b)/g,
    (match) => {
      let cls = 'json-value'
      if (match.startsWith('"') && match.endsWith(':')) {
        cls = 'json-key'
      } else if (match.startsWith('"')) {
        cls = 'json-string'
      } else if (match === 'true' || match === 'false') {
        cls = 'json-boolean'
      } else if (match === 'null') {
        cls = 'json-null'
      } else {
        cls = 'json-number'
      }
      return `<span class="${cls}">${match}</span>`
    },
  )
})
</script>

<template>
  <section class="panel json-panel" :data-compact="compact">
    <div class="panel-header">
      <h3>{{ title }}</h3>
    </div>
    <pre v-html="highlighted" />
  </section>
</template>
