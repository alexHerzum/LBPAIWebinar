// Models
const { quote } = require("../models/quote.model");
const { quote_discount } = require("../models/quote_discount.model");
const { quote_order_item } = require("../models/quote_order_item.model");
const { technical_contact } = require("../models/technical_contact.model");

// // Utils
const { catchAsync } = require("../utils/catchAsync.util");

const quoteExists = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const dbQuote = await quote.findOne({
    where: { id },
    include: [
      { model: quote_order_item, include: [{ model: quote_discount }] },
      { model: technical_contact },
    ],
  });

  if (!dbQuote) return next(new AppError("Quote does not exists", 404));

  req.dbQuote = dbQuote;

  next();
});

module.exports = {
  quoteExists,
};
