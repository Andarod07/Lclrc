const express = require("express");
const { PLC } = require('ethernet-ip');
const { client } = require("../routes/db");

const Ldb = client.db("Ldb")
const plcs = Ldb.collection("plcs")

//define func to read
read = async () => {

    tags = plcDB[0].tags
    //console.log(tags.length)

    tags.map(async element => {
        reading = element.name +": "+ await plc.read(element.name)
        console.log(reading)
    });

}

class PlcConnection {
  constructor(name) {
    this.config;       // the Mongo document: ip, slot, tags, pollIntervalMs...
    this.db = null;               // so it can insert readings itself
    this.plc = null;            // will hold the `PLC` instance once connected
    this.intervalId = null;     // so `stop()` can clear it later
    this.connected = false;
  }

  async test(){
    const plc = new PLC();
    const plcDB = await plcs.find().toArray()
    let name = plcDB[0].name;
    let ip = plcDB[0].ip;
    let slot = plcDB[0].slot;
    let pollIntervalMs = plcDB[0].pollIntervalMs;
    let tags = plcDB[0].tags;
    let enabled = plcDB[0].enabled;
    
    this.config = {name,ip,slot,pollIntervalMs,tags,enabled};
    console.log(this.config);
  }
  async connect() {

    
    //console.log(ip)
    //console.log(slot)

    //await plc.connect(ip, { slot: slot });
    //console.log('Connected to simulated PLC');
  }

  async pollOnce() {
    // Read all tags in this.config.tags, build a reading object,
    // insert into this.db. What did Stage 7 look like?
  }

  start() {
    // Set up setInterval calling this.pollOnce(), store the id in this.intervalId
  }

  stop() {
    // clearInterval(this.intervalId)
  }
}

plc1 = new PlcConnection("Line1_Motor_PLC");
plc1.test()
