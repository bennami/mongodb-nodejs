# mongodb-nodejs - ubuntu 20.04

## install mongodb
 By default, the latest version of MongoDB is not available in the Ubuntu 20.04 default repository.
 So you will need to add the official MongoDB repository in your system.
 
 First, install Gnupg package with the following command(you can also choose to do it via the mongodb site):
 
 ```
 apt-get install gnupg -y
 ```
 
Next, download and add the MongoDB GPG key with the following command:
 ```
 wget -qO - https://www.mongodb.org/static/pgp/server-4.2.asc | apt-key add -
 ```
 Next, add the MongoDB repository with the following command:
 ```
 echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu bionic/mongodb-org/4.2 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-4.2.list
 ```
 

Next, update the repository and install the MongoDB with the following command:
```
apt-get update -y
apt-get install mongodb-org -y
```
Once the installation has been completed, start the MongoDB service and enable it to start at reboot with the following command:
```
systemctl start mongod
systemctl enable mongod
```

You can now check the status of the MongoDB service with the following command:
```
systemctl status mongod
```
You should get the following output:

```


? mongod.service - MongoDB Database Server
     Loaded: loaded (/lib/systemd/system/mongod.service; enabled; vendor preset: enabled)
     Active: active (running) since Fri 2020-05-15 05:30:39 UTC; 18s ago
       Docs: https://docs.mongodb.org/manual
   Main PID: 106996 (mongod)
     Memory: 76.0M
     CGroup: /system.slice/mongod.service
             ??106996 /usr/bin/mongod --config /etc/mongod.conf

May 15 05:30:39 ubuntu2004 systemd[1]: Started MongoDB Database Server.
May 15 05:30:48 ubuntu2004 systemd[1]: /lib/systemd/system/mongod.service:11: PIDFile= references a path below legacy directory /var/run/, upd>
lines 1-11/11 (END)
```

You can also verify the MongoDB version and the server address using the following command:

```
mongo --eval 'db.runCommand({ connectionStatus: 1 })'
```

You should get the following output:

```
MongoDB shell version v4.2.6
connecting to: mongodb://127.0.0.1:27017/?compressors=disabled&gssapiServiceName=mongodb
Implicit session: session { "id" : UUID("e1575445-f441-4b30-a5d7-4cf68852e68f") }
MongoDB server version: 4.2.6
{
	"authInfo" : {
		"authenticatedUsers" : [ ],
		"authenticatedUserRoles" : [ ]
	},
	"ok" : 1  
}
```
MongoDB default configuration file is located at /etc/mongod.conf. By default, each user will have access to all databases and perform any action. For production environments, it is recommended to enable the MongoDB authentication.

You can do it by editing the file /etc/mongod.conf:

```
nano /etc/mongod.conf
```
Add the following (it might already be enabled):

```


security:
  authorization: enabled

```

Save and close the file then restart the MongoDB service to apply the changes:
```
systemctl restart mongod

```
to start the server:

```
mongod
```

if it doesnt work you might need to sudo it or give it the right chown/chmod.
IF it gives an error concerning /data/db, create that directory and try again:
```
mkdir /data/db
```

and there you go :), now u can type mongo and connect to the server/

```
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

    //load data from circulation.js
    const results = await circulationRepo.loadData(data);
    console.log(results.insertedCount, results.ops)

    //check to see wat db are assoc with user
    //this object lets us do some introspection on the server
    const admin = client.db(dbName).admin();
    console.log( await admin.serverStatus());
    console.log( await admin.listDatabases());
}
main();
```




 
