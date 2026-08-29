const express = require("express");
require("dotenv").config();
const app = express();
const transactionRoutes = require("./routes/transactionRoutes");
const authRoutes = require("./routes/authRoutes");
const aiDecisionRoutes = require("./routes/aiDecisionRoutes");
const recoveryRoutes = require("./routes/recoveryRoutes");
const policyRoutes = require("./routes/policyroutes");
const auditRoutes = require("./routes/auditRoutes");
const authMiddleware = require("./middleware/authMiddleware");
app.use(express.json());
app.use("/api/audit", authMiddleware, auditRoutes);
app.use("/api/policy", policyRoutes);

app.use("/api/recovery", authMiddleware, recoveryRoutes);
app.use("/api/ai", aiDecisionRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/transactions", authMiddleware, transactionRoutes);
app.get("/", (req, res) => {
  res.send("Hello World");
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
