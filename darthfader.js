/*
 * DarthFader
 * Author: Forepoint
 * Version: 1.0
 */
$.fn.DarthFader = function( opts ) {

  var settings = $.extend( {
    
    'auto' : true,
    'pause' : false,
    'pagination' : true,
    'pagination_selector' : ".fader-pagination",
    'nav' : false,
    'navigation_btns' : '.fader-arrows',
    'panels_selector' : '.panel',
    'timeout' : 13000,
    before: function() {},
    after: function() {}

  }, opts );

  var consts = {
      
      PANEL_ACTIVE_CLASS : 'is-active'

  };

  var methods = {

    init : function( fader ) {

      // start position
      fader.current_index = 0;

      //setup some things like the panels
      fader.panels = fader.find( settings.panels_selector );
      fader.pagination_btns = fader.find( settings.pagination_selector ).find( 'a' );
      fader.navigation_btns = $( settings.navigation_btns );

      // number of panels
      fader.panels.count = fader.panels.size();

      // set default animating to false
      fader.animating = false;

      //method calls.
      methods.setup_panels( fader );
      methods.setup_pagination( fader );
      methods.setup_navigation( fader );
      methods.auto_cycle( fader );
      methods.on_hover( fader );

    },
    // Wrap the panels, set some styles on the wrap and activate the first panel
    setup_panels : function( fader ) {

      // Wrap up the panels into a container
      fader.panels.wrapAll( '<div class="fader-container" />' );

      // Store the panels container
      fader.panels_container = fader.find( '.fader-container' );

      // wrapper styles
      fader.panels_container.css( { 'position': 'relative','top': 0,'left': 0 } );

      // set first as active
      fader.panels.eq( 0 ).addClass( consts.PANEL_ACTIVE_CLASS );

    },
    setup_navigation : function( fader ) {

      fader.navigation_btns.click( function(){

        var current_tab = $( this );

        methods.restart_cycle( fader );

        var active_panel = fader.find( '.' + consts.PANEL_ACTIVE_CLASS ),
            dir = current_tab.data( 'dir' );

        // we stop back our shit up if we're already animating - world might end
        if ( active_panel.queue( 'fx' ).length ) {
            return;
        }

        // Should we move the fader, or should we reset it.

        if ( dir == 'prev' ) {

            index = ( fader.current_index == 0 ) ? fader.panels.count - 1 : fader.current_index - 1;

        } else {

            index = ( fader.current_index == ( fader.panels.count - 1 ) ) ? 0 : fader.current_index + 1;

        }

        methods.fade_it( fader, index );

        if ( settings.pagination ) {

            methods.update_tabs( fader, index );

        }

        return false;

      });

    },
    auto_cycle : function( fader ) {

      if( settings.auto ) {

          fader.cycle = setInterval( function() {

            // clear any queued events
            fader.panels.finish();

            var index = ( ( fader.current_index + 1 ) < fader.panels.count ) ? fader.current_index + 1 : 0;

            if ( settings.pagination ) {
              methods.update_tabs( fader, index );
            }

            methods.fade_it( fader, index );

          }, settings.timeout );

      }

    },
    restart_cycle : function( fader ) {

        if ( settings.auto ) {

          clearInterval( fader.cycle );
          methods.auto_cycle( fader );

        }

    },
    on_hover : function( fader ) {

      fader.on( {
                
          mouseenter: function() {
              
              clearInterval( fader.cycle );

          },
          mouseleave: function() {
              
              methods.restart_cycle( fader );

          }

      } );

    },
    setup_pagination : function( fader ) {

      if ( settings.pagination ) {

        fader.pagination_btns.eq( 0 ).addClass( consts.PANEL_ACTIVE_CLASS );

        fader.pagination_btns.click( function(){

          var current_tab = $( this );

          methods.restart_cycle( fader );

          if ( current_tab.index() === fader.current_index ) {
              return;
          }

          methods.update_tabs( fader, current_tab.index() );
          methods.fade_it( fader, current_tab.index() );

          return false;

        });

      }

    },
    update_tabs : function( fader, index ) {

      fader.pagination_btns.removeClass( consts.PANEL_ACTIVE_CLASS ).eq( index ).addClass( consts.PANEL_ACTIVE_CLASS );

    },
    fade_it : function( fader, index ) {

      fader.current_index = index;

      var current_panel = fader.panels.eq( index );
      current_panel.addClass( consts.PANEL_ACTIVE_CLASS ).siblings().removeClass( consts.PANEL_ACTIVE_CLASS );

    },
    //checks to see if we support css transitions.
    supports_transitions : function() {

      if( 'Modernizr' in window ) {

          return Modernizr.csstransitions;

      }

      var b = document.body || document.documentElement;
      var s = b.style;
      var p = 'transition';

      if (typeof s[p] == 'string') {
          return true;
      }

      // Tests for vendor specific prop
      v = ['Moz', 'Webkit', 'Khtml', 'O', 'ms'], p = p.charAt(0).toUpperCase() + p.substr(1);

      for (var i = 0; i < v.length; i++) {

          if (typeof s[v[i] + p] == 'string') {
              return true;
          }

      }

      return false;

    }

  };

  return $(this).each( function() {

      methods.init( $(this) );

  });

};