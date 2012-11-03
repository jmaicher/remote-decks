(function(exports, server) {

  if(server) {
    var _ = require('underscore'),
        Backbone = require('backbone');
  }

  exports.Session = Backbone.Model.extend({
  
    initialize: function() {
      if(server) {
        // create a unique id for the session
        var id = _.uniqueId('session-');
        this.id = id;
        this.set({id: id});
      }
    }

  });

}(typeof exports === 'undefined' ? this['Session'] = {} : exports, typeof exports !== 'undefined'));
