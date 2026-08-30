const analyticsService = require("../services/analyticsService");

const getOverview = async (req, res, next) => {
  try {
    const overview = await analyticsService.getOverview();

    res.status(200).json({
      success: true,
      data: overview,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOverview,
};
