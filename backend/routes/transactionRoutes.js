const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { 
  addTransaction, 
  getTransactions, 
  deleteTransaction, 
  getStats, 
  getDashboardSummary,
  getIncomes,
  getExpenses,
  getTypedAnalytics,
  updateTransaction
} = require("../controllers/transactionController");

router.route("/")
  .get(auth, getTransactions)
  .post(auth, addTransaction);

router.get("/stats", auth, getStats);
router.get("/dashboard/summary", auth, getDashboardSummary);
router.get("/analytics/:type", auth, getTypedAnalytics);
router.get("/type/income", auth, getIncomes);
router.get("/type/expense", auth, getExpenses);

router.route("/:id")
  .put(auth, updateTransaction)
  .delete(auth, deleteTransaction);

module.exports = router;

