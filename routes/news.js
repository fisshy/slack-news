var express = require('express');
var router = express.Router();
var request = require('request');
var slack = require('../helpers/slack');

var news = {
	js : require('../modules/weekly-news'),
	db : require('../modules/weekly-news')
};

var SLACK_URL = process.env.SLACK_URL;

router.post('/', function(req, res, next) {
	
	var command = req.body.text;
	if(!command) { return res.json({text : 'command not found'}).end(); }
	
	var commands = (command || "").trim().split(' ');

	var all = commands.length == 2 ? commands[1] : null;

	var selectedNews = commands[0];

	var module = news[selectedNews];

	if(!module) { return res.json({text : 'command not found'}).end(); }

	var sd = req.body;

	module.slack(
		function(err, data) {

			if(err) return res.json(err).end();

			if(all) {
				request.post(SLACK_URL, slack.toSlack(data, sd));
		    	res.status(200).end()
		    } else {
	    		res.status(200).send(slack.toMarkdown(data, sd));
		    }

	}, selectedNews);
});

module.exports = router;
