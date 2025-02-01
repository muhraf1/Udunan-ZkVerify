import { memo } from 'react'

const TabButton = ({ tab, isActive, onClick }) => (
  <button
    onClick={() => onClick(tab)}
    className={`pb-4 px-2 text-lg transition-colors ${
      isActive
        ? 'text-white border-bt-2 border-white bg-transparent'
        : 'text-gray-400 hover:text-gray-300 bg-transparent'
    }`}
  >
    {tab}
  </button>
)

const DashboardTabs = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="flex gap-6 border-b border-slate-700/50 mb-8">
      {tabs.map((tab) => (
        <TabButton
          key={tab}
          tab={tab}
          isActive={activeTab === tab}
          onClick={onTabChange}
        />
      ))}
    </div>
  )
}

export default memo(DashboardTabs)