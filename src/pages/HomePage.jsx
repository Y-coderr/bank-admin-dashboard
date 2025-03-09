"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Eye, CheckCircle, Diamond, Award, Medal, Star } from "lucide-react"
import { useNavigate } from "react-router-dom"

// Import the API service
import { queriesApi } from "../services/api"

// Import the ChatInterface component
import ChatInterface from "../components/ChatInterface"

// Mock data for queries
const generateMockQueries = (role) => {
  const priorities = ["diamond", "platinum", "gold", "silver"]
  const departments = [
    "Customer Service",
    "Loans & Credit Department",
    "Accounts & Deposits Department",
    "Transactions & Payments Department",
    "Credit & Debit Card Department",
    "Digital Banking & IT Support",
    "Fraud & Dispute Resolution Department",
    "Investment & Wealth Management Department",
  ]

  const queryTypes = ["text", "audio", "video"]
  const statuses = ["new", "in-progress", "resolved"]

  const queries = []

  for (let i = 1; i <= 20; i++) {
    const priority = priorities[Math.floor(Math.random() * priorities.length)]
    const department = departments[Math.floor(Math.random() * departments.length)]
    const queryType = queryTypes[Math.floor(Math.random() * queryTypes.length)]
    const status = statuses[Math.floor(Math.random() * statuses.length)]

    queries.push({
      id: `TKT-${1000 + i}`,
      subject: `Query about ${["account balance", "transaction issue", "loan application", "card activation", "online banking"][Math.floor(Math.random() * 5)]}`,
      description: `This is a detailed description of the query #${i}. The customer is facing issues with their ${["account", "transaction", "loan", "card", "online banking"][Math.floor(Math.random() * 5)]}.`,
      priority,
      department,
      queryType,
      status,
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString(),
      content:
        queryType === "text"
          ? "I'm having trouble with my account. Can you please help me resolve this issue as soon as possible?"
          : queryType === "audio"
            ? "https://example.com/audio-sample.mp3"
            : "https://www.youtube.com/embed/dQw4w9WgXcQ",
    })
  }

  // Filter queries based on role if not Bank Manager
  if (role !== "Bank Manager") {
    return queries.filter((query) => query.department === role)
  }

  return queries
}

const PriorityIcon = ({ priority }) => {
  switch (priority) {
    case "diamond":
      return <Diamond className="h-5 w-5 text-blue-500" />
    case "platinum":
      return <Award className="h-5 w-5 text-gray-400" />
    case "gold":
      return <Medal className="h-5 w-5 text-yellow-500" />
    case "silver":
      return <Star className="h-5 w-5 text-gray-300" />
    default:
      return null
  }
}

const HomePage = ({ userRole }) => {
  const [queries, setQueries] = useState([])
  const [selectedQuery, setSelectedQuery] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const navigate = useNavigate()

  // Add this to the existing state variables in HomePage component
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [selectedChatQuery, setSelectedChatQuery] = useState(null)

  useEffect(() => {
    // Fetch queries from API
    const fetchQueries = async () => {
      setIsLoading(true)
      try {
        // Get new queries from API
        const data = await queriesApi.getNewQueries(userRole)

        // Sort by priority
        const priorityOrder = { diamond: 0, platinum: 1, gold: 2, silver: 3 }
        const sortedData = [...data].sort((a, b) => {
          return priorityOrder[a.priority] - priorityOrder[b.priority]
        })

        setQueries(sortedData)
      } catch (error) {
        console.error("Error fetching queries:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch queries. Please try again.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchQueries()
  }, [userRole, toast])

  const handleViewQuery = (query) => {
    setSelectedQuery(query)
  }

  // Update the handleResolveQuery function
  const handleResolveQuery = async (queryId) => {
    try {
      // Find the query
      const query = queries.find((q) => q.id === queryId)

      // Open chat with this query
      setSelectedChatQuery(query)
      setIsChatOpen(true)

      // Update query status to in-progress
      await queriesApi.updateQueryStatus(queryId, "in-progress")

      toast({
        title: "Chat Opened",
        description: `Opening chat for ticket ${queryId}`,
      })
    } catch (error) {
      console.error("Error resolving query:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to open chat. Please try again.",
      })
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {userRole}. Here are your new queries.</p>
        </div>

        <Card className="w-full md:w-auto">
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center space-x-2">
                <Diamond className="h-5 w-5 text-blue-500" />
                <span className="text-sm">Diamond</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-gray-400" />
                <span className="text-sm">Platinum</span>
              </div>
              <div className="flex items-center space-x-2">
                <Medal className="h-5 w-5 text-yellow-500" />
                <span className="text-sm">Gold</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-gray-300" />
                <span className="text-sm">Silver</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardHeader className="h-24 bg-gray-200 dark:bg-gray-700 rounded-t-lg" />
              <CardContent className="py-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : queries.length > 0 ? (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {queries.map((query) => (
            <motion.div key={query.id} variants={itemVariants}>
              <Card className="h-full flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{query.subject}</CardTitle>
                    <PriorityIcon priority={query.priority} />
                  </div>
                  <CardDescription>Ticket ID: {query.id}</CardDescription>
                </CardHeader>
                <CardContent className="py-2 flex-grow">
                  <p className="text-sm line-clamp-3">{query.description}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge variant="outline" className="capitalize">
                      {query.priority}
                    </Badge>
                    <Badge variant="secondary" className="capitalize">
                      {query.queryType}
                    </Badge>
                  </div>
                </CardContent>
                <CardFooter className="pt-2 flex justify-between">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => handleViewQuery(query)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Query
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>Query Details - {query.id}</DialogTitle>
                        <DialogDescription>
                          Priority: <Badge className="ml-1 capitalize">{query.priority}</Badge>
                        </DialogDescription>
                      </DialogHeader>

                      <div className="mt-4">
                        <h3 className="font-semibold text-lg">{query.subject}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Department: {query.department} • Created: {new Date(query.createdAt).toLocaleString()}
                        </p>

                        <div className="mt-4">
                          <Tabs defaultValue="content">
                            <TabsList>
                              <TabsTrigger value="content">Content</TabsTrigger>
                              <TabsTrigger value="details">Details</TabsTrigger>
                            </TabsList>

                            <TabsContent value="content" className="mt-4">
                              {query.queryType === "text" ? (
                                <div className="p-4 bg-muted rounded-lg">
                                  <p>{query.content}</p>
                                </div>
                              ) : query.queryType === "audio" ? (
                                <div className="p-4 bg-muted rounded-lg">
                                  <audio controls className="w-full">
                                    <source src={query.content} type="audio/mpeg" />
                                    Your browser does not support the audio element.
                                  </audio>
                                </div>
                              ) : (
                                <div className="aspect-video">
                                  <iframe
                                    src={query.content}
                                    className="w-full h-full rounded-lg"
                                    title="Video content"
                                    allowFullScreen
                                  ></iframe>
                                </div>
                              )}
                            </TabsContent>

                            <TabsContent value="details" className="mt-4">
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-medium">Description</h4>
                                  <p className="text-sm mt-1">{query.description}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-medium">Department</h4>
                                    <p className="text-sm mt-1">{query.department}</p>
                                  </div>
                                  <div>
                                    <h4 className="font-medium">Status</h4>
                                    <p className="text-sm mt-1 capitalize">{query.status}</p>
                                  </div>
                                  <div>
                                    <h4 className="font-medium">Created At</h4>
                                    <p className="text-sm mt-1">{new Date(query.createdAt).toLocaleString()}</p>
                                  </div>
                                  <div>
                                    <h4 className="font-medium">Query Type</h4>
                                    <p className="text-sm mt-1 capitalize">{query.queryType}</p>
                                  </div>
                                </div>
                              </div>
                            </TabsContent>
                          </Tabs>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 mt-4">
                        <DialogClose asChild>
                          <Button variant="outline">Close</Button>
                        </DialogClose>
                        <Button onClick={() => handleResolveQuery(query.id)}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Resolve Query
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button size="sm" onClick={() => handleResolveQuery(query.id)}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Resolve Query
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="rounded-full bg-primary/10 p-4 mb-4">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-center">All Caught Up!</h3>
            <p className="text-center text-muted-foreground mt-2">
              There are no new queries at the moment. Check back later or view all queries.
            </p>
            <Button className="mt-4" onClick={() => navigate("/queries")}>
              View All Queries
            </Button>
          </CardContent>
        </Card>
      )}
      {isChatOpen && selectedChatQuery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-3xl h-[80vh]">
            <ChatInterface query={selectedChatQuery} onClose={() => setIsChatOpen(false)} />
          </div>
        </div>
      )}
    </div>
  )
}

export default HomePage

