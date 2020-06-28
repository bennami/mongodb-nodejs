//get basic mongo client to go through everything
const MongoClient = require ('mongodb').MongoClient;

const circulationRepo = require('./repos/circulationRepo');
const data = require('./circulation.json');




//locally
const url = 'mongodb://localhost:27017';

//name of db we create
const dbName = 'circulation';

//admin commands to see what we can do
 async function main(){

    //open up a client, takes a url as a param
    const client = new MongoClient(url);

    //wait until client.connect returns the promise to proceed
   await client.connect();

   const results = await circulationRepo.loadData(data);

   console.log(results.insertedCount, results.ops)

    //check to see wat db are assoc with user
    //this object lets us do some introspection on the server
    const admin = client.db(dbName).admin();
    console.log( await admin.serverStatus());
    console.log( await admin.listDatabases());
}
main();

