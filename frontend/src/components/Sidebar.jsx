import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  User, 
  LogOut, 
  TrendingUp,
  HelpCircle,
  X
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const NavItem = ({ to, icon: Icon, label, onClick }) => (
  <NavLink
    to={to}
    end={to === "/"}
    onClick={onClick}
    className={({ isActive }) =>
      `sidebar-link ${isActive ? "sidebar-link-active" : "sidebar-link-inactive"}`
    }
  >
    <Icon size={22} />
    <span>{label}</span>
  </NavLink>
);

export default function Sidebar({ isOpen, setIsOpen }) {
  const { logout } = useAuth();

  const handleLinkClick = () => {
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  return (
    <>
      <aside className={`w-80 h-screen flex flex-col p-8 fixed left-0 top-0 z-[70] transition-transform duration-300 glass-sidebar 
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        
        <div className="flex items-center justify-between mb-10 px-2 lg:mb-14">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-teal-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-teal-600/20">
              <TrendingUp size={24} />
            </div>
            <span className="text-lg lg:text-xl font-black text-heading tracking-tight">Expense Tracker</span>
          </div>
          
          <button 
            className="lg:hidden p-2 text-slate-400 hover:text-teal-600 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 space-y-3 lg:space-y-4">
          <NavItem to="/" icon={LayoutDashboard} label="Dashboard" onClick={handleLinkClick} />
          <NavItem to="/income" icon={ArrowUpCircle} label="Income" onClick={handleLinkClick} />
          <NavItem to="/expenses" icon={ArrowDownCircle} label="Expenses" onClick={handleLinkClick} />
          <NavItem to="/profile" icon={User} label="Profile" onClick={handleLinkClick} />
        </nav>

        <div className="pt-6 lg:pt-8 border-t border-white/10 space-y-2">
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
    </>
  );
}
