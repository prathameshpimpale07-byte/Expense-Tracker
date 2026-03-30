import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg-base)" }}>
      {/* Sidebar is fixed w-80 */}
      <Sidebar />
      
      {/* Main Content Area: Offset by sidebar width */}
      <div className="flex-1 ml-80 flex flex-col min-h-screen relative overflow-x-hidden">
        <Header />
        <main className="p-10 flex-1 mt-16">
          <div className="max-w-7xl mx-auto space-y-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
