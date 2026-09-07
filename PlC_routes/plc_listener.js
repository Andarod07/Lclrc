const express = require("express");
const { PLC } = require('ethernet-ip');
const { client } = require("../routes/db");

const Ldb = client.db("Ldb")
const plcs = Ldb.collection("plcs")

//INFLUX
const { InfluxDBClient, Point } = require('@influxdata/influxdb3-client');

//INIT INFLUX
async function initInflux() {
  const influx = await import("@influxdata/influxdb3-client");

  InfluxDBClient = influx.InfluxDBClient;
  Point = influx.Point;

  const influxClient = new InfluxDBClient({
    host: process.env.INFLUX_URL,
    token: process.env.INFLUXDB_TOKEN
  });

  return influxClient;
}




class PlcConnection {
  constructor(name) {
    this.name = name 
    this.config;       // the Mongo document: ip, slot, tags, pollIntervalMs...
    this.db = null;             // so it can insert readings itself
    this.plc = null;            // will hold the `PLC` instance once connected
    this.intervalId = null;     // so `stop()` can clear it later
    this.connected = false;
  }

  async pollOnce() {
    // Read all tags in this.config.tags, build a reading object,
    // insert into this.db. What did Stage 7 look like?
    const plc = new PLC();
    const plcDB = await plcs.findOne({name: this.name})//.toArray();
    //console.log(plcDB)
    let name = plcDB.name;
    let ip = plcDB.ip;
    let slot = plcDB.slot;
    let pollIntervalMs = plcDB.pollIntervalMs;
    let tags = plcDB.tags;
    let enabled = plcDB.enabled;
    
    this.config = {name,ip,slot,pollIntervalMs,tags,enabled};
    console.log(this.config);
  }

  async connect() {
    const plc = new PLC();
    let ip = this.config.ip;
    let slot = this.config.slot;
    console.log(ip);
    console.log(slot);

    await plc.connect(ip, { slot: slot });
    this.plc = plc;
    //console.log(this.plc);
    console.log('Connected to simulated PLC');
  }

  async init() {
    await this.pollOnce();
    console.log(this.config.enabled)
    await this.connect();
  }

  async test(){
    await this.init()

    this.config.tags.map(async (tag)=>{
      let tag_name = tag.name
      let tags
      let reading = await this.plc.read(tag_name)
      //console.log(tag_name+": "+reading)
      console.log(this.config)
    })
  }

  async start() {
    // Set up setInterval calling this.pollOnce(), store the id in this.intervalId
    await this.init()
    
    setInterval(async () => {
      this.config.tags.map(async (tag)=>{
        let tag_name = tag.name
        let tags
        let reading = await this.plc.read(tag_name)
        console.log(tag_name+": "+reading)
      })
    },2000)
  }

  stop() {
    // clearInterval(this.intervalId)
  }
}


getallPLCs = async ()=>{
  allPLCs = await plcs.find({}, {projection: {name:1,_id:0}}).toArray()
  console.log(allPLCs)
}

//getallPLCs()

plc1 = new PlcConnection("Line1_Motor_PLC");

//plc1.pollOnce()
//plc1.start()
//plc1.test()


