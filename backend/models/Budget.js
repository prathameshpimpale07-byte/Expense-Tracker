const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  limit: { type: Number, required: true },
  month: { type: String, required: true } // format: "YYYY-MM"
});

module.exports = mongoose.model("Budget", budgetSchema);
