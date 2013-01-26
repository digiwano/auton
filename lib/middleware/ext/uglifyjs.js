var _        = require( 'underscore' );
var common   = require( '../common' );
var UglifyJS;
try { UglifyJS = require( 'uglify-js' ); } catch(e){};

if (UglifyJS) {

  module.exports = function( opts ) {
    return function( file, next ) {
      var wf = UglifyJS.AST_Node.warn_function;
      UglifyJS.AST_Node.warn_function = function(info) {
        file.warn(info);
      };
      var toplevelAst = UglifyJS.parse( file.data, {});
      toplevelAst.figure_out_scope();

      var compressor    = UglifyJS.Compressor();
      var compressedAst = toplevelAst.transform(compressor);

      compressedAst.figure_out_scope();
      compressedAst.compute_char_frequency();
      compressedAst.mangle_names();

      var code = compressedAst.print_to_string();
      UglifyJS.AST_Node.warn_function = wf;
      file.data = code + "\n";
      next();
    }
  };

} else {

  module.exports = noModuleFound( 'uglifyjs', 'uglify-js' );

}