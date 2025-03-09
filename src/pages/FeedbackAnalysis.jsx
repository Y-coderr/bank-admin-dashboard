"use client"

import { useState } from "react"
import { runFeedbackAnalysis, exportFeedbackReport } from "../services/api"

const FeedbackAnalysis = () => {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleAction = async (action) => {
    try {
      setLoading(true)
      setError(null)

      if (action === "export") {
        await exportFeedbackReport()
        setResult("Report exported successfully!")
      } else if (action === "exit") {
        // Just a placeholder for the exit action
        setResult("Exiting analysis...")
      } else {
        const data = await runFeedbackAnalysis(action)
        setResult(data.result || "Action completed successfully")
      }
    } catch (err) {
      setError(err.message || "An error occurred while processing your request")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const actions = [
    { id: "load", label: "Load and Initialize Data", color: "blue" },
    { id: "sentiment", label: "Analyze Customer Sentiment", color: "green" },
    { id: "transaction", label: "Analyze Transaction Patterns", color: "purple" },
    { id: "resources", label: "Optimize Resources", color: "orange" },
    { id: "quality", label: "Predict Service Quality", color: "indigo" },
    { id: "report", label: "Generate Comprehensive Report", color: "pink" },
    { id: "export", label: "Export Data", color: "yellow" },
    { id: "exit", label: "Exit", color: "gray" },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Feedback Analysis</h1>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">ML Model Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={() => handleAction(action.id)}
              disabled={loading}
              className={`p-4 rounded-lg shadow-sm text-white font-medium transition-colors duration-150 bg-${action.color}-600 hover:bg-${action.color}-700 focus:outline-none focus:ring-2 focus:ring-${action.color}-500 focus:ring-offset-2 disabled:opacity-50`}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
          <p className="text-center mt-4 text-gray-600">Processing your request...</p>
        </div>
      )}

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

      {result && !loading && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Result</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
            {typeof result === "object" ? JSON.stringify(result, null, 2) : result}
          </pre>
        </div>
      )}
    </div>
  )
}

export default FeedbackAnalysis

