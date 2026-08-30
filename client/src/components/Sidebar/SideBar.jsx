// src/components/Sidebar.jsx
import "./Sidebar.css";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  CreditCard,
  RotateCcw,
  AlertTriangle,
  Users,
  Sparkles,
  GitBranch,
  Activity,
  Settings,
  CircleCheck,
} from "lucide-react";

const mainNavigation = [
  {
    label: "Overview",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    label: "Payments",
    icon: CreditCard,
    path: "/payments",
  },
  {
    label: "Recovery",
    icon: RotateCcw,
    path: "/recovery",
  },
  {
    label: "Failed Payments",
    icon: AlertTriangle,
    path: "/failed-payments",
  },
  {
    label: "Customers",
    icon: Users,
    path: "/customers",
  },
];

const intelligenceNavigation = [
  {
    label: "AI Insights",
    icon: Sparkles,
    path: "/insights",
  },
  {
    label: "Recovery Strategies",
    icon: GitBranch,
    path: "/strategies",
  },
];

const managementNavigation = [
  {
    label: "Activity Logs",
    icon: Activity,
    path: "/activity",
  },
  {
    label: "Settings",
    icon: Settings,
    path: "/settings",
  },
];

function NavigationSection({ title, items }) {
  return (
    <div className="sidebar-section">
      <p className="sidebar-section-title">{title}</p>

      <div className="sidebar-nav">
        {items.map(({ label, icon: Icon, path }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <Icon size={18} strokeWidth={1.8} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
}

export default function Sidebar() {
  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-brand">
        <div className="brand-icon">
          <Sparkles size={19} />
        </div>

        <div>
          <h1>RecoverAI</h1>
          <span>Revenue Recovery AI</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-content">
        <NavigationSection title="MAIN" items={mainNavigation} />

        <NavigationSection
          title="INTELLIGENCE"
          items={intelligenceNavigation}
        />

        <NavigationSection title="MANAGEMENT" items={managementNavigation} />
      </nav>

      {/* Bottom */}
      <div className="sidebar-bottom">
        {/* System Status */}
        <div className="system-status">
          <div className="status-icon">
            <CircleCheck size={15} />
          </div>

          <div>
            <p>AI Recovery Status</p>
            <span>System operational</span>
          </div>

          <span className="status-dot" />
        </div>

        {/* User */}
        <div className="sidebar-user">
          <div className="user-avatar">NS</div>

          <div className="user-info">
            <p>Nisat Sama</p>
            <span>Administrator</span>
          </div>

          <button className="user-menu">•••</button>
        </div>
      </div>
    </aside>
  );
}
