var db = require('./db-neo4j');
var uuid = require('node-uuid');
var crypto = require('crypto');
var async = require('async')

exports.all = function(req, res, cb){
	console.log("Trying to get all Users");
	db.listAllLabels(function(err, node){
		console.log(node);
		//db.readNodesWithLabel("User", cb);
		if (req.params && req.params.customerID)
			db.readNodesWithLabelsAndProperties('User', {userRole: "User", customerID:req.params.customerID, valid: true}, cb);
		else
			db.readNodesWithLabelsAndProperties('User', {userRole: "User", valid: true}, cb);
	})
}

exports.get = function(req, res, cb){
	if (!req.params.uuid){
		return cb("404", "UUID Missing");
	}
	
	console.log("Trying to read User:", req.params.uuid);
	db.readNodesWithLabelsAndProperties('User', {userID: req.params.uuid, userRole: "User", valid: true}, cb);
}

exports.add = function(req, res, cb){
	console.log("Trying to add User:", req.body)
	
	var _uuid = uuid.v4();
	var digest = crypto.createHash('md5').update(req.body.password).digest("hex");
	var userRole = req.body.userRole;
	if (!userRole)
		userRole = "User";
	
	db.readNodesWithLabelsAndProperties(
			'User',
			{userName: req.body.userName, valid: true},
			function(err, node){
				if (err)
					return cb(err, "Failed in Add");
				else if (node && node.length > 0){
					return cb(401, "Username already exists!");
				}else{
					db.insertNode({
						userID: _uuid,
						userName: req.body.userName,
						password: digest,
						fullName: req.body.fullName,
						country: req.body.country,
						customerID: req.body.customerID,
						userRole: userRole,
						valid: true
					}, 'User', function(err, node){
						if (err){
							console.log(node);
							cb(err, node, 0);
						}else
							cb(err, node, 0);
					});
				}
			}
	);
}

exports.edit = function(req, res, cb){
	var data = {};
	if (!req.params.uuid){
		return cb("404", "UUID Missing");
	}
	
	if (req.body.userName)
		data.userName = req.body.userName;
	if (req.body.password){
		var digest = crypto.createHash('md5').update(req.body.password).digest("hex");
		data.password = digest;
	}
	if (req.body.fullName)
		data.fullName = req.body.fullName;
	if (req.body.country)
		data.country = req.body.country;
	if (req.body.customerID)
		data.customerID = req.body.customerID;
	
	console.log("Trying to edit User:" + req.params.uuid, data);
	db.updateNodesWithLabelsAndProperties('User', {userID:req.params.uuid}, data, cb);
}

exports.del = function(req, res, cb){
	if (!req.params.uuid){
		return cb("404", "UUID Missing");
	}
	
	var query = "MATCH (n {userID: '" + req.params.uuid + "'})-[r]-() DELETE n,r";
	console.log("Trying to delete User:", req.params.uuid);
	db.updateNodesWithLabelsAndProperties('User', {userID:req.params.uuid}, {valid: false}, cb);
	
//	db.cypherQuery(query, function(err, result){
//		if (err){
//			console.log("Failed in deleting User:", result);
//			return cb(err, "Failed in deleting User");
//		}
//		return cb(err, result);
//	});
/*	db.cypherQuery(query, function(err, node){
		if (err)
			return cb(err, node);
		else{
			query = "MATCH (n {userID: '" + req.params.uuid + "'}) DELETE n";
			db.cypherQuery(query, cb);
		}
	});*/
}

/**
 * Login API
 */
exports.login = function(req, res, cb){
	console.log("Trying to login:", req.body);
	
	var digest = crypto.createHash('md5').update(req.body.password).digest("hex");
	
	db.readNodesWithLabelsAndProperties(
			[],
			{userName:req.body.userName, password:digest, valid:true},
			function(err, node){
				if (err)
					return cb(400, "Failed in Login");
				if (node.length > 0){
					return cb(0, node);
				}
				
				db.readNodesWithLabelsAndProperties(
						[],
						{userName:req.body.userName, valid:true},
						function(err, node){
							if (err)
								return cb(400, "Failed in Login");
							if (node.length > 0){
								return cb(401, "Incorrect Password");
							}else{
								return cb(402, "Invalid Username");
							}
						}
				);
			}
	);
}

/**
 * Add Relationship between a user and modules.
 * 
 * Parameters
 * @req: req.body.module contains an array of module _ids
 * @res:
 * @node: Newly Inserted User
 * @cb: callback function
 */
exports.addRelationship = function(req, res, user, index, cb){
	if (req.body.module && index < req.body.module.length){
		console.log("Trying to create relationships FROM User:", user);
		console.log("Trying to create relationships TO Module with _id:", req.body.module[index]);
		
		db.insertRelationship(
				user._id,
				req.body.module[index],
				'User_Module',
				{access: 'yes'},
				function(err, relationship){
					if (err)
						return cb(err, "Failed to Create User-Module Relationship");
					
					cb(err, user, index + 1);
				}
		);
	}else{
		var module_length = 0;
		if (req.body.module)
			module_length = req.body.module.length;
		console.log("Trying to create relationships FROM User:", user);
		console.log("Trying to create relationships TO SiteID:", req.body.site[index - module_length]);
		
		var query = "MATCH (user:User {userID:'" + user.userID + "'}),"
			+ "(site:Site {siteID:'" + req.body.site[index - module_length] + "'})"
			+ " CREATE (user)-[r:User_Site]->(site) RETURN r";

		db.cypherQuery(query, function(err, relationship){
			if (err)
				return cb(err, "Failed to Create User-Site Relationship");
			
			cb(err, user, index + 1);
		});
	}
}

exports.addRelationshipBetweenCustomer = function(req, res, user, cb){
  console.log("Trying to create relationships FROM User:", user);
  console.log("Trying to create relationships TO Customer:", req.body.customerID);
  
  var query = "MATCH (customer:User {userID:'" + req.body.customerID + "'}),"
    + "(user:User {userID:'" + user.userID + "'})"
    + " CREATE (customer)-[r:Customer_User]->(user) RETURN r";

  db.cypherQuery(query, cb);
}

exports.getRelationships = function(req, res, user, cb){
	console.log("Trying to read module relationships FROM User:", user);
	
	var query = "MATCH (user:User {userID:'" + user.userID + "'})-[r:User_Module]-(module:Module) RETURN module";
	
	db.cypherQuery(query, cb);
//	db.readRelationshipsOfNode(
//			user._id,
//			{
//				type: ['User_Module'],
//				direction: 'out',
//			},
//			cb
//	);
//	var query = "MATCH (user {userID: '" + user.userID + "'})-[r]-(module) RETURN module";
//	
//	console.log("Trying to read relationships FROM User:", user);
//	console.log(query);
//	db.cypherQuery(query, cb);
}

exports.delRelationships = function(req, res, user, cb){
	var query = "MATCH (user {userID: '" + user.userID + "'})-[r]-() DELETE r";
	console.log("Trying to delete User's relationships:", user);
	db.cypherQuery(query, function(err, result){
		cb(err, user, 0);
	});
}