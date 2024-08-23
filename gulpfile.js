/* DT207G - Backend-baserad webbutveckling
 * Moment 3
 * Linn Eriksson, VT24
 */

//Variables to include in NPM-packages
const {src, dest, watch, series, parallel} = require("gulp");
const browserSync = require('browser-sync').create();
const htmlminify = require('gulp-html-minifier-terser');
const sourcemaps = require('gulp-sourcemaps');
const sass = require('gulp-sass')(require('sass'));

//Paths
const files = {
    htmlPath: "src/**/*.html",
    sassPath: "src/css/**/*.scss",
    jsPath: "src/js/**/*.js",
    imagePath: "src/images/*"
}

//HTML-task
function htmlTask() {
    return src(files.htmlPath)
    .pipe(htmlminify({collapseWhitespace:true, removeComments:true, removeEmptyElements:false})) // maxLineLength:120 used during testing.
    .pipe(dest('pub'))
}

//SASS-task
function sassTask() {
    return src(files.sassPath)
    .pipe(sourcemaps.init())
    .pipe(sass({outputStyle: 'compressed'}).on("error", sass.logError))// {outputStyle: 'compressed'} ska läggas till i sass() när testning är klar
    .pipe(sourcemaps.write('./maps'))
    .pipe(dest("pub/css"))
    .pipe(browserSync.stream());
}

//Image-task
function imageTask() {
    return src(files.imagePath)
    .pipe(dest('pub/images'));
}

//Watcher
function watchTask() {

    browserSync.init({
        server: "./pub"
    });

    watch([files.htmlPath, files.sassPath, files.imagePath], parallel(htmlTask, sassTask, imageTask)).on('change', browserSync.reload);
}

//Run all tasks above
exports.default = series(
    parallel(htmlTask, sassTask, imageTask),
    watchTask
);