'use client'
import { useState, useEffect } from 'react'
import { useAnchorWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { useProgram } from './useProgram'
import type { AmmState, TwapOracle } from '@/types/amm'

export function useAmm() {
  const wallet = useAnchorWallet()
  const { program } = useProgram()

  const [ammState, setAmmState] = useState<AmmState | null>(null)
  const [twapOracle, setTwapOracle] = useState<TwapOracle | null>(null)

  useEffect(() => {
    if (!program || !wallet) return

    const fetchAmmData = async () => {
      try {
        // Fetch AMM and Oracle accounts
        const [ammAccount] = await PublicKey.findProgramAddress(
          [Buffer.from('amm'), /* token addresses */],
          program.programId
        )
        
        const amm = await program.account.ammState.fetch(ammAccount)
        const oracle = await program.account.twapOracle.fetch(amm.twapOracle)

        setAmmState(amm)
        setTwapOracle(oracle)
      } catch (error) {
        console.error('Error fetching AMM data:', error)
      }
    }

    fetchAmmData()
  }, [program, wallet])

  return { ammState, twapOracle }
}
