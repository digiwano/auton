var ansi   = require('ansi');
var cursor = ansi(process.stdout);
var moment = require('moment');
var S      = require('string');
var EE2    = require('eventemitter2').EventEmitter2;
var util   = require('util');
var _      = require('underscore');

var colors = {
  success   : [  64, 255,  45 ],
  info      : [ 255, 255, 255 ],
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
  var o = _.extend( { verbosity: 'basic', colors: colors }, opts );
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
    .write( moment().format('ddd h:mm:ss a |') )
    .write( S(msgtype).padLeft(8).s + (src === 'core' ? '' : ' | ' + src) + ' | ' )
    .reset()
    .write( msg )
    .write( '\n' )
    .reset()
  ;
  return this;
};

module.exports = UI;

var ui = new UI;
