
/*
 * GET home page.
 */

var fingerprint = require('../config/fingerprint.js');

exports.index = function(req, res){
  res.render('index', { title: 'Island Pulse', fingerprint: fingerprint });
};
