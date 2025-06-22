'use client'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'

export function DeviationGauge({ value, max }: { value: number; max: number }) {
  const percentage = Math.min((value / max) * 100, 100)
  const color = percentage < 30 ? '#4ade80' : percentage < 70 ? '#fbbf24' : '#ef4444'

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h4 className="text-sm font-medium text-gray-300 mb-2">Price Deviation</h4>
      <div className="w-32 h-32 mx-auto">
        <CircularProgressbar
          value={percentage}
          text={`${value.toFixed(2)}%`}
          styles={buildStyles({
            pathColor: color,
            textColor: '#ffffff',
            trailColor: '#374151',
          })}
        />
      </div>
      <p className="text-center mt-2 text-sm text-gray-400">
        Max allowed: {max}%
      </p>
    </div>
  )
}
