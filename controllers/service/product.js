var express = require('express')
	, router = express.Router()
	, products = require('./../../models/products')
	, async = require('async');

router.get('/', function(req, res){
	products.all(req, res, function(err, node){
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
	products.all(req, res, function(err, node){
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
	products.get(req, res, function(err, node){
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
	var func_add_product = function(callback){
		products.add(req, res, callback);
 	};
 	var func_add_relationship_customer = function(product, callback){
 		res.product = product;
 		products.addRelationshipBetweenCustomer(req, res, product, callback);
 	}
 	var func_add_relationship_producttype = function(result, callback){
 		products.addRelationshipBetweenProducttype(req, res, res.product, callback);
 	}
 	var func_add_relationship_department = function(result, callback){
 		products.addRelationshipBetweenDepartment(req, res, res.product, callback);
 	}
	
 	var call_stack = [func_add_product,
 	                  func_add_relationship_customer,
 	                  func_add_relationship_producttype,
 	                  func_add_relationship_department];
	
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

router.post('/import', function(req, res){
	var body_params = req.body;
	
	res.product_index = -1, res.product_count = body_params.length;
	
	var func_add_product = function(callback){
		res.product_index++;
		req.body = body_params[res.product_index];
		products.add(req, res, callback);
 	};
 	var func_add_relationship_customer = function(product, callback){
 		res.product = product;
 		products.addRelationshipBetweenCustomerName(req, res, product, callback);
 	}
 	var func_add_relationship_producttype = function(result, callback){
 		products.addRelationshipBetweenProducttypeName(req, res, res.product, callback);
 	}
 	var func_add_relationship_department = function(result, callback){
 		products.addRelationshipBetweenDepartmentName(req, res, res.product, callback);
 	}
 	
 	var call_stack = [];
 	if (req.body && req.body.length > 0){
 		for (var i=0; i<req.body.length; i++){
 			call_stack[i*4] = func_add_product;
 			call_stack[i*4 + 1] = func_add_relationship_customer;
 			call_stack[i*4 + 2] = func_add_relationship_producttype;
 			call_stack[i*4 + 3] = func_add_relationship_department;
 		}
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
	var func_edit_product = function(callback){
		products.edit(req, res, callback);
	}
	var func_del_relationships = function(node, callback){
		if (node && node.length > 0){
			res.product = node[0];
			products.delRelationships(req, res, callback);
		}else{
			callback("404", "Not Found");
		}
	}
	var func_add_relationship_customer = function(result, callback){
		products.addRelationshipBetweenCustomer(req, res, res.product, callback);
 	}
 	var func_add_relationship_producttype = function(result, callback){
 		products.addRelationshipBetweenProducttype(req, res, res.product, callback);
 	}
 	var func_add_relationship_department = function(result, callback){
 		products.addRelationshipBetweenDepartment(req, res, res.product, callback);
 	}
	
	var call_stack = [func_edit_product,
	                  func_del_relationships,
	                  func_add_relationship_customer,
	                  func_add_relationship_producttype,
	                  func_add_relationship_department];
 	
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
	products.del(req, res, function(err, node){
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
	products.del(req, res, function(err, node){
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