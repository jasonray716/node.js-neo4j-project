var db = require('./db-neo4j');
var uuid = require('node-uuid');
var crypto = require('crypto');

exports.all = function(req, res, cb){
	console.log("Trying to get all Roles");
	db.listAllLabels(function(err, node){
		console.log(node);
		db.readNodesWithLabel("Role", cb);
	})
//	var _uuid = uuid.v4();
//	db.insertNode({
//		roleID: _uuid,
//		name: "User",
//	}, 'Role', cb);
}

exports.get = function(req, res, cb){
	if (!req.params.uuid){
		return cb("404", "UUID Missing");
	}
	
	console.log("Trying to read Role:", req.params.uuid);
	db.readNodesWithLabelsAndProperties('Role', {roleID: req.params.uuid}, cb);
}

exports.add = function(req, res, cb){
	console.log("Trying to add Role:", req.body)
	
	var _uuid = uuid.v4();
	
	db.insertNode({
		roleID: _uuid,
		name: req.body.name,
	}, 'Role', cb);
}

exports.edit = function(req, res, cb){
	var data = {};
	if (!req.params.uuid){
		return cb("404", "UUID Missing");
	}
	
	if (req.body.name)
		data.name = req.body.name;

	console.log("Trying to edit Role:" + req.params.uuid, data);
	db.updateNodesWithLabelsAndProperties('Role', {roleID:req.params.uuid}, data, cb);
}

exports.del = function(req, res, cb){
	if (!req.params.uuid){
		return cb("404", "UUID Missing");
	}
	var query = "MATCH (n {roleID: '" + req.params.uuid + "'})-[r]-() DELETE n,r";
	console.log("Trying to delete Role:", req.params.uuid);

	db.cypherQuery(query, function(err, node){
		if (err || !node)
			return cb("401", "Failed in deleting Role");
		else{
			query = "MATCH (n {roleID: '" + req.params.uuid + "'}) DELETE n";
			db.cypherQuery(query, cb);
		}
	});
}