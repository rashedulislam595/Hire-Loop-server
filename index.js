const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = 5000;

const uri = process.env.MONGO_DB_URI;

app.use(cors());
app.use(express.json());

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

    const database = client.db("HireLoop");
    const jobsCollection = database.collection("jobs");
    const companiesCollection = database.collection("companies");

    app.get('/api/jobs', async (req, res) => {
        const query = {};
        if(req.query.companyId){
            query.companyId = req.query.companyId;
        }
        if(req.query.status){
            query.status = req.query.status;
        }
        const cursor = jobsCollection.find(query);
        const result = await cursor.toArray();
        res.send(result);
    });

    app.post('/api/jobs', async (req, res) => {
      const job = req.body;
      const newJob = {
        ...job,
        createdAt: new Date()
      }
      const result = await jobsCollection.insertOne(newJob);
      res.send(result);
    });

    // companies api
    app.get('/api/my-companies', async (req, res) => {
      const query = {};
      if(req.query.recruiterId){
        query.recruiterId = req.query.recruiterId;
      };
      const result = await companiesCollection.findOne(query);
      res.send(result || {});
    });

    app.post('/api/companies',async(req, res) => {
      const company = req.body;
      const newCompany = {
        ...company,
        createdAt: new Date()
      };
      const result = await companiesCollection.insertOne(newCompany);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});