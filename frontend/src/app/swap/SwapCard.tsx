'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { PublicKey } from '@solana/web3.js'
import dynamic from 'next/dynamic'
const TokenSelect = dynamic(() => import('./TokenSelect'), { ssr: false })

type SwapForm = {
  fromAmount: string
  toAmount: string
  slippage: string
}

export default function SwapCard() {
  const { register, handleSubmit } = useForm<SwapForm>({
    defaultValues: {
      slippage: '0.5'
    }
  })
  const [fromToken, setFromToken] = useState<PublicKey | null>(null)
  const [toToken, setToToken] = useState<PublicKey | null>(null)

  const onSubmit = (data: SwapForm) => {
    console.log('Swap submitted:', data)
    // TODO: Implement swap logic
  }

  return (
    <div className="bg-white text-black rounded-xl p-6 shadow-lg max-w-md w-full">
      <h2 className="text-xl font-semibold mb-4">Swap Tokens</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium">From</label>
            <div className="flex space-x-2">
              <input
                {...register('fromAmount')}
                type="number"
                placeholder="0.0"
                className="flex-1 p-2 border rounded"
              />
              <TokenSelect 
                selectedToken={fromToken}
                onSelect={setFromToken}
              />
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium">To</label>
            <div className="flex space-x-2">
              <input
                {...register('toAmount')}
                type="number"
                placeholder="0.0"
                className="flex-1 p-2 border rounded"
                readOnly
              />
              <TokenSelect 
                selectedToken={toToken}
                onSelect={setToToken}
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
            >
              Swap
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
