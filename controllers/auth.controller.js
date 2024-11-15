const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
} = require("../utils/emailService");

// Signup logic
exports.signup = async (req, res) => {
  const { firstname, lastname, email, password, phone, dob } = req.body;
  try {
    // Check if user already exists
    let user = await User.findOne({ where: { email } });
    if (user) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    user = await User.create({
      firstname,
      lastname,
      email,
      password: hashedPassword,
      phone,
      dob,
      role: "user",
    });

    // Generate a verification token
    const verificationToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "30m" }
    );

    // Send verification email
    await sendVerificationEmail(user.email, verificationToken);

    res
      .status(201)
      .json({ message: "User registered, check your email for verification" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Verify email logic
exports.verifyEmail = async (req, res) => {
  const { token } = req.params;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(400).json({ error: "Invalid token" });
    }

    user.isVerified = true;
    await user.save();

    res.json({ message: "Email verified, you can now login" });
  } catch (err) {
    res.status(500).json({ error: "Token expired or invalid" });
  }
};

// Login logic
exports.login = async (req, res) => {
  const { email, password } = req.body;
  // console.log("Login", email);
  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.isVerified) {
      return res.status(400).json({ error: "Please verify your email" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const accessToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      user: {
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
      },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Refresh token logic
exports.refreshToken = (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.sendStatus(403);

  jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);

    const newAccessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ accessToken: newAccessToken });
  });
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    await sendPasswordResetEmail(user.email, resetToken);

    return res
      .status(200)
      .json({ message: "Password reset link sent to email" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({ message: "Token has expired" });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(400).json({ message: "Invalid token" });
    } else {
      return res
        .status(500)
        .json({ message: "An error occurred", error: error.message });
    }
  }
};

// Resend Verification Email
exports.resendVerificationEmail = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "User already verified" });
    }

    const verificationToken = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    await sendVerificationEmail(user.email, verificationToken);

    return res.status(200).json({ message: "Verification email resent" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error });
  }
};
