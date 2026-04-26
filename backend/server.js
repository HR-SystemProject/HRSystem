const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

require("dotenv").config();

const app = express();

require("./models/db");

// Middleware
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;


// Test route
app.get("/", (req, res) => {
  res.send("API is running");
});


app.listen(PORT, () => {
  console.log(`Example application listening at http://localhost:${PORT}`);
});
