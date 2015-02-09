
var FeedParser = require('feedparser')
var request = require('request');
var _ = require('underscore');
var cheerio = require('cheerio');

var weekly = {
  js: 'http://javascriptweekly.com/rss/17ki4d14',
  db: 'http://dbweekly.com/rss/1oe5532d'
};

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
      var temp1 = trim(second.text());

      var a = first.children('a');
      field.url = trim(a.attr('href'));
      
      var third = $(divs[2]);
      var temp2 = trim(third.text());

      if(temp1.length > temp2.length) {
        field.value = temp1;
        field.author = temp2;
      } else {
        field.value = temp2;
        field.author = temp1;
      }

      items.push(field);
    }

  });

  cb(null, { title: item.title, items: items});
};

module.exports = {
  slack : function(cb, type) {

    var req = request(weekly[type]);
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