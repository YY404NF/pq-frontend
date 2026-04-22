import axios from 'axios'

import type { CatalogItem, CatalogVersion, EvalRequest, EvalResponse } from '../types'

const serverAUrl = import.meta.env.VITE_SERVER_A_URL ?? '/server-a'
const serverBUrl = import.meta.env.VITE_SERVER_B_URL ?? '/server-b'

const clientA = axios.create({
  baseURL: serverAUrl,
  timeout: 10000,
})

const clientB = axios.create({
  baseURL: serverBUrl,
  timeout: 10000,
})

export const serverConfig = {
  serverAUrl,
  serverBUrl,
}

export async function fetchCatalogVersions() {
  const [left, right] = await Promise.all([
    clientA.get<CatalogVersion>('/api/catalog/version'),
    clientB.get<CatalogVersion>('/api/catalog/version'),
  ])
  return { left: left.data, right: right.data }
}

export async function fetchCatalogItems() {
  const response = await clientA.get<{ items: CatalogItem[] }>('/api/catalog/list')
  return response.data.items
}

export async function evalOnServers(requestA: EvalRequest, requestB: EvalRequest) {
  const [left, right] = await Promise.all([
    clientA.post<EvalResponse>('/api/query/eval', requestA),
    clientB.post<EvalResponse>('/api/query/eval', requestB),
  ])
  return { left: left.data, right: right.data }
}
