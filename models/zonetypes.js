var db = require('./db-neo4j');
var uuid = require('node-uuid');
var crypto = require('crypto');

exports.all = function(req, res, cb){
	console.log("Trying to get all Zonetypes");
	db.listAllLabels(function(err, node){
		console.log(node);
		db.readNodesWithLabel("Zonetype", cb);
	})
}

exports.get = function(req, res, cb){
	if (!req.params.uuid){
		return cb("404", "UUID Missing");
	}
	
	console.log("Trying to read Zonetype:", req.params.uuid);
	db.readNodesWithLabelsAndProperties('Zonetype', {zonetypeID: req.params.uuid}, cb);
}

exports.add = function(req, res, cb){
	console.log("Trying to add Zonetype:", req.body)
	
	var _uuid = uuid.v4();
	
	db.insertNode({
		zonetypeID: _uuid,
		name: req.body.name,
		replenSource: req.body.replenSource,
		createdDTS: Date.now(),
	}, 'Zonetype', cb);
}

exports.edit = function(req, res, cb){
	var data = {};
	if (!req.params.uuid){
		return cb("404", "UUID Missing");
	}
	
	if (req.body.name)
		data.name = req.body.name;
	if (req.body.replenSource)
		data.replenSource = req.body.replenSource;

	console.log("Trying to edit Zonetype:" + req.params.uuid, data);
	db.updateNodesWithLabelsAndProperties('Zonetype', {zonetypeID:req.params.uuid}, data, cb);
}

exports.del = function(req, res, cb){
	if (!req.params.uuid){
		return cb("404", "UUID Missing");
	}
	var query = "MATCH (n {zonetypeID: '" + req.params.uuid + "'})-[r]-() DELETE n,r";
	console.log("Trying to delete Zonetype:", req.params.uuid);

	db.cypherQuery(query, function(err, node){
		if (err || !node)
			return cb("401", "Failed in deleting Zonetype");
		else{
			query = "MATCH (n {zonetypeID: '" + req.params.uuid + "'}) DELETE n";
			db.cypherQuery(query, cb);
			/*db.deleteNodesWithLabelsAndProperties('Zonetype', {zonetypeID:req.params.uuid}, function(err, node){
				if (err)
					return cb(err, "Failed in deleting Zonetype");
				if (node === true){
					return cb(err, node);
				}else {
					return cb("401", "Failed in deleting Zonetype due to existing relationships");
				}
			});*/
		}
	});
}