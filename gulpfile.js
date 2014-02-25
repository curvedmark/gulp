'use strict';

var gulp = require('./');
var log = require('gulp-util').log;

var jshint = require('gulp-jshint');
var codeFiles = ['**/*.js', '!node_modules/**'];

task('lint', function(){
  log('Linting Files');
  return src(codeFiles)
    .jshint('.jshintrc')
    .pipe(jshint.reporter());
});

task('watch', function(){
  log('Watching Files');
  gulp.watch(codeFiles, ['lint']);
});

task('default', ['lint', 'watch']);
