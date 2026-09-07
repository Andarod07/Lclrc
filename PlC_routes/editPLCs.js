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
    name: "PLC_001",

    plant: "Plant_01",
    area: "Area_A",
    line: "Line_01",

    connection: {
      ip: "127.0.0.1",
      slot: 0
    },

    pollIntervalMs: 2000,

    tags: [
      {
        address: "Motor1_Temp",
        equipment: "Motor_01",
        metric: "temperature",
        unit: "°C"
      },
      {
        address: "Motor1_RPM",
        equipment: "Motor_01",
        metric: "speed",
        unit: "rpm"
      },
      {
        address: "Motor1_Current",
        equipment: "Motor_01",
        metric: "current",
        unit: "A"
      },
      {
        address: "Motor1_Status",
        equipment: "Motor_01",
        metric: "status",
        unit: null
      }
    ],

    enabled: true
  }

editPLCs.post("/plcPost",async (req,res)=>{
    await plcs.insertOne(req.body)
    res.send("Inserted "+req.name)
})

editPLCs.post("/deletePLC",async (req,res)=>{
    await plcs.deleteOne({name:"PLC_001"})

    res.send("deleted "+testPLC.name)
})


editPLCs.get("/readPLC",async (req,res)=>{


    res.json(plcDB)
})


module.exports = editPLCs;