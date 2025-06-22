'use client'
import { useEffect, useState } from 'react'

export function OracleStatus({ 
  lastUpdated,
  maxStaleness
}: {
  lastUpdated: number
  maxStaleness: number
}) {
  const [status, setStatus] = useState<'fresh' | 'stale' | 'critical'>('fresh')
  const [timeSinceUpdate, setTimeSinceUpdate] = useState(0)

  useEffect(() => {
    const updateStatus = () => {
      const now = Math.floor(Date.now() / 1000)
      const secondsSinceUpdate = now - lastUpdated
      setTimeSinceUpdate(secondsSinceUpdate)

      if (secondsSinceUpdate > maxStaleness * 1.5) {
        setStatus('critical')
      } else if (secondsSinceUpdate > maxStaleness) {
        setStatus('stale')
      } else {
        setStatus('fresh')
      }
    }

    updateStatus()
    const interval = setInterval(updateStatus, 5000)
    return () => clearInterval(interval)
  }, [lastUpdated, maxStaleness])

  const statusColors = {
    fresh: 'bg-green-500',
    stale: 'bg-yellow-500',
    critical: 'bg-red-500'
  }

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s ago`
    if (seconds < 3600) return `${Math.floor(seconds/60)}m ago`
    return `${Math.floor(seconds/3600)}h ago`
  }

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h4 className="text-sm font-medium text-gray-300 mb-2">Oracle Status</h4>
      <div className="flex items-center space-x-4">
        <div className={`w-3 h-3 rounded-full ${statusColors[status]}`} />
        <div>
          <p className="text-white font-medium capitalize">{status}</p>
          <p className="text-gray-400 text-sm">
            Last updated: {formatTime(timeSinceUpdate)}
          </p>
        </div>
      </div>
      <div className="mt-4">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Fresh</span>
          <span>Stale</span>
          <span>Critical</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${statusColors[status]}`}
            style={{ width: `${Math.min(100, (timeSinceUpdate/maxStaleness)*100)}%` }}
          />
        </div>
      </div>
    </div>
  )
}
