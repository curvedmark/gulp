'use strict';

var findup = require('findup-sync');
var changed = require('gulp-changed');

module.exports = function (options) {
  var gulp = options.gulp;
  var chain = gulp.src.apply(gulp, options.args);
  var pipe = chain.pipe;
  var streams = [];
  var dest;

  var packagePath = findup('package.json', {cwd: options.configBase});
  var plugins = [];
  if (packagePath) {
    var json = require(packagePath);
    ['dependencies', 'devDependencies', 'peerDependencies'].forEach(function (key) {
      var names = Object.keys(json[key] || {});
      names = names.filter(function (name) {
        return /^gulp-/.test(name) && name !== 'gulp-util' && name !== 'gulp-changed';
      });
      plugins = plugins.concat(names);
    });
  }

  plugins.forEach(function (plugin) {
    var name = plugin.replace(/^gulp-/, '').replace(/-(\w)/g, function(m, p1) {
      return p1.toUpperCase();
    });

    chain[name] = function () {
      plugin = gulp.module.require(plugin);
      streams.push(plugin.apply(null, arguments));
      return chain;
    };
  });

  chain.dest = function (d) {
    streams.push(gulp.dest.apply(gulp, arguments));
    dest = d;
    return chain;
  };

  chain.pipe = function (stream) {
    streams.push(stream);
    return chain;
  };

  process.nextTick(function () {
    chain.pipe = pipe;

    if (dest) {
      chain = chain.pipe(changed(dest));
    }

    streams.forEach(function (stream) {
      chain = chain.pipe(stream);
    });
  });

  return chain;
};