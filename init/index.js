const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

// main()
//   .then(() => {
//     console.log("connected to DB");
//   })
//   .catch((err) => {
//     console.log(err);
//   });
 
async function main() {
  await mongoose.connect(MONGO_URL);
  console.log("connected to DB");
  await initDB();   //run DB initialization after connection
}

const initDB = async () => {
  await Listing.deleteMany({});
  initData.data = initData.data.map((obj) => ({...obj, owner: "6960f38812555acdc2317dd2"}));
  await Listing.insertMany(initData.data);
  console.log("data was initialized");
};

main().catch((err) => console.log(err));
