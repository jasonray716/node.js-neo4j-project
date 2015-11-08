var db = require('./db-neo4j');
var uuid = require('node-uuid');
var crypto = require('crypto');

exports.all = function(req, res, cb){
//	db.listAllLabels(function(err, node){
//		console.log(node);
//		db.readNodesWithLabel("Department", cb);
//	})
	var query = "";
	if (req.params && req.params.customerID){
		console.log("Trying to get Departments of Customer:" + req.params.customerID);
		query = "MATCH (customer:User {userID:'" + req.params.customerID + "'})-[r]-(department:Department)"
			+ " RETURN customer.fullName, department.departmentID, department.name, department.customerID";
	}else{
		console.log("Trying to get all Departments");
		query = "MATCH (customer:User)-[r]-(department:Department)"
		+ " RETURN customer.fullName, department.departmentID, department.name, department.customerID";
	}

	db.cypherQuery(query, function(err, node){
		if (err)
			return cb(err, node);
		else{
			var result = [];
			for (var i=0; i<node.data.length; i++){
				var item = {
						customer: node.data[i][0],
						departmentID: node.data[i][1],
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
	
	console.log("Trying to read Department:", req.params.uuid);
	db.readNodesWithLabelsAndProperties('Department', {departmentID: req.params.uuid}, cb);
}

exports.add = function(req, res, cb){
	console.log("Trying to add Department:", req.body)
	
	var _uuid = uuid.v4();
	
	db.insertNode({
		departmentID: _uuid,
		name: req.body.name,
		customerID: req.body.customerID,
		createdDTS: Date.now(),
	}, 'Department', function(err, node){
		if (err)
			return cb("401", "Department Name already exists!");
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

	console.log("Trying to edit Department:" + req.params.uuid, data);
	db.updateNodesWithLabelsAndProperties('Department', {departmentID:req.params.uuid}, data, cb);
}

exports.del = function(req, res, cb){
	if (!req.params.uuid){
		return cb("404", "UUID Missing");
	}
	var query = "MATCH (n {departmentID: '" + req.params.uuid + "'})-[r]-() DELETE n,r";
	console.log("Trying to delete Department:", req.params.uuid);

	db.cypherQuery(query, function(err, node){
		if (err || !node)
			return cb("401", "Failed in deleting Department");
		else{
			query = "MATCH (n {departmentID: '" + req.params.uuid + "'}) DELETE n";
			db.cypherQuery(query, cb);
			/*db.deleteNodesWithLabelsAndProperties('Department', {departmentID:req.params.uuid}, function(err, node){
				if (err)
					return cb(err, "Failed in deleting Department");
				if (node === true){
					return cb(err, node);
				}else {
					return cb("401", "Failed in deleting Department due to existing relationships");
				}
			});*/
		}
	});
}

/**
 * Add Relationship between a customer and departments.
 * 
 * Parameters
 * @req: req.body.module contains an array of module _ids
 * @res:
 * @node: Newly Inserted Customer
 * @cb: callback function
 */
exports.addRelationshipBetweenCustomer = function(req, res, department, cb){
	console.log("Trying to create relationships FROM Customer:", req.body.customerID);
	console.log("Trying to create relationships TO Department:", department.departmentID);
	
	var query = "MATCH (customer:User {userID:'" + req.body.customerID + "'}),"
		+ "(department:Department {departmentID:'" + department.departmentID + "'})"
		+ " CREATE (customer)-[r:Customer_Department]->(department) RETURN r";

	db.cypherQuery(query, cb);
}

exports.delRelationships = function(req, res, cb){
	var query = "MATCH (department {departmentID: '" + req.params.uuid + "'})-[r]-() DELETE r";
	console.log("Trying to delete Customer_Department relationships. Department ID:", req.params.uuid);
	db.cypherQuery(query, cb);
}