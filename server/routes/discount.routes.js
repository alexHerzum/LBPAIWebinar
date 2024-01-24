const express = require("express");

// Controllers
const { getDiscounts } = require("../controllers/discount.controller");

// Middlewares

//Router
const discountRouter = express.Router();

discountRouter.get("/", getDiscounts);

module.exports = { discountRouter };
