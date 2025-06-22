'use client'
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react'
import { Program, AnchorProvider } from '@coral-xyz/anchor'
import { useMemo } from 'react'
import { IDL } from '@/types/amm'

export function useProgram() {
  const { connection } = useConnection()
  const wallet = useAnchorWallet()

  const program = useMemo(() => {
    if (!wallet) return null
    const provider = new AnchorProvider(connection, wallet, {
      commitment: 'confirmed'
    })
    return new Program(IDL, provider)
  }, [connection, wallet])

  return { program }
}
