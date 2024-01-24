const express = require("express");

// Controllers
const {
  getQuotebyId,
  createQuotes,
  getTechnicalContactQuotes,
} = require("../controllers/quote.controllers");

// Middlewares
const { quoteExists } = require("../middlewares/quotes.middlewares");
const {
  technicalContactExists,
} = require("../middlewares/technical_contact.middlewares");

//Router
const quoteRouter = express.Router();

quoteRouter.get("/", createQuotes);

quoteRouter.get("/:id", quoteExists, getQuotebyId);

quoteRouter.get(
  "/technical-contact/:id",
  technicalContactExists,
  getTechnicalContactQuotes
);

module.exports = { quoteRouter };
