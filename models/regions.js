var db = require('./db-neo4j');
var uuid = require('node-uuid');
var crypto = require('crypto');

exports.all = function(req, res, cb){
//	db.listAllLabels(function(err, node){
//		console.log(node);
//		db.readNodesWithLabel("Region", cb);
//	})
	var query = "";
	if (req.params && req.params.customerID){
		console.log("Trying to get Regions of Customer:" + req.params.customerID);
		query = "MATCH (customer:User {userID:'" + req.params.customerID + "', valid:true})-[r]-(region:Region)"
			+ " RETURN customer.fullName, region.regionID, region.manager, region.name, region.customerID";
	}else{
		console.log("Trying to get all Regions");
		query = "MATCH (customer:User {valid:true})-[r]-(region:Region)"
		+ " RETURN customer.fullName, region.regionID, region.manager, region.name, region.customerID";
	}

	db.cypherQuery(query, function(err, node){
		if (err)
			return cb(err, node);
		else{
			var result = [];
			for (var i=0; i<node.data.length; i++){
				var item = {
						customer: node.data[i][0],
						regionID: node.data[i][1],
						manager: node.data[i][2],
						name: node.data[i][3],
						customerID: node.data[i][4]
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
	
	console.log("Trying to read Region:", req.params.uuid);
	db.readNodesWithLabelsAndProperties('Region', {regionID: req.params.uuid}, cb);
}

exports.add = function(req, res, cb){
	console.log("Trying to add Region:", req.body)
	
	var _uuid = uuid.v4();
	
	db.insertNode({
		regionID: _uuid,
		name: req.body.name,
		manager: req.body.manager,
		customerID: req.body.customerID,
		createdDTS: Date.now(),
	}, 'Region', function(err, node){
		if (err)
			return cb("401", "Region Name already exists!");
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
	if (req.body.manager)
		data.manager = req.body.manager;
	if (req.body.customerID)
		data.customerID = req.body.customerID;

	console.log("Trying to edit Region:" + req.params.uuid, data);
	db.updateNodesWithLabelsAndProperties('Region', {regionID:req.params.uuid}, data, cb);
}

exports.del = function(req, res, cb){
	if (!req.params.uuid){
		return cb("404", "UUID Missing");
	}
	var query = "MATCH (n {regionID: '" + req.params.uuid + "'})-[r]-() DELETE n,r";
	console.log("Trying to delete Region:", req.params.uuid);

	db.cypherQuery(query, function(err, node){
		if (err || !node)
			return cb("401", "Failed in deleting Region");
		else{
			query = "MATCH (n {regionID: '" + req.params.uuid + "'}) DELETE n";
			db.cypherQuery(query, cb);
			/*db.deleteNodesWithLabelsAndProperties('Region', {regionID:req.params.uuid}, function(err, node){
				if (err)
					return cb(err, "Failed in deleting Region");
				if (node === true){
					return cb(err, node);
				}else {
					return cb("401", "Failed in deleting Region due to existing relationships");
				}
			});*/
		}
	});
}

/**
 * Add Relationship between a customer and regions.
 * 
 * Parameters
 * @req: req.body.module contains an array of module _ids
 * @res:
 * @node: Newly Inserted Customer
 * @cb: callback function
 */
exports.addRelationshipBetweenCustomer = function(req, res, region, cb){
	console.log("Trying to create relationships FROM Customer:", req.body.customerID);
	console.log("Trying to create relationships TO Region:", region.regionID);
	
//	db.insertRelationship(
//			customer._id,
//			req.body.module[module_index],
//			'Customer_Region',
//			{access: 'yes'},
//			function(err, relationship){
//				if (err)
//					return cb(err, "Failed to Create Relationship");
//				
//				cb(err, customer, module_index + 1);
//			}
//	);
	var query = "MATCH (customer:User {userID:'" + req.body.customerID + "'}),"
		+ "(region:Region {regionID:'" + region.regionID + "'})"
		+ " CREATE (customer)-[r:Customer_Region]->(region) RETURN r";

	db.cypherQuery(query, cb);
}

exports.delRelationships = function(req, res, cb){
	var query = "MATCH (region {regionID: '" + req.params.uuid + "'})-[r]-() DELETE r";
	console.log("Trying to delete Customer_Region relationships. Region ID:", req.params.uuid);
	db.cypherQuery(query, cb);
}