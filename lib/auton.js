(function(){

  var stylus  = require( 'stylus' ),
      nib     = require( 'nib'    ),
      cssmin  = require( 'cssmin' ),
      gzip    = require( 'gzip'   ),
      watch   = require( 'watch-tree' ),
      uglify  = require( 'uglify-js'  ),
      coffee  = require( 'coffee-script' ),
      async   = require( 'asyncjs' ),
      fs      = require( 'fs' ),
      util    = require( 'util' ),
      path    = require( 'path' ),
      inspect = util.inspect,
      jshint  = require( 'jshint' ).JSHINT;
      steps   = {};

  module.exports.steps    = steps;
  module.exports.Compiler = Compiler;

  function Compiler( rootDir, outputDir, watchMode ) {
    this.rootDir   = rootDir;
    this.outputDir = outputDir;
    this.watchMode = !!watchMode;
    this.rules     = [];
    this.ignores   = [];
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
      test:test,
      outputFilenameFunction:outputFilenameFunction,
      ruleList:ruleList
    });
  }

  Compiler.prototype.copy = function( test ) {
    this.rules.push({
      test: test,
      outputFilenameFunction: function(type, filePath){ return type === 'original' ? filePath : null; },
      ruleList: [steps.read, steps.save]
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
    async.list(functions).call({compiler:this,rule:rule,path:file,save:{}}).end(function(e){
      if (e) {
        console.log("---\n---\n---\n\nERROR IN FILE: "+file+"\n\nError: "+e+"\n\n---\n---\n---\n");
      } else {
//        console.log(" COMPILED: " + file);
      }
    });
  }

  steps.minifyJs = function(next) {
    var ast, code;
    try {
      ast = uglify.parser.parse(this.data);
      ast = uglify.uglify.ast_mangle(ast);
      ast = uglify.uglify.ast_squeeze(ast);
      code = uglify.uglify.gen_code(ast);
      this.save.minified = code;
      this.data = code;
      return next();
    } catch (e) {
      return next(e);
    }
  }

  steps.jshint = function(next) {
    var result = jshint(this.data);
    if (result) {
      next();
    } else {
      next( require('sys').inspect(jshint.errors) );
    }
  }

  steps.gzip = function(next) {
    var that = this;
    return gzip(this.data, 9, function(err, cmp) {
      if (err) {
        next(err);
      } else {
        that.data = cmp;
        that.save.compressed = cmp;
        next();
      }
    });
  }

  steps.read = function(next) {
    var that = this;
    return fs.readFile(this.compiler.rootDir + "/" + this.path, function(err, data) {
      if (err) {
        return next(err);
      }
      var d = data.toString();
      that.save.original = d;
      that.data = d;
      next();
    });
  }

  steps.minifyCss = function(next) {
    try {
      var d = cssmin(this.data);
      this.data = d;
      this.save.minified = d;
      next();
    } catch (e) {
      next(e);
    }
  }

  steps.parseStylus = function(next) {
    var that = this;
    stylus.render(this.data, {
      filename: this.path
    },
    function(err, css) {
      if (err) {
        next(err);
      } else {
        that.data = css;
        next();
      }
    });
  }
  
  steps.save = function(next) {
    var savedFiles = [],
        that = this;
    for (var i in this.save) {
      savedFiles.push([ i, this.save[i] ]);
    }

    var doSave = function(i){
      if (i < savedFiles.length) {
        var entry = savedFiles[i],
            filename = that.rule.outputFilenameFunction( entry[0], that.path ),
            data     = entry[1],
            fullPath = path.join( that.compiler.outputDir, filename ),
            dirname  = path.dirname( fullPath );
        
        if (filename) {
          console.log("" + (new Date()) + "> Saving: " + fullPath);
          mkdir_p( dirname, function(e){
            if (e) { return next(e); }
    
            fs.writeFile( fullPath, data, function(err) {
              if (err) { return next(err);     }
              else     { return doSave(i + 1); }
            });
          });
        } else {
          doSave(i + 1);
        }
      }
    }
    doSave(0);
  }

  steps.debug = function(next) {
    console.log("DEBUG :---------------------------------------------");
    console.log("file  : ", this.path )
    console.log("data  : ", inspect(this.data) );
    for (var i in this.save) {
      console.log("      :---------------------------------------------");
      console.log("save  : " + i);
      console.log("data  : ", inspect(this.save[i]));
    }
    console.log("------:---------------------------------------------");

    next();
  }

function mkdir_p( dir, cb, mode ) {
  mode = mode || 0755;
  path.exists(dir, function(exists){
    if (exists) {
      cb();
    } else {
      var dirs = dir.split("/");
      if ( dir.indexOf('/') === 0) {
        dirs[0] = '/';
      }
      var seed = dirs.shift();
      mkdir_p$( seed, dirs );
    }
  });
  
  var mkdir_p$ = function( str, segments ) {
    var str = path.join(str, segments[0]);
    segments = segments.slice(1);
    var ret = function(){
      if (segments.length) {
        mkdir_p$( str, segments );
      } else {
        cb();
      }
    }
    
    path.exists( str, function(exists){
      if (exists) {
        ret();
      } else {

        fs.mkdir( str, mode, function(err) {
          if (err) { return cb(err); }
          ret();
        });
      }
    });
    
  }
}

})();