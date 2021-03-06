(function(global, exports, server) {
  var _ = global._,
      Backbone = global.Backbone,
      Speaker = global.RemoteDecks.Speaker;

  exports.Speakers = Backbone.Collection.extend({

    model: Speaker,

    getConnected: function() {
      return this.filter(function(speaker) {
        return speaker.get('connected') === true;
      });
    }

  });

}(
  typeof exports === 'undefined' ? window : global,
  typeof exports === 'undefined' ? namespace('RemoteDecks') : exports,
  typeof exports !== 'undefined'));
