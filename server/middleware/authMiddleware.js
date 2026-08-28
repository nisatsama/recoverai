const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const merchant = await prisma.merchant.findUnique({
      where: {
        id: decoded.merchantId,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!merchant) {
      return res.status(401).json({
        message: "Merchant not found",
      });
    }

    req.merchant = merchant;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token expired",
      });
    }

    return res.status(401).json({
      message: "Invalid token",
    });
  }
};

module.exports = authMiddleware;
