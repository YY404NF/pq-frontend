<script setup lang="ts">
import ArchitecturePanel from '../components/ArchitecturePanel.vue'
import { appMeta } from '../state/appState'
</script>

<template>
  <div class="page-stack">
    <section class="hero-grid">
      <div class="hero-copy panel">
        <p class="eyebrow">PrivateQuery V1</p>
        <h1>
          基于 DPF 的双服务器
          <br />
          私有查询演示系统
        </h1>
        <div class="hero-metrics">
          <article>
            <strong>2</strong>
            <span>服务节点</span>
          </article>
          <article>
            <strong>32</strong>
            <span>样例记录</span>
          </article>
        </div>
      </div>
      <aside class="hero-card panel">
        <p class="eyebrow">运行端点</p>
        <div class="endpoint-cards">
          <article class="endpoint-card">
            <span>Server A</span>
            <strong>{{ appMeta.serverAUrl }}</strong>
          </article>
          <article class="endpoint-card">
            <span>Server B</span>
            <strong>{{ appMeta.serverBUrl }}</strong>
          </article>
        </div>
      </aside>
    </section>

    <ArchitecturePanel />

    <section class="panel principle-panel">
      <div class="panel-header">
        <h2>DPF 查询主链路</h2>
        <p>用户只执行一次普通的详情点击，但真正被保护的是“查询了哪条记录”这个目标本身。</p>
      </div>
      <div class="principle-flow">
        <div class="principle-flow__rail" />
        <article class="principle-step">
          <i class="step-dot" />
          <i class="step-connector" />
          <span class="step-kicker">Step 1</span>
          <strong>公开目录加载</strong>
          <p>前端展示公开商品列表并校验双服务器数据版本。</p>
        </article>
        <article class="principle-step">
          <i class="step-dot" />
          <i class="step-connector" />
          <span class="step-kicker">Step 2</span>
          <strong>本地生成份额</strong>
          <p>浏览器根据目标索引生成两份 DPF Key Share。</p>
        </article>
        <article class="principle-step">
          <i class="step-dot" />
          <i class="step-connector" />
          <span class="step-kicker">Step 3</span>
          <strong>双路独立求值</strong>
          <p>两台服务仅看到自己的请求份额和本地副本聚合过程。</p>
        </article>
        <article class="principle-step">
          <i class="step-dot" />
          <span class="step-kicker">Step 4</span>
          <strong>前端重构详情</strong>
          <p>前端将两份结果 Share 相加，恢复单条记录摘要。</p>
        </article>
      </div>
    </section>
  </div>
</template>
