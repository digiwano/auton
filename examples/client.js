
var Auton = require('../lib/auton').Auton;
var mw    = Auton.Middleware;

var robot = new Auton( {
  root   : __dirname ,
  server : { path: 'server.js' }
} );

robot.watch('src/js', 'src/css', 'src/templates');

robot.use( /\.(js(on)?|styl|less|css)$/, mw.read() ); // puts file contents into data
robot.use( '*.js', mw.jshint() );

robot.match('src/js/**/*.js',    mw.destination(['src/js',  'public/_/js' ]), mw.checkAge(), mw.commonJsToAmd(), mw.uglifyjs(), mw.save(), robot.server.middleware() );
robot.match('src/css/**/*.styl', mw.destination(function(input) { return input.replace(/\.styl$/,'.css').replace('src/css','public/_/css'); }), mw.checkAge(), mw.stylus(), mw.cssmin(), mw.save() );
robot.match('src/vendor/**/*',   mw.copy({ destination: ['src/vendor','public/_/vendor']}) );



// robot.match('src/js/**/*.js', function(file, next) {
//
//   console.log('src/js/**/*.js mw1:', file.path);
//   next();
//
// });
//
// robot.match('src/js/**/*.js', someMw, function(file, next) {
//
//   console.log('src/js/**/*.js mw2:', file.path);
//
// });
// robot.match('src/css/**/*.styl', function(file, next) {
//
//   console.log('src/css/**/*.styl mw:', file.path);
//
// });
//
// robot.match('src/templates/**/*.tpl', someMw, function(file, next) {
//
//   console.log('src/templates/**/*.tpl mw:', file.path);
//
// });
//
// robot.trigger('src/js/main.js', console.log.bind(console, '----> main.js') );
// robot.trigger('src/css/main.styl', console.log.bind(console, '----> main.styl'));
// robot.trigger('src/templates/main.tpl', console.log.bind(console, '----> main.tpl'));

robot.server.start();
robot.watcher.start();
robot.scanAll();
