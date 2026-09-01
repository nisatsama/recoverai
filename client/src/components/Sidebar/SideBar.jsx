import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  CreditCard,
  RotateCcw,
  BrainCircuit,
  BarChart3,
  ShieldCheck,
  ClipboardList,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  WalletCards,
  CircleDollarSign,
} from "lucide-react";

const navigation = [
  {
    section: "MAIN",
    items: [
      {
        name: "Dashboard",
        path: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        name: "Transactions",
        path: "/transactions",
        icon: CreditCard,
      },
      {
        name: "Recovery",
        path: "/recovery",
        icon: RotateCcw,
      },
    ],
  },
  {
    section: "INTELLIGENCE",
    items: [
      {
        name: "AI Decisions",
        path: "/ai-decisions",
        icon: BrainCircuit,
      },
      {
        name: "Analytics",
        path: "/analytics",
        icon: BarChart3,
      },
    ],
  },
  {
    section: "CONTROL",
    items: [
      {
        name: "Policies",
        path: "/policies",
        icon: ShieldCheck,
      },
      {
        name: "Audit Logs",
        path: "/audit-logs",
        icon: ClipboardList,
      },
    ],
  },
];

const bottomNavigation = [
  {
    name: "Settings",
    path: "/settings",
    icon: Settings,
  },
];

export default function Sidebar({ collapsed, setCollapsed }) {
  return (
    <aside
      className={`
        fixed
        left-0
        top-0
        z-50
        h-screen
        bg-white
        border-r
        border-[#DCEBFA]
        flex
        flex-col
        transition-all
        duration-300
        ease-in-out
        ${collapsed ? "w-[80px]" : "w-[260px]"}
      `}
    >
      {/* ================= LOGO ================= */}
      <div
        className={`
          h-[76px]
          flex
          items-center
          border-b
          border-[#E5F0FA]
          ${collapsed ? "justify-center" : "px-6"}
        `}
      >
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div
            className="
              w-10
              h-10
              rounded-xl
              bg-gradient-to-br
              from-[#468FEA]
              to-[#0000B8]
              flex
              items-center
              justify-center
              shadow-md
              shadow-[#468FEA]/20
            "
          >
            <CircleDollarSign
              size={23}
              strokeWidth={2.2}
              className="text-white"
            />
          </div>

          {/* Brand */}
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-[19px] font-bold text-[#16166B] tracking-tight">
                RecoverAI
              </span>

              <span className="text-[10px] font-medium text-[#468FEA] uppercase tracking-[0.16em]">
                Revenue Recovery
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ================= NAVIGATION ================= */}
      <nav className="flex-1 overflow-y-auto px-3 py-5">
        {navigation.map((group) => (
          <div key={group.section} className="mb-6">
            {!collapsed && (
              <p className="px-3 mb-2 text-[10px] font-bold tracking-[0.14em] text-[#8AA8C7]">
                {group.section}
              </p>
            )}

            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    title={collapsed ? item.name : ""}
                    className={({ isActive }) =>
                      `
                      group
                      relative
                      flex
                      items-center
                      gap-3
                      rounded-xl
                      px-3
                      py-3
                      text-sm
                      font-medium
                      transition-all
                      duration-200
                      ${
                        isActive
                          ? `
                            bg-[#F0F8FF]
                            text-[#0000B8]
                            shadow-sm
                          `
                          : `
                            text-[#536B87]
                            hover:bg-[#F0F8FF]
                            hover:text-[#16166B]
                          `
                      }
                      ${collapsed ? "justify-center" : ""}
                    `
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {/* Active indicator */}
                        {isActive && (
                          <span
                            className="
                              absolute
                              left-0
                              top-1/2
                              -translate-y-1/2
                              w-[3px]
                              h-7
                              rounded-r-full
                              bg-[#468FEA]
                            "
                          />
                        )}

                        <Icon
                          size={19}
                          strokeWidth={isActive ? 2.3 : 1.9}
                          className={`
                            flex-shrink-0
                            ${
                              isActive
                                ? "text-[#468FEA]"
                                : "text-[#7893AF] group-hover:text-[#468FEA]"
                            }
                          `}
                        />

                        {!collapsed && (
                          <span className="truncate">{item.name}</span>
                        )}

                        {/* Recovery notification */}
                        {item.name === "Recovery" && !collapsed && (
                          <span
                            className="
                              ml-auto
                              min-w-[22px]
                              h-[22px]
                              px-1.5
                              rounded-full
                              bg-[#89CFF0]
                              text-[#000080]
                              text-[10px]
                              font-bold
                              flex
                              items-center
                              justify-center
                            "
                          >
                            12
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ================= RECOVERY STATUS ================= */}
      {!collapsed && (
        <div className="px-4 pb-4">
          <div
            className="
              rounded-2xl
              bg-gradient-to-br
              from-[#F0F8FF]
              to-[#E4F3FF]
              border
              border-[#C9E4F8]
              p-4
            "
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-[#468FEA] animate-pulse" />

              <span className="text-xs font-semibold text-[#16166B]">
                Recovery Agent
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#6B86A3]">System status</span>

              <span className="text-[11px] font-bold text-[#0000B8]">
                Operational
              </span>
            </div>

            <div className="mt-3 h-1.5 rounded-full bg-white overflow-hidden">
              <div className="h-full w-[94%] rounded-full bg-gradient-to-r from-[#89CFF0] to-[#468FEA]" />
            </div>
          </div>
        </div>
      )}

      {/* ================= BOTTOM NAV ================= */}
      <div className="border-t border-[#E5F0FA] px-3 py-3">
        {bottomNavigation.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              title={collapsed ? item.name : ""}
              className={({ isActive }) =>
                `
                flex
                items-center
                gap-3
                px-3
                py-3
                rounded-xl
                text-sm
                font-medium
                transition-all
                ${
                  isActive
                    ? "bg-[#F0F8FF] text-[#0000B8]"
                    : "text-[#536B87] hover:bg-[#F0F8FF] hover:text-[#16166B]"
                }
                ${collapsed ? "justify-center" : ""}
              `
              }
            >
              <Icon size={19} />

              {!collapsed && <span>{item.name}</span>}
            </NavLink>
          );
        })}

        {/* Logout */}
        <button
          className={`
            w-full
            flex
            items-center
            gap-3
            px-3
            py-3
            mt-1
            rounded-xl
            text-sm
            font-medium
            text-[#536B87]
            hover:bg-red-50
            hover:text-red-600
            transition-all
            ${collapsed ? "justify-center" : ""}
          `}
          onClick={() => {
            // Add your logout logic here
            console.log("Logout clicked");
          }}
        >
          <LogOut size={19} />

          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      {/* ================= COLLAPSE BUTTON ================= */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="
          absolute
          -right-3
          top-[70px]
          w-7
          h-7
          rounded-full
          bg-white
          border
          border-[#DCEBFA]
          shadow-sm
          flex
          items-center
          justify-center
          text-[#468FEA]
          hover:bg-[#F0F8FF]
          hover:text-[#0000B8]
          transition-all
        "
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
      </button>
    </aside>
  );
}
