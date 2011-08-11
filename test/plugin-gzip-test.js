var plugins  = require('../lib/plugins'),
    vows   = require('vows'),
    assert = require('assert'),
    suite  = vows.describe('Gzip Plugin');

// i guess vows won't let
suite.addBatch({

  '.gzip exists': function () {
    assert.isFunction( plugins.gzip );
  },
    
  'gzip plugin': {
    topic: function() {
      var that = this, 

      context = {
        data: "aaaaaaaaaaaaaaaaaaaa-bbbbbbbbbbbbbbbbb-ccccccccccccccccccc-ddddddddddddddddddddd",
        path: 'not-a-file.txt',
        save: {},
      };
      plugins.gzip.call(context, function(err){ that.callback(err, err ? null : context) } );
    },
  
    // in order for vows to think we need an error, we need a second arg, even though no auton plugins take a second arg to their callback
    'no error': function(err, context) {
      assert.isNull(err);
    },
    'contains data that starts with a gzip header: 0x1F8B08': function(err, context) {
      assert.equal( context.data[0], 0x1F );
      assert.equal( context.data[1], 0x8B );
      assert.equal( context.data[2], 0x08 );
    },
    'contains a \'gzip\' save point equal to current data': function(err, context) {
      assert.include(context.save, "compressed");
      assert.equal( context.data, context.save.compressed );
    }
  }

}).export(module);