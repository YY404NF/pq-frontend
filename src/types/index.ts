export interface CatalogItem {
  recordId: number
  itemName: string
  category: string
  priceText: string
  merchant: string
  updatedAt: string
  stockStatus?: string
}

export interface CatalogDetail extends CatalogItem {
  priceCents: bigint
}

export interface CatalogVersion {
  datasetVersion: string
  recordCount: number
  blockCount: number
  domainSize: number
}

export interface CorrectionWordPayload {
  sHex: string
  tr: boolean
}

export interface KeySharePayload {
  seedHex: string
  correctionWords: CorrectionWordPayload[]
}

export interface EvalRequest {
  datasetVersion: string
  queryId: string
  domainSize: number
  keyShare: KeySharePayload
}

export interface EvalResponse {
  server: string
  party: number
  datasetVersion: string
  queryId: string
  resultShareBlocksHex: string[]
  elapsedMs: number
  trace: {
    workerCount: number
    recordCount: number
    blockCount: number
  }
}

export type QueryStage =
  | 'idle'
  | 'loading'
  | 'generating'
  | 'requesting'
  | 'reconstructing'
  | 'success'
  | 'error'

export interface QueryRun {
  queryId: string
  target?: CatalogItem
  generationInput?: {
    recordId: number
    itemName: string
    domainSize: number
    datasetVersion: string
    randomSeedHex: string
  }
  generatedKeys?: {
    left: KeySharePayload
    right: KeySharePayload
  }
  stage: QueryStage
  startedAt?: string
  completedAt?: string
  requestA?: EvalRequest
  requestB?: EvalRequest
  responseA?: EvalResponse
  responseB?: EvalResponse
  reconstructedBlocksHex?: string[]
  reconstructedDetail?: CatalogDetail
  error?: string
}
