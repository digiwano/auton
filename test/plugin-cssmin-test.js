
var plugins  = require('../lib/plugins'),
    vows   = require('vows'),
    assert = require('assert'),
    suite  = vows.describe('CSSMin Plugin');

// i guess vows won't let
suite.addBatch({

  '.cssmin exists': function () {
    assert.isFunction( plugins.minifyCss );
  },
  
  '.cssmin is .minifyCss': function() {
    assert.equal( plugins.cssmin, plugins.minifyCss );
  },
  
  'plugin called with parseable input': {
    topic: function() {
      var that = this, 
      
      context = {
        data: "a    { \n    color: red; \n}\n /* comment */",
        path: 'not-a-file.css',
        save: {},
      };
      plugins.minifyCss.call(context, function(err){ that.callback(err, err ? null : context) } );
    },
  
    // in order for vows to think we need an error, we need a second arg, even though no auton plugins take a second arg to their callback
    'no error': function(err, context) {
      assert.isNull(err);
    },
    'contains minified version of css in .data': function(err, context) {
      assert.equal( context.data, "a{color:red}" ); // any self-respecting css minifier should minify the above to this.
    },
    'contains an \'minified\' save point equal to current data': function(err, context) {
      assert.include(context.save, "minified");
      assert.equal( context.data, context.save.minified );
    }
  }

}).export(module);