(function(global, exports, server) {
var _ = global._,
    Backbone = global.Backbone,
    Speakers = global.RemoteDecks.Spectator;

exports.Spectator = Backbone.Model.extend({

  defaults: {
    connected: false
  },  

  initialize: function() {
    if(server) {
      // create a unique id for the session
      var id = global.helper.uniqueId('spectator'),
          // namespaces id starts at 0, I want 1
          name = 'Spectator ' + id,
          now = new Date();

      this.id = id;
      this.set({id: id});
      this.set({name: name});
      this.set({created_at: now});
    }
  },

});

}(typeof exports === 'undefined' ? window : global,
typeof exports === 'undefined' ? namespace('RemoteDecks') : exports,
typeof exports !== 'undefined'));
