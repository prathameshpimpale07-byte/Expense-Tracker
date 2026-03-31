import { useState, useEffect, useMemo } from "react";
import { 
  TrendingUp, 
  BarChart3, 
  Plus, 
  Download,
  Trash2,
  Calendar,
  Edit2,
  DollarSign,
  Filter,
  FileText
} from "lucide-react";
import API from "../services/api";
import Charts from "../components/Charts";
import TransactionForm from "../components/TransactionForm";
import toast from "react-hot-toast";
import { exportToCSV } from "../utils/export";

export default function Income() {
  const [data, setData] = useState({
    total: 0,
    average: 0,
    transactionsCount: 0,
    trendLabels: [],
    trendValues: [],
    transactions: []
  });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [filter, setFilter] = useState("Monthly");
  const [categoryFilter, setCategoryFilter] = useState("All");

  useEffect(() => {
    fetchAnalytics();
  }, [filter]);

  const fetchAnalytics = async () => {
    try {
      const res = await API.get(`/transactions/analytics/income?filter=${filter}`);
      setData(prev => ({ ...prev, ...res.data }));
    } catch (err) {
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await API.delete(`/transactions/${id}`);
      toast.success("Transaction deleted");
      fetchAnalytics();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const handleEdit = (transaction) => {
    setEditData(transaction);
    setShowModal(true);
  };

  const getCategoryIcon = (category) => {
    const cat = category?.toLowerCase() || "";
    if (cat.includes("salary")) return <TrendingUp size={18} />;
    return <FileText size={18} />;
  };

  const filteredTransactions = useMemo(() => {
    if (categoryFilter === "All") return data.transactions;
    return data.transactions.filter(t => t.category === categoryFilter);
  }, [data.transactions, categoryFilter]);

  if (loading) return (
   <div className="flex items-center justify-center h-[calc(100vh-80px)]">
     <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
   </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-black text-heading tracking-tight uppercase">Income Overview</h1>
          <p className="text-[11px] font-black text-muted uppercase tracking-[0.2em] opacity-60">Track and manage your income sources</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4">
           <div className="flex glass-pill p-1 rounded-2xl w-full sm:w-auto overflow-x-auto max-w-full no-scrollbar">
             {["Daily", "Weekly", "Monthly", "Yearly"].map(f => (
               <button 
                 key={f}
                 onClick={() => setFilter(f)}
                 className={`flex-1 sm:flex-none px-4 sm:px-5 py-2.5 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filter === f ? "bg-teal-600 text-white shadow-lg" : "text-muted hover:text-subheading"}`}
               >
                 {f}
               </button>
             ))}
           </div>
           <button 
             onClick={() => { setEditData(null); setShowModal(true); }}
             className="w-full sm:w-auto flex items-center justify-center gap-3 bg-teal-600 text-white px-8 py-3.5 rounded-[1.2rem] sm:rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-teal-600/20 hover:bg-teal-700 transition-all active:scale-95 whitespace-nowrap"
           >
             <Plus size={18} strokeWidth={2.5} /> Add Income
           </button>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-[1.5rem] flex flex-col justify-between h-40 group hover:shadow-lg transition-all border-none">
          <div className="flex justify-between items-start">
             <div className="space-y-1">
                <p className="text-[10px] font-black text-muted uppercase tracking-[0.1em]">Total Income</p>
                <h3 className="text-3xl font-black text-heading tracking-tight">${(data.total || 0).toLocaleString()}</h3>
             </div>
             <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-teal-500/30">
               <DollarSign size={20} strokeWidth={2.5} />
             </div>
          </div>
          <div className="flex items-center gap-2 mt-4 text-muted text-[10px] font-black uppercase tracking-widest">
            <Calendar size={12} /> This {filter.replace("ly", "")}
          </div>
        </div>

        <div className="glass-card p-6 rounded-[1.5rem] flex flex-col justify-between h-40 group hover:shadow-lg transition-all border-none">
          <div className="flex justify-between items-start">
             <div className="space-y-1">
                <p className="text-[10px] font-black text-muted uppercase tracking-[0.1em]">Average Income</p>
                <h3 className="text-3xl font-black text-heading tracking-tight">${(data.average || 0).toLocaleString()}</h3>
             </div>
             <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
               <BarChart3 size={20} strokeWidth={2.5} />
             </div>
          </div>
          <div className="flex items-center gap-2 mt-4 text-muted text-[10px] font-black uppercase tracking-widest">
            <Calendar size={12} /> {data.transactionsCount} transactions
          </div>
        </div>

        <div className="glass-card p-6 rounded-[1.5rem] flex flex-col justify-between h-40 group hover:shadow-lg transition-all border-none">
          <div className="flex justify-between items-start">
             <div className="space-y-1">
                <p className="text-[10px] font-black text-muted uppercase tracking-[0.1em]">Transactions</p>
                <h3 className="text-3xl font-black text-heading tracking-tight">{data.transactionsCount || 0}</h3>
             </div>
             <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
               <TrendingUp size={20} strokeWidth={2.5} />
             </div>
          </div>
          <div className="flex items-center gap-2 mt-4 text-muted text-[10px] font-black uppercase tracking-widest">
            <Calendar size={12} /> All records
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="glass-card p-8 rounded-[2rem] border-none">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-black text-heading flex items-center gap-3">
            <BarChart3 className="text-teal-500" size={20} />
            {filter === "Yearly" ? "Monthly" : filter === "Monthly" ? "Daily" : filter} Income Trends <span className="text-[10px] text-muted font-bold lowercase">({filter === "Yearly" ? "This Year" : `This ${filter.replace("ly", "")}`})</span>
          </h3>
          <button 
            onClick={() => exportToCSV(data.transactions, "income_report")}
            className="flex items-center gap-2 px-4 py-2.5 glass-pill rounded-xl text-[10px] font-black text-subheading uppercase tracking-widest hover:text-heading transition-colors"
          >
            <Download size={14} /> Export Data
          </button>
        </div>
        <div className="h-[300px] w-full mt-4">
           {/* Passing type="bar" according to the screenshot chart shape */}
           <Charts 
             labels={data.trendLabels} 
             values={data.trendValues} 
             chartType="bar"
             color="#0d9488" 
           />
        </div>
      </div>

      {/* Transactions List */}
      <div className="glass-card p-8 rounded-[2rem] border-none">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 border-b border-white/5 pb-6 sm:pb-4 gap-4">
          <h3 className="text-sm font-black text-heading flex items-center gap-3">
            <DollarSign className="text-teal-500" size={20} />
            Income Transactions <span className="text-[10px] text-muted font-bold lowercase">({filter === "Yearly" ? "This Year" : `This ${filter.replace("ly", "")}`})</span>
          </h3>
          <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar pb-1">
             <div className="relative flex items-center glass-pill rounded-xl min-w-[150px]">
               <span className="pl-3 text-muted pointer-events-none">
                 <Filter size={12} />
               </span>
               <select
                 value={categoryFilter}
                 onChange={(e) => setCategoryFilter(e.target.value)}
                 className="flex-1 pr-4 pl-2 py-2 text-[9px] sm:text-[10px] font-black text-subheading uppercase tracking-widest bg-transparent outline-none appearance-none cursor-pointer hover:text-heading transition-colors"
               >
                 <option value="All">All Transactions</option>
                 {[...new Set(data.transactions.map(t => t.category))].map(cat => (
                   <option key={cat} value={cat}>{cat}</option>
                 ))}
               </select>
             </div>
             <button 
               onClick={() => exportToCSV(filteredTransactions, "income_transactions")}
               className="flex items-center gap-2 px-4 py-2 text-[9px] sm:text-[10px] glass-pill rounded-xl font-black text-subheading uppercase tracking-widest hover:text-heading transition-colors whitespace-nowrap"
             >
               <Download size={14} /> Export
             </button>
          </div>
        </div>

        <div className="space-y-4">
          {filteredTransactions.map((t) => (
            <div key={t._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 glass-pill rounded-2xl group transition-all hover:bg-white/5 gap-4">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-teal-500/10 text-teal-500 flex items-center justify-center font-black shadow-inner flex-shrink-0">
                    {getCategoryIcon(t.category)}
                  </div>
                  <div>
                    <h4 className="font-black text-heading text-[14px] sm:text-[15px] leading-tight mb-1">{t.title}</h4>
                    <p className="text-[9px] sm:text-[10px] font-bold text-muted uppercase tracking-widest">
                      {new Date(t.date).toLocaleDateString()} • {t.category}
                    </p>
                  </div>
               </div>
               <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-8">
                 <span className="font-black text-teal-500 text-base sm:text-lg tracking-tight">
                   +${Number(t.amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                 </span>
                 <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                   <button onClick={() => handleEdit(t)} className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl glass-pill flex items-center justify-center text-teal-400 hover:text-teal-300 hover:bg-teal-500/10 transition-colors"><Edit2 size={14} /></button>
                   <button onClick={() => handleDelete(t._id)} className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl glass-pill flex items-center justify-center text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 transition-colors"><Trash2 size={14} /></button>
                 </div>
               </div>
            </div>
          ))}

          {filteredTransactions.length === 0 && (
             <div className="py-16 flex flex-col items-center justify-center space-y-4 opacity-50">
               <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-muted border border-white/10">
                 <DollarSign size={32} />
               </div>
               <p className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">
                 No income recorded yet
               </p>
             </div>
          )}
        </div>
      </div>

      {showModal && (
        <TransactionForm 
           onClose={() => setShowModal(false)}
           refreshTransactions={fetchAnalytics}
           initialType="income"
           standalone={false}
           editData={editData}
        />
      )}
    </div>
  );
}
