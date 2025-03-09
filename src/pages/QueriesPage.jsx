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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Eye, CheckCircle, Diamond, Award, Medal, Star, Trash2, Search, Filter } from "lucide-react"

// Import the API service
import { queriesApi } from "../services/api"

// Import the ChatInterface component
import ChatInterface from "../components/ChatInterface"

// Mock data for queries - same as in HomePage
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

  for (let i = 1; i <= 30; i++) {
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
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 14 * 24 * 60 * 60 * 1000)).toISOString(),
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

const QueriesPage = ({ userRole }) => {
  const [queries, setQueries] = useState([])
  const [filteredQueries, setFilteredQueries] = useState([])
  const [selectedQuery, setSelectedQuery] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const { toast } = useToast()

  // Add this to the existing state variables in QueriesPage component
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [selectedChatQuery, setSelectedChatQuery] = useState(null)

  // Replace the useEffect that fetches queries with this:
  useEffect(() => {
    // Fetch queries from API
    const fetchQueries = async () => {
      setIsLoading(true)
      try {
        // Get all queries from API
        const data = await queriesApi.getAllQueries(userRole)

        // Sort by priority
        const priorityOrder = { diamond: 0, platinum: 1, gold: 2, silver: 3 }
        const sortedData = [...data].sort((a, b) => {
          return priorityOrder[a.priority] - priorityOrder[b.priority]
        })

        setQueries(sortedData)
        setFilteredQueries(sortedData)
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

  useEffect(() => {
    // Apply filters
    let result = [...queries]

    if (searchTerm) {
      result = result.filter(
        (query) =>
          query.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          query.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          query.id.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      result = result.filter((query) => query.status === statusFilter)
    }

    if (priorityFilter !== "all") {
      result = result.filter((query) => query.priority === priorityFilter)
    }

    setFilteredQueries(result)
  }, [queries, searchTerm, statusFilter, priorityFilter])

  const handleViewQuery = (query) => {
    setSelectedQuery(query)
  }

  // Replace the handleResolveQuery function with this:
  const handleResolveQuery = async (queryId) => {
    try {
      // Find the query
      const query = queries.find((q) => q.id === queryId)

      if (query.status !== "resolved") {
        // Open chat with this query
        setSelectedChatQuery(query)
        setIsChatOpen(true)

        // Update query status to in-progress if it's new
        if (query.status === "new") {
          await queriesApi.updateQueryStatus(queryId, "in-progress")
        }

        toast({
          title: "Chat Opened",
          description: `Opening chat for ticket ${queryId}`,
        })
      } else {
        toast({
          title: "Query Already Resolved",
          description: `Ticket ${queryId} is already resolved.`,
        })
      }
    } catch (error) {
      console.error("Error resolving query:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to open chat. Please try again.",
      })
    }
  }

  // Replace the handleDeleteQuery function with this:
  const handleDeleteQuery = async (queryId) => {
    try {
      await queriesApi.deleteQuery(queryId)

      // Update local state
      setQueries((prevQueries) => prevQueries.filter((query) => query.id !== queryId))

      toast({
        title: "Query Deleted",
        description: `Ticket ${queryId} has been deleted.`,
      })
    } catch (error) {
      console.error("Error deleting query:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete query. Please try again.",
      })
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
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
          <h1 className="text-3xl font-bold tracking-tight">All Queries</h1>
          <p className="text-muted-foreground">Manage and resolve customer queries.</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by ticket ID, subject, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Diamond className="h-4 w-4 text-muted-foreground" />
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="diamond">Diamond</SelectItem>
                    <SelectItem value="platinum">Platinum</SelectItem>
                    <SelectItem value="gold">Gold</SelectItem>
                    <SelectItem value="silver">Silver</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(9)].map((_, index) => (
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
      ) : filteredQueries.length > 0 ? (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredQueries.map((query) => (
            <motion.div key={query.id} variants={itemVariants}>
              <Card className="h-full flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{query.subject}</CardTitle>
                    <PriorityIcon priority={query.priority} />
                  </div>
                  <CardDescription className="flex items-center justify-between">
                    <span>Ticket ID: {query.id}</span>
                    <Badge
                      variant={
                        query.status === "new" ? "default" : query.status === "in-progress" ? "secondary" : "outline"
                      }
                      className="capitalize"
                    >
                      {query.status}
                    </Badge>
                  </CardDescription>
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
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => handleViewQuery(query)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
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

                    <Button variant="destructive" size="sm" onClick={() => handleDeleteQuery(query.id)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>

                  {query.status !== "resolved" ? (
                    <Button size="sm" onClick={() => handleResolveQuery(query.id)}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Resolve
                    </Button>
                  ) : (
                    <Badge variant="outline" className="px-3 py-1">
                      Resolved
                    </Badge>
                  )}
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="rounded-full bg-primary/10 p-4 mb-4">
              <Search className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-center">No Queries Found</h3>
            <p className="text-center text-muted-foreground mt-2">
              No queries match your current filters. Try adjusting your search criteria.
            </p>
            <Button
              className="mt-4"
              onClick={() => {
                setSearchTerm("")
                setStatusFilter("all")
                setPriorityFilter("all")
              }}
            >
              Reset Filters
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

export default QueriesPage

