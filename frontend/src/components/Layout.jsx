import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg-base)" }}>
      {/* Sidebar is fixed w-80 on large screens, hidden on mobile by default */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      {/* Main Content Area: Offset by sidebar width only on large screens */}
      <div className="flex-1 lg:ml-80 flex flex-col min-h-screen relative overflow-x-hidden">
        <Header toggleSidebar={toggleSidebar} />
        <main className="p-4 sm:p-10 flex-1 mt-16">
          <div className="max-w-7xl mx-auto space-y-6 sm:space-y-10">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Overlay: shown when sidebar is open on mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-[65] lg:hidden backdrop-blur-[2px] transition-all"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
