(function(global, exports, server) {
  var _ = global._,
      Backbone = global.Backbone,
      Session = global.RemoteDecks.Session;

  exports.Sessions = Backbone.Collection.extend({

    model: Session,

  });

}(
  typeof exports === 'undefined' ? window : global,
  typeof exports === 'undefined' ? namespace('RemoteDecks') : exports,
  typeof exports !== 'undefined'));
