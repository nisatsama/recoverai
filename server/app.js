const express = require("express");
require("dotenv").config();
const app = express();
const transactionRoutes = "./routes/transactionRoutes";
const authRoutes = require("./routes/authRoutes");
const aiDecisionRoutes = require("./routes/aiDecision.routes");
const recoveryRoutes = require("./routes/recoveryRoutes");
const policyRoutes = require("./routes/policy.routes");
app.use(express.json());
app.use("/api/policy", policyRoutes);

app.use("/api/recovery", recoveryRoutes);
app.use("/api/ai", aiDecisionRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.get("/", (req, res) => {
  res.send("Hello World");
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
