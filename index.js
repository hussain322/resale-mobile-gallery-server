const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;

require("dotenv").config();
const app = express();

// middle ware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.z4ltr6s.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const categoryCollection = client
      .db("resaleMarket")
      .collection("categories");
    const phonesCollection = client.db("resaleMarket").collection("phones");

    app.get("/categories", async (req, res) => {
      const query = {};
      const options = await categoryCollection.find(query).toArray();
      res.send(options);
    });

    app.get("/category/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const category = await categoryCollection.findOne(query);
      res.send(category);
      // const query = await phonesCollection.filter(
      //   (phone) => phone.category_id === id
      // );
      // const categoryPhone = categoryCollection.find(query);
      // res.send(categoryPhone);
    });

    app.get("/phones", async (req, res) => {
      const query = {};
      const options = await phonesCollection.find(query).toArray();
      res.send(options);
    });

    app.get("/phones/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const phone = await phonesCollection.findOne(query);
      res.send(phone);
    });
  } finally {
  }
}
run().catch(console.log());

app.get("/", (req, res) => {
  res.send("resale server is running");
});

app.listen(port, () => {
  console.log(`resale server is running on ${port}`);
});
