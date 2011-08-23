#!/usr/bin/env node

var auton = require('../lib/auton'),
    Compiler = auton.Compiler,
    plugins  = auton.plugins,
    rules    = plugins.rules,
    putil    = plugins.util,
    
    path     = require('path'),
    
    // use the standard filesave function maker, these use : file.{EXT}, file.min.{EXT}, file.min.js.{EXT}, with age-checking on file.{EXT}
    saveJs   = putil.makeSaveFunction('.js'),
    saveCss  = putil.makeSaveFunction('.css');


var compiler = new Compiler('files/build', 'files/htdocs', true);

compiler.copy( /\/vendor\// ); // anything in a subdir matching /vendor/ just gets copied manually.

compiler.addRule( /\.js$/,     saveJs,  rules.js     ); // standard javascript    ruleset: (read, jshint, uglify-js, gzip)
compiler.addRule( /\.coffee$/, saveJs,  rules.coffee ); // standard coffee-script ruleset: (read, coffee-script, uglify-js, gzip)
compiler.addRule( /\.css$/,    saveCss, rules.css    ); // standard css           ruleset: (read, cssmin, gzip)
compiler.addRule( /\.styl$/,   saveCss, rules.stylus ); // standard stylus        ruleset: (read, stylus, cssmin, gzip)

compiler.start();

