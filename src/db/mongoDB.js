require("dotenv").config();
const mongoose = require("mongoose");
require("./schema/User");
require("./schema/Device");

// The game runs without a database; only login and match records need it.
if (process.env.DB_URI) {
    // Failures are logged by the "error" listener below.
    mongoose.connect(process.env.DB_URI).catch(() => {});
} else {
    console.warn("DB_URI is not set. Login and match records are disabled.");
}

const db = mongoose.connection;
db.on("error", (error) => {
    console.error("connection error:", error);
});

db.on("connected", () => {
    console.log("Connected to MongoDB");
});

module.exports = mongoose;
