const express = require('express');
const app = express(); 
const port = process.env.PORT || 5000;
const admin = require("firebase-admin");
const fileUpload = require('express-fileupload'); // used for file upload.
//for .env variable must have declare.
require('dotenv').config()
//middlewaire.......
var cors = require("cors");
app.use(cors());
app.use(express.json());
app.use(fileUpload()); // used for file upload.

const ObjectId = require('mongodb').ObjectId;
const stripe = require('stripe')(process.env.STRIPE_SECRET) // payments



//external 
const { MongoClient } = require('mongodb');

//doctors-portal-4cb0c.json
// from firebase>  project settings > Service Accounts.
const serviceAccount = require('./doctors-portal-4cb0c-firebase-adminsdk.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


async function verifyToken(req, res, next) {
  console.log(req.headers.authorization);

  if(req.headers?.authorization?.startsWith('Bearer ')){
    const token = req.headers.authorization.split(' ')[1];
    console.log(token);
  try{
    const decodedUser = await admin.auth().verifyIdToken(token);
    console.log(decodedUser);
    req.decodedEmail = decodedUser.email;
  }
  catch{

  }

  }
  next();
}


// Doctors-portal
// Pi8SBqYUVRBgOG1t
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.u6fw9.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


// ALl Works will happen happend.
async function run () {
    try {
    await client.connect();
    const database = client.db("Doctors-portal");  
    const appointmentsCollection = database.collection("appoitment-info");
    const usersCollection = database.collection("users");
    const DoctorsCollection = database.collection("doctors");
     

    // insert appointment info on database.
    app.post('/appointments', async (req, res) => {  
      const appointment = req.body;
      const result = await appointmentsCollection.insertOne(appointment);
      res.send(result);
    })

    
    // geting appointmentInfo from database. 
    app.get('/appointments', async (req, res) => {
        const email = req.query.email;
        const date = new Date(req.query.date).toLocaleDateString();
        const query = {email: email, date: date};
        const result = await appointmentsCollection.find(query).toArray();
        res.json(result);
    })


    app.get('/appointments/:id', async (req, res) => {
      const query =  { _id : ObjectId(req.params.id)};
      const result = await appointmentsCollection.findOne(query);
      res.send(result);
      console.log(result);
    })


    
    // add user login extra information on database.....
    app.post('/users', async (req, res) => {
        const user = req.body;
        const result = await usersCollection.insertOne(user);
        res.send(result);
      })



    // google login (update or insert)
    app.put('/users', async (req, res) => {
      const user= req.body;
      console.log(user)
      const filter = {email: user.email};
      const options = {upsert: true};
      const updateDoc = {$set: user};
      const result = await usersCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    })

    
    // make as admin by email & role attribute...... 
    app.put('/users/admin', verifyToken, async (req, res) => {
      const user = req.body;
      // console.log('decoded', req.decodedEmail);  
      const requester = req.decodedEmail;
      if(requester){
         const reqesterAccount = await usersCollection.findOne({email: requester});
         console.log(reqesterAccount);
         if(reqesterAccount?.role === 'admin'){
            const filter = {email: user.email};
            const updateDoc = {$set: {role: 'admin'}};
            const result = await usersCollection.updateOne(filter,   updateDoc); 
            res.send(result);
            console.log(result);
         }
      }else{
        res.status(403).send({ message: 'You don not have access!'} )
      }
    })


  // add doctor information and Picture......................... 
  // add doctor information and Picture......................... 
  // add doctor information and Picture......................... 
  app.post('/doctors', async (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const pic = req.files.image;
    const picData = pic.data;
    const encodedPic = picData.toString('base64');
    const imageBuffer = Buffer.from(encodedPic, 'base64');
    const doctor = {
        name,
        email,
        image: imageBuffer
    }
    const result = await DoctorsCollection.insertOne(doctor);
    res.json(result);
})


// Show doctors on Ui................
app.get('/doctors', async (req, res)=>{
  const result = await DoctorsCollection.find({}).toArray();
  res.send(result);
  console.log(result);
})



    // if login email is admin, then he can make annother admin account throw this logic.
    app.get('/users/:email', async (req, res) => {
      const email = req.params.email;
      const query = {email: email};
      // console.log(query);
      const user = await usersCollection.findOne(query);
      console.log(user)
      let isAdmin = false;
      if(user?.role === 'admin'){
        isAdmin = true;
      }
      console.log(isAdmin)
      res.send({admin: isAdmin});
    }) 


   
   
    // payment integration...............  
    app.post('/create-payment-intent', async (req, res) => {
      const paymentInfo = req.body;
      const amount = paymentInfo.price * 100;
      const paymentIntent = await stripe.paymentIntents.create({
          currency: 'usd',
          amount: amount,
          payment_method_types: ['card']
      });
      res.json({ clientSecret: paymentIntent.client_secret })
  })



  // get appoint id for updating payments information on database.
  app.put('/appointments/:id', async (req, res) => {
    const filter = {_id: ObjectId(req.params.id)};
    const payment = req.body;
    const updateDoc = {
      $set: {payment: payment}
    }
    const result = await appointmentsCollection.updateOne(filter, updateDoc);
    res.json(result);
    console.log(result);
  })



    }
    finally {
     // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) =>{
    res.send('Server is running...')
});

app.listen(port, () =>{
    console.log('listening on port', port);
})       