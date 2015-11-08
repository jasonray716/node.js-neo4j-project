var express = require('express')
	, router = express.Router()
	, users = require('./../../models/users')

router.post('/', function(req, res){
	users.login(req, res, function(err, node){
		if (err){
			console.log(err);
			
			res.json({status: err, message: node});
		}else{
			if (node[0].userRole == "Administrator" || node[0].userRole == "User")
				res.json({status: 0, node: node[0]});
			else{
				users.getRelationships(req, res, node[0], function(err, result){
					if (err){
						console.log(err);
						
						res.json({status: err, message: result});
					}else{
						console.log("Relationships:", result);
						var user = node[0];
						user.module = [];
						
						for (var i=0; i<result.length; i++)
							user.module[i] = result[i]._end;
						
						res.json({status: 0, node: user});
					}
					res.end();
				});
			}
		}
	});
})

module.exports = router;