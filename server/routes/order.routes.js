const express = require("express");
const multer = require("multer");
var path = require("path");

// Controllers
const {
  createOrders,
  getMatchedOrderItems,
  getNotMatchedOrderItems,
  manuallyMatchOrders,
} = require("../controllers/order.controller");

//Utils
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "revenue/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

//Router
const orderRouter = express.Router();

orderRouter.post("/", createOrders);

orderRouter.post("/manual-match", upload.single("file[]"), manuallyMatchOrders);

orderRouter.get("/matched", getMatchedOrderItems);

orderRouter.get("/unmatched", getNotMatchedOrderItems);

module.exports = { orderRouter };
