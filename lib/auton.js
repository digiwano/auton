(function(){

  var 
      watch   = require( 'watch-tree' ),
      async   = require( 'asyncjs' ),
      fs      = require( 'fs' ),
      util    = require( 'util' ),
      path    = require( 'path' ),
      inspect = util.inspect,
      plugins = require('./plugins');

  module.exports.plugins  = plugins;
  module.exports.Compiler = Compiler;

  function Compiler( rootDir, outputDir, watchMode ) {
    this.rootDir   = rootDir;
    this.outputDir = outputDir;
    this.watchMode = !!watchMode;
    this.rules     = [];
    this.ignores   = [];
    this.waitTime  = 100; // time to wait for write after noticing a change
    return this;
  }

  Compiler.prototype.start = function() {
    var that      = this,
        watchMode = that.watchMode,
        rootDir   = that.rootDir,
        outputDir = that.outputDir;

    var watcher = watch.watchTree(rootDir, {
      'sample-rate' : 5,
      'ignore'      : new RegExp('/[._]')
    });
    
    var _compile = function(path){ return that._compile(path); };
    var _delete  = function(path){ return that._delete(path);  };

    watcher.on( 'filePreexisted', _compile );
    watcher.on( 'fileCreated',    _compile );
    watcher.on( 'fileModified',   _compile );
    watcher.on( 'fileDeleted',    _delete  );
    watcher.on( 'allPreexistingFilesReported', function(){
      if (watchMode) {
        console.log("-----> Entering watch mode!");
      } else {
        console.log("-----> Done!");
        watcher.end();
      }
    });
  }

  Compiler.prototype.addRule = function( test, outputFilenameFunction, ruleList ) {
    this.rules.push({
      test: test,
      outputFilenameFunction: outputFilenameFunction,
      ruleList: ruleList
    });
  }

  Compiler.prototype.copy = function( test ) {
    this.rules.push({
      test: test,
      outputFilenameFunction: function(type, filePath){ return type === 'original' ? filePath : null; },
      ruleList: [plugins.read, plugins.save]
    });
  }

  Compiler.prototype.ignore = function( test ) {
    this.ignores.push( test );
  }

  function checkTest( test, target ) {
    if (test instanceof RegExp && test.test(target) ) {
      return true;
    }
    else if (typeof test === 'function' && test(target) === true) {
      return true;
    }
    else if (typeof test === 'string' && test === target) {
      return true;
    }
  }
  
  

  Compiler.prototype._compile = function(path) {
    path = path.replace(this.rootDir + "/", "");
    
    for (var i = 0, len = this.ignores.length; i < len; i++) {
      if (checkTest( this.ignores[i], path )) {
        return;
      }
    }
    
    for (var i = 0, len = this.rules.length; i < len; i++) {
      var rule = this.rules[i];
      if (checkTest( rule.test, path )) {
        this._runChain( path, rule, rule.ruleList );
        return;
      }
    }
    
    // should probably bark that no rule covered this?
  }

  Compiler.prototype._delete = function(path) {
  }

  Compiler.prototype._runChain = function(file, rule, functions) {
    var args = {
      compiler: this,
      rule:     rule,
      path:     file,
      save:     {   }
    };
    var go = function() {
      async.list(functions).call(args).end(function(e){
        if (e) {
          console.log("---\n---\n---\n\nERROR IN FILE: "+file+"\n\nError: "+e+"\n\n---\n---\n---\n");
        } else {
  //        console.log(" COMPILED: " + file);
        }
      });
    }
    setTimeout( go, this.waitTime );
  }


})();