
var FeedParser = require('feedparser')
var request = require('request');
var _ = require('underscore');
var cheerio = require('cheerio');

var weekly = {
  js: 'http://javascriptweekly.com/rss/17ki4d14',
  db: 'http://dbweekly.com/rss/1oe5532d',
  postgres: 'http://postgresweekly.com/rss/1d39epki',
  mobile: 'http://mobilewebweekly.co/rss/1ja4g3b1',
  html5: 'http://html5weekly.com/rss/220ng9m3',
  go: 'http://golangweekly.com/rss/12f3deib',
  ruby: 'http://rubyweekly.com/rss/22hjgj6j',
  node: 'http://nodeweekly.com/rss/1cj9ne2a'

};

var trim = function(text) {
  return  (text || "")
          .replace(/\n/g, '')
          .replace(/\t/g, '');
}

var parseHtml = {

  /*
   * I've decided to split them up because theres 
   * almost different order in every RSS table
   */

  js : function($, item) {
    var field;
    var divs = $(item).children('div');

    if(divs.length === 3) {

      field = {};

      var first = $(divs[0]);
      field.title = trim(first.text());  
      
      var second = $(divs[1]);
      field.value = trim(second.text());

      var a = first.children('a');
      field.url = trim(a.attr('href'));
      
      var third = $(divs[2]);
      field.author = trim(third.text());

    }

    return field;
  },

  db : function($, item) {
    var field;
    var divs = $(item).children('div');

    if(divs.length === 3) {
      
      field = {};

      var first = $(divs[0]);
      field.title = trim(first.text());  
      
      var second = $(divs[1]);
      field.author = trim(second.text());

      var a = first.children('a');
      field.url = trim(a.attr('href'));
      
      var third = $(divs[2]);
      field.value = trim(third.text());

    }

    return field;
  },

  html5 : function($, item) {
    var field;
    var divs = $(item).children('div');

    if(divs.length === 3) {
      
      field = {};

      var first = $(divs[0]);
      field.title = trim(first.text());  
      
      var second = $(divs[1]);
      field.author = trim(second.text());

      var a = first.children('a');
      field.url = trim(a.attr('href'));
      
      var third = $(divs[2]);
      field.value = trim(third.text());

    }

    return field;
  },

  node : function($, item) {
    var field;
    var divs = $(item).children('div');

    if(divs.length === 2) {
      
      field = {};

      var first = $(divs[0]);
      field.title = trim(first.text());  
      
      var second = $(divs[1]);
      field.value = trim(second.text());

      var a = first.children('a');
      field.url = trim(a.attr('href'));

    }

    return field;
  }
}

var slackTransform = function(items, type, cb) {
  
  var item = items[0]; // Maybe there can be more then one?
  var $ = cheerio.load(item.description);

  var gowides = $('.gowide tr td');

  items = [];

  gowides.each(function(i, item) {
    var field = parseHtml[type]($, item)
    if(field) {
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

      slackTransform(items, type, cb);

    });
  }
}