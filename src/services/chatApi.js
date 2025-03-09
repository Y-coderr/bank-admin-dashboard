import { supabase } from "./api"

// Chat API service
export const chatApi = {
  // Get messages for a specific query
  getMessages: async (queryId) => {
    try {
      // First check if we have messages in Supabase
      const { data: supabaseMessages, error: supabaseError } = await supabase
        .from("messages")
        .select("*")
        .eq("query_id", queryId)
        .order("timestamp", { ascending: true })

      if (supabaseError) throw supabaseError

      if (supabaseMessages && supabaseMessages.length > 0) {
        return supabaseMessages
      }

      // If no messages in Supabase, fetch from Aleph
      const response = await fetch(`/api/messages/${queryId}`)
      if (!response.ok) throw new Error("Failed to fetch messages from Aleph")

      const alephMessages = await response.json()

      // Store Aleph messages in Supabase for caching
      if (alephMessages && alephMessages.length > 0) {
        const { error } = await supabase.from("messages").insert(
          alephMessages.map((msg) => ({
            ...msg,
            query_id: queryId,
          })),
        )

        if (error) console.error("Error caching messages:", error)
      }

      return alephMessages
    } catch (error) {
      console.error("Error fetching messages:", error)
      throw error
    }
  },

  // Send a message
  sendMessage: async (queryId, message) => {
    try {
      // First store in Supabase
      const { data: supabaseData, error: supabaseError } = await supabase
        .from("messages")
        .insert({
          query_id: queryId,
          content: message.content,
          sender: message.sender,
          timestamp: message.timestamp,
        })
        .select()

      if (supabaseError) throw supabaseError

      // Then send to Aleph
      const response = await fetch(`/api/messages/${queryId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      })

      if (!response.ok) throw new Error("Failed to send message to Aleph")

      const alephData = await response.json()

      return supabaseData[0] || alephData
    } catch (error) {
      console.error("Error sending message:", error)
      throw error
    }
  },
}

