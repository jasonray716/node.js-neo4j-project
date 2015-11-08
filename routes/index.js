var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next){
	res.render('index', {title: 'Neo4j-Node-App'})
})

router.get('/api_doc', function(req, res, next){
	res.render('api_doc')
})

module.exports = router