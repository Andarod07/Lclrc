const express = require("express");
const { PLC } = require('ethernet-ip');
const { client } = require("../routes/db");

const Ldb = client.db("Ldb")
const plcs = Ldb.collection("plcs")

//INFLUX
const { InfluxDBClient, Point } = require('@influxdata/influxdb3-client');

//INIT INFLUX
initInFlux = async ()=>{
  const influx = await import("@influxdata/influxdb3-client");

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
    //console.log(plcDB.tags)
    let name = plcDB.name;
    let plant = plcDB.plant;
    let area = plcDB.area;
    let line = plcDB.line
    let ip = plcDB.connection.ip;
    let slot = plcDB.connection.slot;
    let pollIntervalMs = plcDB.pollIntervalMs;
    let tags = plcDB.tags;
    let enabled = plcDB.enabled;
    
    this.config = {name,plant,area,line,ip,slot,pollIntervalMs,tags,enabled};
    //console.log(this.config);
  }

  async connect() {
    const plc = new PLC();
    let ip = this.config.ip;
    let slot = this.config.slot;

    await plc.connect(ip, { slot: slot });
    this.plc = plc;
    //console.log(this.plc);
    console.log('Connected to simulated PLC');
  }

  async init() {
    await this.pollOnce();
    //console.log(this.config.enabled)
    await this.connect();
  }

  async test(){ 
    await this.init()
    
    const Influx_client = await initInFlux();
    
    this.config.tags.map(async (tag)=>{
      let tag_name = tag.address
      let reading = await this.plc.read(tag_name)

      const point = Point.measurement("plc_data")
      .setTag("plant", this.config.plant)
      .setTag("area", this.config.area)
      .setTag("line", this.config.line)
      .setTag("plc", this.config.id)
      .setTag("equipment", tag.equipment)
      .setTag("metric", tag.metric)
      .setFloatField("value", reading);

      console.log(tag_name+": "+reading)
      await Influx_client.write(point, process.env.INFLUX_DB);
    })
  }

  async start() {
    // Set up setInterval calling this.pollOnce(), store the id in this.intervalId
    await this.init()
    const Influx_client = await initInFlux();
    
    setInterval(async () => {    
    this.config.tags.map(async (tag)=>{
      let tag_name = tag.address
      let reading = await this.plc.read(tag_name)

      const point = Point.measurement("plc_data")
      .setTag("plant", this.config.plant)
      .setTag("area", this.config.area)
      .setTag("line", this.config.line)
      .setTag("plc", this.config.id)
      .setTag("equipment", tag.equipment)
      .setTag("metric", tag.metric)
      .setFloatField("value", reading);

      console.log(tag_name+": "+reading)
      await Influx_client.write(point, process.env.INFLUX_DB);
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

plc1 = new PlcConnection("PLC_001");


plc1.start()
//plc1.test()


