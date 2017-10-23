const gulp = require("gulp");
const ts = require("gulp-typescript");
const merge = require('merge2');
const tsProject = ts.createProject("tsconfig.json");

gulp.task("dts", function() {
    gulp.src('src/**/*.d.ts').pipe(gulp.dest('dist'));

});

gulp.task("default", ["dts"], function () {
    const tsResult = tsProject.src()
                              .pipe(tsProject());

    return merge([
        tsResult.dts.pipe(gulp.dest('dist')),
        tsResult.js.pipe(gulp.dest('dist'))
    ]);
});