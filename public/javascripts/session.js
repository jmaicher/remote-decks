$(function() {
  
  var DM = window.DeckManager,
      EM = window.EventManager,
      session = window.session,
      $actionButton = $('.action-bar > a.btn'),
      actionButtonStates = ['pending', 'connected', 'disconnected'];
      actionButtonStyles = ['btn-warning', 'btn-success', 'btn-danger']
   
  EM.on('connection.pending', function() {
    $actionButton.removeClass(actionButtonStates.join(' '));
    $actionButton.removeClass(actionButtonStyles.join(' '));
    $actionButton.addClass(actionButtonStates[0]);
    $actionButton.addClass(actionButtonStyles[0]);
  });

  EM.on('connection.success', function() {
    $actionButton.removeClass(actionButtonStates.join(' '));
    $actionButton.removeClass(actionButtonStyles.join(' '));
    $actionButton.addClass(actionButtonStates[1]);
    $actionButton.addClass(actionButtonStyles[1]);
  });

  EM.on('connection.failure', function() {
    $actionButton.removeClass(actionButtonStates.join(' '));
    $actionButton.removeClass(actionButtonStyles.join(' '));
    $actionButton.addClass(actionButtonStates[2]);
    $actionButton.addClass(actionButtonStyles[2]);
  });


  // HACKETY-HACK!!!
  // vertical center deck container
  $(document).on('deck.init', function() {
    $('.deck-container').flexVerticalCenter();
  });

  // initialize slides
  DM.init();
  // go to first slide
  DM.goto(session.get('slide'));
});

window.EventManager = _.clone(Backbone.Events)

window.SocketManager = function(socket) {
  var EM = window.EventManager;

  // forward events to local event bus
  _.each(['slide.change', 'speaker.connected',
      'speaker.disconnected', 'spectator.connected',
      'spectator.disconnected'
    ], function(ev) {

    socket.on(ev, function(data) {
      EM.trigger(ev, data);        
    });

  });
  
};


window.DeckManager = (function($, $d, className) {

  return _.extend({ 
 
    // initialize deck.js with slides container
    init: function() {
      var self = this;

      $d('.slide');

      $(document).on('deck.change', function(event, from, to) {
        self.trigger('deck.change', { from: from, to: to });
      });
    },

    goto: function(slide) {
      $d('go', slide);
    },

    disableControls: function() {
      var $doc = $(document);
      $doc.unbind('keydown.deck');
      $doc.unbind('touchstart.deck');
      $doc.unbind('touchmove.deck');
      $doc.unbind('touchend.deck');
    }

  }, Backbone.Events);

})(jQuery, jQuery.deck, '.slide');
