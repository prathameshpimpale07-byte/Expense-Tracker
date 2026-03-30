import { useState, useEffect, useMemo } from "react";
import { 
  TrendingDown, 
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

export default function Expenses() {
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
      const res = await API.get(`/transactions/analytics/expense?filter=${filter}`);
      setData(res.data);
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
    if (cat.includes("food") || cat.includes("rent") || cat.includes("medicine")) return <FileText size={18} />;
    return <FileText size={18} />;
  };

  const filteredTransactions = useMemo(() => {
    if (categoryFilter === "All") return data.transactions;
    return data.transactions.filter(t => t.category === categoryFilter);
  }, [data.transactions, categoryFilter]);

  if (loading) return (
   <div className="flex items-center justify-center h-[calc(100vh-80px)]">
     <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
   </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-black text-heading tracking-tight uppercase">Expense Overview</h1>
          <p className="text-[11px] font-black text-muted uppercase tracking-[0.2em] opacity-60">Track and manage your expenses</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4">
           <div className="flex glass-pill p-1 rounded-2xl w-full sm:w-auto">
             {["Daily", "Weekly", "Monthly", "Yearly"].map(f => (
               <button 
                 key={f}
                 onClick={() => setFilter(f)}
                 className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? "bg-orange-600 text-white shadow-lg" : "text-muted hover:text-subheading"}`}
               >
                 {f}
               </button>
             ))}
           </div>
           <button 
             onClick={() => { setEditData(null); setShowModal(true); }}
             className="w-full sm:w-auto flex items-center justify-center gap-3 bg-orange-500 text-white px-8 py-3.5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-orange-500/20 hover:bg-orange-600 transition-all active:scale-95 whitespace-nowrap"
           >
             <Plus size={18} strokeWidth={2.5} /> Add Expense
           </button>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-[1.5rem] flex flex-col justify-between h-40 group hover:shadow-lg transition-all border-none">
          <div className="flex justify-between items-start">
             <div className="space-y-1">
                <p className="text-[10px] font-black text-muted uppercase tracking-[0.1em]">Total Expenses</p>
                <h3 className="text-3xl font-black text-heading tracking-tight">${data.total.toLocaleString()}</h3>
             </div>
             <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
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
                <p className="text-[10px] font-black text-muted uppercase tracking-[0.1em]">Average Expense</p>
                <h3 className="text-3xl font-black text-heading tracking-tight">${data.average.toLocaleString()}</h3>
             </div>
             <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-yellow-500/30">
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
                <h3 className="text-3xl font-black text-heading tracking-tight">{data.transactionsCount}</h3>
             </div>
             <div className="w-10 h-10 bg-orange-400 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-400/30">
               <TrendingDown size={20} strokeWidth={2.5} />
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
            <BarChart3 className="text-orange-500" size={20} />
            {filter === "Yearly" ? "Monthly" : filter === "Monthly" ? "Daily" : filter} Expense Trends <span className="text-[10px] text-muted font-bold lowercase">({filter === "Yearly" ? "This Year" : `This ${filter.replace("ly", "")}`})</span>
          </h3>
          <button 
            onClick={() => exportToCSV(data.transactions, "expense_report")}
            className="flex items-center gap-2 px-4 py-2.5 glass-pill rounded-xl text-[10px] font-black text-subheading uppercase tracking-widest hover:text-heading transition-colors"
          >
            <Download size={14} /> Export Data
          </button>
        </div>
        <div className="h-[300px] w-full mt-4">
           {/* Passing type="line" according to the screenshot chart shape for expense */}
           <Charts 
             labels={data.trendLabels} 
             values={data.trendValues} 
             chartType="line"
             color="#ea580c" 
           />
        </div>
      </div>

      {/* Transactions List */}
      <div className="glass-card p-8 rounded-[2rem] border-none">
        <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
          <h3 className="text-sm font-black text-heading flex items-center gap-3">
            <DollarSign className="text-orange-500" size={20} />
            Expense Transactions <span className="text-[10px] text-muted font-bold lowercase">({filter === "Yearly" ? "This Year" : `This ${filter.replace("ly", "")}`})</span>
          </h3>
          <div className="flex items-center gap-4">
             <div className="relative flex items-center glass-pill rounded-xl">
               <span className="pl-4 text-muted pointer-events-none">
                 <Filter size={14} />
               </span>
               <select
                 value={categoryFilter}
                 onChange={(e) => setCategoryFilter(e.target.value)}
                 className="pr-4 pl-3 py-2.5 text-[10px] font-black text-subheading uppercase tracking-widest bg-transparent outline-none appearance-none cursor-pointer hover:text-heading transition-colors"
               >
                 <option value="All">All Transactions</option>
                 {[...new Set(data.transactions.map(t => t.category))].map(cat => (
                   <option key={cat} value={cat}>{cat}</option>
                 ))}
               </select>
             </div>
             <button 
               onClick={() => exportToCSV(filteredTransactions, "expense_transactions")}
               className="flex items-center gap-2 px-4 py-2.5 glass-pill rounded-xl text-[10px] font-black text-subheading uppercase tracking-widest hover:text-heading transition-colors"
             >
               <Download size={14} /> Export
             </button>
          </div>
        </div>

        <div className="space-y-4">
          {filteredTransactions.map((t) => (
            <div key={t._id} className="flex items-center justify-between p-4 glass-pill rounded-2xl group transition-all hover:bg-white/5">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center font-black shadow-inner">
                    {getCategoryIcon(t.category)}
                  </div>
                  <div>
                    <h4 className="font-black text-heading text-[15px] leading-none mb-1.5">{t.title}</h4>
                    <p className="text-[10px] font-bold text-muted uppercase tracking-widest">
                      {new Date(t.date).toLocaleDateString()} • {t.category}
                    </p>
                  </div>
               </div>
               <div className="flex items-center gap-8">
                 <span className="font-black text-orange-500 text-lg tracking-tight">
                   -${Number(t.amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                 </span>
                 <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button onClick={() => handleEdit(t)} className="w-9 h-9 rounded-xl glass-pill flex items-center justify-center text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 transition-colors"><Edit2 size={16} /></button>
                   <button onClick={() => handleDelete(t._id)} className="w-9 h-9 rounded-xl glass-pill flex items-center justify-center text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 size={16} /></button>
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
                 No expenses recorded yet
               </p>
             </div>
          )}
        </div>
      </div>

      {showModal && (
        <TransactionForm 
           onClose={() => setShowModal(false)}
           refreshTransactions={fetchAnalytics}
           initialType="expense"
           standalone={false}
           editData={editData}
        />
      )}
    </div>
  );
}
