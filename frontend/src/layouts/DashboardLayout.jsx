// src/layouts/DashboardLayout.jsx
import { useState } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Settings,
  LogOut,
  Menu,
  Shield,
  Users,
  BookOpen,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

// ─── Role-based navigation items ────────────────────────
const navItems = {
  student: [
    { to: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/student/documents", label: "My Documents", icon: FileText },
  ],
  lecturer: [
    { to: "/lecturer/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/lecturer/submissions", label: "All Submissions", icon: BookOpen },
    { to: "/lecturer/documents", label: "My Documents", icon: FileText },
  ],
  admin: [
    { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/documents", label: "All Documents", icon: FileText },
    { to: "/admin/users", label: "Users", icon: Users },
    { to: "/admin/my-documents", label: "My Documents", icon: BookOpen },
  ],
};

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const items = navItems[user?.role] || [];

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch {
      toast.error("Logout failed");
    }
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="h-screen bg-slate-50 flex overflow-hidden">
      {/* ════════════════════════════════════
          SIDEBAR
      ════════════════════════════════════ */}
      <aside
        className={`
          fixed lg:sticky lg:top-0 inset-y-0 left-0 z-40
          w-64 h-screen bg-white border-r border-slate-200
          flex flex-col shrink-0
          transform transition-transform duration-300 lg:transform-none
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo */}
        <Link
          to="/"
          onClick={closeSidebar}
          className="flex items-center gap-2 px-6 py-5 border-b border-slate-200 
                     hover:bg-slate-50 transition-colors group shrink-0"
        >
          <div className="p-1.5 bg-gradient-to-br from-blue-500 to-violet-500 
                          rounded-lg group-hover:scale-110 transition-transform">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg text-slate-900 
                           group-hover:text-blue-600 transition-colors">
            PlagiaGuard
          </span>
        </Link>

        {/* User Info */}
        <div className="px-6 py-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 
                            to-violet-500 flex items-center justify-center 
                            text-white font-bold shrink-0">
              {user?.full_name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">
                {user?.full_name}
              </p>
              <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;

            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={closeSidebar}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl 
                            text-sm font-medium transition-all
                            ${
                              isActive
                                ? "bg-gradient-to-r from-blue-500 to-violet-500 text-white shadow-md shadow-blue-500/20"
                                : "text-slate-700 hover:bg-slate-100"
                            }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="px-3 py-4 border-t border-slate-200 space-y-1 shrink-0">
          <Link
            to="/settings"
            onClick={closeSidebar}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm 
                       font-medium text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <Settings className="w-5 h-5" />
            Settings
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl 
                       text-sm font-medium text-red-600 hover:bg-red-50 
                       transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/50 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* ════════════════════════════════════
          MAIN CONTENT
      ════════════════════════════════════ */}
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden sticky top-0 z-20 bg-white border-b 
                        border-slate-200 px-4 py-3 flex items-center 
                        justify-between shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link to="/" className="flex items-center gap-2">
            <div className="p-1 bg-gradient-to-br from-blue-500 to-violet-500 rounded">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900">PlagiaGuard</span>
          </Link>
          <div className="w-9" />
        </div>

        {/* Page Content — layout provides padding */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 lg:p-8">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;