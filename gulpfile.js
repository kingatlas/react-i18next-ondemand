const gulp = require("gulp");
const ts = require("gulp-typescript");
const tslint = require("gulp-tslint");
const merge = require('merge2');
const tsProject = ts.createProject("tsconfig.json");

gulp.task("tslint", function() {
    gulp.src('src/**/*.ts')
        .pipe(tslint({
            formatter: "verbose"
        }))
        .pipe(tslint.report());
});

gulp.task("dts", function() {
    gulp.src('src/**/*.d.ts').pipe(gulp.dest('dist'));

});

gulp.task("default", ["tslint", "dts"], function () {
    const tsResult = tsProject.src()
                              .pipe(tsProject());

    return merge([
        tsResult.dts.pipe(gulp.dest('dist')),
        tsResult.js.pipe(gulp.dest('dist'))
    ]);
});