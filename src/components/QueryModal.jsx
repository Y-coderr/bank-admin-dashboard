"use client"

import { Fragment } from "react"
import { Dialog, Transition } from "@headlessui/react"
import { XMarkIcon } from "@heroicons/react/24/outline"
import PriorityBadge from "./PriorityBadge"

const QueryModal = ({ isOpen, onClose, query }) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
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
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-start">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    Query #{query.id}
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

                <div className="mt-4">
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500">Subject</h4>
                    <p className="mt-1 text-sm text-gray-900">{query.subject}</p>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500">Priority</h4>
                    <div className="mt-1">
                      <PriorityBadge priority={query.priority} />
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500">Department</h4>
                    <p className="mt-1 text-sm text-gray-900">{query.department}</p>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500">Status</h4>
                    <p className="mt-1 text-sm text-gray-900">{query.status}</p>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500">Date</h4>
                    <p className="mt-1 text-sm text-gray-900">{new Date(query.createdAt).toLocaleString()}</p>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500">Description</h4>
                    <p className="mt-1 text-sm text-gray-900">{query.description}</p>
                  </div>

                  {query.mediaType && query.mediaUrl && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-500">Media</h4>
                      <div className="mt-2">
                        {query.mediaType === "audio" && (
                          <audio controls className="w-full">
                            <source src={query.mediaUrl} type="audio/mpeg" />
                            Your browser does not support the audio element.
                          </audio>
                        )}
                        {query.mediaType === "video" && (
                          <div className="relative w-full">
                            <video controls className="w-full h-auto rounded-lg shadow-lg">
                              <source src={query.mediaUrl} type="video/mp4" />
                              Your browser does not support the video tag.
                            </video>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                </div>

                <div className="mt-6">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={onClose}
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

export default QueryModal

