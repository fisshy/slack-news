var _ = require('underscore');

module.exports = {
	toSlack : function(data, sd) {

		var slackFields = [];
		_.each(data.items, function(item) {
			slackFields.push({
				title : item.title,
				value : item.value + ' <' + item.url + '|Click here> for more!'
			});
		});

		var slack_message = {
		    channel: '#' + sd.channel_name, 
		    username: sd.user_name,
		    icon_emoji: ":ghost:",
		    attachments:[
		      {
		        fallback: "Unknown",
		        pretext: data.title,
		        color: "#36a64f",
		        fields: slackFields
		      }
		    ]
	  	};

		return {
	      form: {
	        payload: JSON.stringify(slack_message)
	      }
	    };
	},
	toMarkdown: function(data, sd) {
		var text = data.title + '\n';
		_.each(data.items, function(item) {
			text += '<#000000|' + item.title + '>' 
				+ '\n>>>' + item.value + 
				'\n <' + item.url + '|Click here> for more! \n\n';
		});

		/*var slack_message = {
		    channel: '#' + sd.channel_name, 
		    username: sd.user_name,
		    icon_emoji: ":ghost:",
		    text : text
	  	};*/

		return text;
	}
};