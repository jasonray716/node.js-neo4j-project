var express = require('express')
	, router = express.Router()
	, users = require('./../../models/users')
	, async = require('async');

router.get('/', function(req, res){
	users.all(req, res, function(err, node){
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
	users.all(req, res, function(err, node){
		if (err){
			console.log(err);
			res.json({status: 401});
		}else{
			console.log(node);
			res.json(node);
		}
	});
})

router.get('/admin', function(req, res){
	req.body = {
			userName: "admin",
			password: "admin",
			userRole: "Administrator",
			deleted: false
	};
	users.add(req, res, function(err, node){
		if (err){
			console.log(err);
			res.json({status: 401, message:node});
		}else{
			console.log(node);
			res.json(node);
		}
	})
})

router.get('/:uuid', function(req, res){
	var func_get_user = function(callback){
		users.get(req, res, callback);
	};
	var func_get_module_accesses = function(node, callback){
		if (node && node.length > 0){
			res.user = node[0];
			users.getRelationships(req, res, node[0], callback);
		}else{
			callback(404, "Not found");
		}
	};
	
	async.waterfall(
			[func_get_user,
			 func_get_module_accesses],
			
			//if succeeds, result will hold information of the relationship.
			function(err, result){
				if (err){
					console.log(err);
					
					res.json({status: err, message: result});
				}else{
					console.log("Relationships:", result);
					var user = res.user;
					user.module = [];
					
//					for (var i=0; i<result.length; i++)
//						user.module[i] = result[i]._end;
					if (result.data){
						for (var i=0; i<result.data.length; i++)
							user.module[i] = result.data[i]._id;
					}
					
					res.json({status: 0, node: user});
				}
				res.end();
			}
	);
})

router.post('/add', function(req, res){
	var func_add_user = function(callback){
 		users.add(req, res, callback);
 	};
 	var func_add_relationship = function(user, module_index, callback){
 		users.addRelationship(req, res, user, module_index, callback);
 	}
 	var func_add_relationship1= = function(user, index, callback){
 	  users.addRelationshipBetweenCustomer(req, res, user, callback);
 	}
	
 	var call_stack = [func_add_user];
 	var module_length = 0;
 	if (req.body.module && req.body.module.length > 0){
 		module_length = req.body.module.length;
 		for (var i=0; i<module_length; i++)
 			call_stack[i + 1] = func_add_relationship;
 	}
 	if (req.body.site && req.body.site.length > 0){
 		var site_length = req.body.site.length;
 		for (var i=0; i<site_length; i++)
 			call_stack[i + 1 + module_length] = func_add_relationship;
 	}
 	
 	call_stack[call_stack.length] = func_add_relationship1;
	
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
	var func_edit_user = function(callback){
		users.edit(req, res, callback);
	}
	var func_del_access_modules = function(node, callback){
		if (node && node.length > 0){
			res.user = node[0];
			users.delRelationships(req, res, node[0], callback);
		}else{
			callback("404", "Not Found");
		}
	}
	var func_add_relationship = function(user, module_index, callback){
 		users.addRelationship(req, res, user, module_index, callback);
 	}
	
	var call_stack = [func_edit_user, func_del_access_modules];
 	
 	var module_length = 0;
 	if (req.body.module && req.body.module.length > 0){
 		module_length = req.body.module.length;
 		for (var i=0; i<module_length; i++)
 			call_stack[i + 2] = func_add_relationship;
 	}
 	if (req.body.site && req.body.site.length > 0){
 		var site_length = req.body.site.length;
 		for (var i=0; i<site_length; i++)
 			call_stack[i + 2 + module_length] = func_add_relationship;
 	}
 	
 	call_stack[call_stack.length] = func_add_relationship1;
 	
 	//console.log(call_stack.length);
 	
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
	users.del(req, res, function(err, node){
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
	users.del(req, res, function(err, node){
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