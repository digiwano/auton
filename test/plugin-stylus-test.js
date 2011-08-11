
var plugins  = require('../lib/plugins'),
    vows   = require('vows'),
    assert = require('assert'),
    suite  = vows.describe('Stylus Plugin');

// i guess vows won't let
suite.addBatch({

    '.stylus object and and ._stylus() function': function () {
      assert.isFunction( plugins._stylus );
      assert.isFunction( plugins.stylus  );
    },
    
    'stylus plugin': {
      topic: plugins,
      'with default options': {
        '& errors in file': {
          topic: function(plugins) {
            var context = {
              data: "body\n  color: red\n#@$#!%#$",
              path: 'not-a-file.styl',
              save: {}
            };
            plugins.stylus.call(context, this.callback );
          },
    
          // in order for vows to think we need an error, we need a second arg, even though no auton plugins take a second arg to their callback
          'error callback called for error covered by standard options': function(err, nothing) {
            assert.isNotNull(err);
            assert.include(err, 'expected "indent"');
          }
        },
        '& error-free file': {
          topic: function(plugins) {
            var context = {
              data: "body\n  color: red\n",
              path: 'not-a-file.styl',
              save: {}
            };
            plugins.stylus.call(context, this.callback );
          },
    
          // in order for vows to think we need an error, we need a second arg, even though no auton plugins take a second arg to their callback
          'no error': function(err, nothing) {
            assert.isNull(err);
          }
        }
      },

      'with nib': {
        topic: function(plugins) {
          var that    = this,
              context = {
            data: "@import \"nib\"\n\nbody\n  color: linear-gradient(top, #000, #fff)\n",
            path: 'not-a-file.styl',
            save: {}
          };
          plugins.stylus.call(context, function(err){ that.callback(err, err ? null : context) });
        },
  
        // in order for vows to think we need an error, we need a second arg, even though no auton plugins take a second arg to their callback
        'no error': function(err, context) {
          assert.isNull(err);
          assert.isNotNull( context );
        },
        
        'contains nib plugin output': function(err, context) {
          assert.include( context.data, "-webkit" );
        },
        
        'contains an \'original\' save point': function(err, context) {
          assert.include( context.save, "original" );
          assert.equal( context.data, context.save.original );
        }
      }
    }

}).export(module);