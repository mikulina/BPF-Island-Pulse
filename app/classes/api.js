var _ = require('lodash');
var bits = require('sqlbits'), S=bits.$, SELECT=bits.SELECT, BETWEEN=bits.BETWEEN, AND=bits.AND, IN=bits.IN, OR=bits.OR, SQL=bits.SQL, ORDERBY=bits.ORDERBY, GROUPBY=bits.GROUPBY;
var md5 = require('MD5');
var moment = require('moment-timezone');
var allTypes = {
  area: _.range(1,10).join(','),
  energy: _.range(1,7).join(',')
};

module.exports = {

  init: function(res, graph, params) {
    parts = this[graph](params);
    stmt = buildStmt(parts.sql, parts.params);
    // d(stmt);
    emitter.emit('fetchResults', res, stmt, parts.callback);
  },

  // energy usage chart
  usage: function(params) {
    sql = SELECT('ed.dateTime, ed.usage as energy_usage, et.name')
      .FROM('energy_data ed')
      ._('INNER JOIN energy_types et on et.id = ed.energyTypeId');

    return {
      sql: sql,
      params: params
    };
  },

  // clean vs non renewable energy chart
  // if date is empty return latest date
  versus: function(params) {
    sql = SELECT('DATE_FORMAT(d.dateTime,"%m/%d/%y") AS dateTime, SUM(CASE WHEN ed.energyTypeId IN(1,6) THEN ed.usage ELSE 0 END) AS non_renewable, SUM(CASE WHEN ed.energyTypeId IN(2,3,4,5) THEN ed.usage ELSE 0 END) AS renewable')
      .FROM('data d')
      ._('INNER JOIN energy_data ed ON d.dateTime = ed.dateTime INNER JOIN areas a ON d.areaId = a.id INNER JOIN energy_types et ON ed.energyTypeId = et.id');

    params.groupby = 'dateTime';

    return {
      sql: sql,
      params: params
    };
  },

  // current energy for location
  current: function(params) {
    // if no areaId set default to `all of oahu`
    var areaId = params.areaId || 9;

    sql = SELECT('ed.dateTime, ed.usage AS total_usage, et.name')
      .FROM('data ed')
      ._('INNER JOIN areas et ON et.id = ed.areaId')
      ._('WHERE areaId = ' + areaId);

    return {
      sql: sql,
      params: params
    };
  },

 // total energy mix chart
  mix: function(params) {
    sql = SELECT('ed.dateTime AS dateTime, et.name AS type, ed.usage AS total_usage')
      .FROM('energy_data ed')
      ._('INNER JOIN energy_types et ON et.id = ed.energyTypeId');

    // multiply limit by number of energy types to get correct count
    if (params.limit) {
      energy = (params.energy && params.energy !== 'all') ? params.energy.split(',').length : allTypes.energy.length;
      params.limit = (params.limit * energy) + 1;
    }

    // delete unused items
    delete params.area;

    return {
      sql: sql,
      params: params,
      callback: mixData
    };
  },

  // total energy mix chart
  highlow: function(params) {
    if (params.areaId) {
      sql = SELECT('ed.dateTime AS dateTime, ed.usage AS total_usage')
        .FROM('data ed')
        ._('WHERE areaId = ' + params.areaId);
    } else {
      sql = SELECT('ed.dateTime AS dateTime, SUM(ed.usage) AS total_usage')
        .FROM('energy_data ed')
        ._('INNER JOIN energy_types et ON et.id = ed.energyTypeId');
    }


    params.groupby = 'ed.dateTime';

    // multiply limit by number of energy types to get correct count
    if (params.limit) {
      energy = (params.energy && params.energy !== 'all') ? params.energy.split(',').length : allTypes.energy.length;
      params.limit = (params.limit * energy) + 1;
    }

    // delete unused items
    delete params.area;
    delete params.limit;

    return {
      sql: sql,
      params: params,
      callback: highLowData
    };
  }

};

// build where clauses using sqlbits
function buildStmt(sql, params) {
  // remove empty params
  params = compactObject(params);

  // check for area id
  if (params.area)
    sql = singleOrArray(sql, params.area, 'a.id', 'area');

  if (params.energy)
    sql = singleOrArray(sql, params.energy, 'et.id', 'energy');

  // use ed since it is in all the queries
  if (params.date)
    sql = checkDate(sql, params.date, 'ed.dateTime', 'date');

  if (params.groupby)
    sql = sql.GROUPBY(params.groupby);

  // hard code order
  sql = sql.ORDERBY('ed.dateTime DESC');

  if (params.limit)
    sql = sql.LIMIT(params.limit);

  return sql.toString();
}

// check the date param
function checkDate(sql, param, column, index, andOr) {
  // test invalid
  invalid = false;
  // check andOr
  if ( ! andOr) andOr = 'AND';

  dates = param.split(',');
  // check if we should look for a single date and create a range
  if ((dates.length == 1) && ( ! /\d{2}:\d{2}:\d{2}/.test(dates[0]))) {
    // hours and minutes are missing
    date = dates[0];
    dates[0] = date + ' 00:00:00';
    dates[1] = date + ' 23:59:59';
  }

  // verify dates
  _.each(dates, function(date){
    if ( ! /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(date))
      invalid = true;
  });
  // break if dates are invalid
  if (invalid) return false;

  // check if dates are a rang
  param = (dates.length == 1) ? "'" + dates[0] + "'" : bits._('BETWEEN "' + dates[0] + '" AND "' + dates[1] + '"');

  return where(sql, column, param, andOr);
}

// check if it's a csv
function singleOrArray(sql, param, column, index, andOr) {
  // check andOr
  if ( ! andOr) andOr = 'AND';
  // check if param equals 'all' then fill in value
  if (param == 'all') param = allTypes[index];

  // if it is an array then make an IN
  if (param.indexOf(',') !== -1) {
    // remove empty items
    param = _.compact(param.split(',')).join(',');
    param =  IN(param);
  }

  return where(sql, column, param, andOr);
}

// add where or and to statement
function where(sql, column, param, andOr) {
  // check if are looking for a single value or a sqlbits prepared piece
  if ( ! _.isObject(param)) column += '=';

  // check for where
  if (sql.toString().indexOf(' WHERE') === -1)
    sql = sql.WHERE(column, param);
  else
    sql = sql[andOr](column, param);

  return sql;
}

// parse results for sphaghetti mix data
function mixData(results) {
  date = false;
  collect = [];
  row = {};
  // iterate results
  _.each(results, function(result, index){
    // check if dateTime has changed
    if (date !== md5(result.dateTime)) {
      // check if we have something to push
      if ( ! _.isEmpty(row)) {
        collect.push(row);
        row = {};
      }
      date = md5(result.dateTime);
    }

    // check for dateTime
    if ( ! row.dateTime) row.dateTime = result.dateTime;

    row[result.type] = result.total_usage;
  });

  if (collect[0] && collect[0].hasOwnProperty('dateTime')) {
    // The resulting date object is in UTC because the database has no timezone information
    // Explicitly convert from YYYY-MM-DD hh:mm:ss format to Pacific/Honolulu
    collect[0].dateTime = moment(collect[0].dateTime, 'YYYY-MM-DD hh:mm:ss').utcOffset('-10:00', true);
  }

  return collect;
}

// parse results for sphaghetti mix data
function highLowData(results) {
  date = undefined;
  collect = [];
  row = [];
  // iterate results
  _.each(results, function(result, index){
    // check if dateTime has changed
    if (date !== getDate(result.dateTime)) {
      if (row.length > 0) {
        collect.push(highLowRow(row, date));
        row = [];
      }

      date = getDate(result.dateTime);
    }

    // check for dateTime
    if (result.total_usage)
      row.push(parseFloat(result.total_usage));
  });
  // collect last row
  collect.push(highLowRow(row, date));

  return collect;
}

function highLowRow(row, dateTime) {
  // sort numerically
  row = _.sortBy(row, function(num){
    return num;
  });

  return {
    date: date,
    Low: row[0],
    High: row[row.length-1],
    dayOfWeek: moment(dateTime).format('ddd')
  };
}

// parse and return date
function getDate(dateTime) {
  return moment(dateTime).format('YYYY-MM-DD');
}

