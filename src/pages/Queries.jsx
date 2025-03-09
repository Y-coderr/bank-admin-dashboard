"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { fetchQueries, resolveQuery, deleteQuery } from "../services/api"
import PriorityBadge from "../components/PriorityBadge"
import QueryModal from "../components/QueryModal"
import ChatModal from "../components/ChatModal"
import ConfirmModal from "../components/ConfirmModal"

const Queries = () => {
  const [queries, setQueries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedQuery, setSelectedQuery] = useState(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isChatModalOpen, setIsChatModalOpen] = useState(false)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
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

  const handleDeleteQuery = (query) => {
    setSelectedQuery(query)
    setIsConfirmModalOpen(true)
  }

  const confirmDeleteQuery = async () => {
    try {
      await deleteQuery(selectedQuery.id)
      setQueries(queries.filter((q) => q.id !== selectedQuery.id))
      setIsConfirmModalOpen(false)
    } catch (err) {
      console.error("Failed to delete query:", err)
      // Show error message
    }
  }

  const handleMarkAsResolved = async (query) => {
    try {
      await resolveQuery(query.id)
      setQueries(queries.map((q) => (q.id === query.id ? { ...q, status: "resolved" } : q)))
    } catch (err) {
      console.error("Failed to mark query as resolved:", err)
      // Show error message
    }
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
      <h1 className="text-2xl font-bold mb-6">All Queries</h1>

      {queries.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-500">No queries available.</p>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        query.status === "resolved" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {query.status === "resolved" ? "Resolved" : "Pending"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(query.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onClick={() => handleViewQuery(query)} className="text-blue-600 hover:text-blue-900 mr-2">
                      View
                    </button>
                    <button
                      onClick={() => handleResolveQuery(query)}
                      className="text-green-600 hover:text-green-900 mr-2"
                    >
                      Resolve
                    </button>
                    <button
                      onClick={() => handleMarkAsResolved(query)}
                      className="text-indigo-600 hover:text-indigo-900 mr-2"
                      disabled={query.status === "resolved"}
                    >
                      Mark Resolved
                    </button>
                    <button onClick={() => handleDeleteQuery(query)} className="text-red-600 hover:text-red-900">
                      Delete
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

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmDeleteQuery}
        title="Delete Query"
        message="Are you sure you want to delete this query? This action cannot be undone."
      />
    </div>
  )
}

export default Queries

