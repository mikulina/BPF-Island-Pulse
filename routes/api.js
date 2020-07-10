var api = require('../app/classes/api');

/**
 * Just examples. Make sure to encodeURIComponent for dates and what not
 *
 * Sample queries
 *
 * Mix
 * /api/mix?date=2014-01-07 00:00:00,2014-01-20 00:00:00&limit=30
 *
 * Usage & Current
 * /api/usage?date=2014-01-07 00:00:00,2014-01-20 00:00:00&limit=30&energy=all&area=1,2
 *
 * Versus
 * /api/versus?date=2014-01-07&limit=30&energy=4&area=1,2
 *
 *
 * Values
 *
 * energy and area
 * It can be a single value, csv or all - i.e. 1 or 1,4,5 or "all"
 *
 * date
 * please urlencode dates
 * date can be a single date without time - "2014-01-07". It then will be translated to 2014-01-07 00:00:00 and 2014-01-07 23:59:59 respectively
 * a single date i.e. - 2014-01-07 12:30:00
 * or a range - 2014-01-07 12:30:00,2014-01-07 20:30:00
 *
 * limit
 * limit is alphanumeric and limit the amount of resources
 *
 */


module.exports = {

  response: function(req, res) {
    // call chart
    json = (api[req.params.chart]) ? api.init(res, req.params.chart, req.query) : {};
  }

};