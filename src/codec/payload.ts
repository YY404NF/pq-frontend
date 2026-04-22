import type { CatalogDetail } from '../types'

const totalBytes = 160
const itemNameBytes = 48
const categoryBytes = 24
const stockStatusBytes = 16
const merchantBytes = 32
const updatedAtBytes = 24

export function decodeCatalogDetail(blocks: bigint[]): CatalogDetail {
  if (blocks.length * 8 !== totalBytes) {
    throw new Error('invalid payload block count')
  }

  const bytes = new Uint8Array(totalBytes)
  blocks.forEach((block, index) => {
    writeU64(bytes.subarray(index * 8, (index + 1) * 8), block)
  })

  let offset = 0
  const recordId = Number(readU64(bytes.subarray(offset, offset + 8)))
  offset += 8

  const itemName = readString(bytes.subarray(offset, offset + itemNameBytes))
  offset += itemNameBytes
  const category = readString(bytes.subarray(offset, offset + categoryBytes))
  offset += categoryBytes
  const priceCents = readU64(bytes.subarray(offset, offset + 8))
  offset += 8
  const stockStatus = readString(bytes.subarray(offset, offset + stockStatusBytes))
  offset += stockStatusBytes
  const merchant = readString(bytes.subarray(offset, offset + merchantBytes))
  offset += merchantBytes
  const updatedAt = readString(bytes.subarray(offset, offset + updatedAtBytes))

  return {
    recordId,
    itemName,
    category,
    priceCents,
    priceText: formatPrice(priceCents),
    stockStatus,
    merchant,
    updatedAt,
  }
}

function readString(bytes: Uint8Array) {
  const end = bytes.findIndex((byte) => byte === 0)
  const safeBytes = end >= 0 ? bytes.subarray(0, end) : bytes
  return new TextDecoder().decode(safeBytes)
}

function readU64(bytes: Uint8Array) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  return view.getBigUint64(0, true)
}

function writeU64(bytes: Uint8Array, value: bigint) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  view.setBigUint64(0, BigInt.asUintN(64, value), true)
}

function formatPrice(cents: bigint) {
  return `¥${cents / 100n}.${(cents % 100n).toString().padStart(2, '0')}`
}
