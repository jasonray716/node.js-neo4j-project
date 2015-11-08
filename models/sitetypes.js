var db = require('./db-neo4j');
var uuid = require('node-uuid');
var crypto = require('crypto');

exports.all = function(req, res, cb){
	console.log("Trying to get all Sitetypes");
	db.listAllLabels(function(err, node){
		console.log(node);
		db.readNodesWithLabel("Sitetype", cb);
	})
}

exports.get = function(req, res, cb){
	if (!req.params.uuid){
		return cb("404", "UUID Missing");
	}
	
	console.log("Trying to read Sitetype:", req.params.uuid);
	db.readNodesWithLabelsAndProperties('Sitetype', {sitetypeID: req.params.uuid}, cb);
}

exports.add = function(req, res, cb){
	console.log("Trying to add Sitetype:", req.body)
	
	var _uuid = uuid.v4();
	
	db.insertNode({
		sitetypeID: _uuid,
		name: req.body.name,
		createdDTS: Date.now(),
	}, 'Sitetype', cb);
}

exports.edit = function(req, res, cb){
	var data = {};
	if (!req.params.uuid){
		return cb("404", "UUID Missing");
	}
	
	if (req.body.name)
		data.name = req.body.name;

	console.log("Trying to edit Sitetype:" + req.params.uuid, data);
	db.updateNodesWithLabelsAndProperties('Sitetype', {sitetypeID:req.params.uuid}, data, cb);
}

exports.del = function(req, res, cb){
	if (!req.params.uuid){
		return cb("404", "UUID Missing");
	}
	var query = "MATCH (n {sitetypeID: '" + req.params.uuid + "'})-[r]-() DELETE n,r";
	console.log("Trying to delete Sitetype:", req.params.uuid);

	db.cypherQuery(query, function(err, node){
		if (err || !node)
			return cb("401", "Failed in deleting Sitetype");
		else{
			query = "MATCH (n {sitetypeID: '" + req.params.uuid + "'}) DELETE n";
			db.cypherQuery(query, cb);
		}
	});
}