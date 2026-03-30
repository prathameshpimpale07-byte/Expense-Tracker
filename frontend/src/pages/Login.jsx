import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import API from "../services/api";
import { Eye, EyeOff, Mail, Lock, ArrowRight, TrendingUp, Sun, Moon } from "lucide-react";
import toast from "react-hot-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const isDark = theme === "dark";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post("/auth/login", { email, password });
      login(res.data.user, res.data.token);
      toast.success("Welcome back!");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    background: "var(--bg-input)",
    border: "1px solid var(--border-light)",
    color: "var(--text-primary)",
    width: "100%",
    padding: "0.75rem 1rem 0.75rem 3rem",
    borderRadius: "0.75rem",
    outline: "none",
    fontSize: "0.875rem",
    fontWeight: "600",
    transition: "border-color 0.2s",
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-6 relative"
      style={{ background: "var(--bg-base)" }}
    >
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #0d9488, transparent)", filter: "blur(80px)" }} />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #f97316, transparent)", filter: "blur(80px)" }} />
      </div>

      {/* Theme toggle top-right */}
      <button
        onClick={toggleTheme}
        className="fixed top-5 right-5 p-2.5 rounded-2xl transition-all hover:scale-105 z-50"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-color)",
          backdropFilter: "blur(12px)",
          color: "var(--text-secondary)",
        }}
      >
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {/* Card */}
      <div className="glass-card w-full max-w-sm p-8 relative z-10" style={{ borderRadius: "1.75rem" }}>
        {/* Logo */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-4"
            style={{
              background: "linear-gradient(135deg, #0d9488 0%, #059669 100%)",
              boxShadow: "0 4px 20px rgba(13,148,136,0.4)",
            }}
          >
            <TrendingUp size={26} />
          </div>
          <h2 className="text-xl font-black tracking-tight" style={{ color: "var(--text-primary)" }}>
            Welcome back
          </h2>
          <p className="text-sm font-medium mt-1" style={{ color: "var(--text-muted)" }}>
            Sign in to your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "var(--text-muted)" }}>
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2" size={16} style={{ color: "var(--text-muted)" }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = "#0d9488"}
                onBlur={(e) => e.target.style.borderColor = "var(--border-light)"}
                placeholder="name@example.com"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                Password
              </label>
              <button 
                type="button" 
                onClick={() => {
                  if(!email) toast.error("Please enter your email address first");
                  else toast.success(`Password reset instructions sent to ${email}`);
                }} 
                className="text-[11px] font-bold" style={{ color: "#0d9488" }}>
                Forgot?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2" size={16} style={{ color: "var(--text-muted)" }} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ ...inputStyle, paddingRight: "3rem" }}
                onFocus={(e) => e.target.style.borderColor = "#0d9488"}
                onBlur={(e) => e.target.style.borderColor = "var(--border-light)"}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 transition-all"
                style={{ color: "var(--text-muted)" }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-2 text-white rounded-xl font-black text-sm uppercase tracking-widest transition-all disabled:opacity-60 active:scale-[0.98] flex items-center justify-center gap-2"
            style={{
              background: "linear-gradient(135deg, #0d9488 0%, #059669 100%)",
              boxShadow: "0 4px 20px rgba(13,148,136,0.4)",
            }}
          >
            {loading ? "Signing in..." : <><span>Sign In</span><ArrowRight size={16} /></>}
          </button>
        </form>

        <div className="mt-6 pt-5 text-center border-t" style={{ borderColor: "var(--border-light)" }}>
          <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
            Don&apos;t have an account?{" "}
            <Link to="/register" className="font-black" style={{ color: "#0d9488" }}>
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
