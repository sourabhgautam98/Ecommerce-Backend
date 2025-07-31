const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const JWT_SECRET = "sourabh_gautam";

// Get User Profile (from token)
exports.getUser = async (req, res) => {
  try {

    const userDetails = req.user;
    console.log({userDetails})
    // Find user by ID from token (exclude password)
    const user = await User.findById(userDetails.id).select("-password");
console.log({user})
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }


    // Send user profile information
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

exports.getUserWithMiddleware = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Register Super Admin (only one allowed)
exports.registerSuperAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      console.log("Missing required fields:", {
        name: !!name,
        email: !!email,
        password: !!password,
      });
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    // Check if admin already exists
    const adminExists = await User.findOne({ role: "admin" });
    if (adminExists) {
      console.log("Admin already exists");
      return res
        .status(400)
        .json({
          message: "Super Admin already exists. Only one admin is allowed.",
        });
    }

    // Check if email is already taken
    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log("Email already exists:", email);
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create super admin
    const admin = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "admin",
    });

    if (admin) {
      console.log("Super Admin created successfully:", {
        id: admin._id,
        email: admin.email,
        role: admin.role,
      });

      // Generate JWT token
      const token = jwt.sign(
        {
          id: admin._id,
          role: admin.role,
        },
        JWT_SECRET,
        { expiresIn: "30d" }
      );

      res.status(201).json({
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        token,
      });
    } else {
      console.log("Failed to create Super Admin");
      res.status(500).json({ message: "Failed to create Super Admin" });
    }
  } catch (error) {
    console.error("Super Admin registration error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
      details: error.toString(),
    });
  }
};

// Register user (email validation only)
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      console.log("Missing required fields:", {
        name: !!name,
        email: !!email,
        password: !!password,
      });
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    // Check if email already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log("Email already exists:", email);
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user with default role 'user'
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "user",
    });

    if (user) {
      console.log("User created successfully:", {
        id: user._id,
        email: user.email,
        role: user.role,
      });

      // Generate JWT token
      const token = jwt.sign(
        {
          id: user._id,
          role: user.role,
        },
        JWT_SECRET,
        { expiresIn: "30d" }
      );

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
      });
    } else {
      console.log("Failed to create user");
      res.status(500).json({ message: "Failed to create user" });
    }
  } catch (error) {
    console.error("User registration error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
      details: error.toString(),
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate JWT token with user information
    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "30d" }
    );
    // Send response with complete user information and token
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
exports.loginUser = exports.login;
