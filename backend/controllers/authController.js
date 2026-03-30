const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

const normalizeEmail = (email = "") => email.trim().toLowerCase();

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  const normalizedName = name?.trim();
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedName) {
    return res.status(400).json({ message: "Name is required." });
  }

  if (!emailRegex.test(normalizedEmail)) {
    return res.status(400).json({ message: "Invalid email format." });
  }

  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      message:
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.",
    });
  }

  try {
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name: normalizedName,
      email: normalizedEmail,
      password: hashedPassword,
    });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = normalizeEmail(email);

  if (!emailRegex.test(normalizedEmail)) {
    return res.status(400).json({ message: "Invalid email format." });
  }

  try {
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        profileImage: user.profileImage 
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
    const { name, email, profileImage } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    try {
      const updateData = { name: name?.trim(), email: normalizedEmail };
      if (profileImage !== undefined) updateData.profileImage = profileImage;

      const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        updateData,
        { new: true, runValidators: true }
      ).select("-password");

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.status(200).json({
      user: { 
        id: updatedUser._id, 
        name: updatedUser.name, 
        email: updatedUser.email,
        profileImage: updatedUser.profileImage || "" 
      },
      message: "Profile updated successfully"
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email is already in use by another user." });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!passwordRegex.test(newPassword)) {
    return res.status(400).json({
      message: "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.",
    });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Current password is incorrect" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

