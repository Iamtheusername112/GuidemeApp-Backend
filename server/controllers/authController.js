const authController = require("express").Router();
const user = require("../models/User.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//   function to generate JWT token
const generateToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "5h",
  });
};

// Regex pattern for email validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Regex pattern for password validation
const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/;

// Authentication during user registration
authController.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if input fields are empty
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    // Check if email and password follow the regex patterns
    if (!emailRegex.test(email)) {
      throw new Error("Invalid email format");
    }

    if (!passwordRegex.test(password)) {
      throw new Error(
        "Password must contain at least 8 characters, including one digit, one lowercase, and one uppercase letter"
      );
    }

    // Check if email already exists
    const isEmailExisting = await user.findOne({ email });
    if (isEmailExisting) {
      throw new Error("Email is already registered");
    }

    // Hash the password using bcrypt
    const hashPassword = await bcrypt.hash(password, 10);

    // Create a new user and store in the database
    const createNewUser = await user.create({
      ...req.body,
      password: hashPassword,
    });

    // Remove the password from the user object before sending the response
    const { password: hashedPassword, ...others } = createNewUser._doc;
    const token = generateToken(createNewUser);
    return res.status(201).json({ user: others, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Authentication during user Login

authController.post("/login", async (req, res) => {
  try {
    const user = await user.findOne({ email: req.body.email });
    if (!user) {
      throw new Error("Invalid credentials");
    }

    const comparePassword = await bcrypt.compare(
      { password: req.body.password },
      user.password
    );

    if (!comparePassword) {
      throw new Error("Invalid credentials");
    }

    const { password, ...others } = user._doc;
    //   function to generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "5h",
    });
    return res.status(200).json({ others, token });
  } catch (error) {
    res.status(500).json(error.message);
  }
});

module.exports = authController;
