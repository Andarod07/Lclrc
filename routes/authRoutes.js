const express = require("express");
const authRoutes = express.Router();
const { client } = require("./db");

const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken');

const Ldb = client.db("Ldb")
const users = Ldb.collection("users")


authRoutes.get("/",(req,res)=>{
    res.send("exec")
})

authRoutes.post("/register",async (req,res)=>{
    let username = req.body.username
    let password = await bcrypt.hash(req.body.password, 10)

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
    pswdMatch = await bcrypt.compare(password,user.password)
    
    if(pswdMatch){
        console.log(pswdMatch)
        const accessToken = jwt.sign(user, process.env.JWT_SECRET_KEY, { expiresIn: 60 });

        res.cookie('auth_token', accessToken, {
            httpOnly:true,
            secure:true,
            maxAge: 3600 * 1000
        });

        console.log(accessToken) 
        res.send(accessToken)

    } else {
        res.send("incorrect")
    }

    
});

authRoutes.post("/testJwt", async (req,res)=>{
    try{
        const token = req.cookies.auth_token;
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
        res.send(decoded)
    } catch {
        res.send("error")
    }
    
});

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