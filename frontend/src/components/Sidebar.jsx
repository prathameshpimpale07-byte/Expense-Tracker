import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  User, 
  LogOut, 
  TrendingUp,
  HelpCircle
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const NavItem = ({ to, icon: Icon, label }) => (
  <NavLink
    to={to}
    end={to === "/"}
    className={({ isActive }) =>
      `sidebar-link ${isActive ? "sidebar-link-active" : "sidebar-link-inactive"}`
    }
  >
    <Icon size={22} />
    <span>{label}</span>
  </NavLink>
);

export default function Sidebar() {
  const { logout } = useAuth();

  return (
    <aside className="w-80 h-screen flex flex-col p-10 fixed left-0 top-0 glass-sidebar">
      <div className="mb-14 flex items-center gap-4 px-2">
        <div className="w-12 h-12 bg-teal-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-teal-600/20">
          <TrendingUp size={28} />
        </div>
        <span className="text-xl font-black text-heading tracking-tight">Expense Tracker</span>
      </div>

      <nav className="flex-1 space-y-4">
        <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
        <NavItem to="/income" icon={ArrowUpCircle} label="Income" />
        <NavItem to="/expenses" icon={ArrowDownCircle} label="Expenses" />
        <NavItem to="/profile" icon={User} label="Profile" />
      </nav>

      <div className="pt-8 border-t border-white/10 space-y-2">
        <button className="sidebar-link sidebar-link-inactive w-full">
          <HelpCircle size={22} />
          <span>Support</span>
        </button>
        <button
          onClick={logout}
          className="sidebar-link w-full text-slate-400 hover:bg-orange-500/10 hover:text-orange-500"
        >
          <LogOut size={22} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
