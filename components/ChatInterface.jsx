"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Send, Paperclip, Image, MoreVertical, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"

const ChatInterface = ({ query, onClose }) => {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const { toast } = useToast()

  // Fetch messages on component mount
  useEffect(() => {
    fetchMessages()
    // Set up polling for new messages
    const interval = setInterval(fetchMessages, 5000)
    return () => clearInterval(interval)
  }, [query.id])

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/messages/${query.id}`)
      if (!response.ok) throw new Error("Failed to fetch messages")
      const data = await response.json()
      setMessages(data)
    } catch (error) {
      console.error("Error fetching messages:", error)
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/messages/${query.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newMessage,
          sender: "admin",
          timestamp: new Date().toISOString(),
        }),
      })

      if (!response.ok) throw new Error("Failed to send message")

      // Add message to UI immediately for better UX
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content: newMessage,
          sender: "admin",
          timestamp: new Date().toISOString(),
        },
      ])

      setNewMessage("")
      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully.",
      })
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send message. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
    >
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" onClick={onClose} className="md:hidden">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Avatar>
            <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${query.subject}`} />
            <AvatarFallback>{query.subject.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">Ticket: {query.id}</h3>
            <p className="text-sm text-muted-foreground truncate max-w-[200px]">{query.subject}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="capitalize">
            {query.priority}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onClose}>Close Chat</DropdownMenuItem>
              <DropdownMenuItem>View Query Details</DropdownMenuItem>
              <DropdownMenuItem>Mark as Resolved</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <div className="bg-primary/10 p-3 rounded-full mb-3">
                <Send className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium">No messages yet</h3>
              <p className="text-sm text-muted-foreground mt-1">Start the conversation by sending a message.</p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === "admin" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender === "admin" ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.sender === "admin" ? "text-primary-foreground/70" : "text-muted-foreground"
                    }`}
                  >
                    {formatTimestamp(message.timestamp)}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Chat Input */}
      <div className="p-4 border-t">
        <form onSubmit={sendMessage} className="flex items-center space-x-2">
          <Button type="button" variant="ghost" size="icon" className="flex-shrink-0">
            <Paperclip className="h-5 w-5" />
          </Button>
          <Button type="button" variant="ghost" size="icon" className="flex-shrink-0">
            <Image className="h-5 w-5" />
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !newMessage.trim()} className="flex-shrink-0">
            <Send className="h-5 w-5 mr-2" />
            Send
          </Button>
        </form>
      </div>
    </motion.div>
  )
}

export default ChatInterface

