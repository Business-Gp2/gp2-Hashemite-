const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  try {
    // Check for token in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }

      try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from token
        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
          return res.status(401).json({ message: "User not found" });
        }

        // Set user in request
        req.user = {
          ...user.toObject(),
          id: user._id.toString(),
        };

        next();
      } catch (error) {
        console.error("Token verification error:", error);
        if (error.name === "TokenExpiredError") {
          return res.status(401).json({ message: "Token expired" });
        }
        if (error.name === "JsonWebTokenError") {
          return res.status(401).json({ message: "Invalid token" });
        }
        return res.status(401).json({ message: "Not authorized" });
      }
    } else {
      return res.status(401).json({ message: "Not authorized, no token" });
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = { protect };
