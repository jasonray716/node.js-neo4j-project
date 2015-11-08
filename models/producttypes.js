var db = require('./db-neo4j');
var uuid = require('node-uuid');
var crypto = require('crypto');

exports.all = function(req, res, cb){
//	db.listAllLabels(function(err, node){
//		console.log(node);
//		db.readNodesWithLabel("Producttype", cb);
//	})
	var query = "";
	if (req.params && req.params.customerID){
		console.log("Trying to get Producttypes of Customer:" + req.params.customerID);
		query = "MATCH (customer:User {userID:'" + req.params.customerID + "'})-[r]-(producttype:Producttype)"
			+ " RETURN customer.fullName, producttype.producttypeID, producttype.name, producttype.customerID, producttype.quantity";
	}else{
		console.log("Trying to get all Producttypes");
		query = "MATCH (customer:User)-[r]-(producttype:Producttype)"
		+ " RETURN customer.fullName, producttype.producttypeID, producttype.name, producttype.customerID, producttype.quantity";
	}

	db.cypherQuery(query, function(err, node){
		if (err)
			return cb(err, node);
		else{
			var result = [];
			for (var i=0; i<node.data.length; i++){
				var item = {
						customer: node.data[i][0],
						producttypeID: node.data[i][1],
						name: node.data[i][2],
						customerID: node.data[i][3],
						quantity: node.data[i][4]
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
	
	console.log("Trying to read Producttype:", req.params.uuid);
	db.readNodesWithLabelsAndProperties('Producttype', {producttypeID: req.params.uuid}, cb);
}

exports.add = function(req, res, cb){
	console.log("Trying to add Producttype:", req.body)
	
	var _uuid = uuid.v4();
	
	db.insertNode({
		producttypeID: _uuid,
		name: req.body.name,
		quantity: req.body.quantity,
		customerID: req.body.customerID,
		createdDTS: Date.now(),
	}, 'Producttype', function(err, node){
		if (err)
			return cb("401", "Producttype Name already exists!");
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
	if (req.body.quantity)
		data.name = req.body.quantity;
	if (req.body.customerID)
		data.customerID = req.body.customerID;

	console.log("Trying to edit Producttype:" + req.params.uuid, data);
	db.updateNodesWithLabelsAndProperties('Producttype', {producttypeID:req.params.uuid}, data, cb);
}

exports.del = function(req, res, cb){
	if (!req.params.uuid){
		return cb("404", "UUID Missing");
	}
	var query = "MATCH (n {producttypeID: '" + req.params.uuid + "'})-[r]-() DELETE n,r";
	console.log("Trying to delete Producttype:", req.params.uuid);

	db.cypherQuery(query, function(err, node){
		if (err || !node)
			return cb("401", "Failed in deleting Producttype");
		else{
			query = "MATCH (n {producttypeID: '" + req.params.uuid + "'}) DELETE n";
			db.cypherQuery(query, cb);
			/*db.deleteNodesWithLabelsAndProperties('Producttype', {producttypeID:req.params.uuid}, function(err, node){
				if (err)
					return cb(err, "Failed in deleting Producttype");
				if (node === true){
					return cb(err, node);
				}else {
					return cb("401", "Failed in deleting Producttype due to existing relationships");
				}
			});*/
		}
	});
}

/**
 * Add Relationship between a customer and producttypes.
 * 
 * Parameters
 * @req: req.body.module contains an array of module _ids
 * @res:
 * @node: Newly Inserted Customer
 * @cb: callback function
 */
exports.addRelationshipBetweenCustomer = function(req, res, producttype, cb){
	console.log("Trying to create relationships FROM Customer:", req.body.customerID);
	console.log("Trying to create relationships TO Producttype:", producttype.producttypeID);
	
	var query = "MATCH (customer:User {userID:'" + req.body.customerID + "'}),"
		+ "(producttype:Producttype {producttypeID:'" + producttype.producttypeID + "'})"
		+ " CREATE (customer)-[r:Customer_Producttype]->(producttype) RETURN r";

	db.cypherQuery(query, cb);
}

exports.delRelationships = function(req, res, cb){
	var query = "MATCH (producttype {producttypeID: '" + req.params.uuid + "'})-[r]-() DELETE r";
	console.log("Trying to delete Customer_Producttype relationships. Producttype ID:", req.params.uuid);
	db.cypherQuery(query, cb);
}