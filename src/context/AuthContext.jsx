"use client"

import { createContext, useState, useContext, useEffect } from "react"

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const user = localStorage.getItem("bankAdminUser")
    if (user) {
      setCurrentUser(JSON.parse(user))
    }
    setLoading(false)
  }, [])

  const login = (email, password, role) => {
    // For demo purposes, we're using hardcoded credentials
    if (email === "ideahackthon@gmail.com" && password === "startrek@123") {
      const user = { email, role }
      localStorage.setItem("bankAdminUser", JSON.stringify(user))
      setCurrentUser(user)
      return true
    }
    return false
  }

  const logout = () => {
    localStorage.removeItem("bankAdminUser")
    setCurrentUser(null)
  }

  const value = {
    currentUser,
    login,
    logout,
    loading,
  }

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>
}

