var db = require('./db-neo4j');
var uuid = require('node-uuid');
var crypto = require('crypto');

exports.all = function(req, res, cb){
	var query = "";
	if (req.params && req.params.customerID){
		console.log("Trying to get Zones of Customer:" + req.params.customerID);
		query = "MATCH (customer:User {userID:'" + req.params.customerID + "'})-[r1]-(region:Region)-[r2]-(site:Site)-[r3]-(zone:Zone)-[r4]-(zonetype:ZoneType)"
			+ " RETURN zone.name, zone.zoneID, customer.company, site.name, zonetype.name";
	}else if (req.params && req.params.userID){
		console.log("Trying to get Zones of User:" + req.params.userID);
		query = "MATCH (user:User {userID:'" + req.params.userID + "'})-[r]-(zone:Zone)"
			+ " RETURN zone.name, zone.zoneID";
	}else{
		console.log("Trying to get all Zones");
		//query = "MATCH (zone:Zone)"
		//  + " RETURN zone.name, zone.zoneID";
		query = "MATCH (customer:User)-[r1]-(region:Region)-[r2]-(site:Site)-[r3]-(zone:Zone)-[r4]-(zonetype:Zonetype)"
      + " RETURN zone.name, zone.zoneID, customer.company, site.name, zonetype.name";
	}

	db.cypherQuery(query, function(err, node){
		if (err)
			return cb(err, node);
		else{
			var result = [];
			for (var i=0; i<node.data.length; i++){
				var item = {
						name: node.data[i][0],
						zoneID: node.data[i][1]
				};
				if (node.data[i][2])
				  item.customer = node.data[i][2];
				if (node.data[i][3])
          item.site = node.data[i][3];
				if (node.data[i][4])
          item.zonetype = node.data[i][4];
				result[result.length] = item;
			}
			return cb(err, result);
		}
	});
}

exports.get = function(req, res, cb){
	if (!req.params.uuid){
		return cb("404", "UUID Missing");
	}
	
	console.log("Trying to read Zone:", req.params.uuid);
	db.readNodesWithLabelsAndProperties('Zone', {zoneID: req.params.uuid}, cb);
}

exports.add = function(req, res, cb){
	console.log("Trying to add Zone:", req.body)
	
	var _uuid = uuid.v4();
	
	db.insertNode({
		zoneID: _uuid,
		name: req.body.name,
		customerID: req.body.customerID,
		regionID: req.body.regionID,
		siteID: req.body.siteID,
		zonetypeID: req.body.zonetypeID,
	}, 'Zone', function(err, node){
		if (err)
			return cb("401", "Zone Name already exists!");
		else
			cb(err, node);
	});
}

exports.edit = function(req, res, cb){
	var data = {};
	if (!req.params.uuid){
		return cb("404", "UUID Missing");
	}
	
	if (req.body.name)
		data.name = req.body.name;
	if (req.body.customerID)
		data.customerID = req.body.customerID;
	if (req.body.regionID)
    data.regionID = req.body.regionID;
	if (req.body.siteID)
    data.siteID = req.body.siteID;
	if (req.body.zonetypeID)
		data.zonetypeID = req.body.zonetypeID;

	console.log("Trying to edit Zone:" + req.params.uuid, data);
	db.updateNodesWithLabelsAndProperties('Zone', {zoneID:req.params.uuid}, data, cb);
}

exports.del = function(req, res, cb){
	if (!req.params.uuid){
		return cb("404", "UUID Missing");
	}
	var query = "MATCH (n {zoneID: '" + req.params.uuid + "'})-[r]-() DELETE n,r";
	console.log("Trying to delete Zone:", req.params.uuid);

	db.cypherQuery(query, function(err, node){
		if (err || !node)
			return cb("401", "Failed in deleting Zone");
		else{
			query = "MATCH (n {zoneID: '" + req.params.uuid + "'}) DELETE n";
			db.cypherQuery(query, cb);
		}
	});
}

/**
 * Add Relationship between a customer and zones.
 * 
 * Parameters
 * @req: req.body.module contains an array of module _ids
 * @res:
 * @zone: Newly Inserted Zone
 * @cb: callback function
 */
exports.addRelationshipBetweenSite = function(req, res, zone, cb){
	console.log("Trying to create relationships FROM Site:", req.body.siteID);
	console.log("Trying to create relationships TO Zone:", zone.zoneID);

	var query = "MATCH (site:Site {siteID:'" + req.body.siteID + "'}),"
		+ "(zone:Zone {zoneID:'" + zone.zoneID + "'})"
		+ " CREATE (site)-[r:Site_Zone]->(zone) RETURN r";

	db.cypherQuery(query, cb);
}

exports.addRelationshipBetweenZonetype = function(req, res, zone, cb){
  console.log("Trying to create relationships FROM Zonetype:", req.body.zonetypeID);
  console.log("Trying to create relationships TO Zone:", zone.zoneID);

  var query = "MATCH (zonetype:Zonetype {zonetypeID:'" + req.body.zonetypeID + "'}),"
    + "(zone:Zone {zoneID:'" + zone.zoneID + "'})"
    + " CREATE (zonetype)-[r:Zonetype_Zone]->(zone) RETURN r";

  db.cypherQuery(query, cb);
}

exports.delRelationships = function(req, res, cb){
	var query = "MATCH (zone {zoneID: '" + req.params.uuid + "'})-[r]-() DELETE r";
	console.log("Trying to delete Zone relationships. Zone ID:", req.params.uuid);
	db.cypherQuery(query, cb);
}