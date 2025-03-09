"use client"

import { Bars3Icon } from "@heroicons/react/24/outline"

const Header = ({ sidebarOpen, setSidebarOpen, currentUser }) => {
  const getRoleName = (role) => {
    const roles = {
      bank_manager: "Bank Manager",
      customer_service: "Customer Service",
      loans_credit: "Loans & Credit Department",
      accounts_deposits: "Accounts & Deposits Department",
      transactions_payments: "Transactions & Payments Department",
      cards: "Credit & Debit Card Department",
      digital_banking: "Digital Banking & IT Support",
      fraud_dispute: "Fraud & Dispute Resolution Department",
      investment: "Investment & Wealth Management Department",
    }
    return roles[role] || role
  }

  return (
    <header className="sticky top-0 z-10 bg-white shadow-sm">
      <div className="flex items-center justify-between h-16 px-6">
        <button
          className="p-1 text-gray-500 focus:outline-none focus:ring md:hidden"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Bars3Icon className="w-6 h-6" />
        </button>

        <div className="flex items-center">
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">{currentUser?.email}</p>
            <p className="text-xs font-medium text-gray-500">{getRoleName(currentUser?.role)}</p>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header

