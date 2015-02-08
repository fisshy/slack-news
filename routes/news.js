var express = require('express');
var router = express.Router();
var request = require('request');

var news = {
	js : require('../modules/js-news')
};

var SLACK_URL = process.env.SLACK_URL;

/* GET home page. */
router.post('/', function(req, res, next) {
	
	var type = req.body.text;
	if(!type) { return next(new Error("Not found")); }
	
	var module = news[type];
	if(!module) { return next(new Error("Not found")); }

	var sd = req.body;

	module.slack(sd, function(err, data) {
		if(err) return next(err);
		request.post(SLACK_URL, {
	      form: {
	        payload: JSON.stringify(data)
	      }
	    });
	    res.status(200).end()
	});
});



module.exports = router;
