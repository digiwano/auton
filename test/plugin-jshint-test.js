
var plugins  = require('../lib/plugins'),
  vows   = require('vows'),
  assert = require('assert'),
  suite  = vows.describe('JShint Plugin');

// i guess vows won't let
suite.addBatch({

  '> jshint and _jshint()': function () {
    assert.isFunction( plugins._jshint );
    assert.isFunction( plugins.jshint  );
  },
  
  '> jshint plugin': {
    topic: plugins,
    '> default options': {
      '> errors': {
        topic: function(plugins) {
          var context = {
            data: "if (true) console.log('true is true')",
            path: 'not-a-file.js'
          };
          plugins.jshint.call(context, this.callback );
        },
  
        // in order for vows to think we need an error, we need a second arg, even though no auton plugins take a second arg to their callback
        '> error callback called for error covered by standard options': function(err, nothing) {
          assert.isNotNull(err);
          assert.include(err, 'Missing semicolon');
        }
      },
      '> success': {
        topic: function(plugins) {
          var context = {
            data: "if (true) console.log('true is true');",
            path: 'not-a-file.js'
          };
          plugins.jshint.call(context, this.callback );
        },
  
        // in order for vows to think we need an error, we need a second arg, even though no auton plugins take a second arg to their callback
        '> no error': function(err, nothing) {
          assert.isNull(err);
        }
      }
    },

    '> custom options': {
      '> errors': {
        topic: function(plugins) {
          var context = {
            data: "if (true) console.log('true is true');",
            path: 'not-a-file.js'
          };
          plugins._jshint({curly:true}).call(context, this.callback );
        },
  
        // in order for vows to think we need an error, we need a second arg, even though no auton plugins take a second arg to their callback
        '> error callback called for error covered by a custom option': function(err, nothing) {
          assert.isNotNull(err);
          assert.include(err, 'Expected \'{\'');
        }
      },
      '> success': {
        topic: function(plugins) {
          var context = {
            data: "if (true) { console.log('true is true'); }",
            path: 'not-a-file.js'
          };
          plugins._jshint({curly:true}).call(context, this.callback );
        },
  
        // in order for vows to think we need an error, we need a second arg, even though no auton plugins take a second arg to their callback
        '> no error': function(err, nothing) {
          assert.isNull(err);
        }
      }
    },
  }

}).export(module);