const express = require("express");
require("dotenv").config();

const passport = require("./config/passport");

const transactionRoutes = require("./routes/transactionRoutes");
const authRoutes = require("./routes/authRoutes");
const aiDecisionRoutes = require("./routes/aiDecisionRoutes");
const recoveryRoutes = require("./routes/recoveryRoutes");
const policyRoutes = require("./routes/policyroutes");
const auditRoutes = require("./routes/auditRoutes");

const authMiddleware = require("./middleware/authMiddleware");

const app = express();

// Middleware
app.use(express.json());
app.use(passport.initialize());

// Routes
app.use("/api/auth", authRoutes);

app.use("/api/transactions", authMiddleware, transactionRoutes);

app.use("/api/audit", authMiddleware, auditRoutes);

app.use("/api/recovery", authMiddleware, recoveryRoutes);

app.use("/api/policy", policyRoutes);

app.use("/api/ai", aiDecisionRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("Hello World");
});

// Server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
