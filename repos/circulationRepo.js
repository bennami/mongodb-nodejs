const {MongoClient , ObjectID} = require('mongodb');

//locally
const url = 'mongodb://localhost:27017';
//name of db we create
const dbName = 'circulation';

function circulationRepo(){
    function get(query, limit){
        return new Promise(async (resolve, reject)=>{
            const client = new MongoClient(url);
            try {
                await client.connect();
                const db = client.db(dbName);

                //this returns a cursor, doesnt hit db
                let items = db.collection('newspapers').find(query);

                //this is how to add the limit to a query
                if (limit > 0){
                    items = items.limit(limit);
                }

                //this returns arrays and hits the db
                resolve(await items.toArray());
                await client.close();

            }catch (e) {
                reject(e)

            }
        })
    }
    function getById(id){
        return new Promise(async (resolve,reject)=>{
            const client = new MongoClient(url);
            try{
                await client.connect();
                const db = client.db(dbName);

                //newspapers with no caps idk whyyyy?
                const item = await db.collection('newspapers').findOne({_id: ObjectID(id)})
                resolve(item);
                 await client.close();
            }catch (e) {
                reject(e)
            }
        })

    }
    function add(item){
        return new Promise(async(resolve, reject) => {
            const client = new MongoClient(url);
            try {
                await client.connect();
                const db = client.db(dbName);
                const addedItem = await db.collection('newspapers').insertOne(item);
                resolve(addedItem.ops[0]);
                client.close();

            }catch (e) {
                reject(e)

            }
        })
    }
    function update(id, newItem){
        return new Promise(async(resolve, reject)=>{
            const client = new MongoClient(url);
            try {
                await client.connect();
                const db = client.db(dbName);
                const updatedItem = await db.collection('newspapers').findOneAndReplace({_id: ObjectID(id)}, newItem, {returnOriginal: false});
                resolve(updatedItem.value);
                await client.close();

            }catch (e) {
                reject(e)
            }
        });
    }
    function remove(id){
        return new Promise( async (resolve, reject)=>{
            const client = new MongoClient(url);
            try {
              await client.connect();
              const db = client.db(dbName);

              const removed = await db.collection('newspapers').deleteOne({_id: ObjectID(id)}, )
              resolve(removed.deletedCount === 1)
                await client.close();

            }catch (e) {
                reject(e);
            }
        })
    }
    function loadData(data){
      return new Promise(async(resolve, reject) => {
          const client = new MongoClient(url);
          try{
              await client.connect();
              const db = client.db(dbName);

              results = await db.collection('newspapers').insertMany(data)
              resolve(results);
              await client.close();
          }catch (error){
              reject(error)
          }
      })
    }
    function averageFinalists(){
        return new Promise(async (resolve,reject)=>{
            const client = new MongoClient(url);
            try {
                await client.connect();
                const db = client.db(dbName);
                const average = await db.collection('newspapers').aggregate([{
                    $group:
                        { _id: null,
                          avgFinalists: { $avg: "$Pulitzer Prize Winners and Finalists, 1990-2014"}
                        }
                }
                ]).toArray();
                resolve(average[0].avgFinalists);
                await client.close();
            }catch (e) {
                reject(e)

            }
        })
    }
    function averageFinalistsByChange(){
        return new Promise(async (resolve,reject)=>{
            const client = new MongoClient(url);
            try {
                await client.connect();
                const db = client.db(dbName);
                const average = await db.collection('newspapers').aggregate([
                    {$project:{
                            "Newspaper":1,
                            "Pulitzer Prize Winners and Finalists, 1990-2014": 1,
                            "Change in Daily Circulation, 2004-2013": 1,
                            overallChange: {
                                $cond: {if: {$gte: ["Change in Daily Circulation, 2004-2013",0]}, then: "positive", else: "negative"}
                                }
                            }},
                    {
                        $group:
                            { _id: "$overallChange",
                              avgFinalists:{$avg: "$Pulitzer Prize Winners and Finalists, 1990-2014"}
                            }
                    }
                ]).toArray();
                resolve(average);
                await client.close();
            }catch (e) {
                reject(e)

            }
        })
    }
    return{loadData, get, getById, add, update, remove, averageFinalists, averageFinalistsByChange}
}

module.exports = circulationRepo();