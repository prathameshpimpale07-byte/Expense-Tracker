const Transaction = require("../models/Transaction");
const mongoose = require("mongoose");


const buildDateRange = (startDate, endDate) => {
  if (!startDate && !endDate) return undefined;

  const dateQuery = {};

  if (startDate) {
    const parsedStart = new Date(startDate);
    if (!Number.isNaN(parsedStart.getTime())) {
      dateQuery.$gte = parsedStart;
    }
  }

  if (endDate) {
    const parsedEnd = new Date(endDate);
    if (!Number.isNaN(parsedEnd.getTime())) {
      parsedEnd.setHours(23, 59, 59, 999);
      dateQuery.$lte = parsedEnd;
    }
  }

  return Object.keys(dateQuery).length ? dateQuery : undefined;
};

exports.addTransaction = async (req, res) => {
  const { title, amount, type, category, date } = req.body;

  if (!title?.trim()) {
    return res.status(400).json({ message: "Title is required." });
  }

  if (!amount || Number(amount) <= 0) {
    return res.status(400).json({ message: "Amount must be greater than zero." });
  }

  if (!["income", "expense"].includes(type)) {
    return res.status(400).json({ message: "Transaction type is invalid." });
  }

  if (!category?.trim()) {
    return res.status(400).json({ message: "Category is required." });
  }

  try {
    const newTransaction = new Transaction({
      userId: req.user.id,
      title: title.trim(),
      amount: Number(amount),
      type,
      category: category.trim(),
      date: date ? new Date(date) : new Date(),
    });

    await newTransaction.save();
    res.status(201).json(newTransaction);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const { startDate, endDate, category, search, type } = req.query;

    const query = { userId: req.user.id };

    if (search) {
      query.title = { $regex: search.trim(), $options: "i" };
    }

    if (category) {
      query.category = category;
    }

    if (type && ["income", "expense"].includes(type)) {
      query.type = type;
    }

    const dateRange = buildDateRange(startDate, endDate);
    if (dateRange) {
      query.date = dateRange;
    }

    const transactions = await Transaction.find(query).sort({ date: -1, createdAt: -1 });
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ message: "Transaction not found" });

    if (transaction.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await transaction.deleteOne();
    res.status(200).json({ message: "Transaction removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const overallStats = await Transaction.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.user.id) } },

      { $group: {
          _id: "$type",
          total: { $sum: "$amount" }
      }}
    ]);

    const stats = {
      totalIncome: 0,
      totalExpense: 0,
      balance: 0
    };

    overallStats.forEach(item => {
      if (item._id === 'income') stats.totalIncome = item.total;
      if (item._id === 'expense') stats.totalExpense = item.total;
    });

    stats.balance = stats.totalIncome - stats.totalExpense;

    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getDashboardSummary = async (req, res) => {
  try {
    const { filter = 'Monthly' } = req.query;
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const today = new Date();
    
    let startDate = new Date(today.getFullYear(), today.getMonth(), 1); // Default Monthly
    
    if (filter === 'Daily') {
      startDate = new Date(today.setHours(0,0,0,0));
    } else if (filter === 'Weekly') {
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
      startDate = new Date(today.setDate(diff));
      startDate.setHours(0,0,0,0);
    } else if (filter === 'Yearly') {
      startDate = new Date(today.getFullYear(), 0, 1);
    }

    const startOfYear = new Date(today.getFullYear(), 0, 1);

    const stats = await Transaction.aggregate([
      { $match: { userId } },
      { $facet: {
          allTime: [
            { $group: { _id: "$type", total: { $sum: "$amount" } } }
          ],
          rangeStats: [
            { $match: { date: { $gte: startDate } } },
            { $group: { _id: "$type", total: { $sum: "$amount" } } }
          ],
          thisYearTrends: [
            { $match: { date: { $gte: startOfYear } } },
            { $group: { 
                _id: { month: { $month: "$date" }, type: "$type" },
                total: { $sum: "$amount" }
            }},
            { $sort: { "_id.month": 1 } }
          ],
          categories: [
            { $match: { date: { $gte: startDate } } },
            { $group: { _id: { type: "$type", category: "$category" }, total: { $sum: "$amount" } } }
          ],
          history: [
            { $sort: { date: -1, createdAt: -1 } },
            { $limit: 10 }
          ]
      }}
    ]);

    const result = stats[0] || { allTime: [], rangeStats: [], categories: [], history: [], thisYearTrends: [] };

    // Format trends
    const trends = Array.from({ length: 12 }, (_, i) => ({ month: i + 1, income: 0, expense: 0 }));
    result.thisYearTrends.forEach(item => {
      const idx = item._id.month - 1;
      if (item._id.type === 'income') trends[idx].income = item.total;
      if (item._id.type === 'expense') trends[idx].expense = item.total;
    });

    const summary = {
      totalBalance: 0,
      monthlyIncome: 0, // Now "Range Income"
      monthlyExpense: 0, // Now "Range Expense"
      savingRate: 0,
      recentTransactions: result.history || [],
      categoryBreakdown: result.categories.map(c => ({
        type: c._id.type,
        category: c._id.category,
        total: c.total
      })),
      monthlyTrends: trends
    };

    let totalIncomeAll = 0, totalExpenseAll = 0;
    result.allTime.forEach(item => {
      if (item._id === 'income') totalIncomeAll = item.total;
      if (item._id === 'expense') totalExpenseAll = item.total;
    });
    summary.totalBalance = totalIncomeAll - totalExpenseAll;

    result.rangeStats.forEach(item => {
      if (item._id === 'income') summary.monthlyIncome = item.total;
      if (item._id === 'expense') summary.monthlyExpense = item.total;
    });

    summary.savingRate = summary.monthlyIncome > 0 
      ? Math.round(((summary.monthlyIncome - summary.monthlyExpense) / summary.monthlyIncome) * 100) 
      : 0;

    res.status(200).json(summary);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



exports.getIncomes = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id, type: "income" }).sort({ date: -1 });
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getExpenses = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id, type: "expense" }).sort({ date: -1 });
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getTypedAnalytics = async (req, res) => {
  try {
    const { type } = req.params;
    const { filter = 'Monthly' } = req.query;
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const today = new Date();
    
    let startDate;
    let trendLabels = [];
    let trendData = [];

    // Define Date Ranges
    if (filter === 'Daily') {
      startDate = new Date(today.setHours(0,0,0,0));
      trendLabels = Array.from({length: 24}, (_, i) => `${i}:00`);
    } else if (filter === 'Weekly') {
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1);
      startDate = new Date(today.getFullYear(), today.getMonth(), diff);
      trendLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    } else if (filter === 'Yearly') {
      startDate = new Date(today.getFullYear(), 0, 1);
      trendLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    } else { // Monthly (Default)
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      trendLabels = Array.from({length: daysInMonth}, (_, i) => `${i+1}`);
    }

    const stats = await Transaction.aggregate([
      { $match: { userId, type, date: { $gte: startDate } } },
      { $facet: {
          summary: [
            { $group: {
                _id: null,
                total: { $sum: "$amount" },
                count: { $sum: 1 },
                avg: { $avg: "$amount" }
            }}
          ],
          trends: [
            { $group: {
                _id: filter === 'Yearly' ? { $month: "$date" } : 
                     filter === 'Weekly' ? { $dayOfWeek: "$date" } :
                     filter === 'Daily' ? { $hour: "$date" } :
                     { $dayOfMonth: "$date" },
                amount: { $sum: "$amount" }
            }},
            { $sort: { "_id": 1 } }
          ],
          list: [
            { $sort: { date: -1, createdAt: -1 } }
          ]
      }}
    ]);

    const result = stats[0];
    const summary = result.summary[0] || { total: 0, count: 0, avg: 0 };
    
    // Format trends array
    const trendValues = new Array(trendLabels.length).fill(0);
    result.trends.forEach(t => {
      let idx;
      if (filter === 'Yearly') idx = t._id - 1;
      else if (filter === 'Weekly') idx = t._id === 1 ? 6 : t._id - 2; // Sunday is 1 in Mongo
      else if (filter === 'Daily') idx = t._id;
      else idx = t._id - 1;
      
      if (idx >= 0 && idx < trendValues.length) trendValues[idx] = t.amount;
    });

    res.status(200).json({
      total: summary.total,
      average: Math.round(summary.avg),
      transactionsCount: summary.count,
      trendLabels,
      trendValues,
      transactions: result.list
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.updateTransaction = async (req, res) => {
  const { title, amount, type, category, date } = req.body;

  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ message: "Transaction not found" });

    // Ensure it belongs to the user
    if (transaction.userId.toString() !== req.user.id) {
       return res.status(401).json({ message: "Not authorized to update this transaction" });
    }

    // Update fields
    if (title !== undefined) transaction.title = title.trim();
    if (amount !== undefined) transaction.amount = Number(amount);
    if (type !== undefined) transaction.type = type;
    if (category !== undefined) transaction.category = category.trim();
    if (date !== undefined) transaction.date = new Date(date);

    const updated = await transaction.save();
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

