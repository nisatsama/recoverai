import { NavLink } from "react-router-dom";
import logo from "../assets/logo.svg";

import {
  LayoutDashboard,
  CreditCard,
  Brain,
  Users,
  BarChart3,
  FileText,
  ClipboardCheck,
  Plug,
  Settings,
  UserCircle,
} from "lucide-react";

const Sidebar = () => {
  const menuItems = [
    {
      name: "Overview",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Transactions",
      path: "/transactions",
      icon: CreditCard,
    },
    {
      name: "AI Decisions",
      path: "/aiDecisions",
      icon: Brain,
    },
    {
      name: "Customers",
      path: "/customers",
      icon: Users,
    },
    {
      name: "Analytics",
      path: "/analytics",
      icon: BarChart3,
    },
    {
      name: "Policies",
      path: "/policies",
      icon: FileText,
    },
    {
      name: "Audit Trail",
      path: "/audit",
      icon: ClipboardCheck,
    },
    {
      name: "Integrations",
      path: "/integrations",
      icon: Plug,
    },
    {
      name: "Settings",
      path: "/settings",
      icon: Settings,
    },
  ];

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col border-r border-slate-200 bg-white">
      {/* Logo */}
      <div className="flex h-20 items-center border-b border-slate-200 px-6">
        <img src={logo} alt="RecoverAI" className="h-9 w-auto" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Main Menu
        </p>

        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={19}
                      strokeWidth={isActive ? 2.3 : 2}
                      className="shrink-0"
                    />

                    <span>{item.name}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Profile */}
      <div className="border-t border-slate-200 p-4">
        <button className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-slate-100">
          {/* Profile Icon */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-200">
            <UserCircle size={25} className="text-slate-600" />
          </div>

          {/* User Info */}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-900">
              User
            </p>

            <p className="truncate text-xs text-slate-500">user@example.com</p>
          </div>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
