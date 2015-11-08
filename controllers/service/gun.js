var express = require('express')
	, router = express.Router()
	, guns = require('./../../models/guns')
	, async = require('async');

router.get('/', function(req, res){
	guns.all(req, res, function(err, node){
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
	guns.all(req, res, function(err, node){
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
	guns.get(req, res, function(err, node){
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
	req.customer_index = -1;
	
	var func_add_gun = function(callback){
		req.customer_index++;
		guns.add(req, res, callback);
 	};
 	var func_add_relationship = function(gun, callback){
 		guns.addRelationshipBetweenCustomer(req, res, gun, callback);
 	}
	
 	if (req.body.customer && req.body.customer.length > 0){
 		var call_stack = [];
 		for (var i=0; i<req.body.customer.length; i++){
 			call_stack[i*2] = func_add_gun;
 			call_stack[i*2 + 1] = func_add_relationship;
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
 	}else{
 		res.json({status: 0});
 		res.end();
 	}
})

router.post('/edit/:uuid', function(req, res){
	req.customer_index = -1, del_index = -1;
	var func_add_gun = function(callback){
		req.customer_index++;
		guns.add(req, res, callback);
 	};
 	var func_add_relationship = function(gun, callback){
 		guns.addRelationshipBetweenCustomer(req, res, gun, callback);
 	}
 	var func_del_relationship1 = function(callback){
 		del_index++;
 		guns.delRelationships(req, res, req.body.del_customer[del_index], callback);
 	}
 	var func_del_relationship = function(result, callback){
 		del_index++;
 		guns.delRelationships(req, res, req.body.del_customer[del_index], callback);
 	}
 	var func_edit_gun1 = function(callback){
		guns.edit(req, res, callback);
	}
 	var func_edit_gun = function(result, callback){
		guns.edit(req, res, callback);
	}
 	
 	var call_stack = [];
	
 	//assign gun to new customers
 	if (req.body.customer && req.body.customer.length > 0){
 		for (var i=0; i<req.body.customer.length; i++){
 			call_stack[i*2] = func_add_gun;
 			call_stack[i*2 + 1] = func_add_relationship;
 		}
 	}
 	
 	if (req.body.del_customer && req.body.del_customer.length > 0){
 		if (call_stack.length > 0){
 			for (var i=0; i<req.body.del_customer.length; i++){
 	 			call_stack[call_stack.length] = func_del_relationship;
 	 		}
 		}else{
 			call_stack[call_stack.length] = func_del_relationship1;
 			for (var i=1; i<req.body.del_customer.length; i++){
 	 			call_stack[call_stack.length] = func_del_relationship;
 	 		}
 		}
 	}
 	
 	if (call_stack.length > 0)
 		call_stack[call_stack.length] = func_edit_gun;
 	else
 		call_stack[0] = func_edit_gun1;
 	
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
	req.isCustomer = false;
	guns.del(req, res, function(err, node){
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
	req.isCustomer = false;
	guns.del(req, res, function(err, node){
		if (err){
			console.log(err);
			
			res.json({status: err, message: node});
		}else{
			//node deleted
			res.json({status: 0})
		}
	})
})

router.delete('/customer/:uuid', function(req, res){
	req.isCustomer = true;
	guns.del(req, res, function(err, node){
		if (err){
			console.log(err);
			
			res.json({status: err, message: node});
		}else{
			//node deleted
			res.json({status: 0})
		}
	})
})

router.get('/del/customer/:uuid', function(req, res){
	req.isCustomer = true;
	guns.del(req, res, function(err, node){
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