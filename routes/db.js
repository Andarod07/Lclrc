// MongoDB connection and init
require('dotenv').config();
const { MongoClient } = require('mongodb');

const url = process.env.MONGODB_URI;
if (!url) console.error('MONGODB_URI is not set in environment');
const client = new MongoClient(url);

async function connectDB() { 
     try {
        await client.connect();
        await console.log("connected to mongoDB database");
     } catch (error) {
        console.error(error);
     }
}

connect = async ()=>{await connectDB()}
connect()

module.exports = { client };