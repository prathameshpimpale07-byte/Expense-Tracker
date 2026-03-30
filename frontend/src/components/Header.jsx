import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { ChevronDown, User, LogOut, Sun, Moon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

export default function Header() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const isDark = theme === "dark";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="h-16 border-b flex items-center justify-between px-10 fixed top-0 right-0 left-80 z-[60] glass-header">
      {/* Brand area */}
      <div className="flex-1"></div>

      {/* Right: Dark/Light Toggle + User Profile */}
      <div className="flex items-center gap-4">

        {/* ── Dark / Light Toggle Button ── */}
        <button
          onClick={toggleTheme}
          title={isDark ? "Switch to Light" : "Switch to Dark"}
          className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all hover:scale-105 active:scale-95 border glass-pill select-none"
        >
          <Sun size={15} className={`transition-all ${isDark ? "text-slate-500" : "text-orange-500"}`} />
          {/* Toggle track */}
          <div className={`relative w-10 h-5 rounded-full transition-all duration-300 ${isDark ? "bg-indigo-500" : "bg-slate-300"}`}>
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${isDark ? "left-5" : "left-0.5"}`} />
          </div>
          <Moon size={15} className={`transition-all ${isDark ? "text-indigo-400" : "text-slate-400"}`} />
        </button>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-3 group focus:outline-none"
          >
            {/* Avatar with Online Dot */}
            <div className="relative">
              <div className="w-10 h-10 bg-[#00897B] rounded-full flex items-center justify-center text-white text-xs font-black border-2 border-white shadow-sm group-hover:shadow-md transition-all overflow-hidden">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  user?.name?.charAt(0).toUpperCase() || "H"
                )}
              </div>
              <div className="absolute right-0 bottom-0 w-3 h-3 bg-[#4CAF50] border-2 border-white rounded-full"></div>
            </div>

            <div className="text-left hidden sm:block">
              <p className="text-sm font-bold leading-none text-heading">{user?.name || "Hex"}</p>
              <p className="text-[10px] font-semibold text-muted mt-1">{user?.email || "hexa@gmail.com"}</p>
            </div>

            <div className="text-muted group-hover:text-heading transition-colors ml-1">
              <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
            </div>
          </button>

          {/* Dropdown Menu */}
          {isOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
              <div className="absolute top-14 right-0 w-44 glass-card rounded-[1.5rem] shadow-2xl py-2.5 z-20 animate-in fade-in zoom-in duration-150">

                <div className="px-4 py-2 flex items-center gap-2 border-b border-white/10">
                  <div className="w-7 h-7 bg-[#00897B] rounded-full flex items-center justify-center text-white text-[9px] font-black border border-white shadow-sm shrink-0 overflow-hidden">
                    {user?.profileImage ? (
                      <img src={user.profileImage} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      user?.name?.charAt(0).toUpperCase() || "H"
                    )}
                  </div>
                  <div className="text-left truncate">
                    <p className="text-[10px] font-black text-heading leading-none truncate">{user?.name || "Hex"}</p>
                    <p className="text-[8px] font-bold text-muted mt-0.5 truncate">{user?.email || "hexa@gmail.com"}</p>
                  </div>
                </div>

                <div className="p-1 space-y-0.5">
                  <Link
                    to="/profile"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-[10px] font-black text-subheading hover:bg-white/10 rounded-[1rem] transition-all group"
                  >
                    <div className="w-6 h-6 bg-white/10 rounded-lg flex items-center justify-center group-hover:text-teal-500 transition-all">
                      <User size={12} />
                    </div>
                    My Profile
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-[10px] font-black text-orange-500 hover:bg-orange-500/10 rounded-[1rem] transition-all group"
                  >
                    <div className="w-6 h-6 bg-orange-500/10 rounded-lg flex items-center justify-center group-hover:text-orange-500 transition-all">
                      <LogOut size={12} />
                    </div>
                    Log Out
                  </button>
                </div>

              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
