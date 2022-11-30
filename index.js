const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const port = process.env.PORT || 5000;

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

//Jwt middle ware function
function verifyJWT(req, res, next) {
  console.log("token inside verify jwt", req.headers.authorization);
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).send("unauthorized access");
  }
  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
}

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
      const phones = await phonesCollection.find(query).toArray();
      res.send(phones);
    });

    app.get("/bookings", verifyJWT, async (req, res) => {
      const email = req.query.email;
      const decodedEmail = req.decoded.email;
      if (email !== decodedEmail) {
        return res.status(403).send({ message: "forbidden access" });
      }
      const query = { email: email };
      const bookings = await bookingsCollection.find(query).toArray();
      res.send(bookings);
    });

    //Jwt api
    app.get("/jwt", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      if (user) {
        const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, {
          expiresIn: "24h",
        });
        res.send({ accessToken: token });
      }
      res.status(401).send({ accessToken: "" });
    });

    // All users api
    app.get("/users", async (req, res) => {
      const query = {};
      const result = await usersCollection.find(query).toArray();
      res.send(result);
    });

    //All sellers api
    app.get("/sellers", async (req, res) => {
      const query = {};
      const result = await usersCollection
        .find({ category: "Seller" })
        .toArray();
      res.send(result);
    });

    //All buyers api
    app.get("/buyers", async (req, res) => {
      const query = {};
      const result = await usersCollection
        .find({ category: "Buyer" })
        .toArray();
      res.send(result);
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

    //Admin Api
    app.put("/users/admin/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    //Delete Method api
    app.delete("/sellers/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await usersCollection.deleteOne(filter);
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
