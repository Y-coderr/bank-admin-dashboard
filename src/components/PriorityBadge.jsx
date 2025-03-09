const PriorityBadge = ({ priority }) => {
  const getBadgeColor = (priority) => {
    switch (priority.toLowerCase()) {
      case "diamond":
        return "bg-purple-100 text-purple-800 border-purple-300"
      case "platinum":
        return "bg-gray-100 text-gray-800 border-gray-300"
      case "gold":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "silver":
        return "bg-blue-100 text-blue-800 border-blue-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const getSymbol = (priority) => {
    switch (priority.toLowerCase()) {
      case "diamond":
        return "💎"
      case "platinum":
        return "🏆"
      case "gold":
        return "🥇"
      case "silver":
        return "🥈"
      default:
        return "⭐"
    }
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getBadgeColor(priority)}`}
    >
      {getSymbol(priority)} {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  )
}

export default PriorityBadge

