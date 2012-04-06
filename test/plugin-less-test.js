
var plugins  = require('../lib/plugins'),
    vows   = require('vows'),
    assert = require('assert'),
    suite  = vows.describe('Less Plugin');

// i guess vows won't let
suite.addBatch({

    '.less object and and ._less() function': function () {
      assert.isFunction( plugins._less );
      assert.isFunction( plugins.less  );
    },
    
    'less plugin': {
      topic: plugins,
      'with default options': {
        '& errors in file': {
          topic: function(plugins) {
            var context = {
              data: "body{\n  color: red\n#@$#!%#$",
              path: 'not-a-file.less',
              save: {}
            };
            plugins.less.call(context, this.callback );
          },
    
          // in order for vows to think we need an error, we need a second arg, even though no auton plugins take a second arg to their callback
          'error callback called for error covered by standard options': function(err, nothing) {
            assert.isNotNull(err);
            assert.include(err, 'missing closing');
          }
        },
        '& error-free file': {
          topic: function(plugins) {
            var context = {
              data: "body{\n  color: red}\n",
              path: 'not-a-file.less',
              save: {}
            };
            plugins.less.call(context, this.callback );
          },
    
          // in order for vows to think we need an error, we need a second arg, even though no auton plugins take a second arg to their callback
          'no error': function(err, nothing) {
            assert.isNull(err);
          }
        }
      }
    }

}).export(module);