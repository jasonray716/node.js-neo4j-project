var db = require('./db-neo4j');
var uuid = require('node-uuid');
var crypto = require('crypto');

exports.all = function(req, res, cb){
	var query = "";
	if (req.params && req.params.customerID){
		console.log("Trying to get Guns of Customer:" + req.params.customerID);
		query = "MATCH (customer:User {userID:'" + req.params.customerID + "'})-[r]-(gun:Gun)"
			+ " RETURN gun.customerID, gun.gunID, gun.deviceID, gun.deviceName, gun.minPower, gun.maxPower, gun.guid";
	}else{
		console.log("Trying to get all Guns");
		query = "MATCH (customer:User {userRole:'Administrator'})-[r]-(gun:Gun)"
			+ " RETURN gun.customerID, gun.gunID, gun.deviceID, gun.deviceName, gun.minPower, gun.maxPower, gun.guid";
	}

	db.cypherQuery(query, function(err, node){
		if (err)
			return cb(err, node);
		else{
			var result = [];
			for (var i=0; i<node.data.length; i++){
				var item = {
						customerID: node.data[i][0],
						gunID: node.data[i][1],
						deviceID: node.data[i][2],
						deviceName: node.data[i][3],
						minPower: node.data[i][4],
						maxPower: node.data[i][5],
						guid: node.data[i][6]
				};
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
	
	console.log("Trying to read Gun:", req.params.uuid);
	db.readNodesWithLabelsAndProperties('Gun', {gunID: req.params.uuid}, cb);
}

exports.add = function(req, res, cb){
	console.log("Trying to add Gun:", req.body)
	
	var _uuid = uuid.v4();
	
	var customer = [];
	if (req.customer_index == req.body.customer.length - 1)
		customer = req.body.customer;//only if admin itself
	
	if (req.customer_index == 0)
		res.guid = _uuid;
	
	db.insertNode({
		gunID: _uuid,
		deviceID: req.body.deviceID,
		deviceName: req.body.deviceName,
		maxPower: req.body.maxPower,
		minPower: req.body.minPower,
		readDefault: req.body.readDefault,
		rwDefault: req.body.rwDefault,
		writeDefault: req.body.writeDefault,
		locateDefault: req.body.locateDefault,
		receiveDefault: req.body.receiveDefault,
		userRead: req.body.userRead,
		userReadWrite: req.body.userReadWrite,
		userWrite: req.body.userWrite,
		userLocate: req.body.userLocate,
		userReceive: req.body.userReceive,
		guid: res.guid,
		customerID: req.body.customer[req.customer_index],
		customer: customer	//assigned customers
	}, 'Gun', function(err, node){
		if (err)
			return cb("401", node);
		else
			cb(err, node);
	});
}

exports.edit = function(req, res, cb){
	var data = {};
	if (!req.params.uuid){
		return cb("404", "UUID Missing");
	}
	
	if (req.body.deviceID)
		data.deviceID = req.body.deviceID;
	if (req.body.deviceName)
		data.deviceName = req.body.deviceName;
	if (req.body.minPower)
		data.minPower = req.body.minPower;
	if (req.body.maxPower)
		data.maxPower = req.body.maxPower;
	if (req.body.readDefault)
		data.readDefault = req.body.readDefault;
	if (req.body.rwDefault)
		data.rwDefault = req.body.rwDefault;
	if (req.body.writeDefault)
		data.writeDefault = req.body.writeDefault;
	if (req.body.locateDefault)
		data.locateDefault = req.body.locateDefault;
	if (req.body.receiveDefault)
		data.receiveDefault = req.body.receiveDefault;
	if (req.body.userRead)
		data.userRead = req.body.userRead;
	if (req.body.userReadWrite)
		data.userReadWrite = req.body.userReadWrite;
	if (req.body.userWrite)
		data.userWrite = req.body.userWrite;
	if (req.body.userLocate)
		data.userLocate = req.body.userLocate;
	if (req.body.userReceive)
		data.userReceive = req.body.userReceive;
	if (req.body.customerID)
		data.customerID = req.body.customerID;
	if (req.body.assigned_customer)
		data.customer = req.body.assigned_customer;

	console.log("Trying to edit Gun:" + req.body.gunID, data);
	db.updateNodesWithLabelsAndProperties('Gun', {gunID:req.body.gunID}, data, cb);
}

exports.del = function(req, res, cb){
	if (!req.params.uuid){
		return cb("404", "UUID Missing");
	}
	var query = "";
	if (req.isCustomer)
		query = "MATCH (n {gunID: '" + req.params.uuid + "'})-[r]-() DELETE n,r";
	else
		query = "MATCH (n {guid: '" + req.params.uuid + "'})-[r]-() DELETE n,r";
	console.log("Trying to delete Gun:", req.params.uuid);

	db.cypherQuery(query, function(err, node){
		if (err || !node)
			return cb("401", "Failed in deleting Gun");
		else{
			query = "MATCH (n {gunID: '" + req.params.uuid + "'}) DELETE n";
			db.cypherQuery(query, cb);

		}
	});
}

/**
 * Add Relationship between a customer and guns.
 * 
 * Parameters
 * @req: req.body.module contains an array of module _ids
 * @res:
 * @node: Newly Inserted Customer
 * @cb: callback function
 */
exports.addRelationshipBetweenCustomer = function(req, res, gun, cb){
	console.log("Trying to create relationships FROM Customer:", req.body.customer[req.customer_index]);
	console.log("Trying to create relationships TO Gun:", gun.gunID);
	
	var query = "MATCH (customer:User {userID:'" + req.body.customer[req.customer_index] + "'}),"
		+ "(gun:Gun {gunID:'" + gun.gunID + "'})"
		+ " CREATE (customer)-[r:Customer_Gun]->(gun) RETURN r";

	db.cypherQuery(query, function(err, result){
		if (err || req.customer_index >= req.body.customer.length - 1)
			return cb(err, result);
		else
			return cb(err);
	});
}

exports.delRelationships = function(req, res, del_customer, cb){
	var query = "MATCH (gun {guid: '" + req.params.uuid + "'})-[r]-(customer {userID:'" + del_customer +"'}) DELETE gun, r";
	console.log("Trying to delete Customer_Gun relationships. Gun ID:", req.params.uuid);
	db.cypherQuery(query, cb);
}