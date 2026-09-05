import { Routes, Route, Navigate } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Transactions from "./pages/Transactions";
//import TransactionDetails from "./pages/TransactionDetails";
import AiDecision from "./pages/AiDecision";
import AIDecisionDetails from "./pages/AiDecisionDetails";
import Analytics from "./pages/Analytics";
import Profile from "./pages/Profile";

function App() {
  return (
    <Routes>
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/dashboard" element={<Home />} />
      <Route path="/transactions" element={<Transactions />} />
      {/* <Route path="/transactions/:id" element={<TransactionsDetails />} /> */}
      <Route path="/ai-decisions" element={<AiDecision />} />
      <Route path="/ai-decisions/:id" element={<AIDecisionDetails />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  );
}
export default App;
