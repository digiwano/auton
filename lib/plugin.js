var plugins = module.exports = {};

plugins.log     = function( lvl, msg ) { return this.ui.output( this.uiSource || 'core', lvl, msg ); };
plugins.info    = function(      msg ) { return this.log('info',    msg); };
plugins.error   = function(      msg ) { return this.log('error',   msg); };
plugins.debug   = function(      msg ) { return this.log('debug',   msg); };
plugins.debug2  = function(      msg ) { return this.log('debug-2', msg); };
plugins.warn    = function(      msg ) { return this.log('warn',    msg); };
plugins.success = function(      msg ) { return this.log('success', msg); };
