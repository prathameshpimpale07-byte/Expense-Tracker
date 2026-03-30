const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { getBudget, updateBudget } = require("../controllers/budgetController");

router.route("/")
  .get(auth, getBudget)
  .post(auth, updateBudget);

module.exports = router;
