var express = require('express');
var router = express.Router();
var request = require('request');
var slack = require('../helpers/slack');

var news = {
	getModule: function(module) {
		switch(module) {
			case "js":
			case "db":
			case "postgres":
			case "mobile":
			case "html5":
			case "go":
			case "ruby":
			case "node":
				return require('../modules/weekly-news')
			case "help":
				return require('../modules/help');
			default:
				return null;
		}
	}
};

var SLACK_URL = process.env.SLACK_URL;

router.post('/', function(req, res, next) {
	
	var command = req.body.text;
	if(!command) { return res.send('command not found').end(); }
	
	var commands = (command || "").trim().split(' ');

	var all = commands.length == 2 ? commands[1] : null;

	var selectedNews = commands[0];

	var module = news.getModule(selectedNews);

	if(!module) { return res.send('command not found').end(); }

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

		}, 
		selectedNews
	);
});

module.exports = router;
