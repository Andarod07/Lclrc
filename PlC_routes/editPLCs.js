const express = require("express");
const editPLCs = express.Router();
const { PLC } = require('ethernet-ip');

const { client } = require("../routes/db");

const Ldb = client.db("Ldb")
const plcs = Ldb.collection("plcs")

editPLCs.get("/",async (req,res)=>{
    let plc = await plcs.find().toArray()
    res.json(plc)
})

testPLC = {
  name: "Line1_Motor_PLC",
  ip: "127.0.0.1", // your simulator for now
  slot: 0,
  pollIntervalMs: 2000,
  tags: [
    { name: "Motor1_Temp", label: "temperature" },
    { name: "Motor1_RPM", label: "rpm" },
    { name: "Motor1_Current", label: "current" },
    { name: "Motor1_Status", label: "status" }
  ],
  enabled: true
}

editPLCs.post("/test",async (req,res)=>{
    await plcs.insertOne(testPLC)
    res.send("Inserted "+testPLC.name)
})

editPLCs.post("/delete_test",async (req,res)=>{
    await plcs.deleteOne({name:"Line1_Motor_PLC"})

    res.send("deleted "+testPLC.name)
})


editPLCs.get("/readPLC",async (req,res)=>{


    res.json(plcDB)
})


module.exports = editPLCs;