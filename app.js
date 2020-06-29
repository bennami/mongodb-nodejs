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
    const client = new MongoClient(url,  { useUnifiedTopology: true });

    //wait until client.connect returns the promise to proceed
    await client.connect();

    try {
       //load data from circulation.js
       const results = await circulationRepo.loadData(data);
       assert.strictEqual(data.length, results.insertedCount);

       //get all data from db
       const getData = await circulationRepo.get();
       assert.strictEqual(data.length, getData.length);

       //get an article using a query
       const filterData = await circulationRepo.get({Newspaper: getData[4].Newspaper});
       assert.deepStrictEqual(filterData[0], getData[4]);

       //query with a limit, query is empty so it will return all 50 with a limit of 3
       const limitData = await circulationRepo.get({},3);
       assert.strictEqual(limitData.length, 3);

       //get by id
       const id = getData[4]._id.toString();
       const byId = await circulationRepo.getById(id);
       assert.deepStrictEqual(byId, getData[4]);


       //add item
       const newItem =  {
          "Newspaper": "Imane's paper",
          "Daily Circulation, 2004": 235369,
          "Daily Circulation, 2013": 1344070,
          "Change in Daily Circulation, 2004-2013": -30,
          "Pulitzer Prize Winners and Finalists, 1990-2003": 4,
          "Pulitzer Prize Winners and Finalists, 2004-2014": 2,
          "Pulitzer Prize Winners and Finalists, 1990-2014": 7
       };
       const addedItem = await circulationRepo.add(newItem);
       assert(addedItem._id);
       // pull the added item with a query to make sure its there
       const addedItemQuery = await  circulationRepo.getById(addedItem._id);
       assert.deepStrictEqual(addedItemQuery, newItem);

       //update item
       const updatedItem = await circulationRepo.update(addedItem._id, {
          "Newspaper": "My new paper",
          "Daily Circulation, 2004": 1,
          "Daily Circulation, 2013": 2,
          "Change in Daily Circulation, 2004-2013": 100,
          "Pulitzer Prize Winners and Finalists, 1990-2003": 4,
          "Pulitzer Prize Winners and Finalists, 2004-2014": 2,
          "Pulitzer Prize Winners and Finalists, 1990-2014": 7

       });
       assert.strictEqual(updatedItem.Newspaper, "My new paper");

       const newAddedItemQuery = await  circulationRepo.getById(addedItem._id);
       assert.strictEqual(newAddedItemQuery.Newspaper, "My new paper");

       //delete
       const removed = await circulationRepo.remove(addedItem._id);
       assert(removed);
       const deletedItem = await  circulationRepo.getById(addedItem._id);
       assert.strictEqual(deletedItem,null)

       //avg aggregation pipeline
       const avgFinalists = await circulationRepo.averageFinalists();
       console.log(`avg number of finalists is ${avgFinalists}`);

       //avg by change
       const avgByChange = await circulationRepo.averageFinalistsByChange();
       console.log(avgByChange);
    }catch (error) {
       console.log(error)
    }finally{
       //when the assertion throws an error it will clean itself up, so when we run it again, the bd will have 50 entries
       const admin = client.db(dbName).admin();
       await client.db(dbName).dropDatabase();
       console.log( await admin.listDatabases());
       await client.close();
    }

}
main();

