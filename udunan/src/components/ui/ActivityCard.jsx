import { memo } from 'react'
import { User } from 'lucide-react'

const ActivityInfo = ({ author, date }) => (
  <div>
    <div className="flex items-center gap-2 text-gray-400">
      <User size={16} />
      <span>By {author}</span>
    </div>
    <p className="text-gray-400 mt-1">{date}</p>
  </div>
)

const ActionButton = ({ type }) => (
  <button
    className={`px-4 py-2 rounded-md w-fit ${
      type === 'Fundraise'
        ? 'bg-orange-600 hover:bg-orange-700'
        : 'bg-blue-600 hover:bg-blue-700'
    } text-white transition-colors`}
  >
    {type}
  </button>
)

const ActivityCard = ({ type, title, author, date, imageUrl }) => {
  return (
    <div className="flex gap-6 mb-6">
      <img
        src={imageUrl}
        alt={title}
        className="w-32 h-32 rounded-lg object-cover"
      />
      <div className="flex flex-col justify-between py-2">
        <div>
          <h3 className="text-xl text-white font-semibold mb-2">{title}</h3>
          <ActivityInfo author={author} date={date} />
        </div>
        <ActionButton type={type} />
      </div>
    </div>
  )
}

export default memo(ActivityCard)