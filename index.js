const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET);

const port = process.env.PORT || 5000;

const app = express();

// middle ware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.z4ltr6s.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

// Verify jwt function
function verifyJWT(req, res, next) {
  // console.log("token inside function", req.headers.authorization);
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send("unauthorized access");
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

    //Payments Collection
    const paymentsCollection = client.db("resaleMarket").collection("payments");

    //GET Method
    //Categories api
    app.get("/categories", async (req, res) => {
      const query = {};
      const options = await categoryCollection.find(query).limit(3).toArray();
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
      // console.log(req.query);
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

    app.get("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await bookingsCollection.findOne(query);
      res.send(result);
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

    //JWT API
    app.get("/jwt", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      if (user) {
        const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, {
          expiresIn: "1h",
        });
        return res.send({ accessToken: token });
      }
      // console.log(user);
      res.status(403).send({ accessToken: "" });
    });

    //Make admin api using get method by id
    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      // console.log(user);
      res.send({ isAdmin: user?.role === "admin" });
    });

    //Make seller api using get method by id
    app.get("/users/seller/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      // console.log(user);
      res.send({ isSeller: user?.category === "Seller" });
    });

    //Make seller api using get method by id
    app.get("/users/buyer/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      // console.log(user);
      res.send({ isBuyer: user?.category === "Buyer" });
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

    // All users post api
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    //Payment Post method
    app.post("/create-payment-intent", async (req, res) => {
      const booking = req.body;
      const price = booking.price.slice(1);
      console.log(price);
      const amount = price * 100;

      const paymentIntent = await stripe.paymentIntents.create({
        currency: "usd",
        amount: amount,
        payment_method_types: ["card"],
      });
      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    });

    // Store payment info using api
    app.post("/payments", async (req, res) => {
      const payment = req.body;
      const result = await paymentsCollection.insertOne(payment);
      const id = payment.bookingId;
      const filter = { _id: ObjectId(id) };
      const updateDoc = {
        $set: {
          paid: true,
          transactionId: payment.transactionId,
        },
      };
      const updateResult = await bookingsCollection.updateOne(
        filter,
        updateDoc
      );
      res.send(result);
    });

    // Make admin api using put method
    app.put("/users/admin/:id", verifyJWT, async (req, res) => {
      const decodedEmail = req.decoded.email;
      const query = { email: decodedEmail };
      const user = await usersCollection.findOne(query);

      if (user?.role !== "admin") {
        return res.status(403).send({ message: "forbidden access" });
      }

      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await usersCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });

    // Seller verify status api using put method
    app.put("/users/sellerVerify/:id", verifyJWT, async (req, res) => {
      const decodedEmail = req.decoded.email;
      const query = { email: decodedEmail };
      const user = await usersCollection.findOne(query);

      if (user?.role !== "admin") {
        return res.status(403).send({ message: "forbidden access" });
      }

      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          status: "Verified",
        },
      };
      const result = await usersCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });

    //Delete Method api by Sellers
    app.delete("/sellers/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await usersCollection.deleteOne(filter);
      res.send(result);
    });

    // delete api for users
    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await usersCollection.deleteOne(filter);
      res.send(result);
    });

    // delete api for buyers
    app.delete("/buyers/:id", async (req, res) => {
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
