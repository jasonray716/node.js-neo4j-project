var express = require('express')
	, router = express.Router()
	, zonetypes = require('./../../models/zonetypes')

router.get('/', function(req, res){
	zonetypes.all(req, res, function(err, node){
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
	zonetypes.get(req, res, function(err, node){
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
	zonetypes.add(req, res, function(err, node){
		if (err){
			console.log(err);
			
			res.json({status: err, message: "Module Name already exists!"});
		}else{
			res.json({status: 0});
		}
	});
})

router.post('/edit/:uuid', function(req, res){
	zonetypes.edit(req, res, function(err, node){
		if (err){
			console.log(err);
			
			res.json({status: err, message: node});
		}else{
			res.json({status: 0});
		}
	});
})

router.delete('/:uuid', function(req, res){
	zonetypes.del(req, res, function(err, node){
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
	zonetypes.del(req, res, function(err, node){
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