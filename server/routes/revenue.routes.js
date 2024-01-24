const express = require("express");
const multer = require("multer");
var path = require("path");

// Controllers
const {
  createRevenueEntry,
  getUnmatchedRevenueItems,
} = require("../controllers/revenue.controller");

//Utils
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "revenue/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); //Appending extension
  },
});

const upload = multer({ storage: storage });

//Route

const revenueRouter = express.Router();

revenueRouter.post("/", upload.single("file[]"), createRevenueEntry);

revenueRouter.get("/unmatched", getUnmatchedRevenueItems);

module.exports = { revenueRouter };
