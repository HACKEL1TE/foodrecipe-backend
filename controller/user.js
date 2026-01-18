const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSignUp = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email and password are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const hashPwd = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email, password: hashPwd });

    const token = jwt.sign(
      { email: newUser.email, id: newUser._id, name: newUser.name },
      process.env.SECRET_KEY
    );

    return res.status(200).json({ 
      token, 
      user: { 
        _id: newUser._id, 
        name: newUser.name, 
        email: newUser.email 
      } 
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid password" });
    }

    const token = jwt.sign(
      { email: user.email, id: user._id, name: user.name },
      process.env.SECRET_KEY
    );

    return res.status(200).json({ 
      token, 
      user: { 
        _id: user._id, 
        name: user.name, 
        email: user.email 
      } 
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.json({ name: user.name, email: user.email });
  } catch (err) {
    res.status(500).json({ error: "Error fetching user" });
  }
};

module.exports = { userLogin, userSignUp, getUser };