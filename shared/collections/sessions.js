(function(exports, server) {

  if(server) {
    var _ = require('underscore'),
        Backbone = require('backbone'),
        Session = require(__dirname + '/../models/session').Session;
  }

  exports.Sessions = Backbone.Collection.extend({
    model: Session 
  });

}(typeof exports === 'undefined' ? this['Sessions'] = {} : exports, typeof exports !== 'undefined'));
