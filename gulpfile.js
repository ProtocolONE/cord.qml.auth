var gulp = require('gulp'),
    concat = require('gulp-concat'),
    replace = require('gulp-replace'),
    minimist = require('minimist'),
    del = require('del');

var src = [
            "lib/*.js",
            "src/request.js",
            "src/Authorization.js",
        ],
releaseHeader = ["src/pragma", "src/qml.specific.js"],
releaseFooter = [],
testHeader = ["src/testHeader", "src/nodejs.specific.js"],
testFooter = ["src/testFooter"],
qmlSrc = ["src/Timer.qml", "src/WebSocket.qml"];

var options = minimist(process.argv.slice(2), {
    string: ['ver']
});

gulp.task('clean', function(cb) {
    del.sync(['build']);
    cb();
});

gulp.task('buildRelease', function(cb) {
    const releaseSrc = [...releaseHeader, ...src, ...releaseFooter];
    gulp.src(qmlSrc).pipe(gulp.dest('build'));

    return gulp.src(releaseSrc)
        .pipe(concat('Authorization.js'))
        .pipe(replace(/@VERSION/g, options.ver))
        .pipe(gulp.dest('build'));
});

gulp.task('buildTest', function(cb) {
    const releaseSrc = [...testHeader, ...src, ...testFooter];

    return gulp.src(releaseSrc)
        .pipe(concat('Authorization.Test.js'))
        .pipe(replace(/@VERSION/g, options.ver))
        .pipe(gulp.dest('build'));
});


gulp.task('build', ['clean', 'buildRelease', 'buildTest']);

gulp.task('default', ['build']);
