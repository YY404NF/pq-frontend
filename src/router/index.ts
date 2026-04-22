import { createRouter, createWebHistory } from 'vue-router'

import DemoView from '../views/DemoView.vue'
import HomeView from '../views/HomeView.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomeView },
    { path: '/demo', component: DemoView },
    { path: '/process', redirect: '/demo' },
    { path: '/scene', redirect: '/demo' },
  ],
})
