// Models
const { technical_contact } = require("../models/technical_contact.model");

// // Utils
const { catchAsync } = require("../utils/catchAsync.util");

const technicalContactExists = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const technicalContact = await technical_contact.findOne({ where: { id } });

  if (!technicalContact)
    return next(new AppError("Technical contact does not exists", 404));

  req.technicalContact = technicalContact;

  next();
});

module.exports = {
  technicalContactExists,
};
