var _ = require('underscore');

var weekly = {
  js: '/news js',
  db: '/news db',
  postgres: '/news postgres',
  mobile: '/news mobile',
  html5: '/news html5',
  go: '/news go',
  ruby: '/news ruby',
  node: '/news node'
};

module.exports = {
    console.log("hm");

    var items = [];
    _.each(weekly, function(item, key) {
      items.push({
        title: item
      });
    });
    
    cb(null, { title: "Slack commands\n", items: items})
  }
}