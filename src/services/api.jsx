// Base URL for your local server
const API_BASE_URL = "http://localhost:5000/api"

// Helper function for making API requests
const fetchWithAuth = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`

  // Add authorization if needed
  const user = JSON.parse(localStorage.getItem("bankAdminUser") || "{}")
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  }

  if (user && user.token) {
    headers["Authorization"] = `Bearer ${user.token}`
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Something went wrong")
  }

  return response.json()
}

// API functions
export const fetchQueries = async (role) => {
  return fetchWithAuth(`/queries?role=${role}`)
}

export const resolveQuery = async (queryId) => {
  return fetchWithAuth(`/queries/${queryId}/resolve`, {
    method: "PUT",
  })
}

export const deleteQuery = async (queryId) => {
  return fetchWithAuth(`/queries/${queryId}`, {
    method: "DELETE",
  })
}

export const fetchFeedbackData = async () => {
  return fetchWithAuth("/feedback")
}

export const runFeedbackAnalysis = async (action, params = {}) => {
  return fetchWithAuth("/feedback/analyze", {
    method: "POST",
    body: JSON.stringify({ action, ...params }),
  })
}

export const exportFeedbackReport = async () => {
  const response = await fetch(`${API_BASE_URL}/feedback/export`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error("Failed to export report")
  }

  const blob = await response.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "feedback_report.pdf"
  document.body.appendChild(a)
  a.click()
  a.remove()
}

