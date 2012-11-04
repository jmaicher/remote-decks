(function(global, exports, server) {
  var _ = global._,
      Backbone = global.Backbone;

  exports.Session = Backbone.Model.extend({
  
    defaults: {
      slide: 0
    },  

    initialize: function() {
      if(server) {
        // create a unique id for the session
        var id = _.uniqueId('session-');
        this.id = id;
        this.set({id: id});
      }
    }

  });

}(typeof exports === 'undefined' ? window : global,
  typeof exports === 'undefined' ? namespace('RemoteDecks') : exports,
  typeof exports !== 'undefined'));
