var watchr = require('watchr');
var util   = require('util');
var EE2    = require('eventemitter2').EventEmitter2;
var path   = require('path');
var _      = require('underscore');
var _plugin = require('./plugin');

module.exports = Watcher;

function Watcher( opts ) {
  var config    = _.extend( {}, opts );
  this.paths    = [];
  this.config   = config || {};
  this.ui       = config.ui;
  this.uiSource = "watcher";
  this.root     = config.root;
}
util.inherits( Watcher, EE2 );
_.extend( Watcher.prototype, _plugin );

Watcher.prototype.add = function(dir) {
  this.debug2('added log dir: '+ dir);
  this.paths.push( dir );
};

Watcher.prototype.start = function(callback) {
  this.info("watching: " + this.paths.join(", ") );
  callback = callback || function(){};
  var self = this;
  var _defaultConfig = {
    paths: this.paths,
    listeners: { // forward everything on to our eventemitter for now
      log      : function(level, info) {
        self.log( level === 'debug' ? 'debug-2' : level, info );
      },
      error    : this.emit.bind( this, 'error' ),
      change   : _change.bind( this )
    },
    next: function(err, watchers) {
      if (err) { this.emit('error', err); return callback(err); }
      self.watchers = watchers;
      self.log('debug', 'watching ' + self.watchers.length + ' files/dirs');
    }
  };
  var cfg = _.extend( {}, _defaultConfig, this.config )
  watchr.watch( cfg );
};

function _change( changeType, filepath, curStat, prevStat ) {
  this.emit( (changeType === 'delete' ? 'delete' : 'trigger'), filepath );
};

