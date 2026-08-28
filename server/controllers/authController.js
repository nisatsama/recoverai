const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");

const generateToken = (merchantId) => {
  return jwt.sign({ merchantId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingMerchant = await prisma.merchant.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (existingMerchant) {
      return res.status(409).json({
        message: "Merchant with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const merchant = await prisma.merchant.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    const token = generateToken(merchant.id);

    return res.status(201).json({
      message: "Merchant registered successfully",
      token,
      merchant,
    });
  } catch (error) {
    console.error("Register error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const merchant = await prisma.merchant.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (!merchant || !merchant.password) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const passwordMatch = await bcrypt.compare(password, merchant.password);

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = generateToken(merchant.id);

    return res.status(200).json({
      message: "Login successful",
      token,
      merchant: {
        id: merchant.id,
        name: merchant.name,
        email: merchant.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const merchant = await prisma.merchant.findUnique({
      where: {
        id: req.merchant.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!merchant) {
      return res.status(404).json({
        message: "Merchant not found",
      });
    }

    return res.status(200).json({
      merchant,
    });
  } catch (error) {
    console.error("Get me error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// POST /api/auth/logout
const logout = async (req, res) => {
  return res.status(200).json({
    message: "Logout successful",
  });
};

module.exports = {
  register,
  login,
  getMe,
  logout,
};
