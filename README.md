# Auton - automated resource compiler

(for a quick start, see example/example.js. The code below is a simple example of how to define your own rules / chains)

this is very rudimentary and i'd like a more complicated example in here.

```javascript
var auton    = require('./lib/auton'),
    Compiler = auton.Compiler,
    plugins  = auton.plugins,
    path     = require('path');

var compiler = new Compiler('build', 'htdocs', true); // true is whether or not watch mode is on

compiler.addRule(
  /.js$/,
  javascriptSave,
  [plugins.read, plugins.jshint, plugins.uglify, plugins.gzip, plugins.save]
);

compiler.start();


// decide what the filename of saved files should be
function javascriptSave(type, filePath) {
  var filename = path.basename(filePath, '.js'),
      dirname  = path.dirname(filePath),
      output   = dirname + "/" + filename;

  if (type === 'minified') {
    return output + ".min.js";
  }
  else if (type === 'compressed') {
    return output + ".min.js.gz";
  }
  else if (type === 'plain' || type === '__age_check__') {
    return output + ".js";
  }
  else {
    return null;
  }
}
```

this example will find all files ending with .js within the folder 'build', run them through jshint, uglify-js, and gzip, and save a non-minified, a minified, and a minified+gzipped version.
