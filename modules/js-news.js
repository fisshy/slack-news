
var FeedParser = require('feedparser')
var request = require('request');
var _ = require('underscore');
var cheerio = require('cheerio');

var trim = function(text) {
  return (text || "").replace(/\n/g, '').replace(/\t/g, '');
}

var slackTransform = function(items, cb) {
  
  var item = items[0]; // Maybe there can be more then one?
  var $ = cheerio.load(item.description);

  var gowides = $('.gowide tr td');

  items = [];

  gowides.each(function(i, item) {
    var field = {};
    var divs = $(item).children('div');

    if(divs.length === 3) {

      var first = $(divs[0]);
      field.title = trim(first.text());  
      var second = $(divs[1]);
      field.value = trim(second.text());
      var a = first.children('a');
      field.url = trim(a.attr('href'));

      items.push(field);
    }

  });

  cb(null, { title: item.title, items: items});
};

module.exports = {
  slack : function(cb) {

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

      slackTransform(items, cb);

    });
  }
}