const jwt = require("jsonwebtoken");
const User = require("../models/user");

const verifyToken = async (req, res, next) => {
  console.log("=== MIDDLEWARE CALLED ===");
  console.log("Headers:", req.headers);
  
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    console.log("No authorization header");
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    console.log("No token after split");
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    console.log("Token verified successfully:", decoded);
    
    // Fetch the full user data to get the name
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    
    // Attach user data with name
    req.user = {
      id: user._id,
      email: user.email,
      name: user.name
    };
    
    console.log("User attached to request:", req.user);
    next();
  } catch (err) {
    console.error("JWT verification error:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = verifyToken;