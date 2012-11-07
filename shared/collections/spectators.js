(function(global, exports, server) {
  var _ = global._,
      Backbone = global.Backbone,
      Spectator = global.RemoteDecks.Spectator;

  exports.Spectators = Backbone.Collection.extend({

    model: Spectator,

    getConnected: function() {
      return this.filter(function(spectator) {
        return spectator.get('connected') === true;
      });
    }

  });

}(
  typeof exports === 'undefined' ? window : global,
  typeof exports === 'undefined' ? namespace('RemoteDecks') : exports,
  typeof exports !== 'undefined'));
