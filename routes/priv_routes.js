const express = require("express");
const privRoutes = express.Router();

privRoutes.get("/",async(req,res)=>{
    res.send("Successful token")        
});

privRoutes.post("/logout", async(req,res)=>{
    res.clearCookie('auth_token');
    res.status(200).json({ message: 'Logged out successfully' });    
});

module.exports = privRoutes;

