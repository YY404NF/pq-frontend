import { reactive } from 'vue'

import { fetchCatalogItems, fetchCatalogVersions, serverConfig } from '../api/client'
import { executePrivateQuery } from '../query/privateQuery'
import type { CatalogDetail, CatalogItem, CatalogVersion, QueryRun, QueryStage } from '../types'

interface AppState {
  initialized: boolean
  loading: boolean
  loadingMessage: string
  catalog: CatalogItem[]
  versions: {
    left: CatalogVersion | null
    right: CatalogVersion | null
  }
  activeDetail: CatalogDetail | null
  activeItemId: number | null
  lastQueryRun: QueryRun | null
  lastError: string | null
  versionMismatch: boolean
  stage: QueryStage
}

export const appState = reactive<AppState>({
  initialized: false,
  loading: false,
  loadingMessage: '',
  catalog: [],
  versions: {
    left: null,
    right: null,
  },
  activeDetail: null,
  activeItemId: null,
  lastQueryRun: null,
  lastError: null,
  versionMismatch: false,
  stage: 'idle',
})

export async function initializeApp() {
  appState.loading = true
  appState.stage = 'loading'
  appState.loadingMessage = '正在同步双服务器版本与公开商品目录...'
  appState.lastError = null
  try {
    const [versions, catalog] = await Promise.all([
      fetchCatalogVersions(),
      fetchCatalogItems(),
    ])
    appState.versions.left = versions.left
    appState.versions.right = versions.right
    appState.catalog = catalog
    appState.versionMismatch = versions.left.datasetVersion !== versions.right.datasetVersion
    appState.initialized = true
    appState.stage = 'idle'
  } catch (error) {
    appState.lastError = error instanceof Error ? error.message : '初始化失败'
    appState.stage = 'error'
  } finally {
    appState.loading = false
    appState.loadingMessage = ''
  }
}

export async function selectAndQuery(item: CatalogItem) {
  if (!appState.versions.left || !appState.versions.right) {
    throw new Error('版本信息尚未加载')
  }

  appState.activeItemId = item.recordId
  appState.activeDetail = null
  appState.lastError = null

  try {
    const run = await executePrivateQuery(item, {
      left: appState.versions.left,
      right: appState.versions.right,
    }, (next) => {
      appState.lastQueryRun = next
      appState.stage = next.stage
    })
    appState.activeDetail = run.reconstructedDetail ?? null
  } catch (error) {
    const message = error instanceof Error ? error.message : '查询失败'
    appState.lastError = message
    appState.stage = 'error'
    appState.lastQueryRun = {
      ...(appState.lastQueryRun ?? { queryId: `q-${Date.now()}` }),
      target: item,
      stage: 'error',
      error: message,
      completedAt: new Date().toISOString(),
    }
    throw error
  }
}

export const appMeta = {
  serverAUrl:
    import.meta.env.VITE_PUBLIC_SERVER_A_URL ??
    `http://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:8081`,
  serverBUrl:
    import.meta.env.VITE_PUBLIC_SERVER_B_URL ??
    `http://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:8082`,
  proxiedServerAUrl: serverConfig.serverAUrl,
  proxiedServerBUrl: serverConfig.serverBUrl,
}
