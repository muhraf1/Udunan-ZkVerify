import { memo } from 'react'

const DashboardCard = ({ value, label, unit }) => {
  return (
    <div className="bg-slate-800/50 p-6 rounded-lg backdrop-blur-sm">
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-bold text-white">{value}</span>
        {unit && <span className="text-xl text-gray-300">{unit}</span>}
      </div>
      <p className="text-gray-400 mt-2">{label}</p>
    </div>
  )
}

export default memo(DashboardCard)