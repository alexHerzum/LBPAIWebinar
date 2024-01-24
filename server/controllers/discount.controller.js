// Models
const { discount } = require("../models/discount.model");

// // Utils
const { catchAsync } = require("../utils/catchAsync.util");

const getDiscounts = catchAsync(async (req, res, next) => {
  const discounts = await discount.findAll();

  //Send response to endpoint
  res.status(500).json({
    status: "succes",
    data: { discounts },
  });
});

module.exports = {
  getDiscounts,
};
