'use client'
import { useAmm } from '@/hooks/useAmm'
import { calculateTwap } from '@/types/amm'
import { DeviationGauge } from './DeviationGauge'
import { TwapTimeline } from './TwapTimeline'
import { OracleStatus } from './OracleStatus'

export function SecurityPanel() {
  const { ammState, twapOracle } = useAmm()

  if (!ammState || !twapOracle) return null

  const currentPrice = ammState.reserveB / ammState.reserveA
  const twapValue = calculateTwap(twapOracle)
  const deviation = Math.abs((currentPrice - twapValue) / twapValue) * 100

  return (
    <div className="bg-gray-900 rounded-lg p-4 space-y-4">
      <h3 className="text-lg font-semibold text-white">Security Dashboard</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DeviationGauge value={deviation} max={ammState.maxPriceDeviation} />
        <TwapTimeline prices={twapOracle.priceHistory} />
        <OracleStatus 
          lastUpdated={twapOracle.lastUpdated} 
          maxStaleness={twapOracle.maxStaleness}
        />
      </div>
    </div>
  )
}
