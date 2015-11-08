var express = require('express')
	, router = express.Router()
	, zones = require('./../../models/zones')
	, async = require('async');

router.get('/', function(req, res){
	zones.all(req, res, function(err, node){
		if (err){
			console.log(err);
			res.json({status: 401});
		}else{
			console.log(node);
			res.json(node);
		}
	});
})

router.get('/customer/:customerID', function(req, res){
	zones.all(req, res, function(err, node){
		if (err){
			console.log(err);
			res.json({status: 401});
		}else{
			console.log(node);
			res.json(node);
		}
	});
})

router.get('/user/:userID', function(req, res){
	zones.all(req, res, function(err, node){
		if (err){
			console.log(err);
			res.json({status: 401});
		}else{
			console.log(node);
			res.json(node);
		}
	});
})

router.get('/:uuid', function(req, res){
	zones.get(req, res, function(err, node){
		if (err){
			console.log(err);
			
			res.json({status: err, message: node});
		}else if (node.length > 0){
			res.json({status: 0, node: node[0]});
		}else{
			res.json({status: 404, node: "Not found"});
		}
	});
})

router.post('/add', function(req, res){
	var func_add_zone = function(callback){
		zones.add(req, res, callback);
 	};
 	var func_add_relationship1 = function(zone, callback){
 	  res.zone = zone;
 		zones.addRelationshipBetweenSite(req, res, zone, callback);
 	}
 	var func_add_relationship2 = function(result, callback){
    zones.addRelationshipBetweenZonetype(req, res, res.zone, callback);
  }
	
 	var call_stack = [func_add_zone, func_add_relationship1, func_add_relationship2];
	
 	async.waterfall(
			call_stack,
			
			//if succeeds, result will hold information of the relationship.
			function(err, result){
				if (err){
					console.log(err);
					
					res.json({status: err, message: result});
				}else{
					res.json({status: 0});
				}
				res.end();
			}
	);
})

router.post('/edit/:uuid', function(req, res){
	var func_edit_zone = function(callback){
		zones.edit(req, res, callback);
	}
	var func_del_relationships = function(node, callback){
		if (node && node.length > 0){
			res.zone = node[0];
			zones.delRelationships(req, res, callback);
		}else{
			callback("404", "Not Found");
		}
	}
	var func_add_relationship1 = function(result, callback){
 		zones.addRelationshipBetweenSite(req, res, res.zone, callback);
 	}
	var func_add_relationship2 = function(result, callback){
    zones.addRelationshipBetweenZonetype(req, res, res.zone, callback);
  }
	
	var call_stack = [func_edit_zone, func_del_relationships, func_add_relationship1, func_add_relationship2];
 	
 	async.waterfall(
			call_stack,
			
			//if succeeds, result will hold information of the relationship.
			function(err, result){
				if (err){
					console.log(err);
					
					res.json({status: err, message: result});
				}else{
					res.json({status: 0});
				}
				res.end();
			}
	);
})

router.delete('/:uuid', function(req, res){
	zones.del(req, res, function(err, node){
		if (err){
			console.log(err);
			
			res.json({status: err, message: node});
		}else{
			//node deleted
			res.json({status: 0})
		}
	})
})

router.get('/del/:uuid', function(req, res){
	zones.del(req, res, function(err, node){
		if (err){
			console.log(err);
			
			res.json({status: err, message: node});
		}else{
			//node deleted
			res.json({status: 0})
		}
	})
})

module.exports = router;