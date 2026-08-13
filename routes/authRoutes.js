const express = require("express");
const authRoutes = express.Router();
const { client } = require("./db");


const Ldb = client.db("Ldb")
const users = Ldb.collection("users")


authRoutes.get("/",(req,res)=>{
    res.send("exec")
})

authRoutes.post("/register",async (req,res)=>{
    let username = req.body.username
    let password = req.body.password
    let role = req.body.role 
    let newUser = {username: username, password:password, role:role}

    let user = await users.findOne({username:username})

    if (!user){
        await users.insertOne(newUser)
        res.send('user '+ username +' added')
    } else {
        res.send("User alr exists")
    }

})

authRoutes.post("/login", async (req,res)=>{
    let username = req.body.username
    let password = req.body.password
    
    let user = await users.findOne({username:username})
    console.log(user)
    res.send(user)
})

authRoutes.delete("/",async (req,res)=>{
    let username = req.body.username
    let user = await users.findOne({username:username})

    if (user){
        await users.deleteOne({username:username})
        res.send("User Deleted")
    } else {
        res.send("User doesnt exist")
    }
    
    
    
})

module.exports = authRoutes;
