const express = require("express");

// Controllers
const {
  getTechnicalContacts,
} = require("../controllers/technical_contact.controller");

const technicalContactRouter = express.Router();

technicalContactRouter.get("/", getTechnicalContacts);

module.exports = { technicalContactRouter };
