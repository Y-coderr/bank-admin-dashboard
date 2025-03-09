// Base URL for your server
const API_BASE_URL = "http://localhost:5000/api"

import { query } from '@/lib/db';

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
  console.log("DATA : ")
  console.log(response.json())

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Something went wrong")
  }

  return response.json()
}

// Database query function
const executeQuery = async (sqlQuery, params = []) => {
  try {
    // Use the imported query function instead of trying to access pool directly
    const rows = await query(sqlQuery, params);
    return rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// API functions with SQL queries
export const fetchQueries = async (role) => {
  const sqlQuery = `
    SELECT q.*, c.name as customer_name 
    FROM servicetickets q
    JOIN customers c ON q.customer_id = c.customer_id
    WHERE $1 = 'admin' OR 
          ($1 = 'employee' AND q.department_id IN (
            SELECT department_id FROM bankemployees 
            WHERE email = (SELECT email FROM current_user_info())
          ))
    ORDER BY q.created_at DESC
  `
  return executeQuery(sqlQuery, [role])
}

export const resolveQuery = async (queryId) => {
  const sqlQuery = `
    UPDATE servicetickets 
    SET status = 'resolved', 
        resolved_at = CURRENT_TIMESTAMP
    WHERE ticket_id = $1 
    RETURNING *
  `
  return executeQuery(sqlQuery, [queryId])
}

export const deleteQuery = async (queryId) => {
  const sqlQuery = `
    DELETE FROM servicetickets 
    WHERE ticket_id = $1 
    RETURNING *
  `
  return executeQuery(sqlQuery, [queryId])
}

export const fetchFeedbackData = async () => {
  const sqlQuery = `
    SELECT f.*, c.name as customer_name
    FROM feedback f
    JOIN customers c ON f.customer_id = c.customer_id
    ORDER BY f.created_at DESC
  `
  return executeQuery(sqlQuery)
}

export const fetchCustomerTransactions = async (customerId) => {
  const sqlQuery = `
    SELECT * FROM transactions
    WHERE customer_id = $1
    ORDER BY transaction_date DESC
  `
  return executeQuery(sqlQuery, [customerId])
}

export const fetchCustomerDetails = async (customerId) => {
  const sqlQuery = `
    SELECT c.*, 
           e.name as relationship_manager_name,
           e.email as relationship_manager_email
    FROM customers c
    LEFT JOIN bankemployees e ON c.relationship_manager = e.employee_id
    WHERE c.customer_id = $1
  `
  return executeQuery(sqlQuery, [customerId])
}

export const fetchEmployees = async () => {
  const sqlQuery = `
    SELECT e.*, d.department_name
    FROM bankemployees e
    JOIN departments d ON e.department_id = d.department_id
    ORDER BY e.name
  `
  return executeQuery(sqlQuery)
}

export const runFeedbackAnalysis = async (action, params = {}) => {
  // Define the SQL for different analysis actions
  let sqlQuery
  
  switch (action) {
    case 'sentiment':
      sqlQuery = `
        SELECT 
          AVG(rating) as average_rating,
          COUNT(*) FILTER (WHERE rating >= 4) as positive_count,
          COUNT(*) FILTER (WHERE rating <= 2) as negative_count,
          COUNT(*) as total_count
        FROM feedback
      `
      return executeQuery(sqlQuery)
      
    case 'trend':
      sqlQuery = `
        SELECT 
          DATE_TRUNC('month', created_at) as month,
          AVG(rating) as average_rating,
          COUNT(*) as count
        FROM feedback
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY month
      `
      return executeQuery(sqlQuery)
      
    case 'byCategory':
      sqlQuery = `
        SELECT 
          category,
          AVG(rating) as average_rating,
          COUNT(*) as count
        FROM feedback
        GROUP BY category
        ORDER BY average_rating DESC
      `
      return executeQuery(sqlQuery)
      
    default:
      throw new Error('Invalid analysis action')
  }
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

// New functions for additional data needs

export const fetchHighValueCustomers = async () => {
  const sqlQuery = `
    SELECT c.*, 
           e.name as relationship_manager_name
    FROM customers c
    LEFT JOIN bankemployees e ON c.relationship_manager = e.employee_id
    WHERE c.bank_balance > 1000000 OR c.cibil_score > 800
    ORDER BY c.bank_balance DESC
  `
  return executeQuery(sqlQuery)
}

export const fetchRecentTransactions = async (limit = 20) => {
  const sqlQuery = `
    SELECT t.*, c.name as customer_name
    FROM transactions t
    JOIN customers c ON t.customer_id = c.customer_id
    ORDER BY t.transaction_date DESC
    LIMIT $1
  `
  return executeQuery(sqlQuery, [limit])
}

export const fetchTransactionSummary = async (customerId, startDate, endDate) => {
  const sqlQuery = `
    SELECT 
      SUM(CASE WHEN transaction_type = 'Credit' THEN CAST(amount AS DECIMAL) ELSE 0 END) as total_credits,
      SUM(CASE WHEN transaction_type = 'Debit' THEN CAST(amount AS DECIMAL) ELSE 0 END) as total_debits,
      COUNT(*) as transaction_count
    FROM transactions
    WHERE customer_id = $1
      AND transaction_date BETWEEN $2 AND $3
  `
  return executeQuery(sqlQuery, [customerId, startDate, endDate])
}

export const adminLogin = async (email, password) => {
  // In a real app, you'd handle authentication properly
  // This is just an example for demonstration
  const sqlQuery = `
    SELECT admin_id, name, email 
    FROM admins
    WHERE email = $1 AND password_hash = crypt($2, password_hash)
  `
  const results = await executeQuery(sqlQuery, [email, password])
  
  if (results.length === 0) {
    throw new Error('Invalid credentials')
  }
  
  // Generate token logic would go here in a real app
  return {
    ...results[0],
    token: 'sample-jwt-token'
  }
}