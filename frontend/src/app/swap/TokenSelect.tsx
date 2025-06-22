'use client'
import { PublicKey } from '@solana/web3.js'
import { useState } from 'react'

const TOKENS = [
  {
    symbol: 'SOL',
    name: 'Solana',
    mint: 'So11111111111111111111111111111111111111112'
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
  }
]

export default function TokenSelect({
  selectedToken,
  onSelect
}: {
  selectedToken: PublicKey | null
  onSelect: (token: PublicKey) => void
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 rounded px-3 py-2 transition"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>
          {selectedToken 
            ? TOKENS.find(t => t.mint === selectedToken.toString())?.symbol || 'Select'
            : 'Select'}
        </span>
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
          <div className="py-1">
            {TOKENS.map(token => (
              <button
                key={token.mint}
                type="button"
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                onClick={() => {
                  onSelect(new PublicKey(token.mint))
                  setIsOpen(false)
                }}
              >
                {token.symbol} - {token.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
