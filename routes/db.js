//MongoDB connection and init
const { MongoClient } = require('mongodb');
const url = "mongodb+srv://angeldavidbecerra5_db_user:CBEZeUqOxTOItDc0@cluster0.tdkca5e.mongodb.net/?appName=Cluster0";
const client = new MongoClient(url);

async function connectDB() {
     try {
        await client.connect();
        console.log("connected to mongoDB database");
     } catch (error) {
        console.error(error);
     }
}

connectDB()

module.exports = { client };
