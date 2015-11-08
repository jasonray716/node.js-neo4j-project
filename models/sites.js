var db = require('./db-neo4j');
var uuid = require('node-uuid');
var crypto = require('crypto');

exports.all = function(req, res, cb){
	var query = "";
	if (req.params && req.params.customerID){
		console.log("Trying to get Sites of Customer:" + req.params.customerID);
		query = "MATCH (customer:User {userID:'" + req.params.customerID + "'})-[r1]-(region:Region)-[r2]-(site:Site)"
			+ " RETURN site.name, site.manager, site.email, site.phone, site.zipcode, site.state, site.country, site.fax, site.siteID";
	}else if (req.params && req.params.userID){
		console.log("Trying to get Sites of User:" + req.params.userID);
		query = "MATCH (user:User {userID:'" + req.params.userID + "'})-[r]-(site:Site)"
			+ " RETURN site.name, site.manager, site.email, site.phone, site.zipcode, site.state, site.country, site.fax, site.siteID";
	}else if (req.params && req.params.regionID){
    console.log("Trying to get Sites of Region:" + req.params.regionID);
    query = "MATCH (region:Region {regionID:'" + req.params.regionID + "'})-[r]-(site:Site)"
      + " RETURN site.name, site.manager, site.email, site.phone, site.zipcode, site.state, site.country, site.fax, site.siteID";
  }else{
		console.log("Trying to get all Sites");
		query = "MATCH (site:Site)"
		  + " RETURN site.name, site.manager, site.email, site.phone, site.zipcode, site.state, site.country, site.fax, site.siteID";
	}

	db.cypherQuery(query, function(err, node){
		if (err)
			return cb(err, node);
		else{
			var result = [];
			for (var i=0; i<node.data.length; i++){
				var item = {
						name: node.data[i][0],
						manager: node.data[i][1],
						email: node.data[i][2],
						phone: node.data[i][3],
						zipcode: node.data[i][4],
						state: node.data[i][5],
						country: node.data[i][6],
						fax: node.data[i][7],
						siteID: node.data[i][8]
				};
				result[result.length] = item;
			}
			return cb(err, result);
		}
	});
}

exports.get = function(req, res, cb){
	if (!req.params.uuid){
		return cb("404", "UUID Missing");
	}
	
	console.log("Trying to read Site:", req.params.uuid);
	db.readNodesWithLabelsAndProperties('Site', {siteID: req.params.uuid}, cb);
}

exports.add = function(req, res, cb){
	console.log("Trying to add Site:", req.body)
	
	var _uuid = uuid.v4();
	
	db.insertNode({
		siteID: _uuid,
		name: req.body.name,
		code: req.body.code,
		customerID: req.body.customerID,
    regionID: req.body.regionID,
		sitetypeID: req.body.sitetypeID,
		manager: req.body.manager,
		email: req.body.email,
		phone: req.body.phone,
		address1: req.body.address1,
		address2: req.body.address2,
		zipcode: req.body.zipcode,
		state: req.body.state,
		country: req.body.country,
		fax: req.body.fax,
	}, 'Site', function(err, node){
		if (err)
			return cb("401", "Site Name already exists!");
		else
			cb(err, node);
	});
}

exports.edit = function(req, res, cb){
	var data = {};
	if (!req.params.uuid){
		return cb("404", "UUID Missing");
	}
	
	if (req.body.name)
		data.name = req.body.name;
	if (req.body.code)
    data.code = req.body.code;
  if (req.body.manager)
		data.manager = req.body.manager;
  if (req.body.customerID)
    data.customerID = req.body.customerID;
	if (req.body.regionID)
		data.regionID = req.body.regionID;
	if (req.body.sitetypeID)
		data.sitetypeID = req.body.sitetypeID;
	if (req.body.email)
		data.email = req.body.email;
	if (req.body.phone)
		data.phone = req.body.phone;
	if (req.body.address1)
		data.address1 = req.body.address1;
	if (req.body.address2)
		data.address2 = req.body.address2;
	if (req.body.zipcode)
		data.zipcode = req.body.zipcode;
	if (req.body.state)
		data.state = req.body.state;
	if (req.body.country)
		data.country = req.body.country;
	if (req.body.fax)
		data.fax = req.body.fax;

	console.log("Trying to edit Site:" + req.params.uuid, data);
	db.updateNodesWithLabelsAndProperties('Site', {siteID:req.params.uuid}, data, cb);
}

exports.del = function(req, res, cb){
	if (!req.params.uuid){
		return cb("404", "UUID Missing");
	}
	var query = "MATCH (n {siteID: '" + req.params.uuid + "'})-[r]-() DELETE n,r";
	console.log("Trying to delete Site:", req.params.uuid);

	db.cypherQuery(query, function(err, node){
		if (err || !node)
			return cb("401", "Failed in deleting Site");
		else{
			query = "MATCH (n {siteID: '" + req.params.uuid + "'}) DELETE n";
			db.cypherQuery(query, cb);
		}
	});
}

/**
 * Add Relationship between a customer and sites.
 * 
 * Parameters
 * @req: req.body.module contains an array of module _ids
 * @res:
 * @site: Newly Inserted Site
 * @cb: callback function
 */
exports.addRelationshipBetweenRegion = function(req, res, site, cb){
	console.log("Trying to create relationships FROM Region:", req.body.regionID);
	console.log("Trying to create relationships TO Site:", site.siteID);

	var query = "MATCH (region:Region {regionID:'" + req.body.regionID + "'}),"
		+ "(site:Site {siteID:'" + site.siteID + "'})"
		+ " CREATE (region)-[r:Region_Site]->(site) RETURN r";

	db.cypherQuery(query, cb);
}

exports.delRelationships = function(req, res, cb){
	var query = "MATCH (site {siteID: '" + req.params.uuid + "'})-[r]-() DELETE r";
	console.log("Trying to delete Site relationships. Site ID:", req.params.uuid);
	db.cypherQuery(query, cb);
}