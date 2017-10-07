var gulp = require('gulp'),
	babel = require('babel-core'),
	react = require('gulp-react');

gulp.task("default", function() {
	gulp.src("./demo/js/*.js")
		.pipe(react())
		.pipe(gulp.dest('./demo/js/min/'))
})

gulp.watch("./demo/js/*.js", ['default'])