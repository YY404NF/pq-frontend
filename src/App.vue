<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from 'vue-router'

const route = useRoute()

const navItems = [
  { to: '/', label: '首页' },
  { to: '/demo', label: '演示页' },
]
</script>

<template>
  <div class="app-shell">
    <header class="topbar">
      <RouterLink class="brand" to="/">
        <span>PrivateQuery</span>
        <small>Two-Server Private Query Demo</small>
      </RouterLink>
      <nav class="main-nav">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="nav-link"
          :data-active="item.to === '/' ? route.path === '/' : route.path.startsWith(item.to)"
        >
          {{ item.label }}
        </RouterLink>
      </nav>
    </header>

    <main class="page-shell">
      <RouterView />
    </main>
  </div>
</template>
