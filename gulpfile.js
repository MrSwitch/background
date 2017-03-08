/*eslint no-console: 0*/
const gulp = require('gulp');
const browserify = require('browserify');
const babelify = require('babelify');
const util = require('gulp-util');
const buffer = require('vinyl-buffer');
const source = require('vinyl-source-stream');
const sourcemaps = require('gulp-sourcemaps');

function build(item) {
	const name = item.match(/([^\/]+\.js)$/)[0];
	browserify(`./src/${ name}`, {debug: true})
	.transform(babelify, {
		presets: ['es2015']
	})
	.bundle()
	.on('error', util.log.bind(util, 'Browserify Error'))
	.pipe(source(`./dist/${ name}`))
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
		files.forEach(item => {
			const name = item.match(/([^\/]+\.js)$/)[0];
			gulp.watch(`src/${ name}`, build.bind(null, item));
		});
	});

	gulp.watch('src/*/**.js', {interval: 500}, ['build']);
});

gulp.task('default', ['build']);
