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
  const [acceptDisabled, setAcceptDisabled] = useState(false)
  const [rejectDisabled, setRejectDisabled] = useState(false)
  const [resolution, setResolution] = useState(null) // To track which resolution was selected
  const { currentUser } = useAuth()

  useEffect(() => {
    const loadQueries = async () => {
      try {
        setLoading(true)
        // Simulated sample queries
        const sampleQueries = [
          { 
            id: 1, 
            subject: "Login Issue", 
            priority: "Diamond", 
            department: "IT", 
            status: "pending", 
            createdAt: new Date(),
            queryText: "I'm unable to login to my account after the recent update.",
            videoUrl: "https://example.com/support/videos/login-issue.mp4"
          },
          { 
            id: 2, 
            subject: "Payment Failure", 
            priority: "Gold", 
            department: "Finance", 
            status: "resolved", 
            createdAt: new Date(),
            queryText: "My payment was declined but the amount was deducted from my account.",
            videoUrl: "https://example.com/support/videos/payment-issue.mp4"
          },
          { 
            id: 3, 
            subject: "Bug in App", 
            priority: "Platinum", 
            department: "Development", 
            status: "pending", 
            createdAt: new Date(),
            queryText: "The app crashes when I try to upload files larger than 5MB.",
            videoUrl: "https://example.com/support/videos/app-bug.mp4"
          }
        ]
        
        const sortedQueries = sortQueriesByPriority(sampleQueries)
        setQueries(sortedQueries)
      } catch (err) {
        setError("Failed to load queries. Please try again later.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadQueries()
  }, [currentUser?.role])

  const sortQueriesByPriority = (queries) => {
    const priorityOrder = { diamond: 1, platinum: 2, gold: 3, silver: 4 }

    return [...queries].sort((a, b) => {
      return priorityOrder[a.priority.toLowerCase()] - priorityOrder[b.priority.toLowerCase()]
    })
  }

  const handleViewQuery = (query) => {
    setSelectedQuery(query)
    setIsViewModalOpen(true)
    // Reset buttons state when opening modal
    setAcceptDisabled(false)
    setRejectDisabled(false)
    setResolution(null)
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
    }
  }

  const handleMarkAsResolved = async (query) => {
    try {
      await resolveQuery(query.id)
      setQueries(queries.map((q) => (q.id === query.id ? { ...q, status: "resolved" } : q)))
    } catch (err) {
      console.error("Failed to mark query as resolved:", err)
    }
  }

  const handleAcceptQuery = () => {
    setAcceptDisabled(true)
    setRejectDisabled(true)
    setResolution("accept")
  }

  const handleRejectQuery = () => {
    setRejectDisabled(true)
    setAcceptDisabled(true)
    setResolution("reject")
  }

  const handleConnectToUser = () => {
    if (!resolution) {
      alert("Please accept or reject the query first")
      return
    }
    
    // Implementation for connecting to user with the selected resolution
    console.log(`Connecting to user with ${resolution} resolution for query #${selectedQuery.id}`)
    setIsChatModalOpen(true)
    setIsViewModalOpen(false)
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
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
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${query.status === "resolved" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>{query.status === "resolved" ? "Resolved" : "Pending"}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(query.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onClick={() => handleViewQuery(query)} className="text-blue-600 hover:text-blue-900 mr-2">View</button>
                    <button onClick={() => handleResolveQuery(query)} className="text-green-600 hover:text-green-900 mr-2">Resolve</button>
                    <button onClick={() => handleMarkAsResolved(query)} className="text-indigo-600 hover:text-indigo-900 mr-2" disabled={query.status === "resolved"}>Mark Resolved</button>
                    <button onClick={() => handleDeleteQuery(query)} className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* View Query Modal */}
      {isViewModalOpen && selectedQuery && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Query Details: {selectedQuery.subject}
                    </h3>
                    
                    {/* Video Player */}
                    <div className="mb-4 border rounded">
                      <div className="bg-gray-200 p-2 text-sm">Video Attachment</div>
                      <div className="p-4 h-48 flex items-center justify-center bg-gray-100">
                        <div className="text-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="mt-2">Video would play here</p>
                          <button className="mt-2 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
                            Play Video
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Query Text */}
                    <div className="mb-4">
                      <h4 className="text-md font-medium mb-2">Query Description:</h4>
                      <div className="p-3 bg-gray-50 rounded border text-sm">
                        {selectedQuery.queryText}
                      </div>
                    </div>
                    
                    {/* Additional Information */}
                    <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                      <div>
                        <span className="font-medium">Priority: </span>
                        <PriorityBadge priority={selectedQuery.priority} />
                      </div>
                      <div>
                        <span className="font-medium">Department: </span>
                        {selectedQuery.department}
                      </div>
                      <div>
                        <span className="font-medium">Status: </span>
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${selectedQuery.status === "resolved" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                          {selectedQuery.status === "resolved" ? "Resolved" : "Pending"}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Date: </span>
                        {new Date(selectedQuery.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    
                    {/* Accept/Reject Buttons UI */}
                    <div className="mt-6 flex items-center justify-center space-x-4">
                      <button
                        onClick={handleAcceptQuery}
                        disabled={acceptDisabled}
                        className={`inline-flex justify-center px-4 py-2 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm ${
                          acceptDisabled 
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                            : "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500"
                        }`}
                      >
                        Accept Query
                      </button>
                      
                      <button
                        onClick={handleRejectQuery}
                        disabled={rejectDisabled}
                        className={`inline-flex justify-center px-4 py-2 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm ${
                          rejectDisabled 
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                            : "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
                        }`}
                      >
                        Reject Query
                      </button>
                    </div>
                    
                    {/* Connect with User Button */}
                    <div className="mt-4 flex justify-center">
                      <button
                        onClick={handleConnectToUser}
                        className={`inline-flex justify-center w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm ${!resolution ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        Connect with User
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setIsViewModalOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {isChatModalOpen && selectedQuery && (
        <ChatModal
          query={selectedQuery}
          onClose={() => setIsChatModalOpen(false)}
          onResolve={() => {
            handleMarkAsResolved(selectedQuery)
            setIsChatModalOpen(false)
          }}
        />
      )}

      {/* Confirm Delete Modal */}
      {isConfirmModalOpen && selectedQuery && (
        <ConfirmModal
          title="Delete Query"
          message={`Are you sure you want to delete query #${selectedQuery.id}?`}
          onConfirm={confirmDeleteQuery}
          onCancel={() => setIsConfirmModalOpen(false)}
        />
      )}
    </div>
  )
}

export default Queries