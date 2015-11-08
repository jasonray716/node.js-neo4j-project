//Require the Node4j module
var neo4j = require('node-neo4j');

url = process.env.GRAPHENEDB_URL
//url = 'http://neo4j:123456789@localhost:7474';

//Create a db object. We will use this object to work on the DB.
db = new neo4j(url);

module.exports = db;