// Models
const { technical_contact } = require("../models/technical_contact.model");
const { quote } = require("../models/quote.model");

// // Utils
const { catchAsync } = require("../utils/catchAsync.util");

const getTechnicalContacts = catchAsync(async (req, res, next) => {
  const technicalContacts = await technical_contact.findAll({
    include: { model: quote, required: true },
  });

  //Send response to endpoint
  res.status(200).json({
    status: "succes",
    data: { technicalContacts },
  });
});

module.exports = {
  getTechnicalContacts,
};
