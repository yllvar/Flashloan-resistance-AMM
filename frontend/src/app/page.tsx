'use client'
import dynamic from 'next/dynamic'
import { useWallet } from '@solana/wallet-adapter-react'
import SwapCard from './swap/SwapCard'

const WalletMultiButton = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
)

export default function Home() {
  const { publicKey } = useWallet()

  return (
    <main className="min-h-screen p-8">
      <div className="flex justify-end">
        <WalletMultiButton />
      </div>
      
      <div className="max-w-4xl mx-auto mt-8">
        <SwapCard />
      </div>
      <div className="max-w-4xl mx-auto mt-8">
        <h1 className="text-4xl font-bold text-center">
          Flashloan-Resistant AMM
        </h1>
        <p className="mt-4 text-lg text-center text-gray-600">
          Secure decentralized exchange with TWAP-based protection
        </p>

        {publicKey && (
          <div className="mt-8 p-4 border rounded-lg">
            <p className="text-sm font-mono">
              Connected: {publicKey.toBase58()}
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
