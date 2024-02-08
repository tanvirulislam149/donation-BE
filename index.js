const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1gt7l1o.mongodb.net/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
    await client.connect();
    console.log("db connected");

    app.get('/asdf', (req, res) => {
      res.send('Hello World from donation db')
    })

    const donationCollection = client.db("donation").collection("allDonation");
    const donationListCollection = client.db("donation").collection("donationList");
    const userCollection = client.db("donation").collection("user");

    app.get("/getAllDonation", async (req, res) => {
      const query = {};
      const cursor = donationCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get("/getDonation/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await donationCollection.findOne(query);
      res.send(result);
    })
    app.post("/postDonation", async (req, res) => {
      const result = await donationListCollection.insertOne(req.body);
      res.send(result);
    })
    app.get("/getUserDonation/:email", async (req, res) => {
      const list = donationListCollection.find(req.params).sort({ "_id": -1 });
      const listResult = await list.toArray();
      const all = donationCollection.find({}).sort({ "_id": -1 });
      const allResult = await all.toArray();
      const result = allResult.filter(r => listResult.find(l => l.title === r.title))
      res.send(result.splice(0, 4));
    })
    app.get("/getUserAllDonation/:email", async (req, res) => {
      const list = donationListCollection.find(req.params).sort({ "_id": -1 });
      const listResult = await list.toArray();
      res.send(listResult);
    })
    app.post("/postUser", async (req, res) => {
      const result = await userCollection.insertOne(req.body);
      res.send(result);
    })
    app.get("/checkAdmin/:email", async (req, res) => {
      const result = await userCollection.findOne(req.params);
      res.send(result);
    })
    app.post("/createDonation", async (req, res) => {
      const result = await donationCollection.insertOne(req.body);
      res.send(result);
    })

    app.put("/updateDonation/:id", async (req, res) => {
      const result = await donationCollection.updateOne({ _id: new ObjectId(req.params.id) }, { $set: req.body });
      res.send(result);
    })
    app.delete("/deleteDonation/:id", async (req, res) => {
      const result = await donationCollection.deleteOne({ _id: new ObjectId(req.params.id) });
      res.send(result);
    })

  } finally {

  }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello World from donation')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})