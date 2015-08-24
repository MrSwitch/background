var gulp = require('gulp');
var browserify = require('browserify');
var babelify= require('babelify');
var util = require('gulp-util');
var buffer = require('vinyl-buffer');
var source = require('vinyl-source-stream');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');


gulp.task('build', function() {
  gulp.src('./src/*.js', function(err,files){
    files.forEach(function(item){
      var name = item.match(/([^\/]+\.js)$/)[0];
      browserify('./src/'+name, { debug: true })
      .transform(babelify)
      .bundle()
      .on('error', util.log.bind(util, 'Browserify Error'))
      .pipe(source('./dist/'+name))
      .pipe(buffer())
      .pipe(sourcemaps.init({loadMaps: true}))
      .pipe(uglify({ mangle: false }))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./'))
      .on('end', function() {
          console.log(name);
      });
    });
  });
});

gulp.task('watch', function () {
   gulp.watch('src/**/*.js', ['build']);
});

gulp.task('default', ['build']);