const mongoose = require('mongoose');
const uri = "mongodb://manoeldv:Mdv84218401@ac-bwqezin-shard-00-00.izlhdzz.mongodb.net:27017,ac-bwqezin-shard-00-01.izlhdzz.mongodb.net:27017,ac-bwqezin-shard-00-02.izlhdzz.mongodb.net:27017/erp?ssl=true&replicaSet=atlas-bwqezin-shard-0&authSource=admin&retryWrites=true&w=majority";

mongoose.connect(uri)
  .then(() => {
    console.log("CONNECTED TO DIRECT URI");
    process.exit(0);
  })
  .catch(err => {
    console.log("DIRECT URI FAILED: ", err.message);
    
    // Try SRV
    const srv = "mongodb+srv://manoeldv:Mdv84218401@ashborn.izlhdzz.mongodb.net/erp?appName=ashborn";
    mongoose.connect(srv)
      .then(() => {
         console.log("CONNECTED TO SRV");
         process.exit(0);
      })
      .catch(err2 => {
         console.log("SRV FAILED: ", err2.message);
         process.exit(1);
      });
  });
