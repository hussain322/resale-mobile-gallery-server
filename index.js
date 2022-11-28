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
    //Category Collection
    const categoryCollection = client
      .db("resaleMarket")
      .collection("categories");

    //Phones Collection
    const phonesCollection = client.db("resaleMarket").collection("phones");

    //Bookings Collection
    const bookingsCollection = client.db("resaleMarket").collection("bookings");

    //Bookings Collection
    const usersCollection = client.db("resaleMarket").collection("users");

    //GET Method
    //Categories api
    app.get("/categories", async (req, res) => {
      const query = {};
      const options = await categoryCollection.find(query).toArray();
      res.send(options);
    });

    //Category api Id
    app.get("/category/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const category = await categoryCollection.findOne(query);
      res.send(category);
    });

    //All Phones api
    app.get("/phones", async (req, res) => {
      const query = {};
      const options = await phonesCollection.find(query).toArray();
      res.send(options);
    });

    //single phone api by id
    app.get("/phones/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const phone = await phonesCollection.findOne(query);
      res.send(phone);
    });

    //Create Api by using Email
    app.get("/addProduct", async (req, res) => {
      console.log(req.query);
      const email = req.query.email;
      const query = { email: email };
      // const options = { sort: { createdTime: -1 } };
      // const cursor = phonesCollection.find(query, options);
      // const phones = await cursor.toArray();
      const phones = await phonesCollection.find(query).toArray();
      res.send(phones);
    });

    app.get("/bookings", async (req, res) => {
      console.log(req.query);
      const email = req.query.email;
      const query = { email: email };
      // const options = { sort: { createdTime: -1 } };
      // const cursor = phonesCollection.find(query, options);
      // const phones = await cursor.toArray();
      const bookings = await bookingsCollection.find(query).toArray();
      res.send(bookings);
    });

    //POST Method
    //Add a product api
    app.post("/addProduct", async (req, res) => {
      const product = req.body;
      const result = await phonesCollection.insertOne(product);
      res.send(result);
    });

    //Bookings Post
    app.post("/bookings", async (req, res) => {
      const booking = req.body;
      const result = await bookingsCollection.insertOne(booking);
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result);
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
