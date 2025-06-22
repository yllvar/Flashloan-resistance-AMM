'use client'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

export function TwapTimeline({ prices }: { prices: number[] }) {
  const data = {
    labels: prices.map((_, i) => `${i * 5} min`),
    datasets: [
      {
        label: 'TWAP History',
        data: prices,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.1,
        fill: true
      }
    ]
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Price History',
      },
    },
    scales: {
      y: {
        beginAtZero: false
      }
    }
  }

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h4 className="text-sm font-medium text-gray-300 mb-2">TWAP Timeline</h4>
      <div className="h-64">
        <Line options={options} data={data} />
      </div>
    </div>
  )
}
