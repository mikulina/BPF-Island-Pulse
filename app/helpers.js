// load eyes, helper for more intuitive debugging
var eyes = require('eyes').inspector({ maxLength: -1 });
var _  = require('lodash');
var __sliceInspect = [].slice;
global.d = function() {
  var data;
  data = 1 <= arguments.length ? __sliceInspect.call(arguments, 0) : [];
  _.each(data, function(v) {
    eyes(v);
  });
};


// remove object falsey values
global.compactObject = function(o) {
    _.each(o, function(v, k) {
      if (!v)
        return delete o[k];
    });

    return o;
  };