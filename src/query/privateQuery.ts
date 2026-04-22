import { evalOnServers } from '../api/client'
import { decodeCatalogDetail } from '../codec/payload'
import type { CatalogItem, CatalogVersion, EvalRequest, QueryRun } from '../types'
import { loadDpfModule } from '../wasm/client'

export async function executePrivateQuery(
  item: CatalogItem,
  versions: { left: CatalogVersion; right: CatalogVersion },
  onUpdate: (run: QueryRun) => void,
) {
  const run: QueryRun = {
    queryId: `q-${Date.now()}`,
    target: item,
    stage: 'generating',
    startedAt: new Date().toISOString(),
  }
  onUpdate(run)

  if (versions.left.datasetVersion !== versions.right.datasetVersion) {
    throw new Error('两个服务器的数据版本不一致，无法发起私有查询')
  }

  const dpfModule = await loadDpfModule()
  const randomSeedBytes = dpfModule.querySeedBytes()
  run.generationInput = {
    recordId: item.recordId,
    itemName: item.itemName,
    domainSize: versions.left.domainSize,
    datasetVersion: versions.left.datasetVersion,
    randomSeedHex: bytesToHex(randomSeedBytes),
  }
  onUpdate({ ...run })

  const keyPair = dpfModule.generateQueryKey(
    item.recordId,
    versions.left.domainSize,
    randomSeedBytes,
  )
  run.generatedKeys = {
    left: keyPair.left,
    right: keyPair.right,
  }
  onUpdate({ ...run })

  const requestA: EvalRequest = {
    datasetVersion: versions.left.datasetVersion,
    queryId: run.queryId,
    domainSize: versions.left.domainSize,
    keyShare: keyPair.left,
  }
  const requestB: EvalRequest = {
    datasetVersion: versions.left.datasetVersion,
    queryId: run.queryId,
    domainSize: versions.left.domainSize,
    keyShare: keyPair.right,
  }

  run.requestA = requestA
  run.requestB = requestB
  run.stage = 'requesting'
  onUpdate({ ...run })

  const { left, right } = await evalOnServers(requestA, requestB)
  run.responseA = left
  run.responseB = right
  run.stage = 'reconstructing'
  onUpdate({ ...run })

  const blocks = dpfModule.reconstructU64Blocks(left.resultShareBlocksHex, right.resultShareBlocksHex)
  run.reconstructedBlocksHex = blocks.map((block) => block.toString(16).padStart(16, '0'))
  run.reconstructedDetail = decodeCatalogDetail(blocks)
  run.stage = 'success'
  run.completedAt = new Date().toISOString()
  onUpdate({ ...run })

  return run
}

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes)
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('')
}
