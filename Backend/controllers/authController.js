const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// Register User
exports.register = async (req, res) => {
  try {
    const { userId, email, password, firstName, lastName, role, courses } =
      req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ userId }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user
    const user = await User.create({
      userId,
      email,
      password,
      firstName,
      lastName,
      role,
      courses: courses || [],
    });

    // Create token using the generateToken function
    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        userId: user.userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        courses: user.courses,
        profilePic: user.profilePic,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Error registering user" });
  }
};

// Login User
exports.login = async (req, res) => {
  try {
    const { userId, password } = req.body;

    // Find user
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Create token using the generateToken function
    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        _id: user._id,
        userId: user.userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        courses: user.courses,
        profilePic: user.profilePic,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Error logging in" });
  }
};

// Logout User
exports.logout = async (req, res) => {
  try {
    // Since we're using JWT tokens in the Authorization header,
    // we don't need to clear any cookies. The client will handle
    // removing the token from storage.
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Error during logout",
    });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    // The user is already attached to the request by the auth middleware
    const user = req.user;

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      _id: user._id,
      userId: user.userId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      courses: user.courses,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ message: "Error getting current user" });
  }
};
