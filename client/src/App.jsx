import { Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";

import Sidebar from "./components/Sidebar/SideBar";
import Dashboard from "./pages/Dashboard/Dashboard";

function Transactions() {
  return <div className="p-8">Transactions</div>;
}

function Recovery() {
  return <div className="p-8">Recovery</div>;
}

function AIDecisions() {
  return <div className="p-8">AI Decisions</div>;
}

function Analytics() {
  return <div className="p-8">Analytics</div>;
}

function Policies() {
  return <div className="p-8">Policies</div>;
}

function AuditLogs() {
  return <div className="p-8">Audit Logs</div>;
}

function Settings() {
  return <div className="p-8">Settings</div>;
}

export default function App() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#F0F8FF]">
      {/* Sidebar */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Content */}
      <main
        className={`
          min-h-screen
          transition-all
          duration-300
          ${collapsed ? "ml-[80px]" : "ml-[260px]"}
        `}
      >
        <Routes>
          {/* Default */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Transactions */}
          <Route path="/transactions" element={<Transactions />} />

          {/* Recovery */}
          <Route path="/recovery" element={<Recovery />} />

          {/* AI Decisions */}
          <Route path="/ai-decisions" element={<AIDecisions />} />

          {/* Analytics */}
          <Route path="/analytics" element={<Analytics />} />

          {/* Policies */}
          <Route path="/policies" element={<Policies />} />

          {/* Audit Logs */}
          <Route path="/audit-logs" element={<AuditLogs />} />

          {/* Settings */}
          <Route path="/settings" element={<Settings />} />

          {/* Optional: unknown route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}
