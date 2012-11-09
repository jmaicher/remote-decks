(function(global, exports, server) {
var _ = global._,
    Backbone = global.Backbone,
    Speakers = global.RemoteDecks.Speakers,
    Spectators = global.RemoteDecks.Spectators;

exports.Session = Backbone.Model.extend({

  defaults: {
    slide: 0,
    slide_count: 5
  },  

  initialize: function() {
    if(server) {
      // create a unique id for the session
      var id = global.helper.uniqueId('session'),
          // namespaces id starts at 0, I want 1
          name = 'Session ' + id,
          now = new Date();

      this.id = id;
      this.set({id: id});
      this.set({name: name});
      this.set({created_at: now});

      this.speakers = new Speakers();
      this.spectators = new Spectators();
    }
  },

});

}(typeof exports === 'undefined' ? window : global,
typeof exports === 'undefined' ? namespace('RemoteDecks') : exports,
typeof exports !== 'undefined'));
