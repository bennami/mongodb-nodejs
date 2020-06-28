const {MongoClient} = require('mongodb');

//locally
const url = 'mongodb://localhost:27017';

//name of db we create
const dbName = 'circulation';

function circulationRepo(){
    function loadData(data){
      return new Promise(async(resolve, reject) => {
          const client = new MongoClient(url);
          try{
              await client.connect();
              const db = client.db(dbName);

              results = db.collection('newspapers').insertMany(data)
              resolve(results);
          }catch (error){
              reject(error)
          }
      })
    }
    return{loadData}
}

module.exports = circulationRepo();