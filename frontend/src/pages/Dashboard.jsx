import { useState, useEffect } from "react";
import {
   TrendingUp,
   TrendingDown,
   Wallet,
   ArrowRight,
   Plus,
   PieChart,
   Calendar,
   ChevronRight,
   RotateCcw,
   ShoppingCart,
   DollarSign
} from "lucide-react";
import Charts from "../components/Charts";
import API from "../services/api";
import toast from "react-hot-toast";
import TransactionForm from "../components/TransactionForm";

export default function Dashboard() {
   const [data, setData] = useState({
      totalBalance: 0,
      monthlyIncome: 0,
      monthlyExpense: 0,
      savingRate: 0,
      recentTransactions: [],
      monthlyTrends: [],
      categoryBreakdown: []
   });
   const [loading, setLoading] = useState(true);
   const [showModal, setShowModal] = useState(false);
   const [activeFilter, setActiveFilter] = useState("Monthly");

   useEffect(() => {
      fetchDashboardData();
   }, [activeFilter]);

   const fetchDashboardData = async () => {
      try {
         const res = await API.get(`/transactions/dashboard/summary?filter=${activeFilter}`);
         setData(prev => ({ ...prev, ...res.data }));
      } catch (err) {
         toast.error("Failed to load dashboard data");
      } finally {
         setLoading(false);
      }
   };

   const StatCardSmall = ({ title, value, icon: Icon, color, subtext, trend }) => (
      <div className="glass-card p-6 rounded-[1.5rem] flex flex-col justify-between h-40 group hover:shadow-lg transition-all">
         <div className="flex justify-between items-start">
            <div className="space-y-1">
               <p className="text-[10px] font-black text-muted capitalize tracking-wide">{title}</p>
               <h3 className="text-2xl font-black text-heading tracking-tight">${value.toLocaleString()}</h3>
            </div>
            <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center text-white shadow-lg`}>
               <Icon size={20} />
            </div>
         </div>
         <div className="flex items-center gap-2 mt-4">
            {trend && <span className={`text-[10px] font-black ${trend > 0 ? "text-teal-500" : "text-orange-500"}`}>{trend > 0 ? "+" : ""}{trend}%</span>}
            <span className="text-[10px] font-black text-muted capitalize tracking-widest">{subtext}</span>
         </div>
      </div>
   );

   const RecentBox = ({ title, transactions, type }) => (
      <div className="glass-card p-8 rounded-[2rem] space-y-6 flex-1 min-h-[360px] flex flex-col">
         <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-heading flex items-center gap-2">
               {type === "income" ? <TrendingUp className="text-teal-500" size={20} /> : <TrendingDown className="text-orange-500" size={20} />}
               {title} <span className="text-[10px] text-muted font-bold lowercase">({activeFilter})</span>
            </h3>
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${type === "income" ? "bg-teal-500/10 text-teal-500" : "bg-orange-500/10 text-orange-500"}`}>
               {transactions.length} records
            </span>
         </div>

         {transactions.length > 0 ? (
            <div className="space-y-4">
               {transactions.slice(0, 3).map(t => (
                  <div key={t._id} className="flex items-center justify-between p-4 glass-pill rounded-2xl">
                     <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md ${type === "income" ? "bg-teal-500" : "bg-orange-500"}`}>
                           {t.category?.charAt(0).toUpperCase() || "P"}
                        </div>
                        <div>
                           <p className="text-sm font-black text-heading leading-none">{t.title}</p>
                           <p className="text-[10px] font-bold text-muted mt-1 uppercase tracking-widest">{t.category}</p>
                        </div>
                     </div>
                     <p className={`text-sm font-black ${type === "income" ? "text-teal-500" : "text-orange-500"}`}>
                        {type === "income" ? "+" : "-"}${t.amount.toLocaleString()}
                     </p>
                  </div>
               ))}
            </div>
         ) : (
            <div className="flex-1 flex flex-col items-center justify-center space-y-4 opacity-50">
               <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-muted border border-white/10">
                  {type === "income" ? <DollarSign size={32} /> : <ShoppingCart size={32} />}
               </div>
               <p className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">
                  {type === "income" ? "No income transactions" : "No expense transactions"}
               </p>
            </div>
         )}
      </div>
   );

   if (loading) return (
      <div className="flex items-center justify-center h-[calc(100vh-80px)]">
         <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
   );

   return (
      <div className="space-y-10">
         {/* Page Header */}
         <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-black text-heading tracking-tight uppercase">Dashboard</h1>
            <p className="text-[11px] font-black text-muted uppercase tracking-[0.2em] opacity-60">Welcome Back</p>
         </div>

         {/* Row 1: Top 4 Stat Cards */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCardSmall title="Total Balance" value={data.totalBalance || 0} icon={Wallet} color="bg-teal-500" subtext="this month" trend={10} />
            <StatCardSmall title="Monthly Income" value={data.monthlyIncome || 0} icon={TrendingUp} color="bg-teal-500" subtext="from last month" trend={12.5} />
            <StatCardSmall title="Monthly Expense" value={data.monthlyExpense || 0} icon={TrendingDown} color="bg-orange-500" subtext="from last month" trend={0} />
            <StatCardSmall title="Saving Rate" value={data.savingRate || 0} icon={PieChart} color="bg-blue-500" subtext="Excellent" />
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

            {/* LEFT COLUMN */}
            <div className="lg:col-span-2 space-y-8">

               {/* Section 1: Financial Overview Banner */}
               <div className="glass-card p-8 rounded-[2rem] space-y-8">
                  <div className="bg-teal-500/10 rounded-[2rem] p-6 sm:p-10 relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-10">
                     <div className="space-y-4">
                        <h2 className="text-2xl sm:text-4xl font-black text-teal-400 tracking-tight leading-none">Finance Dashboard</h2>
                        <p className="text-teal-300 font-bold text-xs sm:text-sm tracking-tight opacity-80">Track your income and expenses effortless</p>
                     </div>
                     <div className="flex flex-col items-start lg:items-end gap-4 sm:gap-6">
                        <button onClick={() => setShowModal(true)} className="w-full sm:w-auto flex items-center justify-center gap-3 bg-teal-600 text-white px-6 sm:px-8 py-4 sm:py-5 rounded-[1.2rem] sm:rounded-[1.5rem] font-black text-sm shadow-2xl hover:bg-teal-700 transition-all active:scale-95">
                           <Plus size={20} /> Add Transaction
                        </button>
                        <div className="flex glass-pill p-1 rounded-2xl overflow-x-auto max-w-full">
                           {["Daily", "Weekly", "Monthly", "Yearly"].map(f => (
                              <button key={f} onClick={() => setActiveFilter(f)} className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeFilter === f ? "bg-teal-600 text-white shadow-lg" : "text-muted hover:text-subheading"}`}>
                                 {f}
                              </button>
                           ))}
                        </div>
                     </div>
                  </div>

                  {/* Sub-stats */}
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <div className="p-6 glass-pill rounded-2xl space-y-3">
                        <div className="text-teal-400 font-black text-[10px] uppercase tracking-widest">Total Balance</div>
                        <h4 className="text-2xl font-black text-heading tracking-tighter">${(data.totalBalance || 0).toLocaleString()}</h4>
                     </div>
                     <div className="p-6 glass-pill rounded-2xl space-y-3">
                        <div className="text-orange-400 font-black text-[10px] uppercase tracking-widest">This Month Expenses</div>
                        <h4 className="text-2xl font-black text-heading tracking-tighter">${(data.monthlyExpense || 0).toLocaleString()}</h4>
                     </div>
                     <div className="p-6 glass-pill rounded-2xl space-y-3">
                        <div className="text-blue-400 font-black text-[10px] uppercase tracking-widest">This Month Savings</div>
                        <h4 className="text-2xl font-black text-heading tracking-tighter">${((data.monthlyIncome || 0) - (data.monthlyExpense || 0)).toLocaleString()}</h4>
                     </div>
                  </div>

                  {/* Semicircle Gauges */}
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-6">
                     <div className="flex flex-col items-center space-y-4">
                        <p className="text-[11px] font-black text-teal-400 uppercase tracking-widest">Income</p>
                        <div className="h-40 w-full"><Charts chartType="semicircle" data={90} color="#0d9488" title={(data.monthlyIncome || 0).toLocaleString()} /></div>
                        <p className="text-[10px] font-bold text-muted">This Month data</p>
                     </div>
                     <div className="flex flex-col items-center space-y-4">
                        <p className="text-[11px] font-black text-orange-400 uppercase tracking-widest">Spent</p>
                        <div className="h-40 w-full"><Charts chartType="semicircle" data={20} color="#ea580c" title={(data.monthlyExpense || 0).toLocaleString()} /></div>
                        <p className="text-[10px] font-bold text-muted">This Month data</p>
                     </div>
                     <div className="flex flex-col items-center space-y-4">
                        <p className="text-[11px] font-black text-blue-400 uppercase tracking-widest">Savings</p>
                        <div className="h-40 w-full"><Charts chartType="semicircle" data={80} color="#2563eb" title={((data.monthlyIncome || 0) - (data.monthlyExpense || 0)).toLocaleString()} /></div>
                        <p className="text-[10px] font-bold text-muted">This Month data</p>
                     </div>
                  </div>
               </div>

               {/* Expense Distribution Doughnut */}
               <div className="glass-card p-10 rounded-[2rem] space-y-10">
                  <h3 className="text-lg font-black text-heading flex items-center gap-3">
                     <PieChart className="text-teal-500" size={24} /> Expense Distribution <span className="text-xs font-bold text-muted lowercase">(This Month)</span>
                  </h3>
                  <div className="h-[300px]">
                     <Charts data={data.categoryBreakdown.filter(c => c.type === "expense")} chartType="doughnut" />
                  </div>
               </div>

               {/* Recent Boxes */}
               <div className="flex flex-col md:flex-row gap-8">
                  <RecentBox title="Recent Income" type="income" transactions={data.recentTransactions.filter(t => t.type === "income")} />
                  <RecentBox title="Recent Expenses" type="expense" transactions={data.recentTransactions.filter(t => t.type === "expense")} />
               </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-8">
               <div className="glass-card p-8 rounded-[2rem] space-y-8 flex flex-col h-full">
                  <div className="flex items-center justify-between">
                     <h3 className="text-lg font-black text-heading flex items-center gap-3 leading-none">
                        <Calendar className="text-teal-500" size={20} /> Recent Transactions
                     </h3>
                     <RotateCcw size={18} className="text-muted hover:text-teal-500 cursor-pointer transition-colors" onClick={fetchDashboardData} />
                  </div>
                  <div className="space-y-6 flex-1">
                     {data.recentTransactions.slice(0, 5).map(t => (
                        <div key={t._id} className="flex items-center justify-between group">
                           <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${t.type === "income" ? "bg-teal-500/10 text-teal-400" : "bg-orange-500/10 text-orange-400"}`}>
                                 {t.category?.charAt(0).toUpperCase() || "P"}
                              </div>
                              <div>
                                 <p className="text-sm font-black text-heading leading-tight">{t.title}</p>
                                 <p className="text-[10px] text-muted font-bold uppercase tracking-widest mt-1">{new Date(t.date).toLocaleDateString()} {t.category}</p>
                              </div>
                           </div>
                           <p className={`text-sm font-black ${t.type === "income" ? "text-teal-400" : "text-orange-400"}`}>
                              {t.type === "income" ? "+" : "-"}${t.amount.toLocaleString()}
                           </p>
                        </div>
                     ))}
                  </div>
                  <button onClick={() => window.location.href = "/expenses"} className="w-full flex items-center justify-center gap-2 py-4 text-xs font-black text-teal-400 uppercase tracking-widest hover:underline">
                     View All Transactions ({data.recentTransactions.length}) <ChevronRight size={16} />
                  </button>
               </div>

               <div className="glass-card p-8 rounded-[2rem] space-y-8 hidden lg:flex flex-col">
                  <h3 className="text-lg font-black text-heading flex items-center gap-3">
                     <PieChart className="text-teal-500" size={20} /> Spending by Category
                  </h3>
                  <div className="space-y-6">
                     {data.categoryBreakdown.filter(c => c.type === "expense").slice(0, 3).map(cat => (
                        <div key={cat.category} className="flex items-center justify-between font-bold text-sm">
                           <span className="text-subheading">{cat.category}</span>
                           <span className="text-heading">${cat.total.toLocaleString()}</span>
                        </div>
                     ))}
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                     <div className="p-4 bg-teal-500/10 rounded-2xl">
                        <p className="text-[9px] font-black text-teal-400 uppercase tracking-widest mb-1">Total Income</p>
                        <p className="text-lg font-black text-heading tracking-tight">${data.monthlyIncome.toLocaleString()}</p>
                     </div>
                     <div className="p-4 bg-orange-500/10 rounded-2xl">
                        <p className="text-[9px] font-black text-orange-400 uppercase tracking-widest mb-1">Total Expense</p>
                        <p className="text-lg font-black text-heading tracking-tight">${data.monthlyExpense.toLocaleString()}</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {showModal && (
            <TransactionForm
               onClose={() => setShowModal(false)}
               refreshTransactions={fetchDashboardData}
               initialType="expense"
               standalone={true}
            />
         )}
      </div>
   );
}
