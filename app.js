//get basic mongo client to go through everything
const MongoClient = require ('mongodb').MongoClient;
const assert = require('assert');



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

    try {
       //load data from circulation.js
       const results = await circulationRepo.loadData(data);
       console.log(results.insertedCount, results.ops)

       //check to see wat db are assoc with user
       //this object lets us do some introspection on the server
       const getData = await circulationRepo.get();
       assert.strictEqual(data.length, getData.length);
    }catch (e) {
       console.log(e)
    }finally{
       //when the assertion throws an error it will clean itself up, so when we run it again, the bd will have 50 entries
       const admin = client.db(dbName).admin();
       await client.db(dbName).dropDatabase();
       console.log( await admin.listDatabases());
       client.close();
    }


}
main();

