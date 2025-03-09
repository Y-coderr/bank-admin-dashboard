const express = require("express")
const mongoose = require("mongoose")
const passport = require("passport")
const LocalStrategy = require("passport-local").Strategy
const session = require("express-session")
const cors = require("cors")
const { Account } = require("aleph-js")
const axios = require("axios")
const path = require("path")
require("dotenv").config()

const app = express()
const PORT = process.env.PORT || 5001

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
  }),
)
app.use(passport.initialize())
app.use(passport.session())

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/AlephChat", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB")
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err)
  })

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  privateKey: String,
  publicKey: String,
  mnemonics: String,
  address: String,
})

userSchema.plugin(require("passport-local-mongoose"))
const User = mongoose.model("User", userSchema)

// Message Schema
const messageSchema = new mongoose.Schema({
  queryId: { type: String, required: true },
  content: { type: String, required: true },
  sender: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
})

const Message = mongoose.model("Message", messageSchema)

// Configure Passport
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

// Middleware to check if user is authenticated
const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next()
  }
  res.status(401).json({ error: "Not authenticated" })
}

// Routes
app.get("/api/messages/:room", async (req, res) => {
  try {
    const { room } = req.params

    // First check MongoDB for cached messages
    const cachedMessages = await Message.find({ queryId: room }).sort({ timestamp: 1 }).lean()

    if (cachedMessages.length > 0) {
      return res.json(cachedMessages)
    }

    // If no cached messages, fetch from Aleph
    const response = await axios.get("https://api2.aleph.im/api/v0/messages", {
      params: {
        channel: "BANKADMIN",
        tags: `room:${room}`,
      },
    })

    const messages = response.data.messages.map((msg) => ({
      id: msg.item_hash,
      queryId: room,
      content: msg.content.body,
      sender: msg.sender,
      timestamp: new Date(msg.time * 1000),
    }))

    // Cache messages in MongoDB
    if (messages.length > 0) {
      await Message.insertMany(messages)
    }

    res.json(messages)
  } catch (error) {
    console.error("Error fetching messages:", error)
    res.status(500).json({ error: "Failed to fetch messages" })
  }
})

app.post("/api/messages/:room", async (req, res) => {
  try {
    const { room } = req.params
    const { content, sender, timestamp } = req.body

    // Get user from database
    const user = await User.findOne({ username: sender })
    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    // Create Aleph account from user's private key
    const account = new Account({
      privateKey: user.privateKey,
    })

    // Post message to Aleph
    const alephMessage = await account.post({
      channel: "BANKADMIN",
      tags: [`room:${room}`],
      content: {
        type: "chat",
        body: content,
      },
    })

    // Save message to MongoDB
    const message = new Message({
      queryId: room,
      content,
      sender,
      timestamp: new Date(timestamp),
    })

    await message.save()

    res.json({
      id: alephMessage.item_hash,
      queryId: room,
      content,
      sender,
      timestamp,
    })
  } catch (error) {
    console.error("Error sending message:", error)
    res.status(500).json({ error: "Failed to send message" })
  }
})

// User registration
app.post("/api/register", async (req, res) => {
  try {
    const { username, password } = req.body

    // Create new Ethereum account
    const account = Account.create()

    // Register user
    const user = new User({
      username,
      privateKey: account.privateKey,
      publicKey: account.publicKey,
      mnemonics: account.mnemonics,
      address: account.address,
    })

    await User.register(user, password)

    res.json({ success: true, username })
  } catch (error) {
    console.error("Error registering user:", error)
    res.status(500).json({ error: "Failed to register user" })
  }
})

// User login
app.post("/api/login", passport.authenticate("local"), (req, res) => {
  res.json({ success: true, user: req.user.username })
})

// User logout
app.get("/api/logout", (req, res) => {
  req.logout()
  res.json({ success: true })
})

// Get user info
app.get("/api/users/:username", isLoggedIn, async (req, res) => {
  try {
    const { username } = req.params
    const user = await User.findOne({ username }).lean()

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    // Don't send sensitive information
    delete user.privateKey
    delete user.mnemonics

    res.json(user)
  } catch (error) {
    console.error("Error fetching user:", error)
    res.status(500).json({ error: "Failed to fetch user" })
  }
})

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../dist")))

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../dist/index.html"))
  })
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

