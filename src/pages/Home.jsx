"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { fetchQueries } from "../services/api"
import PriorityBadge from "../components/PriorityBadge"
import QueryModal from "../components/QueryModal"
import ChatModal from "../components/ChatModal"

const Home = () => {
  const [queries, setQueries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedQuery, setSelectedQuery] = useState(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isChatModalOpen, setIsChatModalOpen] = useState(false)
  const { currentUser } = useAuth()

  useEffect(() => {
    const loadQueries = async () => {
      try {
        setLoading(true)
        const data = await fetchQueries(currentUser.role)

        // Sort queries by priority
        const sortedQueries = sortQueriesByPriority(data)
        setQueries(sortedQueries)
      } catch (err) {
        setError("Failed to load queries. Please try again later.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadQueries()
  }, [currentUser.role])

  const sortQueriesByPriority = (queries) => {
    const priorityOrder = { diamond: 1, platinum: 2, gold: 3, silver: 4 }

    return [...queries].sort((a, b) => {
      return priorityOrder[a.priority.toLowerCase()] - priorityOrder[b.priority.toLowerCase()]
    })
  }

  const handleViewQuery = (query) => {
    setSelectedQuery(query)
    setIsViewModalOpen(true)
  }

  const handleResolveQuery = (query) => {
    setSelectedQuery(query)
    setIsChatModalOpen(true)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">New Queries</h1>

      {queries.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-500">No new queries available.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ticket ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {queries.map((query) => (
                <tr key={query.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{query.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{query.subject}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <PriorityBadge priority={query.priority} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{query.department}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(query.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onClick={() => handleViewQuery(query)} className="text-blue-600 hover:text-blue-900 mr-3">
                      View Query
                    </button>
                    <button onClick={() => handleResolveQuery(query)} className="text-green-600 hover:text-green-900">
                      Resolve Query
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* View Query Modal */}
      {selectedQuery && (
        <QueryModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} query={selectedQuery} />
      )}

      {/* Chat Modal for Resolving Query */}
      {selectedQuery && (
        <ChatModal isOpen={isChatModalOpen} onClose={() => setIsChatModalOpen(false)} query={selectedQuery} />
      )}
    </div>
  )
}

export default Home

