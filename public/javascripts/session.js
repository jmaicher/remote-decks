$(function() {
  
  var DM = window.DeckManager,
      EM = window.EventManager,
      session = window.session,
      $speakerCount = $('#speaker-count'),
      $spectatorCount = $('#spectator-count'),
      $actionButton = $('.action-bar > a.btn'),
      actionButtonStates = ['pending', 'connected', 'disconnected'],
      actionButtonStyles = ['btn-warning', 'btn-success', 'btn-danger'];

  // fix bootstrap dropdown for touch events
  // see: https://github.com/twitter/bootstrap/issues/2975#issuecomment-6659992
  $('body').on('touchstart.dropdown', '.dropdown-menu', function (e) { e.stopPropagation(); });

  // set speaker/spectator count
  var updateSpeakerCount = function() {
    $speakerCount.html(session.speakers.length);
  };
  updateSpeakerCount();

  var updateSpectatorCount = function() {
    $spectatorCount.html(session.spectators.length);
  }; 
  updateSpectatorCount();
  
  session.speakers.on('add remove', updateSpeakerCount);
  session.spectators.on('add remove', updateSpectatorCount);

  // handle [spectator|speaker].[connected|disconnected]
  EM.on('speaker.connected', function(speaker) {
    session.speakers.add(speaker); 
    // show notification
    $('.bottom-right').notify({
      message: { text: 'New speaker connected' }
    }).show();
  });

  EM.on('speaker.disconnected', function(speaker) {
    session.speakers.remove(speaker);
  });

  EM.on('spectator.connected', function(spectator) {
    session.spectators.add(spectator);
  });

  EM.on('spectator.disconnected', function(spectator) {
    session.spectators.add(spectator);
  });


  // action bar stuff
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
    $actionButton.attr('data-toggle', 'dropdown');
  });

  EM.on('connection.failure disconnect', function() {
    $actionButton.removeClass(actionButtonStates.join(' '));
    $actionButton.removeClass(actionButtonStyles.join(' '));
    $actionButton.addClass(actionButtonStates[2]);
    $actionButton.addClass(actionButtonStyles[2]);
    $actionButton.attr('data-toggle', '');
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
