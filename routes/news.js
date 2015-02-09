var express = require('express');
var router = express.Router();
var request = require('request');
var slack = require('../helpers/slack');

var news = {
	js : require('../modules/js-news')
};

var SLACK_URL = process.env.SLACK_URL;

router.post('/', function(req, res, next) {
	
	var command = req.body.text;
	if(!command) { return res.json({text : 'command not found'}).end(); }
	
	var commands = (command || "").trim().split(' ');

	var all = commands.length == 2 ? commands[1] : null;

	var module = news[commands[0]];

	if(!module) { return res.json({text : 'command not found'}).end(); }

	var sd = req.body;

	module.slack(function(err, data) {
		if(err) return res.json(err).end();
		if(all) {
			request.post(SLACK_URL, slack.toSlack(data, sd));
	    	res.status(200).end()
	    } else {
    		res.status(200).send(slack.toMarkdown(data, sd));
	    }
	});
});

module.exports = router;
