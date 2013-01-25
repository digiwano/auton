var ansi   = require('ansi');
var cursor = ansi(process.stdout);
var moment = require('moment');
var S      = require('string');
var EE2    = require('eventemitter2').EventEmitter2;
var util   = require('util');
var _      = require('underscore');
var tty    = require('tty');

var colors = {
  success   : [  64, 255,  45 ],
  info      : [   0, 255, 255 ],
  warn      : [ 255, 244,  82 ],
  error     : [ 255,  49,  54 ],
  debug     : [  35, 222, 255 ],
  'debug-2' : [ 107, 159, 255 ]
};

var levels = {
  quiet    : { error:true },
  success  : { error:true, success:true },
  basic    : { error:true, success:true, info:true },
  warnings : { error:true, success:true, info:true, warn:true },
  debug    : { error:true, success:true, info:true, warn:true, debug:true },
  verbose  : { error:true, success:true, info:true, warn:true, debug:true, 'debug-2':true }
};

function UI(opts) {
  var o = this.options = _.extend( { verbosity: 'basic', colors: colors }, opts );
  this.verbosity = (typeof o.verbosity === 'string' ? levels[o.verbosity] : o.verbosity) || levels.basic;
  this.colors = o.colors;
}

util.inherits( UI, EE2 );

UI.prototype.output = function( src, msgtype, msg ) {
  if (! this.verbosity[msgtype] ) {
    return this;
  }

  cursor
    .reset()
    .rgb.apply( cursor, this.colors[msgtype] || colors.info )
    .bold()
    .write( moment().format('ddd hh:mm:ss a |') )
    .write( S(msgtype).padLeft(8).s + (src === 'core' ? '' : ' | ' + src) + ' | ' )
    .reset()
    .write( msg.toString() )
    .write( '\n' )
    .reset()
  ;
  return this;
};

UI.prototype.startup = function( version, env ) {
  if (this.options.nobanner || !tty.isatty(process.stdout)) {
    return this.output( 'core', 'success', 'Auton v'+version+' starting in '+env+' mode!' );
  }
  var verString = S("v"+version).pad(13).s;
  var envString = S("env: "+env+" ").padLeft(49).s;

  var bottomLine = S("--x-------------x--------------------------------------------------x").padRight(process.stdout.columns, '-').s;

  cursor // big thanks to rocket robot for posing for the logo!
    // ").bg.grey.write("
    // ").bg.reset().write("
    .reset().bold()
    .yellow().write("  x-------------x").cyan( ).write("--------------------------------------------------x\n")
    .yellow().write("  |    ").white().write("______").yellow().write("   |").green().write(                                       envString+" ").cyan().write("|\n")
    .yellow().write("  |   ").bg.grey().white().write("[  @ @ ]").bg.reset().yellow().write("  |").white().write("                       _|                         ").cyan().write("|\n")
    .yellow().write("  |  ").white().write("_").bg.grey().white().write("[___=__]").bg.reset().yellow().write("  |").white().write("   _|_|_|  _|    _|  _|_|_|_|    _|_|    _|_|_|   ").cyan().write("|\n")
    .yellow().write("  | ").bg.grey().white().write("[         ]").bg.reset().yellow().write(" |").white().write(" _|    _|  _|    _|    _|      _|    _|  _|    _| ").cyan().write("|\n")
    .yellow().write("  | ").bg.grey().white().write("[ O=====C ]").bg.reset().yellow().write(" |").white().write(" _|    _|  _|    _|    _|      _|    _|  _|    _| ").cyan().write("|\n")
    .yellow().write("  | ").bg.grey().white().write("[_,-,_,-,_]").bg.reset().yellow().write(" |").white().write("   _|_|_|    _|_|_|      _|_|    _|_|    _|    _| ").cyan().write("|\n")
    .yellow().write("  |    ").bg.grey().white().write("O").bg.reset().write("   ").bg.grey().write("O").bg.reset().yellow().write("    |").white().write("                                                  ").cyan().write("|\n")
    .yellow().write("  x-------------x").cyan( ).write("--------------------------------------------------x\n")
    .cyan().write("  |").white().write(verString).cyan().write("|          Your plastic pal who's fun to code with |\n")
    .cyan().write(bottomLine + "\n")
    .reset()
  ;
}

module.exports = UI;

var ui = new UI;
