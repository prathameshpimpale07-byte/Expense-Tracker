const Budget = require("../models/Budget");
const Transaction = require("../models/Transaction");

const getMonthRange = (month) => {
  const [year, monthIndex] = (month || "").split("-").map(Number);

  if (!year || !monthIndex) {
    return null;
  }

  const start = new Date(Date.UTC(year, monthIndex - 1, 1));
  const end = new Date(Date.UTC(year, monthIndex, 0, 23, 59, 59, 999));
  return { start, end };
};

const getBudgetStats = async (userId, month, limit) => {
  const range = getMonthRange(month);
  if (!range) {
    return { spent: 0, remaining: limit, percentageUsed: 0, exceeded: false };
  }

  const expenses = await Transaction.find({
    userId,
    type: "expense",
    date: { $gte: range.start, $lte: range.end },
  });

  const spent = expenses.reduce((total, transaction) => total + transaction.amount, 0);
  const remaining = Math.max(limit - spent, 0);
  const percentageUsed = limit > 0 ? Number(((spent / limit) * 100).toFixed(2)) : 0;

  return {
    spent,
    remaining,
    percentageUsed,
    exceeded: limit > 0 && spent > limit,
  };
};

exports.getBudget = async (req, res) => {
  const { month } = req.query;

  if (!month) {
    return res.status(400).json({ message: "Month is required." });
  }

  try {
    let budget = await Budget.findOne({ userId: req.user.id, month });
    if (!budget) {
      budget = await Budget.create({ userId: req.user.id, limit: 0, month });
    }

    const stats = await getBudgetStats(req.user.id, month, budget.limit);
    res.status(200).json({
      ...budget.toObject(),
      ...stats,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.updateBudget = async (req, res) => {
  const { month, limit } = req.body;

  if (!month) {
    return res.status(400).json({ message: "Month is required." });
  }

  if (Number(limit) < 0) {
    return res.status(400).json({ message: "Budget limit cannot be negative." });
  }

  try {
    const budget = await Budget.findOneAndUpdate(
      { userId: req.user.id, month },
      { limit: Number(limit) },
      { new: true, upsert: true }
    );

    const stats = await getBudgetStats(req.user.id, month, budget.limit);
    res.status(200).json({
      ...budget.toObject(),
      ...stats,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
