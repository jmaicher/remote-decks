(function(exports, server) {

  if(server) {
    var _ = require('underscore'),
        Backbone = require('backbone');
  }

  exports.hello_world = function() {
    if(server == true) {
      return 'Hello server';
    } else {
      return 'Hello client';
    }
  };

}(typeof exports === 'undefined' ? this['test'] = {} : exports, typeof exports !== 'undefined'));
