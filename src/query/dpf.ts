import type { CorrectionWordPayload, KeySharePayload } from '../types'

type Block128 = {
  x: number
  y: number
  z: number
  w: number
}

type CorrectionWord = {
  s: Block128
  tr: boolean
}

const mask64 = (1n << 64n) - 1n
export function generateQueryKey(index: number, domainSize: number, randomBytes: Uint8Array) {
  if (!isPowerOfTwo(domainSize)) {
    throw new Error('domain size must be a power of two')
  }
  if (index >= domainSize) {
    throw new Error('index is out of domain')
  }

  const inBits = resolveInBits(domainSize)
  const prg = new Aes128MmoSoft()
  const [seed0, seed1] = deriveSeeds(randomBytes)
  const cws: CorrectionWord[] = []

  let s0 = setLsb(seed0, false)
  let s1 = setLsb(seed1, false)
  let t0 = false
  let t1 = true

  for (let i = 0; i < inBits; i += 1) {
    const [s0lRaw, s0rRaw] = prg.gen(s0)
    const [s1lRaw, s1rRaw] = prg.gen(s1)

    const t0l = getLsb(s0lRaw)
    const t0r = getLsb(s0rRaw)
    const t1l = getLsb(s1lRaw)
    const t1r = getLsb(s1rRaw)

    const s0l = setLsb(s0lRaw, false)
    const s0r = setLsb(s0rRaw, false)
    const s1l = setLsb(s1lRaw, false)
    const s1r = setLsb(s1rRaw, false)

    const aBit = ((index >> (inBits - 1 - i)) & 1) === 1
    let sCw = aBit ? xorBlock(s0l, s1l) : xorBlock(s0r, s1r)
    const tlCw = Boolean(Number(t0l) ^ Number(t1l) ^ Number(aBit) ^ 1)
    const trCw = Boolean(Number(t0r) ^ Number(t1r) ^ Number(aBit))

    if (!aBit) {
      s0 = t0 ? xorBlock(s0l, sCw) : s0l
      s1 = t1 ? xorBlock(s1l, sCw) : s1l
      t0 = t0 ? Boolean(Number(t0l) ^ Number(tlCw)) : t0l
      t1 = t1 ? Boolean(Number(t1l) ^ Number(tlCw)) : t1l
    } else {
      s0 = t0 ? xorBlock(s0r, sCw) : s0r
      s1 = t1 ? xorBlock(s1r, sCw) : s1r
      t0 = t0 ? Boolean(Number(t0r) ^ Number(trCw)) : t0r
      t1 = t1 ? Boolean(Number(t1r) ^ Number(trCw)) : t1r
    }

    sCw = setLsb(sCw, tlCw)
    cws.push({ s: sCw, tr: trCw })
  }

  let v = add64(1n, add64(neg64(toU64(s0)), toU64(s1)))
  if (t1) {
    v = neg64(v)
  }
  cws.push({ s: fromU64(v), tr: false })

  return {
    inBits,
    left: toKeySharePayload(seed0, cws),
    right: toKeySharePayload(seed1, cws),
  }
}

export function reconstructU64Blocks(leftHex: string[], rightHex: string[]) {
  return leftHex.map((value, index) => add64(decodeU64Hex(value), decodeU64Hex(rightHex[index])))
}

function toKeySharePayload(seed: Block128, cws: CorrectionWord[]): KeySharePayload {
  return {
    seedHex: encodeBlock128Hex(seed),
    correctionWords: cws.map<CorrectionWordPayload>((cw) => ({
      sHex: encodeBlock128Hex(cw.s),
      tr: cw.tr,
    })),
  }
}

class Aes128MmoSoft {
  private readonly sbox: number[]
  private readonly te0: number[]
  private readonly roundKeys: Uint8Array[]

  constructor() {
    this.sbox = [
      0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76,
      0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0, 0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0,
      0xb7, 0xfd, 0x93, 0x26, 0x36, 0x3f, 0xf7, 0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15,
      0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a, 0x07, 0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75,
      0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0, 0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84,
      0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf,
      0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85, 0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c, 0x9f, 0xa8,
      0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5, 0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2,
      0xcd, 0x0c, 0x13, 0xec, 0x5f, 0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73,
      0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88, 0x46, 0xee, 0xb8, 0x14, 0xde, 0x5e, 0x0b, 0xdb,
      0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c, 0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79,
      0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5, 0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08,
      0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a,
      0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e, 0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e,
      0xe1, 0xf8, 0x98, 0x11, 0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf,
      0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68, 0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16,
    ]
    this.te0 = Array.from({ length: 256 }, (_, index) => this.computeTe0(index))
    this.roundKeys = [this.expandKey([
      0x10, 0x32, 0x54, 0x76, 0x98, 0xba, 0xdc, 0xfe, 0x10, 0x21, 0x32, 0x43, 0x54, 0x65, 0x76, 0x87,
    ]), this.expandKey([
      0x87, 0x76, 0x65, 0x54, 0x43, 0x32, 0x21, 0x10, 0xfe, 0xdc, 0xba, 0x98, 0x76, 0x54, 0x32, 0x10,
    ])]
  }

  gen(seed: Block128): [Block128, Block128] {
    return this.roundKeys.map((roundKey) => xorBlock(this.encrypt(seed, roundKey), seed)) as [Block128, Block128]
  }

  private encrypt(block: Block128, roundKey: Uint8Array) {
    const buffer = blockToBytes(block)
    let s0 = (loadBE32(buffer, 0) ^ loadBE32(roundKey, 0)) >>> 0
    let s1 = (loadBE32(buffer, 4) ^ loadBE32(roundKey, 4)) >>> 0
    let s2 = (loadBE32(buffer, 8) ^ loadBE32(roundKey, 8)) >>> 0
    let s3 = (loadBE32(buffer, 12) ^ loadBE32(roundKey, 12)) >>> 0

    for (let round = 1; round <= 9; round += 1) {
      const offset = round * 16
      const t0 = (this.te0[(s0 >>> 24) & 0xff] ^ rotWord8(this.te0[(s1 >>> 16) & 0xff]) ^
        rotWord16(this.te0[(s2 >>> 8) & 0xff]) ^ rotWord24(this.te0[s3 & 0xff]) ^ loadBE32(roundKey, offset)) >>> 0
      const t1 = (this.te0[(s1 >>> 24) & 0xff] ^ rotWord8(this.te0[(s2 >>> 16) & 0xff]) ^
        rotWord16(this.te0[(s3 >>> 8) & 0xff]) ^ rotWord24(this.te0[s0 & 0xff]) ^ loadBE32(roundKey, offset + 4)) >>> 0
      const t2 = (this.te0[(s2 >>> 24) & 0xff] ^ rotWord8(this.te0[(s3 >>> 16) & 0xff]) ^
        rotWord16(this.te0[(s0 >>> 8) & 0xff]) ^ rotWord24(this.te0[s1 & 0xff]) ^ loadBE32(roundKey, offset + 8)) >>> 0
      const t3 = (this.te0[(s3 >>> 24) & 0xff] ^ rotWord8(this.te0[(s0 >>> 16) & 0xff]) ^
        rotWord16(this.te0[(s1 >>> 8) & 0xff]) ^ rotWord24(this.te0[s2 & 0xff]) ^ loadBE32(roundKey, offset + 12)) >>> 0
      s0 = t0
      s1 = t1
      s2 = t2
      s3 = t3
    }

    const offset = 160
    const o0 = (((this.sbox[(s0 >>> 24) & 0xff] << 24) >>> 0) | (this.sbox[(s1 >>> 16) & 0xff] << 16) |
      (this.sbox[(s2 >>> 8) & 0xff] << 8) | this.sbox[s3 & 0xff]) >>> 0
    const o1 = (((this.sbox[(s1 >>> 24) & 0xff] << 24) >>> 0) | (this.sbox[(s2 >>> 16) & 0xff] << 16) |
      (this.sbox[(s3 >>> 8) & 0xff] << 8) | this.sbox[s0 & 0xff]) >>> 0
    const o2 = (((this.sbox[(s2 >>> 24) & 0xff] << 24) >>> 0) | (this.sbox[(s3 >>> 16) & 0xff] << 16) |
      (this.sbox[(s0 >>> 8) & 0xff] << 8) | this.sbox[s1 & 0xff]) >>> 0
    const o3 = (((this.sbox[(s3 >>> 24) & 0xff] << 24) >>> 0) | (this.sbox[(s0 >>> 16) & 0xff] << 16) |
      (this.sbox[(s1 >>> 8) & 0xff] << 8) | this.sbox[s2 & 0xff]) >>> 0

    storeBE32(buffer, 0, (o0 ^ loadBE32(roundKey, offset)) >>> 0)
    storeBE32(buffer, 4, (o1 ^ loadBE32(roundKey, offset + 4)) >>> 0)
    storeBE32(buffer, 8, (o2 ^ loadBE32(roundKey, offset + 8)) >>> 0)
    storeBE32(buffer, 12, (o3 ^ loadBE32(roundKey, offset + 12)) >>> 0)
    return bytesToBlock(buffer)
  }

  private expandKey(key: number[]) {
    const roundKey = new Uint8Array(176)
    for (let i = 0; i < 16; i += 1) {
      roundKey[i] = key[i] ?? 0
    }
    for (let i = 4; i < 44; i += 1) {
      const temp = Array.from(roundKey.slice((i - 1) * 4, i * 4))
      if (i % 4 === 0) {
        const first = temp[0]
        temp[0] = this.sbox[temp[1]] ^ rcon(i / 4)
        temp[1] = this.sbox[temp[2]]
        temp[2] = this.sbox[temp[3]]
        temp[3] = this.sbox[first]
      }
      for (let j = 0; j < 4; j += 1) {
        roundKey[i * 4 + j] = (roundKey[(i - 4) * 4 + j] ^ temp[j]) & 0xff
      }
    }
    return roundKey
  }

  private computeTe0(index: number) {
    const s = this.sbox[index]
    const x2 = xt(s)
    const x3 = s ^ x2
    return (((x2 << 24) >>> 0) | (s << 16) | (s << 8) | x3) >>> 0
  }
}

function xt(value: number) {
  return (((value << 1) ^ (((value >>> 7) & 1) * 0x1b)) & 0xff) >>> 0
}

function rcon(index: number) {
  return [0x8d, 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36][index] ?? 0
}

function loadBE32(bytes: Uint8Array, offset: number) {
  return (((bytes[offset] << 24) >>> 0) | (bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3]) >>> 0
}

function storeBE32(bytes: Uint8Array, offset: number, value: number) {
  bytes[offset] = (value >>> 24) & 0xff
  bytes[offset + 1] = (value >>> 16) & 0xff
  bytes[offset + 2] = (value >>> 8) & 0xff
  bytes[offset + 3] = value & 0xff
}

function rotWord8(value: number) {
  return ((value << 24) | (value >>> 8)) >>> 0
}

function rotWord16(value: number) {
  return ((value << 16) | (value >>> 16)) >>> 0
}

function rotWord24(value: number) {
  return ((value << 8) | (value >>> 24)) >>> 0
}

function blockToBytes(block: Block128) {
  const bytes = new Uint8Array(16)
  const view = new DataView(bytes.buffer)
  view.setUint32(0, block.x >>> 0, true)
  view.setUint32(4, block.y >>> 0, true)
  view.setUint32(8, block.z >>> 0, true)
  view.setUint32(12, block.w >>> 0, true)
  return bytes
}

function bytesToBlock(bytes: Uint8Array): Block128 {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  return {
    x: view.getUint32(0, true),
    y: view.getUint32(4, true),
    z: view.getUint32(8, true),
    w: view.getUint32(12, true),
  }
}

function xorBlock(left: Block128, right: Block128): Block128 {
  return {
    x: (left.x ^ right.x) >>> 0,
    y: (left.y ^ right.y) >>> 0,
    z: (left.z ^ right.z) >>> 0,
    w: (left.w ^ right.w) >>> 0,
  }
}

function setLsb(block: Block128, bit: boolean): Block128 {
  return {
    ...block,
    w: bit ? (block.w | 1) >>> 0 : (block.w & ~1) >>> 0,
  }
}

function getLsb(block: Block128) {
  return (block.w & 1) !== 0
}

function toU64(block: Block128) {
  return BigInt(block.x >>> 0) | (BigInt(block.y >>> 0) << 32n)
}

function fromU64(value: bigint): Block128 {
  const normalized = BigInt.asUintN(64, value)
  return {
    x: Number(normalized & 0xffffffffn),
    y: Number((normalized >> 32n) & 0xffffffffn),
    z: 0,
    w: 0,
  }
}

function add64(left: bigint, right: bigint) {
  return (left + right) & mask64
}

function neg64(value: bigint) {
  return BigInt.asUintN(64, -value)
}

function resolveInBits(domainSize: number) {
  let bits = 0
  while ((1 << bits) < domainSize) {
    bits += 1
  }
  return bits
}

function isPowerOfTwo(value: number) {
  return value > 0 && (value & (value - 1)) === 0
}

function splitMix64(state: bigint) {
  let next = BigInt.asUintN(64, state + 0x9e3779b97f4a7c15n)
  let z = next
  z = BigInt.asUintN(64, (z ^ (z >> 30n)) * 0xbf58476d1ce4e5b9n)
  z = BigInt.asUintN(64, (z ^ (z >> 27n)) * 0x94d049bb133111ebn)
  return {
    next,
    value: BigInt.asUintN(64, z ^ (z >> 31n)),
  }
}

function deriveSeeds(bytes: Uint8Array): [Block128, Block128] {
  let s0 = 0x243f6a8885a308d3n
  let s1 = 0x13198a2e03707344n
  for (const byte of bytes) {
    s0 = BigInt.asUintN(64, s0 ^ (BigInt(byte) + 0x9e3779b97f4a7c15n + (s0 << 6n) + (s0 >> 2n)))
    s1 = BigInt.asUintN(64, s1 ^ (BigInt(byte) + 0xc2b2ae3d27d4eb4fn + (s1 << 6n) + (s1 >> 2n)))
  }

  const leftStateA = splitMix64(s0)
  const leftStateB = splitMix64(leftStateA.next)
  const rightStateA = splitMix64(s1)
  const rightStateB = splitMix64(rightStateA.next)

  return [
    setLsb(
      {
        x: Number(leftStateA.value & 0xffffffffn),
        y: Number((leftStateA.value >> 32n) & 0xffffffffn),
        z: Number(leftStateB.value & 0xffffffffn),
        w: Number((leftStateB.value >> 32n) & 0xffffffffn),
      },
      false,
    ),
    setLsb(
      {
        x: Number(rightStateA.value & 0xffffffffn),
        y: Number((rightStateA.value >> 32n) & 0xffffffffn),
        z: Number(rightStateB.value & 0xffffffffn),
        w: Number((rightStateB.value >> 32n) & 0xffffffffn),
      },
      false,
    ),
  ]
}

export function encodeBlock128Hex(block: Block128) {
  return Array.from(blockToBytes(block))
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('')
}

function decodeU64Hex(value: string) {
  const bytes = hexToBytes(value)
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  return view.getBigUint64(0, true)
}

function hexToBytes(value: string) {
  const bytes = new Uint8Array(value.length / 2)
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = Number.parseInt(value.slice(i * 2, i * 2 + 2), 16)
  }
  return bytes
}

export function querySeedBytes() {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return bytes
}
