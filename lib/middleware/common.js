
module.exports.noModuleFound = function( pluginName, requiredModule ) {
  if (! requiredModule) { requiredModule = pluginName; }

  var msg = "Auton.middleware." + pluginName + "() requires the npm package '"+requiredModule+"'. use `npm install "+requiredModule+"` to give Auton support for this middleware.";
  return function(file, next) {
    var err = new Error( msg );
    next( err );
  };
};
