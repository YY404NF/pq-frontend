<template>
  <section class="panel architecture-panel">
    <div class="panel-header">
      <h2>系统结构</h2>
      <p>前端承担查询客户端职责，双服务器各自持有一致数据副本并独立求值。</p>
    </div>
    <div class="architecture-grid">
      <article class="architecture-grid__client">
        <div class="architecture-badge">Client</div>
        <p>索引映射、份额生成、双路请求与结果重构全部发生在浏览器侧。</p>
        <div class="architecture-chip-row">
          <span>Index Mapping</span>
          <span>DPF Gen</span>
          <span>Reconstruct</span>
        </div>
      </article>
      <div class="architecture-grid__servers">
        <div class="architecture-badge architecture-badge--server">Server</div>
        <div class="architecture-server-stack">
          <article class="architecture-server architecture-server--a">
            <span>Server A</span>
            <strong>Go + SQLite Replica A</strong>
            <p>接收 Key Share A，执行本地 DPF 聚合，返回结果份额。</p>
          </article>
          <article class="architecture-server architecture-server--b">
            <span>Server B</span>
            <strong>Go + SQLite Replica B</strong>
            <p>接收 Key Share B，执行本地 DPF 聚合，返回结果份额。</p>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>
