const dotenv = require("dotenv");

const { app } = require("./app");

// Utils
const { initModels, initDiscount } = require("./models/initModels");
const { db } = require("./utils/database.util");

dotenv.config({ path: "./config.env" });

const startServer = async () => {
  try {
    await db.authenticate();

    // Establish the relations between models
    initModels();

    //For testing reset schemas everytime server starts
    await db.sync({ force: false });

    //Add Discounts
    initDiscount();

    // Set server to listen
    const PORT = 4000;

    app.listen(PORT, () => {
      console.log(`Express app running! in port ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

startServer();
