var db = require('./db-neo4j');
var uuid = require('node-uuid');
var crypto = require('crypto');

exports.all = function(req, res, cb){
//	db.listAllLabels(function(err, node){
//		console.log(node);
//		db.readNodesWithLabel("ZPL", cb);
//	})
	var query = "";
	if (req.params && req.params.customerID){
		console.log("Trying to get ZPLs of Customer:" + req.params.customerID);
		query = "MATCH (customer:User {userID:'" + req.params.customerID + "'})-[r]-(zpl:ZPL)"
			+ " RETURN customer.fullName, zpl.zplID, zpl.name, zpl.customerID";
	}else{
		console.log("Trying to get all ZPLs");
		query = "MATCH (customer:User)-[r]-(zpl:ZPL)"
		+ " RETURN customer.fullName, zpl.zplID, zpl.name, zpl.customerID";
	}

	db.cypherQuery(query, function(err, node){
		if (err)
			return cb(err, node);
		else{
			var result = [];
			for (var i=0; i<node.data.length; i++){
				var item = {
						customer: node.data[i][0],
						zplID: node.data[i][1],
						name: node.data[i][2],
						customerID: node.data[i][3]
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
	
	console.log("Trying to read ZPL:", req.params.uuid);
	db.readNodesWithLabelsAndProperties('ZPL', {zplID: req.params.uuid}, cb);
}

exports.add = function(req, res, cb){
	console.log("Trying to add ZPL:", req.body)
	
	var _uuid = uuid.v4();
	
	db.insertNode({
		zplID: _uuid,
		name: req.body.name,
		quantity: req.body.quantity,
		zpl: req.body.zpl,
	}, 'ZPL', function(err, node){
		if (err)
			return cb("401", "ZPL Name already exists!");
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
	if (req.body.zpl)
		data.zpl = req.body.zpl;
	if (req.body.customerID)
		data.customerID = req.body.customerID;

	console.log("Trying to edit ZPL:" + req.params.uuid, data);
	db.updateNodesWithLabelsAndProperties('ZPL', {zplID:req.params.uuid}, data, cb);
}

exports.del = function(req, res, cb){
	if (!req.params.uuid){
		return cb("404", "UUID Missing");
	}
	var query = "MATCH (n {zplID: '" + req.params.uuid + "'})-[r]-() DELETE n,r";
	console.log("Trying to delete ZPL:", req.params.uuid);

	db.cypherQuery(query, function(err, node){
		if (err || !node)
			return cb("401", "Failed in deleting ZPL");
		else{
			query = "MATCH (n {zplID: '" + req.params.uuid + "'}) DELETE n";
			db.cypherQuery(query, cb);
			/*db.deleteNodesWithLabelsAndProperties('ZPL', {zplID:req.params.uuid}, function(err, node){
				if (err)
					return cb(err, "Failed in deleting ZPL");
				if (node === true){
					return cb(err, node);
				}else {
					return cb("401", "Failed in deleting ZPL due to existing relationships");
				}
			});*/
		}
	});
}

/**
 * Add Relationship between a customer and zpls.
 * 
 * Parameters
 * @req: req.body.module contains an array of module _ids
 * @res:
 * @node: Newly Inserted Customer
 * @cb: callback function
 */
exports.addRelationshipBetweenCustomer = function(req, res, zpl, cb){
	console.log("Trying to create relationships FROM Customer:", req.body.customerID);
	console.log("Trying to create relationships TO ZPL:", zpl.zplID);
	
	var query = "MATCH (customer:User {userID:'" + req.body.customerID + "'}),"
		+ "(zpl:ZPL {zplID:'" + zpl.zplID + "'})"
		+ " CREATE (customer)-[r:Customer_ZPL]->(zpl) RETURN r";

	db.cypherQuery(query, cb);
}

exports.delRelationships = function(req, res, cb){
	var query = "MATCH (zpl {zplID: '" + req.params.uuid + "'})-[r]-() DELETE r";
	console.log("Trying to delete Customer_ZPL relationships. ZPL ID:", req.params.uuid);
	db.cypherQuery(query, cb);
}