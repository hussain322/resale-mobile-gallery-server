const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const port = process.env.PORT || 5000;

require("dotenv").config();
const app = express();

// middle ware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("resale server is running...");
});

app.listen(port, () => {
  console.log(`resale server is running on ${port}`);
});
