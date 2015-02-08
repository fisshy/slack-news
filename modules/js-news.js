
var FeedParser = require('feedparser')
var request = require('request');
var _ = require('underscore');
var cheerio = require('cheerio');

var slackTransform = function(sd, items, cb) {
  
  var item = items[0]; // Maybe there can be more then one?
  var $ = cheerio.load(item.description);

  var gowides = $('.gowide tr td');

  var slackFields = [];

  gowides.each(function(i, item) {
    var field = {};
    var divs = $(item).children('div');

    if(divs.length === 3) {

      var first = $(divs[0]);
      field.title = first.text();  
      var second = $(divs[1]);
      field.value = second.text();
      var a = first.children('a');
      field.value += ' <' + a.attr('href') + '|Click here> for more!';

      slackFields.push(field);
    }
    
  });


  var slack_message = {
    channel: sd.channel_name, 
    username: sd.user_name,
    icon_emoji: ":ghost:",
    attachments:[
      {
        fallback: "Unknown",
        pretext: item.title,
        color: "#36a64f", // Can either be one of 'good', 'warning', 'danger', or any hex color code
        // Fields are displayed in a table on the message
        fields: slackFields
      }
    ]
  };

  cb(null, slack_message);
};

module.exports = {
  slack : function(sd, cb) {

    var req = request('http://javascriptweekly.com/rss/17ki4d14')
    var feedparser = new FeedParser();

    req.on('error', cb);

    req.on('response', function (res) {
      var stream = this;

      if (res.statusCode != 200) 
        return this.emit('error', new Error('Bad status code'));

      stream.pipe(feedparser);
    });

    feedparser.on('error', cb);

    var once = false // enable /news js all ?
    feedparser.on('readable', function() {
      // This is where the action is!
      if(once) return;
      once = true;

      var stream = this
        , meta = this.meta // **NOTE** the "meta" is always available in the context of the feedparser instance
        , item;

      var items = [];

      while (item = stream.read()) {
        items.push(item);
      }

      slackTransform(sd, items, cb);

    });
  }
}