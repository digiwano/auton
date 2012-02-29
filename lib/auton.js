(function(){

  var 
      watch    = require( 'watch-tree-maintained' ),
      async    = require( 'asyncjs' ),
      fs       = require( 'fs' ),
      colorize = require( 'colorize' ),
      console  = colorize.console,
      util     = require( 'util' ),
      path     = require( 'path' ),
      inspect  = util.inspect,
      plugins  = require('./plugins'),
      VERSION  = '0.1.8';

  module.exports.plugins  = plugins;
  module.exports.Compiler = Compiler;
  module.exports.VERSION  = VERSION;

  function Compiler( rootDir, outputDir, watchMode ) {
    this.rootDir   = rootDir;
    this.outputDir = outputDir;
    this.watchMode = !!watchMode;
    this.rules     = [];
    this.ignores   = [];
    this.waitTime  = 100; // time to wait for write after noticing a change
    return this;
  }
  
  var levelColorMap = {
    'error'   : 'red',
    'success' : 'green',
    'msg'     : 'plain',
    'info'    : 'cyan',
    'warn'    : 'yellow'
  };
  
  Compiler.prototype.log   = function( level, coloredPart, plainPart ) {
    var color = levelColorMap[level],
        outputString = colorize.ansify("#" + color + "[" + coloredPart + "]") + (plainPart ? ": " + plainPart : "");
    util.log( outputString );
  };

  Compiler.prototype.start = function() {
    var that      = this,
        watchMode = that.watchMode,
        rootDir   = that.rootDir,
        outputDir = that.outputDir;
    this.log('success', 'Auton v' + VERSION + ' starting...');
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
        that.log('info', "Entering watch mode");
      } else {
        that.log('info', "All files scanned");
        watcher.end();
      }
    });
  };

  Compiler.prototype.addRule = function( test, outputFilenameFunction, ruleList ) {
    this.rules.push({
      test: test,
      outputFilenameFunction: outputFilenameFunction,
      ruleList: ruleList
    });
  };

  Compiler.prototype.copy = function( test ) {
    this.rules.push({
      test: test,
      outputFilenameFunction: function(type, filePath){ return (type === 'original' || type === '__age_check__') ? filePath : null; },
      ruleList: [plugins.read, plugins.save]
    });
  };

  Compiler.prototype.ignore = function( test ) {
    this.ignores.push( test );
  };

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
    
    for (i = 0, len = this.rules.length; i < len; i++) {
      var rule = this.rules[i];
      if (checkTest( rule.test, path )) {
        this._runChain( path, rule, rule.ruleList );
        return;
      }
    }
    
    this.log( 'warn', "Skipped", path );
  };

  Compiler.prototype._delete = function(path) {
    
  };

  Compiler.prototype._runChain = function(file, rule, functions) {
    var args = {
      compiler: this,
      rule:     rule,
      path:     file,
      save:     {   },
      savedFilenames: [ ]
    },
    makeCyan = function(x){ return colorize.ansify("#cyan[" + x + "]"); },
    go = function() {
      async.list(functions).call(args).end(function(e){
        if (e) {
          args.compiler.log( 'error', "Error in "+file, "\n" + e.toString() + "\n" );
        } else {
          args.compiler.log( 'success', file, "Saved " + args.savedFilenames.map(makeCyan).join(', ') );
  //        console.log(" COMPILED: " + file);
        }
      });
    };
    
    var ageCheckFilename = rule.outputFilenameFunction( '__age_check__', file );
    if (ageCheckFilename) {
      var infile  = path.join( this.rootDir,  file ),
          outfile = path.join( this.outputDir, ageCheckFilename );
      fs.stat( infile, function(err, infileStats){
        if (err) {
          args.compiler.log( 'error', 'couldnt stat '+infile, err);
          return;
        }
        path.exists( outfile, function(exists){
          if (exists) {
            fs.stat( outfile, function(err, outfileStats){
              if (err) {
                args.compiler.log( 'error', 'couldnt stat '+outfile, err);
                return;
              }
              
              if (Date.parse(infileStats.mtime) > Date.parse(outfileStats.mtime)) {
                setTimeout( go, args.compiler.waitTime );
              }
            });
          } else {
            setTimeout( go, args.compiler.waitTime );
          }
          
        });
      });
    } else {
      setTimeout( go, args.compiler.waitTime );
    }
  };


})();
