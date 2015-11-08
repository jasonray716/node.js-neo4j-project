var db = require('./db-neo4j');
var uuid = require('node-uuid');
var crypto = require('crypto');

exports.all = function(req, res, cb){
//	var id = uuid.v4();
//	
//	db.insertNode({
//		moduleID: id,
//		name: req.body.name,
//		link: req.body.link,
//		icon: req.body.icon,
//	}, 'Module', cb);
	
	console.log("Trying to get all Modules");
	db.listAllLabels(function(err, node){
		console.log(node);
		db.readNodesWithLabel("Module", cb);
	})
}

exports.get = function(req, res, cb){
	if (!req.params.uuid){
		return cb("404", "UUID Missing");
	}
	
	console.log("Trying to read Module:", req.params.uuid);
	db.readNodesWithLabelsAndProperties('Module', {moduleID: req.params.uuid}, cb);
}

exports.add = function(req, res, cb){
	console.log("Trying to add Module:", req.body)
	
	var _uuid = uuid.v4();
	
	db.insertNode({
		moduleID: _uuid,
		name: req.body.name,
		link: req.body.link,
		icon: req.body.icon,
	}, 'Module', cb);
}

exports.edit = function(req, res, cb){
	var data = {};
	if (!req.params.uuid){
		return cb("404", "UUID Missing");
	}
	
	if (req.body.name)
		data.name = req.body.name;
	if (req.body.link)
		data.link = req.body.link;
	if (req.body.icon)
		data.icon = req.body.icon;

	console.log("Trying to edit Module:" + req.params.uuid, data);
	db.updateNodesWithLabelsAndProperties('Module', {moduleID:req.params.uuid}, data, cb);
}

exports.del = function(req, res, cb){
	if (!req.params.uuid){
		return cb("404", "UUID Missing");
	}
	var query = "MATCH (n {moduleID: '" + req.params.uuid + "'})-[r]-() DELETE n,r";
	console.log("Trying to delete Module:", req.params.uuid);

	db.cypherQuery(query, function(err, node){
		if (err || !node)
			return cb("401", "Failed in deleting Module");
		else{
			query = "MATCH (n {moduleID: '" + req.params.uuid + "'}) DELETE n";
			db.cypherQuery(query, cb);
			/*db.deleteNodesWithLabelsAndProperties('Module', {moduleID:req.params.uuid}, function(err, node){
				if (err)
					return cb(err, "Failed in deleting Module");
				if (node === true){
					return cb(err, node);
				}else {
					return cb("401", "Failed in deleting Module due to existing relationships");
				}
			});*/
		}
	});
}