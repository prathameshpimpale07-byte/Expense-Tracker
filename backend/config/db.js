const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected ✅");
  } catch (error) {
    console.error("MongoDB Error ❌:", error);git add .
git commit -m "fix mongo uri"
git push
    process.exit(1);
  }
};

module.exports = connectDB;