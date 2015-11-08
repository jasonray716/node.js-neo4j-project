var express = require('express')
	, router = express.Router()
	, customers = require('./../../models/customers')
	, async = require('async');

router.get('/', function(req, res){
	customers.all(req, res, function(err, node){
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
	var func_get_customer = function(callback){
		customers.get(req, res, callback);
	};
	var func_get_module_accesses = function(node, callback){
		if (node && node.length > 0){
			res.customer = node[0];
			customers.getRelationships(req, res, node[0], callback);
		}else{
			callback(404, "Not found");
		}
	};
	
	async.waterfall(
			[func_get_customer,
			 func_get_module_accesses],
			
			//if succeeds, result will hold information of the relationship.
			function(err, result){
				if (err){
					console.log(err);
					
					res.json({status: err, message: result});
				}else{
					console.log("Relationships:", result);
					var customer = res.customer;
					customer.module = [];
					
					for (var i=0; i<result.length; i++)
						customer.module[i] = result[i]._end;
					
					res.json({status: 0, node: customer});
				}
				res.end();
			}
	);
})

router.post('/add', function(req, res){
	var func_add_customer = function(callback){
 		customers.add(req, res, callback);
 	};
 	var func_add_relationship = function(customer, module_index, callback){
 		customers.addRelationship(req, res, customer, module_index, callback);
 	}
	
 	var call_stack = [func_add_customer];
 	if (req.body.module && req.body.module.length > 0){
 		var module_length = req.body.module.length;
 		for (var i=0; i<module_length; i++)
 			call_stack[i + 1] = func_add_relationship;
 	}
	
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
	var func_edit_customer = function(callback){
		customers.edit(req, res, callback);
	}
	var func_del_access_modules = function(node, callback){
		if (node && node.length > 0){
			res.customer = node[0];
			customers.delRelationships(req, res, node[0], callback);
		}else{
			callback("404", "Not Found");
		}
	}
	var func_add_relationship = function(customer, module_index, callback){
 		customers.addRelationship(req, res, customer, module_index, callback);
 	}
	
	var call_stack = [func_edit_customer, func_del_access_modules];
 	if (req.body.module && req.body.module.length > 0){
 		var module_length = req.body.module.length;
 		for (var i=0; i<module_length; i++)
 			call_stack[i + 2] = func_add_relationship;
 	}
 	
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
	customers.del(req, res, function(err, node){
		if (err){
			console.log(err);
			
			res.json({status: err, message: "Failed in deleting Customer"});
		}else{
			//node deleted
			res.json({status: 0})
		}
	})
})

router.get('/del/:uuid', function(req, res){
	customers.del(req, res, function(err, node){
		if (err){
			console.log(err);
			
			res.json({status: err, message: "Failed in deleting Customer"});
		}else{
			//node deleted
			res.json({status: 0})
		}
	})
})

module.exports = router;