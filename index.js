const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
    const usersCollection = database.collection("user");
    const applicationsCollection = database.collection("applications");
    const plansCollection = database.collection("plans")
    const subscriptionCollection = database.collection("subscription")

    // users api
    app.get('/api/users', async (req, res) => {
      const cursor = usersCollection.find({});
      const result = await cursor.toArray();
      res.send(result);
    });

    // jobs api
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

    app.get('/api/jobs/:id', async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await jobsCollection.findOne(query);
      res.send(result);
    })

    app.post('/api/jobs', async (req, res) => {
      const job = req.body;
      const newJob = {
        ...job,
        createdAt: new Date()
      }
      const result = await jobsCollection.insertOne(newJob);
      res.send(result);
    });

    // applications api
    app.get('/api/applications', async (req, res) => {
      const query = {};
      if(req.query.applicantId){
        query.applicantId = req.query.applicantId;
      }
      if(req.query.jobId){
        query.jobId = req.query.jobId;
      }
      const cursor = applicationsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post('/api/applications', async (req, res) => {
      const application = req.body;
      const newApplication = {
        ...application,
        createdAt: new Date()
      };
      const result = await applicationsCollection.insertOne(newApplication);
      res.send(result);
    });

    // companies api
    app.get('/api/companies', async (req, res) => {
      const cursor = companiesCollection.find({});
      const result = await cursor.toArray();
      res.send(result);
    });

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

    // plans
    app.get('/api/plans',async(req,res) =>{
      const query = {}
      if(req.query.plan_id){
        query.plan_id = req.query.plan_id
      }
      const plan = await plansCollection.findOne(query)
      res.send(plan)
    })

    // subscription
    app.post('/api/subscriptions',async(req,res)=>{
      const data = req.body
      const subInfo={
        ...data,
        createdAt: new Date()
      }
      const result = await subscriptionCollection.insertOne(subInfo)

      // update plan info 
      const filter={email:data.email}
      const updateDocument = {
        $set:{
          plan: data.planId
        }
      }
      const updateResult = await usersCollection.updateOne(filter,updateDocument)
      
      res.send(updateResult)
    })

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