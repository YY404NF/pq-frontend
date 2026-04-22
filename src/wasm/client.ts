import { generateQueryKey, querySeedBytes, reconstructU64Blocks } from '../query/dpf'

let ready = false

export async function loadDpfModule() {
  if (!ready) {
    ready = true
  }

  return {
    generateQueryKey,
    reconstructU64Blocks,
    querySeedBytes,
  }
}
