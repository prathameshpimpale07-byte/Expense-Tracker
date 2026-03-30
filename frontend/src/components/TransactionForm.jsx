import { useState, useEffect, useMemo } from "react";
import API from "../services/api";
import { X } from "lucide-react";
import toast from "react-hot-toast";

const formatDateInput = (value) => {
  if (!value) return "";
  const d = new Date(value);
  return d.toISOString().slice(0, 10);
};

const CATEGORIES = {
  income: ["Salary", "Freelance", "Investments", "Bonus", "Gift", "Other"],
  expense: ["Food", "Housing", "Transport", "Shopping", "Entertainment", "Utilities", "Healthcare", "Medicine", "Other"]
};

export default function TransactionForm({ refreshTransactions, onClose, initialType = "expense", editData = null, standalone = false }) {
  const [title, setTitle] = useState(editData?.title || "");
  const [amount, setAmount] = useState(editData?.amount || "");
  const [type, setType] = useState(editData?.type || initialType);
  const [category, setCategory] = useState(editData?.category || CATEGORIES[editData?.type || initialType][0]);
  const [date, setDate] = useState(formatDateInput(editData?.date || new Date()));
  const [loading, setLoading] = useState(false);

  const availableCategories = useMemo(() => CATEGORIES[type], [type]);

  useEffect(() => {
    if (!availableCategories.includes(category)) {
      setCategory(availableCategories[0]);
    }
  }, [type, availableCategories, category]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !amount || !category || !date) {
      toast.error("Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        amount: Number(amount),
        type,
        category,
        date,
      };

      if (editData) {
        await API.put(`/transactions/${editData._id}`, payload);
        toast.success("Transaction updated!");
      } else {
        await API.post("/transactions", payload);
        toast.success("Transaction added!");
      }

      refreshTransactions();
      if(onClose) onClose();
    } catch (error) {
      toast.error(editData ? "Failed to update transaction" : "Failed to add transaction");
    } finally {
      setLoading(false);
    }
  };

  const isExpense = type === "expense";

  // ============================================
  // DASHBOARD VERSION (Standalone)
  // Has the exact design from screenshot within a glassmorphism wrapper
  // ============================================
  if (standalone) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-200/50 dark:bg-slate-900/80 backdrop-blur-xl animate-in fade-in transition-all">
        <div className="glass-card bg-white/80 dark:bg-slate-900/80 w-full max-w-[420px] rounded-[2.5rem] shadow-2xl relative border border-white/40 dark:border-slate-700/50 scale-in-center overflow-hidden">
          <div className="px-6 pt-6 pb-2 flex justify-between items-center">
            <h2 className="text-[18px] font-extrabold text-[#1e293b] dark:text-white tracking-tight ml-2">
              {editData ? "Edit Transaction" : "Add New Transaction"}
            </h2>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all mr-2">
              <X size={20} />
            </button>
          </div>
          <div className="px-8 pb-8 pt-2">
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-[#475569] dark:text-slate-300">Description</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm outline-none transition-colors text-sm dark:text-white focus:border-[#00a884] dark:focus:border-[#00a884]"
                  placeholder="Food, Rent, Salary..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-[#475569] dark:text-slate-300">Amount</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  min="0.01"
                  step="0.01"
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm outline-none transition-colors text-sm dark:text-white focus:border-[#00a884] dark:focus:border-[#00a884]"
                  placeholder="0.00"
                />
              </div>

              {!editData && (
                <div className="space-y-1.5">
                  <label className="text-[13px] font-bold text-[#475569] dark:text-slate-300">Type</label>
                  <div className="flex gap-2 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl">
                    <button 
                      type="button" 
                      onClick={() => setType("income")} 
                      className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-all ${
                        type === "income" 
                        ? "bg-white text-slate-800 shadow-sm dark:bg-slate-700 dark:text-white" 
                        : "text-[#475569] hover:bg-white/50 dark:text-slate-400"
                      }`}
                    >
                      Income
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setType("expense")} 
                      className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-all ${
                        type === "expense" 
                        ? "bg-[#f97316] text-white shadow-sm" 
                        : "text-[#475569] hover:bg-white/50 dark:text-slate-400"
                      }`}
                    >
                      Expense
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-[#475569] dark:text-slate-300">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm outline-none transition-colors text-sm dark:text-white focus:border-[#00a884] dark:focus:border-[#00a884]"
                >
                  {availableCategories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-[#475569] dark:text-slate-300">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm outline-none transition-colors text-sm dark:text-white focus:border-[#00a884] dark:focus:border-[#00a884]"
                />
              </div>

              <div className="pt-2">
                 <button
                   type="submit"
                   disabled={loading}
                   className="w-full py-3.5 bg-[#00a884] hover:bg-[#009676] text-white rounded-xl font-bold transition-colors disabled:opacity-70 active:scale-[0.98]"
                 >
                   {loading 
                      ? (editData ? "Saving..." : "Adding...") 
                      : (editData ? "Save Changes" : "Add Transaction")}
                 </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // INCOME / EXPENSE PAGE VERSION 
  // Glassmorphism design and extreme round shape
  // ============================================
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-200/50 dark:bg-slate-900/80 backdrop-blur-xl animate-in fade-in transition-all">
      <div className="glass-card bg-white/80 dark:bg-slate-900/80 w-full max-w-[400px] rounded-[2.5rem] shadow-2xl relative border border-white/20 dark:border-slate-700/50 scale-in-center overflow-hidden">
        <div className="px-6 pt-6 pb-2 flex justify-between items-center">
          <h2 className="text-[18px] font-black text-heading uppercase tracking-tight ml-2">
            {editData ? `Edit ${isExpense ? 'Expense' : 'Income'}` : `Add New ${isExpense ? 'Expense' : 'Income'}`}
          </h2>
          <button onClick={onClose} className="w-10 h-10 glass-pill rounded-xl flex items-center justify-center text-muted hover:text-heading transition-all">
            <X size={20} />
          </button>
        </div>
        <div className="px-8 pb-8 pt-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[11px] font-black text-muted uppercase tracking-widest ml-1">Description</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className={`w-full h-11 px-4 glass-pill border-none rounded-2xl text-sm font-bold text-heading outline-none focus:ring-2 transition-all dark:text-white ${isExpense ? 'focus:ring-orange-500/30' : 'focus:ring-[#00a884]/30'}`}
                placeholder="Groceries, Rent, etc."
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-black text-muted uppercase tracking-widest ml-1">Amount</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                min="0.01"
                step="0.01"
                className={`w-full h-11 px-4 glass-pill border-none rounded-2xl text-sm font-bold text-heading outline-none focus:ring-2 transition-all dark:text-white ${isExpense ? 'focus:ring-orange-500/30' : 'focus:ring-[#00a884]/30'}`}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-black text-muted uppercase tracking-widest ml-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`w-full h-11 px-4 glass-pill border-none rounded-2xl text-sm font-bold text-heading outline-none focus:ring-2 transition-all appearance-none dark:text-white ${isExpense ? 'focus:ring-orange-500/30' : 'focus:ring-[#00a884]/30'}`}
              >
                {availableCategories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-black text-muted uppercase tracking-widest ml-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className={`w-full h-11 px-4 glass-pill border-none rounded-2xl text-sm font-bold text-heading outline-none focus:ring-2 transition-all dark:text-white ${isExpense ? 'focus:ring-orange-500/30' : 'focus:ring-[#00a884]/30'}`}
              />
            </div>

            <div className="pt-4">
               <button
                 type="submit"
                 disabled={loading}
                 className={`w-full h-14 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl transition-all active:scale-95 ${
                  editData ? (isExpense ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/30' : 'bg-teal-600 hover:bg-teal-700 shadow-teal-600/30') : (isExpense ? 'bg-[#f97316] hover:bg-orange-600 shadow-orange-500/30' : 'bg-[#00a884] hover:bg-[#009676] shadow-teal-500/30')
                 }`}
               >
                 {loading ? (editData ? "Saving..." : "Adding...") : (editData ? `Edit ${isExpense ? 'Expense' : 'Income'}` : `Add ${isExpense ? 'Expense' : 'Income'}`)}
               </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
