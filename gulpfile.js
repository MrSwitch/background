/*eslint no-console: 0*/
var gulp = require('gulp');
var browserify = require('browserify');
var babelify = require('babelify');
var util = require('gulp-util');
var buffer = require('vinyl-buffer');
var source = require('vinyl-source-stream');
var sourcemaps = require('gulp-sourcemaps');

function build(item) {
	var name = item.match(/([^\/]+\.js)$/)[0];
	browserify('./src/' + name, {debug: true})
	.transform(babelify)
	.bundle()
	.on('error', util.log.bind(util, 'Browserify Error'))
	.pipe(source('./dist/' + name))
	.pipe(buffer())
	.pipe(sourcemaps.init({loadMaps: true}))
	.pipe(sourcemaps.write('./'))
	.pipe(gulp.dest('./'))
	.on('end', () => {
		console.log(name);
	});
}

gulp.task('build', () => {
	gulp.src('./src/*.js', (err, files) => {
		files.forEach(build);
	});
});

gulp.task('watch', () => {

	gulp.src('./src/*.js', (err, files) => {
		files.forEach((item) => {
			var name = item.match(/([^\/]+\.js)$/)[0];
			gulp.watch('src/' + name, build.bind(null, item));
		});
	});

	gulp.watch('src/*/**.js', {interval: 500}, ['build']);
});

gulp.task('default', ['build']);
