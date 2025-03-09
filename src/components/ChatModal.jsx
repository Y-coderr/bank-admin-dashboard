"use client"

import { Fragment, useState } from "react"
import { Dialog, Transition } from "@headlessui/react"
import { XMarkIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline"

const ChatModal = ({ isOpen, onClose, query }) => {
  const [message, setMessage] = useState("")
  const [chatHistory, setChatHistory] = useState([
    {
      sender: "system",
      message: `You are now chatting about query #${query.id}: ${query.subject}`,
      timestamp: new Date(),
    },
  ])

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!message.trim()) return

    // Add user message to chat
    setChatHistory([
      ...chatHistory,
      {
        sender: "admin",
        message: message.trim(),
        timestamp: new Date(),
      },
    ])

    // Clear input
    setMessage("")

    // Simulate response (in a real app, this would come from your blockchain chat app)
    setTimeout(() => {
      setChatHistory((prev) => [
        ...prev,
        {
          sender: "system",
          message:
            "This message would be handled by your blockchain chat app. For now, this is a placeholder response.",
          timestamp: new Date(),
        },
      ])
    }, 1000)
  }

  return (
    <Transition appear 
    show={isOpen || true} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all h-[80vh] flex flex-col">
                <div className="flex justify-between items-start">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    Resolve Query #{query.id}
                  </Dialog.Title>
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="mt-4 flex-1 overflow-y-auto bg-gray-50 rounded-lg p-4">
                  {chatHistory.map((chat, index) => (
                    <div key={index} className={`mb-4 ${chat.sender === "admin" ? "text-right" : "text-left"}`}>
                      <div
                        className={`inline-block rounded-lg px-4 py-2 max-w-xs sm:max-w-md ${
                          chat.sender === "admin" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"
                        }`}
                      >
                        <p className="text-sm">{chat.message}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{chat.timestamp.toLocaleTimeString()}</p>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendMessage} className="mt-4 flex">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="flex-1 rounded-l-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Type your message..."
                  />
                  <button
                    type="submit"
                    className="rounded-r-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <PaperAirplaneIcon className="h-5 w-5" />
                  </button>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

export default ChatModal

