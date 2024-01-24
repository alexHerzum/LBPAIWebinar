const express = require("express");
const path = require("path");
const cors = require("cors");

// Routers
const { orderRouter } = require("./routes/order.routes");
const { quoteRouter } = require("./routes/quotes.routes");
const { revenueRouter } = require("./routes/revenue.routes");
const { technicalContactRouter } = require("./routes/technical_contact.routes");
const { discountRouter } = require("./routes/discount.routes");

// Controllers
const { globalErrorHandler } = require("./controllers/error.controller");

// Init our Express app
const app = express();

// Enable cors
app.use(cors());

// Enable Express app to receive JSON data
app.use(express.json());

// Define endpoints
app.use("/v1/orders", orderRouter);
app.use("/v1/quotes", quoteRouter);
app.use("/v1/revenue", revenueRouter);
app.use("/v1/technical_contacts", technicalContactRouter);
app.use("/v1/discounts", discountRouter);

app.use(express.static(path.join(__dirname, "..", "dist")));

app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, "..", "dist", "index.html"));
});

// Global error handler
app.use(globalErrorHandler);

// Catch non-existing endpoints
app.all("*", (req, res) => {
  res.status(404).json({
    status: "error",
    message: `${req.method} ${req.url} does not exists in our server`,
  });
});

module.exports = { app };
