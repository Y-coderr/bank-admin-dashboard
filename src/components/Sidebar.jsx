"use client"

import { Link, useLocation } from "react-router-dom"
import {
  HomeIcon,
  QuestionMarkCircleIcon,
  ChatBubbleLeftRightIcon,
  ArrowLeftOnRectangleIcon,
} from "@heroicons/react/24/outline"

const Sidebar = ({ sidebarOpen, setSidebarOpen, handleLogout }) => {
  const location = useLocation()

  const navigation = [
    { name: "Home", href: "/", icon: HomeIcon },
    { name: "Queries", href: "/queries", icon: QuestionMarkCircleIcon },
    { name: "Feedback Analysis", href: "/feedback", icon: ChatBubbleLeftRightIcon },
  ]

  return (
    <div
      className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 transition-transform duration-300 ease-in-out fixed md:relative z-30 md:z-auto w-64 h-screen bg-blue-800 text-white`}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 border-b border-blue-700">
          <h1 className="text-xl font-bold">Bank Admin Portal</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`${
                location.pathname === item.href ? "bg-blue-700 text-white" : "text-blue-100 hover:bg-blue-700"
              } flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          ))}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-2 mt-5 text-sm font-medium text-blue-100 rounded-md hover:bg-blue-700 transition-colors duration-150"
          >
            <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-3" />
            Logout
          </button>
        </nav>
      </div>
    </div>
  )
}

export default Sidebar

