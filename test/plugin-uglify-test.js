var plugins  = require('../lib/plugins'),
    vows   = require('vows'),
    assert = require('assert'),
    suite  = vows.describe('Uglify Plugin');

// i guess vows won't let
suite.addBatch({

  '.uglify exists': function () {
    assert.isFunction( plugins.uglify );
  },
  
  '.uglify is .minifyJs': function() {
    assert.equal( plugins.minifyJs, plugins.uglify );
  },
  
  'uglify plugin': {
    topic: function() {
      var that = this, 

      context = {
        data: "(function(window) { console.dir(window); })(window);",
        path: 'not-a-file.js',
        save: {},
      };
      plugins.uglify.call(context, function(err){ that.callback(err, err ? null : context) } );
    },
  
    // in order for vows to think we need an error, we need a second arg, even though no auton plugins take a second arg to their callback
    'no error': function(err, context) {
      assert.isNull(err);
    },
    'contains minified version of javascript source in .data': function(err, context) {
      var orig =  "(function(window) { console.dir(window); })(window);";
      assert.isTrue( context.data.length < orig.length ); 
    },
    'contains an \'minified\' save point equal to current data': function(err, context) {
      assert.include(context.save, "minified");
      assert.equal( context.data, context.save.minified );
    }
  }

}).export(module);