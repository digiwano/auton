# Auton - automated resource compiler

documentation coming later. meanwhile, here's an example:

```javascript
var auton = require('./lib/auton'),
    Compiler = auton.Compiler,
    steps    = auton.steps,
    path     = require('path');

var compiler = new Compiler('build', 'htdocs', true); // true is whether or not watch mode is on

compiler.addRule(
  /.js$/,
  javascriptSave,
  [steps.read, steps.jshint, steps.minifyJs, steps.gzip, steps.save]
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
  else if (type === 'original') {
    return output + ".js";
  }
  else {
    return null;
  }
}
```

this example will find all files ending with .js within the folder 'build', run them through jshint, uglify-js, and gzip, and save a non-minified, a minified, and a minified+gzipped version.