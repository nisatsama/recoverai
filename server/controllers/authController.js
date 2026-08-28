const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

/**
 * Generate JWT
 */
const generateToken = (merchantId) => {
  return jwt.sign({ merchantId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

/**
 * Remove password from merchant object
 */
const sanitizeMerchant = (merchant) => {
  const { password, ...merchantWithoutPassword } = merchant;

  return merchantWithoutPassword;
};

/**
 * POST /api/auth/register
 * Register a merchant using email/password
 */
const registerMerchant = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    // Validate name
    if (name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Name must be at least 2 characters long",
      });
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    // Validate password
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    // Check whether merchant already exists
    const existingMerchant = await prisma.merchant.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (existingMerchant) {
      return res.status(409).json({
        success: false,
        message: "Merchant with this email already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create merchant
    const merchant = await prisma.merchant.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        authProvider: "local",
      },
    });

    // Generate JWT
    const token = generateToken(merchant.id);

    // Never return password
    const safeMerchant = sanitizeMerchant(merchant);

    return res.status(201).json({
      success: true,
      message: "Merchant registered successfully",
      token,
      merchant: safeMerchant,
    });
  } catch (error) {
    console.error("Register merchant error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * POST /api/auth/login
 * Login merchant using email/password
 */
const loginMerchant = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Find merchant
    const merchant = await prisma.merchant.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    // Avoid revealing whether email exists
    if (!merchant) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Google-only account cannot use password login
    if (!merchant.password) {
      return res.status(401).json({
        success: false,
        message: "This account uses Google authentication",
      });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, merchant.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate JWT
    const token = generateToken(merchant.id);

    // Never return password
    const safeMerchant = sanitizeMerchant(merchant);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      merchant: safeMerchant,
    });
  } catch (error) {
    console.error("Login merchant error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * GET /api/auth/me
 * Get currently authenticated merchant
 *
 * Requires auth middleware.
 * Middleware should set req.merchantId
 */
const getCurrentMerchant = async (req, res) => {
  try {
    if (!req.merchantId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Find merchant using ID from verified JWT
    const merchant = await prisma.merchant.findUnique({
      where: {
        id: req.merchantId,
      },
    });

    if (!merchant) {
      return res.status(404).json({
        success: false,
        message: "Merchant not found",
      });
    }

    // Never return password
    const safeMerchant = sanitizeMerchant(merchant);

    return res.status(200).json({
      success: true,
      merchant: safeMerchant,
    });
  } catch (error) {
    console.error("Get current merchant error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  registerMerchant,
  loginMerchant,
  getCurrentMerchant,
};
