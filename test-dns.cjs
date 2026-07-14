const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');

mongoose.connect("mongodb+srv://manoeldv:Mdv84218401@ashborn.izlhdzz.mongodb.net/erp?appName=ashborn")
  .then(() => {
     console.log("CONNECTED TO SRV WITH GOOGLE DNS!");
     process.exit(0);
  }).catch(e => {
     console.error("DNS HACK FAILED: ", e);
     process.exit(1);
  });
