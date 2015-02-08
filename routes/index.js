var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.json({ usage: '/news js db .net ruby' });
});

module.exports = router;
