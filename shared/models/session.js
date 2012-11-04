(function(global, exports, server) {
  var _ = global._,
      Backbone = global.Backbone;

  exports.Session = Backbone.Model.extend({
  
    defaults: {
      slide: 0,
      slide_count: 2
    },  

    initialize: function() {
      if(server) {
        // create a unique id for the session
        var id = _.uniqueId('session-'),
            // namespaces id starts at 0, I want 1
            rawId = parseInt(id.substring(id.indexOf('-') + 1)) + 1,
            name = 'Session ' + rawId,
            now = new Date();

        this.id = rawId;
        this.set({id: rawId});
        this.set({name: name});
        this.set({created_at: now});
      }
    },

  });

}(typeof exports === 'undefined' ? window : global,
  typeof exports === 'undefined' ? namespace('RemoteDecks') : exports,
  typeof exports !== 'undefined'));
