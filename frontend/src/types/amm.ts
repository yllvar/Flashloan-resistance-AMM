import { PublicKey } from '@solana/web3.js'
import { Idl } from '@coral-xyz/anchor'

export const IDL: Idl = {
  address: "Hexfz6ziQfSp6gzGRyNf2RAc7akNykz8ggeLqXrKj82s",
  metadata: {
    name: "flashloan_amm",
    version: "0.1.0",
    spec: "0.1.0"
  },
  instructions: [],
  accounts: [],
  types: [],
  errors: []
}

export const programId = new PublicKey("Hexfz6ziQfSp6gzGRyNf2RAc7akNykz8ggeLqXrKj82s")

export interface AmmState {
  bump: number
  authority: PublicKey
  twapOracle: PublicKey
  tokenA: PublicKey
  tokenB: PublicKey
  reserveA: number
  reserveB: number
  feeBps: number
  maxPriceDeviation: number
}

export interface TwapOracle {
  bump: number
  amm: PublicKey
  priceHistory: number[]
  lastUpdated: number
  updateInterval: number
  currentIndex: number
  decimals: number
  maxStaleness: number
}

export function calculateTwap(oracle: TwapOracle): number {
  const validPrices = oracle.priceHistory.filter(p => p > 0)
  if (validPrices.length === 0) return 0
  return validPrices.reduce((sum, p) => sum + p, 0) / validPrices.length
}
