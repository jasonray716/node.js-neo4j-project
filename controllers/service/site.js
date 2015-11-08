var express = require('express')
	, router = express.Router()
	, sites = require('./../../models/sites')
	, async = require('async');

router.get('/', function(req, res){
	sites.all(req, res, function(err, node){
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
	sites.all(req, res, function(err, node){
		if (err){
			console.log(err);
			res.json({status: 401});
		}else{
			console.log(node);
			res.json(node);
		}
	});
})

router.get('/region/:regionID', function(req, res){
  sites.all(req, res, function(err, node){
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
	sites.all(req, res, function(err, node){
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
	sites.get(req, res, function(err, node){
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
	var func_add_site = function(callback){
		sites.add(req, res, callback);
 	};
 	var func_add_relationship = function(site, callback){
 		sites.addRelationshipBetweenRegion(req, res, site, callback);
 	}
	
 	var call_stack = [func_add_site, func_add_relationship];
	
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
//	sites.edit(req, res, function(err, node){
//		if (err){
//			console.log(err);
//			
//			res.json({status: err, message: node});
//		}else{
//			res.json({status: 0});
//		}
//	});
	var func_edit_site = function(callback){
		sites.edit(req, res, callback);
	}
	var func_del_relationships = function(node, callback){
		if (node && node.length > 0){
			res.site = node[0];
			sites.delRelationships(req, res, callback);
		}else{
			callback("404", "Not Found");
		}
	}
	var func_add_relationship = function(result, callback){
 		sites.addRelationshipBetweenRegion(req, res, res.site, callback);
 	}
	
	var call_stack = [func_edit_site, func_del_relationships, func_add_relationship];
 	
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
	sites.del(req, res, function(err, node){
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
	sites.del(req, res, function(err, node){
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