require("colors");
const mongoose = require("mongoose");
const mongoURL = process.env.MONGODB_TOKEN;
const cowsay = require("cowsay")

module.exports = async (client) => {
  if (!mongoURL) return;
  mongoose.set("strictQuery", true);

  if (await mongoose.connect(mongoURL)) {
    console.log(`Connected to the MongoDB database.`.green);
  }

};