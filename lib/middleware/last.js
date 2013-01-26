module.exports = function lastPlugin( opts ) {
  return function(file, next) {
    file.debug("[middleware: last]");
    file._lastRule = true;
    next();
  };
};
